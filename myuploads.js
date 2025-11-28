import { DB } from './db.js';
export const MyUploads = (function(){
  function render(){
    const user = DB.sessionUser();
    if(!user){ alert('Login required'); return; }
    const all = DB.items().filter(i=>i.ownerUser===user);
    const main = document.getElementById('main');
    main.innerHTML = `<div class="container"><section class="content card"><h3>My Uploads</h3><div id="my_list" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px"></div></section></div>`;
    const box = document.getElementById('my_list');
    if(!all.length) box.innerHTML = '<div class="muted">No uploads yet</div>';
    all.forEach(it=>{ const el=document.createElement('div'); el.className='card'; el.innerHTML = `<div style="font-weight:700">${it.title}</div><div class="muted">${it.date}</div><div style="margin-top:8px"><button class="btn del" data-id="${it.id}">Delete</button></div>`; box.appendChild(el); });
    box.onclick = (e)=>{ const btn = e.target.closest('button'); if(!btn) return; if(btn.classList.contains('del')){ const id = btn.dataset.id; if(confirm('Delete?')){ const items = DB.items().filter(x=>!(x.id==id && x.ownerUser===user)); DB.saveItems(items); alert('Deleted'); render(); } } };
  }
  return { render };
})();
