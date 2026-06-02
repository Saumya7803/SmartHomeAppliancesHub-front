import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { useCustomerAuth } from "../customer/hooks/useCustomerAuth";

function validateSignIn(values) {
  const errors = {};
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(String(values.email || "").trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (String(values.password || "").length < 6) {
    errors.password = "Password must be at least 6 characters.";
  }

  return errors;
}

export default function SignInPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signin } = useCustomerAuth();
  const [formData, setFormData] = useState({ email: "", password: "", rememberMe: true });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const fromPath = useMemo(() => location.state?.from?.pathname || "/account", [location.state]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validateSignIn(formData);
    setErrors(validationErrors);
    setSubmitError("");

    if (Object.keys(validationErrors).length) {
      return;
    }

    setIsSubmitting(true);

    try {
      await signin(formData);
      navigate(fromPath, { replace: true });
    } catch (error) {
      setSubmitError(error.message || "Unable to sign in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="customer-auth-page">
      <section className="customer-auth-shell">
        <div className="customer-auth-card">
          <p className="customer-auth-logo">Smart Home Appliance Hub</p>
          <h1>Customer Login</h1>
          <p className="customer-muted">Sign in to track your quotes, orders, and saved products.</p>

          <form className="customer-auth-form" onSubmit={handleSubmit} noValidate>
            <label>
              Email Address
              <div className="customer-input-wrap">
                <Mail size={16} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@company.com"
                  autoComplete="email"
                  required
                />
              </div>
              {errors.email ? <span className="field-error">{errors.email}</span> : null}
            </label>

            <label>
              Password
              <div className="customer-input-wrap">
                <LockKeyhole size={16} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="customer-password-toggle"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password ? <span className="field-error">{errors.password}</span> : null}
            </label>

            <label className="customer-remember-row">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              Remember Me
            </label>

            {submitError ? <p className="form-error">{submitError}</p> : null}

            <button type="submit" className="customer-btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "Signing In..." : "Sign In"}
            </button>

            <button
              type="button"
              className="customer-text-btn"
              onClick={() => (window.location.href = "mailto:sales@smarthomeappliances.co?subject=Customer%20Password%20Reset")}
            >
              Forgot Password
            </button>
          </form>

          <p className="customer-auth-footnote">
            Don&apos;t have an account? <Link to="/signup">Create Account</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
