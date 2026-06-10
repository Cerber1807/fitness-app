const { Pool } = require('pg');

const pool = new Pool({
    connectionString: 'postgresql://postgres:jCOvbyXwZgXmZgNYxXmcoRshXvIskwRx@junction.proxy.rlwy.net:16997/railway',
    ssl: {
        rejectUnauthorized: false
    }
});

// Перехват ошибок пула, чтобы сервер не падал при скачках сети
pool.on('error', (err) => {
    console.error('Непредвиденная ошибка во внутренней базе данных pg-pool:', err.message);
});

module.exports = pool;