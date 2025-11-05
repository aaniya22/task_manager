// dashboard.js - counts & charts
document.addEventListener('DOMContentLoaded', ()=>{
  const user = requireAuth(); if(!user) return;
  document.getElementById('nav-user').textContent = user.name + ' • ' + user.role;

  function updateCounts(){
    const projects = JSON.parse(localStorage.getItem('projects') || '[]');
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    document.getElementById('totalProjects').textContent = projects.length;
    document.getElementById('totalTasks').textContent = tasks.length;
    const completed = tasks.filter(t=>t.status === 'Done').length;
    const pending = tasks.filter(t=>t.status !== 'Done').length;
    document.getElementById('completedTasks').textContent = completed;
    document.getElementById('pendingTasks').textContent = pending;
    renderCharts(tasks);
  }

  function renderCharts(tasks){
    const statusCounts = { 'To-Do':0, 'In Progress':0, 'Done':0 };
    const byMember = {};
    tasks.forEach(t=>{
      statusCounts[t.status] = (statusCounts[t.status] || 0) + 1;
      if(t.assignee) byMember[t.assignee] = (byMember[t.assignee] || 0) + 1;
    });

    const ctx = document.getElementById('statusChart').getContext('2d');
    if(window.statusChart) window.statusChart.destroy();
    window.statusChart = new Chart(ctx, {
      type:'doughnut',
      data:{ labels:Object.keys(statusCounts), datasets:[{ data:Object.values(statusCounts), backgroundColor:['#A84CFF','#8A6BFF','#4B3BFF'] }] },
      options:{ responsive:true, plugins:{ legend:{ labels:{ color:'#fff' } } } }
    });

    const ctx2 = document.getElementById('memberChart').getContext('2d');
    if(window.memberChart) window.memberChart.destroy();
    window.memberChart = new Chart(ctx2, {
      type:'bar',
      data:{ labels:Object.keys(byMember), datasets:[{ label:'Tasks', data:Object.values(byMember) }] },
      options:{ responsive:true, scales:{ y:{ beginAtZero:true, ticks:{ color:'#fff' } }, x:{ ticks:{ color:'#fff' } } }, plugins:{ legend:{ labels:{ color:'#fff' } } } }
    });
  }

  updateCounts();
});
