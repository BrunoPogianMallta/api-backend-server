const Joi = require('joi');

const updateEmailSchema = Joi.object({
  email: Joi.string().email().required()
});

const updatePasswordSchema = Joi.object({
  verifier: Joi.string().required(),
  salt: Joi.string().required()
});

module.exports = {
  updateEmailSchema,
  updatePasswordSchema
};
