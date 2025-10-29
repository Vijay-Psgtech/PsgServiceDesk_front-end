"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CircleUser,
  Clock,
  CheckCircle2,
  Loader2,
  Send,
  LogOut,
} from "lucide-react";
import { Calendar } from "react-calendar";
import "react-calendar/dist/Calendar.css";
import dayjs from "dayjs";

export default function UserDashboard() {
  const user = {
    name: "John Doe",
    regId: "USR-1001",
  };

  const [tickets, setTickets] = useState([
    {
      id: "TCK-001",
      subject: "Internet not working",
      department: "IT Services",
      status: "Pending",
      priority: "High",
      created: "2025-10-20",
      startTime: null,
      endTime: null,
    },
    {
      id: "TCK-002",
      subject: "Printer issue on floor 3",
      department: "IT Services",
      status: "In Progress",
      priority: "Medium",
      created: "2025-10-21",
      startTime: dayjs().subtract(2, "hour").toDate(),
      endTime: null,
    },
    {
      id: "TCK-003",
      subject: "Email access request",
      department: "IT Services",
      status: "Completed",
      priority: "Low",
      created: "2025-10-22",
      startTime: dayjs().subtract(4, "hour").toDate(),
      endTime: dayjs().subtract(1, "hour").toDate(),
    },
  ]);

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [leaveReason, setLeaveReason] = useState("");
  const [reassigned, setReassigned] = useState(false);
  const [leaveDate, setLeaveDate] = useState(new Date());

  const statusColors = {
    Pending: "text-yellow-400 border-yellow-400/50 bg-yellow-400/10",
    "In Progress": "text-blue-400 border-blue-400/50 bg-blue-400/10",
    Completed: "text-green-400 border-green-400/50 bg-green-400/10",
  };

  const updateStatus = (id, newStatus) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const now = new Date();
          return {
            ...t,
            status: newStatus,
            startTime:
              t.startTime || (newStatus === "In Progress" ? now : t.startTime),
            endTime: newStatus === "Completed" ? now : t.endTime,
          };
        }
        return t;
      })
    );
    setSelectedTicket(null);
  };

  const submitLeave = () => {
    setReassigned(true);
    setTimeout(() => {
      setLeaveModalOpen(false);
      setLeaveReason("");
      setReassigned(false);
    }, 2000);
  };

  const calculateTime = (ticket) => {
    if (!ticket.startTime) return "-";
    const end = ticket.endTime || new Date();
    const diff = dayjs(end).diff(dayjs(ticket.startTime), "minute");
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    return `${hours}h ${minutes}m`;
  };

  const glowCard =
    "bg-gradient-to-br from-indigo-950 via-purple-950 to-black border border-purple-500/20 shadow-[0_0_20px_rgba(138,43,226,0.3)]";
  const glowInput =
    "bg-indigo-950/50 border border-purple-500/30 text-purple-100 placeholder-purple-300/40 focus:ring-2 focus:ring-purple-500 outline-none";
  const glowButton =
    "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-[0_0_15px_rgba(138,43,226,0.6)]";

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-black text-purple-100 p-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.6)]">
            User Dashboard
          </h1>
          <p className="text-sm text-purple-300/80">
            Manage your tickets and leave requests
          </p>
          <div className="flex items-center gap-4 mt-2 text-sm text-purple-300/80">
            <CircleUser size={16} />
            <span>{user.name}</span>
            <span className="px-2">|</span>
            <span>ID: {user.regId}</span>
          </div>
        </div>
        <button
          className={`flex items-center gap-2 text-sm px-4 py-2 rounded-md border border-purple-500/40 text-purple-300 hover:bg-purple-800/30 transition-all`}
        >
          <LogOut size={16} />
          Logout
        </button>
      </header>

      {/* Ticket Table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`${glowCard} rounded-2xl overflow-hidden`}
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-purple-500/20 bg-purple-950/40">
          <h2 className="text-lg font-medium text-purple-300">My Tickets</h2>
          <button
            onClick={() => setLeaveModalOpen(true)}
            className={`${glowButton} px-4 py-2 rounded-md flex items-center gap-2`}
          >
            <Clock size={16} />
            Inform Leave
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-purple-200">
            <thead className="bg-purple-900/50 text-purple-300 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-3 text-left">Ticket ID</th>
                <th className="px-6 py-3 text-left">Subject</th>
                <th className="px-6 py-3 text-left">Department</th>
                <th className="px-6 py-3 text-left">Priority</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Total Time</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t, idx) => (
                <motion.tr
                  key={t.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="border-b border-purple-800/40 hover:bg-purple-900/30 transition-colors"
                >
                  <td className="px-6 py-4">{t.id}</td>
                  <td className="px-6 py-4">{t.subject}</td>
                  <td className="px-6 py-4">{t.department}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs border ${
                        t.priority === "High"
                          ? "border-red-400/50 text-red-400 bg-red-400/10"
                          : t.priority === "Medium"
                          ? "border-yellow-400/50 text-yellow-400 bg-yellow-400/10"
                          : "border-green-400/50 text-green-400 bg-green-400/10"
                      }`}
                    >
                      {t.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs border ${
                        statusColors[t.status]
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{calculateTime(t)}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedTicket(t)}
                      className="text-purple-400 hover:text-purple-300 font-medium text-xs"
                    >
                      View
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Ticket Modal */}
      <AnimatePresence>
        {selectedTicket && (
          <motion.div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 18 }}
              className={`${glowCard} w-full max-w-md rounded-2xl p-6`}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-purple-300">
                  {selectedTicket.subject}
                </h3>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="text-purple-400 hover:text-purple-200"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2 text-sm text-purple-200/90">
                <p>
                  <strong>ID:</strong> {selectedTicket.id}
                </p>
                <p>
                  <strong>Department:</strong> {selectedTicket.department}
                </p>
                <p>
                  <strong>Priority:</strong> {selectedTicket.priority}
                </p>
                <p>
                  <strong>Status:</strong> {selectedTicket.status}
                </p>
                <p>
                  <strong>Start:</strong>{" "}
                  {selectedTicket.startTime
                    ? dayjs(selectedTicket.startTime).format(
                        "DD MMM YYYY, HH:mm"
                      )
                    : "-"}
                </p>
                <p>
                  <strong>End:</strong>{" "}
                  {selectedTicket.endTime
                    ? dayjs(selectedTicket.endTime).format("DD MMM YYYY, HH:mm")
                    : "-"}
                </p>
                <p>
                  <strong>Total Time:</strong> {calculateTime(selectedTicket)}
                </p>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                {selectedTicket.status !== "Completed" && (
                  <button
                    onClick={() => updateStatus(selectedTicket.id, "Completed")}
                    className={`${glowButton} px-4 py-2 rounded-md flex items-center gap-2`}
                  >
                    <CheckCircle2 size={16} />
                    Complete
                  </button>
                )}
                {selectedTicket.status === "Pending" && (
                  <button
                    onClick={() =>
                      updateStatus(selectedTicket.id, "In Progress")
                    }
                    className={`${glowButton} px-4 py-2 rounded-md flex items-center gap-2`}
                  >
                    <Loader2 size={16} />
                    Start
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Leave Modal */}
      <AnimatePresence>
        {leaveModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 200 }}
              className={`${glowCard} w-full max-w-lg rounded-2xl p-6`}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-purple-300">
                  Inform Leave
                </h3>
                <button
                  onClick={() => setLeaveModalOpen(false)}
                  className="text-purple-400 hover:text-purple-200"
                >
                  ✕
                </button>
              </div>

              {reassigned ? (
                <div className="flex flex-col items-center justify-center py-8 text-green-400">
                  <CheckCircle2 size={36} />
                  <p className="mt-3 text-sm font-medium">
                    Tickets reassigned successfully.
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-purple-300/80 mb-3">
                    Select a date and provide a reason.
                  </p>

                  <Calendar
                    onChange={setLeaveDate}
                    value={leaveDate}
                    className="mb-3 rounded-md border border-purple-500/20 bg-purple-950/40 text-purple-200"
                  />

                  <textarea
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    rows={3}
                    className={`w-full rounded-md px-3 py-2 text-sm mb-4 ${glowInput}`}
                    placeholder="Type reason here..."
                  />

                  <div className="mt-2 flex justify-end gap-3">
                    <button
                      onClick={() => setLeaveModalOpen(false)}
                      className="px-4 py-2 rounded-md border border-purple-500/40 text-purple-300 hover:bg-purple-800/30"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={submitLeave}
                      className={`${glowButton} px-4 py-2 rounded-md flex items-center gap-2`}
                    >
                      <Send size={16} />
                      Submit
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
