import React, { useState } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import ChatRoom from './components/ChatRoom';
import './axiosInterceptor';

function isTokenExpired(token) {
  if (!token) return true;
  const [, payload] = token.split('.');
  const decoded = JSON.parse(atob(payload));
  return decoded.exp * 1000 < Date.now();
}

const App = () => {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('jwtToken');
    const username = localStorage.getItem('username');
    if (token && username && !isTokenExpired(token)) {
      return { username, token };
    } else {
      localStorage.clear();
      return null;
    }
  });

  const [showRegister, setShowRegister] = useState(false);

  const handleLogin = (username, token) => {
    localStorage.setItem('jwtToken', token);
    localStorage.setItem('username', username);
    setUser({ username, token });
  };

  const handleRegister = (username) => {
    alert(`Welcome ${username}, please log in now.`);
    setShowRegister(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
  };

  if (user) {
    return <ChatRoom username={user.username} jwtToken={user.token} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      {!showRegister ? (
        <>
          <Login
            onLogin={handleLogin}
            onShowRegister={() => setShowRegister(true)}
          />
        </>
      ) : (
        <>
          <Register
            onRegister={handleRegister}
            onShowLogin={() => setShowRegister(false)}
          />
        </>
      )}
    </div>
  );
};

export default App;
