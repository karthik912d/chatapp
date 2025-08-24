const mongoose = require('mongoose');

// Define the schema for a user in the database
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
}, {
  timestamps: true // Adds createdAt and updatedAt fields automatically
});

// Create and export the User model
module.exports = mongoose.model('User', userSchema);
