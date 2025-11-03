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
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import dayjs from "dayjs";

/* ===========================
   Part 1 — Data, helpers & hooks
   (single-user focused)
   =========================== */

// LocalStorage Keys
const LS_TICKETS = "ud_tickets_v1";       // tickets for this user
const LS_THEME = "ud_theme_v1";           // dark/light
const LS_LEAVES = "ud_leaves_v1";         // planned leaves (array)
const LS_ACTIVITY = "ud_activity_v1";     // activity log

// Sample seeded tickets (only if none in storage)
function seedTickets() {
  const now = new Date();
  const seed = [
    {
      id: `IT${Date.now().toString().slice(-6)}A`,
      service: "COMPUTER ISSUE",
      department: "IT Services",
      category: "Service",
      asset: "System-09",
      priority: "High",
      status: "Open",
      createdOn: dayjs().subtract(3, "day").toISOString(),
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
      createdOn: dayjs().subtract(6, "day").toISOString(),
      resolvedOn: dayjs().subtract(4, "day").toISOString(),
      issue: "Paper jam",
    },
  ];
  safeSave(LS_TICKETS, seed);
  return seed;
}

function safeLoad(key) {
  try {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}
function safeSave(key, v) {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, JSON.stringify(v));
  } catch (e) {}
}

const COLORS = {
  Open: "#6b46c1",
  "In Progress": "#f59e0b",
  Resolved: "#10b981",
};

/* ===========================
   Part 2 — Component
   =========================== */

export default function UserDashboard() {
  // ---------- SINGLE USER (current) ----------
  // In this simplified version there's only one "user" — the person using the dashboard.
  // We keep a small currentUser object for display/assignment purposes.
  const currentUser = useMemo(
    () => ({
      id: "S10453",
      userId: "S10453",
      name: "Sarath",
      department: "IT Services",
      email: "sarath@example.com",
    }),
    []
  );

  // ---------- persisted state ----------
  const [tickets, setTickets] = useState(() => safeLoad(LS_TICKETS) ?? seedTickets());
  const [theme, setTheme] = useState(() => {
    try {
      const s = safeLoad(LS_THEME);
      if (s) return s;
      if (typeof window !== "undefined" && window.matchMedia) {
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      }
      return "light";
    } catch {
      return "light";
    }
  });
  const [leaves, setLeaves] = useState(() => safeLoad(LS_LEAVES) ?? []); // array of { id, from, to, reason, manager }
  const [activityLog, setActivityLog] = useState(() => safeLoad(LS_ACTIVITY) ?? []);

  // ---------- UI state ----------
  const [view, setView] = useState(() => (typeof window !== "undefined" ? (localStorage.getItem("ud_view_pref") || "kanban") : "kanban"));
  const [createOpen, setCreateOpen] = useState(false);
  const [openMenuFor, setOpenMenuFor] = useState(null);
  const menuRef = useRef(null);
  const [detailView, setDetailView] = useState(null);
  const [searchQ, setSearchQ] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const perPage = 12;
  const [shortView, setShortView] = useState(false);

  // form state for creating/updating ticket
  const [form, setForm] = useState({
    category: "",
    service: "",
    department: currentUser.department,
    asset: "",
    priority: "Low",
    issue: "",
    files: [],
  });

  // watch and persist changes
  useEffect(() => safeSave(LS_TICKETS, tickets), [tickets]);
  useEffect(() => safeSave(LS_THEME, theme), [theme]);
  useEffect(() => safeSave(LS_LEAVES, leaves), [leaves]);
  useEffect(() => safeSave(LS_ACTIVITY, activityLog), [activityLog]);

  // apply theme class to root (Tailwind class strategy)
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

  // small helpers
  const columns = ["Open", "In Progress", "Resolved"];
  const myTickets = useMemo(() => tickets.slice(), [tickets]); // all tickets belong to current user in this simplified app

  const kanban = useMemo(() => {
    const map = { Open: [], "In Progress": [], Resolved: [] };
    myTickets.forEach((t) => (map[t.status] ?? map.Open).push(t));
    return map;
  }, [myTickets]);

  const pieData = useMemo(() => columns.map((c) => ({ name: c, value: kanban[c]?.length || 0 })), [kanban]);

  // filtering / paging for table
  const filtered = useMemo(() => {
    const q = (searchQ || "").trim().toLowerCase();
    let arr = myTickets.slice();
    if (deptFilter !== "All") arr = arr.filter((t) => (t.department || "").toLowerCase() === (deptFilter || "").toLowerCase());
    if (statusFilter !== "All") arr = arr.filter((t) => (t.status || "").toLowerCase() === (statusFilter || "").toLowerCase());
    if (q) arr = arr.filter((t) => [t.id, t.service, t.asset, t.issue].some((v) => (v || "").toLowerCase().includes(q)));
    arr.sort((a, b) => new Date(b.createdOn) - new Date(a.createdOn));
    return arr;
  }, [myTickets, searchQ, deptFilter, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / perPage));
  useEffect(() => {
    if (page > pageCount) setPage(1);
  }, [page, pageCount]);
  const pageItems = filtered.slice((page - 1) * perPage, page * perPage);

  // formatting helpers
  const format = (d) => (d ? dayjs(d).format("DD/MM/YYYY HH:mm") : "-");
  const totalTime = (t) => {
    const start = dayjs(t.createdOn);
    const end = t.resolvedOn ? dayjs(t.resolvedOn) : dayjs();
    const diff = end.diff(start, "minute");
    return `${Math.floor(diff / 60)}h ${diff % 60}m`;
  };

  // actions that also log activity
  const logActivity = (message) => {
    const entry = `${dayjs().format("YYYY-MM-DD HH:mm")} — ${message}`;
    setActivityLog((p) => [entry, ...p].slice(0, 200));
  };

  const createTicket = (payload) => {
    const ticket = {
      id: `IT${Date.now().toString().slice(-6)}`,
      ...payload,
      createdOn: new Date().toISOString(),
      status: "Open",
    };
    setTickets((p) => [ticket, ...p]);
    logActivity(`Created ticket ${ticket.id} (${ticket.service})`);
  };

  const resolveTicket = (id) => {
    setTickets((p) => p.map((t) => (t.id === id ? { ...t, status: "Resolved", resolvedOn: new Date().toISOString() } : t)));
    logActivity(`Resolved ticket ${id}`);
  };

  const updateTicket = (id, patch) => {
    setTickets((p) => p.map((t) => (t.id === id ? { ...t, ...patch } : t)));
    logActivity(`Updated ticket ${id}`);
  };

  // Leave management (multiple future leaves)
  const addLeave = ({ from, to, reason, manager }) => {
    // validation: ensure 'from' <= 'to' and dates in future or today
    const fromDate = dayjs(from);
    const toDate = dayjs(to);
    if (!fromDate.isValid() || !toDate.isValid() || toDate.isBefore(fromDate)) {
      alert("Please provide a valid date range (to must be same or after from).");
      return;
    }
    const newLeave = {
      id: `L${Date.now().toString().slice(-6)}`,
      from: fromDate.toISOString(),
      to: toDate.toISOString(),
      reason: reason || "No reason provided",
      manager: manager || "Not provided",
      createdOn: new Date().toISOString(),
    };
    setLeaves((p) => [newLeave, ...p]);
    logActivity(`Planned leave (${dayjs(newLeave.from).format("DD/MM")} → ${dayjs(newLeave.to).format("DD/MM")})`);
  };

  const removeLeave = (id) => {
    setLeaves((p) => p.filter((l) => l.id !== id));
    logActivity(`Removed planned leave ${id}`);
  };

  // CSV export for the user's tickets
  const exportMyTicketsCSV = () => {
    if (!tickets.length) {
      alert("No tickets to export.");
      return;
    }
    const rows = tickets.map((t) => ({ id: t.id, service: t.service, status: t.status, department: t.department, createdOn: t.createdOn, resolvedOn: t.resolvedOn || "" }));
    const headers = Object.keys(rows[0]);
    const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => `"${String(r[h] ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tickets_${currentUser.userId}_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // small UI helpers
  const departments = Array.from(new Set(tickets.map((t) => t.department).filter(Boolean)));
  if (!departments.length) departments.push(currentUser.department);

  // ---------- Create / form submit ----------
  const handleCreateSubmit = (e) => {
    e.preventDefault();
    createTicket({
      ...form,
      department: form.department || currentUser.department,
    });
    setCreateOpen(false);
    // reset form
    setForm({
      category: "",
      service: "",
      department: currentUser.department,
      asset: "",
      priority: "Low",
      issue: "",
      files: [],
    });
  };

  // drag/drop helpers
  const onCardDragStart = (e, id) => e.dataTransfer.setData("ticketId", id);
  const onColumnDragOver = (e) => e.preventDefault();
  const onColumnDrop = (e, status) => {
    const id = e.dataTransfer.getData("ticketId");
    if (!id) return;
    updateTicket(id, { status });
  };

  /* ===========================
     Part 2 — Render / UI
     =========================== */

  return (
    <div className={`relative min-h-screen ${theme === "dark" ? "bg-gradient-to-br from-slate-900 via-blue-950 to-black text-cyan-100" : "bg-white text-slate-900"} p-6`}>
      {/* top controls */}
      <div className="flex justify-end items-center gap-3 mb-4">
        <button
          onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
          className="flex items-center gap-2 px-3 py-2 rounded-md bg-slate-800/70 hover:bg-slate-800/60"
          title="Toggle theme"
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />} {theme === "dark" ? "Light" : "Dark"}
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
          <p className="text-sm opacity-80 mt-1">Viewing your tickets & activity</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900/60 border border-cyan-500/10 rounded-lg px-3 py-2">
            <Search size={16} />
            <input placeholder="Search..." value={searchQ} onChange={(e) => setSearchQ(e.target.value)} className="bg-transparent outline-none text-sm" />
          </div>

          <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="rounded-md px-3 py-2">
            <option>All</option>
            {departments.map((d) => <option key={d}>{d}</option>)}
          </select>

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-md px-3 py-2">
            <option>All</option>
            <option>Open</option>
            <option>In Progress</option>
            <option>Resolved</option>
          </select>

          <button onClick={() => { setView((v) => (v === "kanban" ? "table" : "kanban")); localStorage.setItem("ud_view_pref", view === "kanban" ? "table" : "kanban"); }} className="px-3 py-2 rounded-md bg-slate-900/60">
            {view === "kanban" ? <Grid size={16} /> : <List size={16} />}
          </button>

          <button onClick={() => setCreateOpen(true)} className="px-4 py-2 rounded-md bg-cyan-600 text-white flex items-center gap-2">
            <Plus size={16} /> Create
          </button>
        </div>
      </header>

      {/* layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* main column */}
        <div className="lg:col-span-3">
          {view === "kanban" ? (
            <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-6">
              {columns.map((col) => (
                <div key={col} className="flex-1 bg-slate-800/30 rounded-2xl p-4" onDragOver={onColumnDragOver} onDrop={(e) => onColumnDrop(e, col)}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span style={{ width: 10, height: 10, background: COLORS[col], borderRadius: 99 }} />
                      <h3 className="text-sm font-semibold">{col}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-900/20">{kanban[col].length}</span>
                    </div>
                  </div>

                  <div className="space-y-4 max-h-[64vh] overflow-y-auto pr-2">
                    {kanban[col].map((t) => (
                      <div key={t.id} draggable onDragStart={(e) => onCardDragStart(e, t.id)} className="bg-slate-900/50 rounded-lg p-4 shadow-sm border border-slate-800/20 hover:shadow-md">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-xs font-semibold mb-1">
                              {t.priority === "High" ? <span className="px-2 py-1 rounded text-xs bg-red-900/10 text-red-300">{t.priority}</span> : <span className="px-2 py-1 rounded text-xs bg-slate-800/10">{t.priority}</span>}
                            </div>
                            <div className="text-sm font-bold">#{t.id}</div>
                            <div className="text-xs opacity-70">{t.department} • {t.service}</div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <button className="p-2 rounded-md hover:bg-slate-800/30" onClick={() => setOpenMenuFor(t.id)}>
                              <MoreHorizontal size={16} />
                            </button>
                          </div>
                        </div>

                        {/* inline menu */}
                        <AnimatePresence>
                          {openMenuFor === t.id && (
                            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} ref={menuRef} className="mt-3 bg-slate-900/90 p-2 rounded-md border border-cyan-500/10">
                              <div className="flex items-center gap-2">
                                <button onClick={() => { setDetailView(t.id); setOpenMenuFor(null); }} className="text-xs px-2 py-1 rounded-md bg-cyan-700">View</button>
                                <button onClick={() => { resolveTicket(t.id); setOpenMenuFor(null); }} className="text-xs px-2 py-1 rounded-md bg-green-600">Resolve</button>
                                <button onClick={() => { updateTicket(t.id, { status: "In Progress" }); setOpenMenuFor(null); }} className="text-xs px-2 py-1 rounded-md bg-yellow-600">Start</button>
                                <button onClick={() => setOpenMenuFor(null)} className="text-xs px-2 py-1 rounded-md">Close</button>
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
            <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-800/30 rounded-2xl p-4">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="text-xs uppercase bg-slate-900/20">
                    <tr>
                      <th className="px-4 py-3 text-left">Ticket ID</th>
                      <th className="px-4 py-3 text-left">Department</th>
                      <th className="px-4 py-3 text-left">Service</th>
                      <th className="px-4 py-3 text-left">Priority</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Created On</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageItems.map((t) => (
                      <tr key={t.id} className="border-b border-slate-800/10 hover:bg-slate-900/10">
                        <td className="px-4 py-3">{t.id}</td>
                        <td className="px-4 py-3">{t.department}</td>
                        <td className="px-4 py-3">{t.service}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs border ${t.priority === "High" ? "border-red-400/40 text-red-300" : t.priority === "Medium" ? "border-yellow-400/40 text-yellow-300" : "border-green-400/40 text-green-300"}`}>{t.priority}</span>
                        </td>
                        <td className="px-4 py-3"><span style={{ color: COLORS[t.status] }}>{t.status}</span></td>
                        <td className="px-4 py-3">{format(t.createdOn)}</td>
                        <td className="px-4 py-3 text-right relative">
                          <button onClick={() => setOpenMenuFor((id) => (id === t.id ? null : t.id))} className="p-2 rounded-md hover:bg-slate-800/30">
                            <MoreHorizontal size={18} />
                          </button>
                          <AnimatePresence>
                            {openMenuFor === t.id && (
                              <motion.div ref={menuRef} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="absolute right-0 mt-2 w-56 bg-slate-900/95 border rounded-md shadow-lg p-3 z-30">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="text-sm font-medium">My Ticket</div>
                                  <div className="text-xs opacity-70">{totalTime(t)}</div>
                                </div>
                                <div className="space-y-2">
                                  <button onClick={() => { setDetailView(t.id); setOpenMenuFor(null); }} className="w-full text-left px-2 py-1 rounded-md bg-slate-800/60">View</button>
                                  <button onClick={() => { resolveTicket(t.id); setOpenMenuFor(null); }} className="w-full text-left px-2 py-1 rounded-md bg-green-600">Resolve</button>
                                  <button onClick={() => { updateTicket(t.id, { status: "In Progress" }); setOpenMenuFor(null); }} className="w-full text-left px-2 py-1 rounded-md bg-yellow-600">Start</button>
                                  <button onClick={() => setOpenMenuFor(null)} className="w-full text-left px-2 py-1 rounded-md">Close</button>
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
                <div className="text-xs opacity-70">Rows per page: {perPage} • Page {page} / {pageCount}</div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1 rounded-md bg-slate-900/40">Prev</button>
                  <button onClick={() => setPage((p) => Math.min(pageCount, p + 1))} className="px-3 py-1 rounded-md bg-slate-900/40">Next</button>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* right column: activity, leaves, charts */}
        <aside className="p-4 bg-slate-800/30 rounded-2xl border border-slate-700/20">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium">Activity & Overview</h4>
            <button onClick={() => { setSearchQ(""); setDeptFilter("All"); setStatusFilter("All"); }} className="text-xs px-2 py-1 rounded-md bg-slate-900/40">Reset</button>
          </div>

          {/* small pie */}
          <div className="h-44 mb-3">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} innerRadius={28} label>
                  {pieData.map((entry, i) => <Cell key={i} fill={COLORS[entry.name]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* counts */}
          <div className="text-sm mb-3">
            <div className="flex items-center justify-between text-xs mb-2">
              <div className="flex items-center gap-2">
                <span style={{ width: 10, height: 10, background: COLORS.Open, borderRadius: 99 }} /> Open
              </div>
              <div>{kanban.Open.length}</div>
            </div>
            <div className="flex items-center justify-between text-xs mb-2">
              <div className="flex items-center gap-2">
                <span style={{ width: 10, height: 10, background: COLORS["In Progress"], borderRadius: 99 }} /> In Progress
              </div>
              <div>{kanban["In Progress"].length}</div>
            </div>
            <div className="flex items-center justify-between text-xs mb-2">
              <div className="flex items-center gap-2">
                <span style={{ width: 10, height: 10, background: COLORS.Resolved, borderRadius: 99 }} /> Resolved
              </div>
              <div>{kanban.Resolved.length}</div>
            </div>
          </div>

          {/* avg resolution time */}
          <div className="text-xs mb-3">
            <div className="font-medium">Avg Resolution Time</div>
            <div className="opacity-80 text-sm">
              {(() => {
                const resolved = tickets.filter((t) => t.resolvedOn);
                if (!resolved.length) return "—";
                const mins = resolved.reduce((sum, t) => sum + dayjs(t.resolvedOn).diff(dayjs(t.createdOn), "minute"), 0);
                const avg = Math.round(mins / resolved.length);
                return `${Math.floor(avg / 60)}h ${avg % 60}m`;
              })()}
            </div>
          </div>

          <div className="flex flex-col gap-2 mb-3">
            <button onClick={exportMyTicketsCSV} className="px-3 py-2 rounded-md bg-cyan-600 text-white flex items-center gap-2 justify-center"><Download size={14} /> Export My Tickets</button>
          </div>

          {/* Leaves panel */}
          <div className="mt-2">
            <h5 className="text-sm font-medium mb-2">Planned Leaves</h5>

            {/* add leave mini-form */}
            <AddLeaveForm onAdd={(vals) => addLeave(vals)} />

            <div className="max-h-36 overflow-y-auto mt-3 text-xs">
              {leaves.length ? leaves.map((l) => (
                <div key={l.id} className="py-2 border-b border-slate-700/10 flex items-start justify-between">
                  <div>
                    <div className="font-semibold">{dayjs(l.from).format("DD MMM YYYY")} → {dayjs(l.to).format("DD MMM YYYY")}</div>
                    <div className="opacity-70">{l.reason}</div>
                    <div className="text-[11px] opacity-60 mt-1">Manager: {l.manager}</div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-[11px] opacity-70">{dayjs(l.createdOn).format("DD/MM HH:mm")}</div>
                    <button onClick={() => removeLeave(l.id)} className="px-2 py-1 rounded-md bg-red-600 text-[12px]">Remove</button>
                  </div>
                </div>
              )) : <div className="opacity-60 text-xs">No planned leaves</div>}
            </div>
          </div>

          {/* recent activity */}
          <div className="mt-4">
            <h5 className="text-sm font-medium mb-2">Recent Activity</h5>
            <div className="max-h-40 overflow-y-auto text-xs opacity-80">
              {activityLog.length ? activityLog.slice(0, 8).map((a, i) => <div key={i} className="py-1 border-b border-slate-700/10">{a}</div>) : <div className="opacity-60">No activity yet</div>}
            </div>
          </div>
        </aside>
      </div>

      {/* Ticket detail modal */}
      <AnimatePresence>
        {detailView && (
          <motion.div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-slate-900 text-cyan-100 p-6 rounded-2xl w-full max-w-3xl border border-slate-700/20 shadow-2xl" initial={{ scale: 0.98 }} animate={{ scale: 1 }} exit={{ scale: 0.98 }}>
              {(() => {
                const t = tickets.find((x) => x.id === detailView);
                if (!t) return <div>Ticket not found</div>;
                return (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold">Ticket: {t.id}</h2>
                      <button onClick={() => setDetailView(null)} className="px-2 py-1 rounded-md bg-slate-800/40"><X /></button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div><b>Service:</b> {t.service}</div>
                      <div><b>Department:</b> {t.department}</div>
                      <div><b>Priority:</b> {t.priority}</div>
                      <div><b>Status:</b> {t.status}</div>
                      <div><b>Created On:</b> {format(t.createdOn)}</div>
                      {t.resolvedOn && <div><b>Resolved On:</b> {format(t.resolvedOn)}</div>}
                    </div>

                    <div className="mt-4">
                      <h3 className="font-medium">Issue</h3>
                      <p className="opacity-80">{t.issue || "No details provided."}</p>
                    </div>

                    <div className="mt-4 flex justify-end gap-2">
                      {t.status !== "Resolved" && <button onClick={() => { resolveTicket(t.id); setDetailView(null); }} className="px-3 py-2 rounded-md bg-green-600">Resolve</button>}
                      <button onClick={() => setDetailView(null)} className="px-3 py-2 rounded-md bg-slate-800/40">Close</button>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Ticket Modal */}
      <AnimatePresence>
        {createOpen && (
          <motion.div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-slate-900 text-cyan-100 p-6 rounded-2xl w-full max-w-5xl border border-slate-700/20 shadow-2xl overflow-auto max-h-[92vh]" initial={{ scale: 0.98 }} animate={{ scale: 1 }} exit={{ scale: 0.98 }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2"><FileUp /> Ticket Creation</h2>
                <div className="flex items-center gap-2">
                  <button onClick={() => { setCreateOpen(false); setForm({ ...form, files: [] }); }} className="px-3 py-1 rounded-md bg-slate-800/40"><X /></button>
                </div>
              </div>

              <form onSubmit={handleCreateSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="block text-sm">Category *</label>
                  <select required value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="w-full p-2 rounded-md bg-slate-800/40">
                    <option value="">Select Category</option>
                    <option>Service</option>
                    <option>Incident</option>
                    <option>Request</option>
                  </select>

                  <label className="block text-sm">Service *</label>
                  <select required value={form.service} onChange={(e) => setForm((f) => ({ ...f, service: e.target.value }))} className="w-full p-2 rounded-md bg-slate-800/40">
                    <option value="">Select Service</option>
                    <option>Computer Issue</option>
                    <option>Printer Issue</option>
                    <option>Network Support</option>
                  </select>

                  <label className="block text-sm">Issue</label>
                  <textarea rows={4} value={form.issue} onChange={(e) => setForm((f) => ({ ...f, issue: e.target.value }))} className="w-full p-2 rounded-md bg-slate-800/40" />

                  <label className="block text-sm">Files</label>
                  <input type="file" multiple onChange={(e) => setForm((f) => ({ ...f, files: Array.from(e.target.files).map((x) => x.name) }))} className="w-full p-2 bg-slate-800/40 rounded-md" />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm">Department *</label>
                  <select required value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))} className="w-full p-2 rounded-md bg-slate-800/40">
                    <option value="IT Services">IT Services</option>
                    <option value="Facilities">Facilities</option>
                    <option value="HR">HR</option>
                    <option value="Finance">Finance</option>
                  </select>

                  <label className="block text-sm">Asset *</label>
                  <input required value={form.asset} onChange={(e) => setForm((f) => ({ ...f, asset: e.target.value }))} className="w-full p-2 rounded-md bg-slate-800/40" />

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm">Priority</label>
                      <select value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))} className="w-full p-2 rounded-md bg-slate-800/40">
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm">Expected Closing Days</label>
                      <input type="number" value={form.closingDays} onChange={(e) => setForm((f) => ({ ...f, closingDays: e.target.value }))} className="w-full p-2 rounded-md bg-slate-800/40" />
                    </div>
                  </div>

                  <div className="text-xs opacity-70">Ticket will be assigned to you: <b>{currentUser.userId} - {currentUser.name}</b></div>
                </div>

                <div className="md:col-span-2 flex justify-end gap-3 pt-3">
                  <button type="button" onClick={() => setCreateOpen(false)} className="px-4 py-2 rounded-md bg-slate-900/40">Cancel</button>
                  <button type="submit" className="px-4 py-2 rounded-md bg-cyan-600 flex items-center gap-2"><CheckCircle2 /> Submit</button>
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
   Helper sub-component: AddLeaveForm
   (keeps main file tidy)
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
        <input required value={from} onChange={(e) => setFrom(e.target.value)} type="date" className="p-2 rounded-md bg-slate-800/40 text-sm" />
        <input required value={to} onChange={(e) => setTo(e.target.value)} type="date" className="p-2 rounded-md bg-slate-800/40 text-sm" />
      </div>
      <input placeholder="Manager name (required)" required value={manager} onChange={(e) => setManager(e.target.value)} className="w-full p-2 rounded-md bg-slate-800/40 text-sm" />
      <input placeholder="Reason" value={reason} onChange={(e) => setReason(e.target.value)} className="w-full p-2 rounded-md bg-slate-800/40 text-sm" />
      <div className="flex justify-end">
        <button type="submit" className="px-3 py-1 rounded-md bg-yellow-600 text-xs">Add Leave</button>
      </div>
    </form>
  );
}

      