const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
  title: String,
  url: { type: String, unique: true },
  categories: [String],
  scrapedCategory: String,
  completionTime: String,
  notes: { type: String, default: "" },
});

module.exports = mongoose.model("Course", CourseSchema);
