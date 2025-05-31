const voteService = require('../services/vote.service');
const voteSites = require('../config/voteSites');

// Converte Date para formato MySQL DATETIME (YYYY-MM-DD HH:mm:ss)
function toMySQLDatetime(date) {
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

async function getVoteStatus(req, res) {
  try {
    const accountId = req.user.id;
    const status = await voteService.getVoteStatus(accountId);
    const points = await voteService.getVotePoints(accountId);

    const sitesWithStatus = voteSites.map(site => {
      const dbSite = status.find(s => s.site_id === site.site_id); // Comparação correta
      const nextVote = dbSite?.next_vote_time ? new Date(dbSite.next_vote_time) : null;
      const canVote = !nextVote || nextVote <= new Date();

      return {
        ...site,
        nextVote: nextVote ? nextVote.toISOString() : null,
        canVote
      };
    });

    res.json({
      votePoints: points,
      sites: sitesWithStatus
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao obter status de voto' });
  }
}

// UTC -> horário de Brasília
function toBrasiliaTime(date) {
  return new Date(date.getTime() - 3 * 60 * 60 * 1000);
}

async function registerVote(req, res) {
  try {
    const accountId = req.user.id;
    const { site_id } = req.body;

    if (!site_id) {
      return res.status(400).json({ message: 'Site ID é obrigatório' });
    }

    const status = await voteService.getVoteStatus(accountId);
    const siteStatus = status.find(s => s.site_id === site_id);

    const now = new Date();
    if (siteStatus?.next_vote_time && new Date(siteStatus.next_vote_time) > now) {
      return res.status(400).json({ message: 'Ainda não pode votar neste site' });
    }

    const siteInfo = voteSites.find(s => s.site_id === site_id);
    const cooldownHours = siteInfo?.cooldownHours ?? 12;

    const nextVoteUTC = new Date(now.getTime() + cooldownHours * 60 * 60 * 1000);
    const nextVoteBrasilia = toBrasiliaTime(nextVoteUTC);

    const nextVoteTimeMySQL = nextVoteBrasilia.toISOString().slice(0, 19).replace('T', ' ');

    await voteService.updateVoteStatus(accountId, site_id, nextVoteTimeMySQL);
    await voteService.addVotePoints(accountId, 10);

    res.json({ message: 'Voto registrado com sucesso', nextVoteTime: nextVoteBrasilia.toISOString() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao registrar voto' });
  }
}

module.exports = {
  getVoteStatus,
  registerVote
};
