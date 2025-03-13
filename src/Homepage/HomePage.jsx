import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';  // CSS file for styling

const HomePage = () => {
  return (
    <div className="home-container">
      <header className="hero-section">
        <div className="hero-content">
          <h1>Welcome to ScanApp</h1>
          <p>Track employee attendance by scanning QR codes. Simple, fast, and secure!</p>
          <div className="cta-buttons">
            <Link to="/about" className="cta-btn login-btn">Scan QR Code</Link>
            <Link to="/UserLogin" className="cta-btn register-btn">Login</Link>
            <Link to="/UserRegister" className="cta-btn register-btn">Register</Link>
          </div>
        </div>
      </header>

      <section className="features">
        <div className="feature">
          <h2>Effortless Attendance</h2>
          <p>Employees can easily mark attendance with a QR scan. No more manual entry!</p>
        </div>
        <div className="feature">
          <h2>Track in Real-Time</h2>
          <p>Monitor attendance live as employees scan QR codes at the office entrance.</p>
        </div>
        <div className="feature">
          <h2>Safe and Secure</h2>
          <p>Our platform ensures that employee data and attendance are kept safe with the latest security standards.</p>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
