const express = require('express');
const router = express.Router();
const vpnController = require('../controllers/vpnController'); // ✅ check this line
console.log(vpnController);

// ✅ These should be valid functions from the controller
router.post('/start', vpnController.startSession);
router.post('/stop', vpnController.stopSession);
router.get('/sessions', async (req, res) => {
  try {
    const sessions = await Session.find().sort({ connectionTime: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});
module.exports = router;
