const Project = require('../models/Project');

exports.createProject = async (req, res, next) => {
  try {
    const { title, description, members, status, progress, deadline } = req.body;
    const project = await Project.create({
      title,
      description,
      manager: req.user._id,
      members,
      status,
      progress,
      deadline
    });
    res.status(201).json({ message: 'Project created', project });
  } catch (error) {
    next(error);
  }
};

exports.getProjects = async (req, res, next) => {
  try {
    let projects;
    if (req.user.role === 'manager') {
      projects = await Project.find({ manager: req.user._id }).populate('manager members', 'username email');
    } else {
      projects = await Project.find({ members: req.user._id }).populate('manager members', 'username email');
    }
    res.json({ projects });
  } catch (error) {
    next(error);
  }
};

exports.updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!project.manager.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to update this project' });
    }

    const fields = ['title', 'description', 'members', 'status', 'progress', 'deadline'];
    fields.forEach(field => {
      if (req.body[field] !== undefined) project[field] = req.body[field];
    });

    await project.save();
    res.json({ message: 'Project updated', project });
  } catch (error) {
    next(error);
  }
};

exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!project.manager.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to delete this project' });
    }
    await project.remove();
    res.json({ message: 'Project deleted' });
  } catch (error) {
    next(error);
  }
};