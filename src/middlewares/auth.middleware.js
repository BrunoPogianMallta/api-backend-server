const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('[AUTH MIDDLEWARE] Authorization Header:', authHeader);
  console.log('[AUTH MIDDLEWARE] Token recebido:', token);

  if (!token) {
    console.warn('[AUTH MIDDLEWARE] Nenhum token fornecido');
    return res.status(401).json({ message: 'Token não fornecido' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error('[AUTH MIDDLEWARE] Token inválido ou expirado:', err.message);
      return res.status(403).json({ message: 'Token inválido ou expirado' });
    }

    console.log('[AUTH MIDDLEWARE] Token verificado com sucesso. Usuário:', user);
    req.user = user;
    next();
  });
}

module.exports = authenticateToken;
