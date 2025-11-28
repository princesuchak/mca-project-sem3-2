/*
fileStore.js
Stores file data (dataURL) in IndexedDB under 'files' store.
Provides putFile/getFile/deleteFile helpers.
*/
const DBNAME = 'chronocanvas_files_db';
const DBVER = 1;
function openDB(){
  return new Promise((res, rej) => {
    const rq = indexedDB.open(DBNAME, DBVER);
    rq.onupgradeneeded = (e) => {
      const db = e.target.result;
      if(!db.objectStoreNames.contains('files')) db.createObjectStore('files', {keyPath: 'id'});
    };
    rq.onsuccess = () => res(rq.result);
    rq.onerror = (e) => rej(e);
  });
}
export async function putFile(dataURL, meta){
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction('files', 'readwrite');
    const store = tx.objectStore('files');
    const id = 'f_' + Date.now() + '_' + Math.random().toString(36).slice(2);
    const rec = { id, data: dataURL, meta: meta || {} };
    const rq = store.add(rec);
    rq.onsuccess = () => res(id);
    rq.onerror = (e) => rej(e);
  });
}
export async function getFile(id){
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction('files','readonly');
    const store = tx.objectStore('files');
    const rq = store.get(id);
    rq.onsuccess = () => res(rq.result ? rq.result.data : null);
    rq.onerror = (e) => rej(e);
  });
}
export async function deleteFile(id){
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction('files','readwrite');
    const store = tx.objectStore('files');
    const rq = store.delete(id);
    rq.onsuccess = () => res(true);
    rq.onerror = (e) => rej(e);
  });
}
