const INVENTORY_TYPES = {
    1: "Cabeça", 2: "Pescoço", 3: "Ombro", 4: "Camisa", 5: "Peito",
    6: "Cintura", 7: "Calças", 8: "Pés", 9: "Pulsos", 10: "Mãos",
    11: "Dedo", 12: "Joia", 13: "Arma de Uma Mão", 14: "Escudo",
    15: "Arco", 16: "Capa", 17: "Arma de Duas Mãos", 18: "Bolsa",
    19: "Tabardo", 20: "Vestes", 21: "Arma de Mão Principal",
    22: "Arma de Mão Secundária", 23: "Livro", 24: "Arremessável",
    25: "Arma de Longo Alcance"
};

const QUALITY_COLORS = {
    0: "9d9d9d", 1: "ffffff", 2: "1eff00",
    3: "0070dd", 4: "a335ee", 5: "ff8000"
};

function getInventoryTypeName(typeId) {
    return INVENTORY_TYPES[typeId] || "Item";
}

function getQualityColor(quality) {
    return QUALITY_COLORS[quality] || "ffffff";
}





module.exports = {
    getInventoryTypeName,
    getQualityColor
};