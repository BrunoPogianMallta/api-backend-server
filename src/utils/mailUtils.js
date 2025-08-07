const RACES = {
    1: "Humano", 2: "Orc", 3: "Anão", 4: "Elfo Noturno", 5: "Morto-Vivo",
    6: "Tauren", 7: "Gnomo", 8: "Troll", 9: "Goblin", 10: "Elfo Sangrento",
    11: "Draenei", 22: "Worgen", 24: "Pandaren", 25: "Pandaren (Aliança)",
    26: "Pandaren (Horda)"
};

const CLASSES = {
    1: "Guerreiro", 2: "Paladino", 3: "Caçador", 4: "Ladino", 5: "Sacerdote",
    6: "Cavaleiro da Morte", 7: "Xamã", 8: "Mago", 9: "Bruxo", 10: "Monge",
    11: "Druida", 12: "Caçador de Demônios"
};

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

function getRaceName(raceId) {
    return RACES[raceId] || "Aventureiro";
}

function getClassName(classId) {
    return CLASSES[classId] || "Herói";
}

function getInventoryTypeName(typeId) {
    return INVENTORY_TYPES[typeId] || "Item";
}

function getRaceClassGreeting(raceId, classId) {
    const raceGreetings = {
        1: "Nobre", 2: "Valente", 3: "Honrado", 4: "Sábio", 
        5: "Poderoso", 6: "Nobre Espírito", 7: "Engenhoso",
        8: "Destemido", 10: "Gracioso", 11: "Iluminado"
    };

    const classGreetings = {
        2: "Abençoado", 6: "Tenebroso", 7: "Sábio",
        8: "Erudito", 11: "Sábio"
    };

    return classGreetings[classId] || raceGreetings[raceId] || "Estimado";
}

function getQualityColor(quality) {
    return QUALITY_COLORS[quality] || "ffffff";
}


function buildMailBody({ playerName, character, item, quantity }) {
    const now = new Date();
    const greeting = getRaceClassGreeting(character.race, character.class);
    const qualityColor = getQualityColor(item.Quality);
    const itemType = getInventoryTypeName(item.InventoryType);

    return [
        `${greeting}, ${playerName}`,
        "",
        "Você recebeu um item solicitado através do Serviço de Entrega Mágica de Azeroth:",
        "",
        `|TInterface\\Icons\\INV_Misc_Note_01:20:20|t |cFF${qualityColor}${item.name}|r |cFF000000(${itemType})|r`,
        `|cFF000000Quantidade:|r ${quantity}x`,
        "",
        "O item foi inspecionado e está pronto para uso em suas aventuras.",
        "",
        "|cFF000000Informações da Entrega:|r",
        "• Método: Correio de Azeroth",
        "• Validade: 30 dias",
        "• Dúvidas? Consulte um Mestre de Jogo",
        "",
        "Que sua jornada seja repleta de conquistas,",
        "",
        "|cFF000000--|r",
        "|cFF000000Serviço de Entrega Mágica|r",
        `|cFF000000${now.toLocaleDateString('pt-BR')}|r`
    ].join("\n");
}

module.exports = {
    getRaceName,
    getClassName,
    getInventoryTypeName,
    getRaceClassGreeting,
    getQualityColor,
    buildMailBody
};