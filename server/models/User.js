// models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  userName: { type: String, unique: true, required: true },
  socketId: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

export default User;
