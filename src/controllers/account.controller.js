const { generateSalt, generateVerifier } = require('../utils/srp');
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
    const { currentPassword, newPassword } = req.body;

    // 1. Buscar usuário e verificar senha atual
    const user = await accountService.getAccountByUsername(username);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // 2. Verificar senha atual
    const currentVerifier = generateVerifier(username, currentPassword, user.salt);
    if (!currentVerifier.equals(user.verifier)) {
      return res.status(401).json({ error: 'Senha atual incorreta' });
    }

    // 3. Gerar nova senha (novo salt + verifier)
    const newSalt = generateSalt();
    const newVerifier = generateVerifier(username, newPassword, newSalt);

    // 4. Atualizar no banco
    await accountService.updatePasswordSRP(username, {
      verifier: newVerifier,
      salt: newSalt
    });

    res.json({ message: 'Senha atualizada com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar senha:', error);
    res.status(500).json({ error: 'Erro ao atualizar senha' });
  }
}

module.exports = {
  updateEmail,
  updatePassword
};
