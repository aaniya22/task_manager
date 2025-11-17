// =======================
// tasks.js — Fully Connected to Backend
// =======================

document.addEventListener("DOMContentLoaded", () => {
  const user = requireAuth();
  if (user) {
  const el = document.getElementById("nav-user") || document.getElementById("userInfo");
  if (el) el.textContent = `${user.name} • ${user.role}`;
}
  if (!user) return;

  const token = localStorage.getItem("token");

  const tasksTable = document.getElementById("tasksTable");
  const taskForm = document.getElementById("taskForm");
  const addTaskBtn = document.getElementById("addTaskBtn");
  const searchInput = document.getElementById("searchTask");
  const priorityFilter = document.getElementById("priorityFilter");
  const projectSelect = document.getElementById("taskProject");
  const editForm = document.getElementById("editTaskForm");

  let editingTaskId = null;

  // Hide Add Task button from members
  if (user.role === "member" && addTaskBtn) {
    addTaskBtn.style.display = "none";
  }

  // ============================
  // LOAD PROJECTS FOR CREATE DROPDOWN
  // ============================
  async function loadProjectsForDropdown() {
    try {
      const res = await fetch(`${API_BASE}/api/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      projectSelect.innerHTML = "";
      data.projects.forEach(p => {
        const opt = document.createElement("option");
        opt.value = p._id;
        opt.textContent = p.title;
        projectSelect.appendChild(opt);
      });
    } catch (err) {
      console.error("Project dropdown failed:", err);
    }
  }

  // ============================
  // LOAD PROJECTS FOR EDIT DROPDOWN
  // ============================
  async function loadProjectsForEditDropdown(selectedProjectId = "") {
    try {
      const res = await fetch(`${API_BASE}/api/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      const editSelect = document.getElementById("editTaskProject");
      editSelect.innerHTML = "";

      data.projects.forEach(p => {
        const opt = document.createElement("option");
        opt.value = p._id;
        opt.textContent = p.title;
        if (p._id === selectedProjectId) opt.selected = true;
        editSelect.appendChild(opt);
      });
    } catch (err) {
      console.error("Edit dropdown failed:", err);
    }
  }

  // ============================
  // LOAD + RENDER TASKS
  // ============================
  async function loadTasks() {
    const res = await fetch(`${API_BASE}/api/tasks`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    renderTasks(data.tasks || []);
  }

  function renderTasks(tasks) {
    tasksTable.innerHTML = "";
    const search = searchInput.value.toLowerCase();
    const priority = priorityFilter.value.toLowerCase();

    tasks
      .filter(t => t.title.toLowerCase().includes(search))
      .filter(t => !priority || t.priority.toLowerCase() === priority)
      .forEach(t => {
        const tr = document.createElement("tr");
        const projectName = t.projectId?.title || "-";

        let actions = "";
        if (user.role === "member") {
          if (t.assignee === user.email) {
            actions = `<button class="btn btn-sm btn-success" data-id="${t._id}" data-action="toggle">Next</button>`;
          }
        } else {
          actions = `
            <button class="btn btn-sm btn-success me-1" data-id="${t._id}" data-action="toggle">Next</button>
            <button class="btn btn-sm btn-primary me-1" data-id="${t._id}" data-action="edit">Edit</button>
            <button class="btn btn-sm btn-danger" data-id="${t._id}" data-action="delete">Delete</button>
          `;
        }

        tr.innerHTML = `
          <td>${t.title}</td>
          <td>${projectName}</td>
          <td>${t.assignee || "-"}</td>
          <td>${t.priority}</td>
          <td>${t.deadline ? new Date(t.deadline).toLocaleDateString() : "-"}</td>
          <td>${t.status}</td>
          <td>${actions}</td>
        `;

        tasksTable.appendChild(tr);
      });
  }

  // ============================
  // CREATE TASK
  // ============================
  taskForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const taskData = {
      title: document.getElementById("taskTitle").value.trim(),
      projectId: projectSelect.value,
      assignee: document.getElementById("taskAssignee").value.trim(),
      priority: document.getElementById("taskPriority").value,
      deadline: document.getElementById("taskDeadline").value,
      status: "To-Do"
    };

    await fetch(`${API_BASE}/api/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(taskData)
    });

    document.querySelector("#taskModal .btn-close").click();
    taskForm.reset();
    loadTasks();
  });

  // ============================
  // TABLE BUTTON HANDLING
  // ============================
  tasksTable.addEventListener("click", async (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const id = btn.dataset.id;
    const action = btn.dataset.action;

    // TOGGLE STATUS
    if (action === "toggle") {
      const flow = ["To-Do", "In Progress", "Done"];
      const current = e.target.closest("tr").children[5].innerText;
      const next = flow[(flow.indexOf(current) + 1) % flow.length];

      await fetch(`${API_BASE}/api/tasks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: next })
      });

      return loadTasks();
    }

    // DELETE TASK
    if (action === "delete") {
      await fetch(`${API_BASE}/api/tasks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      return loadTasks();
    }

    // EDIT TASK
    if (action === "edit") {
      editingTaskId = id;

      const res = await fetch(`${API_BASE}/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        alert("Task does not exist on server anymore.");
        return loadTasks();
      }

      const data = await res.json();
      const t = data.task;

      document.getElementById("editTaskTitle").value = t.title;
      await loadProjectsForEditDropdown(t.projectId?._id || "");
      document.getElementById("editTaskAssignee").value = t.assignee || "";
      document.getElementById("editTaskPriority").value = t.priority;
      document.getElementById("editTaskDeadline").value =
        t.deadline ? t.deadline.split("T")[0] : "";
      document.getElementById("editTaskStatus").value = t.status;



      new bootstrap.Modal(document.getElementById("editTaskModal")).show();
    }
  });

  // ============================
  // SAVE EDITED TASK
  // ============================
  editForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    await fetch(`${API_BASE}/api/tasks/${editingTaskId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        title: document.getElementById("editTaskTitle").value.trim(),
        projectId: document.getElementById("editTaskProject").value,
        assignee: document.getElementById("editTaskAssignee").value.trim(),
        priority: document.getElementById("editTaskPriority").value,
        deadline: document.getElementById("editTaskDeadline").value,
        status: document.getElementById("editTaskStatus").value
      })

    });

    editingTaskId = null;
    document.querySelector("#editTaskModal .btn-close").click();
    loadTasks();
  });

  // ============================
  // SEARCH + FILTER
  // ============================
  searchInput.addEventListener("input", loadTasks);
  priorityFilter.addEventListener("change", loadTasks);

  // ============================
  // INITIAL LOAD
  // ============================
  loadProjectsForDropdown();
  loadTasks();
});
