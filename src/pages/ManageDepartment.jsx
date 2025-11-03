"use client";
import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  Edit3,
  Plus,
  Trash,
  User,
  Settings,
  X,
} from "lucide-react";

/**
 * Full-screen Dark Neon DepartmentDetails
 * - Keeps all original logic and features
 * - Restyled: dark background, electric-blue neon accents, subtle glow shadows
 * - Framer motion animations retained
 *
 * Usage:
 * <DepartmentDetails initialDepartment={optionalDeptObject} />
 */

function SimpleModal({ open, onClose, title, children, footer }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ y: 18, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 18, scale: 0.98 }}
            transition={{ type: "spring", damping: 20, stiffness: 240 }}
            className="w-full max-w-3xl bg-[#07101a] border border-blue-500/20 rounded-2xl shadow-[0_8px_40px_rgba(0,150,255,0.08)] p-6 text-gray-100"
          >
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-blue-500/10">
              <h3 className="text-lg font-semibold text-blue-300">{title}</h3>
              <button
                onClick={onClose}
                aria-label="close"
                className="p-1 text-gray-300 hover:text-blue-300"
              >
                <X size={18} />
              </button>
            </div>

            <div className="text-sm text-gray-200">{children}</div>

            {footer && <div className="mt-6 flex justify-end gap-3">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function DepartmentDetails({ initialDepartment }) {
  const defaultDept = {
    id: "IT",
    name: "IT Services",
    services: [
      "INTERNET NOT WORKING",
      "TONER REFILLING",
      "LAPTOP PROBLEM",
      "WI-FI ISSUES",
      "COMPUTER ISSUES",
      "EMAIL ID",
      "WEB HOSTING",
      "SERVER ISSUES",
      "SOFTWARE SUPPORT",
      "CCTV ISSUES",
      "NETWORK SUPPORT",
      "PROJECTOR ISSUES",
      "PRINTER ISSUE",
    ],
    escalation: { durationDays: 3, level1: "", level2: "", level3: "" },
    members: [
      {
        id: "u1",
        name: "Venugopal R",
        role: "Department-Admin",
        services: [],
      },
      {
        id: "u2",
        name: "ABINESH J - S10452",
        role: "Member",
        services: [
          "INTERNET NOT WORKING",
          "LAPTOP PROBLEM",
          "COMPUTER ISSUES",
          "SOFTWARE SUPPORT",
        ],
      },
    ],
  };

  const [dept, setDept] = useState(initialDepartment ?? defaultDept);

  // collapse state
  const [openServices, setOpenServices] = useState(true);
  const [openEscalation, setOpenEscalation] = useState(true);
  const [openMembers, setOpenMembers] = useState(true);

  // edit states
  const [servicesEditingInline, setServicesEditingInline] = useState(false);
  const [escEditingInline, setEscEditingInline] = useState(false);

  // modals
  const [servicesModalOpen, setServicesModalOpen] = useState(false);
  const [escModalOpen, setEscModalOpen] = useState(false);
  const [memberModalOpen, setMemberModalOpen] = useState(false);

  // buffers
  const [servicesBuffer, setServicesBuffer] = useState([...dept.services]);
  const [newService, setNewService] = useState("");
  const [escBuffer, setEscBuffer] = useState({ ...dept.escalation });
  const [editingMember, setEditingMember] = useState(null);

  // search
  const [memberSearch, setMemberSearch] = useState("");

  const filteredMembers = useMemo(() => {
    if (!memberSearch.trim()) return dept.members;
    const q = memberSearch.toLowerCase();
    return dept.members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        (m.role && m.role.toLowerCase().includes(q)) ||
        (m.services || []).some((s) => s.toLowerCase().includes(q))
    );
  }, [dept.members, memberSearch]);

  // ---------- Services handlers ----------
  const addServiceInline = (txt) => {
    const s = String(txt || "").trim().toUpperCase();
    if (!s) return;
    if (dept.services.includes(s)) return;
    setDept((d) => ({ ...d, services: [...d.services, s] }));
  };

  const removeServiceInline = (svc) => {
    setDept((d) => ({
      ...d,
      services: d.services.filter((s) => s !== svc),
      members: d.members.map((m) => ({
        ...m,
        services: (m.services || []).filter((s) => s !== svc),
      })),
    }));
  };

  const openServicesEditor = () => {
    setServicesBuffer([...dept.services]);
    setServicesModalOpen(true);
  };

  const saveServicesFromModal = () => {
    const normalized = Array.from(
      new Set(
        servicesBuffer
          .map((s) => String(s).trim())
          .filter(Boolean)
          .map((s) => s.toUpperCase())
      )
    );
    // when removing services, also remove from members
    setDept((d) => ({
      ...d,
      services: normalized,
      members: d.members.map((m) => ({
        ...m,
        services: (m.services || []).filter((s) => normalized.includes(s)),
      })),
    }));
    setServicesModalOpen(false);
  };

  // ---------- Escalation handlers ----------
  const openEscEditor = () => {
    setEscBuffer({ ...dept.escalation });
    setEscModalOpen(true);
  };

  const saveEscFromModal = () => {
    setDept((d) => ({ ...d, escalation: { ...escBuffer } }));
    setEscModalOpen(false);
  };

  // ---------- Members handlers ----------
  const openMemberEditor = (member) => {
    setEditingMember({
      ...member,
      servicesAssigned: Array.from(member.services || []),
    });
    setMemberModalOpen(true);
  };

  const saveMemberFromModal = () => {
    if (!editingMember) return;
    setDept((d) => ({
      ...d,
      members: d.members.map((m) =>
        m.id === editingMember.id
          ? {
              ...m,
              name: editingMember.name,
              role: editingMember.role,
              services: Array.from(
                new Set(
                  (editingMember.servicesAssigned || [])
                    .map((s) => String(s).trim())
                    .filter(Boolean)
                    .map((s) => s.toUpperCase())
                )
              ),
            }
          : m
      ),
    }));
    setMemberModalOpen(false);
    setEditingMember(null);
  };

  // ---------- small UI helpers ----------
  const collapseVariant = {
    hidden: { height: 0, opacity: 0 },
    visible: { height: "auto", opacity: 1 },
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#02050a] via-[#07101a] to-[#00060a] text-gray-100 p-8">
      {/* background soft glows */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[700px] h-[700px] rounded-full blur-[120px] bg-blue-600/20" />
        <div className="absolute right-[-10%] bottom-[-10%] w-[600px] h-[600px] rounded-full blur-[100px] bg-cyan-500/12" />
      </div>

      {/* container */}
      <div className="max-w-7xl mx-auto space-y-6">
        {/* header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-blue-300 drop-shadow-[0_6px_30px_rgba(0,150,255,0.06)]">
              {dept.name}
            </h1>
            <p className="text-sm text-blue-200/60">Department ID: {dept.id}</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setDept(defaultDept);
                setServicesBuffer([...defaultDept.services]);
              }}
              className="px-4 py-2 rounded-lg bg-transparent border border-blue-500/20 text-blue-200 hover:bg-[#062534]/40 transition"
            >
              Reset
            </button>
          </div>
        </div>

        {/* layout grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Services & Escalation stacked */}
          <div className="space-y-6 lg:col-span-2">
            {/* SERVICES */}
            <div className="rounded-2xl border border-blue-500/20 bg-[#06121a]/60 shadow-[0_10px_30px_rgba(0,150,255,0.04)] p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-900/30 flex items-center justify-center text-blue-300">
                    <Settings size={18} />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-blue-200">Services</h3>
                    <p className="text-xs text-blue-200/60">List of department services</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setServicesEditingInline((v) => !v)}
                    className="text-sm text-blue-200/80 hover:text-blue-100 flex items-center gap-2"
                  >
                    <Edit3 size={14} /> Inline
                  </button>

                  <button
                    onClick={openServicesEditor}
                    className="text-sm text-blue-200/80 hover:text-blue-100 flex items-center gap-2"
                  >
                    <Plus size={14} /> Edit
                  </button>

                  <button
                    onClick={() => setOpenServices((s) => !s)}
                    className="p-2 rounded-full bg-[#04202a] hover:bg-[#0b3846] transition"
                  >
                    {openServices ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>
              </div>

              <AnimatePresence initial={false}>
                {openServices && (
                  <motion.div
                    key="services"
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={collapseVariant}
                    transition={{ duration: 0.18 }}
                    className="mt-4"
                  >
                    <div className="flex flex-wrap gap-3">
                      {dept.services.map((s) => (
                        <div key={s} className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-[#021426]/60 text-xs text-blue-200 shadow-[0_4px_18px_rgba(0,150,255,0.04)]">
                            {s}
                          </span>
                          {servicesEditingInline && (
                            <button
                              onClick={() => removeServiceInline(s)}
                              className="text-red-400 hover:text-red-500 text-xs p-1"
                              aria-label={`remove ${s}`}
                            >
                              <Trash size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {servicesEditingInline && (
                      <div className="mt-4 flex gap-2 items-center">
                        <InlineServiceAdder onAdd={addServiceInline} />
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ESCALATION */}
            <div className="rounded-2xl border border-blue-500/20 bg-[#06121a]/60 shadow-[0_10px_30px_rgba(0,150,255,0.04)] p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-900/30 flex items-center justify-center text-amber-300">
                    ⚡
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-blue-200">Escalation</h3>
                    <p className="text-xs text-blue-200/60">Escalation duration and levels</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setEscEditingInline((v) => !v)}
                    className="text-sm text-blue-200/80 hover:text-blue-100 flex items-center gap-2"
                  >
                    <Edit3 size={14} /> Inline
                  </button>

                  <button
                    onClick={openEscEditor}
                    className="text-sm text-blue-200/80 hover:text-blue-100 flex items-center gap-2"
                  >
                    <Plus size={14} /> Edit
                  </button>

                  <button
                    onClick={() => setOpenEscalation((s) => !s)}
                    className="p-2 rounded-full bg-[#04202a] hover:bg-[#0b3846] transition"
                  >
                    {openEscalation ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>
              </div>

              <AnimatePresence initial={false}>
                {openEscalation && (
                  <motion.div
                    key="escalation"
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={collapseVariant}
                    transition={{ duration: 0.18 }}
                    className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-blue-200">Duration (days):</span>
                      {escEditingInline ? (
                        <input
                          type="number"
                          value={dept.escalation.durationDays}
                          onChange={(e) =>
                            setDept((d) => ({
                              ...d,
                              escalation: { ...d.escalation, durationDays: Number(e.target.value) },
                            }))
                          }
                          className="w-24 rounded-md border border-blue-500/20 bg-[#021426]/50 px-3 py-1 text-blue-200"
                        />
                      ) : (
                        <div className="rounded-md border border-blue-500/10 px-3 py-1 bg-[#021426]/40 text-blue-200">
                          {dept.escalation.durationDays}
                        </div>
                      )}
                    </div>

                    {["level1", "level2", "level3"].map((lvl, idx) => (
                      <div key={lvl}>
                        <div className="text-sm text-blue-200 font-medium">Escalation Level {idx + 1} :</div>
                        {escEditingInline ? (
                          <input
                            value={dept.escalation[lvl]}
                            onChange={(e) =>
                              setDept((d) => ({ ...d, escalation: { ...d.escalation, [lvl]: e.target.value } }))
                            }
                            className="mt-2 w-full rounded-md border border-blue-500/20 bg-[#021426]/50 px-3 py-1 text-blue-200"
                          />
                        ) : (
                          <div className="mt-2 text-blue-200">{dept.escalation[lvl] || "-"}</div>
                        )}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right column - Members */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-blue-500/20 bg-[#06121a]/60 p-5 shadow-[0_10px_30px_rgba(0,150,255,0.04)]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-900/30 flex items-center justify-center text-green-300">
                    <User size={18} />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-blue-200">Members</h3>
                    <p className="text-xs text-blue-200/60">Department users and assigned services</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <input
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  placeholder="Search members..."
                  className="w-full rounded-md border border-blue-500/10 bg-[#021426]/40 px-3 py-2 text-blue-200 placeholder:text-blue-400/40"
                />
              </div>

              <div className="space-y-3">
                {filteredMembers.length === 0 ? (
                  <div className="text-sm text-blue-200/50">No members found</div>
                ) : (
                  filteredMembers.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-start justify-between gap-3 p-3 rounded-lg border border-blue-500/8 bg-[#021426]/30"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-md bg-[#01212c]/40 flex items-center justify-center text-blue-300">
                          <User size={18} />
                        </div>
                        <div>
                          <div className="text-sm text-blue-200 font-medium">{m.name}</div>
                          <div className="text-xs text-blue-200/60">{m.role}</div>
                          <div className="text-xs text-blue-200/50 mt-2">
                            {(m.services || []).length ? m.services.join(", ") : "-"}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <button
                          onClick={() => openMemberEditor(m)}
                          className="p-2 rounded-md bg-[#04202a] hover:bg-[#063445] text-blue-200"
                        >
                          <Edit3 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* small info card */}
            <div className="rounded-2xl border border-blue-500/12 bg-[#06121a]/50 p-4 text-blue-200">
              <div className="text-sm">
                Escalation duration: <span className="font-semibold">{dept.escalation.durationDays} days</span>
              </div>
              <div className="text-xs text-blue-200/50 mt-2">
                Levels: {dept.escalation.level1 || "-"}, {dept.escalation.level2 || "-"}, {dept.escalation.level3 || "-"}
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER actions */}
        <div className="flex justify-end gap-3 mt-3">
          <button
            onClick={() => {
              setServicesEditingInline(false);
              setEscEditingInline(false);
              setServicesModalOpen(false);
              setEscModalOpen(false);
              setMemberModalOpen(false);
            }}
            className="px-4 py-2 rounded-lg border border-blue-500/10 text-blue-200 hover:bg-[#042536]/30"
          >
            Close
          </button>
        </div>
      </div>

      {/* ---------- SERVICES MODAL ---------- */}
      <SimpleModal
        open={servicesModalOpen}
        onClose={() => setServicesModalOpen(false)}
        title="Edit Services"
        footer={
          <>
            <button
              onClick={() => setServicesModalOpen(false)}
              className="px-3 py-1 rounded border border-blue-500/10 text-blue-200"
            >
              Cancel
            </button>
            <button
              onClick={saveServicesFromModal}
              className="px-3 py-1 rounded bg-gradient-to-r from-blue-500 to-cyan-400 text-black font-semibold"
            >
              Save
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-blue-200/60">Reorder, remove, or add services.</p>

          <div className="space-y-2 max-h-56 overflow-auto py-1">
            {servicesBuffer.map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <input
                  value={s}
                  onChange={(e) =>
                    setServicesBuffer((arr) => arr.map((x, idx) => (idx === i ? e.target.value : x)))
                  }
                  className="w-full rounded-md border border-blue-500/10 bg-[#021426]/40 px-3 py-2 text-blue-200"
                />
                <button
                  onClick={() => setServicesBuffer((arr) => arr.filter((_, idx) => idx !== i))}
                  className="text-red-400 p-2 rounded-md hover:bg-[#2a0d0d]/5"
                >
                  <Trash size={14} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <input
              value={newService}
              onChange={(e) => setNewService(e.target.value)}
              placeholder="New service name"
              className="flex-1 rounded-md border border-blue-500/10 bg-[#021426]/40 px-3 py-2 text-blue-200"
            />
            <button
              onClick={() => {
                if (newService.trim()) {
                  setServicesBuffer((arr) => [...arr, newService.trim().toUpperCase()]);
                  setNewService("");
                }
              }}
              className="px-3 py-2 rounded bg-gradient-to-r from-blue-500 to-cyan-400 text-black font-semibold"
            >
              Add
            </button>
          </div>
        </div>
      </SimpleModal>

      {/* ---------- ESCALATION MODAL ---------- */}
      <SimpleModal
        open={escModalOpen}
        onClose={() => setEscModalOpen(false)}
        title="Edit Escalation"
        footer={
          <>
            <button
              onClick={() => setEscModalOpen(false)}
              className="px-3 py-1 rounded border border-blue-500/10 text-blue-200"
            >
              Cancel
            </button>
            <button
              onClick={saveEscFromModal}
              className="px-3 py-1 rounded bg-gradient-to-r from-blue-500 to-cyan-400 text-black font-semibold"
            >
              Save
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <label className="w-40 text-sm text-blue-200/70">Duration (days)</label>
            <input
              type="number"
              value={escBuffer.durationDays}
              onChange={(e) => setEscBuffer((d) => ({ ...d, durationDays: Number(e.target.value) }))}
              className="w-24 rounded-md border border-blue-500/10 bg-[#021426]/40 px-3 py-2 text-blue-200"
            />
          </div>

          {["level1", "level2", "level3"].map((lvl, i) => (
            <div key={lvl} className="flex items-center gap-3">
              <label className="w-40 text-sm text-blue-200/70">Escalation Level {i + 1}</label>
              <input
                value={escBuffer[lvl]}
                onChange={(e) => setEscBuffer((d) => ({ ...d, [lvl]: e.target.value }))}
                className="flex-1 rounded-md border border-blue-500/10 bg-[#021426]/40 px-3 py-2 text-blue-200"
              />
            </div>
          ))}
        </div>
      </SimpleModal>

      {/* ---------- MEMBER MODAL ---------- */}
      <SimpleModal
        open={memberModalOpen}
        onClose={() => {
          setMemberModalOpen(false);
          setEditingMember(null);
        }}
        title={editingMember ? `Edit ${editingMember.name}` : "Edit Member"}
        footer={
          <>
            <button
              onClick={() => {
                setMemberModalOpen(false);
                setEditingMember(null);
              }}
              className="px-3 py-1 rounded border border-blue-500/10 text-blue-200"
            >
              Cancel
            </button>
            <button
              onClick={saveMemberFromModal}
              className="px-3 py-1 rounded bg-gradient-to-r from-blue-500 to-cyan-400 text-black font-semibold"
            >
              Save
            </button>
          </>
        }
      >
        {editingMember && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <label className="w-40 text-sm text-blue-200/70">Name</label>
              <input
                value={editingMember.name}
                onChange={(e) => setEditingMember((m) => ({ ...m, name: e.target.value }))}
                className="flex-1 rounded-md border border-blue-500/10 bg-[#021426]/40 px-3 py-2 text-blue-200"
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="w-40 text-sm text-blue-200/70">Role</label>
              <input
                value={editingMember.role}
                onChange={(e) => setEditingMember((m) => ({ ...m, role: e.target.value }))}
                className="flex-1 rounded-md border border-blue-500/10 bg-[#021426]/40 px-3 py-2 text-blue-200"
              />
            </div>

            <div>
              <label className="text-sm text-blue-200/70 block mb-2">Assigned Services</label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-auto">
                {dept.services.map((s) => {
                  const checked = (editingMember.servicesAssigned || []).includes(s);
                  return (
                    <label key={s} className="flex items-center gap-2 text-sm text-blue-200/80">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setEditingMember((m) => ({
                            ...m,
                            servicesAssigned: checked
                              ? [...(m.servicesAssigned || []), s]
                              : (m.servicesAssigned || []).filter((x) => x !== s),
                          }));
                        }}
                        className="accent-cyan-400"
                      />
                      <span>{s}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </SimpleModal>
    </div>
  );
}

/* InlineServiceAdder - small helper component */
function InlineServiceAdder({ onAdd }) {
  const [val, setVal] = useState("");
  return (
    <div className="flex w-full gap-2">
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder="Add service and press Add"
        className="flex-1 rounded-md border border-blue-500/10 bg-[#021426]/40 px-3 py-2 text-blue-200"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            if (val.trim()) {
              onAdd(val.trim());
              setVal("");
            }
          }
        }}
      />
      <button
        onClick={() => {
          if (val.trim()) {
            onAdd(val.trim());
            setVal("");
          }
        }}
        className="px-3 py-2 rounded bg-gradient-to-r from-blue-500 to-cyan-400 text-black font-semibold"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}

            