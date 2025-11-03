"use client";
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import Dashboard from "./Pages/Dashboard";
import UserDashboard from "./components/User/UserDashboard";
import ManageDepartment from "./Pages/ManageDepartment";
import Attributes from "./components/Attributes";
import TicketsTable from "./components/ui/TicketsTable";
import UserManagement from "./components/UserManagement";
import ActivityPage from "./Pages/ActivityPage";
import { DepartmentProvider } from "./context/DepartmentContext";
import "./App.css";


function App() {
  return (
    <Router>
      <DepartmentProvider>
        <div className="min-h-screen bg-gradient-to-b from-black via-[#0a0a1a] to-[#050510] text-white relative overflow-hidden">
          {/* Neon Background */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-fuchsia-500/20 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 right-1/2 w-[300px] h-[300px] bg-purple-500/20 rounded-full blur-3xl"></div>
          </div>

          {/* Navbar */}
          <NavBar />

          {/* Main Content */}
          <main className="relative z-10 mt-16 p-4 md:p-8 lg:p-12 overflow-y-auto">
            <div className="bg-black/40 backdrop-blur-2xl border border-cyan-500/20 rounded-2xl shadow-[0_0_30px_rgba(0,255,255,0.15)] p-6 min-h-[80vh] transition-all duration-300">
              <Routes>
                <Route path="/" element={<UserDashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/tickets" element={<TicketsTable />} />
                <Route path="/departments" element={<ManageDepartment />} />
                <Route path="/attributes" element={<Attributes />} />
                <Route path="/users" element={<UserManagement />} />
                <Route path="/activity" element={<ActivityPage />} />
              </Routes>
            </div>
          </main>

          {/* Footer */}
          <footer className="relative z-10 text-center text-xs md:text-sm text-gray-400 py-4 border-t border-cyan-500/10 mt-10">
            © {new Date().getFullYear()} Ticket Manager — Dark Neon UI
          </footer>
        </div>
      </DepartmentProvider>
    </Router>
  );
}

export default App;



