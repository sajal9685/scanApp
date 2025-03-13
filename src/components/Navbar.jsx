import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRegisterDropdownOpen, setIsRegisterDropdownOpen] = useState(false);
  const [isLoginDropdownOpen, setIsLoginDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scrolling effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 60) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleRegisterDropdown = () => {
    setIsRegisterDropdownOpen(!isRegisterDropdownOpen);
    setIsLoginDropdownOpen(false);
  };
  const toggleLoginDropdown = () => {
    setIsLoginDropdownOpen(!isLoginDropdownOpen);
    setIsRegisterDropdownOpen(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const closeDropdowns = (e) => {
      if (!e.target.closest('.navbar-item')) {
        setIsRegisterDropdownOpen(false);
        setIsLoginDropdownOpen(false);
      }
    };

    document.addEventListener('click', closeDropdowns);
    return () => document.removeEventListener('click', closeDropdowns);
  }, []);

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <div className="logo-container">
            <img src="/logo.jpeg" height={30} width={30}/>
            <span className='appName'>Scan App</span>
          </div>
        </Link>

        {/* Mobile Menu Toggle */}
        <button className="menu-toggle" onClick={toggleMenu} aria-label="Toggle menu">
          <span className={`menu-icon ${isMenuOpen ? 'open' : ''}`}>
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </span>
        </button>

        {/* Navbar Links */}
        <ul className={`navbar-links ${isMenuOpen ? 'open' : ''}`}>
          <div className="nav-items">
            <li>
              <Link to="/HomePage" className="navbar-item">
                <i className="nav-icon home-icon"></i>
                Home
              </Link>
            </li>
            <li>
              <Link to="/Home" className="navbar-item">
                <i className="nav-icon scan-icon"></i>
                ScanIn
              </Link>
            </li>
            <li>
              <Link to="/about" className="navbar-item">
                <i className="nav-icon qr-icon"></i>
                QR Code
              </Link>
            </li>
            <li>
              <div 
                className={`navbar-item dropdown-trigger ${isLoginDropdownOpen ? 'active' : ''}`} 
                onClick={toggleLoginDropdown}
              >
                <i className="nav-icon login-icon"></i>
                Login
                <i className={`dropdown-arrow ${isLoginDropdownOpen ? 'up' : 'down'}`}></i>
                
                {isLoginDropdownOpen && (
                  <ul className="dropdown-menu">
                    <li>
                      <Link to="/AdminLogin" className="dropdown-item">
                        Admin
                      </Link>
                    </li>
                    <li>
                      <Link to="/UserLogin" className="dropdown-item">
                        User
                      </Link>
                    </li>
                  </ul>
                )}
              </div>
            </li>
            <li>
              <Link to="/Dashboard" className="navbar-item">
                <i className="nav-icon dashboard-icon"></i>
                Dashboard
              </Link>
            </li>
          </div>
          
          {/* Register Dropdown */}
          <li 
            className={`navbar-item dropdown-trigger register-btn ${isRegisterDropdownOpen ? 'active' : ''}`} 
            onClick={toggleRegisterDropdown}
          >
            <i className="nav-icon register-icon"></i>
            Register
            <i className={`dropdown-arrow ${isRegisterDropdownOpen ? 'up' : 'down'}`}></i>
            
            {isRegisterDropdownOpen && (
              <ul className="dropdown-menu">
                <li>
                  <Link to="/AdminRegister" className="dropdown-item">
                    Admin
                  </Link>
                </li>
                <li>
                  <Link to="/UserRegister" className="dropdown-item">
                    User
                  </Link>
                </li>
              </ul>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;