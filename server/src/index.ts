import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pool from './db.js';
import todosRouter from './routes/todos.js';

const PORT = Number(process.env.PORT ?? 3000);

async function checkDatabase(): Promise<void> {
  try {
    await pool.query('SELECT 1');
    console.log(
      `Database connected (${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME})`
    );
  } catch (err) {
    console.error('\n[ERROR] Cannot connect to MySQL. Check:');
    console.error('  1. MySQL is running (see README: docker compose dev)');
    console.error('  2. server/.env credentials match MySQL user/password');
    console.error('  3. DB_HOST=localhost and port 3306 is exposed\n');
    console.error(err);
  }
}

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    console.error(err);
    res.status(503).json({ status: 'error', database: 'disconnected' });
  }
});

app.use('/api/todos', todosRouter);

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  await checkDatabase();
});
