import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import background from "../imgs/background.png";
import { brandLogos } from "../data/brandLogos";

const ecosystemFeatures = [
  {
    title: "Connected Experience",
    description: "Control multiple appliances through app-enabled and smart-ready systems.",
  },
  {
    title: "Energy Efficiency",
    description: "Curated products with lower power consumption and optimized operation cycles.",
  },
  {
    title: "Comfort Automation",
    description: "Schedule and automate everyday appliance usage across rooms and zones.",
  },
  {
    title: "Service Ecosystem",
    description: "Unified support for installation guidance, warranty help, and product upgrades.",
  },
];

const industriesServed = [
  {
    icon: "CO",
    title: "Corporate Offices",
    description: "Energy-efficient appliance systems for multi-floor office operations.",
  },
  {
    icon: "HS",
    title: "Hospitality",
    description: "Reliable refrigeration, display, and utility deployments for guest facilities.",
  },
  {
    icon: "HC",
    title: "Healthcare",
    description: "Temperature-controlled appliance infrastructure for clinical support spaces.",
  },
  {
    icon: "IN",
    title: "Industrial Units",
    description: "Durable cooling and utility appliances for plant and workshop environments.",
  },
  {
    icon: "RT",
    title: "Retail Chains",
    description: "Standardized appliance solutions for distributed store rollouts.",
  },
  {
    icon: "ED",
    title: "Institutions",
    description: "Scalable solutions for campuses, canteens, and staff service areas.",
  },
];

const whyChooseUs = [
  {
    title: "Trusted Product Curation",
    description: "Only reputed appliance lines selected for quality, durability, and performance.",
  },
  {
    title: "Expert Consultation",
    description: "Get guidance on the right model mix based on space, usage, and budget.",
  },
  {
    title: "Transparent Enquiry Process",
    description: "Quick quote response with clear specs, timelines, and support information.",
  },
  {
    title: "After-Sales Confidence",
    description: "Post-purchase coordination for service and maintenance support requirements.",
  },
];

const initialInquiry = {
  fullName: "",
  email: "",
  phone: "",
  interest: "",
  message: "",
};

const inquiryCategories = [
  "Refrigeration",
  "HVAC",
  "Displays",
  "Laundry Appliances",
  "Cooling Utilities",
];

export default function HomePage() {
  const [inquiryForm, setInquiryForm] = useState(initialInquiry);
  const [isInquirySubmitting, setIsInquirySubmitting] = useState(false);
  const [inquirySubmitted, setInquirySubmitted] = useState(false);

  const featuredBrands = useMemo(() => Object.entries(brandLogos).slice(0, 10), []);

  const handleInquiryChange = (event) => {
    const { name, value } = event.target;
    setInquiryForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleInquirySubmit = (event) => {
    event.preventDefault();
    setIsInquirySubmitting(true);
    setInquirySubmitted(false);

    console.log("Homepage inquiry submitted:", inquiryForm);

    setTimeout(() => {
      setIsInquirySubmitting(false);
      setInquirySubmitted(true);
      setInquiryForm(initialInquiry);
    }, 650);
  };

  return (
    <main className="catalog-homepage">
      <section
        className="catalog-hero-section"
        style={{
          backgroundImage: `url(${background})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="catalog-hero-overlay" />
        <div className="container">
          <div className="catalog-hero-content">
            <h1>Industrial Appliance Solutions for Modern Facilities</h1>
            <p>
              Enterprise-grade refrigeration, HVAC, and utility appliances designed for commercial
              procurement teams.
            </p>
            <div className="catalog-hero-actions">
              <Link to="/products" className="btn-primary">
                Browse Products
              </Link>
              <Link to="/contact" className="btn-outline">
                Request Quote
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padded section-tight">
        <div className="container">
          <h2>Why Choose SmartHome</h2>
          <div className="catalog-why-grid">
            {whyChooseUs.map((item) => (
              <article key={item.title} className="catalog-why-card">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padded catalog-ecosystem-section">
        <div className="container catalog-ecosystem-grid">
          <div>
            <h2>Smart Home Ecosystem</h2>
            <p className="section-copy">
              Build a connected living environment with products designed to work better together.
            </p>
            <Link to="/products" className="btn-primary">
              Explore Ecosystem Products
            </Link>
          </div>
          <div className="catalog-ecosystem-cards">
            {ecosystemFeatures.map((feature) => (
              <article key={feature.title} className="catalog-ecosystem-card">
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padded section-tight">
        <div className="container">
          <h2>Industries We Serve</h2>
          <div className="catalog-industries-grid">
            {industriesServed.map((industry) => (
              <article key={industry.title} className="catalog-industry-card">
                <span>{industry.icon}</span>
                <h3>{industry.title}</h3>
                <p>{industry.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padded section-tight">
        <div className="container">
          <h2>Brands We Work With</h2>
          <div className="catalog-brand-grid">
            {featuredBrands.map(([brandName, logo]) => (
              <article key={brandName} className="catalog-brand-card">
                <img src={logo} alt={`${brandName} logo`} />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padded section-tight">
        <div className="container">
          <article className="catalog-inquiry-card">
            <h2>Request Quote</h2>
            <p className="section-copy">Tell us what you are looking for and our team will get back shortly.</p>
            {inquirySubmitted ? <p className="form-success">Inquiry sent successfully.</p> : null}

            <form className="catalog-inquiry-form" onSubmit={handleInquirySubmit}>
              <label>
                Full Name
                <input
                  type="text"
                  name="fullName"
                  value={inquiryForm.fullName}
                  onChange={handleInquiryChange}
                  required
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  name="email"
                  value={inquiryForm.email}
                  onChange={handleInquiryChange}
                  required
                />
              </label>
              <label>
                Phone
                <input
                  type="tel"
                  name="phone"
                  value={inquiryForm.phone}
                  onChange={handleInquiryChange}
                  required
                />
              </label>
              <label>
                Product Interest
                <select
                  name="interest"
                  value={inquiryForm.interest}
                  onChange={handleInquiryChange}
                  required
                >
                  <option value="">Select category</option>
                  {inquiryCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
              <label className="span-2">
                Message
                <textarea
                  name="message"
                  rows={4}
                  value={inquiryForm.message}
                  onChange={handleInquiryChange}
                  placeholder="Share your preferred models, quantity, and timeline"
                  required
                />
              </label>
              <div className="span-2">
                <button type="submit" className="btn-primary" disabled={isInquirySubmitting}>
                  {isInquirySubmitting ? "Sending..." : "Send Inquiry"}
                </button>
              </div>
            </form>
          </article>
        </div>
      </section>
    </main>
  );
}
