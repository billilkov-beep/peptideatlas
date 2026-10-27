import type {CSSProperties} from 'react';
const paths:Record<string,string>={
  arrow:'M5 12h14m-6-6 6 6-6 6', external:'M7 17 17 7M7 7h10v10', search:'M10.8 18a7.2 7.2 0 1 0 0-14.4 7.2 7.2 0 0 0 0 14.4Zm5.2-2 5 5',
  grid:'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z', list:'M9 6h12M9 12h12M9 18h12M3 6h.1M3 12h.1M3 18h.1', plus:'M12 5v14M5 12h14',close:'m6 6 12 12M18 6 6 18',
  book:'M12 5c-4-3-8-2-9-1v15c3-2 6-2 9 0m0-14c4-3 8-2 9-1v15c-3-2-6-2-9 0V5Z',
  link:'m10 14 4-4m-6 7-1 1a4.2 4.2 0 0 1-6-6l4-4a4.2 4.2 0 0 1 6 0m2-1 1-1a4.2 4.2 0 0 1 6 6l-4 4a4.2 4.2 0 0 1-6 0',
  nodes:'M12 8v5M5 13h14M5 13v4m14-4v4M9 2h6v6H9zM2 17h6v5H2zM16 17h6v5h-6z',
  history:'M3 11a9 9 0 1 1 2 7M3 4v7h7M12 7v5l3 2', download:'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5',upload:'M12 17V5m-5 5 5-5 5 5M4 17v4h16v-4',
  check:'m5 12 4 4L19 6',chevron:'m9 5 7 7-7 7',logout:'M9 4H4v16h5m4-12 4 4-4 4m-5-4h13',
  brain:'M9 3a3 3 0 0 0-5 3 4 4 0 0 0-1 7 4 4 0 0 0 5 6c1 3 4 2 4 0V6c0-2-1-3-3-3Zm6 0a3 3 0 0 1 5 3 4 4 0 0 1 1 7 4 4 0 0 1-5 6c-1 3-4 2-4 0M6 10c3-1 4 1 3 3m9-3c-3-1-4 1-3 3',
  skin:'M3 17c3-4 5 4 9 0s6 4 9 0M3 12c3-4 5 4 9 0s6 4 9 0M3 7c3-4 5 4 9 0s6 4 9 0',
  digestive:'M10 3v6c0 3-3 3-5 6s0 6 4 6h6c4 0 7-3 6-7-1-5-4-8-7-6V3M9 16c4-3 6 2 8-1',
  shield:'m12 3 9 4v6c0 4-5 7-9 9-4-2-9-5-9-9V7l9-4Zm0 4v10m-5-5h10',
  spark:'m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7Z',
  bone:'M6 3a3 3 0 0 0-3 5l2 2 9 9 2 2a3 3 0 0 0 5-3 3 3 0 0 0-3-5l-8-8a3 3 0 0 0-4-2Z',
  heart:'M12 21S2 15 2 8a5 5 0 0 1 10-1A5 5 0 0 1 22 8c0 7-10 13-10 13Z',
  circles:'M10 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm4-11 6-2v6m-4-2 4-4M10 15v7m-3-3h6',
  lock:'M6 10h12v11H6zM8 10V6a4 4 0 0 1 8 0v4M12 14v3', menu:'M4 6h16M4 12h16M4 18h16',
  eye:'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  info:'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0-11v6m0-10h.01',
  refresh:'M20 7a9 9 0 0 0-15-1L2 9m0-6v6h6m-4 8a9 9 0 0 0 15 1l3-3m0 6v-6h-6',
  edit:'m15 4 5 5M4 20l5-1L21 7l-4-4L5 15l-1 5Z', trash:'M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7',
  folder:'M3 6h6l2 3h10v12H3V6Z', sun:'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0-14v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1',
  user:'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 22v-2a8 8 0 0 1 16 0v2'
};
export function Icon({name,size=20,style,className=''}:{name:string;size?:number;style?:CSSProperties;className?:string}){return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={style} className={className}><path d={paths[name]||paths.spark}/></svg>}
export function Brand({small=false}:{small?:boolean}){return <span className={'brand '+(small?'brand-small':'')}><span className="brand-mark"><svg viewBox="0 0 48 48" aria-hidden="true"><ellipse cx="24" cy="24" rx="9" ry="18" transform="rotate(45 24 24)"/><ellipse cx="24" cy="24" rx="9" ry="18" transform="rotate(-45 24 24)"/><circle cx="24" cy="24" r="2.5"/></svg></span><span>Peptide<span className="brand-light">Atlas</span><small>CONNECTED KNOWLEDGE</small></span></span>}
