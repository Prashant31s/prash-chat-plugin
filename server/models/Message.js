// models/Message.js
import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  message: String,
  user: String,
  room: String,
  timestamp: { type: Date, default: Date.now },
});

const Message = mongoose.model('Message', messageSchema);

export default Message;
