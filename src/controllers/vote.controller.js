const voteService = require('../services/vote.service');
const voteSites = require('../config/voteSites');

// Token de segurança para o postback (definido no .env)
const POSTBACK_TOKEN = process.env.POSTBACK_TOKEN;
const POSTBACK_SITE_ID = 'top100arena'; // ID fixo para o site de votação

// Converte Date para formato MySQL DATETIME (YYYY-MM-DD HH:mm:ss)
function toMySQLDatetime(date) {
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

// UTC -> Horário de Brasília (UTC-3)
function toBrasiliaTime(date) {
  return new Date(date.getTime() - 3 * 60 * 60 * 1000);
}

// ==============================================
// ✅ Rota para lidar com o Postback do Top100Arena
// ==============================================
async function handlePostback(req, res) {
  try {
    // 1️⃣ Valida o token de segurança (CRUCIAL!)
    if (req.query.token !== POSTBACK_TOKEN) {
      console.warn(`⚠️ Token inválido recebido: ${req.query.token}`);
      return res.status(403).json({ success: false, message: "Token inválido" });
    }

    // 2️⃣ Pega o ID do usuário (pode ser um nickname, Discord ID, etc.)
    const postbackId = req.query.postback;

    if (!postbackId) {
      return res.status(400).json({ success: false, message: "Postback ID ausente" });
    }

    // 3️⃣ Verifica se esse postback já votou recentemente (evitar spam)
    const [existingVote] = await voteService.getVoteStatusByPostback(postbackId, POSTBACK_SITE_ID);

    const now = new Date();
    if (existingVote?.next_vote_time && new Date(existingVote.next_vote_time) > now) {
      return res.status(400).json({ 
        success: false,
        message: 'Usuário já votou recentemente',
        nextVoteTime: existingVote.next_vote_time
      });
    }

    // 4️⃣ Define o próximo horário que poderá votar (ex.: 12 horas depois)
    const cooldownHours = 12;
    const nextVoteTime = new Date(now.getTime() + cooldownHours * 60 * 60 * 1000);
    const nextVoteTimeMySQL = toMySQLDatetime(nextVoteTime);

    // 5️⃣ Registra o voto no banco de dados
    await voteService.updateVoteStatusByPostback(postbackId, POSTBACK_SITE_ID, nextVoteTimeMySQL);

    // 6️⃣ (Opcional) Adiciona pontos de votação (se necessário)
    // await voteService.addVotePointsByPostback(postbackId, 10);

    // 7️⃣ Log do postback (para auditoria)
    await voteService.logPostback(postbackId, req.ip, POSTBACK_SITE_ID);

    // ✅ Retorna sucesso
    res.status(200).json({ 
      success: true,
      message: '✅ Voto registrado via postback',
      postbackId,
      nextVoteTime: nextVoteTime.toISOString()
    });

  } catch (error) {
    console.error('🔴 [ERRO NO POSTBACK]', error);
    res.status(500).json({ success: false, message: 'Erro ao processar postback' });
  }
}

// ==============================================
// ✅ Rota para verificar status de votos (usuário logado)
// ==============================================
async function getVoteStatus(req, res) {
  try {
    const accountId = req.user.id;
    const status = await voteService.getVoteStatus(accountId);
    const points = await voteService.getVotePoints(accountId);

    const sitesWithStatus = voteSites.map(site => {
      const dbSite = status.find(s => s.site_id === site.site_id);
      const nextVote = dbSite?.next_vote_time ? new Date(dbSite.next_vote_time) : null;
      const canVote = !nextVote || nextVote <= new Date();

      return {
        ...site,
        nextVote: nextVote ? nextVote.toISOString() : null,
        canVote
      };
    });

    res.json({
      success: true,
      votePoints: points,
      sites: sitesWithStatus
    });
  } catch (error) {
    console.error('🔴 [ERRO AO OBTER STATUS DE VOTO]', error);
    res.status(500).json({ success: false, message: 'Erro ao obter status de voto' });
  }
}

// ==============================================
// ✅ Rota para registro manual de voto (usuário logado)
// ==============================================
async function registerVote(req, res) {
  try {
    const accountId = req.user.id;
    const { site_id } = req.body;

    if (!site_id) {
      return res.status(400).json({ success: false, message: 'Site ID é obrigatório' });
    }

    // Verifica se o usuário já votou recentemente
    const status = await voteService.getVoteStatus(accountId);
    const siteStatus = status.find(s => s.site_id === site_id);

    const now = new Date();
    if (siteStatus?.next_vote_time && new Date(siteStatus.next_vote_time) > now) {
      return res.status(400).json({ 
        success: false,
        message: '⏳ Ainda não pode votar neste site',
        nextVoteTime: new Date(siteStatus.next_vote_time).toISOString()
      });
    }

    // Define o próximo horário de votação (cooldown)
    const siteInfo = voteSites.find(s => s.site_id === site_id);
    const cooldownHours = siteInfo?.cooldownHours ?? 12;

    const nextVoteUTC = new Date(now.getTime() + cooldownHours * 60 * 60 * 1000);
    const nextVoteBrasilia = toBrasiliaTime(nextVoteUTC);
    const nextVoteTimeMySQL = toMySQLDatetime(nextVoteBrasilia);

    // Atualiza o status de voto
    await voteService.updateVoteStatus(accountId, site_id, nextVoteTimeMySQL);

    // Adiciona pontos de votação
    await voteService.addVotePoints(accountId, 10);

    res.json({
      success: true,
      message: '✅ Voto registrado com sucesso',
      nextVoteTime: nextVoteBrasilia.toISOString()
    });

  } catch (error) {
    console.error('🔴 [ERRO AO REGISTRAR VOTO]', error);

    if (error.code === 'ECONNRESET') {
      return res.status(503).json({ success: false, message: 'Problema na conexão com o banco de dados' });
    }

    res.status(500).json({ success: false, message: 'Erro ao registrar voto' });
  }
}

module.exports = {
  getVoteStatus,
  registerVote,
  handlePostback
};