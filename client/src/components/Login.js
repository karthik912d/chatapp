import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'https://ourchive-backend.onrender.com/api/auth'; 

function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      let res;
      if (isLogin) {
        // ✅ Login API
        res = await axios.post(`${API_URL}/login`, { username, password });
        localStorage.setItem('token', res.data.token);
        onLoginSuccess(username);
        setMessage('Login successful!');
      } else {
        // ✅ Register API
        res = await axios.post(`${API_URL}/register`, { username, password });
        setMessage('Registration successful! You can now log in.');
        setIsLogin(true);
      }

      console.log('API Response:', res.data);

    } catch (err) {
      if (err.response && err.response.data) {
        setMessage(err.response.data.msg);
      } else {
        setMessage('An unexpected error occurred.');
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
        <button type="submit" className="login-button">
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
    </div>
  );
}

export default Login;
