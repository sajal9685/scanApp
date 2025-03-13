import React, { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import './AdminRegister.css';

const AdminLogin = ({ setUser = () => {} }) => { // Fallback for setUser
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [passwordVisibility, setPasswordVisibility] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loggedInEmail = localStorage.getItem("adminEmail");
    if (loggedInEmail) {
      setUser(true);
      navigate("/dashboard");
    }
  }, [navigate, setUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      setUser(true);
      localStorage.setItem("adminEmail", user.email);

      navigate("/dashboard");
    } catch (err) {
      console.error("Error during login:", err);
      setError("Invalid email or password. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-register-container">
      <div className="admin-register-card">
        <h2 className="admin-register-title">Admin Login</h2>
        <p className="admin-register-subtitle">Access your administrative account</p>
        <form onSubmit={handleLogin} className="admin-register-form">
          <div className="form-input-group">
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="form-input"
              placeholder=" "
            />
            <label htmlFor="email" className="form-label">Email Address</label>
          </div>
          <div className="form-input-group">
            <input
              id="password"
              name="password"
              type={passwordVisibility ? "text" : "password"}
              required
              value={formData.password}
              onChange={handleInputChange}
              className="form-input"
              placeholder=" "
              minLength={6}
            />
            <label htmlFor="password" className="form-label">Password</label>
            <button
              type="button"
              onClick={() => setPasswordVisibility(!passwordVisibility)}
              className="password-toggle"
            >
              {passwordVisibility ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" disabled={isSubmitting} className="submit-button">
            {isSubmitting ? 'Logging In...' : 'Login'}
          </button>
          <div className="login-link">
            Don't have an account? 
            <span onClick={() => navigate('/AdminRegister')} className="login-link-text">
              {' '}Register
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
