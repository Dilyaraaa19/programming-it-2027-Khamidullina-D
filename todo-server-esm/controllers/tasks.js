import { randomUUID } from "node:crypto";

import * as repository from "../repositories/tasks.js";

export async function getTasks(req, res) {
  const tasks = await repository.findAllTasks();

  return res.status(200).json(tasks);
}

export async function createTask(req, res) {
  const { title, studentId } = req.body ?? {};

  if (typeof title !== "string" || !title.trim()) {
    return res.status(400).json({
      message: "title должен быть непустой строкой",
    });
  }

  if (typeof studentId !== "string" || !studentId.trim()) {
    return res.status(400).json({
      message: "studentId должен быть непустой строкой",
    });
  }

  const task = await repository.insertTask({
    id: randomUUID(),
    title: title.trim(),
    completed: false,
    studentId: studentId.trim(),
  });

  return res.status(201).json(task);
}

export async function updateTask(req, res) {
  const { completed, title } = req.body ?? {};

  if (completed !== undefined && typeof completed !== "boolean") {
    return res.status(400).json({
      message: "completed должен быть boolean",
    });
  }

  if (title !== undefined) {
    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        message: "title должен быть непустой строкой",
      });
    }
  }

  const task = await repository.updateTaskById(req.params.id, {
    title: title === undefined ? undefined : title.trim(),
    completed,
  });

  if (!task) {
    return res.status(404).json({
      message: "Задача не найдена",
    });
  }

  return res.status(200).json(task);
}

export async function deleteTask(req, res) {
  const deleted = await repository.deleteTaskById(req.params.id);

  if (!deleted) {
    return res.status(404).json({
      message: "Задача не найдена",
    });
  }

  return res.status(204).end();
}