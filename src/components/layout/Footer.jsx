import { memo } from "react";
import { Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { contactInfo } from "../../data/contactInfo";

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <h4>Smart Home Appliance Hub</h4>
          <p>
            B2B appliance and utility systems partner for corporate facilities, industrial spaces,
            and institutional projects.
          </p>
        </div>

        <div>
          <h5>Quick Links</h5>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/products">Products</Link>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
          </ul>
        </div>

        <div>
          <h5>{contactInfo.officeName}</h5>
          {contactInfo.officeAddressLines.map((line) => (
            <p key={line}>{line}</p>
          ))}
          <p>
            <a href={contactInfo.phoneHref}>{contactInfo.phoneDisplay}</a>
          </p>
          <p>
            <a href={contactInfo.emailHref} className="contact-email">
              <span className="contact-email-inline">
                <Mail size={16} strokeWidth={2} />
                {contactInfo.email}
              </span>
            </a>
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <p>{new Date().getFullYear()} Smart Home Appliance Hub B2B Catalogue</p>
        </div>
      </div>
    </footer>
  );
}

export default memo(Footer);
