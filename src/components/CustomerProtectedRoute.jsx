import { Navigate, useLocation } from "react-router-dom";
import { useCustomerAuth } from "../customer/hooks/useCustomerAuth";

export default function CustomerProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useCustomerAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <main className="container section-padded">
        <div className="empty-state">
          <h1>Loading account...</h1>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return children;
}
