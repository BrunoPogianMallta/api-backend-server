const Joi = require('joi');

const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(15).required(),
  password: Joi.string().min(6).required(),
  email: Joi.string().email().required()
});



const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
  remember: Joi.boolean().optional()

});

module.exports = {
  registerSchema,
  loginSchema
};
