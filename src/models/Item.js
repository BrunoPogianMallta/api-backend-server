const { getInventoryTypeName, getQualityColor } = require('../utils/itemUtils');

class Item {
    constructor({ entry, name, Quality: quality, InventoryType: inventoryType }) {
        this.entry = entry;
        this.name = name;
        this.quality = quality;
        this.inventoryType = inventoryType;
    }

    getTypeName() {
        return getInventoryTypeName(this.inventoryType);
    }

    getQualityColor() {
        return getQualityColor(this.quality);
    }
}

module.exports = Item;