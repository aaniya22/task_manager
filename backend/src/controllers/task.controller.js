const Task = require("../models/task.model");

// GET ALL TASKS (with project title)
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find().populate("projectId", "title");
    res.json({ tasks });
  } catch (err) {
    res.status(500).json({ message: "Failed to load tasks" });
  }
};

// GET SINGLE TASK BY ID (needed for Edit modal)
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate("projectId", "title");
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json({ task });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch task" });
  }
};

// CREATE TASK
exports.createTask = async (req, res) => {
  try {
    const task = await Task.create(req.body);
    res.json({ task });
  } catch (err) {
    res.status(500).json({ message: "Failed to create task" });
  }
};

// UPDATE TASK
exports.updateTask = async (req, res) => {
  try {
    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json({ task: updated });
  } catch (err) {
    res.status(500).json({ message: "Failed to update task" });
  }
};

// DELETE TASK
exports.deleteTask = async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete task" });
  }
};
