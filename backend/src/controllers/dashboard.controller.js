const Project = require("../models/Project.model");
const Task = require("../models/Task.model");

// GET /api/dashboard/overview
exports.getOverview = async (req, res) => {
  try {
    // Basic counts
    const [totalProjects, totalTasks, completedTasks, statusAgg, memberAgg] =
      await Promise.all([
        Project.countDocuments(),
        Task.countDocuments(),
        Task.countDocuments({ status: "Done" }),
        Task.aggregate([
          { $group: { _id: "$status", count: { $sum: 1 } } }
        ]),
        Task.aggregate([
          { $group: { _id: "$assignee", count: { $sum: 1 } } }
        ])
      ]);

    const pendingTasks = totalTasks - completedTasks;

    // Build status object with default 0
    const tasksByStatus = { "To-Do": 0, "In Progress": 0, "Done": 0 };
    statusAgg.forEach(s => {
      if (s._id) tasksByStatus[s._id] = s.count;
    });

    // Build tasks per member, ignore empty assignee
    const tasksPerMember = memberAgg
      .filter(m => m._id)  // remove null/empty
      .map(m => ({ assignee: m._id, count: m.count }));

    res.json({
      totalProjects,
      totalTasks,
      completedTasks,
      pendingTasks,
      tasksByStatus,
      tasksPerMember
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: "Failed to load dashboard" });
  }
};
