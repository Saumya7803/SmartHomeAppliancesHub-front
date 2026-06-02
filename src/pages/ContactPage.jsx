import { useState } from "react";
import { Mail, MapPin, MessageCircle, PhoneCall } from "lucide-react";
import { contactInfo } from "../data/contactInfo";

const INITIAL_FORM = {
  firstName: "",
  lastName: "",
  businessEmail: "",
  phoneNumber: "",
  message: "",
  interests: [],
};

const interestOptions = [
  "Air Conditioners",
  "Air Coolers",
  "Microwaves",
  "Refrigerators",
  "Washing Machines",
  "Bulk Procurement",
];

const contactItems = [
  {
    title: "Email us",
    description: "Send product requirements, bulk purchase enquiries, or dealership requests.",
    value: contactInfo.email,
    href: contactInfo.emailHref,
    Icon: Mail,
    isEmail: true,
  },
  {
    title: "Call us",
    description: `${contactInfo.businessHoursDays} from ${contactInfo.businessHoursTime}.`,
    value: contactInfo.phoneDisplay,
    href: contactInfo.phoneHref,
    Icon: PhoneCall,
  },
  {
    title: "WhatsApp",
    description: "Get a faster response for urgent product questions and follow-up.",
    value: contactInfo.whatsappDisplay,
    href: contactInfo.whatsappHref,
    Icon: MessageCircle,
  },
  {
    title: "Visit us",
    description: "Meet our team at the Delhi office for business discussions.",
    value: contactInfo.officeAddressText,
    href: null,
    Icon: MapPin,
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleInterestToggle = (interest) => {
    setFormData((current) => {
      const nextInterests = current.interests.includes(interest)
        ? current.interests.filter((item) => item !== interest)
        : [...current.interests, interest];

      return {
        ...current,
        interests: nextInterests,
      };
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitted(false);

    const payload = {
      ...formData,
      submittedAt: new Date().toISOString(),
    };

    console.log("Business enquiry submitted:", payload);

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData(INITIAL_FORM);
    }, 600);
  };

  return (
    <main className="contact-studio-page">
      <section className="contact-studio-section section-padded">
        <div className="container">
          <div className="contact-studio-intro">
            <p className="contact-studio-eyebrow">Contact SmartHome Automation</p>
            <h1>Contact our team</h1>
            <p>
              Got questions about products, pricing, or bulk planning? Speak with our team and get
              a clear response for your project requirements.
            </p>
          </div>

          <div className="contact-studio-frame">
            <div className="contact-studio-grid">
              <article className="contact-studio-form-card">
                <div className="contact-studio-block-head">
                  <h2>Send us a message</h2>
                  <p>
                    Share your requirement and we will respond with the right product direction,
                    quote support, or next step.
                  </p>
                </div>

                {submitted ? (
                  <p className="form-success">Your enquiry has been sent successfully.</p>
                ) : null}

                <form className="contact-studio-form" onSubmit={handleSubmit}>
                  <label>
                    First name
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="First name"
                      required
                    />
                  </label>

                  <label>
                    Last name
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Last name"
                      required
                    />
                  </label>

                  <label className="span-2">
                    Email
                    <input
                      type="email"
                      name="businessEmail"
                      value={formData.businessEmail}
                      onChange={handleInputChange}
                      placeholder="you@company.com"
                      required
                    />
                  </label>

                  <label className="span-2">
                    Phone number
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="+91 79053 50134"
                      required
                    />
                  </label>

                  <label className="span-2">
                    Message
                    <textarea
                      name="message"
                      rows={6}
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Tell us what products, quantity, delivery location, or support you need."
                      required
                    />
                  </label>

                  <fieldset className="span-2 contact-studio-interest-group">
                    <legend>Services / Product interest</legend>
                    <div className="contact-studio-interest-grid">
                      {interestOptions.map((interest) => (
                        <label key={interest} className="contact-studio-check">
                          <input
                            type="checkbox"
                            checked={formData.interests.includes(interest)}
                            onChange={() => handleInterestToggle(interest)}
                          />
                          <span>{interest}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <div className="span-2 contact-studio-actions">
                    <button type="submit" className="contact-studio-submit" disabled={isSubmitting}>
                      {isSubmitting ? "Sending..." : "Send message"}
                    </button>
                  </div>
                </form>
              </article>

              <aside className="contact-studio-side-card">
                <div className="contact-studio-block-head">
                  <h2>Chat with us</h2>
                  <p>Choose the fastest channel based on how you want to connect.</p>
                </div>

                <div className="contact-studio-side-list">
                  {contactItems.map((item) => (
                    <article key={item.title} className="contact-studio-side-item">
                      <span className="contact-studio-side-icon" aria-hidden="true">
                        <item.Icon size={18} strokeWidth={2} />
                      </span>
                      <div>
                        <h3>{item.title}</h3>
                        <p>{item.description}</p>
                        {item.href ? (
                          <a
                            href={item.href}
                            className={item.isEmail ? "contact-email" : "contact-studio-link"}
                          >
                            {item.value}
                          </a>
                        ) : (
                          <strong>{item.value}</strong>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </aside>
            </div>
          </div>

          <article className="contact-studio-map-card">
            <div className="contact-studio-map-head">
              <div>
                <p className="contact-studio-eyebrow">Office Location</p>
                <h2>Visit or locate our office</h2>
              </div>
              <p>{contactInfo.officeAddressText}</p>
            </div>
            <div className="map-frame-wrap">
              <iframe
                title={`${contactInfo.officeName} Location`}
                src={contactInfo.mapsEmbedUrl}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
