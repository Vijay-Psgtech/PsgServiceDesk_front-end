import React, { useEffect, useState } from "react";
import { HelpCircle, Eye, EyeOff } from "lucide-react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    userName: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);

  //Prefill saved userName on component mount
  useEffect(() => {
    const savedUserName = localStorage.getItem("rememberedUsername");
    if(savedUserName) {
      setForm((prev) => ({...prev, userName: savedUserName, rememberMe: true }));
    }
  },[]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value,
    });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", form);
      if (res.data.accessToken) {
        const { accessToken, user } = res.data;
        login(accessToken, user);

        // Remember userName only if checked
        if(form.rememberMe){
          localStorage.setItem("rememberedUsername", form.userName);
        } else {
          localStorage.removeItem("rememberedUsername");
        }
        if(user.role === 'user'){
          navigate("/user-dashboard")
        }else{
          navigate("/dashboard");
        }
      } else {
        setError("Invalid login credentials");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex-row lg:flex min-h-screen">
      {/*Left side - panel */}
      <div className="hidden lg:flex w-1/2 relative bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex-col justify-center items-center p-10 overflow-hidden">
        {/* Background Illustration */}
        <img
          src="/service-desk.png"
          alt="Logo"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />

        {/* Content */}
        <div className="relative z-10 text-center max-w-md"> 
          <h1 className="text-4xl font-bold mb-4">Service Desk Portal</h1>
          <p className="text-white/80 font-semibold text-lg leading-relaxed">
            Manage your IT tickets efficiently, track issues, and provide
            seamless support — all from one dashboard.
          </p>
        </div>
      </div>

      {/* Right side - login form */}
      <div className="flex w-full lg:w-1/2 justify-center items-center bg-gray-50 p-8">
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
          <div className="flex justify-center mb-2">
            <img
              src="/Logo2.png"
              alt="Company Logo"
              className="w-50 h-20 object-contain"
            />
          </div>
          <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
            Login to your account
          </h2>
          {error && (
            <div className="flex items-center bg-red-100 text-red-700 px-4 py-3 rounded mb-4">
              <HelpCircle className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* UserName */}
            <div>
              <label
                htmlFor="userName"
                className="block text-sm font-medium text-gray-600 mb-1"
              >
                UserName
              </label>
              <input
                type="text"
                name="userName"
                id="userName"
                value={form.userName}
                onChange={handleChange}
                required
                placeholder="Enter your username"
                className="w-full p-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-600 mb-1"
              >
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
                className="w-full p-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
              />
              <button
                type="button"
                className="absolute right-3 top-9 text-gray-400 hover: text-gray-600 transition"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>

            {/* Remember Me + Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={form.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-400"
                />
                <span className="text-gray-600">Remember me</span>
              </label>

              <a
                href="#"
                className="text-indigo-600 hover:underline hover:text-indigo-700 transition"
              >
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold p-3 rounded-lg shadow-md transition-all duration-300"
            >
              Sign In
            </button>
          </form>
          <div className="text-center text-gray-400 text-xs mt-8">
            © {new Date().getFullYear()} Service Desk Portal
          </div>
        </div>
      </div>
    </div>
  );
};

export default login;
