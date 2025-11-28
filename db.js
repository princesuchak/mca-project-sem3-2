/*
db.js - metadata stored in localStorage, images in IndexedDB via fileStore.js
Provides a simple API for users, items, pending
*/
export const DB = (function(){
  const KEYS = { USERS: 'cc_users_v3', ITEMS: 'cc_items_v3', PENDING: 'cc_pending_v3', SESSION:'cc_session_v3' };
  function load(k){ try{ return JSON.parse(localStorage.getItem(k) || 'null'); }catch(e){ return null; } }
  function save(k,val){ localStorage.setItem(k, JSON.stringify(val)); }
  (function init(){
    if(!load(KEYS.USERS)){
      const u = { admin:{pass:btoa('admin'), role:'admin', display:'Administrator'} };
      save(KEYS.USERS, u);
    }
    if(!load(KEYS.ITEMS)) save(KEYS.ITEMS, []);
    if(!load(KEYS.PENDING)) save(KEYS.PENDING, []);
  })();
  return {
    users(){ return load(KEYS.USERS) || {}; },
    saveUsers(u){ save(KEYS.USERS, u); },
    items(){ return load(KEYS.ITEMS) || []; },
    saveItems(it){ save(KEYS.ITEMS, it); },
    pending(){ return load(KEYS.PENDING) || []; },
    savePending(p){ save(KEYS.PENDING, p); },
    sessionUser(){ return localStorage.getItem(KEYS.SESSION) || null; },
    setSession(u){ if(u) localStorage.setItem(KEYS.SESSION,u); else localStorage.removeItem(KEYS.SESSION); },
    exportAll(){ return { users:this.users(), items:this.items(), pending:this.pending() }; },
    importAll(payload){ if(payload.users) save(KEYS.USERS,payload.users); if(payload.items) save(KEYS.ITEMS,payload.items); if(payload.pending) save(KEYS.PENDING,payload.pending); }
  };
})();
