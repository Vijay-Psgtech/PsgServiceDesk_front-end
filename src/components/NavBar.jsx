import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, UserCircle, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function NavBar() {
  const { auth, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();

  const navItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Tickets", path: "/tickets" },
    { name: "Departments", path: "/departments" },
    { name: "Attributes", path: "/attributes" },
    { name: "Users", path: "/users" },
    { name: "Activity", path: "/activity" },
  ];

  // Close user menu when clicking outside
  useEffect(() => {
    const handleDocClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleDocClick);
    return () => document.removeEventListener("mousedown", handleDocClick);
  }, []);

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
        ⚡PSG Service Desk
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

        <div className="inline-flex gap-2 md-2 text-white">
          {/* User button with dropdown */}
          <div ref={userMenuRef} className="relative">
            <button
              onClick={() => setUserMenuOpen((s) => !s)}
              className="inline-flex items-center gap-2 text-sm font-medium text-cyan-200 hover:text-cyan-400 px-2 py-1 rounded-md focus:outline-none"
              aria-haspopup="true"
              aria-expanded={userMenuOpen}
            >
              <UserCircle size={20} />
              <span className="select-none">{auth?.user?.userName || "User"}</span>
              <span className="ml-1 text-xs">▾</span>
            </button>

            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.14 }}
                  className="absolute right-0 mt-2 w-40 bg-black/80 border border-cyan-400/30 backdrop-blur-xl rounded-lg shadow-[0_8px_30px_rgba(0,0,0,0.6)] z-50 overflow-hidden"
                >
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                      navigate('/');
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-white/5 flex items-center gap-2"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
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
              
              {/* User Info & Logout for Mobile */}
              <div className="mt-3 pt-3 border-t border-cyan-400/30">
                <div className="px-4 py-2 flex items-center gap-2 text-sm font-medium text-cyan-200">
                  <UserCircle size={18} />
                  <span>{auth?.user?.userName || "User"}</span>
                </div>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                    navigate('/');
                  }}
                  className="w-full px-4 py-2 text-sm font-medium text-gray-300 hover:text-fuchsia-400 hover:bg-white/5 flex items-center gap-2"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};
