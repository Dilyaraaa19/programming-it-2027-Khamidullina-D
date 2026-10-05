const tasks = [];

const form = document.querySelector('#task-form');
const input = document.querySelector('#task-title');
const list = document.querySelector('#task-list');

function addTask(text) {
  const title = text.trim();

  if (!title) return;

  tasks.push({
    id: Date.now(),
    title
  });
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const title = input.value.trim();

  if (!title) return;

  addTask(title);

  const task = tasks[tasks.length - 1];

  const item = document.createElement('li');

  const taskText = document.createElement('span');
  taskText.textContent = title;

  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'Удалить';
  deleteButton.dataset.id = task.id;

  item.append(taskText, deleteButton);
  list.append(item);

  input.value = '';
});

list.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-id]');

  if (!button) return;

  const id = Number(button.dataset.id);

  const index = tasks.findIndex(task => task.id === id);

  if (index !== -1) {
    tasks.splice(index, 1);
  }

  button.closest('li').remove();
});