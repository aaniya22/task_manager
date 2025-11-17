// =============================================
// projects.js — Fully Connected to Backend API
// =============================================

function startNewProject() {
  editingProjectId = null;
  projectForm.reset();
  document.querySelector(".modal-title").textContent = "New Project";
}

function openNewProjectModal() {
  editingProjectId = null; // reset
  document.getElementById("projTitle").value = "";
  document.getElementById("projDesc").value = "";
  document.getElementById("projManager").value = "";
  document.getElementById("projStatus").value = "Not Started";
  document.getElementById("projDeadline").value = "";
  document.querySelector(".modal-title").textContent = "New Project";
}


document.addEventListener("DOMContentLoaded", () => {

  console.log("API_BASE =", window.API_BASE); // Debug line — shows correct URL

  const user = requireAuth();
  if (!user) return;

  const API = window.API_BASE;
  const token = localStorage.getItem("token");

  // DOM Elements
  const projectsTable = document.getElementById("projectsTable");
  const projectForm = document.getElementById("projectForm");
  const addProjectBtn = document.getElementById("addProjectBtn");
  const searchInput = document.getElementById("searchProject");
  const sortSelect = document.getElementById("sortDeadline");

  let editingProjectId = null;

  // Show logged-in user
  document.getElementById("nav-user").textContent = `${user.name} • ${user.role}`;

  // Hide Add Project for members
  if (user.role === "member") {
    addProjectBtn.style.display = "none";
  }

  // ==========================================
  // FETCH ALL PROJECTS
  // ==========================================
  async function fetchProjects() {
    try {
      const res = await fetch(`${API}/api/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      renderProjects(data.projects || []);
    } catch (err) {
      console.error("❌ Failed to load projects:", err);
      alert("Could not load projects. Check console.");
    }
  }

  // ==========================================
  // RENDER PROJECT TABLE
  // ==========================================
  function renderProjects(projects) {
    projectsTable.innerHTML = "";

    const search = searchInput.value.toLowerCase();

    let filtered = projects.filter(
      (p) =>
        p.title.toLowerCase().includes(search) ||
        (p.manager && p.manager.toLowerCase().includes(search))
    );

    // Sorting
    if (sortSelect.value === "nearest") {
      filtered.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    } else if (sortSelect.value === "farthest") {
      filtered.sort((a, b) => new Date(b.deadline) - new Date(a.deadline));
    }

    // No results
    if (filtered.length === 0) {
      projectsTable.innerHTML =
        `<tr><td colspan="6" class="text-center text-muted py-3">No projects found.</td></tr>`;
      return;
    }

    // Add rows
    filtered.forEach((p) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${p.title}</td>
        <td>${p.manager || "-"}</td>
        <td>${p.status}</td>
        <td>${p.members?.join(", ") || "-"}</td>
        <td>${p.deadline ? new Date(p.deadline).toLocaleDateString() : "-"}</td>
        <td>
          ${
            user.role !== "member"
              ? `
                <button class="btn btn-sm btn-warning me-1"
                  data-id="${p._id}" data-action="update">
                  Update
                </button>

                <button class="btn btn-sm btn-danger"
                  data-id="${p._id}" data-action="delete">
                  Delete
                </button>
              `
              : "-"
          }
        </td>
      `;

      projectsTable.appendChild(tr);
    });
  }

  // ==========================================
  // CREATE / UPDATE PROJECT
  // ==========================================
  projectForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const projectData = {
      title: document.getElementById("projTitle").value.trim(),
      description: document.getElementById("projDesc").value.trim(),
      manager: document.getElementById("projManager").value.trim(),
      status: document.getElementById("projStatus").value,
      deadline: document.getElementById("projDeadline").value,
    };

    try {
      const url = editingProjectId
        ? `${API}/api/projects/${editingProjectId}`
        : `${API}/api/projects`;

      const method = editingProjectId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(projectData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      editingProjectId = null;
      projectForm.reset();
      document.querySelector("#projectModal .btn-close").click();

      fetchProjects();
    } catch (err) {
      console.error("❌ Error saving project:", err);
      alert("Could not save project.");
    }
  });

  // ==========================================
  // HANDLE ACTION BUTTONS (UPDATE / DELETE)
  // ==========================================
  projectsTable.addEventListener("click", async (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const id = btn.dataset.id;
    const action = btn.dataset.action;

    // DELETE
    if (action === "delete") {
      if (!confirm("Delete this project?")) return;

      try {
        const res = await fetch(`${API}/api/projects/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Delete failed");

        fetchProjects();
      } catch (err) {
        console.error(err);
        alert("Could not delete project.");
      }
    }

    // UPDATE (prefill modal)
    if (action === "update") {
      editingProjectId = id;

      try {
        const res = await fetch(`${API}/api/projects/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        const p = data.project;

        document.getElementById("projTitle").value = p.title;
        document.getElementById("projDesc").value = p.description;
        document.getElementById("projManager").value = p.manager;
        document.getElementById("projStatus").value = p.status;
        document.getElementById("projDeadline").value =
          p.deadline?.split("T")[0] || "";

        document.querySelector(".modal-title").textContent = "Update Project";
        new bootstrap.Modal(document.getElementById("projectModal")).show();
      } catch (err) {
        console.error("❌ Could not load project details:", err);
        alert("Could not load project details.");
      }
    }
  });

  // Search + Sort bind
  searchInput.addEventListener("input", fetchProjects);
  sortSelect.addEventListener("change", fetchProjects);

  // Initial Data Load
  fetchProjects();
});

document.getElementById("addProjectBtn")?.addEventListener("click", startNewProject);
