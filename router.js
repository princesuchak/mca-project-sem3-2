import { UI } from './ui.js';
import { Timeline } from './timeline.js';
import { Gallery } from './gallery.js';
import { Admin } from './admin.js';
import { MyUploads } from './myuploads.js';

export const Router = (function(){
  const routes = {
    '/dashboard': () => UI.renderDashboard(),
    '/timeline': () => Timeline.render(),
    '/gallery': () => Gallery.render(),
    '/upload': () => UI.showUpload(),
    '/myuploads': () => MyUploads.render(),
    '/admin': () => Admin.render()
  };
  function resolve(path){
    const fn = routes[path] || routes['/dashboard'];
    fn();
    UI.setActive(path);
  }
  function start(){
    window.addEventListener('hashchange', ()=>resolve(window.location.hash.replace('#','') || '/dashboard'));
    if(!window.location.hash) window.location.hash = '#/dashboard';
    resolve(window.location.hash.replace('#','') || '/dashboard');
    UI.init();
  }
  function go(path){ window.location.hash = '#'+path; }
  return { start, go, resolve };
})();

window.addEventListener('load', ()=>{ import('./ui.js').then(()=>{ Router.start(); }); });
