import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import EmojiPicker from 'emoji-picker-react';
import { MdGroup } from "react-icons/md";

const API_URL = 'https://ourchive-backend.onrender.com/api'; // ✅ REST API
const SOCKET_URL = 'https://ourchive-backend.onrender.com';  // ✅ Socket.io

let socket;

function ChatRoom({ username, room, onLogout, onSelectRecipient }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [showSidebar, setShowSidebar] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(`${API_URL}/chat/messages/${room}`);
        setMessages(res.data);
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };

    fetchMessages();

    socket = io(SOCKET_URL, { autoConnect: false });
    socket.connect();
    socket.emit('join_room', { room, username });

    socket.on('receive_message', (data) => {
      setMessages(prevMessages => [...prevMessages, data]);
    });

    socket.on('update_users', (users) => {
      setOnlineUsers(users);
    });

    socket.on('error', (error) => {
      console.error('Socket Error:', error);
    });

    return () => {
      socket.off('receive_message');
      socket.off('update_users');
      socket.off('error');
      socket.disconnect();
    };
  }, [room, username]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const messageData = {
        sender: username,
        message: newMessage,
        room: room,
      };

      socket.emit('send_message', messageData);
      setMessages(prevMessages => [...prevMessages, messageData]);

      setNewMessage('');
      setShowEmojiPicker(false);
    }
  };

  const onEmojiClick = (emojiObject) => {
    setNewMessage(prevMsg => prevMsg + emojiObject.emoji);
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Room: {room}</h2>
        <div className="header-buttons">
          <button onClick={() => setShowSidebar(!showSidebar)} className="toggle-sidebar-button">
            <MdGroup />
          </button>
          <button onClick={onLogout} className="logout-button">Log Out</button>
        </div>
      </div>
      <div className="chat-body">
        <div className="messages-display">
          {messages.map((msg, index) => (
            <div key={index} className="message">
              <span className="message-sender">{msg.sender}:</span> {msg.message}
            </div>
          ))}
        </div>
        {showSidebar && (
          <div className="online-users">
            <h3>Online Users</h3>
            <ul>
              {onlineUsers.map((user, index) => (
                <li key={index} onClick={() => onSelectRecipient(user)}>{user}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <form onSubmit={handleSendMessage} className="message-form">
        <div className="emoji-button-container">
          <button
            type="button"
            className="emoji-button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            😀
          </button>
          {showEmojiPicker && (
            <div className="emoji-picker-container">
              <EmojiPicker onEmojiClick={onEmojiClick} />
            </div>
          )}
        </div>
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

export default ChatRoom;
