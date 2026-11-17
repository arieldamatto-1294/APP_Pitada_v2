function App(){
  const [view,setView]=useState('home');
  const [ing,setIng]=useStored('ing',['tomate','ovos','espinafre','cebola','alho']);
  const [pantry,setPantry]=useState(true);
  const [user,setUser]=useStored('user',null);
  const [favs,setFavs]=useStored('favs2',[]);
  const [aiList,setAiList]=useState([]);
  const {list:recipes,status}=useRecipes();
  const [accounts,setAccounts]=useStored('accounts',[]);
  const [cart,setCart]=useStored('cart',[]);
  const [cartOpen,setCartOpen]=useState(false);
  const [login,setLogin]=useState(false);
  const [open,setOpen]=useState(null);
  const [toast,setToast]=useState('');
  const say=useCallback(m=>{setToast(m);setTimeout(()=>setToast(''),2200)},[]);
  useEffect(()=>{window.scrollTo(0,0)},[view]);
  const toggleFav=r=>{
    if(!user){setLogin(true);return}
    const on=favs.some(f=>f.id===r.id);
    setFavs(on?favs.filter(f=>f.id!==r.id):[...favs,r]);say(on?'Receita removida':'Receita salva');
  };
  const addCart=p=>{
    setCart(c=>c.some(x=>x.n===p[0])?c.map(x=>x.n===p[0]?{...x,q:x.q+1}:x):[...c,{n:p[0],e:p[1],p:cents(p[2]),q:1}]);
    say('Produto adicionado ao carrinho');
  };
  const setQty=(n,d)=>setCart(c=>c.map(x=>x.n===n?{...x,q:x.q+d}:x).filter(x=>x.q>0));
  const removeItem=n=>setCart(c=>c.filter(x=>x.n!==n));
  const checkout=()=>{
    setCartOpen(false);
    if(!user){setLogin(true);return}
    setCart([]);say('Pedido realizado! Obrigado pela compra');
  };
  const cartCount=cart.reduce((s,x)=>s+x.q,0);
  return <>
    <Header {...{view,setView,user,cartCount}} onCart={()=>setCartOpen(true)} onLogin={()=>setLogin(true)} onLogout={()=>{setUser(null);setView('home')}}/>
    <main className="wrap">
      {view==='home'&&<Home {...{ing,setIng,pantry,setPantry,favs,toggleFav,aiList,setAiList,recipes,status}} onOpen={setOpen}/>}
      {view==='favs'&&<Favs {...{favs,ing,pantry,toggleFav}} onOpen={setOpen}/>}
      {view==='sobre'&&<Sobre go={()=>setView('home')}/>}
      {view==='loja'&&<Loja buy={addCart}/>}
    </main>
    {cartOpen&&<Cart {...{cart,setQty,user}} remove={removeItem} onCheckout={checkout} onClose={()=>setCartOpen(false)} go={()=>{setCartOpen(false);setView('loja')}}/>}
    {login&&<Login {...{accounts,setAccounts}} onClose={()=>setLogin(false)} onDone={u=>{setUser(u);setLogin(false);say('Bem-vindo(a), '+u.name.split(' ')[0])}}/>}
    {open&&<Modal onClose={()=>setOpen(null)}><h2>{open.n}</h2><p className="sub">{open.t} min · {open.m}{open.v?' · Vegetariana':''}{open.ai?' · Criada por IA':''}</p>
      <h3>Ingredientes</h3>{open.l&&open.l.length?<ul className="il">{open.l.map((x,k)=><li key={k}>{x}</li>)}</ul>:<p>{capList(open.i)}</p>}<h3>Modo de preparo</h3><ol>{open.s.map((s,i)=><li key={i}>{s}</li>)}</ol>
      <div className="row"><button className="ghost" onClick={()=>setOpen(null)}>Fechar</button></div></Modal>}
    {toast&&<div className="toast" role="status">{toast}</div>}
  </>;
}
ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
