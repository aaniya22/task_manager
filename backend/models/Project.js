const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['Active', 'Completed', 'On Hold'], default: 'Active' },
  progress: { type: Number, min: 0, max: 100, default: 0 },
  deadline: { type: Date }
}, {
  timestamps: true
});

module.exports = mongoose.model('Project', projectSchema);