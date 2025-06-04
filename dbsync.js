const shopDb = require('../api-backend-server/src/config/shopDb');
const { Pool } = require('pg');

async function syncPets() {
  try {
    console.log('Buscando pets na API...');
    const response = await fetch('http://localhost:3000/api/shop/pets');
    const pets = await response.json();
    console.log(`Pets recebidos: ${pets.length}`);

    const bulkInsertPool = new Pool({
      ...shopDb.options,
      max: 10,
      idleTimeoutMillis: 30000
    });

    const batchSize = 100;
    let processed = 0;
    const startTotalTime = Date.now();

    const insertQuery = `
      INSERT INTO shop_items 
        (item_entry, displayid, name, category, item_level, quality, inventory_type, class, subclass)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (item_entry) DO UPDATE
      SET displayid = EXCLUDED.displayid,
          name = EXCLUDED.name,
          category = EXCLUDED.category,
          item_level = EXCLUDED.item_level,
          quality = EXCLUDED.quality,
          inventory_type = EXCLUDED.inventory_type,
          class = EXCLUDED.class,
          subclass = EXCLUDED.subclass
    `;

    for (let i = 0; i < pets.length; i += batchSize) {
      const batch = pets.slice(i, i + batchSize);
      console.log(`Processando batch ${Math.floor(i / batchSize) + 1} de ${Math.ceil(pets.length / batchSize)}...`);
      const startTime = Date.now();

      const client = await bulkInsertPool.connect();

      try {
        await client.query('BEGIN');

        for (const pet of batch) {
          await client.query(insertQuery, [
            pet.item_entry,
            pet.displayid,
            pet.name,
            'pet', // Categoria fixa
            pet.item_level,
            pet.quality,
            pet.inventory_type,
            pet.class,
            pet.subclass
          ]);
        }

        await client.query('COMMIT');

        processed += batch.length;
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`Batch concluído: ${processed}/${pets.length} pets em ${elapsed}s`);

      } catch (err) {
        await client.query('ROLLBACK');
        console.error('Erro ao processar batch:', err);
        throw err;
      } finally {
        client.release();
      }
    }

    const totalElapsed = ((Date.now() - startTotalTime) / 1000).toFixed(2);
    console.log(`Sincronização de pets finalizada! ${pets.length} registros processados em ${totalElapsed} segundos`);

  } catch (error) {
    console.error('Erro na sincronização de pets:', error);
  }
}

syncPets();
