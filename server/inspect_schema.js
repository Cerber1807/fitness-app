const Pool = require('pg').Pool;
require('dotenv').config({ path: './.env' });

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE
});

(async () => {
  try {
    const result = await pool.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name='exercises' ORDER BY ordinal_position`);
    console.log(JSON.stringify(result.rows, null, 2));
  } catch (err) {
    console.error('ERR', err.message);
  } finally {
    await pool.end();
  }
})();
