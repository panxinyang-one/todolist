import { Router, Request, Response } from 'express';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '../db.js';

const router = Router();

export interface TodoRow extends RowDataPacket {
  id: number;
  title: string;
  completed: number;
  created_at: Date;
  updated_at: Date;
}

router.get('/', async (_req: Request, res: Response) => {
  try {
    const [rows] = await pool.query<TodoRow[]>(
      'SELECT id, title, completed, created_at, updated_at FROM todos ORDER BY id DESC'
    );
    res.json(
      rows.map((row) => ({
        ...row,
        completed: Boolean(row.completed),
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  const title = typeof req.body?.title === 'string' ? req.body.title.trim() : '';
  if (!title) {
    res.status(400).json({ error: 'Title is required' });
    return;
  }
  try {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO todos (title) VALUES (?)',
      [title]
    );
    const insertId = result.insertId;
    const [rows] = await pool.query<TodoRow[]>(
      'SELECT id, title, completed, created_at, updated_at FROM todos WHERE id = ?',
      [insertId]
    );
    const row = rows[0];
    res.status(201).json({ ...row, completed: Boolean(row.completed) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

router.patch('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ error: 'Invalid id' });
    return;
  }

  const updates: string[] = [];
  const values: (string | number)[] = [];

  if (typeof req.body?.title === 'string') {
    const title = req.body.title.trim();
    if (!title) {
      res.status(400).json({ error: 'Title cannot be empty' });
      return;
    }
    updates.push('title = ?');
    values.push(title);
  }

  if (typeof req.body?.completed === 'boolean') {
    updates.push('completed = ?');
    values.push(req.body.completed ? 1 : 0);
  }

  if (updates.length === 0) {
    res.status(400).json({ error: 'No valid fields to update' });
    return;
  }

  values.push(id);

  try {
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE todos SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Todo not found' });
      return;
    }
    const [rows] = await pool.query<TodoRow[]>(
      'SELECT id, title, completed, created_at, updated_at FROM todos WHERE id = ?',
      [id]
    );
    const row = rows[0];
    res.json({ ...row, completed: Boolean(row.completed) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ error: 'Invalid id' });
    return;
  }
  try {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM todos WHERE id = ?',
      [id]
    );
    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Todo not found' });
      return;
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

export default router;
