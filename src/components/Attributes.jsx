"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Plus, Save } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

function Modal({ open, onClose, children }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 
                       bg-[#0a0f1f] p-8 rounded-3xl border border-cyan-500/40 
                       shadow-[0_0_25px_#00ffff50] z-50 w-full max-w-md"
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function Attributes() {
  const [attributes, setAttributes] = useState([
    {
      name: "Departments",
      values: ["IT MANAGEMENT", "ELECTRICAL", "GENERAL MAINTENANCE"],
    },
    {
      name: "Archive Reason",
      values: ["RETIRED", "REJOINED"],
    },
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

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#0a0f1f] overflow-hidden">
      {/* animated neon background image */}
      <motion.img
        src="src/assets/images/customer.jpg"
        alt="attributes visual"
        className="absolute w-[480px] opacity-25 bottom-10 left-16 rounded-3xl"
        initial={{ y: 0 }}
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-12 relative z-10 px-6 py-12">
        {/* left intro block */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col justify-center items-center bg-[#111827]/80 
                     border border-cyan-500/30 backdrop-blur-2xl rounded-3xl 
                     p-10 shadow-[0_0_30px_#00ffff30]"
        >
          <p className="text-cyan-400 text-lg font-semibold text-center">
            Define and manage your system attributes easily
          </p>
        </motion.div>

        {/* main attributes content */}
        <div className="col-span-2 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 p-3 rounded-2xl shadow-[0_0_15px_#00ffff80]">
              <Pencil className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-cyan-200 tracking-tight">
              Attributes
            </h2>
          </div>

          <Card
            className="border border-cyan-500/20 bg-[#111827]/80 
                           backdrop-blur-2xl rounded-3xl shadow-[0_0_25px_#00ffff30]"
          >
            <CardContent className="space-y-8 py-10 px-8">
              {attributes.map((attr, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 70,
                  }}
                >
                  <label className="text-cyan-300 font-semibold block mb-3">
                    {attr.name}
                  </label>
                  <div
                    className="flex flex-wrap gap-2 items-center bg-[#0f172a] 
                               rounded-2xl p-4 border border-cyan-500/10 
                               hover:border-cyan-400/30 transition"
                  >
                    {attr.values.map((value, i) => (
                      <motion.span
                        key={i}
                        whileHover={{ scale: 1.08 }}
                        className="bg-gradient-to-r from-cyan-700 to-purple-700 
                                   text-cyan-100 px-3 py-1 rounded-full text-sm 
                                   font-medium shadow-[0_0_10px_#00ffff40]"
                      >
                        {value}
                      </motion.span>
                    ))}
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleAddValue(attr.name)}
                      className="ml-auto text-cyan-400 hover:text-cyan-200 
                                 hover:bg-cyan-950/30 transition rounded-full"
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                  </div>
                </motion.div>
              ))}

              <div className="pt-6 border-t border-cyan-500/20 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 bg-gradient-to-r 
                             from-cyan-600 via-purple-600 to-pink-600 
                             text-white px-6 py-2.5 rounded-2xl font-semibold 
                             shadow-[0_0_15px_#00ffff70]"
                >
                  <Save className="h-4 w-4" /> Save Changes
                </motion.button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* modal */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h3 className="text-lg font-semibold text-cyan-200 mb-4">
          Add New {selectedAttr}
        </h3>
        <Input
          placeholder={`Enter ${selectedAttr} name`}
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          className="w-full bg-[#0f172a] text-cyan-200 border-cyan-500/30 
                     focus:ring-cyan-400 focus:border-cyan-400 mb-4 rounded-lg"
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
