import { DB } from './db.js';
export const Admin = (function(){
  function render(){
    const user = DB.sessionUser();
    if(!user){ alert('Admin only (login as admin/admin)'); return; }
    const pending = DB.pending();
    const main = document.getElementById('main');
    main.innerHTML = `<div class="container"><aside class="sidebar card"><h3>Admin Panel</h3><p>Pending: ${pending.length}</p></aside><section class="content card"><h3>Pending Approvals</h3><div id="pending_list">${pending.map(it=>`<div class="card"><div style="font-weight:700">${it.title}</div><div class="muted">${it.date} • ${it.submittedBy}</div><div style="margin-top:6px">${it.desc}</div><div style="margin-top:8px"><button class="btn approve" data-id="${it.id}">Approve</button><button class="btn reject" data-id="${it.id}">Reject</button></div></div>`).join('')}</div></section></div>`;
    const list = document.getElementById('pending_list');
    list.onclick = (e)=>{ const b = e.target.closest('button'); if(!b) return; const id=b.dataset.id; if(b.classList.contains('approve')) approve(id); else if(b.classList.contains('reject')) rejectItem(id); };
  }
  function approve(id){
    const pending = DB.pending(); const idx = pending.findIndex(x=>x.id==id); if(idx===-1) return;
    const item = pending.splice(idx,1)[0];
    const items = DB.items();
    items.push({...item, id: Date.now(), owner: item.submittedBy, ownerUser: item.submittedBy});
    DB.saveItems(items); DB.savePending(pending); alert('Approved'); render();
  }
  function rejectItem(id){ if(!confirm('Reject?')) return; const p = DB.pending().filter(x=>x.id!=id); DB.savePending(p); alert('Rejected'); render(); }
  return { render };
})();
