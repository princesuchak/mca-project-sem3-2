import { DB } from './db.js';
import * as FS from './fileStore.js';

export const Gallery = (function(){

  async function render(){
    const list = DB.items();
    const main = document.getElementById("main");

    main.innerHTML = `
      <div class="container">
        <section class="content card">
          <h3>Gallery</h3>
          <div class="gallery-grid" id="gg"></div>
        </section>
      </div>
    `;

    const grid = document.getElementById("gg");

    for (let item of list){
      let thumb = "";

      if(item.files?.length){
        const data = await FS.getFile(item.files[0].id);
        thumb = `
        <div class="gallery-thumb">
            <img src="${data}">
        </div>`;
      } else {
        thumb = `
        <div class="gallery-thumb">
            <div class="muted">No Image</div>
        </div>`;
      }

      const card = document.createElement("div");
      card.className = "gallery-item";
      card.innerHTML = `
        ${thumb}
        <div style="font-weight:600;margin-top:6px">${item.title}</div>
        <div class="muted">${item.date}</div>
      `;

      card.onclick = () => openViewer(item);
      grid.appendChild(card);
    }
  }


  // =========================
  //      VIEWER SLIDER
  // =========================

  async function openViewer(item){

    // Load images
    let images = [];
    if(item.files?.length){
      for (let f of item.files){
        const base64 = await FS.getFile(f.id);
        images.push(base64);
      }
    } else {
      images.push("NO_IMG");
    }

    let index = 0;

    // Overlay
    const overlay = document.createElement("div");
    overlay.className = "viewer-overlay";

    const inner = document.createElement("div");
    inner.className = "viewer-inner";

    overlay.appendChild(inner);
    document.body.appendChild(overlay);

    // --------- RENDER FUNCTION ----------
    function renderSlide(){

      let imgHTML = "";
      if(images[index] === "NO_IMG"){
        imgHTML = `<div class="muted">No Image</div>`;
      } else {
        imgHTML = `<img src="${images[index]}">`;
      }

      inner.innerHTML = `
        <div class="viewer-media">${imgHTML}</div>

        <div class="viewer-meta">
          <h2>${item.title}</h2>
          <div class="muted">${item.date} • ${item.cat}</div>

          <p style="margin-top:12px">${item.desc}</p>

          <div style="margin-top:20px; display:flex; gap:10px;">
            <button class="btn navBtn" data-action="prev" ${index===0?'disabled':''}>← Previous</button>
            <button class="btn navBtn" data-action="next" ${index===images.length-1?'disabled':''}>Next →</button>
            <button class="btn" id="closeBtn" style="margin-left:auto;background:#e53935;">Close</button>
          </div>

          <div class="muted" style="margin-top:8px;text-align:right;">
            ${index+1} / ${images.length}
          </div>
        </div>
      `;

      // SAFE BUTTON BINDING
      document.querySelectorAll(".navBtn").forEach(btn=>{
        btn.onclick = ()=>{
          const action = btn.dataset.action;
          if(action==="prev" && index>0){
            index--;
            renderSlide();
          }
          if(action==="next" && index<images.length-1){
            index++;
            renderSlide();
          }
        };
      });

      const closeBtn = document.getElementById("closeBtn");
      if(closeBtn) closeBtn.onclick = () => overlay.remove();
    }

    renderSlide();
  }


  return { render };

})();
