import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NavLink } from "react-router-dom";
import { useDepartment } from "../context/DepartmentContext";
import { useInstitution } from "../context/InstitutionContext";
import { Menu } from "lucide-react";
import api from "../api/axios";

export default function NavBar() {
  const { selectedDepartment, setSelectedDepartment } = useDepartment();
  const { selectedInstitution, setSelectedInstiution } = useInstitution();
  const [institutionOptions, setInstitutionOptions] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);

  const departments = [
    "All Departments",
    "IT Services",
    "HR",
    "Finance",
    "Operations",
  ];

  const navItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Tickets", path: "/tickets" },
    { name: "Departments", path: "/departments" },
    { name: "Attributes", path: "/attributes" },
    { name: "Users", path: "/users" },
    { name: "Activity", path: "/activity" },
  ];

  useEffect(() => {
    const getInstitution = async () => {
      try{
        const res = await api.get("/institutions");
        const formattedOptions = res.data.map((inst) => ({
          label: inst.name,
          value: inst._id,
        }));
        setInstitutionOptions(formattedOptions);

      }catch (error){
        console.log("Failed to fetch institutions", error.message);
      }
    };
    getInstitution();
  },[]);

  return (
    <motion.header
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="sticky top-0 z-50 bg-black/70 backdrop-blur-xl border-b border-cyan-400/30 shadow-[0_0_25px_rgba(0,255,255,0.15)] px-6 py-3 flex justify-between items-center"
    >
      {/* Logo */}
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-2xl font-bold tracking-wide bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-purple-500 bg-clip-text text-transparent animate-gradient-x select-none"
      >
        ⚡Ticket Manager
      </motion.h1>

      {/* Desktop Nav */}
      <nav className="hidden md:flex items-center gap-6">
        {navItems.map((item, i) => (
          <NavLink
            key={i}
            to={item.path}
            className={({ isActive }) =>
              `relative text-sm font-medium tracking-wide px-3 py-1 rounded-md transition-all ${
                isActive
                  ? "text-cyan-300 after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-full after:bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-purple-500"
                  : "text-gray-300 hover:text-cyan-300"
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}

        {/* Department Selector */}
        <select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          className="border border-cyan-400/40 bg-black/40 text-cyan-200 rounded-lg px-3 py-1 text-sm font-medium focus:ring-2 focus:ring-fuchsia-400 outline-none transition-all shadow-[0_0_10px_rgba(0,255,255,0.15)] hover:shadow-[0_0_15px_rgba(255,0,255,0.3)]"
        >
          {departments.map((dep, idx) => (
            <option key={idx} value={dep} className="bg-black text-cyan-200">
              {dep}
            </option>
          ))}
        </select>

        {/* Institution Selector */}
        {/* <select
          value={selectedInstitution}
          onChange={(e) => setSelectedInstiution(e.target.value)}
          className="border border-cyan-400/40 bg-black/40 text-cyan-200 rounded-lg px-3 py-1 text-sm font-medium focus:ring-2 focus:ring-fuchsia-400 outline-none transition-all shadow-[0_0_10px_rgba(0,255,255,0.15)] hover:shadow-[0_0_15px_rgba(255,0,255,0.3)]"
        >
          {institutionOptions.map((inst, index) => (
            <option key={index} value={inst.value} className="bg-black text-cyan-200">
              {inst.label}
            </option>
          ))}
        </select> */}
      </nav>

      {/* Mobile Nav */}
      <div className="md:hidden relative">
        <Menu
          size={24}
          className="text-cyan-300 cursor-pointer hover:text-fuchsia-400 transition"
          onClick={() => setMenuOpen(!menuOpen)}
        />
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-3 w-52 bg-black/80 border border-cyan-400/30 backdrop-blur-xl rounded-xl shadow-[0_0_20px_rgba(0,255,255,0.2)] flex flex-col py-3 z-50"
            >
              {navItems.map((item, i) => (
                <NavLink
                  key={i}
                  to={item.path}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-2 text-sm font-medium transition-all ${
                      isActive
                        ? "text-cyan-300 bg-white/10"
                        : "text-gray-300 hover:text-fuchsia-400 hover:bg-white/5"
                    }`
                  }
                >
                  {item.name}
                </NavLink>
              ))}
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="mt-3 mx-4 border border-cyan-400/40 bg-black/40 text-cyan-200 rounded-lg px-3 py-1 text-sm font-medium focus:ring-2 focus:ring-fuchsia-400 outline-none transition-all"
              >
                {departments.map((dep, idx) => (
                  <option
                    key={idx}
                    value={dep}
                    className="bg-black text-cyan-200"
                  >
                    {dep}
                  </option>
                ))}
              </select>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};
