"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Plus, Save, X } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

// -----------------------------
// Modal Component
// -----------------------------
function Modal({ open, onClose, children }) {
  return (
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
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 
              bg-gradient-to-b from-[#0f172a] via-[#111827] to-[#1e293b]
              border border-cyan-400/40 shadow-[0_0_40px_#00ffff50]
              rounded-3xl p-8 w-full max-w-md text-cyan-100"
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// -----------------------------
// Attributes Component
// -----------------------------
export default function Attributes() {
  const [attributes, setAttributes] = useState([
    {
      name: "Departments",
      values: ["IT MANAGEMENT", "ELECTRICAL", "GENERAL MAINTENANCE"],
    },
    { name: "Archive Reason", values: ["RETIRED", "REJOINED"] },
    {
      name: "Designation",
      values: [
        "HEAD",
        "SYSTEM IN-CHARGE",
        "TECHNICIAN",
        "SYSTEM ENGINEER",
        "DATA ENTRY OPERATOR",
        "LAB TECHNICIAN",
        "JUNIOR ASSISTANT",
        "MAINTENANCE SUPERVISOR",
        "ELECTRICIAN",
      ],
    },
  ]);

  const [selectedAttr, setSelectedAttr] = useState(null);
  const [newValue, setNewValue] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddValue = (attrName) => {
    setSelectedAttr(attrName);
    setNewValue("");
    setIsModalOpen(true);
  };

  const handleSaveValue = () => {
    if (!newValue.trim()) return;
    setAttributes((prev) =>
      prev.map((attr) =>
        attr.name === selectedAttr
          ? { ...attr, values: [...attr.values, newValue.toUpperCase()] }
          : attr
      )
    );
    setIsModalOpen(false);
  };

  const handleDeleteValue = (attrName, valueToDelete) => {
    setAttributes((prev) =>
      prev.map((attr) =>
        attr.name === attrName
          ? { ...attr, values: attr.values.filter((v) => v !== valueToDelete) }
          : attr
      )
    );
  };

  return (
    <div className="relative min-h-screen bg-[#020617] text-cyan-100 flex items-center justify-center overflow-hidden">
      {/* animated background */}
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#00ffff25,transparent_70%)]"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,#9333ea20,transparent_70%)]"
        animate={{ opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* main layout */}
      <div className="w-full max-w-7xl px-8 py-16 relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* intro */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-b from-[#0f172a]/80 to-[#1e293b]/60 
            border border-cyan-500/20 rounded-3xl backdrop-blur-2xl p-10 
            shadow-[0_0_40px_#00ffff25] flex flex-col justify-center"
        >
          <h2 className="text-4xl font-extrabold text-cyan-300 mb-4 tracking-tight">
            Attribute Manager
          </h2>
          <p className="text-cyan-200/80 leading-relaxed text-sm">
            Manage departments, roles, and archive reasons. Smooth UI with 
            fast in-panel editing.
          </p>
        </motion.div>

        {/* main panel */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-2 flex flex-col"
        >
          <Card
            className="bg-gradient-to-b from-[#0a0f1f]/90 to-[#111827]/90
              border border-cyan-400/30 rounded-3xl shadow-[0_0_40px_#00ffff30]
              backdrop-blur-xl"
          >
            <CardContent className="p-10 space-y-10">
              {attributes.map((attr, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 100,
                  }}
                  className="border-b border-cyan-500/10 pb-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-cyan-300">
                      {attr.name}
                    </h3>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleAddValue(attr.name)}
                      className="text-cyan-400 hover:text-cyan-200 hover:bg-cyan-950/40 rounded-full"
                      aria-label={`Add ${attr.name}`}
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                  </div>

                  <div
                    className="flex flex-wrap gap-2 p-4 bg-[#0f172a]/70 rounded-2xl 
                      border border-cyan-500/10 hover:border-cyan-500/30 transition-all"
                  >
                    <AnimatePresence>
                      {attr.values.map((value) => (
                        <motion.div
                          key={value}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.7 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium
                            bg-gradient-to-r from-cyan-700/60 to-purple-700/60
                            text-cyan-100 shadow-[0_0_12px_#00ffff30] group"
                        >
                          <span>{value}</span>
                          <button
                            onClick={() =>
                              handleDeleteValue(attr.name, value)
                            }
                            className="opacity-0 group-hover:opacity-100 ml-1 transition text-cyan-200 hover:text-pink-400"
                            aria-label={`Delete ${value}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}

              {/* Save button */}
              <div className="pt-8 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-6 py-2.5 font-semibold
                    bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600
                    text-white rounded-2xl shadow-[0_0_25px_#00ffff60]
                    hover:shadow-[0_0_35px_#00ffff80] transition"
                >
                  <Save className="h-4 w-4" /> Save Changes
                </motion.button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* modal */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-semibold text-cyan-200">
            Add New {selectedAttr}
          </h3>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsModalOpen(false)}
            className="text-cyan-300 hover:text-white hover:bg-cyan-950/30 rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <Input
          placeholder={`Enter ${selectedAttr} name`}
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          className="w-full bg-[#0f172a] text-cyan-200 border-cyan-500/30 
            focus:ring-cyan-400 focus:border-cyan-400 mb-6 rounded-lg"
        />
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => setIsModalOpen(false)}
            className="border-cyan-500/40 text-cyan-200 hover:bg-cyan-950/40"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveValue}
            className="bg-gradient-to-r from-cyan-600 to-purple-600 text-white"
          >
            Add
          </Button>
        </div>
      </Modal>
    </div>
  );
}
