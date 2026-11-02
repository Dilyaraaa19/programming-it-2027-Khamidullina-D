const path = require("node:path");
const { randomUUID } = require("node:crypto");
const express = require("express");

const app = express();
const PORT = 3000;
const TASKS_PATH = "/api/v1/tasks";

let tasks = [];

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get(TASKS_PATH, (req, res) => {
  res.status(200).json(tasks);
});

app.get(`${TASKS_PATH}/:id`, (req, res) => {
  const task = tasks.find((item) => item.id === req.params.id);

  if (!task) {
    return res.status(404).json({
      message: "Задача не найдена",
    });
  }

  res.status(200).json(task);
});

app.post(TASKS_PATH, (req, res) => {
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

  tasks.push(task);

  return res.status(201).json(task);
});

app.patch(`${TASKS_PATH}/:id`, (req, res) => {
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

  return res.status(200).json(task);
});

app.delete(`${TASKS_PATH}/:id`, (req, res) => {
  const index = tasks.findIndex((task) => task.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({
      message: "Задача не найдена",
    });
  }

  tasks.splice(index, 1);

  return res.status(204).end();
});

app.use((req, res) => {
  res.status(404).json({
    message: "Маршрут не найден",
  });
});

app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      message: "Некорректный JSON в теле запроса",
    });
  }

  console.error(err);

  return res.status(500).json({
    message: "Внутренняя ошибка сервера",
  });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});