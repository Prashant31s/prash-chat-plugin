import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import connectDB from "./config/db.js"; // Import the database connection
import Message from "./models/Message.js";
import User from "./models/User.js";

const app = express();
const port = 8000;
const server = createServer(app);

// Connect to MongoDB
connectDB();

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    method: ["GET", "POST"],
    credentials: true,
  },
});

app.get("/", (req, res) => {
  res.send("HEllo world");
});

io.on("connection", (socket) => {
  socket.on("username", async (m) => {
    try {
      // Checking if the username already exists
      const existingUser = await User.findOne({ userName: m.userName });

      if (existingUser) {
        // If username is taken, emiting duplicate username event
        socket.emit("duplicate username", m);
      } else {
        // If username is available, save it to MongoDB
        const newUser = new User({ userName: m.userName, socketId: socket.id });
        await newUser.save();

        socket.emit("approved username");
      }
    } catch (err) {
      console.error("Error checking or saving user:", err);
      socket.emit("error", "Internal server error");
    }
  });

  socket.on("message", async ({ message, room, user }) => {
    //console.log("heloooo", { message, room, user });
    const newMessage = new Message({ message, user, room });
    await newMessage.save();
    const messageId = newMessage._id;
    console.log("iiiiiiiiddd", messageId);
    // messageshistory.push({ nmessages: message, ruser: user, myroom:room });
    // const messages = await Message.find({ room }).sort({ timestamp: 1 });

    if (room) {
      io.to(room).emit("receive-message", { message, user, _id: messageId });
    } else {
      io.emit("receive-message", { message, user, _id: messageId });
    }
  });
  socket.on("join-room", async (room) => {
    socket.join(room);
    const messages = await Message.find({ room }).sort({ timestamp: 1 });
    //console.log("mess", messages);
    io.to(room).emit("history", messages);

    console.log(`user joined room ${room}`);
  });
  socket.on("delete-message", async ({ messageId, userId }) => {
    try {
      // Find the message and ensure the requesting user is the owner
      const message = await Message.findOne({ _id: messageId });
      if (message) {
        await Message.deleteOne({ _id: messageId });
        io.emit("message-deleted", { messageId });
      }
    } catch (err) {
      console.error("Error deleting message:", err);
    }
  });

  socket.on("edit-message", async ({ messageId, newContent, userId }) => {
    console.log("new", newContent, messageId);
    try {
      const message = await Message.findOne({ _id: messageId });
      if (message) {
        message.message = newContent;
        await message.save();
        io.emit("message-edited", { messageId, newContent });
      }
    } catch (err) {
      console.error("Error editing message:", err);
    }
  });

  socket.on("disconnect", async () => {
    try {
      // Remove the user from the database on disconnect
      await User.findOneAndDelete({ socketId: socket.id });
      console.log("User Disconnected", socket.id);
    } catch (err) {
      console.error("Error removing user:", err);
    }
  });
});

server.listen(port, () => {
  console.log(`server is running on ${port}`);
});
