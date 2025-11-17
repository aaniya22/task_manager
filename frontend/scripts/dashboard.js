// =======================
// dashboard.js — UI like screenshot (big donut chart)
// =======================

document.addEventListener("DOMContentLoaded", async () => {
  const user = requireAuth();
  if (!user) return;

  document.getElementById("nav-user").textContent = `${user.name} • ${user.role}`;
  const token = localStorage.getItem("token");

  async function fetchData() {
    try {
      const [projectsRes, tasksRes] = await Promise.all([
        fetch(API_BASE + "/api/projects", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(API_BASE + "/api/tasks", {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const projects = (await projectsRes.json()).projects || [];
      const tasks = (await tasksRes.json()).tasks || [];

      updateCounts(projects, tasks);
      renderStatusDonut(tasks);
      renderMemberChart(tasks);

    } catch (err) {
      console.error("Dashboard fetch error:", err);
      alert("Could not load dashboard data.");
    }
  }

  function updateCounts(projects, tasks) {
    document.getElementById("totalProjects").textContent = projects.length;
    document.getElementById("totalTasks").textContent = tasks.length;

    const completed = tasks.filter(t => t.status === "Done").length;
    document.getElementById("completedTasks").textContent = completed;
    document.getElementById("pendingTasks").textContent = tasks.length - completed;
  }

  function renderStatusDonut(tasks) {
    const statusCounts = { "To-Do": 0, "In Progress": 0, "Done": 0 };
    tasks.forEach(t => (statusCounts[t.status] = (statusCounts[t.status] || 0) + 1));

    const ctx = document.getElementById("statusChart").getContext("2d");

    if (window.statusChart instanceof Chart) {
      window.statusChart.destroy();
    }

    window.statusChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: Object.keys(statusCounts),
        datasets: [
          {
            data: Object.values(statusCounts),
            backgroundColor: ["#A84CFF", "#8A6BFF", "#4B3BFF"],
            borderWidth: 0,
          }
        ]
      },
      options: {
        cutout: "75%",
        responsive: true,
        animation: { duration: 800 },
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: "#fff",
              font: { size: 16, weight: "600" },
              padding: 25,
              boxWidth: 18,
              boxHeight: 12
            }
          }
        },
        layout: { padding: { top: 30, bottom: 20 } }
      }
    });
  }
  function renderMemberChart(tasks) {
  const byMember = {};

  tasks.forEach(t => {
    if (t.assignee) byMember[t.assignee] = (byMember[t.assignee] || 0) + 1;
  });

  const ctx = document.getElementById("memberChart").getContext("2d");

  if (window.memberChart instanceof Chart) {
    window.memberChart.destroy();
  }

  window.memberChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: Object.keys(byMember),
      datasets: [
        {
          label: "Tasks",
          data: Object.values(byMember),
          backgroundColor: "#5114a0ff",
          borderRadius: 2,
          barThickness: 40     // 👈 ensures visibility even for 1 member
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          ticks: { color: "#fff", font: { size: 12 } },
          grid: { display: false }
        },
        y: {
          ticks: { color: "#fff", font: { size: 12 } },
          beginAtZero: true
        }
      }
    }
  });
}



  fetchData();
});



