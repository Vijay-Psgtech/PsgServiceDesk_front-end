import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

export default function PrivateRoute({ children, allowedRoles = [] }) {
  const { auth } = useAuth();
  const [hasShownToast, setHasShownToast] = useState(false);

  // Not logged in → redirect to login
  if (!auth?.accessToken) {
    return <Navigate to="/login" replace />;
  }

  // Unauthorized access
  const isAllowed =
    allowedRoles.length === 0 || allowedRoles.includes(auth.user.role);

  useEffect(() => {
    if (!isAllowed && !hasShownToast) {
      toast.error("Access Denied");
      setHasShownToast(true);
    }
  }, [isAllowed, hasShownToast]);

  if (!isAllowed) {
    // redirect without repeatedly showing toast
    return <Navigate to="/user-dashboard" replace />;
  }

  return children;
}
