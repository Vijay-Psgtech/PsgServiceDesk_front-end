"use client";
import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X } from "lucide-react";

// Utility
const formatDate = (d) => new Date(d).toLocaleString();

/* ============================
   UserReports Component
   ============================ */
export default function UserReports() {
  const [tickets, setTickets] = useState([]);
  const [blockStats, setBlockStats] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState(null);

  // Load tickets from localStorage (shared with UserDashboard)
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("tickets") || "[]");
    setTickets(stored);
  }, []);

  // Compute block-wise stats
  useEffect(() => {
    const blockMap = {};
    for (const t of tickets) {
      const block = t.block || "Unknown";
      if (!blockMap[block]) blockMap[block] = { block, open: 0, resolved: 0, tickets: [] };
      blockMap[block].tickets.push(t);
      if (t.status === "Resolved") blockMap[block].resolved++;
      else blockMap[block].open++;
    }
    setBlockStats(Object.values(blockMap));
  }, [tickets]);

  // Export to CSV
  const exportCSV = () => {
    const header = "Block,Open,Resolved,Total\n";
    const rows = blockStats
      .map((b) => `${b.block},${b.open},${b.resolved},${b.open + b.resolved}`)
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "block_report.csv";
    a.click();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-cyan-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">📊 User Reports & Analytics</h1>
        <button
          onClick={exportCSV}
          className="px-3 py-2 rounded-md bg-cyan-600 text-white flex items-center gap-2"
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Chart Section */}
      <div className="bg-slate-800/40 p-4 rounded-xl mb-6 border border-slate-700/40">
        <h2 className="text-lg font-medium mb-3">Ticket Count per Block (Open vs Resolved)</h2>
        {blockStats.length ? (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={blockStats}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="block" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="open" stackId="a" fill="#F97316" name="Open Tickets" />
              <Bar dataKey="resolved" stackId="a" fill="#22C55E" name="Resolved Tickets" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="opacity-70 text-sm">No ticket data available.</div>
        )}
      </div>

      {/* Block Summary */}
      <div className="grid md:grid-cols-2 gap-4">
        {blockStats.map((b) => (
          <div
            key={b.block}
            className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/30"
          >
            <div className="font-semibold mb-1">{b.block}</div>
            <div className="text-sm opacity-80">
              Total: {b.open + b.resolved} — Open: {b.open}, Resolved: {b.resolved}
            </div>
            <button
              onClick={() => setSelectedBlock(b)}
              className="mt-3 px-3 py-1 rounded-md bg-cyan-600 text-white text-sm"
            >
              View Detailed Tickets
            </button>
          </div>
        ))}
      </div>

      {/* Block Detail Modal */}
      <AnimatePresence>
        {selectedBlock && (
          <motion.div
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-slate-900 text-cyan-100 p-6 rounded-2xl w-full max-w-3xl border border-slate-700/20 shadow-2xl overflow-auto max-h-[90vh]"
              initial={{ scale: 0.96 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.96 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">
                  {selectedBlock.block} — Tickets ({selectedBlock.tickets.length})
                </h2>
                <button
                  onClick={() => setSelectedBlock(null)}
                  className="px-2 py-1 rounded-md bg-slate-800/40"
                >
                  <X />
                </button>
              </div>

              {selectedBlock.tickets.length ? (
                <div className="space-y-2 text-sm">
                  {selectedBlock.tickets.map((t) => (
                    <div
                      key={t.id}
                      className="border-b border-slate-700/20 pb-2 mb-2"
                    >
                      <div className="font-medium">
                        #{t.id} — {t.service || "Unknown Service"}
                      </div>
                      <div className="opacity-80">
                        {t.priority} priority • {t.status}
                      </div>
                      <div className="opacity-60 text-xs">
                        Created: {formatDate(t.createdOn)}{" "}
                        {t.resolvedOn && (
                          <>• Resolved: {formatDate(t.resolvedOn)}</>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="opacity-70 text-sm">No tickets in this block.</div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
       </div>
  );
}
