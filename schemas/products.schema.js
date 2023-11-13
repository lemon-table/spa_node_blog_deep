const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String
  },
  content: {
    type: String
  },
  author: {
    type: String
  },
  password: {
    type: String,
    required: true
  },
  status: {
    type: String
  },
  createdAt: {
    type: Date
  }
});

module.exports = mongoose.model("Products", productSchema);
