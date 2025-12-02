"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import { Clock, Download, MoreVertical } from "lucide-react";

export default function TicketColumn({
  title,
  color,
  dotColor,
  headerColor,
  tickets = [],
  onTicketClick,
  onResolve,
  onStart,
  onView,
  userId        // ← USER ID ADDED
}) {
  const [openMenuFor, setOpenMenuFor] = useState(null);
  const menuRef = useRef(null);

  /* ---------------------------------------
     CLOSE MENU WHEN CLICKING OUTSIDE
  ---------------------------------------- */
  useEffect(() => {
    function handleOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuFor(null);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  /* ---------------------------------------
     EXPORT CSV
  ---------------------------------------- */
  const exportCSV = () => {
    if (!tickets.length) return;

    const headers = [
      "ID",
      "UserID",
      "Service",
      "Priority",
      "Status",
      "AssignedTo",
      "EstimatedTime",
      "CompletedTime"
    ];

    const rows = tickets.map((t) => [
      t.id,
      t.userId || userId || "N/A",
      t.service,
      t.priority,
      t.status,
      t.assignedTo,
      t.estimatedTime,
      t.completedTime
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${title.replace(/\s+/g, "_")}_tickets.csv`;
    link.click();
  };

  /* ---------------------------------------
     RENDER UI
  ---------------------------------------- */
  return (
    <div className={`rounded-2xl border ${color} bg-white/90 shadow-lg`}>

      {/* HEADER */}
      <div className={`p-4 rounded-t-2xl font-bold ${headerColor} flex justify-between items-center`}>
        <span>
          {title} ({tickets.length})
        </span>

        <button
          onClick={exportCSV}
          className="flex items-center gap-1 text-xs bg-white/40 backdrop-blur px-2 py-1 rounded-md shadow hover:bg-white hover:scale-105 transition"
        >
          <Download size={14} />
          Export
        </button>
      </div>

      {/* TICKET LIST */}
      <div className="p-4 space-y-3">
        {tickets.length ? (
          <Reorder.Group axis="y" values={tickets} onReorder={() => {}}>
            {tickets.map((t) => {
              const remainingTime = t.estimatedTime - t.completedTime;

              return (
                <Reorder.Item key={t.id} value={t}>
                  <div className="relative">

                    {/* MENU ICON */}
                    <button
                      className="absolute right-2 top-2 p-1 rounded hover:bg-gray-200 transition"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuFor(openMenuFor === t.id ? null : t.id);
                      }}
                    >
                      <MoreVertical size={16} className="text-gray-600" />
                    </button>

                    {/* TICKET CARD */}
                    <motion.div
                      layout
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onTicketClick?.(t)}
                      className="cursor-pointer p-3 rounded-xl bg-white border border-gray-200 shadow-sm flex flex-col gap-1 hover:shadow-md transition"
                    >
                      <div className="flex justify-between items-center text-sm font-medium text-indigo-700">
                        {t.id}

                        {/* DOT COLOR */}
                        <span className={`h-2.5 w-2.5 rounded-full ${dotColor}`} />
                      </div>

                      <div className="text-gray-800 font-semibold">
                        {t.service}
                      </div>

                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>{t.priority}</span>

                        <span>
                          <Clock size={12} className="inline mr-1" />
                          {t.status === "Resolved"
                            ? `${t.completedTime}h`
                            : `${remainingTime}h left`}
                        </span>
                      </div>

                      <div className="text-xs text-gray-400">
                        {t.assignedTo || "Unassigned"}
                      </div>

                      <div className="text-[10px] text-gray-400">
                        User ID: {t.userId || userId || "Unknown"}
                      </div>
                    </motion.div>

                    {/* MENU VIEW */}
                    <AnimatePresence>
                      {openMenuFor === t.id && (
                        <motion.div
                          ref={menuRef}
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          className="absolute right-0 top-8 bg-slate-900/90 p-2 rounded-md border border-cyan-500/10 z-50"
                        >
                          <div className="flex flex-col gap-2 text-xs">

                            <button
                              onClick={() => {
                                onView?.(t.id);
                                setOpenMenuFor(null);
                              }}
                              className="px-3 py-1 rounded-md bg-cyan-700 text-white"
                            >
                              View
                            </button>

                            <button
                              onClick={() => {
                                onResolve?.(t.id);
                                setOpenMenuFor(null);
                              }}
                              className="px-3 py-1 rounded-md bg-green-600 text-white"
                            >
                              Resolve
                            </button>

                            <button
                              onClick={() => {
                                onStart?.(t.id);
                                setOpenMenuFor(null);
                              }}
                              className="px-3 py-1 rounded-md bg-yellow-600 text-white"
                            >
                              Start
                            </button>

                            <button
                              onClick={() => setOpenMenuFor(null)}
                              className="px-3 py-1 rounded-md bg-gray-700 text-white"
                            >
                              Close
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Reorder.Item>
              );
            })}
          </Reorder.Group>
        ) : (
          <p className="text-center text-gray-400 text-sm mt-4">No tickets</p>
        )}
      </div>
    </div>
  );
}
