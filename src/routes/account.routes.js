const express = require('express');
const router = express.Router();

const accountController = require('../controllers/account.controller');
const authenticateToken = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { updateEmailSchema, updatePasswordSchema } = require('../validators/account.validator');

router.put('/email', authenticateToken, validate(updateEmailSchema), accountController.updateEmail);
router.put('/password', authenticateToken, validate(updatePasswordSchema), accountController.updatePassword);

module.exports = router;
