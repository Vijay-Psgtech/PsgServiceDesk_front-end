"use client";
import React, { useEffect, useState, useMemo, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import TicketColumn from "../components/TicketColumn";
import TaskChart from "../components/TaskChart";
import { CanvasRevealEffect } from "../components/ui/canvas-reveal-effect";
import { useNavigate } from "react-router-dom";
import { apiGet, getUserFromStorage, logout } from "../lib/auth";
import {
  Ticket,
  BarChart3,
  CheckCircle,
  Clock,
  ArrowUp,
  ArrowDown,
  RefreshCw,
} from "lucide-react";

/** -------------------------------
 * Animated Counter Hook
 * ------------------------------ */
function useCountTo(target, duration = 700) {
  const [current, setCurrent] = useState(0);
  const rafRef = useRef(null);
  const fromRef = useRef(0);

  useEffect(() => {
    cancelAnimationFrame(rafRef.current);

    const startValue = fromRef.current;
    if (typeof target !== "number") return;

    const start = performance.now();
    const delta = target - startValue;

    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) * (1 - t); // easeOutQuad
      const val = startValue + delta * eased;
      setCurrent(Math.round(val * 10) / 10);
      if (t < 1) rafRef.current = requestAnimationFrame(step);
      else fromRef.current = target;
    };

    rafRef.current = requestAnimationFrame(step);

    return () => cancelAnimationFrame(rafRef.current);
  }, [duration, target]);

  return current;
}

/** -------------------------------
 * MAIN ADMIN DASHBOARD
 * ------------------------------ */
export default function Dashboard() {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [departmentsList, setDepartmentsList] = useState([
    "All",
    "IT",
    "Admin",
    "HR",
    "Finance",
    "Support",
  ]);

  const [department, setDepartment] = useState(
    typeof window !== "undefined"
      ? localStorage.getItem("selectedDepartment") || "All"
      : "All"
  );

  const [hovered, setHovered] = useState(false);
  const [modalTicket, setModalTicket] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(false);
  const [error, setError] = useState(null);

  // stats range
  const [range, setRange] = useState("today");

  const [adminStats, setAdminStats] = useState({
    tickets: { total: 0, open: 0, inProgress: 0, resolved: 0 },
    averageTime: 0,
  });

  const [previousStats, setPreviousStats] = useState(null);

  /** Persist department filter */
  useEffect(() => {
    localStorage.setItem("selectedDepartment", department);
  }, [department]);

  /** Guard – admin only */
  useEffect(() => {
    const user = getUserFromStorage();
    if (!user || user.role !== "admin") {
      navigate("/", { replace: true });
    }
  }, [navigate]);



  
  /** ------- Animated counters -------- */
  const animatedTotal = useCountTo(adminStats.tickets.total);
  const animatedOpen = useCountTo(adminStats.tickets.open);
  const animatedInProgress = useCountTo(adminStats.tickets.inProgress);
  const animatedResolved = useCountTo(adminStats.tickets.resolved);
  const animatedAvg = useCountTo(adminStats.averageTime);

  /** Percent Change Helper (ONLY ONE VERSION – FIXED) */
  const pctChange = (current, previous) => {
    if (previous === 0 || previous === null || previous === undefined) return null;
    return ((current - previous) / Math.abs(previous)) * 100;
  };

  /** -------- Fetch Stats -------- */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchStats = useCallback(async (r) => {
    setLoadingStats(true);
    try {
      const q = r ? `?range=${encodeURIComponent(r)}` : "";
      const res = await apiGet(`/api/admin/dashboard-stats${q}`);

      setPreviousStats(adminStats);   

      setAdminStats({
        tickets: {
          total: res.tickets?.total ?? res.totalTickets ?? 0,
          open: res.tickets?.open ?? res.openTickets ?? 0,
          inProgress: res.tickets?.inProgress ?? res.inProgressTickets ?? 0,
          resolved: res.tickets?.resolved ?? res.resolvedTickets ?? 0,
        },
        averageTime:
          res.averageTime ?? res.avgResolutionTime ?? 0,
      });
    } catch (err) {
      const msg = err?.message || String(err);
      if (msg.includes("401")) {
        logout();
        navigate("/login");
        return;
      }
      setError(msg);
    } finally {
      setLoadingStats(false);
    }
  });

  /** -------- Load all dashboard data -------- */
  useEffect(() => {
    let mounted = true;

    const loadAll = async () => {
      setLoading(true);
      setError(null);

      try {
        await fetchStats(range) ;

        // users
        const users = await apiGet("/api/users");
        if (!mounted) return;

        setTeamMembers(
          users.map((u) => ({
            id: u.userId || u._id || u.id,
            name: u.name,
            leaveDates: u.leaveDates || [],
          }))
        );

        // departments
        try {
          const deps = await apiGet("/api/departments");
          if (Array.isArray(deps) && mounted) {
            setDepartmentsList(["All", ...deps]);
          }
        } catch (e) {}

        // tickets
        const depQuery =
          department !== "All"
            ? `?department=${encodeURIComponent(department)}`
            : "";

        const serverTickets = await apiGet(`/api/tickets${depQuery}`);
        if (!mounted) return;

        const mapped = (serverTickets || []).map((t) => ({
          id: t._id || t.id,
          department: t.department,
          service: t.service || t.title,
          category: t.category,
          priority: t.priority,
          assignedTo: t.assignedTo || "Unassigned",
          assignedId: t.assignedId || null,
          status: t.status,
          createdOn: t.createdOn,
          completedOn: t.completedOn,
          estimatedTime: Number(t.estimatedTime) || 0,
          completedTime: Number(t.completedTime) || 0,
        }));

        setTickets(mapped);
      } catch (err) {
        const msg = err?.message || String(err);
        if (msg.includes("401")) {
          logout();
          navigate("/login");
          return;
        }
        setError(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadAll();
    return () => (mounted = false);
  }, [department, fetchStats, navigate, range]);

  /** Re-fetch stats when range changes */
  useEffect(() => {
    fetchStats(range);
  }, [range]);

  /** -------- Auto Reassign if assignee on leave -------- */
  useEffect(() => {
    if (!teamMembers.length || !tickets.length) return;

    const findBestAssignee = (date, allTickets) => {
      const activeMembers = teamMembers.filter(
        (m) => !m.leaveDates.includes(date)
      );
      if (!activeMembers.length) return teamMembers[0];

      const count = {};
      activeMembers.forEach((m) => {
        count[m.id] = allTickets.filter((t) => t.assignedId === m.id).length;
      });

      const bestId = Object.entries(count).reduce(
        (a, b) => (a[1] <= b[1] ? a : b)
      )[0];

      return activeMembers.find((m) => m.id === bestId) || activeMembers[0];
    };

    setTickets((prev) =>
      prev.map((t) => {
        const date = t.createdOn?.split("T")[0];
        const member = teamMembers.find((m) => m.id === t.assignedId);

        if (member?.leaveDates.includes(date)) {
          const best = findBestAssignee(date, prev);
          return {
            ...t,
            assignedId: best.id,
            assignedTo: `${best.id} - ${best.name}`,
          };
        }
        return t;
      })
    );
  }, [teamMembers, tickets.length]);

  /** -------- Filter tickets -------- */
  const filteredTickets = tickets.filter((t) =>
    department === "All"
      ? true
      : t.department?.toLowerCase() === department.toLowerCase()
  );

  const columnData = useMemo(
    () => ({
      open: filteredTickets.filter((t) =>
        ["Pending", "Open"].includes(t.status)
      ),
      inProgress: filteredTickets.filter((t) =>
        ["In Progress", "Ongoing"].includes(t.status)
      ),
      resolved: filteredTickets.filter((t) =>
        ["Resolved", "Closed", "Done"].includes(t.status)
      ),
    }),
    [filteredTickets]
  );

  const workingUsers = columnData.inProgress.map((t) => t.assignedTo);

  const chartData = [
    { name: "Open", value: columnData.open.length },
    { name: "In Progress", value: columnData.inProgress.length },
    { name: "Resolved", value: columnData.resolved.length },
  ];

  /** Trend calculation */
  const trend = {
    total: pctChange(
      adminStats.tickets.total,
      previousStats?.tickets.total
    ),
    open: pctChange(
      adminStats.tickets.open,
      previousStats?.tickets.open
    ),
    inProgress: pctChange(
      adminStats.tickets.inProgress,
      previousStats?.tickets.inProgress
    ),
    avg: pctChange(
      adminStats.averageTime,
      previousStats?.averageTime
    ),
  };

  /** ----------- FORMATTERS ----------- */
  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleString("en-IN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "N/A";

  const calculateDuration = (start, end) => {
    if (!start || !end) return "N/A";
    const h = (new Date(end) - new Date(start)) / (1000 * 60 * 60);
    return `${h.toFixed(2)} hrs`;
  };

  /** ------------------------------
   * UI
   * ------------------------------ */
  return (
    <motion.div
      className="min-h-screen relative flex flex-col bg-gradient-to-br from-slate-900 via-blue-950 to-black text-gray-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Glow Background */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            className="absolute inset-0 z-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <CanvasRevealEffect
              animationSpeed={3}
              containerClassName="bg-transparent"
              colors={[
                [0, 195, 255],
                [100, 200, 255],
                [0, 255, 200],
              ]}
              opacities={[0.04, 0.08, 0.12]}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ACTIVE USERS */}
      {workingUsers.length > 0 && (
        <motion.div
          className="fixed top-24 right-10 z-20"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="bg-white/10 backdrop-blur-xl border border-cyan-400/40 rounded-3xl px-8 py-6 shadow-lg">
            <h4 className="text-sm font-semibold text-cyan-300 mb-3">
              Active Users
            </h4>
            <div className="flex flex-wrap gap-2">
              {workingUsers.map((u, i) => (
                <motion.span
                  key={i}
                  className="px-3 py-1 bg-cyan-900/30 text-cyan-200 rounded-full text-xs border border-cyan-400/40"
                  whileHover={{ scale: 1.08 }}
                >
                  {u}
                </motion.span>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* MAIN CONTENT */}
      <main
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative z-10 flex-1 px-8 md:px-14 py-12 max-w-[1600px] mx-auto w-full"
      >
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Department Dashboard
          </h2>

          <div className="flex items-center gap-3">
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="bg-slate-800/60 border border-cyan-400/40 rounded-xl text-sm px-4 py-2 text-cyan-200"
            >
              {departmentsList.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>

            {/* Range Selector */}
            <div className="flex items-center bg-black/40 border border-cyan-500/20 rounded-lg overflow-hidden">
              {["today", "week", "month"].map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`px-3 py-2 text-sm ${
                    range === r
                      ? "bg-cyan-600/20 text-cyan-100"
                      : "text-cyan-300 hover:bg-white/5"
                  }`}
                >
                  {r === "today"
                    ? "Today"
                    : r === "week"
                    ? "This Week"
                    : "This Month"}
                </button>
              ))}
              <button
                onClick={() => fetchStats(range)}
                title="Refresh stats"
                className="p-2 text-cyan-300 hover:text-white"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* --------------------------- */}
        {/*   STATS HEADER CARDS       */}
        {/* --------------------------- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* TOTAL */}
          <StatCard
            title="Total Tickets"
            value={animatedTotal}
            icon={<Ticket size={28} className="text-cyan-400" />}
            trend={trend.total}
            rangeLabel={range}
            borderColor="border-cyan-500/30"
          />

          {/* OPEN */}
          <StatCard
            title="Open"
            value={animatedOpen}
            icon={<BarChart3 size={28} className="text-yellow-300" />}
            trend={trend.open}
            textColor="text-yellow-200"
            borderColor="border-yellow-500/20"
          />

          {/* IN PROGRESS */}
          <StatCard
            title="In Progress"
            value={animatedInProgress}
            icon={<CheckCircle size={28} className="text-green-400" />}
            trend={trend.inProgress}
            textColor="text-cyan-300"
            borderColor="border-cyan-500/30"
          />

          {/* AVG TIME */}
          <StatCard
            title="Avg Resolution (hrs)"
            value={animatedAvg}
            icon={<Clock size={28} className="text-purple-400" />}
            trend={trend.avg}
            textColor="text-purple-300"
            borderColor="border-purple-500/20"
          />
        </div>

        {/* --------------------------- */}
        {/* MAIN CONTENT GRID */}
        {/* --------------------------- */}
        {loading ? (
          <div className="p-8 rounded-xl bg-slate-800/60 text-center text-cyan-200">
            Loading dashboard...
          </div>
        ) : error ? (
          <div className="p-6 rounded-xl bg-rose-900/40 text-center text-rose-200">
            Error: {String(error)}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-4 gap-10"
          >
            {/* Ticket Columns */}
            <div className="col-span-3 grid grid-cols-1 md:grid-cols-3 gap-8">
              <TicketColumn
                title="Open"
                color="border-cyan-700"
                dotColor="bg-cyan-500"
                headerColor="from-cyan-700 to-blue-900"
                tickets={columnData.open}
                onTicketClick={setModalTicket}
              />

              <TicketColumn
                title="In Progress"
                color="border-cyan-400"
                dotColor="bg-cyan-300"
                headerColor="from-cyan-600 to-blue-800"
                tickets={columnData.inProgress}
                onTicketClick={setModalTicket}
              />

              <TicketColumn
                title="Resolved"
                color="border-cyan-200"
                dotColor="bg-cyan-200"
                headerColor="from-blue-700 to-cyan-700"
                tickets={columnData.resolved}
                onTicketClick={setModalTicket}
              />
            </div>

            {/* Chart */}
            <motion.div className="col-span-1 bg-slate-900/70 backdrop-blur-2xl p-10 rounded-3xl border border-cyan-500/40 shadow-lg">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-semibold text-cyan-300">
                  Task History
                </h3>
                <span className="text-sm text-cyan-400">{department}</span>
              </div>
              <TaskChart data={chartData} />
            </motion.div>
          </motion.div>
        )}
      </main>

      {/* --------------------------- */}
      {/* TICKET MODAL */}
      {/* --------------------------- */}
      <AnimatePresence>
        {modalTicket && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalTicket(null)}
          >
            <motion.div
              className="bg-slate-900/90 border border-cyan-400/40 rounded-2xl p-8 w-96 text-cyan-100 shadow-lg"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-4 text-cyan-300">
                {modalTicket.service}
              </h2>

              <p><strong>Status:</strong> {modalTicket.status}</p>
              <p><strong>Priority:</strong> {modalTicket.priority}</p>
              <p><strong>Assigned To:</strong> {modalTicket.assignedTo}</p>
              <p><strong>Created On:</strong> {formatDate(modalTicket.createdOn)}</p>
              {modalTicket.completedOn && (
                <p><strong>Completed On:</strong> {formatDate(modalTicket.completedOn)}</p>
              )}
              <p>
                <strong>Task Duration:</strong>{" "}
                {calculateDuration(modalTicket.createdOn, modalTicket.completedOn)}
              </p>

              <button
                onClick={() => setModalTicket(null)}
                className="mt-6 bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ---------------------------
 * STAT CARD COMPONENT
 * --------------------------- */
function StatCard({
  title,
  value,
  icon,
  trend,
  textColor = "text-cyan-300",
  borderColor = "border-cyan-500/30",
}) {
  return (
    <motion.div
      initial={{ y: 8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`p-5 bg-slate-900/70 backdrop-blur-xl rounded-2xl border ${borderColor}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className={`text-sm ${textColor}`}>{title}</div>
          <div className="flex items-baseline gap-3">
            <h3 className="text-3xl font-bold">{value}</h3>

            {trend !== null && (
              <span
                className={`text-xs font-semibold ${
                  trend > 0 ? "text-green-400" : "text-rose-400"
                }`}
              >
                {trend > 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                {Math.abs(trend).toFixed(0)}%
              </span>
            )}
          </div>
        </div>
        <div className="p-2 rounded-md bg-black/30">{icon}</div>
      </div>
    </motion.div>
  );
}

