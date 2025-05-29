module.exports = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      console.warn('[VALIDATION] Erro:', error.details[0].message);
      return res.status(400).json({ success: false, message: error.details[0].message });
    }
    next();
  };
};
