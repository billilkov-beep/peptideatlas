import {useEffect,useState} from 'react';
import {api,send,setCsrf,ApiError} from './api';
import {Brand,Icon} from './icons';
import {PublicLibrary} from './PublicLibrary';
import {Dashboard,ContentList,AuditPage,MigrationPage} from './Workspace';
import {Editor} from './Editor';
import {Nodes} from './Nodes';
import {Staff} from './Staff';
import {Coverage} from './Coverage';
import {ErrorBox,Loading,type Notify} from './common';
import type {User} from './types';

export function App(){
  const [path,setPath]=useState(location.pathname);
  const [user,setUser]=useState<User|null>(null);
  const [authLoading,setAuthLoading]=useState(true);
  const [toast,setToast]=useState<{text:string;tone:string}|null>(null);
  const [mobileNav,setMobileNav]=useState(false);
  const go=(next:string)=>{history.pushState({},'',next);setPath(next.split('?')[0]);setMobileNav(false);window.scrollTo(0,0)};
  useEffect(()=>{const pop=()=>setPath(location.pathname);window.addEventListener('popstate',pop);api('/api/auth/me').then(r=>{setUser(r.user);setCsrf(r.csrfToken)}).catch(()=>{}).finally(()=>setAuthLoading(false));return()=>window.removeEventListener('popstate',pop)},[]);
  useEffect(()=>{if(!toast)return;const timer=setTimeout(()=>setToast(null),5500);return()=>clearTimeout(timer)},[toast]);
  const notify:Notify=(text,tone='success')=>setToast({text,tone});
  const isAdmin=path.startsWith('/admin');
  const adminRole=user?.role==='admin';
  const section=path.split('/')[2]||'overview';
  const navigation=[{id:'overview',name:'Overview',icon:'grid',path:'/admin'},{id:'content',name:'Knowledge library',icon:'book',path:'/admin/content'},{id:'coverage',name:'Collection coverage',icon:'check',path:'/admin/coverage',admin:true},{id:'nodes',name:'Connections',icon:'nodes',path:'/admin/nodes',admin:true},{id:'people',name:'People',icon:'user',path:'/admin/people',admin:true},{id:'migration',name:'Export & migration',icon:'folder',path:'/admin/migration',admin:true},{id:'audit',name:'Activity',icon:'history',path:'/admin/audit',admin:true}];
  async function logout(){try{await send('/api/auth/logout',{})}catch(e){if(!(e instanceof ApiError&&e.status===401)){notify((e as Error).message,'error');return}}setUser(null);setCsrf('');go('/admin')}
  let page;
  if(!isAdmin)page=<PublicLibrary go={go} listView={path==='/library'}/>;
  else if(authLoading)page=<div className="auth-loading"><Loading label="Opening your workspace…"/></div>;
  else if(!user)page=<Login onSuccess={u=>{setUser(u);go('/admin')}} go={go}/>;
  else page=<div className="workspace"><aside className={'workspace-sidebar '+(mobileNav?'mobile-open':'')}><a className="workspace-brand" href="/admin" onClick={e=>{e.preventDefault();go('/admin')}}><Brand/></a><div className="workspace-tag"><span className="live-dot"/>KNOWLEDGE WORKSPACE</div><nav aria-label="Workspace navigation">{navigation.filter(n=>!n.admin||adminRole).map(n=><a key={n.id} className={section===n.id?'active':''} href={n.path} onClick={e=>{e.preventDefault();go(n.path)}}><Icon name={n.icon} size={19}/>{n.name}{section===n.id&&<span className="nav-active-dot"/>}</a>)}</nav><div className="sidebar-bottom"><div className="workspace-tip"><Icon name="link" size={21}/><strong>Built to connect.</strong><p>Your central library powers every connected website.</p></div><a href="/" onClick={e=>{e.preventDefault();go('/')}}><Icon name="external" size={17}/>Open public explorer</a><div className="user-card"><span className="avatar">{(user.name||user.email).slice(0,1).toUpperCase()}</span><span><strong>{user.name||user.email}</strong><small>{user.role==='admin'?'Administrator':'Editor'}</small></span><button className="icon-button" onClick={logout} aria-label="Sign out"><Icon name="logout" size={17}/></button></div></div></aside><div className="workspace-main"><header className="workspace-topbar"><button className="icon-button mobile-menu" aria-label="Toggle navigation" onClick={()=>setMobileNav(!mobileNav)}><Icon name="menu"/></button><div><span>Workspace</span><Icon name="chevron" size={12}/><strong>{navigation.find(n=>n.id===section)?.name||'Overview'}</strong></div><a href="/" onClick={e=>{e.preventDefault();go('/')}}><span className="live-dot"/>Open explorer<Icon name="external" size={14}/></a></header><main className="workspace-content">{section==='content'&&path.split('/')[3]?<Editor key={path.split('/')[3]} id={path.split('/')[3]} go={go} notify={notify} user={user}/>:section==='content'?<ContentList go={go}/>:section==='coverage'&&adminRole?<Coverage/>:section==='nodes'&&adminRole?<Nodes notify={notify}/>:section==='people'&&adminRole?<Staff user={user} notify={notify}/>:section==='migration'&&adminRole?<MigrationPage notify={notify}/>:section==='audit'&&adminRole?<AuditPage/>:<Dashboard go={go} user={user}/>}</main><footer className="workspace-footer"><span>Peptide Atlas</span><span>One library. Every connection.</span><span>v1.2</span></footer></div></div>;
  return <>{page}{toast&&<div className={'toast toast-'+toast.tone} role="status"><Icon name={toast.tone==='success'?'check':'info'} size={18}/>{toast.text}<button className="icon-button" aria-label="Dismiss notification" onClick={()=>setToast(null)}><Icon name="close" size={14}/></button></div>}</>
}

function Login({onSuccess,go}:{onSuccess:(user:User)=>void;go:(path:string)=>void}){
 const [email,setEmail]=useState('');const [password,setPassword]=useState('');const [error,setError]=useState('');const [busy,setBusy]=useState(false);
 async function submit(event:React.FormEvent){event.preventDefault();setBusy(true);setError('');try{const result=await send('/api/auth/login',{email,password});setCsrf(result.csrfToken);onSuccess(result.user)}catch(e){setError((e as Error).message)}finally{setBusy(false)}}
 return <main className="login-page"><a className="login-home" href="/" onClick={e=>{e.preventDefault();go('/')}}><Brand/></a><section className="login-story"><div className="login-orbits"><i/><i/><i/><i/><span>pA</span></div><div className="eyebrow">YOUR CENTRAL KNOWLEDGE WORKSPACE</div><h1>Good knowledge.<br/>Shared everywhere.</h1><p>Maintain your peptide library, connect your websites, and keep every experience in step.</p><div className="login-story-bottom"><span>ONE SOURCE</span><span>EVERY CONNECTION</span></div></section><section className="login-form-wrap"><form onSubmit={submit} className="login-form"><span className="login-lock"><Icon name="lock" size={25}/></span><div className="eyebrow">WELCOME BACK</div><h2>Open your workspace</h2><p>Sign in to manage your knowledge library.</p>{error&&<ErrorBox message={error}/>}<label>Email address<input type="email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@yourcompany.com" required/></label><label>Password<input type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password" required/></label><button className="button button-primary" type="submit" disabled={busy}>{busy?'Signing in…':'Sign in'}<Icon name="arrow" size={18}/></button><p className="login-help">Workspace access is managed by your administrator.</p><a href="/" onClick={e=>{e.preventDefault();go('/')}}>Return to the public library <Icon name="external" size={14}/></a></form></section></main>
}
