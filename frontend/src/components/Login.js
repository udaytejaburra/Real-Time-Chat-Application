
import React, { useState } from 'react';
import axios from 'axios';
import './AuthForm.css';

const Login = ({ onLogin, onShowRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8080/auth/signin', {
        username,
        password
      });
      const { jwtToken } = res.data;
      onLogin(username, jwtToken);
    } catch (error) {
      alert('Login failed. Check your credentials.');
    }
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title">Login</h2>
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
        <button type="submit" className="auth-button">Login</button>
      </form>

      <div className="register-container">
        <p>Don't have an account?</p>
        <button onClick={onShowRegister} className="register-button">Register</button>
      </div>
    </div>
  );
};

export default Login;

