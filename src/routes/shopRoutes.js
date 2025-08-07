const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const authenticateToken = require('../middlewares/auth.middleware');



router.get('/item/:id', shopController.getItemById);
router.get('/item', shopController.getItemByName);
router.get('/world-items', shopController.getAllWorldItems);
router.get('/shop-items', shopController.getItemsFromStore);
router.get('/shop-items-formatted', shopController.getShopItems);
router.get('/pets', shopController.getAllPets);

router.post('/add', shopController.addItemToShop);
router.post('/buy', shopController.buyItem);
router.post('/purchase', authenticateToken, shopController.purchaseItems);


router.post('/payment/create', authenticateToken, shopController.createPayment);
router.post('/payment/webhook', shopController.handlePaymentWebhook);
router.get('/payment/methods', authenticateToken, shopController.getPaymentMethods);

module.exports = router;

