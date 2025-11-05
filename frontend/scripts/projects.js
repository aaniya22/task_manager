// projects.js - manage projects in localStorage
document.addEventListener('DOMContentLoaded', ()=> {
  const user = requireAuth(); if(!user) return;
  const projectsTable = document.getElementById('projectsTable');
  const projForm = document.getElementById('projectForm');

  function render(){
    const projects = JSON.parse(localStorage.getItem('projects') || '[]');
    projectsTable.innerHTML = '';
    projects.forEach(p=>{
      const members = p.members ? p.members.join(', ') : '-';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${p.title}</td>
        <td>${p.manager || '-'}</td>
        <td>${p.status}</td>
        <td>${members}</td>
        <td>
          <button class="btn btn-sm btn-outline" data-id="${p.id}" data-action="view">View</button>
          <button class="btn btn-sm btn-danger" data-id="${p.id}" data-action="delete">Delete</button>
        </td>
      `;
      projectsTable.appendChild(tr);
    });
  }

  function createProject(data){
    const projects = JSON.parse(localStorage.getItem('projects') || '[]');
    const id = projects.length ? projects[projects.length-1].id + 1 : 1;
    projects.push(Object.assign({id}, data));
    localStorage.setItem('projects', JSON.stringify(projects));
    render();
  }

  // initial render
  render();

  if(projForm){
    projForm.addEventListener('submit', e=>{
      e.preventDefault();
      const title = document.getElementById('projTitle').value.trim();
      const desc = document.getElementById('projDesc').value.trim();
      const manager = document.getElementById('projManager').value.trim() || user.email;
      const status = document.getElementById('projStatus').value;
      createProject({title, description:desc, manager, status, members:[]});
      const modalEl = document.getElementById('projectModal');
      const modal = bootstrap.Modal.getInstance(modalEl);
      modal.hide();
      projForm.reset();
    });
  }

  // actions
  projectsTable.addEventListener('click', e=>{
    const btn = e.target.closest('button'); if(!btn) return;
    const id = Number(btn.dataset.id); const action = btn.dataset.action;
    if(action === 'view'){
      localStorage.setItem('lastProject', id);
      goTo('tasks.html');
    } else if(action === 'delete'){
      if(!confirm('Delete project?')) return;
      let projects = JSON.parse(localStorage.getItem('projects') || '[]');
      projects = projects.filter(p=>p.id !== id);
      localStorage.setItem('projects', JSON.stringify(projects));
      render();
    }
  });
});
