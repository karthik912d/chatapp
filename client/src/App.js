import React, { useState } from 'react';
import './App.css';
import Login from './components/Login';
import ChatRoom from './components/ChatRoom';
import RoomSelection from './components/RoomSelection';
import DMWindow from './components/DMWindow';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('');
  const [dmRecipient, setDmRecipient] = useState(null);

  const handleLoginSuccess = (user) => {
    setIsAuthenticated(true);
    setUsername(user);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername('');
    setRoom('');
    setDmRecipient(null);
    localStorage.removeItem('token');
  };

  const handleJoinRoom = ({ room, username }) => {
    setRoom(room);
    setUsername(username);
  };
  
  const handleSelectRecipient = (recipient) => {
    setDmRecipient(recipient);
  };

  return (
    <div className="App">
      <h1>Ourchive</h1>
      {!isAuthenticated ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (
        !room ? (
          <RoomSelection onJoinRoom={handleJoinRoom} username={username} />
        ) : (
          dmRecipient ? (
            <DMWindow username={username} recipient={dmRecipient} onBack={() => setDmRecipient(null)} />
          ) : (
            <ChatRoom username={username} room={room} onLogout={handleLogout} onSelectRecipient={handleSelectRecipient} />
          )
        )
      )}
    </div>
  );
}

export default App;
