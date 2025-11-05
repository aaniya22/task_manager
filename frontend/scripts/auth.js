// auth.js - signup & login logic (vanilla localStorage)
document.addEventListener('DOMContentLoaded', ()=>{

  // show nav user on pages that have it
  const navUserEls = document.querySelectorAll('#nav-user');
  const cu = JSON.parse(localStorage.getItem('currentUser') || 'null');
  if(navUserEls && cu){
    navUserEls.forEach(el => el.textContent = cu.name + ' • ' + cu.role);
  }

  // Signup
  const signupForm = document.getElementById('signupForm');
  if(signupForm){
    signupForm.addEventListener('submit', e=>{
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim().toLowerCase();
      const password = document.getElementById('password').value;
      const role = document.getElementById('role').value;

      const users = JSON.parse(localStorage.getItem('users') || '[]');
      if(users.find(u=>u.email === email)){ alert('Email already used'); return; }
      const id = users.length ? users[users.length-1].id + 1 : 1;
      users.push({id, name, email, password, role});
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('currentUser', JSON.stringify({id, name, email, role}));
      goTo('dashboard.html');
    });
  }

  // Login
  const loginForm = document.getElementById('loginForm');
  if(loginForm){
    loginForm.addEventListener('submit', e=>{
      e.preventDefault();
      const email = document.getElementById('email').value.trim().toLowerCase();
      const password = document.getElementById('password').value;
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find(u => u.email === email && u.password === password);
      if(!user){ alert('Invalid credentials — demo: manager@demo / member@demo (pass demo)'); return; }
      localStorage.setItem('currentUser', JSON.stringify({id:user.id, name:user.name, email:user.email, role:user.role}));
      goTo('dashboard.html');
    });
  }
});
