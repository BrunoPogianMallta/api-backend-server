const Joi = require('joi');

const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(15).required(),
  password: Joi.string().min(6).required(),
  confirmPassword: Joi.any().valid(Joi.ref('password')).required()
    .messages({ 'any.only': 'A confirmação da senha não confere.' }),
  email: Joi.string().email().required(),
  terms: Joi.boolean().valid(true).required()
    .messages({ 'any.only': 'Você deve aceitar os termos para continuar.' })
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
