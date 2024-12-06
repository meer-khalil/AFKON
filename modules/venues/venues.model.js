const mongoose = require('mongoose');

const VenueSchema = new mongoose.Schema({
  id: Number,
  name: String,
  address: String,
  city: String,
  country: String,
  capacity: Number,
  surface: String,
  image: String,
});

module.exports = mongoose.model('Venue', VenueSchema);
