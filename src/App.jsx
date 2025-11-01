import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Auth/login";
import NavBar from "./components/Navbar";
import UserDashboard from "./components/User/UserDashboard";
import Attributes from "./components/Attributes";

function App() {

  return (
    <BrowserRouter>
        <Routes>
          <Route path="" element={<Login />} />
          <Route path="/attributes" element={
              <Attributes />
          }/>
          <Route path="/user-dashboard" element={<UserDashboard />} />
        </Routes>
    </BrowserRouter>
  )
}

export default App
