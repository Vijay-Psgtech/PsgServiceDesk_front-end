import { AuthProvider } from "./AuthContext";
import { InstitutionProvider } from "./InstitutionContext";
import { DepartmentProvider } from "./DepartmentContext";

const ContextWrapper = ({ children }) => {
  return (
    <AuthProvider>
      <InstitutionProvider>
        <DepartmentProvider>{children}</DepartmentProvider>
      </InstitutionProvider>
    </AuthProvider>
  );
};

export default ContextWrapper;
