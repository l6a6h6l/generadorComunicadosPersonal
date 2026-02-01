import React, { useState, useEffect, useCallback } from 'react';

const USUARIOS_VALIDOS = [{ usuario: 'luishl', password: 'luistbane' }];

const SERVICIOS_TRANSACCIONALES = [
  { id: 'datafast-visa', nombre: 'DATAFAST VISA', descripcion: 'Transacciones locales Visa (débito/crédito) y MasterCard (crédito) en red propia', emoji: '💳' },
  { id: 'datafast-diners', nombre: 'DATAFAST DINERS', descripcion: 'Transacciones locales Diners (débito/crédito) y Discover (crédito) en red propia', emoji: '💳' },
  { id: 'banred', nombre: 'BANRED', descripcion: 'Transacciones entre bancos asociados BANRED: tarjetas de crédito, cuentas corrientes y ahorro', emoji: '🏦' },
  { id: 'banred-b24', nombre: 'BANRED B-24', descripcion: 'Transacciones tarjetas de débito Banco Pichincha y bancos asociados BANRED', emoji: '🏧' },
  { id: 'banred-b25', nombre: 'BANRED B-25', descripcion: 'Transacciones ATM tarjetas de crédito Banco Pichincha y bancos asociados BANRED', emoji: '🏧' },
  { id: 'nsp-atalla', nombre: 'NSP ATALLA', descripcion: 'Validación de tarjetas propias de débito y crédito BANCO PICHINCHA', emoji: '🔐' },
  { id: 'banco-pichincha', nombre: 'BANCO PICHINCHA', descripcion: 'Avances de efectivo por ventanilla Banco Pichincha', emoji: '💵' },
  { id: 'bpc-bp', nombre: 'BPC-BP', descripcion: 'Transacciones tarjeta prepago de transporte Banco Pichincha', emoji: '🚌' },
  { id: 'broker', nombre: 'BRÓKER', descripcion: 'Avances de efectivo en cajeros ATM sin tarjeta de crédito', emoji: '🤝' },
  { id: 'jardin-azuayo', nombre: 'JARDIN AZUAYO', descripcion: 'Transacciones débito Visa de Cooperativa Jardín Azuayo', emoji: '🌱' },
  { id: 'dci', nombre: 'DCI', descripcion: 'Transacciones crédito Diners/Discover: tarjetas propias en red ajena y ajenas en red propia', emoji: '🌍' },
  { id: 'dci-2', nombre: 'DCI 2', descripcion: 'Transacciones crédito Diners/Discover: tarjetas propias en red ajena y ajenas en red propia', emoji: '🌎' },
  { id: 'discover-fs', nombre: 'DISCOVER FS', descripcion: 'Transacciones tarjetas ajenas Diners y Discover en cajeros autorizados', emoji: '💎' },
  { id: 'llaves-dci', nombre: 'LLAVES DCI', descripcion: 'Intercambio de llaves con franquicias DCI/Discover', emoji: '🔑' },
  { id: 'visa-emision', nombre: 'VISA EMISION', descripcion: 'Transacciones débito/crédito tarjetas propias en red ajena', emoji: '✈️' },
  { id: 'visa-adquirencia', nombre: 'VISA ADQUIRENCIA', descripcion: 'Transacciones crédito tarjetas ajenas en red propia', emoji: '🛬' },
  { id: 'mastercard-int', nombre: 'MASTERCARD INT', descripcion: 'Transacciones crédito tarjetas propias en red ajena', emoji: '🌐' },
  { id: 'mastercard-mds', nombre: 'MASTERCARD MDS', descripcion: 'Transacciones crédito tarjetas ajenas en red propia', emoji: '🌏' },
  { id: 'dock', nombre: 'DOCK', descripcion: 'Transacciones débito Banco Diners Club del Ecuador', emoji: '🚧' },
  { id: 'vtex', nombre: 'VTEX', descripcion: 'Validación antifraude transacciones e-commerce tarjetas Diners Club', emoji: '🛒' }
];

const OPCIONES_ENCOLAMIENTO = ['Variable General', 'OTP General', 'SMS Masivo', 'Notificaciones Push', 'Validaciones KYC'];

const fmt = (f) => { if (!f) return ""; const [y,m,d] = f.split('-'); return `${d}/${m}/${y}`; };

const dur = (fi, hi, ff, hf) => {
  try {
    if (!fi || !hi || !ff || !hf) return '00:00:00';
    const a = new Date(`${fi}T${hi}`), b = new Date(`${ff}T${hf}`);
    if (isNaN(a) || isNaN(b)) return '00:00:00';
    const d = b - a; if (d < 0) return 'Error';
    const h = Math.floor(d/3600000), m = Math.floor((d%3600000)/60000), s = Math.floor((d%60000)/1000);
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  } catch { return '00:00:00'; }
};

const now = () => { const h = new Date(); return { f: h.toISOString().split('T')[0], h: h.toTimeString().split(' ')[0] }; };

const mkSes = (id) => {
  const { f, h } = now();
  return {
    id, label: `Sesión ${id}`, tipo: 'evento-inicio', modoBLU: false, tipoBLU: 'aplicacion',
    multAler: false, periodos: [{ fi: f, hi: h, ff: f, hf: h, dur: '00:00:00' }],
    multServ: false, servAler: [{ n: '', fi: f, hi: h, ff: f, hf: h, dur: '00:00:00', err: '', sug: [] }],
    multEnc: false, servEnc: [{ tipo: 'Variable General', custom: '', fi: f, hi: h, ff: f, hf: h, dur: '00:00:00', enc: '' }],
    fd: { desc: '', imp: '', esc: '', mot: '', impM: '', ejec: '', fi: f, hi: h, estI: 'En revisión', acc: '', accEj: '', accCur: '', fiF: f, hiF: h, ff: f, hf: h, durCalc: '00:00:00', estF: 'Recuperado', nota: '' },
    res: '', errFecha: '', sugFecha: [], showErrFecha: false, autoLimpEsc: true, ultEsc: '',
    svcSel: [], busq: '', showSvc: false, autoFill: false, svcInit: false, bloquear: false
  };
};

const S = {
  bg: { background: '#080c14', color: '#e2e8f0', minHeight: '100vh', fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif', fontSize: '13px' },
  ct: { maxWidth: '1200px', margin: '0 auto', padding: '12px' },
  card: { background: '#0f172a', border: '1px solid #1e293b', borderRadius: '6px', padding: '14px', marginBottom: '10px' },
  inp: { width: '100%', padding: '7px 10px', background: '#0c1322', border: '1px solid #2d3a4f', borderRadius: '4px', color: '#e2e8f0', fontSize: '13px', outline: 'none', boxSizing: 'border-box' },
  inpE: { borderColor: '#dc2626' },
  lbl: { display: 'block', marginBottom: '4px', fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' },
  btn: { padding: '7px 14px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '12px' },
  bP: { background: '#2563eb', color: '#fff' },
  bS: { background: '#1e293b', color: '#94a3b8', border: '1px solid #334155' },
  bD: { background: '#7f1d1d', color: '#fca5a5' },
  bSm: { padding: '4px 10px', fontSize: '11px' },
  bT: (a, c) => ({ padding: '6px 12px', borderRadius: '4px', border: a?`1px solid ${c}`:'1px solid #1e293b', background: a?c+'22':'#0c1322', color: a?c:'#64748b', cursor: 'pointer', fontWeight: 600, fontSize: '11px' }),
  g2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' },
  g3: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' },
  fx: { display: 'flex', alignItems: 'center', gap: '8px' },
  fb: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  ta: { width: '100%', padding: '7px 10px', background: '#0c1322', border: '1px solid #2d3a4f', borderRadius: '4px', color: '#e2e8f0', fontSize: '13px', resize: 'vertical', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' },
  pre: { whiteSpace: 'pre-wrap', fontFamily: '"SF Mono","Fira Code",monospace', fontSize: '12px', color: '#cbd5e1', background: '#060a12', padding: '12px', borderRadius: '4px', border: '1px solid #1e293b', minHeight: '100px' },
  toast: { position: 'fixed', bottom: 16, right: 16, background: '#0f172a', border: '1px solid #334155', color: '#e2e8f0', padding: '8px 16px', borderRadius: '4px', fontSize: '12px', zIndex: 999, fontWeight: 500 },
  ov: { position: 'fixed', inset: 0, background: 'rgba(2,6,14,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  mod: { background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '20px', maxWidth: '420px', width: '90%' },
  sv: (a) => ({ width: '100%', textAlign: 'left', padding: '5px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 500, border: a?'1px solid #2563eb':'1px solid #1e293b', background: a?'#172554':'#0c1322', color: a?'#93c5fd':'#94a3b8', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }),
  tag: { fontSize: '10px', padding: '2px 6px', borderRadius: '3px', fontWeight: 600 },
  sec: { marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #1e293b' },
  chk: { display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', background: '#0c1322', border: '1px solid #1e293b', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', color: '#94a3b8' },
  sub: { background: '#0c1322', border: '1px solid #1e293b', borderRadius: '4px', padding: '10px', marginBottom: '6px' },
  durD: { textAlign: 'center', padding: '10px', background: '#0c1322', borderRadius: '4px', fontSize: '24px', fontWeight: 700, color: '#f1f5f9', fontFamily: 'monospace', letterSpacing: '2px' },
  errB: { background: '#1c0a0a', border: '1px solid #7f1d1d', borderRadius: '4px', padding: '8px', marginTop: '6px' },
  fixB: { width: '100%', textAlign: 'left', padding: '6px 10px', background: '#0a1a0a', border: '1px solid #166534', borderRadius: '4px', color: '#86efac', cursor: 'pointer', fontSize: '11px', fontWeight: 500, marginTop: '4px' },
  tab: (a) => ({ padding: '6px 14px', borderRadius: '4px 4px 0 0', border: '1px solid '+(a?'#334155':'#1e293b'), borderBottom: a?'1px solid #0f172a':'1px solid #1e293b', background: a?'#0f172a':'#080c14', color: a?'#e2e8f0':'#475569', cursor: 'pointer', fontWeight: 600, fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px', position: 'relative', marginBottom: '-1px', zIndex: a?2:1, flexShrink: 0 }),
  tabBar: { display: 'flex', alignItems: 'flex-end', gap: '2px', borderBottom: '1px solid #1e293b', marginBottom: '10px', overflowX: 'auto', paddingBottom: 0 },
  tabX: { background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '14px', padding: '0 2px', lineHeight: 1 },
};

const B = ({ children, p, d, sm, onClick, dis, style }) => (
  <button onClick={onClick} disabled={dis} style={{ ...S.btn, ...(p?S.bP:d?S.bD:S.bS), ...(sm?S.bSm:{}), ...(dis?{opacity:.4,cursor:'not-allowed'}:{}), ...style }}>{children}</button>
);

export default function App() {
  const [auth, setAuth] = useState(false);
  const [lf, setLf] = useState({ u: '', p: '' });
  const [showPw, setShowPw] = useState(false);
  const [lErr, setLErr] = useState('');
  const [toast, setToast] = useState('');
  const [tAb, setTAb] = useState(Date.now());
  const [noPr, setNoPr] = useState(false);
  const [showSync, setShowSync] = useState(false);
  const [showDurConf, setShowDurConf] = useState(false);
  const [sess, setSess] = useState([mkSes(1)]);
  const [actId, setActId] = useState(1);
  const [nxId, setNxId] = useState(2);

  const s = sess.find(x => x.id === actId) || sess[0];
  const up = useCallback((u) => setSess(p => p.map(x => x.id === actId ? (typeof u === 'function' ? u(x) : { ...x, ...u }) : x)), [actId]);
  const tt = (m) => { setToast(m); setTimeout(() => setToast(''), 3000); };

  const login = () => {
    if (USUARIOS_VALIDOS.find(u => u.usuario === lf.u && u.password === lf.p)) { setAuth(true); setLErr(''); }
    else { setLErr('Credenciales incorrectas'); setTimeout(() => setLErr(''), 3000); }
  };

  const addSes = () => { const ns = mkSes(nxId); setSess(p => [...p, ns]); setActId(nxId); setNxId(p => p+1); tt(`Sesión ${nxId} creada`); };
  const rmSes = (id) => {
    if (sess.length <= 1) { tt('Mínimo una sesión'); return; }
    const i = sess.findIndex(x => x.id === id);
    const nw = sess.filter(x => x.id !== id);
    setSess(nw);
    if (actId === id) setActId(nw[Math.min(i, nw.length-1)].id);
    tt('Sesión cerrada');
  };

  useEffect(() => {
    const iv = setInterval(() => { const h = (Date.now()-tAb)/3600000; if (!noPr && h >= 1 && h%1 < 0.017) setShowSync(true); }, 60000);
    return () => clearInterval(iv);
  }, [tAb, noPr]);

  useEffect(() => {
    const fd = s.fd;
    if (!fd.fiF || !fd.hiF || !fd.ff || !fd.hf) return;
    const d = dur(fd.fiF, fd.hiF, fd.ff, fd.hf);
    if (d !== fd.durCalc) up(x => ({ ...x, fd: { ...x.fd, durCalc: d } }));
  }, [s.fd.fiF, s.fd.hiF, s.fd.ff, s.fd.hf]);

  useEffect(() => {
    up(x => {
      let ei = x.fd.estI, ef = x.fd.estF;
      if (x.tipo === 'evento-inicio' || x.tipo === 'incidente-inicio') ei = 'En revisión';
      else if (x.tipo === 'evento-fin' || x.tipo === 'incidente-fin') ef = 'Recuperado';
      else if (x.tipo === 'mantenimiento-inicio') ei = 'En curso';
      else if (x.tipo === 'mantenimiento-fin') ef = 'Finalizado';
      return { ...x, fd: { ...x.fd, estI: ei, estF: ef } };
    });
  }, [s.tipo]);

  useEffect(() => {
    if (s.svcSel.length === 0) { up(x => ({ ...x, multServ: false, servAler: [{ n:'',fi:'',hi:'',ff:'',hf:'',dur:'00:00:00',err:'',sug:[] }], svcInit: false, bloquear: false })); return; }
    const imps = s.svcSel.map(x => x.descripcion).join('\n');
    if (s.autoFill) {
      const desc = s.svcSel.length === 1 ? `Indisponibilidad ${s.svcSel[0].nombre}` : `Indisponibilidad de varios servicios transaccionales (${s.svcSel.map(x=>x.nombre).join(', ')})`;
      up(x => {
        const em = {}; x.servAler.forEach(sa => { if (sa.n && x.svcSel.some(sv => sv.nombre === sa.n)) em[sa.n] = sa; });
        const { f: fa, h: ha } = now();
        const nw = x.svcSel.map(sv => {
          if (em[sv.nombre]) return em[sv.nombre];
          if (x.tipo.includes('-inicio')) { const fi=sv.fechaClick||fa, hi=sv.horaClick||ha; return { n:sv.nombre,fi,hi,ff:fi,hf:hi,dur:'00:00:00',err:'',sug:[] }; }
          if (x.tipo.includes('-fin')) { const fi=sv.fechaClick||x.fd.fiF||fa, hi=sv.horaClick||x.fd.hiF||ha, ff=x.fd.ff||fa, hf=x.fd.hf||ha; return { n:sv.nombre,fi,hi,ff,hf,dur:dur(fi,hi,ff,hf),err:'',sug:[] }; }
          return { n:sv.nombre,fi:fa,hi:ha,ff:fa,hf:ha,dur:'00:00:00',err:'',sug:[] };
        });
        return { ...x, fd:{...x.fd,desc,imp:imps}, multServ:true, servAler:nw, svcInit:true, bloquear:true };
      });
    } else {
      const c = s.tipo.startsWith('mantenimiento-') ? 'impM' : 'imp';
      up(x => ({ ...x, fd: { ...x.fd, [c]: imps } }));
    }
  }, [s.svcSel, s.autoFill, s.tipo]);

  useEffect(() => { if (s.tipo.endsWith('-fin')) valDates(); }, [s.fd.fiF, s.fd.hiF, s.fd.ff, s.fd.hf, s.tipo]);

  const cTA = () => { const d = Date.now()-tAb; return { h: Math.floor(d/3600000), m: Math.floor((d%3600000)/60000), t: d/3600000 }; };
  const sem = () => { const { t } = cTA(); if (t<1) return { e:'SYNC',c:'#4ade80' }; if (t<4) return { e:'REVISAR',c:'#facc15' }; return { e:'DESYNC',c:'#f87171' }; };

  const sync = () => {
    const { f, h } = now();
    up(x => ({ ...x, fd:{...x.fd,fi:f,hi:h,fiF:f,hiF:h,ff:f,hf:h}, periodos:[{fi:f,hi:h,ff:f,hf:h,dur:'00:00:00'}], servAler:[{n:'',fi:f,hi:h,ff:f,hf:h,dur:'00:00:00',err:'',sug:[]}], servEnc:[{tipo:'Variable General',custom:'',fi:f,hi:h,ff:f,hf:h,dur:'00:00:00',enc:''}] }));
    setTAb(Date.now()); setShowSync(false); tt('Sincronizado');
  };

  const limpi = () => {
    const { f, h } = now();
    up(x => ({ ...x, fd:{...x.fd,desc:'',imp:'',esc:'',mot:'',impM:'',ejec:'',acc:'',accEj:'',accCur:'',nota:'',fi:f,hi:h,fiF:f,hiF:h,ff:f,hf:h,durCalc:'00:00:00'}, multAler:false,multServ:false,multEnc:false,errFecha:'',showErrFecha:false,sugFecha:[],svcSel:[],autoFill:false,svcInit:false,bloquear:false,periodos:[{fi:f,hi:h,ff:f,hf:h,dur:'00:00:00'}],servAler:[{n:'',fi:f,hi:h,ff:f,hf:h,dur:'00:00:00',err:'',sug:[]}],servEnc:[{tipo:'Variable General',custom:'',fi:f,hi:h,ff:f,hf:h,dur:'00:00:00',enc:''}],res:'' }));
    tt('Limpiado');
  };

  const sf = (k,v) => up(x => ({ ...x, fd:{...x.fd,[k]:v} }));
  const hi = (e) => sf(e.target.name, e.target.value);

  const togSvc = (sv) => {
    up(x => {
      const ex = x.svcSel.find(y => y.id === sv.id);
      if (ex) { const nl = x.svcSel.filter(y => y.id !== sv.id); return { ...x, svcSel: nl, ...(nl.length===0?{svcInit:false,bloquear:false}:{}) }; }
      const { f, h } = now();
      return { ...x, svcSel: [...x.svcSel, { ...sv, fechaClick: f, horaClick: h }] };
    });
  };

  const selTipo = (nt) => {
    const prev = s.tipo;
    up(x => {
      let u = { ...x, tipo: nt };
      if ((prev.endsWith('-inicio')||prev.endsWith('-avance')||prev.endsWith('-seguimiento')) && nt.endsWith('-fin')) {
        const { f, h } = now();
        u.fd = { ...u.fd, fiF: x.fd.fi, hiF: x.fd.hi, ff: f, hf: h };
        if (x.servAler.length > 0 && x.servAler[0].n) u.servAler = x.servAler.map(sa => ({ ...sa, ff:f, hf:h, dur:dur(sa.fi,sa.hi,f,h) }));
        // Carry over periods: preserve starts, add current time as end
        if (x.multAler && x.periodos.length > 0) {
          u.periodos = x.periodos.map(p => ({ ...p, ff: f, hf: h, dur: dur(p.fi, p.hi, f, h) }));
        }
        tt('Fechas autocompletadas');
      }
      return u;
    });
  };

  const valDates = () => {
    const fd = s.fd;
    if (!fd.fiF||!fd.hiF||!fd.ff||!fd.hf) { up({errFecha:''}); return true; }
    try {
      const a = new Date(`${fd.fiF}T${fd.hiF}`), b = new Date(`${fd.ff}T${fd.hf}`);
      if (b < a) {
        const dH = Math.abs((b-a)/3600000), dD = Math.abs((b-a)/86400000);
        const err = `ERROR: Fin (${fmt(fd.ff)} ${fd.hf}) es ${dD>=1?dD.toFixed(0)+' día(s)':dH.toFixed(1)+' hora(s)'} ANTERIOR al inicio`;
        const { f, h } = now();
        up({ errFecha:err, sugFecha:[{t:`Usar actual: ${fmt(f)} ${h}`,f,h},{t:'Usar inicio + 1h',f:fd.fiF,h:null}], showErrFecha:true }); return false;
      }
      up({ errFecha:'',sugFecha:[],showErrFecha:false }); return true;
    } catch { up({errFecha:'Error formato'}); return false; }
  };

  const aplSugF = (f,h) => {
    if (!h) { const i = new Date(`${s.fd.fiF}T${s.fd.hiF}`); i.setHours(i.getHours()+1); h = i.toTimeString().split(' ')[0]; f = s.fd.fiF; }
    up(x => ({ ...x, fd:{...x.fd,ff:f,hf:h}, errFecha:'',sugFecha:[],showErrFecha:false })); tt('Corregido');
  };

  const updSA = (i,k,v) => {
    up(x => ({ ...x, servAler: x.servAler.map((sa,j) => {
      if (j!==i) return sa;
      const ns = { ...sa, [k]:v };
      if (ns.fi&&ns.hi&&ns.ff&&ns.hf) {
        try {
          const a = new Date(`${ns.fi}T${ns.hi}`), b = new Date(`${ns.ff}T${ns.hf}`);
          if (b<a) { const dH=Math.abs((b-a)/3600000),dD=Math.abs((b-a)/86400000); ns.err=`${ns.n||`#${i+1}`}: Fin ${dD>=1?dD.toFixed(0)+'d':dH.toFixed(1)+'h'} antes inicio`; const{f,h}=now(); ns.sug=[{t:`Actual: ${fmt(f)} ${h}`,f,h},{t:'Inicio+1h',f:ns.fi,h:null}]; ns.dur='ERROR'; }
          else { ns.err=''; ns.sug=[]; ns.dur=dur(ns.fi,ns.hi,ns.ff,ns.hf); }
        } catch { ns.err='Error'; ns.dur='ERROR'; }
      }
      return ns;
    })}));
  };

  const aplSugSA = (i,f,h) => {
    up(x => ({ ...x, servAler: x.servAler.map((sa,j) => {
      if (j!==i) return sa;
      if (!f||!h) { const ini=new Date(`${sa.fi}T${sa.hi}`); ini.setHours(ini.getHours()+1); f=sa.fi; h=ini.toTimeString().split(' ')[0]; }
      return { ...sa, ff:f,hf:h,err:'',sug:[],dur:dur(sa.fi,sa.hi,f,h) };
    })})); tt(`Servicio ${i+1} corregido`);
  };

  const addSA = () => { const{f,h}=now(); up(x => ({ ...x, servAler:[...x.servAler,{n:'',fi:f,hi:h,ff:f,hf:h,dur:'00:00:00',err:'',sug:[]}] })); };
  const rmSA = (i) => up(x => ({ ...x, servAler: x.servAler.length>1?x.servAler.filter((_,j)=>j!==i):x.servAler }));

  const addP = () => { const{f,h}=now(); up(x => ({ ...x, periodos:[...x.periodos,{fi:f,hi:h,ff:f,hf:h,dur:'00:00:00'}] })); };
  const rmP = (i) => up(x => ({ ...x, periodos: x.periodos.length>1?x.periodos.filter((_,j)=>j!==i):x.periodos }));
  const updP = (i,k,v) => up(x => ({ ...x, periodos: x.periodos.map((p,j) => { if(j!==i)return p; const np={...p,[k]:v}; if(np.fi&&np.hi&&np.ff&&np.hf)np.dur=dur(np.fi,np.hi,np.ff,np.hf); return np; }) }));

  const addSE = () => { const{f,h}=now(); up(x => ({ ...x, servEnc:[...x.servEnc,{tipo:'Variable General',custom:'',fi:f,hi:h,ff:f,hf:h,dur:'00:00:00',enc:''}] })); };
  const rmSE = (i) => up(x => ({ ...x, servEnc: x.servEnc.length>1?x.servEnc.filter((_,j)=>j!==i):x.servEnc }));
  const updSE = (i,k,v) => up(x => ({ ...x, servEnc: x.servEnc.map((se,j) => { if(j!==i)return se; const ns={...se,[k]:v}; if(ns.fi&&ns.hi&&ns.ff&&ns.hf)ns.dur=dur(ns.fi,ns.hi,ns.ff,ns.hf); return ns; }) }));

  const durTot = () => {
    if (!s.multAler||s.periodos.length===0) return s.fd.durCalc;
    let t=0; s.periodos.forEach(p=>{if(p.dur!=='00:00:00'&&p.dur!=='Error'){const[h,m,sc]=p.dur.split(':').map(Number);t+=h*3600+m*60+sc;}});
    return `${String(Math.floor(t/3600)).padStart(2,'0')}:${String(Math.floor((t%3600)/60)).padStart(2,'0')}:${String(t%60).padStart(2,'0')}`;
  };

  const fmtSA = () => {
    if (!s.multServ||s.servAler.length===0) return '';
    let r='Alertamientos:';
    s.servAler.forEach(sa=>{if(sa.n?.trim()){r+=`\n        Servicio: ${sa.n}\n        Inicio: ${fmt(sa.fi)} - ${sa.hi}`;if(s.tipo.endsWith('-fin')&&sa.ff&&sa.hf&&(sa.ff!==sa.fi||sa.hf!==sa.hi))r+=`\n        Fin: ${fmt(sa.ff)} - ${sa.hf}\n        Duración: ${sa.dur}`;r+='\n';}});
    return r;
  };

  const fmtPer = () => {
    const fd=s.fd;
    const isFin = s.tipo.endsWith('-fin');
    if (!s.multAler||s.periodos.length===0) {
      if (isFin) return `Inicio: ${fmt(fd.fiF)} - ${fd.hiF}\nFin: ${fmt(fd.ff)} - ${fd.hf}\nDuración: ${fd.durCalc}`;
      return `Inicio: ${fmt(fd.fi)} - ${fd.hi}`;
    }
    if (isFin) {
      let r=`Duración Total: ${durTot()}\nPeríodos de Alertamiento:`;
      s.periodos.forEach((p,i)=>{r+=`\n        Período ${i+1}:\n        Inicio: ${fmt(p.fi)} - ${p.hi}\n        Fin: ${fmt(p.ff)} - ${p.hf}\n        Duración: ${p.dur}`;if(i<s.periodos.length-1)r+='\n';});
      return r;
    }
    // inicio/seguimiento/avance: only show starts
    let r='Períodos de Alertamiento:';
    s.periodos.forEach((p,i)=>{r+=`\n        Período ${i+1}:\n        Inicio: ${fmt(p.fi)} - ${p.hi}`;if(i<s.periodos.length-1)r+='\n';});
    return r;
  };

  const fmtImp = (v,d) => { const x=v||d; const ls=x.split('\n').filter(l=>l.trim()); if(ls.length<=1) return `Impacto: ${x}`; let r="Impacto:"; ls.forEach(l=>{if(l.trim())r+=`\n        • ${l.trim()}`;}); return r; };
  const fmtAcc = (t,l) => { if(!t?.trim())return''; let r=`\n${l}:`; t.split('\n').forEach(ln=>{const x=ln.trim();if(x){if(x.includes('%%')){const[a,rp]=x.split('%%').map(s=>s.trim());r+=`\n        • ${a}`;if(rp)r+=`\n          Responsable: ${rp}`;}else r+=`\n        • ${x}`;}}); return r; };
  const fmtNE = () => { if(!s.multEnc||s.servEnc.length===0)return''; let r='Encolamientos por servicio:'; s.servEnc.forEach(se=>{if(se.enc?.trim())r+=`\n        • ${se.tipo==='Otro'?se.custom:se.tipo}: ${se.enc}`;}); return r; };

  const gen = () => {
    if (s.tipo.endsWith('-fin')&&!valDates()) return;
    if (s.multServ&&s.servAler.some(x=>x.err)) { tt('ERROR: Corrige fechas'); return; }
    if (s.tipo.endsWith('-fin')) { const d=s.multAler?durTot():s.fd.durCalc; const[h,m,sc]=d.split(':').map(Number); if(h+m/60+sc/3600>4){setShowDurConf(true);return;} }
    genInt();
  };

  const genInt = () => {
    const fd=s.fd;
    if (fd.esc?.trim()) up({ultEsc:fd.esc});
    const tit = (()=>{
      if (!s.modoBLU) { if(s.tipo.startsWith('evento-'))return'GESTIÓN EVENTO'; if(s.tipo.startsWith('incidente-'))return'GESTIÓN INCIDENTE'; return s.tipo.includes('inicio')?'⚠️ MANTENIMIENTO':'✅ MANTENIMIENTO'; }
      if (s.tipo.startsWith('evento-')) return s.tipoBLU==='bian'?'GESTIÓN EVENTO BIAN':'GESTIÓN EVENTO BLU 2.0';
      if (s.tipo.startsWith('incidente-')) return 'GESTIÓN INCIDENTE';
      return s.tipo.includes('inicio')?'⚠️ MANTENIMIENTO':'✅ MANTENIMIENTO';
    })();
    let m='';
    const desc=fd.desc||(s.modoBLU?"Alertamiento [cluster/namespace]":"DESCRIPCION DEL INCIDENTE");
    const impF=fmtImp(fd.imp,"Impacto servicio / usuarios");
    const esc=fd.esc?.trim()?`\nEscalado a: ${fd.esc}`:'';
    const svI=fmtSA();

    if (s.tipo==='evento-inicio'||s.tipo==='incidente-inicio') { m=`${tit}\n🟡 ${fd.estI||'En revisión'}\n\nDescripción: ${desc}\n${impF}${esc}`; m+=svI?`\n\n${svI}`:s.multAler?`\n${fmtPer()}`:`\nInicio: ${fmt(fd.fi)} - ${fd.hi}`; }
    else if (s.tipo==='evento-seguimiento') { m=`${tit}\n🔁 Seguimiento\n\nDescripción: ${desc}\n${impF}${esc}`; if(s.multAler)m+=`\n${fmtPer()}`; m+=fmtAcc(fd.acc,'Acciones'); }
    else if (s.tipo==='evento-fin') { m=`${tit}\n🟢 ${fd.estF||'Recuperado'}\n\nDescripción: ${desc}\n${impF}${esc}`; m+=svI?`\n\n${svI}`:`\n${fmtPer()}`; m+=fmtAcc(fd.acc,'Acciones'); }
    else if (s.tipo==='mantenimiento-inicio') { const iM=fmtImp(fd.impM,"Impacto servicio / usuarios / clientes"); m=`${tit}\n\nEstado: ${fd.estI||'En curso'}\nMotivo: ${fd.mot||'Descripción del Mantenimiento'}\n${iM}\nEjecutor: ${fd.ejec||'Proveedor o área interna'}`; m+=s.multAler?`\n${fmtPer()}`:`\nInicio: ${fmt(fd.fi)} - ${fd.hi}`; }
    else if (s.tipo==='mantenimiento-fin') { const iM=fmtImp(fd.impM,"Impacto servicio / usuarios / clientes"); m=`${tit}\n\nEstado: ${fd.estF||'Finalizado'}\nMotivo: ${fd.mot||'Descripción del Mantenimiento'}\n${iM}\nEjecutor: ${fd.ejec||'Proveedor o área interna'}\n${fmtPer()}`; }
    else if (s.tipo==='incidente-avance') { m=`${tit}\n🔁 Avance\n\nDescripción: ${desc}\n${impF}${esc}`; if(s.multAler)m+=`\n${fmtPer()}`; m+=fmtAcc(fd.accCur,'Acciones en curso'); m+=fmtAcc(fd.accEj,'Acciones ejecutadas'); }
    else if (s.tipo==='incidente-fin') { m=`${tit}\n🟢 Recuperado\n\nDescripción: ${desc}\n${impF}${esc}`; m+=svI?`\n\n${svI}`:`\n${fmtPer()}`; m+=fmtAcc(fd.accEj,'Acciones ejecutadas'); }

    if (fd.nota||(s.multEnc&&s.tipo.startsWith('evento-'))) {
      if (s.tipo.startsWith('mantenimiento-')) m+=`\n\n📣 NOTA:\n        ${fd.nota||'Observaciones adicionales'}`;
      else { let ps=[]; if(fd.nota?.trim())ps.push(fd.nota); if(s.multEnc&&s.tipo.startsWith('evento-')){const ne=fmtNE();if(ne)ps.push(ne);} if(ps.length>0)m+=`\n\n📣 NOTA:\n        ${ps.join('\n        \n        ')}`; }
    }

    up(x => {
      const tL = x.tipo.startsWith('evento-')?'EV':x.tipo.startsWith('incidente-')?'INC':'MNT';
      const fase = x.tipo.includes('-inicio')?'🟡':x.tipo.includes('-fin')?'🟢':'🔁';
      const sd = (x.fd.desc||'').substring(0,18)||'Nueva';
      const u = { ...x, res: m, label: `${fase} ${tL}: ${sd}` };
      if (x.autoLimpEsc&&(x.tipo.startsWith('evento-')||x.tipo.startsWith('incidente-'))) u.fd = { ...u.fd, esc: '' };
      return u;
    });
  };

  const copy = () => { if(!s.res){tt('Genera primero');return;} navigator.clipboard.writeText(s.res).then(()=>tt('Copiado ✓')).catch(()=>tt('Error')); };

  const svcF = SERVICIOS_TRANSACCIONALES.filter(x => x.nombre.toLowerCase().includes(s.busq.toLowerCase())||x.descripcion.toLowerCase().includes(s.busq.toLowerCase()));

  if (!auth) return (
    <div style={{...S.bg,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{...S.card,width:'340px',padding:'24px'}}>
        <div style={{textAlign:'center',marginBottom:'20px'}}><div style={{fontSize:'15px',fontWeight:700,color:'#e2e8f0'}}>Generador de Comunicados</div><div style={{fontSize:'12px',color:'#64748b',marginTop:'6px',fontWeight:600}}>LUIS HERRERA</div><div style={{fontSize:'10px',color:'#475569',marginTop:'2px'}}>Service Desk — Diners Club Ecuador</div></div>
        <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
          <div><label style={S.lbl}>Usuario</label><input style={S.inp} value={lf.u} onChange={e=>setLf(p=>({...p,u:e.target.value}))} placeholder="Usuario" /></div>
          <div><label style={S.lbl}>Contraseña</label>
            <div style={{position:'relative'}}>
              <input style={{...S.inp,paddingRight:'36px'}} type={showPw?'text':'password'} value={lf.p} onChange={e=>setLf(p=>({...p,p:e.target.value}))} placeholder="Contraseña" onKeyDown={e=>e.key==='Enter'&&login()} />
              <button onClick={()=>setShowPw(!showPw)} style={{position:'absolute',right:'8px',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:'#64748b',cursor:'pointer',fontSize:'12px'}}>{showPw?'🙈':'👁'}</button>
            </div>
          </div>
          {lErr && <div style={{...S.errB,textAlign:'center'}}><span style={{fontSize:'12px',color:'#fca5a5'}}>{lErr}</span></div>}
          <B p onClick={login} style={{width:'100%',padding:'10px'}}>Iniciar Sesión</B>
        </div>
      </div>
    </div>
  );

  return (
    <div style={S.bg}><div style={S.ct}>
      {/* Header */}
      <div style={{...S.card,...S.fb,padding:'10px 14px'}}>
        <div><span style={{fontSize:'14px',fontWeight:700,color:'#e2e8f0'}}>Generador de Comunicados</span><span style={{fontSize:'11px',color:'#475569',marginLeft:'8px'}}>Luis Herrera</span><span style={{fontSize:'10px',color:'#334155',marginLeft:'6px'}}>v7.0</span></div>
        <div style={S.fx}>
          <span style={{...S.tag,background:sem().c+'22',color:sem().c,border:`1px solid ${sem().c}44`}}>{sem().e} ({cTA().h}h{cTA().m}m)</span>
          <button onClick={sync} style={{...S.btn,...S.bSm,...S.bS}}>⟳</button>
          <button onClick={()=>up(x=>({...x,modoBLU:!x.modoBLU}))} style={{...S.btn,...S.bSm,background:s.modoBLU?'#1e3a5f':'#1e293b',color:s.modoBLU?'#60a5fa':'#64748b',border:s.modoBLU?'1px solid #2563eb':'1px solid #334155'}}>BLU {s.modoBLU?'ON':'OFF'}</button>
          <button onClick={()=>{setAuth(false);setLf({u:'',p:''});}} style={{...S.btn,...S.bSm,...S.bS,color:'#64748b'}}>Salir</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={S.tabBar}>
        {sess.map(x => {
          const tc = x.tipo.startsWith('evento-')?'#22c55e':x.tipo.startsWith('incidente-')?'#ef4444':'#f59e0b';
          return (
            <div key={x.id} style={S.tab(x.id===actId)} onClick={()=>setActId(x.id)}>
              <span style={{width:'6px',height:'6px',borderRadius:'50%',background:tc,display:'inline-block',flexShrink:0}}></span>
              <span style={{maxWidth:'150px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{x.label}</span>
              {sess.length>1&&<button onClick={e=>{e.stopPropagation();rmSes(x.id);}} style={S.tabX} title="Cerrar">×</button>}
            </div>
          );
        })}
        <button onClick={addSes} style={{...S.tab(false),color:'#475569',border:'1px dashed #334155',background:'transparent'}} title="Nueva sesión">+ Nueva</button>
      </div>

      {s.modoBLU && <div style={{...S.fx,marginBottom:'10px'}}>
        {['aplicacion','infraestructura','bian'].map(t=><button key={t} onClick={()=>up({tipoBLU:t})} style={S.bT(s.tipoBLU===t,'#2563eb')}>{t==='aplicacion'?'📱 App':t==='infraestructura'?'🖥️ Infra':'⚠️ BIAN'}</button>)}
      </div>}

      <div style={{display:'grid',gridTemplateColumns:'260px 1fr',gap:'10px'}}>
        {/* LEFT */}
        <div>
          <div style={S.card}>
            <div style={{...S.lbl,marginBottom:'8px'}}>Tipo</div>
            <div style={{marginBottom:'8px'}}><div style={{fontSize:'10px',color:'#475569',marginBottom:'4px',fontWeight:600}}>EVENTOS</div><div style={S.g3}>{['evento-inicio','evento-seguimiento','evento-fin'].map((t,i)=><button key={t} onClick={()=>selTipo(t)} style={S.bT(s.tipo===t,'#22c55e')}>{['🟡 Ini','🔁 Seg','🟢 Fin'][i]}</button>)}</div></div>
            <div style={{marginBottom:'8px'}}><div style={{fontSize:'10px',color:'#475569',marginBottom:'4px',fontWeight:600}}>MANTENIMIENTOS</div><div style={S.g2}>{['mantenimiento-inicio','mantenimiento-fin'].map((t,i)=><button key={t} onClick={()=>selTipo(t)} style={S.bT(s.tipo===t,'#f59e0b')}>{['⚠️ Ini','✅ Fin'][i]}</button>)}</div></div>
            <div><div style={{fontSize:'10px',color:'#475569',marginBottom:'4px',fontWeight:600}}>INCIDENTES</div><div style={S.g3}>{['incidente-inicio','incidente-avance','incidente-fin'].map((t,i)=><button key={t} onClick={()=>selTipo(t)} style={S.bT(s.tipo===t,'#ef4444')}>{['🟡 Ini','🔁 Av','🟢 Fin'][i]}</button>)}</div></div>
          </div>
          <div style={S.card}>
            <button onClick={()=>up(x=>({...x,showSvc:!x.showSvc}))} style={{...S.fb,width:'100%',background:'none',border:'none',color:'#94a3b8',cursor:'pointer',padding:0}}>
              <span style={{fontSize:'11px',fontWeight:600}}>SERVICIOS {s.svcSel.length>0&&<span style={{...S.tag,background:'#1e3a5f',color:'#60a5fa'}}>{s.svcSel.length}</span>}</span>
              <span style={{fontSize:'10px'}}>{s.showSvc?'▲':'▼'}</span>
            </button>
            {s.showSvc&&<div style={{marginTop:'8px'}}>
              <label style={S.chk}><input type="checkbox" checked={s.autoFill} onChange={e=>{up({autoFill:e.target.checked});tt(e.target.checked?'Auto-llenado ON':'Solo impactos');}} /><span>🚀 Auto-llenado {s.autoFill?'ON':'OFF'}</span></label>
              {s.svcSel.length>0&&<div style={{...S.fx,marginTop:'6px'}}><B sm d onClick={()=>up({svcSel:[]})}>✕ Limpiar</B>{!s.autoFill&&<B sm onClick={()=>{sf(s.tipo.startsWith('mantenimiento-')?'impM':'imp','');tt('Limpiado');}}>✕ Impactos</B>}</div>}
              <input type="text" placeholder="Buscar..." value={s.busq} onChange={e=>up({busq:e.target.value})} style={{...S.inp,marginTop:'6px',fontSize:'11px'}} />
              <div style={{...S.g2,marginTop:'6px',maxHeight:'340px',overflowY:'auto'}}>
                <div style={{display:'flex',flexDirection:'column',gap:'3px'}}>{svcF.slice(0,10).map(sv=><button key={sv.id} onClick={()=>togSvc(sv)} style={S.sv(s.svcSel.some(x=>x.id===sv.id))} title={sv.descripcion}><span>{sv.emoji} {sv.nombre}</span>{s.svcSel.some(x=>x.id===sv.id)&&<span>✓</span>}</button>)}</div>
                <div style={{display:'flex',flexDirection:'column',gap:'3px'}}>{svcF.slice(10).map(sv=><button key={sv.id} onClick={()=>togSvc(sv)} style={S.sv(s.svcSel.some(x=>x.id===sv.id))} title={sv.descripcion}><span>{sv.emoji} {sv.nombre}</span>{s.svcSel.some(x=>x.id===sv.id)&&<span>✓</span>}</button>)}</div>
              </div>
            </div>}
          </div>
        </div>

        {/* RIGHT */}
        <div>
          <div style={S.card}>
            {s.modoBLU&&s.tipo.startsWith('evento-')&&<div style={{background:'#0c1322',border:'1px solid #334155',borderRadius:'4px',padding:'8px',marginBottom:'10px',fontSize:'11px'}}><span style={{color:'#64748b'}}>Escalamiento: </span><span style={{color:'#e2e8f0',fontWeight:600}}>{s.tipoBLU==='bian'?'Miguel Angel López Garavito':s.tipoBLU==='infraestructura'?'Infraestructura Cloud':'Paul Chamorro / David Albuja'}</span>{s.tipoBLU==='bian'&&<span style={{color:'#475569',marginLeft:'8px'}}>malopez@dinersclub.com.ec</span>}</div>}

            {(s.tipo.startsWith('evento-')||s.tipo.startsWith('incidente-'))&&<div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
              <div><label style={S.lbl}>Descripción</label><input style={S.inp} name="desc" placeholder={s.modoBLU?"Alerta CLUSTER_EKS_KB":"Descripción"} value={s.fd.desc} onChange={hi} /></div>
              <div><label style={S.lbl}>Impacto</label><textarea style={{...S.ta,height:'70px'}} name="imp" placeholder="Impacto" value={s.fd.imp} onChange={hi} /></div>
              <div><label style={S.lbl}>Escalado a</label>
                {s.ultEsc&&<div style={{fontSize:'10px',color:'#ca8a04',marginBottom:'4px',padding:'4px 8px',background:'#1a1500',border:'1px solid #422006',borderRadius:'3px'}}>Último: {s.ultEsc}</div>}
                <input style={S.inp} name="esc" placeholder="MAYÚSCULAS" value={s.fd.esc} onChange={e=>sf('esc',e.target.value.toUpperCase())} />
                <div style={{...S.fb,marginTop:'4px'}}><span style={{fontSize:'10px',color:'#334155'}}>Auto MAYÚSCULAS</span><label style={{fontSize:'10px',color:'#475569',display:'flex',alignItems:'center',gap:'4px',cursor:'pointer'}}><input type="checkbox" checked={s.autoLimpEsc} onChange={e=>up({autoLimpEsc:e.target.checked})} />Auto-limpiar</label></div>
              </div>
            </div>}

            {s.tipo.startsWith('mantenimiento-')&&<div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
              <div><label style={S.lbl}>Motivo</label><input style={S.inp} name="mot" placeholder="Descripción" value={s.fd.mot} onChange={hi} /></div>
              <div><label style={S.lbl}>Impacto</label><textarea style={{...S.ta,height:'70px'}} name="impM" placeholder="Impacto" value={s.fd.impM} onChange={hi} /></div>
              <div><label style={S.lbl}>Ejecutor</label><input style={S.inp} name="ejec" placeholder="Proveedor/área" value={s.fd.ejec} onChange={hi} /></div>
            </div>}

            <div style={S.sec}>
              <div style={{...S.lbl,marginBottom:'8px'}}>Opciones</div>
              <div style={{display:'flex',flexDirection:'column',gap:'4px'}}>
                {(s.tipo==='evento-inicio'||s.tipo==='incidente-inicio'||s.tipo==='evento-fin'||s.tipo==='incidente-fin')&&
                  <label style={S.chk}><input type="checkbox" checked={s.multServ} onChange={e=>{
                    const on=e.target.checked;
                    up(x=>{const u={...x,multServ:on};if(on){const{f,h}=now();if(x.svcSel.length>0&&!x.bloquear){u.servAler=x.svcSel.map(sv=>({n:sv.nombre,fi:f,hi:h,ff:f,hf:h,dur:'00:00:00',err:'',sug:[]}));u.svcInit=true;if(x.tipo.endsWith('-fin'))u.bloquear=true;}else if(!x.svcSel.length){u.servAler=[{n:'',fi:f,hi:h,ff:f,hf:h,dur:'00:00:00',err:'',sug:[]}];u.svcInit=true;}}else{u.svcInit=false;u.bloquear=false;}return u;});
                  }} /><span>Múltiples servicios</span></label>}
                {(s.tipo==='evento-inicio'||s.tipo==='evento-seguimiento'||(s.tipo.endsWith('-fin')&&s.tipo.startsWith('evento-')))&&
                  <label style={S.chk}><input type="checkbox" checked={s.multEnc} onChange={e=>up({multEnc:e.target.checked})} /><span>Encolamiento múltiple</span></label>}
                                <label style={S.chk}><input type="checkbox" checked={s.multAler} onChange={e=>up({multAler:e.target.checked})} /><span>Períodos múltiples</span></label>
              </div>
            </div>

            {s.multServ&&(s.tipo.includes('-inicio')||s.tipo.includes('-fin'))&&<div style={S.sec}>
              <div style={{...S.fb,marginBottom:'8px'}}><span style={S.lbl}>Servicios Alertados</span><B sm p onClick={addSA}>+ Agregar</B></div>
              {s.servAler.map((sa,i)=><div key={i} style={{...S.sub,borderColor:sa.err?'#7f1d1d':'#1e293b'}}>
                <div style={{...S.fb,marginBottom:'6px'}}><span style={{fontSize:'11px',fontWeight:600,color:'#64748b'}}>#{i+1}</span>{s.servAler.length>1&&<button onClick={()=>rmSA(i)} style={{background:'none',border:'none',color:'#ef4444',cursor:'pointer'}}>✕</button>}</div>
                <input style={{...S.inp,marginBottom:'6px'}} placeholder="Nombre" value={sa.n} onChange={e=>updSA(i,'n',e.target.value)} />
                <div style={S.g2}>
                  <div><label style={{...S.lbl,fontSize:'10px'}}>F.Ini</label><input type="date" value={sa.fi} onChange={e=>updSA(i,'fi',e.target.value)} style={{...S.inp,fontSize:'11px'}} /></div>
                  <div><label style={{...S.lbl,fontSize:'10px'}}>H.Ini</label><input type="time" step="1" value={sa.hi} onChange={e=>updSA(i,'hi',e.target.value)} style={{...S.inp,fontSize:'11px'}} /></div>
                  {s.tipo.endsWith('-fin')&&<>
                    <div><label style={{...S.lbl,fontSize:'10px'}}>F.Fin</label><input type="date" value={sa.ff} onChange={e=>updSA(i,'ff',e.target.value)} style={{...S.inp,...(sa.err?S.inpE:{}),fontSize:'11px'}} /></div>
                    <div><label style={{...S.lbl,fontSize:'10px'}}>H.Fin</label><input type="time" step="1" value={sa.hf} onChange={e=>updSA(i,'hf',e.target.value)} style={{...S.inp,...(sa.err?S.inpE:{}),fontSize:'11px'}} /></div>
                    <div style={{gridColumn:'1/-1',textAlign:'center',padding:'4px',background:sa.err?'#1c0a0a':'#0d0d0d',borderRadius:'3px',fontSize:'12px',fontWeight:600,fontFamily:'monospace',color:sa.err?'#fca5a5':'#d4d4d4'}}>{sa.dur}</div>
                  </>}
                </div>
                {sa.err&&<div style={S.errB}><div style={{fontSize:'11px',color:'#fca5a5'}}>{sa.err}</div>{sa.sug?.map((sg,si)=><button key={si} onClick={()=>aplSugSA(i,sg.f,sg.h)} style={S.fixB}>{sg.t}</button>)}</div>}
              </div>)}
            </div>}

            {s.multEnc&&<div style={S.sec}>
              <div style={{...S.fb,marginBottom:'8px'}}><span style={S.lbl}>Encolamientos</span><B sm p onClick={addSE}>+ Agregar</B></div>
              {s.servEnc.map((se,i)=><div key={i} style={S.sub}>
                <div style={{...S.fb,marginBottom:'6px'}}><span style={{fontSize:'11px',color:'#64748b'}}>#{i+1}</span>{s.servEnc.length>1&&<button onClick={()=>rmSE(i)} style={{background:'none',border:'none',color:'#ef4444',cursor:'pointer'}}>✕</button>}</div>
                <select value={se.tipo} onChange={e=>updSE(i,'tipo',e.target.value)} style={{...S.inp,marginBottom:'4px'}}>{OPCIONES_ENCOLAMIENTO.map(o=><option key={o} value={o}>{o}</option>)}<option value="Otro">Otro</option></select>
                {se.tipo==='Otro'&&<input style={{...S.inp,marginBottom:'4px'}} placeholder="Especificar" value={se.custom} onChange={e=>updSE(i,'custom',e.target.value)} />}
                <input type="number" style={S.inp} placeholder="Cantidad" value={se.enc} onChange={e=>updSE(i,'enc',e.target.value)} />
              </div>)}
            </div>}

            {s.multAler&&!s.multServ&&!s.multEnc&&<div style={S.sec}>
              <div style={{...S.fb,marginBottom:'8px'}}><span style={S.lbl}>Períodos {s.tipo.endsWith('-fin')?'':'(Inicio)'}</span><B sm p onClick={addP}>+ Agregar</B></div>
              {s.periodos.map((p,i)=><div key={i} style={S.sub}>
                <div style={{...S.fb,marginBottom:'6px'}}><span style={{fontSize:'11px',color:'#64748b'}}>P{i+1}</span>{s.periodos.length>1&&<button onClick={()=>rmP(i)} style={{background:'none',border:'none',color:'#ef4444',cursor:'pointer'}}>✕</button>}</div>
                <div style={S.g2}>
                  <div><label style={{...S.lbl,fontSize:'10px'}}>F.Ini</label><input type="date" value={p.fi} onChange={e=>updP(i,'fi',e.target.value)} style={{...S.inp,fontSize:'11px'}} /></div>
                  <div><label style={{...S.lbl,fontSize:'10px'}}>H.Ini</label><input type="time" step="1" value={p.hi} onChange={e=>updP(i,'hi',e.target.value)} style={{...S.inp,fontSize:'11px'}} /></div>
                  {s.tipo.endsWith('-fin')&&<>
                    <div><label style={{...S.lbl,fontSize:'10px'}}>F.Fin</label><input type="date" value={p.ff} onChange={e=>updP(i,'ff',e.target.value)} style={{...S.inp,fontSize:'11px'}} /></div>
                    <div><label style={{...S.lbl,fontSize:'10px'}}>H.Fin</label><input type="time" step="1" value={p.hf} onChange={e=>updP(i,'hf',e.target.value)} style={{...S.inp,fontSize:'11px'}} /></div>
                    <div style={{gridColumn:'1/-1',textAlign:'center',padding:'4px',background:'#060a12',borderRadius:'3px',fontSize:'12px',fontWeight:600,fontFamily:'monospace'}}>{p.dur}</div>
                  </>}
                </div>
              </div>)}
              {s.tipo.endsWith('-fin')&&<div style={{...S.durD,marginTop:'6px',fontSize:'16px',padding:'6px'}}>Total: {durTot()}</div>}
            </div>}

            {s.tipo.endsWith('-inicio')&&!s.multServ&&!s.multAler&&<div style={{...S.g2,...S.sec}}>
              <div><label style={S.lbl}>Fecha Inicio</label><input type="date" style={S.inp} name="fi" value={s.fd.fi} onChange={hi} /></div>
              <div><label style={S.lbl}>Hora Inicio</label><input type="time" step="1" style={S.inp} name="hi" value={s.fd.hi} onChange={hi} /></div>
            </div>}

            {s.tipo==='evento-seguimiento'&&<div style={S.sec}><label style={S.lbl}>Acciones</label><textarea style={{...S.ta,height:'80px'}} placeholder="Acción %% Responsable" name="acc" value={s.fd.acc} onChange={hi} /></div>}

            {s.tipo==='incidente-avance'&&<div style={S.sec}>
              <div style={{marginBottom:'8px'}}><label style={S.lbl}>Acciones en Curso</label><textarea style={{...S.ta,height:'60px'}} placeholder="Acción %% Responsable" name="accCur" value={s.fd.accCur} onChange={hi} /></div>
              <div><label style={S.lbl}>Acciones Ejecutadas</label><textarea style={{...S.ta,height:'60px'}} placeholder="Acción %% Responsable" name="accEj" value={s.fd.accEj} onChange={hi} /></div>
            </div>}

            {s.tipo.endsWith('-fin')&&!s.multServ&&!s.multEnc&&!s.multAler&&<div style={S.sec}>
              <div style={S.g2}>
                <div><label style={S.lbl}>F.Ini</label><input type="date" style={{...S.inp,...(s.errFecha?S.inpE:{})}} name="fiF" value={s.fd.fiF} onChange={hi} /></div>
                <div><label style={S.lbl}>H.Ini</label><input type="time" step="1" style={{...S.inp,...(s.errFecha?S.inpE:{})}} name="hiF" value={s.fd.hiF} onChange={hi} /></div>
                <div><label style={S.lbl}>F.Fin</label><input type="date" style={{...S.inp,...(s.errFecha?S.inpE:{})}} name="ff" value={s.fd.ff} onChange={hi} />
                  {s.errFecha&&<div style={S.errB}><div style={{fontSize:'11px',color:'#fca5a5'}}>{s.errFecha}</div>{s.sugFecha.map((sg,i)=><button key={i} onClick={()=>aplSugF(sg.f,sg.h)} style={S.fixB}>{sg.t}</button>)}</div>}
                </div>
                <div><label style={S.lbl}>H.Fin</label><input type="time" step="1" style={{...S.inp,...(s.errFecha?S.inpE:{})}} name="hf" value={s.fd.hf} onChange={hi} /></div>
              </div>
              <div style={{...S.durD,marginTop:'8px'}}>{s.fd.durCalc}</div>
            </div>}

            {(s.tipo==='evento-fin'||s.tipo==='incidente-fin')&&<div style={S.sec}><label style={S.lbl}>Acciones Ejecutadas</label><textarea style={{...S.ta,height:'80px'}} placeholder="Acción %% Responsable" name={s.tipo==='evento-fin'?'acc':'accEj'} value={s.tipo==='evento-fin'?s.fd.acc:s.fd.accEj} onChange={hi} /></div>}

            <div style={S.sec}><label style={S.lbl}>Nota</label>
              {s.tipo==='evento-fin'&&<div style={{fontSize:'10px',color:'#475569',marginBottom:'4px',padding:'4px 8px',background:'#0a1020',border:'1px solid #1e293b',borderRadius:'3px'}}>Indica acción de recuperación</div>}
              <textarea style={{...S.ta,height:'50px'}} placeholder="Observaciones" name="nota" value={s.fd.nota} onChange={hi} />
            </div>

            <B p onClick={gen} dis={s.errFecha?.includes('Error')} style={{width:'100%',marginTop:'12px',padding:'10px'}}>⚡ Generar</B>
          </div>

          <div style={S.card}>
            <div style={{...S.fb,marginBottom:'8px'}}><span style={S.lbl}>Resultado</span><div style={S.fx}><B sm p onClick={copy}>📋 Copiar</B><B sm onClick={limpi}>🗑 Limpiar</B></div></div>
            <pre style={S.pre}>{s.res||'El mensaje aparecerá aquí...'}</pre>
          </div>
        </div>
      </div>
    </div>

    {toast&&<div style={S.toast}>{toast}</div>}

    {showSync&&<div style={S.ov}><div style={S.mod}>
      <div style={{fontWeight:700,color:'#e2e8f0',marginBottom:'8px'}}>Sincronización</div>
      <div style={{color:'#94a3b8',fontSize:'12px',marginBottom:'12px'}}>Tiempo: {cTA().h}h {cTA().m}m</div>
      <div style={S.fx}><B p onClick={sync}>Sincronizar</B><B onClick={()=>setShowSync(false)}>Más tarde</B></div>
      <button onClick={()=>{setNoPr(true);setShowSync(false);}} style={{background:'none',border:'none',color:'#475569',fontSize:'10px',marginTop:'8px',cursor:'pointer'}}>No preguntar más</button>
    </div></div>}

    {showDurConf&&<div style={S.ov}><div style={{...S.mod,borderColor:'#ca8a04'}}>
      <div style={{fontWeight:700,color:'#facc15',marginBottom:'8px'}}>⚠️ Duración &gt; 4h</div>
      <div style={{color:'#e2e8f0',fontSize:'18px',fontFamily:'monospace',fontWeight:700,marginBottom:'8px'}}>{s.multAler?durTot():s.fd.durCalc}</div>
      <div style={S.fx}><B p onClick={()=>{setShowDurConf(false);genInt();}}>Confirmar</B><B onClick={()=>setShowDurConf(false)}>Revisar</B></div>
    </div></div>}

    {s.showErrFecha&&<div style={S.ov}><div style={{...S.mod,borderColor:'#dc2626'}}>
      <div style={{fontWeight:700,color:'#ef4444',marginBottom:'8px',fontSize:'16px'}}>🚨 Error Temporal</div>
      <div style={{color:'#fca5a5',fontSize:'12px',marginBottom:'12px',whiteSpace:'pre-line'}}>{s.errFecha}</div>
      {s.sugFecha.length>0&&<div style={{marginBottom:'12px'}}>
        <div style={{color:'#94a3b8',fontSize:'11px',fontWeight:600,marginBottom:'6px'}}>Correcciones:</div>
        {s.sugFecha.map((sg,i)=><button key={i} onClick={()=>{
          if(sg.f&&sg.h)aplSugF(sg.f,sg.h);
          else{const ini=new Date(`${s.fd.fiF}T${s.fd.hiF}`);ini.setHours(ini.getHours()+1);sf('ff',s.fd.fiF);sf('hf',ini.toTimeString().split(' ')[0]);up({errFecha:'',sugFecha:[],showErrFecha:false});tt('Corregido');}
        }} style={{...S.fixB,marginBottom:'4px'}}>{sg.t}</button>)}
      </div>}
      <B onClick={()=>up({showErrFecha:false})} style={{width:'100%'}}>Revisar Manualmente</B>
    </div></div>}
    </div>
  );
}
