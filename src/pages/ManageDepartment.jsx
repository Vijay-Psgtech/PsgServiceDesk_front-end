"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  Save,
  Users,
  Building2,
  ClipboardList,
  Clock,
  X,
} from "lucide-react";

// -----------------------------
// Inline UI Components
// -----------------------------
const Card = ({ children, className }) => (
  <div
    className={`bg-gradient-to-b from-[#0a0f1f]/90 to-[#111827]/90 border border-cyan-500/30 rounded-3xl shadow-[0_0_30px_#00ffff30] backdrop-blur-xl ${className}`}
  >
    {children}
  </div>
);

const CardContent = ({ children, className }) => (
  <div className={`p-8 ${className}`}>{children}</div>
);

const Button = ({ children, onClick, variant = "solid", className }) => {
  const base =
    "px-4 py-2 rounded-xl font-semibold transition text-sm flex items-center gap-2";
  const styles =
    variant === "outline"
      ? "border border-cyan-500/40 text-cyan-200 hover:bg-cyan-950/40"
      : "bg-gradient-to-r from-cyan-600 to-purple-600 text-white shadow-[0_0_10px_#00ffff40] hover:scale-105";
  return (
    <button onClick={onClick} className={`${base} ${styles} ${className}`}>
      {children}
    </button>
  );
};

const Input = ({ value, onChange, placeholder }) => (
  <input
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className="w-full bg-[#0f172a] text-cyan-200 border border-cyan-500/30 focus:ring-cyan-400 focus:border-cyan-400 mb-4 rounded-lg px-3 py-2"
  />
);

// Tabs
const Tabs = ({ tabs, active, onChange }) => (
  <div className="flex justify-center mb-10">
    <div className="flex bg-[#0f172a]/80 border border-cyan-500/30 rounded-2xl overflow-hidden">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`px-6 py-3 text-sm font-medium ${
            active === tab
              ? "bg-cyan-500/30 text-cyan-200"
              : "text-cyan-400 hover:bg-cyan-900/40"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  </div>
);

// Modal
const Modal = ({ open, onClose, title, children, onSave }) => (
  <AnimatePresence>
    {open && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          transition={{ duration: 0.3 }}
          className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 
            bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1e293b]
            border border-cyan-500/40 shadow-[0_0_30px_#00ffff60]
            rounded-3xl p-8 w-full max-w-md text-cyan-100"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-cyan-200">{title}</h3>
            <button
              onClick={onClose}
              className="text-cyan-300 hover:text-white hover:bg-cyan-950/30 rounded-full p-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {children}
          <div className="flex justify-end mt-6 gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={onSave}>Save</Button>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

// -----------------------------
// Main Component
// -----------------------------
export default function ManageDepartment() {
  const [activeTab, setActiveTab] = useState("Departments");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [modalData, setModalData] = useState({});

  const [departments, setDepartments] = useState([
    { name: "IT MANAGEMENT", head: "John Doe" },
    { name: "ELECTRICAL", head: "Jane Smith" },
  ]);

  const [services, setServices] = useState([
    { name: "Network Support", dept: "IT MANAGEMENT" },
    { name: "System Repair", dept: "GENERAL MAINTENANCE" },
  ]);

  const [escalations, setEscalations] = useState([
    { level: "Level 1", contact: "supervisor@company.com", time: "2h" },
    { level: "Level 2", contact: "manager@company.com", time: "4h" },
    { level: "Level 3", contact: "admin@company.com", time: "6h" },
  ]);

  const [members, setMembers] = useState([
    { name: "Alex Carter", role: "Technician", service: "Network Support" },
    { name: "Maria Lee", role: "System Engineer", service: "System Repair" },
  ]);

  // -----------------------------
  // Handlers
  // -----------------------------
  const handleAdd = (type) => {
    setModalType(type);
    setModalData({});
    setModalOpen(true);
  };

  const handleEdit = (type, item) => {
    setModalType(type);
    setModalData(item);
    setModalOpen(true);
  };

  const handleDelete = (type, index) => {
    if (!window.confirm("Delete this item?")) return;
    const map = {
      Departments: [departments, setDepartments],
      Services: [services, setServices],
      Escalation: [escalations, setEscalations],
      Members: [members, setMembers],
    };
    const [data, setData] = map[type];
    setData(data.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!modalType) return;
    const map = {
      Departments: [departments, setDepartments],
      Services: [services, setServices],
      Escalation: [escalations, setEscalations],
      Members: [members, setMembers],
    };
    const [data, setData] = map[modalType];
    const updated =
      data.find((d) => d.name === modalData.name) ||
      data.find((d) => d.level === modalData.level);
    if (updated) {
      setData(
        data.map((item) =>
          item.name === modalData.name || item.level === modalData.level
            ? modalData
            : item
        )
      );
    } else {
      setData([...data, modalData]);
    }
    setModalOpen(false);
  };

  // -----------------------------
  // Field Renderer
  // -----------------------------
  const renderFields = () => {
    if (!modalType) return null;
    const map = {
      Departments: [
        { key: "name", placeholder: "Department Name" },
        { key: "head", placeholder: "Department Head" },
      ],
      Services: [
        { key: "name", placeholder: "Service Name" },
        { key: "dept", placeholder: "Department" },
      ],
      Escalation: [
        { key: "level", placeholder: "Level (e.g., Level 1)" },
        { key: "contact", placeholder: "Contact Email" },
        { key: "time", placeholder: "Time Threshold (e.g., 2h)" },
      ],
      Members: [
        { key: "name", placeholder: "Member Name" },
        { key: "role", placeholder: "Role" },
        { key: "service", placeholder: "Service" },
      ],
    };
    const inputs = map[modalType];
    return inputs.map((f) => (
      <Input
        key={f.key}
        placeholder={f.placeholder}
        value={modalData[f.key] || ""}
        onChange={(e) => setModalData({ ...modalData, [f.key]: e.target.value })}
      />
    ));
  };

  // -----------------------------
  // Render Sections
  // -----------------------------
  const renderTabContent = () => {
    if (activeTab === "Departments")
      return (
        <>
          {departments.map((d, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-between items-center bg-[#0f172a]/60 p-4 rounded-xl border border-cyan-500/10 mb-3"
            >
              <div>
                <h4 className="font-semibold text-cyan-200">{d.name}</h4>
                <p className="text-sm text-cyan-400">{d.head}</p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleEdit("Departments", d)}
                >
                  <Pencil size={16} />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDelete("Departments", i)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </motion.div>
          ))}
        </>
      );

    if (activeTab === "Services")
      return (
        <div className="flex flex-wrap gap-3">
          {services.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-4 py-2 bg-cyan-800/40 border border-cyan-500/20 rounded-full text-sm flex items-center gap-2"
            >
              {s.name}{" "}
              <button onClick={() => handleDelete("Services", i)}>
                <X size={14} className="text-pink-400" />
              </button>
            </motion.div>
          ))}
        </div>
      );

        if (activeTab === "Escalation")
      return (
        <>
          {escalations.map((e, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#0f172a]/60 p-4 rounded-xl border border-cyan-500/10 mb-3"
            >
              <h4 className="font-semibold text-cyan-300">{e.level}</h4>
              <p className="text-sm text-cyan-400">{e.contact}</p>
              <p className="text-xs text-cyan-500">{e.time}</p>
              <div className="mt-3 flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleEdit("Escalation", e)}  
                >
                  <Pencil size={16} />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDelete("Escalation", i)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </motion.div>
          ))}
        </>
      );

    if (activeTab === "Members")
      return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-[#0f172a]/70 border border-cyan-500/20 p-4 rounded-2xl"
            >
              <h4 className="font-semibold text-cyan-200">{m.name}</h4>
              <p className="text-sm text-cyan-400">{m.role}</p>
              <p className="text-xs text-cyan-500">{m.service}</p>
              <div className="mt-3 flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleEdit("Members", m)}
                >
                  <Pencil size={16} />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDelete("Members", i)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      );
  };

  // -----------------------------
  // Main Render
  // -----------------------------
  return (
    <div className="min-h-screen bg-[#020617] text-cyan-100 p-10 relative overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#00ffff30,transparent_70%)]"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 6, repeat: Infinity }}
      />
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,#9333ea20,transparent_70%)]"
        animate={{ opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 7, repeat: Infinity }}
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-10 text-cyan-300">
          Manage Departments
        </h1>

        <Tabs
          tabs={["Departments", "Services", "Escalation", "Members"]}
          active={activeTab}
          onChange={setActiveTab}
        />

        <Card>
          <CardContent>
            <div className="flex justify-end mb-6">
              <Button onClick={() => handleAdd(activeTab)}>
                <Plus size={16} /> Add {activeTab}
              </Button>
            </div>
            {renderTabContent()}
          </CardContent>
        </Card>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Add / Edit ${modalType}`}
        onSave={handleSave}
      >
        {renderFields()}
      </Modal>
    </div>
  );
}