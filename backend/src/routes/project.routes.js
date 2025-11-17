const express = require('express');
const router = express.Router();
const projectCtrl = require('../controllers/project.controller');
const { authenticate, roleCheck } = require('../middleware/auth.middleware');

// Authenticated read
router.get('/', authenticate, projectCtrl.list);
router.get('/:id', authenticate, projectCtrl.get);

// Protected: create/update/delete by manager or admin
router.post('/', authenticate, roleCheck('manager'), projectCtrl.create);
router.put('/:id', authenticate, roleCheck('manager'), projectCtrl.update);
router.delete('/:id', authenticate, roleCheck('manager'), projectCtrl.remove);

module.exports = router;
