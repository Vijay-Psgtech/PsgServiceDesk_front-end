"use client";
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";

import NavBar from "./components/NavBar";

// ADMIN PAGES
import Dashboard from "./Pages/Dashboard";
import ManageDepartment from "./Pages/ManageDepartment";
import Attributes from "./components/Attributes";
import TicketsTable from "./components/ui/TicketsTable";
import UserManagement from "./components/UserManagement";
import ActivityPage from "./Pages/ActivityPage";

// USER PAGES
import UserDashboard from "./components/User/AdminDashboard";

// AUTH
import Login from "./Pages/Login";
import { getUserFromStorage } from "./lib/auth";

// CONTEXT
import { DepartmentProvider } from "./context/DepartmentContext";

import "./App.css";

/* ---------------- PROTECTED ROUTES ---------------- */

// Admin-only
function AdminRoute({ children }) {
  const user = getUserFromStorage();
  if (!user || user.role !== "admin") return <Navigate to="/login" replace />;
  return children;
}

// User-only
function UserRoute({ children }) {
  const user = getUserFromStorage();
  if (!user || user.role !== "user") return <Navigate to="/login" replace />;
  return children;
}

/* ---------------- LAYOUT (WITH NAVBAR) ---------------- */

function Layout() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#0a0a1a] to-[#050510] text-white relative overflow-hidden">
      
      {!isLoginPage && <NavBar />}

      <main className={`relative z-10 ${!isLoginPage ? "mt-16 p-4 md:p-8 lg:p-12" : ""}`}>
        
        <div className={`${!isLoginPage ? "bg-black/40 backdrop-blur-2xl border border-cyan-500/20 rounded-2xl p-6 shadow-[0_0_30px_rgba(0,255,255,0.15)]" : ""}`}>

          <Routes>

            {/* ---------- PUBLIC ---------- */}
            <Route path="/login" element={<Login />} />

            {/* ---------- USER ROUTES (MATCH NAVBAR) ---------- */}
            <Route path="/" element={
              <UserRoute>
                <UserDashboard />
              </UserRoute>
            } />

            <Route path="/tickets" element={
              <UserRoute>
                <TicketsTable />
              </UserRoute>
            } />

            <Route path="/activity" element={
              <UserRoute>
                <ActivityPage />
              </UserRoute>
            } />

            {/* ---------- ADMIN ROUTES (MATCH NAVBAR) ---------- */}
            <Route path="/dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
            <Route path="/departments" element={<AdminRoute><ManageDepartment /></AdminRoute>} />
            <Route path="/attributes" element={<AdminRoute><Attributes /></AdminRoute>} />
            <Route path="/users" element={<AdminRoute><UserManagement /></AdminRoute>} />
            <Route path="/tickets-admin" element={<AdminRoute><TicketsTable /></AdminRoute>} />
            <Route path="/activity-admin" element={<AdminRoute><ActivityPage /></AdminRoute>} />

            {/* ---------- AUTO REDIRECT BASED ON ROLE ---------- */}
            <Route path="/home" element={
              getUserFromStorage()
                ? getUserFromStorage().role === "admin"
                  ? <Navigate to="/dashboard" replace />
                  : <Navigate to="/" replace />
                : <Navigate to="/login" replace />
            } />

            {/* ---------- 404 → Redirect ---------- */}
            <Route path="*" element={
              getUserFromStorage()
                ? getUserFromStorage().role === "admin"
                  ? <Navigate to="/dashboard" replace />
                  : <Navigate to="/" replace />
                : <Navigate to="/login" replace />
            } />

          </Routes>

        </div>
      </main>

      {!isLoginPage && (
        <footer className="relative z-10 text-center text-xs md:text-sm text-gray-400 py-4 border-t border-cyan-500/10 mt-10">
          © {new Date().getFullYear()} Ticket Manager
        </footer>
      )}

    </div>
  );
}

/* ---------------- APP WRAPPER ---------------- */

export default function App() {
  return (
    <Router>
      <DepartmentProvider>
        <Layout />
      </DepartmentProvider>
    </Router>
  );
}



