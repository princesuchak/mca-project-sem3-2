import { Auth } from './auth.js';
import { DB } from './db.js';
import * as FS from './fileStore.js';
import { Router } from './router.js';

export const UI = (function(){
  const main = document.getElementById('main');
  const modalRoot = document.getElementById('modalRoot');
  const userDisplay = document.getElementById('userDisplay');
  const btnLogin = document.getElementById('btnLogin');
  const btnLogout = document.getElementById('btnLogout');

  function init(){
    updateUserDisplay();
    btnLogin.onclick = showLoginModal;
    btnLogout.onclick = ()=>{ Auth.logout(); updateUserDisplay(); Router.go('/dashboard'); };
    document.querySelectorAll('[data-nav]').forEach(b=>b.onclick = ()=>{ window.location.hash = b.getAttribute('data-nav'); });
  }

  function setActive(path){
    document.querySelectorAll('.navbtn').forEach(n=>n.classList.remove('active'));
    document.querySelectorAll(`[data-nav="#${path}"]`).forEach(n=>n.classList.add('active'));
  }

  function updateUserDisplay(){
    const u = Auth.userInfo();
    if(u){ userDisplay.textContent = u.display + (u.role==='admin'?' (Admin)':''); btnLogin.classList.add('hidden'); btnLogout.classList.remove('hidden'); document.querySelectorAll('.admin-only').forEach(el=>el.classList.toggle('hidden', u.role!=='admin')); }
    else { userDisplay.textContent='Guest'; btnLogin.classList.remove('hidden'); btnLogout.classList.add('hidden'); document.querySelectorAll('.admin-only').forEach(el=>el.classList.add('hidden')); }
  }

  function showLoginModal(){
    modalRoot.innerHTML = `<div class="card" style="max-width:420px;margin:auto;margin-top:40px;"><h3>Login</h3><label>Username</label><input id="ui_login_user"><label>Password</label><input id="ui_login_pass" type="password"><div style="display:flex;gap:8px;margin-top:10px"><button id="ui_login_btn" class="btn">Login</button><button id="ui_register_btn" class="btn">Register</button><button id="ui_close" class="btn">Close</button></div></div>`;
    modalRoot.classList.remove('hidden');
    document.getElementById('ui_close').onclick = ()=>modalRoot.classList.add('hidden');
    document.getElementById('ui_login_btn').onclick = ()=>{ const u=ui_login_user.value.trim(); const p=ui_login_pass.value; if(Auth.login(u,p)){ modalRoot.classList.add('hidden'); updateUserDisplay(); Router.go('/dashboard'); } else alert('Invalid credentials'); };
    document.getElementById('ui_register_btn').onclick = ()=>{ const u=prompt('Choose username (no spaces)'); const p=prompt('Choose password'); const d=prompt('Display name'); if(u&&p){ if(Auth.register(u,p,d||u)){ alert('Registered and logged in'); modalRoot.classList.add('hidden'); updateUserDisplay(); Router.go('/dashboard'); } else alert('User exists'); } };
  }

  async function showUpload(){
    const u = DB.sessionUser();
    if(!u){ alert('Please login to submit'); Router.go('/dashboard'); return; }
    main.innerHTML = `
      <div class="container">
        <section class="content card">
          <h3>Submit Event / Artifact</h3>
          <label>Title</label><input id="form_title">
          <label>Date</label><input id="form_date" type="date">
          <label>Category</label><select id="form_cat"><option>Event</option><option>Photo</option><option>Document</option><option>Oral History</option></select>
          <label>Description</label><textarea id="form_desc" rows="4"></textarea>
          <label>Upload Files (images/pdf)</label><input id="form_files" type="file" multiple accept="image/*,.pdf">
          <div style="margin-top:12px"><button id="form_submit" class="btn">Submit to Pending</button></div>
        </section>
      </div>
    `;
    document.getElementById('form_submit').onclick = async function(){
      const title = form_title.value.trim(); const date = form_date.value; const cat = form_cat.value; const desc = form_desc.value; const files = form_files.files;
      if(!title||!date) return alert('Title and date required');
      if(!files.length) return alert('Attach at least one file');
      const fileRefs = [];
      for(let f of files){
        const data = await toDataURL(f);
        const id = await FS.putFile(data, {name:f.name, type:f.type});
        fileRefs.push({id, name:f.name, type:f.type});
      }
      const pending = DB.pending();
      pending.push({ id: Date.now()+'_'+Math.random().toString(36).slice(2), title, date, cat, desc, files: fileRefs, submittedBy: DB.sessionUser(), submittedAt: new Date().toISOString() });
      DB.savePending(pending);
      alert('Submitted to pending (files stored in IndexedDB)');
      Router.go('/dashboard');
    };
    function toDataURL(file){ return new Promise(res=>{ const r=new FileReader(); r.onload=()=>res(r.result); r.readAsDataURL(file); }); }
  }

  function renderDashboard(){
    const items = DB.items();
    const pending = DB.pending();
    main.innerHTML = `<div class="container"><aside class="sidebar card"><h3>Dashboard</h3><p>Total items: <strong>${items.length}</strong></p><p>Pending: <strong>${pending.length}</strong></p></aside><section class="content"><div class="card"><h3>Recent Items</h3><div id="dash_recent" style="display:flex;gap:10px;overflow-x:auto"></div></div></section></div>`;
    const recent = document.getElementById('dash_recent');
    items.slice().reverse().slice(0,8).forEach(it=>{ const d=document.createElement('div'); d.className='card'; d.style.minWidth='180px'; d.innerHTML=`<div style="font-weight:700">${it.title}</div><div class="muted">${it.date}</div>`; recent.appendChild(d); });
  }

  function show(){ main.innerHTML=''; }

  return { init, setActive, updateUserDisplay, showUpload, renderDashboard, show };
})();
