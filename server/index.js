const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const Message = require('./models/Message');
const DirectMessage = require('./models/DirectMessage');
const path = require('path');

const app = express();
const server = http.createServer(app);

require('dotenv').config();

// The allowed origin for both HTTP and WebSocket connections
const allowedOrigin = "https://chatapp-s7bdayzqp-karthiks-projects-6b7b770b.vercel.app";

// Middleware for HTTP requests
app.use(express.json());
app.use(cors({
  origin: allowedOrigin,
  methods: ['GET', 'POST'],
  credentials: true,
}));

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully!');
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }
};
connectDB();

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    methods: ["GET", "POST"]
  }
});

const usersInRooms = {};
const usersToSockets = {};

// Use the authentication routes
app.use('/api/auth', authRoutes);
// Use the chat routes
app.use('/api/chat', chatRoutes);

// DM route to fetch direct message history
app.get('/api/dm/:user1/:user2', async (req, res) => {
  try {
    const { user1, user2 } = req.params;
    const messages = await DirectMessage.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 }
      ]
    }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('join_room', ({ room, username }) => {
    socket.join(room);
    usersToSockets[username] = socket.id;
    if (!usersInRooms[room]) {
      usersInRooms[room] = [];
    }
    usersInRooms[room].push({ id: socket.id, username });
    io.to(room).emit('update_users', usersInRooms[room].map(user => user.username));
  });

  socket.on('send_message', async (data) => {
    try {
      const newMessage = new Message({
        sender: data.sender,
        message: data.message,
        room: data.room,
      });
      await newMessage.save();
      io.to(data.room).emit('receive_message', data);
    } catch (err) {
      console.error('Error saving message:', err.message);
      socket.emit('error', 'Failed to save message.');
    }
  });

  socket.on('send_dm', async (data) => {
    try {
      const newDM = new DirectMessage({
        sender: data.sender,
        receiver: data.receiver,
        message: data.message,
      });
      await newDM.save();

      const receiverSocketId = usersToSockets[data.receiver];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('receive_dm', data);
      }
      socket.emit('receive_dm', data);
    } catch (err) {
      console.error('Error saving DM:', err.message);
      socket.emit('error', 'Failed to save direct message.');
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    for (const room in usersInRooms) {
      const userIndex = usersInRooms[room].findIndex(user => user.id === socket.id);
      if (userIndex !== -1) {
        const [user] = usersInRooms[room].splice(userIndex, 1);
        delete usersToSockets[user.username];
        io.to(room).emit('update_users', usersInRooms[room].map(user => user.username));
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
