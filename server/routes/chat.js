    const express = require('express');
    const router = express.Router();
    const Message = require('../models/Message');

    // @route   GET /api/chat/messages/:room
    // @desc    Get all chat messages for a specific room
    router.get('/messages/:room', async (req, res) => {
      try {
        const messages = await Message.find({ room: req.params.room }).sort({ timestamp: 1 });
        res.json(messages);
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
      }
    });

    module.exports = router;
    