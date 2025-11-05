// main.js - navigation helpers & demo data initializer
function goTo(path){
  // simple redirect using buttons (no links)
  window.location.href = path;
}

function getStorage(key){ return JSON.parse(localStorage.getItem(key) || 'null'); }
function setStorage(key, val){ localStorage.setItem(key, JSON.stringify(val)); }

function ensureDemoData(){
  if(!getStorage('users')){
    const demo = [
      {id:1, name:'Manager Demo', email:'manager@demo', password:'demo', role:'manager'},
      {id:2, name:'Member Demo', email:'member@demo', password:'demo', role:'member'},
      {id:3, name:'Admin Demo', email:'admin@demo', password:'demo', role:'admin'}
    ];
    setStorage('users', demo);
  }
  if(!getStorage('projects')) setStorage('projects', [
    {id:1, title:'Website Redesign', manager:'manager@demo', status:'In Progress', members:['member@demo'], description:'Revamp UI'},
    {id:2, title:'Mobile App', manager:'manager@demo', status:'Not Started', members:['member@demo'], description:'Build Android app'}
  ]);
  if(!getStorage('tasks')) setStorage('tasks', [
    {id:1, title:'Design Landing', projectId:1, assignee:'member@demo', priority:'High', deadline: null, status:'To-Do'},
    {id:2, title:'API Integration', projectId:1, assignee:'member@demo', priority:'Medium', deadline: null, status:'In Progress'}
  ]);
}

// require user - used on protected pages
function requireAuth(){
  const user = getStorage('currentUser');
  if(!user){ window.location.href = 'index.html'; return null; }
  return user;
}

// logout
document.addEventListener('click', e=>{
  if(e.target && e.target.id === 'logoutBtn'){
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
  }
});

// autofill demo with quick click on dashboard/login
function autoFillDemo(email){
  // fill login fields if present
  const loginEmail = document.getElementById('email');
  if(loginEmail) loginEmail.value = email;
  const password = document.getElementById('password');
  if(password) password.value = 'demo';
}

// initialize demo data immediately
ensureDemoData();
