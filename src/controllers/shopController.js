const shopService = require('../services/shopService');
const { logger } = require('../services/loggingService');

class ShopController {
    async getItemById(req, res) {
        const { id } = req.params;
        try {
            logger.info(`Buscando item por ID: ${id}`);
            const item = await shopService.getItemById(id);
            if (!item) {
                logger.warn(`Item não encontrado: ${id}`);
                return res.status(404).json({ message: 'Item não encontrado' });
            }
            logger.info(`Item encontrado: ${id}`);
            res.json(item);
        } catch (error) {
            logger.error(`Erro ao buscar item por ID: ${id}`, { error: error.message });
            res.status(500).json({ message: 'Erro ao buscar item por ID', error: error.message });
        }
    }


    async getPaymentMethods(req, res) {
        try {
            logger.info('Buscando métodos de pagamento disponíveis');
            
            // Exemplo com Mercado Pago (substitua pelo seu gateway)
            mercadopago.configure({
                access_token: process.env.MP_ACCESS_TOKEN
            });
            
            const paymentMethods = await mercadopago.payment_methods.list();
            
            // Filtrar apenas os métodos que queremos oferecer
            const availableMethods = paymentMethods.response.filter(method => 
                ['pix', 'credit_card', 'debit_card'].includes(method.payment_type_id)
            ).map(method => ({
                id: method.id,
                name: method.name,
                type: method.payment_type_id,
                thumbnail: method.thumbnail,
                min_amount: method.min_allowed_amount,
                max_amount: method.max_allowed_amount
            }));

            res.json(availableMethods);
        } catch (error) {
            logger.error('Erro ao buscar métodos de pagamento', { error: error.message });
            res.status(500).json({ message: 'Erro ao buscar métodos de pagamento', error: error.message });
        }
    }

    async createPayment(req, res) {
        const { items, paymentMethod } = req.body;
        const userId = req.user.id;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Lista de itens inválida' });
        }

        try {
            logger.info(`Criando pagamento para usuário ${userId}`, { items, paymentMethod });

            // 1. Validar itens e calcular total
            const shopItems = await shopService.getItemsFromStore();
            const validatedItems = items.map(item => {
                const shopItem = shopItems.find(si => si.item_entry === item.item_entry);
                if (!shopItem) {
                    throw new Error(`Item ${item.item_entry} não encontrado`);
                }
                return {
                    ...item,
                    price: shopItem.price,
                    name: shopItem.name
                };
            });

            const total = validatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            // 2. Criar preferência de pagamento
            mercadopago.configure({
                access_token: process.env.MP_ACCESS_TOKEN
            });

            const preference = {
                items: validatedItems.map(item => ({
                    title: item.name,
                    unit_price: item.price,
                    quantity: item.quantity,
                    currency_id: 'BRL'
                })),
                payer: {
                    email: req.user.email // Supondo que o usuário tenha email
                },
                external_reference: userId.toString(),
                payment_method_id: paymentMethod,
                notification_url: `${process.env.API_URL}/shop/payment/webhook`,
                back_urls: {
                    success: `${process.env.FRONTEND_URL}/payment/success`,
                    failure: `${process.env.FRONTEND_URL}/payment/failure`,
                    pending: `${process.env.FRONTEND_URL}/payment/pending`
                },
                auto_return: 'approved'
            };

            const response = await mercadopago.preferences.create(preference);
            
            // 3. Registrar a transação pendente no banco de dados
            await shopService.createPendingTransaction({
                userId,
                items: validatedItems,
                total,
                paymentId: response.body.id,
                paymentMethod,
                status: 'pending'
            });

            // 4. Retornar URL de pagamento para o frontend
            res.json({
                paymentUrl: response.body.init_point,
                paymentId: response.body.id
            });

        } catch (error) {
            logger.error('Erro ao criar pagamento', { 
                userId,
                error: error.message,
                stack: error.stack 
            });
            res.status(500).json({ message: 'Erro ao criar pagamento', error: error.message });
        }
    }

    async handlePaymentWebhook(req, res) {
        const { data } = req.body;
        
        try {
            logger.info('Recebido webhook de pagamento', { data });

            if (data && data.id) {
                // Verificar o status do pagamento
                const payment = await mercadopago.payment.get(data.id);
                const paymentStatus = payment.body.status;
                const externalReference = payment.body.external_reference; // userId
                
                logger.info(`Atualizando status do pagamento ${data.id} para ${paymentStatus}`);

                // Atualizar transação no banco de dados
                await shopService.updateTransactionStatus({
                    paymentId: data.id,
                    status: paymentStatus,
                    userId: externalReference
                });

                // Se o pagamento foi aprovado, enviar os itens
                if (paymentStatus === 'approved') {
                    const transaction = await shopService.getTransactionByPaymentId(data.id);
                    
                    if (transaction && transaction.playerName) {
                        await shopService.processPurchase({
                            userId: externalReference,
                            playerName: transaction.playerName,
                            items: transaction.items,
                            total: transaction.total
                        });
                    }
                }
            }

            res.status(200).send('OK');
        } catch (error) {
            logger.error('Erro no webhook de pagamento', {
                error: error.message,
                data: req.body
            });
            res.status(500).send('Erro ao processar webhook');
        }
    }

    async getItemByName(req, res) {
        const { name } = req.query;
        if (!name) {
            logger.warn('Parâmetro "name" não fornecido');
            return res.status(400).json({ message: 'Parâmetro "name" é obrigatório' });
        }

        try {
            logger.info(`Buscando itens por nome: ${name}`);
            const items = await shopService.getItemByName(name);
            res.json(items);
        } catch (error) {
            logger.error(`Erro ao buscar itens por nome: ${name}`, { error: error.message });
            res.status(500).json({ message: 'Erro ao buscar item por nome', error: error.message });
        }
    }

    async getAllWorldItems(req, res) {
        try {
            logger.info('Buscando todos os itens do mundo');
            const items = await shopService.getAllWorldItems();
            res.json(items);
        } catch (error) {
            logger.error('Erro ao buscar todos os itens do mundo', { error: error.message });
            res.status(500).json({ message: 'Erro ao buscar todos os itens do mundo', error: error.message });
        }
    }

    async getAllPets(req, res) {
        try {
            logger.info('Buscando todas as mascotes');
            const pets = await shopService.getAllPets();
            res.json(pets);
        } catch (error) {
            logger.error('Erro ao buscar mascotes', { error: error.message });
            res.status(500).json({ message: 'Erro ao buscar mascotes', error: error.message });
        }
    }

    async addItemToShop(req, res) {
        try {
            logger.info('Adicionando item à loja', { item: req.body });
            await shopService.addItemToShop(req.body);
            logger.info('Item adicionado com sucesso');
            res.status(201).json({ message: 'Item adicionado à loja com sucesso' });
        } catch (error) {
            logger.error('Erro ao adicionar item à loja', { error: error.message });
            res.status(500).json({ message: 'Erro ao adicionar item à loja', error: error.message });
        }
    }

    async getItemsFromStore(req, res) {
        try {
            logger.info('Buscando itens da loja');
            const items = await shopService.getItemsFromStore();
            res.json(items);
        } catch (error) {
            logger.error('Erro ao buscar itens da loja', { error: error.message });
            res.status(500).json({ message: 'Erro ao buscar itens da loja', error: error.message });
        }
    }

    async buyItem(req, res) {
        const { playerName, item_entry } = req.body;

        if (!playerName || !item_entry) {
            logger.warn('Parâmetros obrigatórios não fornecidos para compra');
            return res.status(400).json({ message: 'playerName e item_entry são obrigatórios' });
        }

        try {
            logger.info(`Processando compra para ${playerName}`, { item_entry });
            const result = await shopService.buyItem(playerName, item_entry);
            
            if (result.success) {
                logger.info(`Item enviado para ${playerName}`, { item_entry });
                res.status(200).json(result);
            } else {
                logger.warn(`Falha ao enviar item para ${playerName}`, { item_entry, message: result.message });
                res.status(400).json(result);
            }
        } catch (error) {
            logger.error(`Erro ao processar compra para ${playerName}`, { item_entry, error: error.message });
            res.status(500).json({ message: 'Erro ao processar compra', error: error.message });
        }
    }

    async purchaseItems(req, res) {
        const { playerName, items } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ 
                success: false,
                message: 'Usuário não autenticado'
            });
        }

        if (!playerName || typeof playerName !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Nome do personagem é obrigatório'
            });
        }

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Lista de itens inválida ou vazia'
            });
        }

        try {
            const shopItems = await shopService.getItemsFromStore();
            const validatedItems = items.map(item => {
                const shopItem = shopItems.find(si => si.item_entry === item.item_entry);
                if (!shopItem) {
                    throw new Error(`Item ${item.item_entry} não encontrado na loja`);
                }
                return {
                    item_entry: item.item_entry,
                    quantity: item.quantity || 1,
                    price: shopItem.vote_price || shopItem.price || 0,
                    name: shopItem.name
                };
            });

            const total = validatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            const result = await shopService.processPurchase({
                userId,
                playerName,
                items: validatedItems,
                total
            });

            res.json({
                success: true,
                message: 'Compra realizada com sucesso',
                transactionId: result.transactionId,
                items: result.items,
                total
            });

        } catch (error) {
            const statusCode = error.message.includes('não encontrado') ? 404 : 500;
            res.status(statusCode).json({ 
                success: false,
                message: error.message
            });
        }
    }

    async getShopItems(req, res) {
        try {
            logger.info('Buscando itens formatados da loja');
            const items = await shopService.getShopItems();
            res.json(items);
        } catch (error) {
            logger.error('Erro ao buscar itens formatados da loja', { error: error.message });
            res.status(500).json({ message: 'Erro ao buscar itens da loja (formatado)', error: error.message });
        }
    }
}

module.exports = new ShopController();