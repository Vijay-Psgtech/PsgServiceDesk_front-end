import { createContext, useState, useContext } from "react";

const InstitutionContext = createContext();

export const InstitutionProvider = ({ children }) => {
  const [selectedInstitution, setSelectedInstiution] = useState("All Institutions");

  return (
    <InstitutionContext.Provider value={{ selectedInstitution, setSelectedInstiution }}>
      {children}
    </InstitutionContext.Provider>
  );
};

export const useInstitution = () => useContext(InstitutionContext);
