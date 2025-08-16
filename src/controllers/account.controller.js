const { generateSalt, generateVerifier } = require('../utils/srp');
const accountService = require('../services/account.service');

async function updateEmail(req, res) {
  try {
    // Versão simplificada (sem validação de senha)
    const userId = req.user.id;
    const { email } = req.body;

    // Validação básica do email
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Por favor, forneça um email válido' });
    }

    const result = await accountService.updateEmail(userId, email);
    
    if (!result.affectedRows) {
      return res.status(500).json({ error: 'Nenhum registro foi atualizado' });
    }

    res.json({ 
      success: true,
      message: 'Email atualizado com sucesso',
      newEmail: email
    });

  } catch (error) {
    console.error('Erro ao atualizar email:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Este email já está em uso' });
    }

    res.status(500).json({ 
      error: 'Erro ao atualizar email',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
}

async function updatePassword(req, res) {
  try {
    const { username } = req.user;
    const { currentPassword, newPassword } = req.body;

    // Validação básica
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Ambos os campos de senha são obrigatórios' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'A nova senha deve ter pelo menos 6 caracteres' });
    }

    // Buscar usuário
    const user = await accountService.getAccountByUsername(username);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Verificar senha atual
    const currentVerifier = generateVerifier(username, currentPassword, user.salt);
    if (!currentVerifier.equals(user.verifier)) {
      return res.status(401).json({ error: 'Senha atual incorreta' });
    }

    // Atualizar senha
    const newSalt = generateSalt();
    const newVerifier = generateVerifier(username, newPassword, newSalt);

    await accountService.updatePasswordSRP(username, {
      verifier: newVerifier,
      salt: newSalt
    });

    res.json({ 
      success: true,
      message: 'Senha atualizada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao atualizar senha:', error);
    res.status(500).json({ 
      error: 'Erro ao atualizar senha',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
}

module.exports = {
  updateEmail,
  updatePassword
};