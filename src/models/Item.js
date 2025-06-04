class Item {
  constructor(pool) {
    this.pool = pool;
  }

  // Método para criar a tabela de itens da loja (executar uma vez)
  async createShopTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS mallta_shop_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        entry INT NOT NULL COMMENT 'Item entry from item_template',
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price INT NOT NULL DEFAULT 0,
        category ENUM('Armaduras', 'Armas', 'Montarias', 'Mascotes', 'Serviços') NOT NULL,
        rarity ENUM('Comum', 'Incomum', 'Raro', 'Épico', 'Lendário') NOT NULL,
        image VARCHAR(255) NOT NULL,
        stock INT DEFAULT -1 COMMENT '-1 for unlimited',
        is_featured BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY (entry)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;
    await this.pool.execute(query);
    console.log('Shop items table created or already exists');
  }

  // Métodos para operações CRUD...
}

module.exports = Item;