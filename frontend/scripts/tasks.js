// tasks.js — Manage tasks (with role-based permissions)
document.addEventListener('DOMContentLoaded', () => {
  const user = requireAuth(); // Ensure someone is logged in
  if (!user) return;

  const tasksTable = document.getElementById('tasksTable');
  const taskForm = document.getElementById('taskForm');
  const addTaskContainer = document.getElementById('addTaskContainer');

  // Hide "Add Task" button for members
  if (user.role === 'member' && addTaskContainer) {
    addTaskContainer.style.display = 'none';
  }

  // ===== Render Tasks =====
  function render() {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    tasksTable.innerHTML = '';

    if (tasks.length === 0) {
      tasksTable.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-3">No tasks yet.</td></tr>`;
      return;
    }

    tasks.forEach(t => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${t.title}</td>
        <td>${t.project || '-'}</td>
        <td>${t.assignee || '-'}</td>
        <td>${t.priority}</td>
        <td>${t.deadline || '-'}</td>
        <td>${t.status}</td>
        <td>
          ${user.role === 'manager' || user.role === 'admin'
            ? `<button class="btn btn-sm btn-primary me-1" data-id="${t.id}" data-action="edit">Edit</button>`
            : ''
          }
          <button class="btn btn-sm btn-success me-1" data-id="${t.id}" data-action="toggle">Next</button>
          ${user.role !== 'member'
            ? `<button class="btn btn-sm btn-danger" data-id="${t.id}" data-action="delete">Delete</button>`
            : ''
          }
        </td>
      `;
      tasksTable.appendChild(tr);
    });
  }

  // ===== Add New Task =====
  function createTask(data) {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const id = tasks.length ? tasks[tasks.length - 1].id + 1 : 1;
    tasks.push(Object.assign({ id, status: 'To-Do' }, data));
    localStorage.setItem('tasks', JSON.stringify(tasks));
    render();
  }

  // ===== Form Submit =====
  if (taskForm) {
    taskForm.addEventListener('submit', e => {
      e.preventDefault();

      const title = document.getElementById('taskTitle').value.trim();
      const project = document.getElementById('taskProject').value.trim();
      const assignee = document.getElementById('taskAssignee').value.trim();
      const priority = document.getElementById('taskPriority').value;
      const deadline = document.getElementById('taskDeadline').value || null;

      if (!title) return alert('Enter task title');
      if (!project) return alert('Enter project name');

      createTask({ title, project, assignee, priority, deadline });
      taskForm.reset();

      const modalEl = document.getElementById('taskModal');
      const modal = bootstrap.Modal.getInstance(modalEl);
      modal.hide();
    });
  }

  // ===== Handle Actions =====
  tasksTable.addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (!btn) return;

    const id = Number(btn.dataset.id);
    const action = btn.dataset.action;
    let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const idx = tasks.findIndex(t => t.id === id);
    if (idx === -1) return;

    // --- Toggle task status ---
    if (action === 'toggle') {
      const arr = ['To-Do', 'In Progress', 'Done'];
      const cur = tasks[idx].status;
      tasks[idx].status = arr[(arr.indexOf(cur) + 1) % arr.length];
      localStorage.setItem('tasks', JSON.stringify(tasks));
      render();
    }

    // --- Edit task (Managers/Admins only) ---
    else if (action === 'edit') {
  const currentTask = tasks[idx];

  // Fill modal fields
  document.getElementById('editTaskTitle').value = currentTask.title;
  document.getElementById('editTaskProject').value = currentTask.project || '';

  // Store which task is being edited
  localStorage.setItem('editingTaskId', id);

  // Show the modal
  const editModal = new bootstrap.Modal(document.getElementById('editTaskModal'));
  editModal.show();
}


    // --- Delete task (not for members) ---
    else if (action === 'delete') {
      if (!confirm('Delete this task?')) return;
      tasks = tasks.filter(t => t.id !== id);
      localStorage.setItem('tasks', JSON.stringify(tasks));
      render();
    }
  });

  // ===== Initial Render =====
  // ===== Handle Edit Form Save =====
const editForm = document.getElementById('editTaskForm');
if (editForm) {
  editForm.addEventListener('submit', e => {
    e.preventDefault();
    const id = Number(localStorage.getItem('editingTaskId'));
    if (!id) return;

    let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const idx = tasks.findIndex(t => t.id === id);
    if (idx === -1) return;

    tasks[idx].title = document.getElementById('editTaskTitle').value.trim();
    tasks[idx].project = document.getElementById('editTaskProject').value.trim();

    localStorage.setItem('tasks', JSON.stringify(tasks));

    const modalEl = document.getElementById('editTaskModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal.hide();

    render();
  });
}

  render();
});
