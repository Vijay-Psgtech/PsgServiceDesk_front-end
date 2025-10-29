import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Auth/login";
import NavBar from "./components/Navbar";
import UserDashboard from "./components/User/UserDashboard";
import { DepartmentProvider } from "./context/DepartmentContext";


function App() {

  return (
    <BrowserRouter>
        <Routes>
          <Route path="" element={<Login />} />
          <Route path="/dashboard" element={
            <DepartmentProvider>
              <NavBar />
              <UserDashboard />
            </DepartmentProvider>
          }/>
        </Routes>
    </BrowserRouter>
  )
}

export default App
