const express = require('express');
const {
  createTask,
  getTasks,
  updateTask,
  deleteTask
} = require('../controllers/taskController');
const { authenticateJWT, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticateJWT);

router.get('/', getTasks);
router.post('/', authorizeRoles('manager'), createTask);
router.put('/:taskId', updateTask); // Special role check inside controller
router.delete('/:taskId', authorizeRoles('manager'), deleteTask);

module.exports = router;