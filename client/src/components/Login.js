import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Use your backend URL from .env
const API_URL = process.env.REACT_APP_API_URL || 'https://ourchive-backend.onrender.com/api/auth';

function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState('');
  const [backendOnline, setBackendOnline] = useState(false);

  // ✅ Check backend status when component mounts
  useEffect(() => {
    const checkBackend = async () => {
      try {
        await axios.get(`${API_URL}/test`);
        setBackendOnline(true);
      } catch (err) {
        console.error("Backend not reachable:", err.message);
        setBackendOnline(false);
      }
    };
    checkBackend();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!backendOnline) {
      setMessage("⚠️ Backend server is not reachable. Please try again later.");
      return;
    }

    try {
      let res;
      if (isLogin) {
        res = await axios.post(`${API_URL}/login`, { username, password });
        localStorage.setItem('token', res.data.token);
        onLoginSuccess(username);
        setMessage('✅ Login successful!');
      } else {
        res = await axios.post(`${API_URL}/register`, { username, password });
        setMessage('✅ Registration successful! You can now log in.');
        setIsLogin(true);
      }
      
      console.log('API Response:', res.data);

    } catch (err) {
      if (err.response && err.response.data) {
        setMessage(`❌ ${err.response.data.msg}`);
      } else {
        setMessage('⚠️ Unexpected error. Please try again later.');
      }
      console.error('API Error:', err);
    }
  };

  return (
    <div className="login-container">
      <h2>{isLogin ? 'Login' : 'Register'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="login-button" disabled={!backendOnline}>
          {isLogin ? 'Log In' : 'Register'}
        </button>
      </form>
      <p>
        {isLogin ? "Don't have an account?" : "Already have an account?"}
        <span
          className="toggle-link"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? ' Register here' : ' Log in here'}
        </span>
      </p>
      {message && <p className="message">{message}</p>}
      {!backendOnline && <p className="message">🚨 Backend server is offline</p>}
    </div>
  );
}

export default Login;
