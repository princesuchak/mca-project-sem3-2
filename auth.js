import { DB } from './db.js';
export const Auth = (function(){
  function login(u,p){
    const users = DB.users();
    if(users[u] && users[u].pass === btoa(p)){ DB.setSession(u); return true; }
    return false;
  }
  function register(u,p,display){
    const users = DB.users();
    if(users[u]) return false;
    users[u] = { pass: btoa(p), role:'user', display: display||u };
    DB.saveUsers(users);
    DB.setSession(u);
    return true;
  }
  function logout(){ DB.setSession(null); }
  function userInfo(){ const u = DB.sessionUser(); if(!u) return null; const all = DB.users(); return all[u] ? { username:u, ...all[u] } : null; }
  return { login, register, logout, userInfo };
})();
