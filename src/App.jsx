import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./pages/Auth/login";
import NavBar from "./components/Navbar";
import UserDashboard from "./components/User/UserDashboard";
import Dashboard from "./pages/Dashboard";
import Attributes from "./components/Attributes";
import PrivateRoute from "./components/PrivateRoute";
import ActivityPage from "./pages/ActivityPages";
import DepartmentDetails from "./pages/ManageDepartment";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <NavBar />
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route 
          path="/attributes"
          element={
            <PrivateRoute>
              <NavBar />
              <Attributes />
            </PrivateRoute>
          }
        />
        <Route 
          path="/activity"
          element={
            <PrivateRoute>
              <NavBar />
              <ActivityPage />
            </PrivateRoute>
          }
        />
        <Route 
          path="/departments"
          element={
            <PrivateRoute>
              <NavBar />
              <DepartmentDetails />
            </PrivateRoute>
          }
        />
        <Route
          path="/user-dashboard"
          element={
            <PrivateRoute>
              <UserDashboard />
            </PrivateRoute>
          }
        />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </BrowserRouter>
  );
}

export default App;
