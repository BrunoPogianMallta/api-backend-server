const Joi = require('joi');

const updateEmailSchema = Joi.object({
  email: Joi.string().email().required()
});

const updatePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().min(6),
  newPassword: Joi.string().required().min(6)
});

module.exports = {
  updateEmailSchema,
  updatePasswordSchema
};