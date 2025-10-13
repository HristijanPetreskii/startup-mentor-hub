import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-grid">
          {/* Brand + copy */}
          <div className="brand-col">
            <div className="brand">
              <img src="Vector.png" alt="Mentor Token" />
              <span>Mentor Token</span>
            </div>
            <p className="brand-copy">
              With Mentor Token, every failure transforms into an opportunity for growth.
            </p>
          </div>

          {/* Pages */}
          <div className="links-col">
            <h3>Pages</h3>
            <ul className="link-list">
              <li><Link to="/" className="link">Home</Link></li>
              <li><Link to="/contact" className="link">Contact Us</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="contact-col">
            <h3>Contact</h3>
            <ul className="link-list">
              <li><a href="mailto:info@mentortoken.com" className="link">info@mentortoken.com</a></li>
              <li><a href="tel:+389123456789" className="link">+ (389) 123 456 789</a></li>
            </ul>
          </div>

          {/* Follow us */}
          <div className="follow-col">
            <h3>Follow Us</h3>
            <div className="socials">
              <a href="#" aria-label="LinkedIn" className="social"><img src="i.png" alt="LinkedIn" /></a>
              <a href="#" aria-label="Twitter"  className="social"><img src="t.png" alt="Twitter"  /></a>
              <a href="#" aria-label="Facebook" className="social"><img src="f.png" alt="Facebook" /></a>
            </div>
          </div>
        </div>

        <hr className="footer-divider" />
        <div className="footer-bottom">©2024 Mentor Token. All rights reserved.</div>
      </div>
    </footer>
  );
};

export default Footer;
