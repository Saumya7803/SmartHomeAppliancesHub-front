import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useCustomerAuth } from "../customer/hooks/useCustomerAuth";

function validateSignUp(values) {
  const errors = {};
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\+?[0-9\s()-]{7,20}$/;

  if (String(values.fullName || "").trim().length < 2) {
    errors.fullName = "Full name is required.";
  }

  if (!phoneRegex.test(String(values.phoneNumber || "").trim())) {
    errors.phoneNumber = "Enter a valid phone number.";
  }

  if (!emailRegex.test(String(values.email || "").trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (String(values.password || "").length < 6) {
    errors.password = "Password must be at least 6 characters.";
  }

  if (values.confirmPassword !== values.password) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
}

export default function SignUpPage() {
  const navigate = useNavigate();
  const { signup } = useCustomerAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    companyName: "",
    phoneNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validateSignUp(formData);
    setErrors(validationErrors);
    setSubmitError("");

    if (Object.keys(validationErrors).length) {
      return;
    }

    setIsSubmitting(true);

    try {
      await signup(formData);
      navigate("/account", { replace: true });
    } catch (error) {
      setSubmitError(error.message || "Unable to create account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="customer-auth-page">
      <section className="customer-auth-shell">
        <div className="customer-auth-card customer-auth-card-wide">
          <p className="customer-auth-logo">Smart Home Appliance Hub</p>
          <h1>Create Customer Account</h1>
          <p className="customer-muted">Create your account to request quotes and track order progress.</p>

          <form className="customer-auth-form customer-auth-form-two-col" onSubmit={handleSubmit} noValidate>
            <label>
              Full Name
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
              {errors.fullName ? <span className="field-error">{errors.fullName}</span> : null}
            </label>

            <label>
              Company Name (optional)
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
              />
            </label>

            <label>
              Phone Number
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
              />
              {errors.phoneNumber ? <span className="field-error">{errors.phoneNumber}</span> : null}
            </label>

            <label>
              Email Address
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              {errors.email ? <span className="field-error">{errors.email}</span> : null}
            </label>

            <label>
              Password
              <div className="customer-input-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
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

            <label>
              Confirm Password
              <div className="customer-input-wrap">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="customer-password-toggle"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowConfirmPassword((value) => !value)}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword ? <span className="field-error">{errors.confirmPassword}</span> : null}
            </label>

            {submitError ? <p className="form-error span-2">{submitError}</p> : null}

            <div className="span-2">
              <button type="submit" className="customer-btn-primary" disabled={isSubmitting}>
                {isSubmitting ? "Creating Account..." : "Create Account"}
              </button>
            </div>
          </form>

          <p className="customer-auth-footnote">
            Already have an account? <Link to="/signin">Sign In</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
