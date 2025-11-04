import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Auth/login";
import NavBar from "./components/Navbar";
import UserDashboard from "./components/User/UserDashboard";
import Dashboard from "./pages/Dashboard";
import TicketsTable from "./components/ui/TicketsTables";
import Attributes from "./components/Attributes";
import PrivateRoute from "./components/PrivateRoute";
import ActivityPage from "./pages/ActivityPages";
import DepartmentDetails from "./pages/ManageDepartment";
import UserManagement from "./components/userManagement";

function App() {
  return (
    <Routes>
      <Route path="" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute allowedRoles={["superadmin", "admin"]}>
            <NavBar />
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/tickets"
        element={
          <PrivateRoute allowedRoles={["superadmin", "admin"]}>
            <NavBar />
            <TicketsTable />
          </PrivateRoute>
        }
      />
      <Route
        path="/attributes"
        element={
          <PrivateRoute allowedRoles={["superadmin", "admin"]}>
            <NavBar />
            <Attributes />
          </PrivateRoute>
        }
      />
      <Route
        path="/activity"
        element={
          <PrivateRoute allowedRoles={["superadmin", "admin"]}>
            <NavBar />
            <ActivityPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/departments"
        element={
          <PrivateRoute allowedRoles={["superadmin", "admin"]}>
            <NavBar />
            <DepartmentDetails />
          </PrivateRoute>
        }
      />
      <Route
        path="/users"
        element={
          <PrivateRoute allowedRoles={["superadmin", "admin"]}>
            <NavBar />
            <UserManagement />
          </PrivateRoute>
        }
      />
      <Route path="/user-dashboard" element={<UserDashboard />} />
    </Routes>
  );
}

export default App;
