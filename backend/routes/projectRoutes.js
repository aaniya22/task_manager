const express = require('express');
const {
  createProject,
  getProjects,
  updateProject,
  deleteProject
} = require('../controllers/projectController');
const { authenticateJWT, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticateJWT);

router.get('/', getProjects);
router.post('/', authorizeRoles('manager'), createProject);
router.put('/:projectId', authorizeRoles('manager'), updateProject);
router.delete('/:projectId', authorizeRoles('manager'), deleteProject);

module.exports = router;