import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../hooks/useAdminAuth";
import { getDefaultPanelPath } from "../utils/roles";

export default function AdminLoginPage() {
  const { isAuthenticated, isLoading, login, user } = useAdminAuth();
  const navigate = useNavigate();
  const showDevCredentials = import.meta.env.DEV;

  const [formState, setFormState] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (isLoading) {
    return (
      <main className="admin-login-wrap">
        <section className="admin-login-card">
          <p>Checking session...</p>
        </section>
      </main>
    );
  }

  if (isAuthenticated && user) {
    return <Navigate to={getDefaultPanelPath(user.role)} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const authenticatedUser = await login(formState);
      navigate(getDefaultPanelPath(authenticatedUser.role), { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="admin-login-wrap">
      <section className="admin-login-card">
        <h1>SmartHome Admin Login</h1>
        <p>Secure sign-in for SmartHome control center access.</p>

        <form className="admin-login-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              value={formState.email}
              onChange={(event) => setFormState((value) => ({ ...value, email: event.target.value }))}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={formState.password}
              onChange={(event) => setFormState((value) => ({ ...value, password: event.target.value }))}
              required
            />
          </label>

          {error ? <p className="form-error">{error}</p> : null}

          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? "Signing In..." : "Login"}
          </button>
        </form>

        {showDevCredentials ? (
          <div className="admin-login-hint">
            <p>Super Admin: admin@smarthome.com / Admin@123</p>
            <p>Admin: manager@smarthome.com / Manager@123</p>
            <p>Development Team: dev@smarthome.com / Dev@123</p>
            <p>Operator: operator@smarthome.com / Operator@123</p>
            <p>Sales Team: sales@smarthomeappliances.co / Sales@123</p>
          </div>
        ) : null}
      </section>
    </main>
  );
}
