const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const authenticateToken = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { registerSchema, loginSchema } = require('../validators/auth.validator');

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.get('/verify', authenticateToken, authController.verify);

module.exports = router;
