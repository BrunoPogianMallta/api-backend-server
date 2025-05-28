const authService = require('../services/auth.service');

async function register(req, res) {
  try {
    const { username, password, email } = req.body;

    if (!username || !password || !email) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }

    await authService.register(username, password, email);
    return res.status(201).json({ message: 'Conta criada com sucesso' });

  } catch (err) {
    console.error('Erro no registro:', err.message);
    return res.status(500).json({ message: err.message });
  }
}

async function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Usuário e senha são obrigatórios' });
    }

    const { user, token } = await authService.login(username, password);

    return res.json({ user, token });

  } catch (err) {
    console.error('Erro no login:', err.message);
    return res.status(401).json({ message: 'Credenciais inválidas' });
  }
}

module.exports = {
  register,
  login,
};
