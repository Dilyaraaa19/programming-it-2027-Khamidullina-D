import { randomUUID } from "node:crypto";

import * as repository from "../repositories/tasks.js";

let tasks = await repository.loadTasks();

export async function getTasks(req, res) {
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

  const task = {
    id: randomUUID(),
    title: title.trim(),
    completed: false,
    studentId: studentId.trim(),
  };

  const nextTasks = [...tasks, task];

  await repository.saveTasks(nextTasks);
  tasks = nextTasks;

  return res.status(201).json(task);
}

export async function updateTask(req, res) {
  const { completed, title } = req.body ?? {};

  const task = tasks.find((item) => item.id === req.params.id);

  if (!task) {
    return res.status(404).json({
      message: "Задача не найдена",
    });
  }

  if (completed !== undefined) {
    if (typeof completed !== "boolean") {
      return res.status(400).json({
        message: "completed должен быть boolean",
      });
    }

    task.completed = completed;
  }

  if (title !== undefined) {
    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        message: "title должен быть непустой строкой",
      });
    }

    task.title = title.trim();
  }

  await repository.saveTasks(tasks);

  return res.status(200).json(task);
}

export async function deleteTask(req, res) {
  const nextTasks = tasks.filter((task) => task.id !== req.params.id);

  if (nextTasks.length === tasks.length) {
    return res.status(404).json({
      message: "Задача не найдена",
    });
  }

  await repository.saveTasks(nextTasks);
  tasks = nextTasks;

  return res.status(204).end();
}