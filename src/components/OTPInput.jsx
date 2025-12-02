import React from "react";

export default function OTPInput({ value, onChange, length = 6 }) {
  const inputs = Array.from({ length });

  const handleChange = (e, i) => {
    const val = e.target.value.replace(/\D/, "");
    const newOtp = value.split("");
    newOtp[i] = val;
    onChange(newOtp.join(""));
    if (val && e.target.nextSibling) e.target.nextSibling.focus();
  };

  return (
    <div className="flex justify-center space-x-2">
      {inputs.map((_, i) => (
        <input
          key={i}
          type="text"
          maxLength="1"
          value={value[i] || ""}
          onChange={(e) => handleChange(e, i)}
          className="w-10 h-12 text-center text-lg bg-black/50 border border-cyan-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
        />
      ))}
    </div>
  );
}
