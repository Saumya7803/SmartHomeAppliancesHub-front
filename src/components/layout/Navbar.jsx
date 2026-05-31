import { memo, useRef, useState } from "react";
import { ChevronDown, Clock3, Mail, PhoneCall } from "lucide-react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { contactInfo } from "../../data/contactInfo";
import { useCustomerAuth } from "../../customer/hooks/useCustomerAuth";
import CategoryDropdownMenu from "./CategoryDropdownMenu";
import brandLogo from "../../../imgs/smart home.png";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountCloseTimerRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useCustomerAuth();
  const showCategoryMenu = location.pathname === "/products";

  const closeMenu = () => {
    setMenuOpen(false);
    setAccountMenuOpen(false);
    if (accountCloseTimerRef.current) {
      clearTimeout(accountCloseTimerRef.current);
      accountCloseTimerRef.current = null;
    }
  };

  const handleAccountMouseEnter = () => {
    if (accountCloseTimerRef.current) {
      clearTimeout(accountCloseTimerRef.current);
      accountCloseTimerRef.current = null;
    }
    setAccountMenuOpen(true);
  };

  const handleAccountMouseLeave = () => {
    accountCloseTimerRef.current = setTimeout(() => {
      setAccountMenuOpen(false);
      accountCloseTimerRef.current = null;
    }, 220);
  };

  const handleLogout = () => {
    logout();
    setAccountMenuOpen(false);
    closeMenu();
    navigate("/signin");
  };

  return (
    <header className="navbar catalog-navbar">
      <div className="catalog-topbar">
        <div className="container catalog-topbar-grid">
          <a href={contactInfo.phoneHref} className="catalog-topbar-item">
            <PhoneCall size={16} strokeWidth={2} />
            <span className="catalog-topbar-copy">
              <small>Call Us</small>
              <span>{contactInfo.phoneDisplay}</span>
            </span>
          </a>

          <a href={contactInfo.emailHref} className="catalog-topbar-item catalog-topbar-item-center">
            <span className="catalog-topbar-copy">
              <small>Email</small>
              <span className="catalog-topbar-email-value contact-email">
                <Mail size={14} strokeWidth={2} />
                {contactInfo.email}
              </span>
            </span>
          </a>

          <div className="catalog-topbar-item catalog-topbar-item-end">
            <Clock3 size={16} strokeWidth={2} />
            <span className="catalog-topbar-copy">
              <small>Working Hours</small>
              <span>{contactInfo.businessHours}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="catalog-mainbar">
        <div className="container nav-wrapper">
          <Link to="/" className="brand" onClick={closeMenu}>
            <span className="brand-logo-frame">
              <img src={brandLogo} alt="Smart Home Appliance Hub logo" className="brand-logo" />
            </span>
            <span>Smart Home Appliance Hub</span>
          </Link>

          <button
            type="button"
            className={`menu-toggle ${menuOpen ? "open" : ""}`}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((value) => !value)}
          >
            <span />
            <span />
            <span />
          </button>

          <nav className={`nav-links ${menuOpen ? "open" : ""}`}>
            {showCategoryMenu ? <CategoryDropdownMenu onNavigate={closeMenu} /> : null}
            <NavLink to="/" end onClick={closeMenu}>
              Home
            </NavLink>
            <NavLink to="/products" onClick={closeMenu}>
              Products
            </NavLink>
            <NavLink to="/about" onClick={closeMenu}>
              About
            </NavLink>
            <NavLink to="/contact" onClick={closeMenu}>
              Contact
            </NavLink>
            <div
              className={`account-dropdown ${accountMenuOpen ? "open" : ""}`}
              onMouseEnter={handleAccountMouseEnter}
              onMouseLeave={handleAccountMouseLeave}
            >
              <button
                type="button"
                className="account-dropdown-trigger"
                onClick={() => setAccountMenuOpen((value) => !value)}
                aria-expanded={accountMenuOpen}
              >
                {isAuthenticated ? "My Account" : "Customer Login"} <ChevronDown size={16} />
              </button>
              {accountMenuOpen ? (
                <div className="account-dropdown-menu">
                  {!isAuthenticated ? (
                    <>
                      <Link to="/signin" onClick={closeMenu}>
                        Sign In
                      </Link>
                      <Link to="/signup" onClick={closeMenu}>
                        Create Account
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link to="/account" state={{ section: "profile" }} onClick={closeMenu}>
                        My Profile
                      </Link>
                      <Link to="/orders" state={{ section: "orders" }} onClick={closeMenu}>
                        My Orders
                      </Link>
                      <Link to="/quotes" state={{ section: "quotations" }} onClick={closeMenu}>
                        Requested Quotes
                      </Link>
                      <button type="button" onClick={handleLogout}>
                        Logout
                      </button>
                    </>
                  )}
                </div>
              ) : null}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default memo(Navbar);
