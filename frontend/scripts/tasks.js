// tasks.js — Manage tasks (with role-based permissions & filtering)

document.addEventListener('DOMContentLoaded', () => {
  const user = requireAuth(); // Ensure someone is logged in
  if (!user) return;

  const tasksTable = document.getElementById('tasksTable');
  const taskForm = document.getElementById('taskForm');
  const addTaskContainer = document.getElementById('addTaskContainer');

  // Hide "Add Task" button for members
  // Hide Add Task button for Member role users
if (user.role === "member") {
  if (addTaskContainer) {
    addTaskContainer.style.display = "none";
  }

  // Also hide modal trigger button if user somehow accesses it
  const addTaskBtn = document.getElementById("addTaskBtn");
  if (addTaskBtn) {
    addTaskBtn.remove(); // completely removes the button instead of hiding
  }
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

      let actionButtons = "";

      // ✅ Member can change status ONLY if assigned to them
      if (user.role === "member" && t.assignee === user.email) {
        actionButtons = `<button class="btn btn-sm btn-success" data-id="${t.id}" data-action="toggle">Next</button>`;
      }

      // ✅ Manager/Admin -> Full control
      if (user.role === "manager" || user.role === "admin") {
        actionButtons = `
          <button class="btn btn-sm btn-success me-1" data-id="${t.id}" data-action="toggle">Next</button>
          <button class="btn btn-sm btn-primary me-1" data-id="${t.id}" data-action="edit">Edit</button>
          <button class="btn btn-sm btn-danger" data-id="${t.id}" data-action="delete">Delete</button>
        `;
      }

      tr.innerHTML = `
        <td>${t.title}</td>
        <td>${t.project || '-'}</td>
        <td>${t.assignee || '-'}</td>
        <td>${t.priority}</td>
        <td>${t.deadline || '-'}</td>
        <td>${t.status}</td>
        <td>${actionButtons}</td>
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
      // MEMBER cannot toggle if not assigned to him
      if (user.role === "member" && tasks[idx].assignee !== user.email) {
        return alert("You can only change status of tasks assigned to you.");
      }

      const arr = ['To-Do', 'In Progress', 'Done'];
      const cur = tasks[idx].status;
      tasks[idx].status = arr[(arr.indexOf(cur) + 1) % arr.length];
      localStorage.setItem('tasks', JSON.stringify(tasks));
      render();
    }

    // --- Edit task (Managers/Admins only) ---
    else if (action === 'edit') {
      if (user.role === "member") return; // just in case

      const currentTask = tasks[idx];
      document.getElementById('editTaskTitle').value = currentTask.title;
      document.getElementById('editTaskProject').value = currentTask.project || '';

      localStorage.setItem('editingTaskId', id);

      const editModal = new bootstrap.Modal(document.getElementById('editTaskModal'));
      editModal.show();
    }

    // --- Delete task (not for members) ---
    else if (action === 'delete') {
      if (user.role === "member") return;

      if (!confirm('Delete this task?')) return;
      tasks = tasks.filter(t => t.id !== id);
      localStorage.setItem('tasks', JSON.stringify(tasks));
      render();
    }
  });

  // ===== Edit Task Save =====
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

// ===== Filtering (Search + Priority filter) =====
document.getElementById("searchTask").addEventListener("input", filterTasks);
document.getElementById("priorityFilter").addEventListener("change", filterTasks);

function filterTasks() {
  const search = document.getElementById("searchTask").value.toLowerCase();
  const priority = document.getElementById("priorityFilter").value.toLowerCase();

  document.querySelectorAll("#tasksTable tr").forEach(row => {
    const matchesSearch = row.children[0].innerText.toLowerCase().includes(search);
    const matchesPriority = !priority || row.children[3].innerText.toLowerCase() === priority;

    row.style.display = matchesSearch && matchesPriority ? "" : "none";
  });
}
