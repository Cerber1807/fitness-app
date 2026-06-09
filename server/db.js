const { Pool } = require('pg');

// Проверяем, передан ли URI, чтобы сервер не падал молча
if (!process.env.DATABASE_URI) {
    console.error("КРИТИЧЕСКАЯ ОШИБКА: Переменная окружения DATABASE_URI не задана!");
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URI,
    ssl: process.env.NODE_ENV === 'production' 
        ? { rejectUnauthorized: false } 
        : false // Отключаем SSL для локальной разработки, если нужно
});

// Перехват ошибок пула, чтобы сервер не падал при скачках сети
pool.on('error', (err) => {
    console.error('Непредвиденная ошибка во внутренней базе данных pg-pool:', err.message);
});

module.exports = pool;