const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authCtrl = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.post('/register', [
  body('name').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 4 })
], authCtrl.register);

router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty()
], authCtrl.login);

router.get('/me', authenticate, authCtrl.me);

module.exports = router;
