import { pool } from "../db/pool.js";

export async function findAllTasks() {
  const result = await pool.query(
    `SELECT id, title, completed, student_id AS "studentId"
     FROM tasks`
  );

  return result.rows;
}

export async function findTaskById(id) {
  const result = await pool.query(
    `SELECT id, title, completed, student_id AS "studentId"
     FROM tasks
     WHERE id = $1`,
    [id]
  );

  return result.rows[0] || null;
}

export async function insertTask({ id, title, completed, studentId }) {
  const result = await pool.query(
    `INSERT INTO tasks (id, title, completed, student_id)
     VALUES ($1, $2, $3, $4)
     RETURNING id, title, completed, student_id AS "studentId"`,
    [id, title, completed, studentId]
  );

  return result.rows[0];
}

export async function updateTaskById(id, { title, completed }) {
  const result = await pool.query(
    `UPDATE tasks
     SET title = COALESCE($2, title),
         completed = COALESCE($3, completed)
     WHERE id = $1
     RETURNING id, title, completed, student_id AS "studentId"`,
    [id, title ?? null, completed ?? null]
  );

  return result.rows[0] || null;
}

export async function deleteTaskById(id) {
  const result = await pool.query(
    `DELETE FROM tasks
     WHERE id = $1
     RETURNING id`,
    [id]
  );

  return result.rowCount > 0;
}