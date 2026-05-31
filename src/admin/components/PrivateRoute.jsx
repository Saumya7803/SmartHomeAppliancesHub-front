import { Navigate } from "react-router-dom";
import { useAdminAuth } from "../hooks/useAdminAuth";
import { normalizeUserRole } from "../utils/roles";

export default function PrivateRoute({ roles = [], children }) {
  const { isAuthenticated, isLoading, user } = useAdminAuth();

  if (isLoading) {
    return (
      <main className="container section-padded">
        <div className="empty-state">
          <p>Checking access...</p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/admin-login" replace />;
  }

  if (roles.length && !roles.includes(normalizeUserRole(user.role))) {
    return <Navigate to="/admin-login" replace />;
  }

  return children;
}
