"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, MoreVertical, X } from "lucide-react";

import TaskChart from "../TaskChart";
import TicketColumn from "../TicketColumn";
import { CanvasRevealEffect } from "../ui/canvas-reveal-effect";

// 👥 Team Members
const teamMembers = [
  { id: "S10457", name: "VISHNU PRASAD M", leaveDates: ["2025-08-29"] },
  { id: "S10460", name: "BOOPATHI M", leaveDates: [] },
  { id: "S10494", name: "DURAIRAJ M", leaveDates: [] },
];

export default function DashboardWithTickets() {
  const [tickets, setTickets] = useState([]);
  const department = "IT Services"; // ✅ Removed setDepartment
  const [hovered, setHovered] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);

  // 🎯 Initial Tickets
  useEffect(() => {
    const initial = [
      {
        id: "IT1713",
        department: "IT Services",
        service: "PRINTER ISSUE",
        category: "Service",
        assets: "2 Printers",
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
        department: "IT Services",
        service: "NETWORK SUPPORT",
        category: "Service",
        assets: "Laptop",
        priority: "Medium",
        assignedTo: "S10460 - BOOPATHI M",
        assignedId: "S10460",
        status: "In Progress",
        createdOn: "2025-08-20T09:14:00",
        estimatedTime: 6,
        completedTime: 2,
      },
      {
        id: "IT1721",
        department: "IT Services",
        service: "TONER REFILLING",
        category: "Service",
        assets: "-",
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
        id: "IT1722",
        department: "IT Services",
        service: "SOFTWARE INSTALLATION",
        category: "Service",
        assets: "Laptop",
        priority: "High",
        assignedTo: "S10460 - BOOPATHI M",
        assignedId: "S10460",
        status: "Open",
        createdOn: "2025-09-02T14:00:00",
        estimatedTime: 5,
        completedTime: 0,
      },
    ];
    setTickets(initial);
  }, []);

  // 🧠 Find Best Assignee
  const findBestAssignee = (date) => {
    const taskCount = {};
    teamMembers.forEach((m) => {
      const onLeave = m.leaveDates.includes(date);
      if (!onLeave) {
        taskCount[m.id] = tickets.filter((t) => t.assignedId === m.id).length;
      }
    });
    if (Object.keys(taskCount).length === 0) return teamMembers[0];
    const bestId = Object.entries(taskCount).reduce(
      (a, b) => (a[1] <= b[1] ? a : b)
    )[0];
    return teamMembers.find((m) => m.id === bestId);
  };

  // 🆕 Create New Ticket
  const createTicket = () => {
    const newId = `IT${Math.floor(Math.random() * 9000) + 1000}`;
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];
    const bestMember = findBestAssignee(dateStr);

    const newTicket = {
      id: newId,
      department,
      service: "NEW TICKET",
      category: "Service",
      assets: "Laptop",
      priority: "Medium",
      assignedTo: `${bestMember.id} - ${bestMember.name}`,
      assignedId: bestMember.id,
      status: "Open",
      createdOn: now.toISOString(),
      estimatedTime: 3,
      completedTime: 0,
    };
    setTickets((prev) => [...prev, newTicket]);
  };

  // 🧾 Group Data
  const data = {
    open: tickets.filter((t) => t.status === "Open"),
    inProgress: tickets.filter((t) => t.status === "In Progress"),
    resolved: tickets.filter((t) => t.status === "Resolved"),
  };

  // 🔍 Filter tickets
  const filteredTickets = tickets.filter(
    (t) =>
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.service.toLowerCase().includes(search.toLowerCase())
  );

  // 👷 Active users
  const workingUsers = data.inProgress.map((t) => t.assignedTo.split(" - ")[1]);

  // 🕓 Format Date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ⏱ Calculate Duration
  const calculateDuration = (start, end) => {
    if (!start || !end) return "N/A";
    const startTime = new Date(start);
    const endTime = new Date(end);
    const diffHours = (endTime - startTime) / (1000 * 60 * 60);
    return `${diffHours.toFixed(2)} hrs`;
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-red-600 via-red-200 to-white text-gray-900 overflow-x-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* 🌈 Background Glow */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            key="canvas"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
          >
            <CanvasRevealEffect
              animationSpeed={3}
              containerClassName="bg-transparent"
              colors={[
                [239, 68, 68],
                [252, 165, 165],
                [255, 255, 255],
              ]}
              opacities={[0.05, 0.1, 0.15]}
              dotSize={2.5}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🧩 Main Content */}
      <main
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative z-10 px-10 py-10 max-w-[1600px] mx-auto"
      >
        {/* 👷 Active Users */}
        {workingUsers.length > 0 && (
          <motion.div
            className="fixed top-28 right-10 z-20"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="relative bg-white/80 backdrop-blur-2xl border border-red-200 rounded-3xl shadow-lg px-8 py-8 min-w-[260px]">
              <motion.div
                className="absolute -top-2 -right-2 w-3 h-3 bg-red-500 rounded-full shadow-lg"
                animate={{ scale: [1, 1.2, 1], opacity: [1, 0.6, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                👷 Active Users
              </h4>
              <div className="flex flex-wrap gap-2">
                {workingUsers.map((u, i) => (
                  <motion.div
                    key={i}
                    className="px-3 py-1 bg-red-100/60 text-red-700 rounded-full text-xs font-medium"
                    whileHover={{ scale: 1.08 }}
                  >
                    {u}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* 🧭 Header */}
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight text-gray-800">
            Department Dashboard
          </h2>
          <button
            onClick={createTicket}
            className="bg-gradient-to-r from-red-600 via-rose-400 to-pink-300 text-white px-6 py-2 rounded-xl font-semibold shadow-lg"
          >
            <Plus size={18} className="inline mr-1" /> Create Ticket
          </button>
        </div>

        {/* 🧱 Columns + Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          <div className="col-span-3 grid grid-cols-1 md:grid-cols-3 gap-8">
            <TicketColumn title="Open" color="border-red-700" tickets={data.open} />
            <TicketColumn
              title="In Progress"
              color="border-rose-500"
              tickets={data.inProgress}
            />
            <TicketColumn
              title="Resolved"
              color="border-pink-300"
              tickets={data.resolved}
            />
          </div>

          <div className="col-span-1 bg-white/80 backdrop-blur-2xl p-12 rounded-3xl border border-red-200 shadow-lg">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-gray-800 tracking-tight">
                Task Summary
              </h3>
              <span className="text-sm font-medium text-gray-500">{department}</span>
            </div>
            <TaskChart
              data={data}
              colorScheme={["#dc2626", "#f87171", "#facc15"]}
            />
          </div>
        </div>

        {/* 🧾 Tickets Table */}
        <div className="mt-20 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-gray-100">
          <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
            <div className="relative w-1/3 min-w-[220px]">
              <Search size={18} className="absolute top-3 left-3 text-red-400" />
              <input
                type="text"
                placeholder="Search tickets..."
                className="w-full pl-10 pr-3 py-2 border border-red-200 rounded-lg text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-md">
            <table className="min-w-full text-sm text-left rounded-2xl">
              <thead className="bg-gradient-to-r from-red-600 via-rose-400 to-pink-400 text-white">
                <tr>
                  <th className="p-3 font-semibold">TICKET ID</th>
                  <th className="p-3 font-semibold">SERVICE</th>
                  <th className="p-3 font-semibold">ASSIGNED TO</th>
                  <th className="p-3 font-semibold">STATUS</th>
                  <th className="p-3 font-semibold">CREATED ON</th>
                  <th className="p-3 font-semibold">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((t, i) => (
                  <tr
                    key={i}
                    className="border-b hover:bg-red-50 transition-all cursor-pointer"
                    onClick={() => setSelectedTicket(t)}
                  >
                    <td className="p-3 font-medium text-red-700">{t.id}</td>
                    <td className="p-3">{t.service}</td>
                    <td className="p-3">{t.assignedTo}</td>
                    <td className="p-3">{t.status}</td>
                    <td className="p-3">{formatDate(t.createdOn)}</td>
                    <td className="p-3 text-center">
                      <MoreVertical size={18} className="text-gray-500" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 🪟 Modal */}
        <AnimatePresence>
          {selectedTicket && (
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-red-200"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">
                    Ticket Details - {selectedTicket.id}
                  </h2>
                  <button onClick={() => setSelectedTicket(null)}>
                    <X className="text-gray-600 hover:text-red-500" />
                  </button>
                </div>

                <div className="space-y-4 text-sm text-gray-700">
                  <p>
                    <strong>Service:</strong> {selectedTicket.service}
                  </p>
                  <p>
                    <strong>Assigned To:</strong> {selectedTicket.assignedTo}
                  </p>
                  <p>
                    <strong>Status:</strong> {selectedTicket.status}
                  </p>
                  <p>
                    <strong>Created On:</strong> {formatDate(selectedTicket.createdOn)}
                  </p>
                  {selectedTicket.completedOn && (
                    <p>
                      <strong>Completed On:</strong> {formatDate(selectedTicket.completedOn)}
                    </p>
                  )}
                  <p>
                    <strong>Task Duration:</strong>{" "}
                    {calculateDuration(selectedTicket.createdOn, selectedTicket.completedOn)}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </motion.div>
  );
}
