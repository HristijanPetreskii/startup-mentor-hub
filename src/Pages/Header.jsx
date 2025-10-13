import React from "react";
import { Link, NavLink } from "react-router-dom";
import "./Header.css";

const Header = () => {
  return (
    <header className="header">
      <div className="header-inner">
        {/* Left: logo */}
        <div className="logo">
          <img src="Vector.png" alt="Mentor Token" />
          <span>Mentor Token</span>
        </div>

        {/* Middle: nav */}
        <nav className="main-nav">
          <ul>
            <li>
              <NavLink to="/" end className="nav-link">
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/about" className="nav-link">
                About
              </NavLink>
            </li>
            <li>
              <NavLink to="/contact" className="nav-link">
                Contact
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* Right: auth */}
        <div className="auth-buttons">
          <Link to="/login" className="login-button">Login</Link>
          <Link to="/get-started" className="get-started-button">Get Started</Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
