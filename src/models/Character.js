// class Character {
//     constructor({ guid, name, race, class: charClass }) {
//         this.guid = guid;
//         this.name = name;
//         this.race = race;
//         this.charClass = charClass;
//     }

//     static RACES = {
//         1: "Humano", 2: "Orc", 3: "Anão", 4: "Elfo Noturno", 5: "Morto-Vivo",
//         6: "Tauren", 7: "Gnomo", 8: "Troll", 9: "Goblin", 10: "Elfo Sangrento",
//         11: "Draenei", 22: "Worgen", 24: "Pandaren", 25: "Pandaren (Aliança)",
//         26: "Pandaren (Horda)"
//     };

//     static CLASSES = {
//         1: "Guerreiro", 2: "Paladino", 3: "Caçador", 4: "Ladino", 5: "Sacerdote",
//         6: "Cavaleiro da Morte", 7: "Xamã", 8: "Mago", 9: "Bruxo", 10: "Monge",
//         11: "Druida", 12: "Caçador de Demônios"
//     };

//     getRaceName() {
//         return Character.RACES[this.race] || "Aventureiro";
//     }

//     getClassName() {
//         return Character.CLASSES[this.charClass] || "Herói";
//     }

//     getGreeting() {
//         const raceGreetings = {
//             1: "Nobre", 2: "Valente", 3: "Honrado", 4: "Sábio",
//             5: "Poderoso", 6: "Nobre Espírito", 7: "Engenhoso",
//             8: "Destemido", 10: "Gracioso", 11: "Iluminado"
//         };

//         const classGreetings = {
//             2: "Abençoado", 6: "Tenebroso", 7: "Sábio",
//             8: "Erudito", 11: "Sábio"
//         };

//         return classGreetings[this.charClass] || raceGreetings[this.race] || "Estimado";
//     }
// }

// module.exports = Character;