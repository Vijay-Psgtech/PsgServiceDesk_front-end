"use client";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost } from "../lib/api";

import { motion, AnimatePresence } from "framer-motion";
import { User, Lock } from "lucide-react";

// Correct static asset import for Vite
import bgImage from "../assets/images/2986fa1e-1ef9-4557-bfe8-25fe64cf9160.jpg";

export default function Login() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("email");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  /* ---------------- SEND OTP ---------------- */
  const sendOtp = async (e) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email))
      return alert("Enter a valid email");

    setLoading(true);
    try {
      const res = await apiPost("/auth/send-otp", { email });

      if (!res?.success) alert(res?.message || "Failed to send OTP");
      else {
        alert("OTP sent to your email");
        setStep("otp");
      }
    } catch (err) {
      alert("Send OTP failed: " + (err.message || "unknown"));
    }
    setLoading(false);
  };

  /* ---------------- VERIFY OTP (ADMIN LOGIC ADDED) ---------------- */
  const verifyOtp = async (e) => {
    e.preventDefault();
    if (!otp.trim()) return alert("Enter OTP");

    setLoading(true);

    try {
      const res = await apiPost("/auth/verify-otp", { email, otp });

      if (!res?.success) {
        alert(res?.message || "Invalid OTP");
      } else {
        /* ---------------- DYNAMIC ROLE SETTING ---------------- */
        const role = email === "ssr.its@gmail.com" ? "admin" : "user";

        const updatedUser = { ...res.user, role };

        // Save to localStorage
        localStorage.setItem("token", res.token);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        localStorage.setItem("role", role);

        navigate("/", { replace: true });
      }
    } catch (err) {
      alert("OTP verify failed: " + (err.message || "error"));
    }

    setLoading(false);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#78A7FF] overflow-hidden">

      {/* ---------- BACKGROUND IMAGE ---------- */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${bgImage})`,
        }}
      />

      {/* ---------- LOGIN CARD ---------- */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="
          relative z-10 w-full max-w-md 
          bg-white/20 backdrop-blur-xl 
          border border-white/30 
          rounded-3xl shadow-2xl 
          p-10 text-white
        "
      >
        <h2 className="text-3xl mb-6 font-bold text-center tracking-wide">
          WELCOME
        </h2>

        <AnimatePresence mode="wait">

          {/* ---------- EMAIL STEP ---------- */}
          {step === "email" && (
            <motion.div
              key="email"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="mb-4">
                <label className="text-sm opacity-80">Email</label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-3 opacity-70" size={18} />
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-10 p-3 rounded-xl bg-white/30 text-white placeholder-white/70 focus:outline-none"
                  />
                </div>
              </div>

              <button
                onClick={sendOtp}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-white/40 hover:bg-white/60 text-black font-semibold shadow-lg"
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>

              <p className="text-center text-xs opacity-70 mt-4 cursor-pointer hover:text-white">
                Forgot your Password?
              </p>
            </motion.div>
          )}

          {/* ---------- OTP STEP ---------- */}
          {step === "otp" && (
            <motion.div
              key="otp"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <p className="text-center mb-4 text-sm opacity-80">
                OTP sent to <span className="font-semibold text-white">{email}</span>
              </p>

              <label className="text-sm opacity-80">Enter OTP</label>
              <div className="relative mt-1 mb-6">
                <Lock className="absolute left-3 top-3 opacity-70" size={18} />
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="6-digit OTP"
                  className="w-full pl-10 p-3 rounded-xl bg-white/30 text-white placeholder-white/70 focus:outline-none"
                />
              </div>

              <button
                onClick={verifyOtp}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-white/40 hover:bg-white/60 text-black font-semibold shadow-lg"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>

              <p
                onClick={() => setStep("email")}
                className="text-center text-xs opacity-70 mt-4 cursor-pointer hover:text-white"
              >
                ← Change Email
              </p>
            </motion.div>
          )}

        </AnimatePresence>

        {/* Signup button */}
        <div className="text-center mt-6 text-xs opacity-75">
          Don’t you have an account?
          <div className="mt-2">
            <button className="py-2 px-6 bg-white/40 rounded-xl text-black shadow">
              Sign up
            </button>
          </div>
        </div>
      </motion.div>

      {/* FOOTER */}
      <p className="absolute bottom-4 text-white/70 text-xs">
        Designed by Freepik
      </p>
    </div>
  );
}
