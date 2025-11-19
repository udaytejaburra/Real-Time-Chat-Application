import React, { useState } from 'react';
import axios from 'axios';
import './AuthForm.css';

const Register = ({ onRegister, onShowLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8080/auth/signup', {
        username,
        password
      });
      setMessage(res.data.message);
      onRegister(username);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title">Register</h2>
      {message && <p className="auth-message">{message}</p>}
      <form onSubmit={handleSubmit} className="auth-form">
        <input
          type="text"
          placeholder="Username"
          className="auth-input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="auth-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="auth-button">Register</button>
      </form>

      <div className="register-container">
        <p>Already have an account?</p>
        <button onClick={onShowLogin} className="register-button">Login</button>
      </div>
    </div>
  );
};

export default Register;
