const express = require('express');
const { signup, login, updateRole } = require('../controllers/userController');
const { authenticateJWT, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.patch('/role/:userId', authenticateJWT, authorizeRoles('manager'), updateRole);

module.exports = router;