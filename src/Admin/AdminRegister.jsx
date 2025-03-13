import React, { useState } from 'react';
import { collection, addDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { db, auth } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import './AdminRegister.css';  // Import the CSS file

const AdminRegister = () => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordVisibility, setPasswordVisibility] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const registerAdmin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      await addDoc(collection(db, "admins"), {
        uid: user.uid,
        name: formData.name,
        email: formData.email,
        role: "admin",
        createdAt: new Date().toISOString(),
      });

      alert('Admin registered successfully!');
      setFormData({ email: '', name: '', password: '' });
      navigate('/AdminLogin');
    } catch (error) {
      console.error("Error registering admin:", error);
      alert(`Registration failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-register-container">
      <div className="admin-register-card">
        <h2 className="admin-register-title">Admin Registration</h2>
        <p className="admin-register-subtitle">Create your administrative account</p>
        
        <form onSubmit={registerAdmin} className="admin-register-form">
          <div className="form-input-group">
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleInputChange}
              className="form-input"
              placeholder=" "
            />
            <label htmlFor="name" className="form-label">Full Name</label>
          </div>

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

          <button
            type="submit"
            disabled={isSubmitting}
            className="submit-button"
          >
            {isSubmitting ? 'Registering...' : 'Create Account'}
          </button>

          <div className="login-link">
            Already have an account? 
            <span 
              onClick={() => navigate('/AdminLogin')} 
              className="login-link-text"
            >
              {' '}Sign In
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminRegister;