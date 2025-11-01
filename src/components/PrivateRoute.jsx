import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

export default function PrivateRoute({ children }) {
  const { auth } = useAuth();
  if (!auth.accessToken) {
    // Not logged In redirect to login
    return <Navigate to="/" replace />;
  }

  return children;
}
