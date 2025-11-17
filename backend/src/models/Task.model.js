const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  title: String,
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
  assignee: String,
  priority: String,
  deadline: Date,
  status: String
});

// prevent OverwriteModelError
module.exports = mongoose.models.Task || mongoose.model("Task", TaskSchema);
