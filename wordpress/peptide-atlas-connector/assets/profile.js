(() => {
  document.documentElement.classList.add('enhanced');
  const root=document.querySelector('.pa-profile')||document;
  const panels={guide:document.getElementById('guide-panel'),sources:document.getElementById('sources-panel')};
  if(!panels.guide||!panels.sources)return;
  function activate(name){for(const key of Object.keys(panels)){panels[key].hidden=key!==name;const tab=root.querySelector('[data-tab="'+key+'"]');tab.setAttribute('aria-selected',String(key===name));tab.tabIndex=key===name?0:-1;}}
  root.querySelectorAll('[data-tab]').forEach(button=>{button.addEventListener('click',()=>activate(button.dataset.tab));button.addEventListener('keydown',event=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();const next=event.key==='Home'?'guide':event.key==='End'?'sources':button.dataset.tab==='guide'?'sources':'guide';activate(next);root.querySelector('[data-tab="'+next+'"]').focus();}});});
  function revealHash(){const hash=location.hash.slice(1);if(!hash)return;activate(hash==='sources'||hash.startsWith('ref-')?'sources':'guide');document.getElementById(hash)?.scrollIntoView({block:'start'});}
  root.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener('click',event=>{const hash=link.getAttribute('href').slice(1);activate(hash==='sources'||hash.startsWith('ref-')?'sources':'guide');if(location.hash==='#'+hash){event.preventDefault();document.getElementById(hash)?.scrollIntoView({block:'start'});}}));
  window.addEventListener('hashchange',revealHash);activate(location.hash.startsWith('#ref-')||location.hash==='#sources'?'sources':'guide');if(location.hash)revealHash();
  document.querySelector('[data-copy-link]')?.addEventListener('click',async()=>{const status=document.querySelector('.copy-status');try{await navigator.clipboard.writeText(document.querySelector('link[rel="canonical"]').href);status.textContent='Profile link copied.';}catch{status.textContent='Copy the address from your browser to share this profile.';}setTimeout(()=>status.textContent='',4000);});
  document.querySelector('[data-print]')?.addEventListener('click',()=>{for(const panel of Object.values(panels))panel.hidden=false;window.print();activate('guide');});
})();
