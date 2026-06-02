import { useState } from "react";
import { contactInfo } from "../../data/contactInfo";
import { buildApiUrl } from "../../utils/apiBase";

const INITIAL_FORM = {
  customer_name: "",
  company_name: "",
  phone: "",
  email: "",
  quantity: "1",
  message: "",
};

function buildEnquiryMessage({ companyName, modelNumber, requirements }) {
  const lines = [];

  if (companyName) {
    lines.push(`Company Name: ${companyName}`);
  }
  if (modelNumber) {
    lines.push(`Model Number: ${modelNumber}`);
  }
  if (requirements) {
    lines.push(`Requirements: ${requirements}`);
  }

  return lines.length ? lines.join("\n") : null;
}

export default function EnquiryModal({ product, onClose }) {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [enquiryCode, setEnquiryCode] = useState("");

  if (!product) {
    return null;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch(buildApiUrl("/products/enquiries"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_name: formData.customer_name.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim().toLowerCase(),
          product_id: Number(product.id),
          product_name: product.name,
          quantity: Number(formData.quantity || 1),
          message: buildEnquiryMessage({
            companyName: formData.company_name.trim(),
            modelNumber: product.modelNumber,
            requirements: formData.message.trim(),
          }),
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.message || "Failed to submit enquiry");
      }

      setEnquiryCode(payload.enquiryCode || "");
      setIsSubmitted(true);
    } catch (requestError) {
      setError(requestError.message || "Failed to submit enquiry");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="enquiry-title">
      <div className="enquiry-modal">
        <div className="enquiry-modal-header">
          <div>
            <h2 id="enquiry-title">Request for Quote</h2>
            <p className="enquiry-modal-subtitle">
              Enquiries are sent to{" "}
              <a href={contactInfo.emailHref} className="contact-email">
                {contactInfo.email}
              </a>
            </p>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            x
          </button>
        </div>

        {isSubmitted ? (
          <div className="enquiry-success">
            <h3>Enquiry sent successfully</h3>
            <p>
              Your RFQ has been submitted to{" "}
              <a href={contactInfo.emailHref} className="contact-email">
                {contactInfo.email}
              </a>
              .
            </p>
            {enquiryCode ? <p>Reference: {enquiryCode}</p> : null}
            <div className="enquiry-form-actions enquiry-success-actions">
              <button type="button" className="btn-primary" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        ) : (
          <form className="enquiry-form" onSubmit={handleSubmit}>
            <label>
              Name
              <input
                type="text"
                name="customer_name"
                value={formData.customer_name}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Company Name
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Phone Number
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Email
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Product Name
              <input type="text" value={product.name} readOnly />
            </label>

            <label>
              Model Number
              <input type="text" value={product.modelNumber || "-"} readOnly />
            </label>

            <label>
              Quantity
              <input
                type="number"
                name="quantity"
                min="1"
                step="1"
                value={formData.quantity}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Message / Requirements
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                placeholder="Share quantity splits, deployment location, timeline, and any technical notes"
              />
            </label>

            {error ? <p className="form-error">{error}</p> : null}

            <div className="enquiry-form-actions">
              <button type="submit" className="btn-primary enquiry-submit" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Enquiry"}
              </button>
              <button type="button" className="btn-outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
