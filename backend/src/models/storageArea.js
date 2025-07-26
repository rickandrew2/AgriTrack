const mongoose = require('mongoose');

const storageAreaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String }
});

module.exports = mongoose.model('StorageArea', storageAreaSchema); 