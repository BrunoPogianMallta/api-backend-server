const accountService = require('../services/account.service');

async function updateEmail(req, res) {
  try {
    const userId = req.user.id;
    const { email } = req.body;

    await accountService.updateEmail(userId, email);

    res.json({ message: 'E-mail atualizado com sucesso.' });
  } catch (error) {
    console.error('Erro ao atualizar e-mail:', error);
    res.status(500).json({ error: 'Erro ao atualizar e-mail.' });
  }
}

async function updatePassword(req, res) {
  try {
    const { username } = req.user;
    const { verifier, salt } = req.body;

    await accountService.updatePassword(username, { verifier, salt });

    res.json({ message: 'Senha atualizada com sucesso.' });
  } catch (error) {
    console.error('Erro ao atualizar senha:', error);
    res.status(500).json({ error: 'Erro ao atualizar senha.' });
  }
}

module.exports = {
  updateEmail,
  updatePassword
};
