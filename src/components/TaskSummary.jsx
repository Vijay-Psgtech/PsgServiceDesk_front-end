"use client";
import React, { useState, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Users, AlertCircle, Clock } from "lucide-react"     ;

const COLORS = ["#facc15", "#60a5fa", "#22c55e"]; // Neon yellow, blue, green

export default function TaskSummary({ tickets = [] }) {
  const [selectedUser, setSelectedUser] = useState("");
  const [activeStatus, setActiveStatus] = useState(null);

  const normalizeStatus = (status) => {
    if (!status) return "Pending";
    const s = status.toLowerCase();
    if (s === "open" || s === "pending") return "Pending";
    if (s === "in progress") return "In Progress";
    if (s === "resolved" || s === "done" || s === "closed") return "Resolved";
    return "Pending";
  };

  const userStats = useMemo(() => {
    return tickets.reduce((acc, t) => {
      const user = t.assignee || t.assignedTo || "Unassigned";
      const status = normalizeStatus(t.status);
      if (!acc[user]) acc[user] = { pending: 0, inProgress: 0, resolved: 0 };
      if (status === "In Progress") acc[user].inProgress++;
      else if (status === "Resolved") acc[user].resolved++;
      else acc[user].pending++;
      return acc;
    }, {});
  }, [tickets]);

  const assignees = Object.keys(userStats);
  const stats = selectedUser
    ? userStats[selectedUser]
    : { pending: 0, inProgress: 0, resolved: 0 };
  const total = stats.pending + stats.inProgress + stats.resolved;

  const data = [
    { name: "Pending", value: stats.pending },
    { name: "In Progress", value: stats.inProgress },
    { name: "Resolved", value: stats.resolved },
  ];

  const incompleteTasks = useMemo(() => {
    return tickets
      .filter(
        (t) =>
          (t.assignee === selectedUser || t.assignedTo === selectedUser) &&
          ["Pending", "In Progress"].includes(normalizeStatus(t.status))
      )
      .map((task) => {
        const assignedTime = task.assignedAt || task.createdAt;
        const assignedDate = assignedTime ? new Date(assignedTime).getTime() : 0;
        const now = Date.now();
        const hours = assignedDate
          ? Math.floor((now - assignedDate) / (1000 * 60 * 60))
          : 0;
        return { ...task, hoursAssigned: hours };
      });
  }, [tickets, selectedUser]);

  const handleSliceClick = (entry) => {
    setActiveStatus((prev) => (prev === entry.name ? null : entry.name));
  };

  const filteredTasks = activeStatus
    ? incompleteTasks.filter(
        (t) => normalizeStatus(t.status) === activeStatus
      )
    : incompleteTasks;

  return (
    <div className="bg-[#0a0a0f] text-gray-100 rounded-3xl shadow-2xl p-8 border border-purple-700/40 backdrop-blur-md transition-all duration-300">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Users className="text-purple-400" size={22} />
          <h2 className="text-2xl font-bold text-purple-300 tracking-wide">
            Task Summary
          </h2>
        </div>

        <select
          value={selectedUser}
          onChange={(e) => {
            setSelectedUser(e.target.value);
            setActiveStatus(null);
          }}
          className="border border-purple-600 bg-[#1a1a2e] rounded-xl px-4 py-2 text-sm text-gray-200 focus:ring-2 focus:ring-purple-500 outline-none transition"
        >
          <option value="">Select User</option>
          {assignees.map((u, i) => (
            <option key={i} value={u}>
              {u}
            </option>
          ))}
        </select>
      </div>

      {selectedUser ? (
        <>
          <div className="w-full h-96 mb-8 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  innerRadius={70}
                  dataKey="value"
                  labelLine={false}
                  label={({ name, value }) => `${name} (${value})`}
                  onClick={handleSliceClick}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        activeStatus === entry.name
                          ? "#a855f7"
                          : COLORS[index % COLORS.length]
                      }
                      stroke="#0a0a0f"
                      strokeWidth={2}
                      cursor="pointer"
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value} Tasks`, name]}
                  contentStyle={{
                    backgroundColor: "#1a1a2e",
                    borderRadius: "10px",
                    border: "1px solid #7c3aed",
                    color: "#fff",
                  }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-center">
            <div className="bg-yellow-400/10 border border-yellow-400/40 rounded-xl py-4 shadow-lg hover:shadow-yellow-400/40 transition">
              <p className="text-yellow-300 font-bold text-2xl">
                {stats.pending}
              </p>
              <p className="text-sm text-gray-400">Pending</p>
            </div>
            <div className="bg-blue-400/10 border border-blue-400/40 rounded-xl py-4 shadow-lg hover:shadow-blue-400/40 transition">
              <p className="text-blue-300 font-bold text-2xl">
                {stats.inProgress}
              </p>
              <p className="text-sm text-gray-400">In Progress</p>
            </div>
            <div className="bg-green-400/10 border border-green-400/40 rounded-xl py-4 shadow-lg hover:shadow-green-400/40 transition">
              <p className="text-green-300 font-bold text-2xl">
                {stats.resolved}
              </p>
              <p className="text-sm text-gray-400">Resolved</p>
            </div>
          </div>

          {/* Totals */}
          <div className="mt-8 text-center">
            <p className="text-gray-300 font-medium">
              Total Tasks:{" "}
              <span className="text-gray-100 font-semibold">{total}</span>
            </p>
            <p className="text-gray-300 font-medium">
              Completion Rate:{" "}
              <span className="text-green-400 font-semibold">
                {total > 0 ? ((stats.resolved / total) * 100).toFixed(1) : 0}%
              </span>
            </p>
          </div>

          {/* Incomplete Tasks */}
          <div className="mt-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="text-red-400" size={18} />
                <h3 className="text-md font-semibold text-gray-300">
                  Incomplete Tasks{" "}
                  {activeStatus && (
                    <span className="text-sm text-purple-400">
                      (Filtered: {activeStatus})
                    </span>
                  )}
                </h3>
              </div>

              {activeStatus && (
                <button
                  onClick={() => setActiveStatus(null)}
                  className="text-xs text-purple-400 hover:underline"
                >
                  Clear Filter
                </button>
              )}
            </div>

            {filteredTasks.length > 0 ? (
              <ul className="divide-y divide-purple-800 border border-purple-700/50 rounded-xl overflow-hidden">
                {filteredTasks.map((task, index) => {
                  const status = normalizeStatus(task.status);
                  const isOverdue = task.hoursAssigned >= 24;
                  return (
                    <li
                      key={index}
                      className={`p-4 flex justify-between items-center bg-[#12121c] hover:bg-[#1a1a2e] transition ${
                        isOverdue ? "border-l-4 border-red-500" : ""
                      }`}
                    >
                      <div className="flex flex-col">
                        <p className="font-medium text-gray-200">
                          {task.title || "Untitled Task"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {task.description || "No description provided"}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                          <Clock size={14} className="text-gray-400" />
                          <span>
                            {task.hoursAssigned} hrs ago{" "}
                            {isOverdue && (
                              <span className="text-red-400 font-medium ml-1">
                                (Overdue)
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          status === "Pending"
                            ? "bg-yellow-500/20 text-yellow-300"
                            : "bg-blue-500/20 text-blue-300"
                        }`}
                      >
                        {status}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 italic text-center py-4">
                No incomplete tasks ✨
              </p>
            )}
          </div>
        </>
      ) : (
        <div className="h-60 flex items-center justify-center text-gray-500 text-sm italic">
          Select a user to view their task summary
        </div>
      )}
    </div>
  );
}
    
