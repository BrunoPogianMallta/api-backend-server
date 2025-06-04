const { Pool } = require('pg');

const shopDb = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_W5hH4oDxQweI@ep-lingering-king-acj5i27o-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = shopDb;
