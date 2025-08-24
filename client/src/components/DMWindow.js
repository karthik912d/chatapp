import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { MdArrowBack } from "react-icons/md";

const API_URL = 'https://ourchive-backend.onrender.com/api'; 
const SOCKET_URL = 'https://ourchive-backend.onrender.com';

let socket;

function DMWindow({ username, recipient, onBack }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(`${ENDPOINT}/api/dm/${username}/${recipient}`);
        setMessages(res.data);
      } catch (err) {
        console.error('Error fetching DM messages:', err);
      }
    };

    fetchMessages();
    
    socket = io(ENDPOINT, { autoConnect: false });
    socket.connect();

    const handleReceiveDM = (data) => {
      if ((data.sender === recipient && data.receiver === username) || 
          (data.sender === username && data.receiver === recipient)) {
        setMessages(prevMessages => [...prevMessages, data]);
      }
    };

    socket.on('receive_dm', handleReceiveDM);

    return () => {
      socket.off('receive_dm', handleReceiveDM);
      socket.disconnect();
    };
  }, [username, recipient]);

  const handleSendDM = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const messageData = {
        sender: username,
        receiver: recipient,
        message: newMessage,
      };
      socket.emit('send_dm', messageData);
      setMessages(prevMessages => [...prevMessages, messageData]);
      setNewMessage('');
    }
  };

  return (
    <div className="dm-container">
      <div className="dm-header">
        <button onClick={onBack} className="back-button">
          <MdArrowBack />
        </button>
        <h2>DM with {recipient}</h2>
      </div>
      <div className="messages-display">
        {messages.map((msg, index) => (
          <div key={index} className="message">
            <span className="message-sender">{msg.sender}:</span> {msg.message}
          </div>
        ))}
      </div>
      <form onSubmit={handleSendDM} className="message-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="message-input"
        />
        <button type="submit" className="send-button">
          Send
        </button>
      </form>
    </div>
  );
}

export default DMWindow;
