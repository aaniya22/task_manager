const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
  title: String,
  description: String,
  manager: String,
  members: [String],
  status: String,
  deadline: Date
});

// Prevent OverwriteModelError
module.exports = mongoose.models.Project || mongoose.model("Project", ProjectSchema);
