"use client";
import React, { useEffect, useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import TicketColumn from "../../components/TicketColumn";
import TaskChart from "../../components/TaskChart";
import { CanvasRevealEffect } from "../../components/ui/canvas-reveal-effect";

// Team members
const teamMembers = [
  { id: "S10457", name: "VISHNU PRASAD M", leaveDates: ["2025-08-29"] },
  { id: "S10460", name: "BOOPATHI M", leaveDates: [] },
  { id: "S10494", name: "DURAIRAJ M", leaveDates: [] },
];

export default function Dashboard() {
  const [tickets, setTickets] = useState([
    {
      id: "IT1713",
      department: "IT",
      service: "PRINTER ISSUE",
      category: "Service",
      priority: "High",
      assignedTo: "S10457 - VISHNU PRASAD M",
      assignedId: "S10457",
      status: "Resolved",
      createdOn: "2025-08-29T10:22:00",
      completedOn: "2025-08-29T13:52:00",
      estimatedTime: 4,
      completedTime: 3.5,
    },
    {
      id: "IT1669",
      department: "IT",
      service: "NETWORK SUPPORT",
      category: "Service",
      priority: "Medium",
      assignedTo: "S10460 - BOOPATHI M",
      assignedId: "S10460",
      status: "In Progress",
      createdOn: "2025-08-20T09:14:00",
      estimatedTime: 6,
      completedTime: 2,
    },
    {
      id: "HR1721",
      department: "HR",
      service: "EMPLOYEE ONBOARDING",
      category: "Service",
      priority: "High",
      assignedTo: "S10494 - DURAIRAJ M",
      assignedId: "S10494",
      status: "Resolved",
      createdOn: "2025-09-01T10:29:00",
      completedOn: "2025-09-01T12:29:00",
      estimatedTime: 2,
      completedTime: 2,
    },
    {
      id: "FN1722",
      department: "Finance",
      service: "SOFTWARE INSTALLATION",
      category: "Service",
      priority: "High",
      assignedTo: "S10460 - BOOPATHI M",
      assignedId: "S10460",
      status: "Pending",
      createdOn: "2025-09-02T14:00:00",
      estimatedTime: 5,
      completedTime: 0,
    },
  ]);

  const [department, setDepartment] = useState(
    typeof window !== "undefined"
      ? localStorage.getItem("selectedDepartment") || "All"
      : "All"
  );
  const [hovered, setHovered] = useState(false);
  const [modalTicket, setModalTicket] = useState(null);
  const departments = ["All", "IT", "Admin", "HR", "Finance", "Support"];

  useEffect(() => {
    localStorage.setItem("selectedDepartment", department);
  }, [department]);

  useEffect(() => {
    const findBestAssignee = (date, currentTickets) => {
      const taskCount = {};
      teamMembers.forEach((m) => {
        if (!m.leaveDates.includes(date)) {
          taskCount[m.id] = currentTickets.filter((t) => t.assignedId === m.id).length;
        }
      });
      if (!Object.keys(taskCount).length) return teamMembers[0];
      const bestId = Object.entries(taskCount).reduce((a, b) => (a[1] <= b[1] ? a : b))[0];
      return teamMembers.find((m) => m.id === bestId);
    };

    setTickets((prevTickets) =>
      prevTickets.map((t) => {
        const date = new Date(t.createdOn).toISOString().split("T")[0];
        const member = teamMembers.find((m) => m.id === t.assignedId);
        if (member && member.leaveDates.includes(date)) {
          const best = findBestAssignee(date, prevTickets);
          return {
            ...t,
            assignedId: best.id,
            assignedTo: `${best.id} - ${best.name}`,
          };
        }
        return t;
      })
    );
  }, []);

  const filteredTickets = tickets.filter(
    (t) => department === "All" || t.department.toLowerCase() === department.toLowerCase()
  );

  const columnData = useMemo(
    () => ({
      open: filteredTickets.filter((t) => t.status === "Pending"),
      inProgress: filteredTickets.filter((t) => t.status === "In Progress"),
      resolved: filteredTickets.filter((t) => t.status === "Resolved"),
    }),
    [filteredTickets]
  );

  const workingUsers = columnData.inProgress.map((t) => t.assignedTo);

  const formatDate = (date) =>
    new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const calculateDuration = (start, end) => {
    if (!start || !end) return "N/A";
    const diffHours = (new Date(end) - new Date(start)) / (1000 * 60 * 60);
    return `${diffHours.toFixed(2)} hrs`;
  };

  return (
    <motion.div
      className="min-h-screen relative flex flex-col bg-gradient-to-br from-slate-900 via-blue-950 to-black text-gray-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Animated background glow */}
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
              containerClassName="bg-transparent"
              colors={[
                [0, 195, 255],
                [100, 200, 255],
                [0, 255, 200],
              ]}
              opacities={[0.04, 0.08, 0.12]}
              dotSize={2.2}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Users */}
      {workingUsers.length > 0 && (
        <motion.div
          className="fixed top-24 right-10 z-20"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="bg-white/10 backdrop-blur-xl border border-cyan-400/40 rounded-3xl px-8 py-6 shadow-lg shadow-cyan-500/30">
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

      {/* Main content */}
      <main
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative z-10 flex-1 px-8 md:px-14 py-12 max-w-[1600px] mx-auto w-full"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Department Dashboard
          </h2>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="bg-slate-800/60 border border-cyan-400/40 rounded-xl text-sm px-4 py-2 text-cyan-200 focus:ring-2 focus:ring-cyan-400 outline-none transition-all"
          >
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Columns + Chart */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-4 gap-10"
        >
          <div className="col-span-3 grid grid-cols-1 md:grid-cols-3 gap-8">
            <TicketColumn
              title="Open"
              color="border-cyan-700"
              dotColor="bg-cyan-500"
              headerColor="bg-gradient-to-br from-cyan-700 to-blue-900 text-cyan-100"
              tickets={columnData.open}
              onTicketClick={setModalTicket}
            />
            <TicketColumn
              title="In Progress"
              color="border-cyan-400"
              dotColor="bg-cyan-300"
              headerColor="bg-gradient-to-br from-cyan-600 to-blue-800 text-cyan-50"
              tickets={columnData.inProgress}
              onTicketClick={setModalTicket}
            />
            <TicketColumn
              title="Resolved"
              color="border-cyan-200"
              dotColor="bg-cyan-200"
              headerColor="bg-gradient-to-br from-blue-700 to-cyan-700 text-gray-50"
              tickets={columnData.resolved}
              onTicketClick={setModalTicket}
            />
          </div>

          <motion.div
            layout
            className="col-span-1 bg-slate-900/70 backdrop-blur-2xl p-10 rounded-3xl border border-cyan-500/40 shadow-lg shadow-cyan-500/20"
          >
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-semibold text-cyan-300">Task History</h3>
              <span className="text-sm text-cyan-400">{department}</span>
            </div>
            <TaskChart data={columnData} colorScheme={["#22d3ee", "#06b6d4", "#0891b2"]} />
          </motion.div>
        </motion.div>
      </main>

      {/* Ticket Modal */}
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
              className="bg-slate-900/90 border border-cyan-400/40 rounded-2xl p-8 w-96 text-cyan-100 shadow-lg shadow-cyan-500/30"
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
                className="mt-6 bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg transition-all"
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
