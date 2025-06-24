// backend/controllers/vpnController.js
const Session = require('../models/Session');

exports.startSession = async (req, res) => {
  const { ip } = req.body;
  try {
    const session = new Session({ ip, connectionTime: new Date(), dataTransferred: 0 });
    await session.save();
    res.status(201).json({ message: "VPN session started" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.stopSession = async (req, res) => {
  const { ip } = req.body;
  try {
    await Session.deleteOne({ ip });
    res.status(200).json({ message: "VPN session stopped" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
