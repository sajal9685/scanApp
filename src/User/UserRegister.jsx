import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import './UserRegister.css';

const UserRegister = () => {
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

  const registerUser = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;
      const userEmail = formData.email.toLowerCase();

      const userDocRef = doc(db, 'users', userEmail);
      await setDoc(userDocRef, {
        uid: user.uid,
        name: formData.name,
        email: formData.email,
        role: 'user',
        createdAt: new Date().toISOString(),
      });

      alert('User registered successfully!');
      setFormData({ email: '', name: '', password: '' });
      navigate('/Home');
    } catch (error) {
      console.error('Error registering user:', error);
      alert(`Registration failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="user-register-container">
      <div className="user-register-card">
        <h2 className="user-register-title">User Registration</h2>
        <p className="user-register-subtitle">Create your account</p>
        
        <form onSubmit={registerUser} className="user-register-form">
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
              onClick={() => navigate('/UserLogin')} 
              className="login-link-text"
            >
              {''}Sign In
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserRegister;