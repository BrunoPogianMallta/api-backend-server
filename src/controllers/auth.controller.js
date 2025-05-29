const jwt = require('jsonwebtoken');
const authService = require('../services/auth.service');
const accountService = require('../services/account.service'); // Certifique-se de que está no lugar certo

async function register(req, res) {
  try {
    const { username, password, email } = req.body;

    if (!username || !password || !email) {
      console.warn('[REGISTER] Campos obrigatórios faltando');
      return res.status(400).json({ success: false, message: 'Todos os campos são obrigatórios' });
    }

    await authService.register(username, password, email);

    console.log('[REGISTER] Conta registrada com sucesso:', username);

    return res.status(201).json({ success: true, message: 'Conta criada com sucesso' });

  } catch (err) {
    console.error('[REGISTER] Erro no registro:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      console.warn('[LOGIN] Campos obrigatórios faltando');
      return res.status(400).json({ success: false, message: 'Usuário e senha são obrigatórios' });
    }

    console.log('[LOGIN] Tentativa de login:', username);

    const { user, token } = await authService.login(username, password);

    console.log('[LOGIN] Login bem-sucedido para:', username);
    console.log('[LOGIN] Token gerado:', token);

    return res.status(200).json({
      success: true,
      user,
      token
    });

  } catch (err) {
    console.error('[LOGIN] Erro no login:', err.message);
    return res.status(401).json({ success: false, message: 'Credenciais inválidas' });
  }
}

async function verify(req, res) {
  try {
    console.log('[VERIFY] Verificando token para o usuário ID:', req.user.id);

    const user = await accountService.getAccountById(req.user.id);

    if (!user) {
      console.warn('[VERIFY] Usuário não encontrado:', req.user.id);
      return res.status(401).json({ success: false, message: 'Usuário não encontrado' });
    }

    console.log('[VERIFY] Token válido. Usuário autenticado:', user.username);

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        username: user.username
      }
    });

  } catch (err) {
    console.error('[VERIFY] Erro ao verificar o token:', err.message);
    return res.status(500).json({ success: false, message: 'Erro interno ao verificar token' });
  }
}

module.exports = {
  register,
  login,
  verify
};
