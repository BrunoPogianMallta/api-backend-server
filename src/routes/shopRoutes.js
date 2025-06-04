const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');

router.get('/item/:id', shopController.getItemById);
router.get('/item', shopController.getItemByName);
router.get('/world-items', shopController.getAllWorldItems);
router.get('/shop-items', shopController.getItemsFromStore);
router.get('/shop-items-formatted', shopController.getShopItems);
router.get('/pets', shopController.getAllPets);

router.post('/add', shopController.addItemToShop);
router.post('/buy', shopController.buyItem);

module.exports = router;
