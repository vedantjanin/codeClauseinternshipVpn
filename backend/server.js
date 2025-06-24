require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const socketIo = require('socket.io');
const crypto = require('crypto');
const cors = require('cors');

const vpnRoutes = require('./routes/vpnRoutes');
const Session = require('./models/Session');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*'
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/vpn', vpnRoutes);

// ✅ MongoDB Connection
mongoose.connect(process.env.ATLASDB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.error("❌ MongoDB Connection Error:", err));

// ✅ Socket.IO Setup
io.on('connection', async (socket) => {
  const ip = socket.handshake.address || 'Unknown IP';
  console.log('🔌 New client connected:', ip);

  // Create new session log
  const session = new Session({
    ip: ip,
    connectionTime: new Date(),
    dataTransferred: 0
  });

  try {
    await session.save();
  } catch (error) {
    console.error("❌ Failed to save session:", error.message);
  }

  const sessionId = session._id;

  // 🔐 Encrypted Message Handling
  socket.on('send_encrypted', async ({ message, key }) => {
    try {
      const decrypted = decrypt(message, key);
      console.log('📥 Decrypted message:', decrypted);

      socket.broadcast.emit('receive_encrypted', { message });

      const transferredBytes = Buffer.byteLength(JSON.stringify(message));
      await Session.findByIdAndUpdate(sessionId, {
        $inc: { dataTransferred: transferredBytes / 1024 } // Convert to KB
      });
    } catch (err) {
      console.error("❌ Decryption failed:", err.message);
    }
  });

  // Disconnect Handler
  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${ip}`);
  });
});

// ✅ AES Decryption Helper Function
function decrypt(encryptedText, key) {
  const iv = Buffer.from(encryptedText.iv, 'hex');
  const encrypted = Buffer.from(encryptedText.content, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

// ✅ Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
