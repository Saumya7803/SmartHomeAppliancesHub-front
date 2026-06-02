import { Navigate, useLocation } from "react-router-dom";
import { getAdminSession } from "../utils/adminAuth";

export default function ProtectedRoute({ allowedRoles = [], children }) {
  const location = useLocation();
  const session = getAdminSession();

  if (!session?.token) {
    return <Navigate to="/admin-login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length && session?.user && !allowedRoles.includes(session.user.role)) {
    return <Navigate to="/admin-login" replace />;
  }

  return children;
}
