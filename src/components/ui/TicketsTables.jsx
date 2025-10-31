"use client";
import React, { useState, useMemo, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, Plus, MoreVertical, ArrowUpDown } from "lucide-react";
import TaskSummary from "../TaskSummary";
import { tickets as ticketData } from "../../assets/api/api";

export default function TicketsTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [statusFilter, setStatusFilter] = useState("");

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleStatusClick = useCallback((status) => {
    setStatusFilter((prev) => (prev === status ? "" : status));
  }, []);

  const filteredAndSortedTickets = useMemo(() => {
    let sorted = [...ticketData];
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        const order = sortConfig.direction === "asc" ? 1 : -1;
        const aVal = a[sortConfig.key] || "";
        const bVal = b[sortConfig.key] || "";
        if (aVal < bVal) return -1 * order;
        if (aVal > bVal) return 1 * order;
        return 0;
      });
    }

    return sorted.filter((t) => {
      const matchesSearch =
        t.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.assignee?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.status?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter
        ? t.status?.toLowerCase() === statusFilter.toLowerCase()
        : true;
      return matchesSearch && matchesStatus;
    });
  }, [sortConfig, searchTerm, statusFilter]);

  const renderSortIcon = (key) => (
    <ArrowUpDown
      size={14}
      className={`ml-1 inline transition-transform duration-200 ${
        sortConfig.key === key
          ? sortConfig.direction === "asc"
            ? "rotate-180 text-cyan-400"
            : "text-cyan-400"
          : "text-gray-500"
      }`}
    />
  );

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-950 px-8 py-10 text-gray-200">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-purple-500 bg-clip-text text-transparent animate-gradient-x">
          🎫 Ticket Overview
        </h1>

        <div className="flex gap-3 items-center">
          <div className="relative">
            <Search
              className="absolute left-3 top-2.5 text-cyan-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 text-sm rounded-lg bg-gray-900 border border-cyan-400/30 text-gray-200 focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent outline-none transition-all shadow-[0_0_12px_rgba(0,255,255,0.2)]"
            />
          </div>

          <button className="bg-gradient-to-r from-cyan-500 to-fuchsia-600 hover:opacity-90 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-[0_0_20px_rgba(255,0,255,0.3)] flex items-center transition-all duration-300">
            <Plus size={16} className="mr-1" />
            New Ticket
          </button>
        </div>
      </div>

      {/* Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* 🎟 Table */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="xl:col-span-2 bg-black/60 border border-cyan-400/20 rounded-2xl shadow-[0_0_25px_rgba(0,255,255,0.15)] overflow-hidden backdrop-blur-xl"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gradient-to-r from-cyan-600 via-fuchsia-600 to-purple-700 text-white text-xs uppercase tracking-wider">
                <tr>
                  {[
                    { key: "id", label: "ID" },
                    { key: "title", label: "Title" },
                    { key: "assignee", label: "Assignee" },
                    { key: "department", label: "Department" },
                    { key: "status", label: "Status" },
                    { key: "createdAt", label: "Created" },
                  ].map(({ key, label }) => (
                    <th
                      key={key}
                      className="py-3 px-6 text-left cursor-pointer select-none"
                      onClick={() => handleSort(key)}
                    >
                      {label} {renderSortIcon(key)}
                    </th>
                  ))}
                  <th className="py-3 px-6 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                <AnimatePresence>
                  {filteredAndSortedTickets.length > 0 ? (
                    filteredAndSortedTickets.map((ticket, index) => (
                      <motion.tr
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.25 }}
                        className="hover:bg-gray-900/60 transition-all"
                      >
                        <td className="py-3 px-6 font-semibold text-cyan-300">
                          #{ticket.id}
                        </td>
                        <td className="py-3 px-6 text-gray-200">
                          {ticket.title}
                        </td>
                        <td className="py-3 px-6 text-gray-400">
                          {ticket.assignee || "—"}
                        </td>
                        <td className="py-3 px-6 text-gray-400">
                          {ticket.department || "—"}
                        </td>
                        <td className="py-3 px-6">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              ticket.status === "Pending"
                                ? "bg-yellow-400/20 text-yellow-300 border border-yellow-400/40"
                                : ticket.status === "In Progress"
                                ? "bg-cyan-400/20 text-cyan-300 border border-cyan-400/40"
                                : "bg-green-400/20 text-green-300 border border-green-400/40"
                            }`}
                          >
                            {ticket.status}
                          </span>
                        </td>
                        <td className="py-3 px-6 text-xs text-gray-500">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-6 text-center">
                          <button className="p-1 hover:bg-gray-800 rounded transition">
                            <MoreVertical size={16} className="text-cyan-400" />
                          </button>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="7"
                        className="text-center text-gray-500 py-6"
                      >
                        No tickets found
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* 📊 Task Summary */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="col-span-1 bg-black/60 rounded-2xl border border-fuchsia-500/20 p-6 shadow-[0_0_25px_rgba(255,0,255,0.15)] backdrop-blur-xl"
        >
          <TaskSummary
            tickets={filteredAndSortedTickets}
            onStatusClick={handleStatusClick}
            activeStatus={statusFilter}
          />
        </motion.div>
      </div>
    </div>
  );
}
