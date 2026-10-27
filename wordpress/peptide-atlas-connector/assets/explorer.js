(function () {
  'use strict';
  const categories = {
    brain: 'Brain & sleep', skin: 'Skin & aging', digestive: 'Digestive & metabolism',
    immune: 'Immune system', hormones: 'Hormones', musculoskeletal: 'Bones & muscles',
    cardiovascular: 'Heart & circulation', reproductive: 'Reproductive system'
  };
  const categoryMarks = { brain: '◉', skin: '◇', digestive: '∿', immune: '✧', hormones: '⌘', musculoskeletal: '⋈', cardiovascular: '♡', reproductive: '◎' };
  const regulatory = { fda_approved: 'FDA approved', clinical_trial: 'In clinical trials', not_fda_approved: 'Not FDA approved', cosmetic: 'Cosmetic / topical', unreviewed: 'Status needs review' };
  const publicStatus = item => item.displayStatus && item.displayStatus !== 'unreviewed' && Object.prototype.hasOwnProperty.call(regulatory,item.displayStatus) ? item.displayStatus : 'unreviewed';
  const text = (tag, value, className) => { const el = document.createElement(tag); el.textContent = value; if (className) el.className = className; return el; };
  function safeLink(value, fallback) {
    try { const url = new URL(value, location.href); return ['http:', 'https:'].includes(url.protocol) ? url.href : fallback; } catch { return fallback; }
  }

  async function start(root) {
    if (root.dataset.atlasMounted === 'true' || root.classList.contains('pa-unavailable') || root.classList.contains('pa-profile')) return;
    root.dataset.atlasMounted = 'true';
    let catalog;
    try {
      const inline = root.querySelector('.pa-catalog');
      if (inline) catalog = JSON.parse(inline.textContent);
      else if (root.dataset.catalogUrl) {
        const url = new URL(root.dataset.catalogUrl, location.href);
        if (url.origin !== location.origin) throw new Error('The catalogue proxy must use the same origin.');
        const response = await fetch(url, { credentials: 'same-origin', headers: { Accept: 'application/json' } });
        if (!response.ok) throw new Error('The library is temporarily unavailable.');
        catalog = await response.json();
      } else return;
    } catch {
      const result = root.querySelector('.pa-cards');
      if (result) result.replaceChildren(text('p', 'The library is temporarily unavailable. Please check back shortly.', 'pa-empty'));
      return;
    }
    const items = Array.isArray(catalog.items) ? catalog.items : [];
    const cards = root.querySelector('.pa-cards');
    const title = root.querySelector('.pa-results-heading h3');
    const counter = root.querySelector('.pa-count');
    const empty = root.querySelector('.pa-empty');
    const controls = root.querySelector('.pa-categories');
    const search = root.querySelector('.pa-search');
    const body = root.querySelector('.pa-human');
    if (!cards || !controls || !search) return;
    let selected = null;
    let preview = null;
    const filters=text('div','','pa-extra-filters');
    function filterSelect(labelText,values,allLabel){const label=text('label',labelText);const select=document.createElement('select');select.setAttribute('aria-label',labelText);const all=text('option',allLabel||'All '+labelText.toLowerCase());all.value='';select.append(all);Object.entries(values).forEach(([value,title])=>{const option=text('option',title);option.value=value;select.append(option);});label.append(select);filters.append(label);select.addEventListener('change',render);return select;}
    const availableStatuses=Object.fromEntries(Object.entries(regulatory).filter(([key])=>items.some(item=>publicStatus(item)===key)));
    const statusFilter=filterSelect('Approval / trial status',availableStatuses,'All statuses');
    const legend=text('div','','pa-status-legend');legend.setAttribute('aria-label','Filter by FDA and clinical trial status');
    const legendButtons=new Map();
    [['','All statuses'],...Object.entries(availableStatuses)].forEach(([key,label])=>{const button=text('button',label,'pa-status-filter'+(key?' pa-display-'+key:''));button.type='button';button.setAttribute('aria-pressed','false');const count=text('span',String(key?items.filter(item=>publicStatus(item)===key).length:items.length));button.append(count);button.addEventListener('click',()=>{statusFilter.value=statusFilter.value===key?'':key;render()});legend.append(button);legendButtons.set(key,button);});
    legend.append(text('p','FDA status refers to a specified product and use. Clinical trials do not establish approval.','pa-status-scope'));
    const layout=root.querySelector('.pa-layout');if(layout)layout.before(legend);
    const evidenceFilter=filterSelect('Evidence levels',{established:'Established evidence',clinical:'Human clinical research',preclinical:'Preclinical research',limited:'Limited evidence'});
    const searchLabel=search.closest('label');if(searchLabel)searchLabel.after(filters);else search.after(filters);
    const suggestions=document.createElement('datalist');suggestions.id=(root.id||'atlas-'+Math.random().toString(36).slice(2))+'-names';
    [...new Set(items.flatMap(p=>[p.name,...(p.aliases||[]),...(p.referenceNames||[])]))].sort().forEach(name=>{const option=text('option','');option.value=name;suggestions.append(option);});search.setAttribute('list',suggestions.id);filters.append(suggestions);
    let viewer = null;
    const buttons = new Map();

    function render() {
      const query = search.value.trim().toLocaleLowerCase();
      const active=preview??selected;
      const matches = items.filter(item => (!active || (item.categories || []).includes(active)) &&
        (!statusFilter.value||publicStatus(item)===statusFilter.value)&&(!evidenceFilter.value||item.evidenceLevel===evidenceFilter.value)&&
        [item.name || '', item.summary || '', ...(item.aliases || []),...(item.referenceNames||[])].join(' ').toLocaleLowerCase().includes(query));
      if (title) title.textContent = active ? categories[active] : 'All entries';
      if (counter) counter.textContent = String(matches.length);
      if (empty) empty.hidden = matches.length !== 0;
      cards.replaceChildren();
      matches.forEach(item => {
        const status=publicStatus(item);
        const card = text('article', '', 'pa-card pa-display-'+status);
        const metadata = text('div', '', 'pa-card-meta');
        const badge=text('span',regulatory[status],'pa-status-pill');if(item.displayStatusNote)badge.title=item.displayStatusNote;metadata.append(badge);
        const footer=text('div','','pa-card-footer');footer.append(text('span',`${Array.isArray(item.references)?item.references.length:0} sources`),text('span',item.reviewStatus==='reviewed'?'Reviewed':item.reviewStatus==='source_checked'?'Source checked':'Review pending'));
        const heading = text('h4', '');
        const link = text('a', item.name || 'Profile');
        const fallback = '/peptides/' + encodeURIComponent(item.slug || '');
        link.href = safeLink(item.profileUrl || fallback, fallback);
        heading.append(link);
        card.append(metadata, heading, text('p', item.summary || ''), footer);
        cards.append(card);
      });
      buttons.forEach((button, category) => { button.setAttribute('aria-pressed', String(category === selected));button.classList.toggle('is-preview',category===preview&&preview!==null); });
      legendButtons.forEach((button,key)=>button.setAttribute('aria-pressed',String(key===statusFilter.value)));
    }
    function choose(category) { preview=null;selected = categories[category] ? category : null; if (viewer) viewer.setCategory(selected); render(); }
    function addButton(category, label, count) {
      const button = text('button', '', 'pa-category'); button.type = 'button';
      button.append(text('span', category ? categoryMarks[category] : '↗', 'pa-category-mark'), text('span', label, 'pa-category-name'), text('span', String(count), 'pa-category-count'));
      button.setAttribute('aria-pressed', 'false');
      button.addEventListener('click', () => choose(category));
      controls.append(button); buttons.set(category, button);
    }
    controls.replaceChildren();
    addButton(null, 'All body systems', items.length);
    Object.entries(categories).forEach(([id, label]) => {
      const count = items.filter(item => (item.categories || []).includes(id)).length;
      if (count) addButton(id, label, count);
    });
    search.addEventListener('input', render);
    if (body && window.PeptideAtlasViewer && typeof window.PeptideAtlasViewer.mountHumanViewer === 'function') {
      try { viewer = window.PeptideAtlasViewer.mountHumanViewer(body, { onSelect: choose, onHover:category=>{preview=categories[category]?category:null;render()}, selectedCategory: null }); }
      catch { body.replaceChildren(text('p', 'Explore the body systems using the categories.', 'pa-caption')); }
    }
    render();
    window.addEventListener('pagehide', () => { if (viewer) viewer.destroy(); }, { once: true });
  }
  function boot() { document.querySelectorAll('.pa-explorer').forEach(start); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  window.PeptideAtlasExplorer = { mount: start };
}());
