import { DB } from './db.js';
import * as FS from './fileStore.js';
import { Gallery } from './gallery.js';
export const Timeline = (function(){
  async function render(){
    const items = DB.items();
    const main = document.getElementById('main');
    const byYear = items.reduce((acc,it)=>{ const y=(it.date||'Unknown').slice(0,4)||'Unknown'; (acc[y]=acc[y]||[]).push(it); return acc; }, {});
    const years = Object.keys(byYear).sort((a,b)=>b-a);
    main.innerHTML = `<div class="container"><aside class="sidebar card"><h3>Timeline</h3><p>Years: ${years.join(', ')}</p></aside><section class="content card">${years.map(y=>`<div class="card"><h4>${y}</h4><div class="timeline-row" id="row_${y}"></div></div>`).join('')}</section></div>`;
    for(const y of years){
      const row = document.getElementById('row_'+y);
      for(const it of byYear[y]){
        const el = document.createElement('div'); el.className='event-card';
        if(it.files && it.files[0]){
          const data = await FS.getFile(it.files[0].id);
          el.innerHTML = `<div class="event-thumb"><img src="${data}"></div><div style="font-weight:600">${it.title}</div><div class="muted">${it.date}</div>`;
        } else {
          el.innerHTML = `<div class="event-thumb"><div class="muted">No Image</div></div><div style="font-weight:600">${it.title}</div><div class="muted">${it.date}</div>`;
        }
        el.onclick = ()=>Gallery.openViewer(it);
        row.appendChild(el);
      }
    }
  }
  return { render };
})();
