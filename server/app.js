// backend/server.js
import express from 'express';
import { createServer } from 'http';  // Corrected import
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import router from './routes/api.js';
import Message from './models/Message.js';

const app = express();
const server = createServer(app);  // Use the correct createServer function
const io = new Server(server, {
  cors: {
    origin: "*",
  }
});

// Connect to MongoDB
connectDB();

app.use(express.json());
app.use('/api', router);

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('join', ({ appId }) => {
    socket.join(appId);
    console.log(`User joined room: ${appId}`);
  });

  socket.on('message', async ({ appId, message }) => {
    const newMessage = new Message({ appId, message });
    await newMessage.save();
    io.to(appId).emit('message', newMessage);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(8000, () => {
  console.log('Server running on port 3000');
});
