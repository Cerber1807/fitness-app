const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Перехват ошибок пула, чтобы сервер не падал при скачках сети
pool.on('error', (err) => {
    console.error('Непредвиденная ошибка во внутренней базе данных pg-pool:', err.message);
});

module.exports = pool;