/* ===== IA: serviço isolado (troque por seu backend em produção) ===== */
async function generateRecipesAI({ing,pantry,fil}){
  const sample=window.claude?.use?await window.claude.use('sample'):null;
  if(!sample)throw {code:'unavailable'};
  const prompt=`Você é um chef de cozinha brasileiro. Ingredientes disponíveis: ${ing.join(', ')}.${pantry?' O usuário também tem azeite, sal e pimenta.':''}${fil.v?' As receitas devem ser vegetarianas.':''}${fil.t?' Cada receita deve levar no máximo 30 minutos.':''}
Crie 3 receitas diferentes em português do Brasil, usando principalmente esses ingredientes (no máximo 2 ingredientes extras por receita).
Responda SOMENTE com um array JSON, sem texto extra, em que cada item é {"n":"nome","e":"um emoji","t":minutos como número,"m":"Brunch|Almoço|Jantar|Refeição rápida","v":true ou false (vegetariana),"i":["ingredientes em minúsculas, sem quantidades"],"l":["cada ingrediente com a quantidade exata, na ordem de uso, ex.: 2 xícaras de arroz"],"s":["passos curtos, com quantidades"]}.`;
  const out=await sample.json(prompt,{modelTier:'quick',cache:false});
  const arr=(Array.isArray(out)?out:out?.receitas||[]).filter(r=>r&&r.n&&Array.isArray(r.i)&&Array.isArray(r.s));
  if(!arr.length)throw {code:'invalid'};
  return arr.map((r,k)=>({id:'ai-'+Date.now()+'-'+k,n:r.n,e:r.e||'🍽️',c:COLORS[k%COLORS.length],t:+r.t||30,m:r.m||'Refeição',v:r.v?1:0,i:r.i.map(String),s:r.s.map(String),l:Array.isArray(r.l)?r.l.map(String):[],ai:true}));
}
