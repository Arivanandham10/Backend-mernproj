const mongoose = require("mongoose");
require('dotenv').config()

mongoose.connect(process.env.MongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected successfully.');
})
.catch((err) => {
  console.error('Failed to connect to MongoDB:', err);
});

module.exports = mongoose.connection;
