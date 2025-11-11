document.addEventListener("DOMContentLoaded", () => {
  const user = requireAuth();
  if (!user) return;

  const projectsTable = document.getElementById("projectsTable");
  const projectForm = document.getElementById("projectForm");
  const addProjectBtn = document.getElementById("addProjectBtn");
  const searchInput = document.getElementById("searchProject");

  let editingProjectId = null;

  // Show logged in user in navbar
  document.getElementById("nav-user").textContent = `${user.name} • ${user.role}`;

  // ✅ Hide Add New Project button if user is MEMBER
  if (user.role === "member") {
    addProjectBtn.style.display = "none";
  }

  function sortByDeadline(projects) {
    return projects.sort((a, b) => new Date(a.deadline || "2100-01-01") - new Date(b.deadline || "2100-01-01"));
  }

  function render() {
    let projects = JSON.parse(localStorage.getItem("projects") || "[]");
    projects = sortByDeadline(projects);

    const search = searchInput.value.toLowerCase();
    projectsTable.innerHTML = "";

    projects
      .filter(p =>
        p.title.toLowerCase().includes(search) ||
        p.manager.toLowerCase().includes(search)
      )
      .forEach(p => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
          <td>${p.title}</td>
          <td>${p.manager || "-"}</td>
          <td>${p.status}</td>
          <td>${p.members?.join(", ") || "-"}</td>
          <td>${p.deadline || "-"}</td>
          <td>
            ${
              user.role !== "member"
                ? `
                  <button class="btn btn-sm btn-warning me-1" data-id="${p.id}" data-action="update">Update</button>
                  <button class="btn btn-sm btn-danger" data-id="${p.id}" data-action="delete">Delete</button>
                  `
                : "-"
            }
          </td>
        `;
        projectsTable.appendChild(tr);
      });
  }

  projectForm.addEventListener("submit", e => {
    e.preventDefault();

    let projects = JSON.parse(localStorage.getItem("projects") || "[]");

    const newData = {
      title: document.getElementById("projTitle").value.trim(),
      description: document.getElementById("projDesc").value.trim(),
      manager: document.getElementById("projManager").value.trim(),
      status: document.getElementById("projStatus").value,
      deadline: document.getElementById("projDeadline").value,
      members: [user.email]
    };

    if (editingProjectId) {
      const index = projects.findIndex(p => p.id === editingProjectId);
      projects[index] = { ...projects[index], ...newData };
      editingProjectId = null;
      document.querySelector(".modal-title").textContent = "New Project";
    } else {
      const id = projects.length ? projects.at(-1).id + 1 : 1;
      projects.push({ id, ...newData });
    }

    localStorage.setItem("projects", JSON.stringify(projects));
    document.querySelector("#projectModal .btn-close").click();
    projectForm.reset();
    render();
  });

  projectsTable.addEventListener("click", e => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const id = Number(btn.dataset.id);
    const action = btn.dataset.action;
    let projects = JSON.parse(localStorage.getItem("projects") || "[]");
    const project = projects.find(p => p.id === id);

    if (action === "delete") {
      if (confirm("Delete this project?")) {
        projects = projects.filter(p => p.id !== id);
        localStorage.setItem("projects", JSON.stringify(projects));
        render();
      }
    }

    if (action === "update") {
      editingProjectId = id;

      document.getElementById("projTitle").value = project.title;
      document.getElementById("projDesc").value = project.description;
      document.getElementById("projManager").value = project.manager;
      document.getElementById("projStatus").value = project.status;
      document.getElementById("projDeadline").value = project.deadline || "";

      document.querySelector(".modal-title").textContent = "Update Project";

      new bootstrap.Modal(document.getElementById("projectModal")).show();
    }
  });

  searchInput.addEventListener("input", render);

  render();
});
