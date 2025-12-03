"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  X,
  FileUp,
  CheckCircle2,
  ClipboardList,
  MoreHorizontal,
  Download,
  Search,
  Grid,
  List,
  Sun,
  Moon,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import dayjs from "dayjs";

/* ===========================
   LocalStorage Keys & Helpers
   =========================== */
const LS_TICKETS = "ud_tickets_v3";
const LS_THEME = "ud_theme_v3";
const LS_LEAVES = "ud_leaves_v3";
const LS_ACTIVITY = "ud_activity_v3";
const LS_ONCALL = "ud_oncall_v3";
const LS_NOTIFS = "ud_notifs_v3";
const LS_VIEW = "ud_view_v3";

function safeLoad(key) {
  try {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function safeSave(key, v) {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, JSON.stringify(v));
  } catch {}
}

/* ===========================
   Block mapping (auto-assign)
   =========================== */
const DEPARTMENT_BLOCK_MAP = {
  "IT Services": "F Block",
  Facilities: "B Block",
  HR: "D Block",
  Finance: "A Block",
  Security: "C Block",
};

/* ===========================
   Colors
   =========================== */
const COLORS = {
  Open: "#6b46c1",
  "In Progress": "#f59e0b",
  Resolved: "#10b981",
  OpenBar: "#60a5fa",
  ResolvedBar: "#34d399",
};

/* ===========================
   Seed tickets (if none)
   =========================== */
function seedTickets() {
  const a = dayjs().subtract(3, "day").toISOString();
  const b = dayjs().subtract(6, "day").toISOString();
  const seed = [
    {
      id: `IT${Date.now().toString().slice(-6)}A`,
      service: "COMPUTER ISSUE",
      department: "IT Services",
      category: "Service",
      asset: "System-09",
      priority: "High",
      status: "Open",
      block: "F Block",
      createdOn: a,
      issue: "Slow boot",
    },
    {
      id: `IT${(Date.now() - 50000).toString().slice(-6)}B`,
      service: "PRINTER",
      department: "IT Services",
      category: "Service",
      asset: "Printer-12",
      priority: "Medium",
      status: "Resolved",
      block: "B Block",
      createdOn: b,
      resolvedOn: dayjs().subtract(4, "day").toISOString(),
      issue: "Paper jam",
    },
  ];
  safeSave(LS_TICKETS, seed);
  return seed;
}

/* ===========================
   Main component
   =========================== */
export default function UserDashboard() {
  // ---------- current user ----------
  const currentUser = useMemo(
    () => ({
      id: "S10453",
      userId: "S10453",
      name: "Sarath",
      institution: "ABC Institute of Technology",
      department: "IT Services",
      email: "sarath@example.com",
      mobile: "+91-98765-43210",
    }),
    []
  );

  // ---------- persisted state ----------
  const [tickets, setTickets] = useState(
    () => safeLoad(LS_TICKETS) ?? seedTickets()
  );
  const [theme, setTheme] = useState(() => safeLoad(LS_THEME) ?? "light");
  const [leaves, setLeaves] = useState(() => safeLoad(LS_LEAVES) ?? []);
  const [activityLog, setActivityLog] = useState(
    () => safeLoad(LS_ACTIVITY) ?? []
  );
  const [oncall, setOncall] = useState(() => safeLoad(LS_ONCALL) ?? []);
  const [notifs, setNotifs] = useState(() => safeLoad(LS_NOTIFS) ?? []);
  const [globalView, setGlobalView] = useState(
    () => safeLoad(LS_VIEW) ?? "dashboard"
  );

  // ---------- UI state ----------
  const [view, setView] = useState(() =>
    typeof window !== "undefined"
      ? localStorage.getItem("ud_view_pref") || "kanban"
      : "kanban"
  );
  const [createOpen, setCreateOpen] = useState(false);
  const [openMenuFor, setOpenMenuFor] = useState(null);
  const menuRef = useRef(null);
  const [detailView, setDetailView] = useState(null);
  const [searchQ, setSearchQ] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const perPage = 12;

  // block modal state
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState(null);

  // create form (note: block will be auto-assigned)
  const [form, setForm] = useState({
    category: "",
    service: "",
    department: currentUser.department,
    asset: "",
    priority: "Low",
    issue: "",
    files: [],
    closingDays: 1,
  });

  // persist on change
  useEffect(() => safeSave(LS_TICKETS, tickets), [tickets]);
  useEffect(() => safeSave(LS_THEME, theme), [theme]);
  useEffect(() => safeSave(LS_LEAVES, leaves), [leaves]);
  useEffect(() => safeSave(LS_ACTIVITY, activityLog), [activityLog]);
  useEffect(() => safeSave(LS_ONCALL, oncall), [oncall]);
  useEffect(() => safeSave(LS_NOTIFS, notifs), [notifs]);
  useEffect(() => safeSave(LS_VIEW, globalView), [globalView]);

  // apply theme class to root
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (theme === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [theme]);

  // click outside menu to close
  useEffect(() => {
    function onDoc(e) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setOpenMenuFor(null);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // small helpers & derived data
  const columns = ["Open", "In Progress", "Resolved"];
  const myTickets = useMemo(() => tickets.slice(), [tickets]);

  const kanban = useMemo(() => {
    const map = { Open: [], "In Progress": [], Resolved: [] };
    myTickets.forEach((t) => (map[t.status] ?? map.Open).push(t));
    return map;
  }, [myTickets]);

  const pieData = useMemo(
    () => columns.map((c) => ({ name: c, value: kanban[c]?.length || 0 })),
    [kanban]
  );

  const filtered = useMemo(() => {
    const q = (searchQ || "").trim().toLowerCase();
    let arr = myTickets.slice();
    if (deptFilter !== "All")
      arr = arr.filter(
        (t) =>
          (t.department || "").toLowerCase() ===
          (deptFilter || "").toLowerCase()
      );
    if (statusFilter !== "All")
      arr = arr.filter(
        (t) =>
          (t.status || "").toLowerCase() === (statusFilter || "").toLowerCase()
      );
    if (q)
      arr = arr.filter((t) =>
        [t.id, t.service, t.asset, t.issue, t.block].some((v) =>
          (v || "").toLowerCase().includes(q)
        )
      );
    arr.sort((a, b) => new Date(b.createdOn) - new Date(a.createdOn));
    return arr;
  }, [myTickets, searchQ, deptFilter, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / perPage));
  useEffect(() => {
    if (page > pageCount) setPage(1);
  }, [page, pageCount]);
  const pageItems = filtered.slice((page - 1) * perPage, page * perPage);

  const format = (d) => (d ? dayjs(d).format("DD/MM/YYYY HH:mm") : "-");
  const totalTime = (t) => {
    const start = dayjs(t.createdOn);
    const end = t.resolvedOn ? dayjs(t.resolvedOn) : dayjs();
    const diff = end.diff(start, "minute");
    return `${Math.floor(diff / 60)}h ${diff % 60}m`;
  };

  const logActivity = (message) => {
    const entry = `${dayjs().format("YYYY-MM-DD HH:mm")} — ${message}`;
    setActivityLog((p) => [entry, ...p].slice(0, 500));
  };

  // super algorithm: simple weighted score
  const computeActivityScore = () => {
    const resolved = tickets.filter((t) => t.status === "Resolved").length;
    const total = tickets.length || 1;
    const recency = Math.min(20, activityLog.length) * 2;
    const score = Math.round((resolved / total) * 80 + (recency / 20) * 20);
    return Math.max(0, Math.min(100, score));
  };

  // create ticket (auto-assign block)
  const createTicket = (payload) => {
    const dept = payload.department || currentUser.department;
    const assignedBlock = DEPARTMENT_BLOCK_MAP[dept] || "Block 1";
    const ticket = {
      id: `IT${Date.now().toString().slice(-6)}`,
      ...payload,
      block: assignedBlock,
      createdOn: new Date().toISOString(),
      status: "Open",
    };
    setTickets((p) => [ticket, ...p]);
    logActivity(
      `Created ticket ${ticket.id} (${ticket.service}) in ${ticket.block}`
    );
  };

  const resolveTicket = (id) => {
    setTickets((p) =>
      p.map((t) =>
        t.id === id
          ? { ...t, status: "Resolved", resolvedOn: new Date().toISOString() }
          : t
      )
    );
    logActivity(`Resolved ticket ${id}`);
  };

  const updateTicket = (id, patch) => {
    setTickets((p) => p.map((t) => (t.id === id ? { ...t, ...patch } : t)));
    logActivity(`Updated ticket ${id}`);
  };

  // leaves
  const addLeave = ({ from, to, reason, manager }) => {
    const fromDate = dayjs(from);
    const toDate = dayjs(to);
    if (!fromDate.isValid() || !toDate.isValid() || toDate.isBefore(fromDate)) {
      alert("Please provide a valid date range.");
      return;
    }
    const newLeave = {
      id: `L${Date.now().toString().slice(-6)}`,
      from: fromDate.toISOString(),
      to: toDate.toISOString(),
      reason: reason || "No reason",
      manager: manager || "Not provided",
      createdOn: new Date().toISOString(),
      completed: false,
    };
    setLeaves((p) => [newLeave, ...p]);
    const notif = {
      id: `N${Date.now().toString().slice(-6)}`,
      to: manager || "Manager",
      message: `${currentUser.name} (${
        currentUser.userId
      }) planned leave ${dayjs(newLeave.from).format("DD/MM")} → ${dayjs(
        newLeave.to
      ).format("DD/MM")}. Reason: ${newLeave.reason}`,
      createdOn: new Date().toISOString(),
      read: false,
    };
    setNotifs((p) => [notif, ...p]);
    logActivity(`Planned leave ${newLeave.id} — notified ${notif.to}`);
  };

  const removeLeave = (id) => {
    setLeaves((p) => p.filter((l) => l.id !== id));
    logActivity(`Removed planned leave ${id}`);
  };

  const markBackFromLeave = (id) => {
    const leave = leaves.find((l) => l.id === id);
    if (!leave) return;
    setLeaves((p) =>
      p.map((l) => (l.id === id ? { ...l, completed: true } : l))
    );
    const start = dayjs(leave.from);
    const end = dayjs(leave.to).endOf("day");
    setTickets((p) =>
      p.map((t) =>
        t.resolvedOn &&
        dayjs(t.resolvedOn).isAfter(start) &&
        dayjs(t.resolvedOn).isBefore(end)
          ? { ...t, status: "In Progress" }
          : t
      )
    );
    const notif = {
      id: `N${Date.now().toString().slice(-6)}`,
      to: leave.manager || "Manager",
      message: `${currentUser.name} is back from leave (${dayjs(
        leave.from
      ).format("DD/MM")} → ${dayjs(leave.to).format("DD/MM")}).`,
      createdOn: new Date().toISOString(),
      read: false,
    };
    setNotifs((p) => [notif, ...p]);
    logActivity(`Marked back from leave ${id} — reopened related tickets`);
  };

  // on-call
  const addOncallActivity = ({ ticketId, note, attachments }) => {
    const id = `OC${Date.now().toString().slice(-6)}`;
    const entry = {
      id,
      ticketId,
      note,
      attachments: attachments || [],
      qr: generateQRDataUrl(ticketId || id),
      createdOn: new Date().toISOString(),
    };
    setOncall((p) => [entry, ...p]);
    logActivity(`On-call recorded for ${ticketId || id}`);
  };

  // manager notif
  const markNotifRead = (id) =>
    setNotifs((p) => p.map((n) => (n.id === id ? { ...n, read: true } : n)));

  // export CSV
  const exportMyTicketsCSV = () => {
    if (!tickets.length) {
      alert("No tickets to export.");
      return;
    }
    const rows = tickets.map((t) => ({
      id: t.id,
      service: t.service,
      status: t.status,
      department: t.department,
      block: t.block || "",
      createdOn: t.createdOn,
      resolvedOn: t.resolvedOn || "",
    }));
    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(","),
      ...rows.map((r) =>
        headers
          .map((h) => `"${String(r[h] ?? "").replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tickets_${currentUser.userId}_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // block stats for chart
  const blockStatsData = useMemo(() => {
    const map = {};
    tickets.forEach((t) => {
      const b = t.block || "Unassigned";
      if (!map[b]) map[b] = { block: b, open: 0, resolved: 0, total: 0 };
      map[b].total += 1;
      if (t.status === "Resolved") map[b].resolved += 1;
      else map[b].open += 1;
    });
    // convert to array sorted by total desc
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [tickets]);

  // departments list
  const departments = Array.from(
    new Set(tickets.map((t) => t.department).filter(Boolean))
  );
  if (!departments.length) departments.push(currentUser.department);

  // drag/drop handlers
  const onCardDragStart = (e, id) => e.dataTransfer.setData("ticketId", id);
  const onColumnDragOver = (e) => e.preventDefault();
  const onColumnDrop = (e, status) => {
    const id = e.dataTransfer.getData("ticketId");
    if (!id) return;
    updateTicket(id, { status });
  };

  // open block modal
  const openBlockModal = (blockName) => {
    setSelectedBlock(blockName);
    setBlockModalOpen(true);
  };

  // resolve from modal
  const resolveTicketFromModal = (id) => {
    resolveTicket(id);
  };

  /* ===========================
     Render / UI
     =========================== */
  return (
    <div
      className={`relative min-h-screen ${
        theme === "dark"
          ? "bg-gradient-to-br from-slate-900 via-blue-950 to-black text-cyan-100"
          : "bg-white text-slate-900"
      } p-6`}
    >
      {/* top controls */}
      <div className="flex justify-end items-center gap-3 mb-4">
        <button
          onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
          className="flex items-center gap-2 px-3 py-2 rounded-md bg-slate-800/70 hover:bg-slate-800/60"
          title="Toggle theme"
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}{" "}
          {theme === "dark" ? "Light" : "Dark"}
        </button>

        <div className="flex items-center gap-2 bg-slate-900/60 rounded-md px-3 py-2">
          <div className="text-sm">{currentUser.name}</div>
          <div className="text-xs opacity-70 ml-2">({currentUser.userId})</div>
        </div>
      </div>

      {/* header */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <ClipboardList size={22} /> My Dashboard
          </h1>
          <p className="text-sm opacity-80 mt-1">
            Viewing your tickets & activity • Score: {computeActivityScore()}%
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900/60 border border-cyan-500/10 rounded-lg px-3 py-2">
            <Search size={16} />
            <input
              placeholder="Search..."
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              className="bg-transparent outline-none text-sm"
            />
          </div>

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="rounded-md px-3 py-2"
          >
            <option>All</option>
            {departments.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md px-3 py-2"
          >
            <option>All</option>
            <option>Open</option>
            <option>In Progress</option>
            <option>Resolved</option>
          </select>

          <button
            onClick={() => {
              setView((v) => (v === "kanban" ? "table" : "kanban"));
              localStorage.setItem(
                "ud_view_pref",
                view === "kanban" ? "table" : "kanban"
              );
            }}
            className="px-3 py-2 rounded-md bg-slate-900/60"
          >
            {view === "kanban" ? <Grid size={16} /> : <List size={16} />}
          </button>

          <button
            onClick={() => setCreateOpen(true)}
            className="px-4 py-2 rounded-md bg-cyan-600 text-white flex items-center gap-2"
          >
            <Plus size={16} /> Create
          </button>
        </div>
      </header>

      {/* layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* main column */}
        <div className="lg:col-span-3">
          {view === "kanban" ? (
            <motion.div
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-6"
            >
              {columns.map((col) => (
                <div
                  key={col}
                  className="flex-1 bg-slate-800/30 rounded-2xl p-4"
                  onDragOver={onColumnDragOver}
                  onDrop={(e) => onColumnDrop(e, col)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span
                        style={{
                          width: 10,
                          height: 10,
                          background: COLORS[col],
                          borderRadius: 99,
                        }}
                      />
                      <h3 className="text-sm font-semibold">{col}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-900/20">
                        {kanban[col].length}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4 max-h-[64vh] overflow-y-auto pr-2">
                    {kanban[col].map((t) => (
                      <div
                        key={t.id}
                        draggable
                        onDragStart={(e) => onCardDragStart(e, t.id)}
                        className="bg-slate-900/50 rounded-lg p-4 shadow-sm border border-slate-800/20 hover:shadow-md"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-xs font-semibold mb-1">
                              {t.priority === "High" ? (
                                <span className="px-2 py-1 rounded text-xs bg-red-900/10 text-red-300">
                                  {t.priority}
                                </span>
                              ) : (
                                <span className="px-2 py-1 rounded text-xs bg-slate-800/10">
                                  {t.priority}
                                </span>
                              )}
                            </div>
                            <div className="text-sm font-bold">#{t.id}</div>
                            <div className="text-xs opacity-70">
                              {t.department} • {t.service} • {t.block}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <button
                              className="p-2 rounded-md hover:bg-slate-800/30"
                              onClick={() => setOpenMenuFor(t.id)}
                            >
                              <MoreHorizontal size={16} />
                            </button>
                          </div>
                        </div>

                        {/* inline menu */}
                        <AnimatePresence>
                          {openMenuFor === t.id && (
                            <motion.div
                              initial={{ opacity: 0, y: -6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -6 }}
                              ref={menuRef}
                              className="mt-3 bg-slate-900/90 p-2 rounded-md border border-cyan-500/10"
                            >
                              <div className="flex items-center gap-2">
                                {/* VIEW BUTTON */}
                                <button
                                  onClick={() => {
                                    setDetailView(t.id);
                                    setOpenMenuFor(null);
                                  }}
                                  className="text-xs px-2 py-1 rounded-md bg-cyan-700"
                                >
                                  View
                                </button>

                                {/* RESOLVE BUTTON */}
                                <button
                                  onClick={async () => {
                                    try {
                                      await resolveTicket(t.id);
                                    } catch (error) {
                                      console.error("Resolve error:", error);
                                    }
                                    setOpenMenuFor(null);
                                  }}
                                  className="text-xs px-2 py-1 rounded-md bg-green-600"
                                >
                                  Resolve
                                </button>

                                {/* START BUTTON */}
                                <button
                                  onClick={async () => {
                                    try {
                                      await updateTicket(t.id, {
                                        status: "In Progress",
                                      });
                                    } catch (error) {
                                      console.error("Update error:", error);
                                    }
                                    setOpenMenuFor(null);
                                  }}
                                  className="text-xs px-2 py-1 rounded-md bg-yellow-600"
                                >
                                  Start
                                </button>

                                {/* CLOSE MENU */}
                                <button
                                  onClick={() => setOpenMenuFor(null)}
                                  className="text-xs px-2 py-1 rounded-md"
                                >
                                  Close
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800/30 rounded-2xl p-4"
            >
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="text-xs uppercase bg-slate-900/20">
                    <tr>
                      <th className="px-4 py-3 text-left">Ticket ID</th>
                      <th className="px-4 py-3 text-left">Department</th>
                      <th className="px-4 py-3 text-left">Service</th>
                      <th className="px-4 py-3 text-left">Priority</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Block</th>
                      <th className="px-4 py-3 text-left">Created On</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageItems.map((t) => (
                      <tr
                        key={t.id}
                        className="border-b border-slate-800/10 hover:bg-slate-900/10"
                      >
                        <td className="px-4 py-3">{t.id}</td>
                        <td className="px-4 py-3">{t.department}</td>
                        <td className="px-4 py-3">{t.service}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs border ${
                              t.priority === "High"
                                ? "border-red-400/40 text-red-300"
                                : t.priority === "Medium"
                                ? "border-yellow-400/40 text-yellow-300"
                                : "border-green-400/40 text-green-300"
                            }`}
                          >
                            {t.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span style={{ color: COLORS[t.status] }}>
                            {t.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">{t.block}</td>
                        <td className="px-4 py-3">{format(t.createdOn)}</td>
                        <td className="px-4 py-3 text-right relative">
                          <button
                            onClick={() =>
                              setOpenMenuFor((id) =>
                                id === t.id ? null : t.id
                              )
                            }
                            className="p-2 rounded-md hover:bg-slate-800/30"
                          >
                            <MoreHorizontal size={18} />
                          </button>
                          <AnimatePresence>
                            {openMenuFor === t.id && (
                              <motion.div
                                ref={menuRef}
                                initial={{ opacity: 0, y: -6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                className="absolute right-0 mt-2 w-56 bg-slate-900/95 border rounded-md shadow-lg p-3 z-30"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="text-sm font-medium">
                                    My Ticket
                                  </div>
                                  <div className="text-xs opacity-70">
                                    {totalTime(t)}
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <button
                                    onClick={() => {
                                      setDetailView(t.id);
                                      setOpenMenuFor(null);
                                    }}
                                    className="w-full text-left px-2 py-1 rounded-md bg-slate-800/60"
                                  >
                                    View
                                  </button>
                                  <button
                                    onClick={() => {
                                      resolveTicket(t.id);
                                      setOpenMenuFor(null);
                                    }}
                                    className="w-full text-left px-2 py-1 rounded-md bg-green-600"
                                  >
                                    Resolve
                                  </button>
                                  <button
                                    onClick={() => {
                                      updateTicket(t.id, {
                                        status: "In Progress",
                                      });
                                      setOpenMenuFor(null);
                                    }}
                                    className="w-full text-left px-2 py-1 rounded-md bg-yellow-600"
                                  >
                                    Start
                                  </button>
                                  <button
                                    onClick={() => setOpenMenuFor(null)}
                                    className="w-full text-left px-2 py-1 rounded-md"
                                  >
                                    Close
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-xs opacity-70">
                  Rows per page: {perPage} • Page {page} / {pageCount}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1 rounded-md bg-slate-900/40"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                    className="px-3 py-1 rounded-md bg-slate-900/40"
                  >
                    Next
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* right column: activity, leaves, charts */}
        <aside className="p-4 bg-slate-800/30 rounded-2xl border border-slate-700/20">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium">Activity & Overview</h4>
            <button
              onClick={() => {
                setSearchQ("");
                setDeptFilter("All");
                setStatusFilter("All");
              }}
              className="text-xs px-2 py-1 rounded-md bg-slate-900/40"
            >
              Reset
            </button>
          </div>

          {/* small pie */}
          <div className="h-44 mb-3">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  innerRadius={28}
                  label
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* counts */}
          <div className="text-sm mb-3">
            <div className="flex items-center justify-between text-xs mb-2">
              <div className="flex items-center gap-2">
                <span
                  style={{
                    width: 10,
                    height: 10,
                    background: COLORS.Open,
                    borderRadius: 99,
                  }}
                />{" "}
                Open
              </div>
              <div>{kanban.Open.length}</div>
            </div>
            <div className="flex items-center justify-between text-xs mb-2">
              <div className="flex items-center gap-2">
                <span
                  style={{
                    width: 10,
                    height: 10,
                    background: COLORS["In Progress"],
                    borderRadius: 99,
                  }}
                />{" "}
                In Progress
              </div>
              <div>{kanban["In Progress"].length}</div>
            </div>
            <div className="flex items-center justify-between text-xs mb-2">
              <div className="flex items-center gap-2">
                <span
                  style={{
                    width: 10,
                    height: 10,
                    background: COLORS.Resolved,
                    borderRadius: 99,
                  }}
                />{" "}
                Resolved
              </div>
              <div>{kanban.Resolved.length}</div>
            </div>
          </div>

          {/* avg resolution */}
          <div className="text-xs mb-3">
            <div className="font-medium">Avg Resolution Time</div>
            <div className="opacity-80 text-sm">
              {(() => {
                const resolved = tickets.filter((t) => t.resolvedOn);
                if (!resolved.length) return "—";
                const mins = resolved.reduce(
                  (sum, t) =>
                    sum +
                    dayjs(t.resolvedOn).diff(dayjs(t.createdOn), "minute"),
                  0
                );
                const avg = Math.round(mins / resolved.length);
                return `${Math.floor(avg / 60)}h ${avg % 60}m`;
              })()}
            </div>
          </div>

          <div className="flex flex-col gap-2 mb-3">
            <button
              onClick={exportMyTicketsCSV}
              className="px-3 py-2 rounded-md bg-cyan-600 text-white flex items-center gap-2 justify-center"
            >
              <Download size={14} /> Export My Tickets
            </button>
          </div>

          {/* Block performance chart */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium">Block Performance</div>
              <div className="text-xs opacity-70">Open vs Resolved</div>
            </div>

            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={blockStatsData}>
                  <XAxis dataKey="block" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="open" name="Open" fill={COLORS.OpenBar} />
                  <Bar
                    dataKey="resolved"
                    name="Resolved"
                    fill={COLORS.ResolvedBar}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* block summary + view details */}
            <div className="text-xs opacity-80 mt-3">
              {blockStatsData.length ? (
                blockStatsData.map((b) => (
                  <div
                    key={b.block}
                    className="flex items-center justify-between mb-1"
                  >
                    <div>
                      {b.block} — {b.total} tickets
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-xs opacity-70">
                        {b.resolved} resolved
                      </div>
                      <button
                        onClick={() => openBlockModal(b.block)}
                        className="px-2 py-1 rounded-md bg-slate-900/40 text-xs"
                      >
                        View Detailed Tickets
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="opacity-60">No block data</div>
              )}
            </div>
          </div>

          {/* leaves */}
          <div className="mt-2">
            <h5 className="text-sm font-medium mb-2">Planned Leaves</h5>

            <AddLeaveForm onAdd={(vals) => addLeave(vals)} />

            <div className="max-h-36 overflow-y-auto mt-3 text-xs">
              {leaves.length ? (
                leaves.map((l) => (
                  <div
                    key={l.id}
                    className="py-2 border-b border-slate-700/10 flex items-start justify-between"
                  >
                    <div>
                      <div className="font-semibold">
                        {dayjs(l.from).format("DD MMM YYYY")} →{" "}
                        {dayjs(l.to).format("DD MMM YYYY")}
                      </div>
                      <div className="opacity-70">{l.reason}</div>
                      <div className="text-[11px] opacity-60 mt-1">
                        Manager: {l.manager}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-[11px] opacity-70">
                        {dayjs(l.createdOn).format("DD/MM HH:mm")}
                      </div>
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => removeLeave(l.id)}
                          className="px-2 py-1 rounded-md bg-red-600 text-[12px]"
                        >
                          Remove
                        </button>
                        {!l.completed && (
                          <button
                            onClick={() => markBackFromLeave(l.id)}
                            className="px-2 py-1 rounded-md bg-green-600 text-[12px]"
                          >
                            Mark Back (Manual Open)
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="opacity-60 text-xs">No planned leaves</div>
              )}
            </div>
          </div>

          {/* recent activity */}
          <div className="mt-4">
            <h5 className="text-sm font-medium mb-2">Recent Activity</h5>
            <div className="max-h-40 overflow-y-auto text-xs opacity-80">
              {activityLog.length ? (
                activityLog.slice(0, 8).map((a, i) => (
                  <div key={i} className="py-1 border-b border-slate-700/10">
                    {a}
                  </div>
                ))
              ) : (
                <div className="opacity-60">No activity yet</div>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Ticket detail modal */}
      <AnimatePresence>
        {detailView && (
          <motion.div
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-slate-900 text-cyan-100 p-6 rounded-2xl w-full max-w-3xl border border-slate-700/20 shadow-2xl"
              initial={{ scale: 0.98 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.98 }}
            >
              {(() => {
                const t = tickets.find((x) => x.id === detailView);
                if (!t) return <div>Ticket not found</div>;
                return (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold">Ticket: {t.id}</h2>
                      <button
                        onClick={() => setDetailView(null)}
                        className="px-2 py-1 rounded-md bg-slate-800/40"
                      >
                        <X />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <b>Service:</b> {t.service}
                      </div>
                      <div>
                        <b>Department:</b> {t.department}
                      </div>
                      <div>
                        <b>Priority:</b> {t.priority}
                      </div>
                      <div>
                        <b>Status:</b> {t.status}
                      </div>
                      <div>
                        <b>Created On:</b> {format(t.createdOn)}
                      </div>
                      {t.resolvedOn && (
                        <div>
                          <b>Resolved On:</b> {format(t.resolvedOn)}
                        </div>
                      )}
                      <div>
                        <b>Block:</b> {t.block}
                      </div>
                    </div>

                    <div className="mt-4">
                      <h3 className="font-medium">Issue</h3>
                      <p className="opacity-80">
                        {t.issue || "No details provided."}
                      </p>
                    </div>

                    <div className="mt-4 flex justify-end gap-2">
                      {t.status !== "Resolved" && (
                        <button
                          onClick={() => {
                            resolveTicket(t.id);
                            setDetailView(null);
                          }}
                          className="px-3 py-2 rounded-md bg-green-600"
                        >
                          Resolve
                        </button>
                      )}
                      <button
                        onClick={() => setDetailView(null)}
                        className="px-3 py-2 rounded-md bg-slate-800/40"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Block detail modal */}
      <AnimatePresence>
        {blockModalOpen && selectedBlock && (
          <motion.div
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white text-slate-900 p-6 rounded-2xl w-full max-w-4xl border shadow-2xl"
              initial={{ scale: 0.98 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  Tickets in {selectedBlock}
                </h2>
                <button
                  onClick={() => {
                    setBlockModalOpen(false);
                    setSelectedBlock(null);
                  }}
                  className="px-2 py-1 rounded-md bg-slate-200"
                >
                  <X />
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto">
                <table className="min-w-full text-sm">
                  <thead className="text-xs uppercase bg-slate-100">
                    <tr>
                      <th className="px-4 py-2 text-left">ID</th>
                      <th className="px-4 py-2 text-left">Service</th>
                      <th className="px-4 py-2 text-left">Priority</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Created</th>
                      <th className="px-4 py-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets
                      .filter(
                        (t) => (t.block || "Unassigned") === selectedBlock
                      )
                      .map((t) => (
                        <tr key={t.id} className="border-b hover:bg-slate-50">
                          <td className="px-4 py-2">{t.id}</td>
                          <td className="px-4 py-2">{t.service}</td>
                          <td className="px-4 py-2">{t.priority}</td>
                          <td className="px-4 py-2">{t.status}</td>
                          <td className="px-4 py-2">{format(t.createdOn)}</td>
                          <td className="px-4 py-2 text-right">
                            {t.status !== "Resolved" ? (
                              <button
                                onClick={() => resolveTicketFromModal(t.id)}
                                className="px-3 py-1 rounded-md bg-green-600 text-white"
                              >
                                Resolve
                              </button>
                            ) : (
                              <div className="text-xs opacity-70">Resolved</div>
                            )}
                          </td>
                        </tr>
                      ))}
                    {tickets.filter(
                      (t) => (t.block || "Unassigned") === selectedBlock
                    ).length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-4 text-center opacity-70"
                        >
                          No tickets in this block
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    setBlockModalOpen(false);
                    setSelectedBlock(null);
                  }}
                  className="px-4 py-2 rounded-md bg-slate-200"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Ticket Modal */}
      <AnimatePresence>
        {createOpen && (
          <motion.div
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-slate-900 text-cyan-100 p-6 rounded-2xl w-full max-w-5xl border border-slate-700/20 shadow-2xl overflow-auto max-h-[92vh]"
              initial={{ scale: 0.98 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <FileUp /> Ticket Creation
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setCreateOpen(false);
                      setForm({ ...form, files: [] });
                    }}
                    className="px-3 py-1 rounded-md bg-slate-800/40"
                  >
                    <X />
                  </button>
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  // auto-assign block from department
                  const dept = form.department || currentUser.department;
                  const assignedBlock =
                    DEPARTMENT_BLOCK_MAP[dept] || "Unassigned";
                  createTicket({
                    ...form,
                    department: dept,
                    block: assignedBlock,
                  });
                  setCreateOpen(false);
                  setForm({
                    asset: "",
                    priority: "Low",
                    issue: "",
                    files: [],
                    closingDays: 1,
                  });
                }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div className="space-y-3">
                  <label className="block text-sm">Category *</label>
                  <select
                    required
                    value={form.category}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, category: e.target.value }))
                    }
                    className="w-full p-2 rounded-md bg-slate-800/40"
                  >
                    <option value="">Select Category</option>
                    <option>Service</option>
                    <option>Incident</option>
                    <option>Request</option>
                  </select>

                  <label className="block text-sm">Service *</label>
                  <select
                    required
                    value={form.service}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, service: e.target.value }))
                    }
                    className="w-full p-2 rounded-md bg-slate-800/40"
                  >
                    <option value="">Select Service</option>
                    <option>Computer Issue</option>
                    <option>Printer Issue</option>
                    <option>Network Support</option>
                  </select>

                  <label className="block text-sm">Issue</label>
                  <textarea
                    rows={4}
                    value={form.issue}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, issue: e.target.value }))
                    }
                    className="w-full p-2 rounded-md bg-slate-800/40"
                  />

                  <label className="block text-sm">Files</label>
                  <input
                    type="file"
                    multiple
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        files: Array.from(e.target.files).map((x) => x.name),
                      }))
                    }
                    className="w-full p-2 bg-slate-800/40 rounded-md"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm">Department *</label>
                  <select
                    required
                    value={form.department}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, department: e.target.value }))
                    }
                    className="w-full p-2 rounded-md bg-slate-800/40"
                  >
                    <option value="IT Services">IT Services</option>
                    <option value="Facilities">Facilities</option>
                    <option value="HR">HR</option>
                    <option value="Finance">Finance</option>
                    <option value="Security">Security</option>
                  </select>

                  <label className="block text-sm">Asset *</label>
                  <input
                    required
                    value={form.asset}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, asset: e.target.value }))
                    }
                    className="w-full p-2 rounded-md bg-slate-800/40"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm">Priority</label>
                      <select
                        value={form.priority}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, priority: e.target.value }))
                        }
                        className="w-full p-2 rounded-md bg-slate-800/40"
                      >
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm">
                        Expected Closing Days
                      </label>
                      <input
                        type="number"
                        value={form.closingDays}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            closingDays: e.target.value,
                          }))
                        }
                        className="w-full p-2 rounded-md bg-slate-800/40"
                      />
                    </div>
                  </div>

                  <div className="text-xs opacity-70">
                    Block will be auto-assigned based on department after
                    creation.
                  </div>
                  <div className="text-xs opacity-70">
                    Ticket will be assigned to you:{" "}
                    <b>
                      {currentUser.userId} - {currentUser.name}
                    </b>
                  </div>
                </div>

                <div className="md:col-span-2 flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setCreateOpen(false)}
                    className="px-4 py-2 rounded-md bg-slate-900/40"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-md bg-cyan-600 flex items-center gap-2"
                  >
                    <CheckCircle2 /> Submit
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ===========================
   Helper: simple QR data url
   (used previously for oncall)
   =========================== */
function generateQRDataUrl(text = "") {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'><rect width='100%' height='100%' fill='white'/><g fill='black' font-size='8' font-family='monospace'>${text
    .split("")
    .map((c, i) => `<text x='4' y='${10 + (i % 12) * 9}'>${c}</text>`)
    .join("")}</g></svg>`;
  return `data:image/svg+xml;base64,${
    typeof window !== "undefined" ? btoa(svg) : ""
  }`;
}

/* ===========================
   Helper sub-component: AddLeaveForm
   =========================== */
function AddLeaveForm({ onAdd }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [reason, setReason] = useState("");
  const [manager, setManager] = useState("");

  const submit = (e) => {
    e.preventDefault();
    onAdd({ from, to, reason, manager });
    // clear
    setFrom("");
    setTo("");
    setReason("");
    setManager("");
  };

  return (
    <form onSubmit={submit} className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <input
          required
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          type="date"
          className="p-2 rounded-md bg-slate-800/40 text-sm"
        />
        <input
          required
          value={to}
          onChange={(e) => setTo(e.target.value)}
          type="date"
          className="p-2 rounded-md bg-slate-800/40 text-sm"
        />
      </div>
      <input
        placeholder="Manager name (required)"
        required
        value={manager}
        onChange={(e) => setManager(e.target.value)}
        className="w-full p-2 rounded-md bg-slate-800/40 text-sm"
      />
      <input
        placeholder="Reason"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="w-full p-2 rounded-md bg-slate-800/40 text-sm"
      />
      <div className="flex justify-end">
        <button
          type="submit"
          className="px-3 py-1 rounded-md bg-yellow-600 text-xs"
        >
          Add Leave
        </button>
      </div>
    </form>
  );
}