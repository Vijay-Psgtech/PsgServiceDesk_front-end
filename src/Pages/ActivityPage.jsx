"use client";
import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Ticket,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Neon colors
const neonBlue = "#00FFFF";
const neonViolet = "#7B61FF";
const neonPink = "#FF00C8";

export default function ActivityPage() {
  const [search, setSearch] = useState("");

  // ✅ Memoize tickets so it's stable and doesn't trigger re-renders
  const tickets = useMemo(
    () => [
      {
        id: "TCK-001",
        subject: "System crash in HR portal",
        department: "IT Services",
        assignedTo: "John Doe",
        priority: "High",
        status: "In Progress",
      },
      {
        id: "TCK-002",
        subject: "Payroll discrepancy",
        department: "Finance",
        assignedTo: "Sarah Lee",
        priority: "Medium",
        status: "Pending",
      },
      {
        id: "TCK-003",
        subject: "Leave approval issue",
        department: "HR",
        assignedTo: "Michael Chen",
        priority: "Low",
        status: "Completed",
      },
      {
        id: "TCK-004",
        subject: "Network downtime",
        department: "IT Services",
        assignedTo: "David Patel",
        priority: "High",
        status: "In Progress",
      },
      {
        id: "TCK-005",
        subject: "Air conditioning issue",
        department: "Operations",
        assignedTo: "Priya Sharma",
        priority: "Medium",
        status: "Pending",
      },
    ],
    []
  );

  const filteredTickets = useMemo(() => {
    return tickets.filter(
      (t) =>
        t.subject.toLowerCase().includes(search.toLowerCase()) ||
        t.department.toLowerCase().includes(search.toLowerCase()) ||
        t.assignedTo.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, tickets]); // ✅ include tickets safely

  const stats = useMemo(() => {
    return {
      total: tickets.length,
      pending: tickets.filter((t) => t.status === "Pending").length,
      inProgress: tickets.filter((t) => t.status === "In Progress").length,
      completed: tickets.filter((t) => t.status === "Completed").length,
    };
  }, [tickets]);

  const departmentData = useMemo(() => {
    const map = {};
    tickets.forEach((t) => {
      map[t.department] = (map[t.department] || 0) + 1;
    });
    return Object.keys(map).map((k) => ({ name: k, value: map[k] }));
  }, [tickets]);

  const COLORS = [neonBlue, neonViolet, neonPink, "#39FF14", "#FFB800"];

  return (
    <div className="min-h-screen bg-[#05070E] text-white p-8">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center"
      >
        <div>
          <h1 className="text-3xl font-bold text-cyan-400">Activity Overview</h1>
          <p className="text-sm text-gray-400">
            Real-time ticket distribution and department performance
          </p>
        </div>
        <div className="flex items-center mt-4 md:mt-0">
          <Search size={18} className="text-cyan-400 mr-2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tickets, departments, users..."
            className="bg-[#0A0F1F] border border-cyan-500/40 rounded-lg px-3 py-2 text-sm text-white w-64 focus:ring-2 focus:ring-cyan-500 outline-none"
          />
        </div>
      </motion.header>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10"
      >
        <div className="bg-[#0E1324] border border-cyan-500/30 rounded-xl p-5 shadow-lg shadow-cyan-500/10">
          <div className="flex items-center gap-3 text-cyan-400">
            <Ticket size={24} />
            <span className="text-sm font-medium">Total Tickets</span>
          </div>
          <h2 className="text-3xl font-bold mt-3">{stats.total}</h2>
        </div>
        <div className="bg-[#0E1324] border border-yellow-400/40 rounded-xl p-5 shadow-lg shadow-yellow-400/10">
          <div className="flex items-center gap-3 text-yellow-400">
            <Clock size={24} />
            <span className="text-sm font-medium">Pending</span>
          </div>
          <h2 className="text-3xl font-bold mt-3">{stats.pending}</h2>
        </div>
        <div className="bg-[#0E1324] border border-cyan-500/40 rounded-xl p-5 shadow-lg shadow-cyan-500/10">
          <div className="flex items-center gap-3 text-cyan-400">
            <AlertTriangle size={24} />
            <span className="text-sm font-medium">In Progress</span>
          </div>
          <h2 className="text-3xl font-bold mt-3">{stats.inProgress}</h2>
        </div>
        <div className="bg-[#0E1324] border border-green-400/40 rounded-xl p-5 shadow-lg shadow-green-400/10">
          <div className="flex items-center gap-3 text-green-400">
            <CheckCircle2 size={24} />
            <span className="text-sm font-medium">Completed</span>
          </div>
          <h2 className="text-3xl font-bold mt-3">{stats.completed}</h2>
        </div>
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-[#0E1324] border border-cyan-500/20 rounded-xl p-6 shadow-lg shadow-cyan-500/10"
        >
          <h3 className="text-lg font-semibold text-cyan-400 mb-4">
            Department Distribution
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={departmentData}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                innerRadius={50}
                label
              >
                {departmentData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#0A0F1F",
                  border: "1px solid #00FFFF",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#00FFFF" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-[#0E1324] border border-violet-500/20 rounded-xl p-6 shadow-lg shadow-violet-500/10"
        >
          <h3 className="text-lg font-semibold text-violet-400 mb-4">
            Tickets by Status
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={[stats]}>
              <XAxis dataKey="name" hide />
              <YAxis />
              <Tooltip
                contentStyle={{
                  background: "#0A0F1F",
                  border: "1px solid #7B61FF",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#7B61FF" }}
              />
              <Bar dataKey="pending" fill="#FFD700" name="Pending" />
              <Bar dataKey="inProgress" fill="#00FFFF" name="In Progress" />
              <Bar dataKey="completed" fill="#39FF14" name="Completed" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Tickets Table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-[#0E1324] border border-cyan-500/30 rounded-xl shadow-lg shadow-cyan-500/10 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-cyan-500/20 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-cyan-400">All Ticket Activities</h3>
          <p className="text-xs text-gray-400">
            Showing {filteredTickets.length} of {tickets.length}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-gray-300">
            <thead className="bg-[#0A0F1F] text-cyan-400 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left">Ticket ID</th>
                <th className="px-6 py-3 text-left">Subject</th>
                <th className="px-6 py-3 text-left">Department</th>
                <th className="px-6 py-3 text-left">Assigned To</th>
                <th className="px-6 py-3 text-left">Priority</th>
                <th className="px-6 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((t, i) => (
                <motion.tr
                  key={t.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-cyan-500/10 hover:bg-[#11182A] transition-colors"
                >
                  <td className="px-6 py-3">{t.id}</td>
                  <td className="px-6 py-3">{t.subject}</td>
                  <td className="px-6 py-3 text-cyan-300">{t.department}</td>
                  <td className="px-6 py-3 text-violet-300">{t.assignedTo}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        t.priority === "High"
                          ? "bg-red-500/20 text-red-400 border border-red-500/40"
                          : t.priority === "Medium"
                          ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40"
                          : "bg-green-500/20 text-green-300 border border-green-500/40"
                      }`}
                    >
                      {t.priority}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        t.status === "Pending"
                          ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40"
                          : t.status === "In Progress"
                          ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                          : "bg-green-500/20 text-green-300 border border-green-500/40"
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
