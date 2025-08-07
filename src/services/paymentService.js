const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');

// Configuração do cliente
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
  options: { timeout: 5000, idempotencyKey: 'unique-id' }
});

// APIs
const preference = new Preference(client);
const payment = new Payment(client);

/**
 * Cria uma preferência de pagamento (Checkout Pro - Cartão/Boleto)
 */
async function criarPreferenciaPagamento(item, comprador) {
  if (!item || typeof item !== 'object') {
    throw new Error("Item inválido ou não fornecido");
  }
  if (!comprador || !comprador.email) {
    throw new Error("Dados do comprador são obrigatórios");
  }

  const body = {
    items: [{
      id: item.id || "ITEM_" + Math.random().toString(36).substring(2, 9),
      title: item.nome || "Produto sem nome",
      description: item.descricao || "Descrição não fornecida",
      category_id: item.categoria || "others",
      quantity: item.quantidade || 1,
      unit_price: Number(item.preco) || 0,
      picture_url: item.imagem_url || ""
    }],
    payer: {
      email: comprador.email,
      first_name: comprador.nome || "Não informado",
      last_name: comprador.sobrenome || "Não informado",
      identification: {
        type: comprador.tipo_documento || "CPF",
        number: comprador.documento || "00000000000"
      },
      address: {
        zip_code: comprador.cep || "00000000",
        street_name: comprador.endereco || "Não informado",
        street_number: comprador.numero || "0"
      },
      phone: {
        area_code: comprador.ddd || "00",
        number: comprador.telefone || "000000000"
      }
    },
    payment_methods: {
      excluded_payment_types: [{ id: "atm" }],
      installments: item.parcelas || 1
    },
    external_reference: `REF_${item.id || Date.now()}_${comprador.id || 'guest'}`,
    notification_url: process.env.MP_WEBHOOK_URL || "https://malltawow.com/api/payments/webhook",
    back_urls: {
      success: "https://malltawow.com/sucesso",
      failure: "https://malltawow.com/falha",
      pending: "https://malltawow.com/pendente"
    },
    auto_return: "approved",
    statement_descriptor: "MalltaWoW"
  };

  try {
    const response = await preference.create({ body });
    console.log("[MP] Checkout criado:", {
      id: response.id,
      init_point: response.init_point,
      external_reference: body.external_reference
    });
    return {
      payment_url: response.init_point,
      payment_id: response.id,
      external_reference: body.external_reference
    };
  } catch (error) {
    console.error("[MP] Erro no Checkout:", {
      message: error.message,
      status: error.status,
      data: error.cause?.data
    });
    throw new Error(`Falha ao criar checkout: ${error.message}`);
  }
}

/**
 * Cria um pagamento via Pix, com item e personagem para referência
 * @param {number} valor - Valor do pagamento
 * @param {object} comprador - Dados do comprador (email, nome, sobrenome, etc)
 * @param {string} descricao - Descrição do pagamento
 * @param {string|number} itemEntry - ID do item comprado
 * @param {string} nomeDoPersonagem - Nome do personagem para envio do item
 */
async function criarPagamentoPix(valor, comprador, descricao, itemEntry, nomeDoPersonagem) {
  if (!valor || !comprador || !comprador.email || !itemEntry || !nomeDoPersonagem) {
    throw new Error("Dados obrigatórios faltando para gerar o Pix");
  }

  const body = {
    transaction_amount: Number(valor),
    description: descricao || "Pagamento via Pix",
    payment_method_id: "pix",
    payer: {
      email: comprador.email,
      first_name: comprador.nome || "Não informado",
      last_name: comprador.sobrenome || "Não informado",
      identification: {
        type: comprador.tipo_documento || "CPF",
        number: comprador.documento || "00000000000"
      }
    },
    external_reference: `PIX_${itemEntry}_${nomeDoPersonagem}`
  };

  try {
    const response = await payment.create({ body });
    console.log("[MP] Pix criado:", {
      id: response.id,
      external_reference: body.external_reference
    });

    return {
      qr_code: response.point_of_interaction.transaction_data.qr_code,
      qr_code_base64: response.point_of_interaction.transaction_data.qr_code_base64,
      payment_id: response.id,
      external_reference: body.external_reference
    };
  } catch (error) {
    console.error("[MP] Erro no Pix:", {
      message: error.message,
      status: error.status,
      data: error.cause?.data
    });
    throw new Error(`Falha ao gerar Pix: ${error.message}`);
  }
}

/**
 * Valida um pagamento via Webhook
 */
async function validarPagamento(paymentId) {
  try {
    const response = await payment.get({ id: paymentId });
    return {
      status: response.status,
      amount: response.transaction_amount,
      payment_method: response.payment_method_id,
      external_reference: response.external_reference,
      payer: response.payer,
      details: {
        is_approved: response.status === 'approved',
        is_expired: response.status === 'expired',
        is_refunded: response.status === 'refunded'
      }
    };
  } catch (error) {
    console.error("[MP] Erro ao validar pagamento:", error);
    throw error;
  }
}

module.exports = {
  criarPreferenciaPagamento,
  criarPagamentoPix,
  validarPagamento
};
