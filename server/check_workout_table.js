const pool = require('./db');
(async () => {
  try {
    const res = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name='workout_history'");
    console.log('rows:', res.rows);
  } catch (e) {
    console.error(e);
  } finally {
    await pool.end();
  }
})();
