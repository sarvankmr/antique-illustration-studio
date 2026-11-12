import type { Plate } from "./catalog";
const DB = "atlas-engraving-v1"; const STORE = "plates";
function open(): Promise<IDBDatabase> {
 return new Promise((resolve, reject) => {
  const req = indexedDB.open(DB,1);
  req.onupgradeneeded = () => { if(!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE,{keyPath:"id"}); };
  req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error);
 });
}
export async function getPlates(): Promise<Plate[]> {
 const db=await open(); return new Promise((resolve,reject)=>{
  const tx=db.transaction(STORE,"readonly"), req=tx.objectStore(STORE).getAll();
  req.onsuccess=()=>resolve((req.result as Plate[]).sort((a,b)=>b.createdAt-a.createdAt));
  req.onerror=()=>reject(req.error); tx.oncomplete=()=>db.close();
 });
}
export async function savePlate(plate: Plate): Promise<void> {
 const db=await open(); return new Promise((resolve,reject)=>{
  const tx=db.transaction(STORE,"readwrite");tx.objectStore(STORE).put(plate);
  tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>reject(tx.error);
 });
}
export async function deletePlate(id:string): Promise<void> {
 const db=await open();return new Promise((resolve,reject)=>{
  const tx=db.transaction(STORE,"readwrite");tx.objectStore(STORE).delete(id);
  tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>reject(tx.error);
 });
}
