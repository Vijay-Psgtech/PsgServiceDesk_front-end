import { createContext, useState, useContext } from "react";

const InstitutionContext = createContext();

export const InstitutionProvider = ({ children }) => {
  const [institution, setInstitution] = useState("All Institutions");

  return (
    <InstitutionContext.Provider value={{ institution, setInstitution }}>
      {children}
    </InstitutionContext.Provider>
  );
};

export const useInstitution = () => useContext(InstitutionContext);
