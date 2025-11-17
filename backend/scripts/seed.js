require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../src/config/db');
const User = require('../src/models/User.model');
const Project = require('../src/models/Project.model');
const Task = require('../src/models/Task.model');

const run = async () => {
  try {
    await connectDB();

    // wipe
    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});

    const salt = await bcrypt.genSalt(10);
    const u1 = await User.create({ name:'Manager Demo', email:'manager@demo', password: await bcrypt.hash('demo', salt), role:'manager' });
    const u2 = await User.create({ name:'Member Demo', email:'member@demo', password: await bcrypt.hash('demo', salt), role:'member' });
    const u3 = await User.create({ name:'Admin Demo', email:'admin@demo', password: await bcrypt.hash('demo', salt), role:'admin' });

    const p1 = await Project.create({ title:'Website Redesign', description:'Revamp UI', manager:'manager@demo', status:'In Progress', members:['member@demo'] });
    const p2 = await Project.create({ title:'Mobile App', description:'Build Android app', manager:'manager@demo', status:'Not Started', members:['member@demo'] });

    await Task.create({ title:'Design Landing', projectId:p1._id, projectName:p1.title, assignee:'member@demo', priority:'High', status:'To-Do' });
    await Task.create({ title:'API Integration', projectId:p1._id, projectName:p1.title, assignee:'member@demo', priority:'Medium', status:'In Progress' });

    console.log('Seeded demo data');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
