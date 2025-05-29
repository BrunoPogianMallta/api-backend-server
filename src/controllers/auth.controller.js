const jwt = require('jsonwebtoken');
const authService = require('../services/auth.service');
const accountService = require('../services/account.service'); // Certifique-se de que está no lugar certo

async function register(req, res) {
  try {
    const { username, password, email } = req.body;

    if (!username || !password || !email) {
      return res.status(400).json({ success: false, message: 'Todos os campos são obrigatórios' });
    }

    await authService.register(username, password, email);

    return res.status(201).json({ success: true, message: 'Conta criada com sucesso' });

  } catch (err) {
    console.error('Erro no registro:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Usuário e senha são obrigatórios' });
    }

    const { user, token } = await authService.login(username, password);

    return res.status(200).json({
      success: true,
      user,
      token
    });

  } catch (err) {
    console.error('Erro no login:', err.message);
    return res.status(401).json({ success: false, message: 'Credenciais inválidas' });
  }
}

async function verify(req, res) {
  try {
    const user = await accountService.getAccountById(req.user.id);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Usuário não encontrado' });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        username: user.username
      }
    });

  } catch (err) {
    console.error('Erro ao verificar o token:', err.message);
    return res.status(500).json({ success: false, message: 'Erro interno ao verificar token' });
  }
}

module.exports = {
  register,
  login,
  verify
};
