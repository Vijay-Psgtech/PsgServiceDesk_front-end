"use client";
import React, { useEffect, useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import TicketColumn from "../components/TicketColumn";
import TaskChart from "../components/TaskChart";
import { CanvasRevealEffect } from "../components/ui/canvas-reveal-effect";
import { useNavigate } from "react-router-dom";

// ✅ FIXED IMPORTS
import { apiGet, apiPatch } from "../lib/api";
import { getUserFromStorage, logout } from "../lib/auth";

// CSV helper
const downloadCSV = (tickets) => {
  if (!tickets.length) return;

  const header = Object.keys(tickets[0]).join(",");
  const rows = tickets
    .map((t) =>
      Object.values(t)
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");

  const blob = new Blob([header + "\n" + rows], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "tickets.csv";
  a.click();
};

export default function Dashboard() {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [departmentsList, setDepartmentsList] = useState(["All"]);
  const [department, setDepartment] = useState(
    localStorage.getItem("selectedDepartment") || "All"
  );
  const [hovered, setHovered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Save department filter
  useEffect(() => {
    localStorage.setItem("selectedDepartment", department);
  }, [department]);

  // Only admin allowed
  useEffect(() => {
    const user = getUserFromStorage();
    if (!user || user.role !== "admin") {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  // Fetch all dashboard data
  useEffect(() => {
    let isMounted = true;

    const loadAll = async () => {
      setLoading(true);
      try {
        const users = await apiGet("/api/users");
        if (!isMounted) return;

        setTeamMembers(
          users.map((u) => ({
            id: u._id || u.userId,
            name: u.name || "User",
          }))
        );

        try {
          const deps = await apiGet("/api/departments");
          if (Array.isArray(deps)) setDepartmentsList(["All", ...deps]);
        } catch {}

        const depQuery =
          department && department !== "All"
            ? `?department=${encodeURIComponent(department)}`
            : "";

        const t = await apiGet(`/api/tickets${depQuery}`);
        if (!isMounted) return;

        const mapped = t.map((x) => ({
          id: x.id || x._id,
          department: x.department,
          service: x.service,
          priority: x.priority,
          status: x.status,
          assignedTo: x.assignedTo || x.assignedId || "Unassigned",
          assignedId: x.assignedId || null,
          estimatedTime: x.estimatedTime || 0,
          completedTime: x.completedTime || 0,
          createdOn: x.createdOn,
          completedOn: x.completedOn || null,
          raw: x,
        }));

        setTickets(mapped);
      } catch (err) {
        const msg = err.message || String(err);
        if (msg.includes("401")) {
          logout();
          navigate("/login");
        }
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    loadAll();
    return () => (isMounted = false);
  }, [department, navigate]);

  const columnData = useMemo(
    () => ({
      open: tickets.filter((t) => ["Pending", "Open"].includes(t.status)),
      inProgress: tickets.filter((t) =>
        ["In Progress", "Ongoing"].includes(t.status)
      ),
      resolved: tickets.filter((t) =>
        ["Resolved", "Closed"].includes(t.status)
      ),
    }),
    [tickets]
  );

  const total = tickets.length;
  const openCount = columnData.open.length;
  const inProgressCount = columnData.inProgress.length;
  const resolvedCount = columnData.resolved.length;
  const resolvedPct =
    total === 0 ? 0 : ((resolvedCount / total) * 100).toFixed(1);

  const markResolved = async (ticket) => {
    try {
      await apiPatch(`/api/tickets/${ticket.id}/resolve`, {});
      setTickets((prev) =>
        prev.map((t) => (t.id === ticket.id ? { ...t, status: "Resolved" } : t))
      );
    } catch {
      alert("Failed to update");
    }
  };

  const autoReassign = async (ticket) => {
    try {
      await apiPatch(`/api/tickets/${ticket.id}/reassign`, {});
      alert("Reassigned by backend");
    } catch {
      alert("Reassign failed");
    }
  };

  const ticketCardActions = {
    onResolve: markResolved,
    onReassign: autoReassign,
  };

  const chartData = [
    { name: "Open", value: openCount },
    { name: "In Progress", value: inProgressCount },
    { name: "Resolved", value: resolvedCount },
  ];

  return (
    <motion.div
      className="min-h-screen relative flex flex-col bg-gradient-to-br from-slate-900 via-blue-950 to-black text-gray-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Glow effect */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            className="absolute inset-0 z-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <CanvasRevealEffect
              animationSpeed={3}
              colors={[
                [0, 195, 255],
                [100, 200, 255],
                [0, 255, 200],
              ]}
              opacities={[0.03, 0.06, 0.12]}
              dotSize={2}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <main
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative z-10 flex-1 px-8 md:px-16 py-12 max-w-[1600px] mx-auto"
      >
        {/* UI unchanged — omitted for brevity */}
      </main>
    </motion.div>
  );
}
