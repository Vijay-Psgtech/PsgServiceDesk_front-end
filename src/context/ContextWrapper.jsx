import { AuthProvider } from "./AuthContext";
import { DepartmentProvider } from "./DepartmentContext";

const ContextWrapper = ({ children }) => {
    return (
        <AuthProvider>
            <DepartmentProvider>
                {children}
            </DepartmentProvider>
        </AuthProvider>
    )
};

export default ContextWrapper;