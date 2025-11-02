// auth.js - uses backend API for register/login
(function(){
  const registerForm = document.getElementById('registerForm');
  const loginForm = document.getElementById('loginForm');

  async function api(path, data){
    const res = await fetch('/api/' + path, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(data)
    });
    return res.json();
  }

  if(registerForm){
    registerForm.addEventListener('submit', async e=>{
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim().toLowerCase();
      const password = document.getElementById('password').value;
      const resp = await api('auth/register', {name, email, password});
      if(resp.error){ alert(resp.error); return; }
      // save session token and user
      localStorage.setItem('ims_currentUser', JSON.stringify(resp.user));
      localStorage.setItem('ims_token', resp.token);
      location.href = 'inventory.html';
    });
  }

  if(loginForm){
    loginForm.addEventListener('submit', async e=>{
      e.preventDefault();
      const email = document.getElementById('email').value.trim().toLowerCase();
      const password = document.getElementById('password').value;
      const resp = await api('auth/login', {email, password});
      if(resp.error){ alert(resp.error); return; }
      localStorage.setItem('ims_currentUser', JSON.stringify(resp.user));
      localStorage.setItem('ims_token', resp.token);
      location.href = 'inventory.html';
    });
  }

  // If on inventory page, check login
  if(location.pathname.endsWith('inventory.html')){
    const current = localStorage.getItem('ims_currentUser');
    const token = localStorage.getItem('ims_token');
    if(!current || !token){ alert('Please login first.'); location.href='login.html'; }
  }

  // logout button (if present)
  const logoutBtn = document.getElementById('logoutBtn');
  if(logoutBtn){
    logoutBtn.addEventListener('click', ()=>{
      localStorage.removeItem('ims_currentUser');
      localStorage.removeItem('ims_token');
      location.href = 'login.html';
    });
  }

  // display welcome name if present
  const welcomeText = document.getElementById('welcomeText');
  if(welcomeText){
    const cur = JSON.parse(localStorage.getItem('ims_currentUser')||'null');
    if(cur) welcomeText.textContent = 'Hi, '+cur.name;
  }
})();