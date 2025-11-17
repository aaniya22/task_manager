const Project = require('../models/Project.model');
const Task = require('../models/Task.model');

exports.list = async (req, res, next) => {
  try {
    const { search, sort } = req.query;
    const q = {};
    if (search) q.$or = [{ title: { $regex: search, $options: 'i' } }, { manager: { $regex: search, $options: 'i' } }];

    let projects = Project.find(q);
    if (sort === 'nearest') projects = projects.sort({ deadline: 1 });
    else if (sort === 'farthest') projects = projects.sort({ deadline: -1 });
    else projects = projects.sort({ createdAt: -1 });

    const results = await projects.limit(100).lean();
    res.json({ projects: results });
  } catch (err) { next(err); }
};

exports.get = async (req, res, next) => {
  try {
    const p = await Project.findById(req.params.id).lean();
    if (!p) return res.status(404).json({ message: 'Project not found' });
    res.json({ project: p });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { title, description, manager, status, deadline, members } = req.body;
    const project = await Project.create({ title, description, manager, status, deadline: deadline || null, members: members || [req.user.email] });
    res.status(201).json({ project });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const updates = req.body;
    const project = await Project.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json({ project });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Optionally delete associated tasks
    await Task.deleteMany({ projectId: project._id });

    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};
