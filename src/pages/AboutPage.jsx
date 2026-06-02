import { Link } from "react-router-dom";
import {
  BadgeCheck,
  Building2,
  Headset,
  ShieldCheck,
  Sparkles,
  Truck,
  Wrench,
} from "lucide-react";

const ABOUT_METRICS = [
  { value: "5+", label: "Core appliance categories" },
  { value: "24-48h", label: "Quote response window" },
  { value: "Delhi NCR", label: "Primary service coverage" },
];

const ABOUT_VALUES = [
  {
    Icon: Sparkles,
    title: "Curated Appliance Range",
    description:
      "We focus on cooling, kitchen, and laundry products that fit real household and project needs.",
  },
  {
    Icon: ShieldCheck,
    title: "Dependable Product Quality",
    description:
      "Our catalogue is built around trusted brands, clear specifications, and business-ready product information.",
  },
  {
    Icon: Truck,
    title: "Order-to-Delivery Coordination",
    description:
      "From selection to dispatch, we keep communication clear so delivery expectations stay practical and predictable.",
  },
  {
    Icon: Headset,
    title: "Responsive Customer Support",
    description:
      "We help with model selection, quotation follow-up, and post-purchase coordination through a single team.",
  },
];

const ABOUT_PROCESS = [
  {
    step: "01",
    title: "Understand the requirement",
    description:
      "We review your space, quantity, performance expectation, and preferred brands before suggesting options.",
  },
  {
    step: "02",
    title: "Recommend the right mix",
    description:
      "You get appliance choices that balance budget, energy efficiency, and installation practicality.",
  },
  {
    step: "03",
    title: "Coordinate supply and support",
    description:
      "Once approved, we align delivery timelines, product details, and communication through fulfillment.",
  },
];

export default function AboutPage() {
  return (
    <main className="about-page">
      <section className="about-hero">
        <div className="container about-hero-grid">
          <div className="about-hero-copy">
            <p className="hero-label">About SmartHome Automation</p>
            <h1>Professional appliance sourcing with practical support from selection to supply.</h1>
            <p>
              SmartHome Automation is built for customers who want a cleaner buying experience for
              air conditioners, coolers, microwaves, refrigerators, and washing machines. We focus
              on straightforward product guidance, dependable brand options, and responsive support.
            </p>

            <div className="about-hero-actions">
              <Link to="/products" className="btn-primary">
                Explore Products
              </Link>
              <Link to="/contact" className="btn-outline">
                Talk to Our Team
              </Link>
            </div>

            <div className="about-metrics-grid">
              {ABOUT_METRICS.map((item) => (
                <article key={item.label} className="about-metric-card">
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </article>
              ))}
            </div>
          </div>

          <aside className="about-hero-panel">
            <div className="about-panel-top">
              <span className="about-panel-icon" aria-hidden="true">
                <Building2 size={20} strokeWidth={2} />
              </span>
              <div>
                <p>Who We Serve</p>
                <h2>Homes, offices, retail spaces, and procurement-led projects.</h2>
              </div>
            </div>

            <div className="about-panel-list">
              <article>
                <BadgeCheck size={18} strokeWidth={2} />
                <div>
                  <h3>Clear product guidance</h3>
                  <p>Shortlist appliances based on usage, room size, budget, and feature needs.</p>
                </div>
              </article>
              <article>
                <Truck size={18} strokeWidth={2} />
                <div>
                  <h3>Coordinated fulfillment</h3>
                  <p>Stay aligned on quote status, supply timelines, and dispatch communication.</p>
                </div>
              </article>
              <article>
                <Wrench size={18} strokeWidth={2} />
                <div>
                  <h3>After-sales assistance</h3>
                  <p>Get help on warranty coordination, escalation, and service follow-through.</p>
                </div>
              </article>
            </div>
          </aside>
        </div>
      </section>

      <section className="section-padded about-story-section">
        <div className="container about-story-grid">
          <article className="about-story-card about-story-card-accent">
            <p className="about-section-kicker">Our Approach</p>
            <h2>We keep appliance buying practical, not confusing.</h2>
            <p>
              Most customers do not need an oversized catalogue or vague claims. They need the
              right appliance, the right information, and a team that answers clearly. That is the
              operating standard we use for every enquiry.
            </p>
          </article>

          <article className="about-story-card">
            <p className="about-section-kicker">What Matters to Us</p>
            <h2>Useful advice, reliable brands, and accountable communication.</h2>
            <p>
              Whether the order is for a single home upgrade or a multi-unit business requirement,
              we work to keep recommendations grounded in function, efficiency, and long-term value.
            </p>
          </article>
        </div>
      </section>

      <section className="section-padded section-tight">
        <div className="container">
          <div className="about-section-head">
            <p className="about-section-kicker">Why SmartHome</p>
            <h2>Built around trust, clarity, and service discipline.</h2>
          </div>

          <div className="about-values-grid">
            {ABOUT_VALUES.map((item) => (
              <article key={item.title} className="about-value-card">
                <span className="about-value-icon" aria-hidden="true">
                  <item.Icon size={20} strokeWidth={2} />
                </span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padded section-tight about-process-section">
        <div className="container">
          <div className="about-section-head">
            <p className="about-section-kicker">How We Work</p>
            <h2>A simple process from enquiry to fulfillment.</h2>
          </div>

          <div className="about-process-grid">
            {ABOUT_PROCESS.map((item) => (
              <article key={item.step} className="about-process-card">
                <span>{item.step}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padded section-tight">
        <div className="container">
          <article className="about-cta-card">
            <div>
              <p className="about-section-kicker">Ready to Talk</p>
              <h2>Need help selecting appliances for home or business use?</h2>
              <p>
                Browse the catalogue or send your requirement and we will guide you toward the
                right models.
              </p>
            </div>
            <div className="about-cta-actions">
              <Link to="/products" className="btn-primary">
                Browse Products
              </Link>
              <Link to="/contact" className="btn-outline">
                Contact Us
              </Link>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
