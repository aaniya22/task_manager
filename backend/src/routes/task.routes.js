const express = require("express");
const router = express.Router();

const { 
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask 
} = require("../controllers/task.controller");

router.get("/", getTasks);
router.get("/:id", getTaskById);   // ⬅ newly added
router.post("/", createTask);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

module.exports = router;
