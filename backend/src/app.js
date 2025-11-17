const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/auth.routes');
const projectRoutes = require('./routes/project.routes');
const taskRoutes = require('./routes/task.routes');
const errorMiddleware = require('./middleware/error.middleware');
const dashboardRoutes = require('./routes/dashboard.routes');

const app = express();

// -----------------------------------------
// ✅ SECURITY MIDDLEWARES
// -----------------------------------------
app.use(helmet());

// -----------------------------------------
// ✅ CORS SETUP (IMPORTANT FOR FRONTEND)
// -----------------------------------------
app.use(
  cors({
    origin: [
      "http://127.0.0.1:5500", 
      "http://localhost:5500"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  })
);

// -----------------------------------------
app.use(express.json());

// -----------------------------------------
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Test Route
app.get('/', (req, res) => res.json({ ok: true, message: 'SmartTask API' }));

// -----------------------------------------
// ROUTES
// -----------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

// -----------------------------------------
app.use(errorMiddleware);
app.use('/api/dashboard', dashboardRoutes); 

module.exports = app;
