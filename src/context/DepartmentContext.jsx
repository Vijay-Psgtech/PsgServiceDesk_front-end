"use client";
import { createContext, useContext, useState } from "react";

// Create the context
export const DepartmentContext = createContext();

// Provider component
export const DepartmentProvider = ({ children }) => {
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");

  return (            
    <DepartmentContext.Provider value={{ selectedDepartment, setSelectedDepartment }}>
      {children}
    </DepartmentContext.Provider>
  );
};

// ✅ Custom hook to use the context
export const useDepartment = () => {
  const context = useContext(DepartmentContext);
  if (!context) {
    throw new Error("useDepartment must be used within a DepartmentProvider");
  }
  return context;
};

