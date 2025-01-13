const mongoose = require("mongoose");

// Schema for a single fitness entry
const fitnessSchema = new mongoose.Schema(
  {
    0: String, // Video ID
    1: String, // Title
    2: String, // Description
  },
  { _id: false }
); // Disable _id for subdocuments in arrays

// Main Product Schema
const productSchema = new mongoose.Schema({
  id: String,
  password: String,
  name: String,
  email: String,
  age: Number,
  quantity: Number,
  weight: Number,
  role: String,
  vedios: { type: [String], default: [] },
  token:String,

  fitnes: [[String]], // Array of arrays (to match your JSON structure)
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
