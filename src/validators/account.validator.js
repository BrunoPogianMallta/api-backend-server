const Joi = require('joi');

const updateEmailSchema = Joi.object({
  currentPassword: Joi.string().required().min(6).label('Senha Atual'),
  email: Joi.string().email().required().label('Novo Email')
});

const updatePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().min(6).label('Senha Atual'),
  newPassword: Joi.string().required().min(6).label('Nova Senha')
    .invalid(Joi.ref('currentPassword'))
    .messages({
      'any.invalid': 'A nova senha deve ser diferente da atual'
    })
});

module.exports = {
  updateEmailSchema,
  updatePasswordSchema
};