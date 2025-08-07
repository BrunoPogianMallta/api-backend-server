const paymentService = require('../services/paymentService');
const mailService = require('../services/MailService');

async function iniciarPagamento(req, res) {
  console.log("\n[Payment] Nova requisição de pagamento recebida");
  console.log("[Payment] Ambiente:", process.env.NODE_ENV);
  console.log("[Payment] Token MP:", process.env.MP_ACCESS_TOKEN ? "✅" : "❌");
  console.log("[Payment] Body:", req.body);

  const { item, comprador } = req.body;

  // Validação básica
  if (!item || !comprador || !comprador.email) {
    console.error("[Payment] Dados faltando:", { item, comprador });
    return res.status(400).json({ 
      success: false,
      error: 'Item e dados do comprador (com email) são obrigatórios' 
    });
  }

  if (!item.id || !item.preco) {
    console.error("[Payment] Item incompleto:", item);
    return res.status(400).json({ 
      success: false,
      error: 'Item deve ter id e preco' 
    });
  }

  try {
    const initPoint = await paymentService.criarPreferenciaPagamento(item, comprador);
    console.log("[Payment] Pagamento criado com sucesso:", initPoint);
    
    return res.status(200).json({ 
      success: true,
      payment_url: initPoint.payment_url,
      payment_id: initPoint.payment_id,
      external_reference: initPoint.external_reference,
      payment_type: "checkout" 
    });

  } catch (error) {
    console.error("[Payment] ERRO:", {
      message: error.message,
      status: error.status || 500,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });

    return res.status(error.status || 500).json({ 
      success: false,
      error: error.message || 'Erro ao processar pagamento',
      ...(process.env.NODE_ENV === 'development' && { details: error.stack })
    });
  }
}

async function iniciarPagamentoPix(req, res) {
  console.log("\n[Pix] Nova requisição recebida");
  console.log("[Pix] Body:", req.body);

  const { valor, comprador, descricao, itemEntry, nomeDoPersonagem } = req.body;

  try {
    if (!valor || !comprador || !comprador.email || !itemEntry || !nomeDoPersonagem) {
      return res.status(400).json({ 
        success: false,
        error: 'Valor, comprador (com email), itemEntry e nomeDoPersonagem são obrigatórios' 
      });
    }

    const pixData = await paymentService.criarPagamentoPix(valor, comprador, descricao, itemEntry, nomeDoPersonagem);
    console.log("[Pix] Dados gerados:", pixData);

    return res.status(200).json({
      success: true,
      payment_type: "pix",
      ...pixData
    });

  } catch (error) {
    console.error("[Pix] ERRO:", error);
    return res.status(error.status || 500).json({
      success: false,
      error: error.message || 'Erro ao gerar Pix'
    });
  }
}


async function webhookHandler(req, res) {
  console.log("\n[Webhook] Notificação recebida:", req.body);

  try {
    const paymentId = req.body.data?.id;
    if (!paymentId) {
      return res.status(400).json({ success: false, error: "ID de pagamento não encontrado" });
    }

    const paymentStatus = await paymentService.validarPagamento(paymentId);
    console.log("[Webhook] Status do pagamento:", paymentStatus);

    if (paymentStatus.details.is_approved) {
      const reference = paymentStatus.external_reference;

      const parts = reference.split('_');
      if (parts.length < 3) {
        console.warn("[Webhook] Referência externa inválida:", reference);
        return res.status(400).json({ success: false, error: "Referência externa inválida" });
      }

      const itemEntry = parts[1];
      const playerName = parts.slice(2).join('_');

      try {
        await mailService.sendItemToCharacter(playerName, itemEntry, 1);
        console.log(`[Webhook] ✅ Item ${itemEntry} enviado para ${playerName}`);
      } catch (mailError) {
        console.error("[Webhook] ❌ Falha ao enviar item:", mailError);
        return res.status(500).json({ success: false, error: "Erro ao enviar item no jogo" });
      }
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("[Webhook] ERRO:", error);
    return res.status(500).json({ success: false, error: "Falha ao processar webhook" });
  }
}

module.exports = {
  iniciarPagamento,
  iniciarPagamentoPix,
  webhookHandler
};
