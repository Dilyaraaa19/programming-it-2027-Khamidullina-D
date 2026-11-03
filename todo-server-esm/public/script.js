const API_URL = "/api/v1/tasks";
const STUDENT_ID = "khamidullina-dilyara";
const CACHE_KEY = `todo-cache-${API_URL}-${STUDENT_ID}`;

const form = document.querySelector("#task-form");
const input = document.querySelector("#task-title");
const list = document.querySelector("#task-list");
const addButton = document.querySelector("#add-button");
const status = document.querySelector("#status");

function showStatus(text, isError = false) {
  status.textContent = text;
  status.hidden = false;
  status.style.color = isError ? "#dc2626" : "#6b7280";
}

function hideStatus() {
  status.hidden = true;
  status.textContent = "";
}

function saveCache(tasks) {
  localStorage.setItem(CACHE_KEY, JSON.stringify(tasks));
}

function readCache() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);

    if (!cached) {
      return [];
    }

    const parsed = JSON.parse(cached);

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Не удалось прочитать кэш", error);
    return [];
  }
}

function renderTask(task) {
  const item = document.createElement("li");
  item.className = task.completed ? "completed" : "";
  item.dataset.id = task.id;

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "task-checkbox";
  checkbox.checked = Boolean(task.completed);
  checkbox.dataset.id = task.id;

  const taskText = document.createElement("span");
  taskText.className = "task-text";
  taskText.textContent = task.title;

  const editButton = document.createElement("button");
  editButton.className = "edit-button";
  editButton.textContent = "Изменить";
  editButton.dataset.id = task.id;

  const deleteButton = document.createElement("button");
  deleteButton.className = "delete-button";
  deleteButton.textContent = "Удалить";
  deleteButton.dataset.id = task.id;

  item.append(checkbox, taskText, editButton, deleteButton);
  list.append(item);
}

function renderTasks(tasks) {
  list.innerHTML = "";

  const myTasks = tasks.filter((task) => task.studentId === STUDENT_ID);

  if (myTasks.length === 0) {
    showStatus("Задач пока нет. Добавьте первую!");
    return;
  }

  hideStatus();
  myTasks.forEach(renderTask);
}

async function loadTasks() {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Не удалось загрузить задачи");
  }

  return response.json();
}

async function createTask(title) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title,
      studentId: STUDENT_ID,
    }),
  });

  if (!response.ok) {
    throw new Error("Не удалось создать задачу");
  }

  return response.json();
}

async function updateTask(id, completed) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ completed }),
  });

  if (!response.ok) {
    throw new Error("Не удалось обновить задачу");
  }

  return response.json();
}

async function updateTaskTitle(id, title) {
  const body = { title };

  console.log("Отправляем PATCH:", body);

  const response = await fetch(`${API_URL}/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Ответ сервера:", errorText);
    throw new Error("Не удалось изменить задачу");
  }

  return response.json();
}

async function deleteTask(id) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Не удалось удалить задачу");
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

async function initTasks() {
  const cachedTasks = readCache();

  if (cachedTasks.length > 0) {
    renderTasks(cachedTasks);
    showStatus("Показан кэш. Обновляем данные...");
  } else {
    showStatus("Загрузка задач...");
  }

  try {
    const tasks = await loadTasks();
    saveCache(tasks);
    renderTasks(tasks);
  } catch (error) {
    console.error(error);
    showStatus(
      cachedTasks.length > 0
        ? "Не удалось обновить задачи. Показаны сохранённые данные."
        : error.message,
      true
    );
  }
}

async function addTaskHandler(event) {
  event.preventDefault();

  const title = input.value.trim();

  if (!title) {
    return;
  }

  addButton.disabled = true;
  addButton.textContent = "Добавляем...";

  try {
    const task = await createTask(title);

    renderTask(task);
    hideStatus();

    const currentTasks = readCache();
    saveCache([...currentTasks, task]);

    input.value = "";
    input.focus();
  } catch (error) {
    console.error(error);
    showStatus(error.message, true);
  } finally {
    addButton.disabled = false;
    addButton.textContent = "Добавить";
  }
}

async function handleListClick(event) {
  const checkbox = event.target.closest(".task-checkbox");
  const editButton = event.target.closest(".edit-button");
  const deleteButton = event.target.closest(".delete-button");

  if (checkbox) {
    await handleToggleTask(checkbox);
    return;
  }

  if (editButton) {
    await handleEditTask(editButton);
    return;
  }

  if (deleteButton) {
    await handleDeleteTask(deleteButton);
  }
}

async function handleToggleTask(checkbox) {
  const id = checkbox.dataset.id;
  const completed = checkbox.checked;
  const item = checkbox.closest("li");

  checkbox.disabled = true;

  try {
    const updatedTask = await updateTask(id, completed);

    item.classList.toggle("completed", completed);

    const currentTasks = readCache();
    const nextTasks = currentTasks.map((task) =>
      task.id === id ? updatedTask : task
    );

    saveCache(nextTasks);
  } catch (error) {
    console.error(error);
    showStatus(error.message, true);
    checkbox.checked = !completed;
  } finally {
    checkbox.disabled = false;
  }
}

async function handleEditTask(editButton) {
  const id = editButton.dataset.id;
  const item = editButton.closest("li");
  const taskText = item.querySelector(".task-text");

  const newTitle = prompt("Измените задачу:", taskText.textContent);

  if (newTitle === null) {
    return;
  }

  const title = newTitle.trim();

  if (!title) {
    showStatus("Название задачи не может быть пустым", true);
    return;
  }

  editButton.disabled = true;

  try {
    const updatedTask = await updateTaskTitle(id, title);

    taskText.textContent = updatedTask.title;

    const currentTasks = readCache();
    const nextTasks = currentTasks.map((task) =>
      task.id === id ? updatedTask : task
    );

    saveCache(nextTasks);
    hideStatus();
  } catch (error) {
    console.error(error);
    showStatus(error.message, true);
  } finally {
    editButton.disabled = false;
  }
}

async function handleDeleteTask(deleteButton) {
  const id = deleteButton.dataset.id;

  deleteButton.disabled = true;

  try {
    await deleteTask(id);

    deleteButton.closest("li").remove();

    const currentTasks = readCache();
    saveCache(currentTasks.filter((task) => task.id !== id));

    if (list.children.length === 0) {
      showStatus("Задач пока нет. Добавьте первую!");
    }
  } catch (error) {
    console.error(error);
    showStatus(error.message, true);
    deleteButton.disabled = false;
  }
}

form.addEventListener("submit", addTaskHandler);
list.addEventListener("click", handleListClick);

initTasks();