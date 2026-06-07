const Pool = require('pg').Pool;
require('dotenv').config({ path: __dirname + '/.env' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

module.exports = pool;