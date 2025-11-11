const Task = require('../models/Task');
const Project = require('../models/Project');

exports.createTask = async (req, res, next) => {
  try {
    const { title, description, deadline, status, priority, assignedTo, project } = req.body;

    const projectDoc = await Project.findById(project);
    if (!projectDoc) return res.status(404).json({ message: 'Project not found' });
    if (!projectDoc.manager.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to add tasks to this project' });
    }

    const task = await Task.create({
      title,
      description,
      deadline,
      status,
      priority,
      assignedTo,
      project
    });

    res.status(201).json({ message: 'Task created', task });
  } catch (error) {
    next(error);
  }
};

exports.getTasks = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.role === 'manager') {
      // Get tasks for projects managed by user
      const projects = await Project.find({ manager: req.user._id }).select('_id');
      filter.project = { $in: projects.map(p => p._id) };
    } else {
      // Member: only tasks assigned to them
      filter.assignedTo = req.user._id;
    }

    if (req.query.projectId) {
      filter.project = req.query.projectId;
    }

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'username email')
      .populate('project', 'title');

    res.json({ tasks });
  } catch (error) {
    next(error);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (req.user.role === 'manager') {
      // Manager can update all fields
      const fields = ['title', 'description', 'deadline', 'status', 'priority', 'assignedTo', 'project'];
      fields.forEach(field => {
        if (req.body[field] !== undefined) task[field] = req.body[field];
      });
    } else {
      // Member can only update status if assigned to them
      if (!task.assignedTo.equals(req.user._id)) {
        return res.status(403).json({ message: 'Not authorized to update this task' });
      }
      if (req.body.status) {
        task.status = req.body.status;
      } else {
        return res.status(400).json({ message: 'Members can only update task status' });
      }
    }

    await task.save();
    res.json({ message: 'Task updated', task });
  } catch (error) {
    next(error);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Only manager can delete
    if (req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Not authorized to delete this task' });
    }

    await task.remove();
    res.json({ message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
};