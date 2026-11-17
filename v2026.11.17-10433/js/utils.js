const {useState,useEffect,useMemo,useCallback}=React;

/* ===== utilidades ===== */
const norm=s=>s.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
const capList=a=>a.map((g,i)=>i?g:cap(g)).join(', ');
const money=c=>(c/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const cents=s=>Math.round(parseFloat(s.replace(/[^\d,]/g,'').replace(',','.'))*100);
async function sha(s){
  try{const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
  catch(e){return 'x'+btoa(unescape(encodeURIComponent(s)))}
}
function useStored(k,d){
  const [v,setV]=useState(()=>{try{const x=localStorage.getItem(k);return x?JSON.parse(x):d}catch(e){return d}});
  useEffect(()=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}},[k,v]);
  return [v,setV];
}
function useRecipes(){
  const [d,setD]=useState({list:[],status:'loading'});
  useEffect(()=>{
    let off=false;
    fetch(RECIPES_URL,{cache:'no-cache'}).then(r=>{if(!r.ok)throw new Error(r.status);return r.json()})
    .then(j=>{const list=(Array.isArray(j)?j:j.receitas||[]).filter(r=>r&&r.n&&Array.isArray(r.i)&&Array.isArray(r.s));if(!off)setD({list,status:'ok'})})
    .catch(()=>{if(!off)setD({list:[],status:'error'})});
    return()=>{off=true};
  },[]);
  return d;
}
function matchRecipe(r,ing,pantry){
  const have=ing.map(norm);
  const need=r.i.filter(x=>!(pantry&&PANTRY.includes(norm(x))));
  const got=need.filter(x=>have.includes(norm(x)));
  return {got,miss:need.filter(x=>!got.includes(x)),total:need.length||1};
}
