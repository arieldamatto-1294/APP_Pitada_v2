/* ===== componentes ===== */
function Header({view,setView,user,onLogin,onLogout,cartCount,onCart}){
  const items=[['home','Descobrir receitas'],['sobre','Sobre'],['loja','Loja']];
  return <header><div className="wrap bar">
    <button className="logo" onClick={()=>setView('home')} aria-label="Pitada – início"><i>✿</i>pitada</button>
    <nav aria-label="Principal">{items.map(([k,l])=><button key={k} aria-current={view===k?'page':undefined} onClick={()=>setView(k)}>{l}</button>)}</nav>
    <div className="right">
      <button className="ghost cart" onClick={onCart} aria-label={'Carrinho, '+cartCount+(cartCount===1?' item':' itens')}>🛒{cartCount>0&&<span className="cnt">{cartCount}</span>}</button>
      {user?<>
      <button className="ghost" onClick={()=>setView('favs')}>★ Minhas receitas</button>
      <span className="av">{user.name.slice(0,2).toUpperCase()}</span><span>Olá, {user.name.split(' ')[0]}</span>
      <button className="ghost" onClick={onLogout}>Sair</button></>:<button className="ghost" onClick={onLogin}>Entrar</button>}</div>
  </div></header>;
}

function Pantry({ing,setIng,pantry,setPantry}){
  const [txt,setTxt]=useState('');
  const add=v=>{v=v.trim().toLowerCase();if(v&&!ing.map(norm).includes(norm(v)))setIng([...ing,v]);setTxt('')};
  const sug=COMMON.filter(c=>!ing.map(norm).includes(norm(c)));
  return <aside className="panel"><h2>O que você tem?</h2>
    <p className="sub">Adicione os ingredientes da sua geladeira ou despensa.</p>
    <div className="add"><input value={txt} onChange={e=>setTxt(e.target.value)} onKeyDown={e=>e.key==='Enter'&&add(txt)} placeholder="Ex.: abobrinha, arroz..." aria-label="Novo ingrediente"/><button onClick={()=>add(txt)} aria-label="Adicionar">+</button></div>
    <div className="lbl"><span>SEUS INGREDIENTES · {ing.length}</span><button onClick={()=>setIng([])}>Limpar</button></div>
    {ing.map((g,i)=><button key={g} className="ing" onClick={()=>setIng(ing.filter((_,j)=>j!==i))} aria-label={'Remover '+g}><span>✓ {cap(g)}</span><span>×</span></button>)}
    {sug.length>0&&<><p className="sub" style={{margin:'14px 0 8px'}}>Mais algum desses por aí?</p><div className="chips">{sug.map(c=><button key={c} className="chip" onClick={()=>add(c)}>+ {c}</button>)}</div></>}
    <label className="chk"><input type="checkbox" checked={pantry} onChange={e=>setPantry(e.target.checked)}/> Já tenho azeite, sal e pimenta</label>
  </aside>;
}

function RecipeCard({r,m,fav,onFav,onOpen}){
  const ok=!m.miss.length;
  return <article className="rc"><div className="ph" style={{background:r.c}} aria-hidden="true">{r.e}
    {r.ai&&<span className="badge">✨ Criada por IA</span>}
    <button className="fav" onClick={()=>onFav(r)} aria-pressed={fav} aria-label={fav?'Remover dos favoritos':'Salvar nos favoritos'}>{fav?'★':'☆'}</button></div>
    <div className="rb"><small>{r.m}</small><h3>{r.n}</h3><small>⏱ {r.t} min</small>
      <span className="pill">{ok?'✓ Você tem tudo!':`${m.got.length} de ${m.total} ingredientes`}</span>
      <span className="have">Você tem: {m.got.length?capList(m.got):'—'}</span>
      <span className="miss">{ok?<span style={{color:'var(--mut)'}}>Nenhum ingrediente faltando</span>:'Faltam: '+capList(m.miss)}</span>
      <button className="more" onClick={()=>onOpen(r)}>Ver receita ↗</button></div></article>;
}

function Home({ing,setIng,pantry,setPantry,favs,toggleFav,onOpen,aiList,setAiList,recipes,status}){
  const [fil,setFil]=useState({t:false,v:false,only:false,meal:''});
  const [sort,setSort]=useState('best');
  const [busy,setBusy]=useState(false);
  const [err,setErr]=useState('');
  const flip=k=>setFil(f=>({...f,[k]:!f[k]}));
  const rows=useMemo(()=>{
    let l=[...aiList,...recipes].map(r=>({r,m:matchRecipe(r,ing,pantry)})).filter(x=>x.m.got.length>0);
    if(fil.t)l=l.filter(x=>x.r.t<=30);
    if(fil.v)l=l.filter(x=>x.r.v);
    if(fil.only)l=l.filter(x=>!x.m.miss.length);
    if(fil.meal)l=l.filter(x=>x.r.m===fil.meal);
    const ratio=x=>x.m.got.length/x.m.total;
    return l.sort(sort==='time'?(a,b)=>a.r.t-b.r.t:(a,b)=>ratio(b)-ratio(a)||a.r.t-b.r.t);
  },[ing,pantry,fil,sort,aiList,recipes]);
  const ready=rows.filter(x=>!x.m.miss.length).length;
  const meals=[...new Set(recipes.map(r=>r.m))];
  async function gen(){
    if(!ing.length){setErr('Adicione ao menos um ingrediente.');return}
    setBusy(true);setErr('');
    try{setAiList([...(await generateRecipesAI({ing,pantry,fil})),...aiList.slice(0,6)])}
    catch(e){setErr(e.code==='not_granted'?'Permissão negada para usar a IA.':e.code==='rate_limited'?'Muitas solicitações. Tente de novo em instantes.':e.code==='unavailable'?'A geração por IA não está disponível aqui.':'Não foi possível gerar receitas agora. Tente novamente.')}
    setBusy(false);
  }
  return <>
    <section className="hero"><div><div className="eyebrow">✿ Boa comida começa com o que você tem</div><h1>Sua geladeira tem mais possibilidades.</h1><p>Conte o que tem em casa. A gente encontra uma receita para transformar seus ingredientes em uma boa refeição.</p></div>
    <div className="heroimg" role="img" aria-label="Ingredientes frescos sobre a bancada"><span className="tag">Simples, fresco e cheio de sabor.</span></div></section>
    <div className="layout"><Pantry {...{ing,setIng,pantry,setPantry}}/>
    <section>
      <div className="head"><div><h2>Da sua geladeira para a mesa</h2><p className="sub" style={{margin:'6px 0 0'}}>{rows.length} receita{rows.length===1?'':'s'} encontrada{rows.length===1?'':'s'} com seus ingredientes</p></div>
      <select value={sort} onChange={e=>setSort(e.target.value)} aria-label="Ordenar"><option value="best">Melhor combinação</option><option value="time">Mais rápidas</option></select></div>
      <div className="filters">
        <button className="f" aria-pressed={fil.t} onClick={()=>flip('t')}>Até 30 min</button>
        <button className="f" aria-pressed={fil.v} onClick={()=>flip('v')}>Vegetariana</button>
        <button className="f" aria-pressed={fil.only} onClick={()=>flip('only')}>Só com o que tenho</button>
        <select className="f" value={fil.meal} onChange={e=>setFil({...fil,meal:e.target.value})} aria-label="Refeição"><option value="">Refeição</option>{meals.map(m=><option key={m}>{m}</option>)}</select>
        <button style={{background:'none',border:0,color:'var(--g)',fontSize:12}} onClick={()=>setFil({t:false,v:false,only:false,meal:''})}>Limpar filtros</button>
      </div>
      <div className="aibox"><p><b>Quer algo diferente?</b> A IA cria receitas novas com os seus ingredientes e filtros.</p>
        <button className="primary" disabled={busy} onClick={gen}>{busy?'Criando receitas…':'✨ Gerar com IA'}</button></div>
      {err&&<p className="err" role="alert">{err}</p>}
      {status==='error'&&<p className="err" role="alert">Não foi possível carregar o arquivo receitas.json. Ele precisa estar na mesma pasta do HTML e a página deve ser aberta por um servidor local (não por file://).</p>}
      {ready>0&&<p className="note">✓ {ready} receita{ready>1?'s':''} pronta{ready>1?'s':''} para fazer, sem precisar ir ao mercado.</p>}
      {rows.length?<div className="grid">{rows.map(({r,m})=><RecipeCard key={r.id} r={r} m={m} fav={favs.some(f=>f.id===r.id)} onFav={toggleFav} onOpen={onOpen}/>)}</div>
      :status==='loading'?<p className="empty">Carregando receitas…</p>:<p className="empty">Nenhuma receita com esses ingredientes e filtros. Adicione ingredientes, limpe os filtros ou gere receitas com IA.</p>}
    </section></div></>;
}

function Favs({favs,ing,pantry,toggleFav,onOpen}){
  return <div style={{padding:'32px 0 60px'}}><h2 style={{fontSize:30,marginBottom:6}}>Minhas receitas</h2><p className="sub">As receitas que você salvou.</p>
    {favs.length?<div className="grid">{favs.map(r=><RecipeCard key={r.id} r={r} m={matchRecipe(r,ing,pantry)} fav onFav={toggleFav} onOpen={onOpen}/>)}</div>
    :<p className="empty">Você ainda não salvou receitas. Toque na estrela de uma receita para guardá-la aqui.</p>}</div>;
}
const Sobre=({go})=><div className="page"><div className="eyebrow">✿ Sobre a Pitada</div><h1>Menos desperdício, mais sabor.</h1><p>A Pitada nasceu de uma pergunta simples: o que dá para cozinhar com o que já tenho em casa? Você lista os ingredientes e o site sugere receitas, mostrando o que você já tem e o que falta em cada uma.</p><p>Quando o catálogo não basta, a IA cria receitas novas na hora. Crie uma conta para salvar suas favoritas e visite a Loja para escolher utensílios.</p><button className="primary" style={{marginTop:20}} onClick={go}>Descobrir receitas</button></div>;
const Loja=({buy})=><div className="page" style={{maxWidth:'none'}}><div className="eyebrow">✿ Loja</div><h1>Para cozinhar com precisão.</h1><p>Medidores, utensílios de silicone e potes herméticos para a rotina da cozinha.</p>
  <div className="grid" style={{marginTop:24}}>{SHOP.map(p=><div className="pr" key={p[0]}><div className="ph" aria-hidden="true">{p[1]}</div><b>{p[0]}</b><div className="price"><span>{p[2]}</span><button className="ghost" onClick={()=>buy(p)}>Adicionar</button></div></div>)}</div></div>;

function Modal({children,onClose}){
  useEffect(()=>{const k=e=>e.key==='Escape'&&onClose();document.addEventListener('keydown',k);return()=>document.removeEventListener('keydown',k)},[onClose]);
  return <div className="ov" onClick={onClose}><div className="modal" role="dialog" aria-modal="true" onClick={e=>e.stopPropagation()}>{children}</div></div>;
}
function Login({accounts,setAccounts,onDone,onClose}){
  const [mode,setMode]=useState('in'),[n,setN]=useState(''),[em,setEm]=useState(''),[pw,setPw]=useState(''),[err,setErr]=useState(''),[busy,setBusy]=useState(false);
  const up=mode==='up';
  async function submit(){
    const e=em.trim().toLowerCase();
    if(up&&!n.trim())return setErr('Informe seu nome.');
    if(!/^\S+@\S+\.\S+$/.test(e))return setErr('Informe um e-mail válido.');
    if(pw.length<6)return setErr('A senha deve ter ao menos 6 caracteres.');
    setBusy(true);const hash=await sha(e+':'+pw);setBusy(false);
    const acc=accounts.find(a=>a.email===e);
    if(up){
      if(acc)return setErr('Já existe uma conta com este e-mail. Use "Entrar".');
      setAccounts([...accounts,{name:n.trim(),email:e,hash}]);onDone({name:n.trim(),email:e});
    }else{
      if(!acc||acc.hash!==hash)return setErr('E-mail ou senha incorretos.');
      onDone({name:acc.name,email:acc.email});
    }
  }
  const sw=()=>{setMode(up?'in':'up');setErr('')};
  return <Modal onClose={onClose}><h2>{up?'Criar conta':'Entrar na Pitada'}</h2><p className="sub">{up?'Crie sua conta para salvar receitas e finalizar compras.':'Entre para salvar suas receitas favoritas e finalizar compras.'}</p>
    {up&&<><label htmlFor="nm">Nome</label><input id="nm" value={n} onChange={e=>setN(e.target.value)} autoComplete="name"/></>}
    <label htmlFor="em">E-mail</label><input id="em" type="email" value={em} onChange={e=>setEm(e.target.value)} autoComplete="email"/>
    <label htmlFor="pw">Senha</label><input id="pw" type="password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submit()} autoComplete={up?'new-password':'current-password'}/>
    {err&&<p className="fe" role="alert">{err}</p>}
    <div className="row"><button className="primary" disabled={busy} onClick={submit}>{up?'Criar conta':'Entrar'}</button><button className="ghost" onClick={onClose}>Cancelar</button></div>
    <button className="sw" onClick={sw}>{up?'Já tenho conta · Entrar':'Não tenho conta · Criar conta'}</button></Modal>;
}

function Cart({cart,setQty,remove,user,onCheckout,onClose,go}){
  const total=cart.reduce((s,x)=>s+x.p*x.q,0);
  return <Modal onClose={onClose}><h2>Seu carrinho</h2>
    {cart.length?<>
      {cart.map(x=><div className="ci" key={x.n}><span className="em" aria-hidden="true">{x.e}</span><div><b>{x.n}</b><small>{money(x.p)}</small></div>
        <div className="qty"><button onClick={()=>setQty(x.n,-1)} aria-label={'Diminuir '+x.n}>−</button><span>{x.q}</span><button onClick={()=>setQty(x.n,1)} aria-label={'Aumentar '+x.n}>+</button></div>
        <button className="x" onClick={()=>remove(x.n)} aria-label={'Remover '+x.n}>×</button></div>)}
      <div className="tot"><span>Total</span><b>{money(total)}</b></div>
      {!user&&<p className="sub" style={{marginBottom:0}}>Entre na sua conta para finalizar a compra.</p>}
      <div className="row"><button className="primary" onClick={onCheckout}>{user?'Finalizar compra':'Entrar para finalizar'}</button><button className="ghost" onClick={onClose}>Continuar comprando</button></div></>
    :<><p className="empty" style={{padding:'16px 0'}}>Seu carrinho está vazio.</p><div className="row" style={{marginTop:0}}><button className="primary" onClick={go}>Ir para a Loja</button><button className="ghost" onClick={onClose}>Fechar</button></div></>}
  </Modal>;
}
