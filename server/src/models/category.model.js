// models/category.model.js
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  title: String,
  description: String,
  icon: String,
  form_data: mongoose.Schema.Types.Mixed,
  primary: { type: Boolean, default: false }
});

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
