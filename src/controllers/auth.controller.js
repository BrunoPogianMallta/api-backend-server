const authService = require('../services/auth.service');
const accountService = require('../services/account.service');

async function register(req, res) {
  try {
    const { username, password, email } = req.body;

    await authService.register(username, password, email);
    console.log('[REGISTER] Conta criada:', username);

    return res.status(201).json({ success: true, message: 'Conta criada com sucesso' });

  } catch (err) {
    console.error('[REGISTER] Erro:', err.message);
    return res.status(500).json({ success: false, message: 'Erro ao registrar conta' });
  }
}

async function login(req, res) {
  try {
    const { username, password, remember } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Usuário e senha são obrigatórios' });
    }

    console.log('[LOGIN] Tentativa de login:', username);

    const { user, token } = await authService.login(username, password, remember);

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
    const user = await accountService.getAccountById(req.user.id);

    if (!user) {
      console.warn('[VERIFY] Usuário não encontrado:', req.user.id);
      return res.status(401).json({ success: false, message: 'Usuário não encontrado' });
    }

    console.log('[VERIFY] Autenticado:', user.username);

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        username: user.username
      }
    });
  } catch (err) {
    console.error('[VERIFY] Erro:', err.message);
    return res.status(500).json({ success: false, message: 'Erro ao verificar token' });
  }
}

module.exports = {
  register,
  login,
  verify
};
