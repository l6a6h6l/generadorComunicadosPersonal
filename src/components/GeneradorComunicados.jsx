import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB0MbEvWt5WMPID2OvaZXFu_Br0M07IZsY",
  authDomain: "comunicados-herreralara.firebaseapp.com",
  projectId: "comunicados-herreralara",
  storageBucket: "comunicados-herreralara.firebasestorage.app",
  messagingSenderId: "460478649899",
  appId: "1:460478649899:web:12304877d1e3cf5c8b3c6e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const USUARIOS_VALIDOS = [
  { usuario: 'luishl', password: 'luistbane' },
  { usuario: 'fractalia', password: 'fractalia4ever' }
];

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
    const h = Math.floor(d/3600000), m = Math.floor((d%3600000)/60000), sc = Math.floor((d%60000)/1000);
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sc).padStart(2,'0')}`;
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
    svcSel: [], busq: '', showSvc: false, autoFill: false, svcInit: false, bloquear: false,
    loadedRegId: null, loadedRegTipo: null
  };
};

// ─── Clean Design System ───
const c = {
  bg: '#0a0e17',
  surface: '#111827',
  surfaceAlt: '#0d1220',
  border: '#1f2937',
  borderLight: '#374151',
  text: '#e5e7eb',
  textMuted: '#9ca3af',
  textDim: '#6b7280',
  accent: '#3b82f6',
  green: '#22c55e',
  red: '#ef4444',
  amber: '#f59e0b',
  greenDim: '#166534',
  redDim: '#991b1b',
};

const S = {
  bg: { background: c.bg, color: c.text, minHeight: '100vh', fontFamily: '"IBM Plex Sans",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif', fontSize: '13px' },
  ct: { maxWidth: '1200px', margin: '0 auto', padding: '12px' },
  card: { background: c.surface, border: `1px solid ${c.border}`, borderRadius: '8px', padding: '16px', marginBottom: '10px' },
  inp: { width: '100%', padding: '8px 10px', background: c.surfaceAlt, border: `1px solid ${c.border}`, borderRadius: '6px', color: c.text, fontSize: '13px', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' },
  inpE: { borderColor: c.red },
  lbl: { display: 'block', marginBottom: '4px', fontSize: '11px', fontWeight: 600, color: c.textDim, textTransform: 'uppercase', letterSpacing: '0.5px' },
  btn: { padding: '7px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '12px', transition: 'opacity 0.15s' },
  bP: { background: c.accent, color: '#fff' },
  bS: { background: c.border, color: c.textMuted },
  bD: { background: c.redDim, color: '#fca5a5' },
  bSm: { padding: '4px 10px', fontSize: '11px' },
  bT: (a, col) => ({ padding: '6px 12px', borderRadius: '6px', border: a?`1px solid ${col}`:`1px solid ${c.border}`, background: a?col+'18':'transparent', color: a?col:c.textDim, cursor: 'pointer', fontWeight: 600, fontSize: '11px', transition: 'all 0.15s' }),
  g2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' },
  g3: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' },
  fx: { display: 'flex', alignItems: 'center', gap: '8px' },
  fb: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  ta: { width: '100%', padding: '8px 10px', background: c.surfaceAlt, border: `1px solid ${c.border}`, borderRadius: '6px', color: c.text, fontSize: '13px', resize: 'vertical', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' },
  pre: { whiteSpace: 'pre-wrap', fontFamily: '"IBM Plex Mono","Fira Code",monospace', fontSize: '12px', color: '#d1d5db', background: '#060a12', padding: '14px', borderRadius: '6px', border: `1px solid ${c.border}`, minHeight: '100px' },
  toast: { position: 'fixed', bottom: 16, right: 16, background: c.surface, border: `1px solid ${c.borderLight}`, color: c.text, padding: '10px 18px', borderRadius: '8px', fontSize: '12px', zIndex: 999, fontWeight: 600, boxShadow: '0 4px 24px rgba(0,0,0,0.4)' },
  ov: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' },
  mod: { background: c.surface, border: `1px solid ${c.borderLight}`, borderRadius: '12px', padding: '24px', maxWidth: '420px', width: '90%' },
  sv: (a) => ({ width: '100%', textAlign: 'left', padding: '6px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 500, border: a?`1px solid ${c.accent}`:`1px solid ${c.border}`, background: a?c.accent+'14':'transparent', color: a?'#93c5fd':c.textMuted, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.12s' }),
  tag: { fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 },
  sec: { marginTop: '14px', paddingTop: '12px', borderTop: `1px solid ${c.border}` },
  chk: { display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 10px', background: c.surfaceAlt, border: `1px solid ${c.border}`, borderRadius: '6px', cursor: 'pointer', fontSize: '12px', color: c.textMuted },
  sub: { background: c.surfaceAlt, border: `1px solid ${c.border}`, borderRadius: '6px', padding: '10px', marginBottom: '6px' },
  durD: { textAlign: 'center', padding: '12px', background: c.surfaceAlt, borderRadius: '6px', fontSize: '26px', fontWeight: 700, color: '#f9fafb', fontFamily: '"IBM Plex Mono",monospace', letterSpacing: '2px' },
  errB: { background: '#1c0a0a', border: `1px solid ${c.redDim}`, borderRadius: '6px', padding: '8px', marginTop: '6px' },
  fixB: { width: '100%', textAlign: 'left', padding: '6px 10px', background: '#071a0e', border: `1px solid ${c.greenDim}`, borderRadius: '6px', color: '#86efac', cursor: 'pointer', fontSize: '11px', fontWeight: 500, marginTop: '4px' },
  tab: (a) => ({ padding: '7px 14px', borderRadius: '6px 6px 0 0', border: `1px solid ${a?c.borderLight:c.border}`, borderBottom: a?`2px solid ${c.accent}`:`1px solid ${c.border}`, background: a?c.surface:'transparent', color: a?c.text:c.textDim, cursor: 'pointer', fontWeight: 600, fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px', position: 'relative', marginBottom: '-1px', zIndex: a?2:1, flexShrink: 0, transition: 'all 0.12s' }),
  tabBar: { display: 'flex', alignItems: 'flex-end', gap: '2px', borderBottom: `1px solid ${c.border}`, marginBottom: '10px', overflowX: 'auto', paddingBottom: 0 },
  tabX: { background: 'none', border: 'none', color: c.textDim, cursor: 'pointer', fontSize: '14px', padding: '0 2px', lineHeight: 1 },
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

  const [dbEventos, setDbEventos] = useState([]);
  const [dbMants, setDbMants] = useState([]);
  const [showHist, setShowHist] = useState(false);
  const [histBusq, setHistBusq] = useState('');
  const [fbLoading, setFbLoading] = useState(true);

  const s = sess.find(x => x.id === actId) || sess[0];
  const up = useCallback((u) => setSess(p => p.map(x => x.id === actId ? (typeof u === 'function' ? u(x) : { ...x, ...u }) : x)), [actId]);
  const tt = (m) => { setToast(m); setTimeout(() => setToast(''), 3000); };

  const login = () => {
    if (USUARIOS_VALIDOS.find(u => u.usuario === lf.u && u.password === lf.p)) { setAuth(true); setLErr(''); }
    else { setLErr('Credenciales incorrectas'); setTimeout(() => setLErr(''), 3000); }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const evSnap = await getDocs(collection(db, 'eventos'));
        const evData = evSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setDbEventos(evData);
        const mtSnap = await getDocs(collection(db, 'mantenimientos'));
        const mtData = mtSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setDbMants(mtData);
      } catch (e) { console.error('Error cargando Firebase:', e); }
      setFbLoading(false);
    };
    loadData();
  }, []);

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
      const cc = s.tipo.startsWith('mantenimiento-') ? 'impM' : 'imp';
      up(x => ({ ...x, fd: { ...x.fd, [cc]: imps } }));
    }
  }, [s.svcSel, s.autoFill, s.tipo]);

  useEffect(() => { if (s.tipo.endsWith('-fin')) valDates(); }, [s.fd.fiF, s.fd.hiF, s.fd.ff, s.fd.hf, s.tipo]);

  const cTA = () => { const d = Date.now()-tAb; return { h: Math.floor(d/3600000), m: Math.floor((d%3600000)/60000), t: d/3600000 }; };
  const sem = () => { const { t } = cTA(); if (t<1) return { e:'SYNC',c:c.green }; if (t<4) return { e:'REVISAR',c:c.amber }; return { e:'DESYNC',c:c.red }; };

  const sync = () => {
    const { f, h } = now();
    up(x => ({ ...x, fd:{...x.fd,fi:f,hi:h,fiF:f,hiF:h,ff:f,hf:h}, periodos:[{fi:f,hi:h,ff:f,hf:h,dur:'00:00:00'}], servAler:[{n:'',fi:f,hi:h,ff:f,hf:h,dur:'00:00:00',err:'',sug:[]}], servEnc:[{tipo:'Variable General',custom:'',fi:f,hi:h,ff:f,hf:h,dur:'00:00:00',enc:''}] }));
    setTAb(Date.now()); setShowSync(false); tt('Sincronizado');
  };

  const limpi = () => {
    const { f, h } = now();
    up(x => ({ ...x, fd:{...x.fd,desc:'',imp:'',esc:'',mot:'',impM:'',ejec:'',acc:'',accEj:'',accCur:'',nota:'',fi:f,hi:h,fiF:f,hiF:h,ff:f,hf:h,durCalc:'00:00:00'}, multAler:false,multServ:false,multEnc:false,errFecha:'',showErrFecha:false,sugFecha:[],svcSel:[],autoFill:false,svcInit:false,bloquear:false,loadedRegId:null,loadedRegTipo:null,periodos:[{fi:f,hi:h,ff:f,hf:h,dur:'00:00:00'}],servAler:[{n:'',fi:f,hi:h,ff:f,hf:h,dur:'00:00:00',err:'',sug:[]}],servEnc:[{tipo:'Variable General',custom:'',fi:f,hi:h,ff:f,hf:h,dur:'00:00:00',enc:''}],res:'' }));
    tt('Limpiado');
  };

  const sf = (k,v) => up(x => ({ ...x, fd:{...x.fd,[k]:v} }));

  // ═══════════════════════════════════════════════════════════════
  // FIX: Auto-set date to TODAY when user changes a time field
  // ═══════════════════════════════════════════════════════════════
  const hi = (e) => {
    const { name, value } = e.target;
    const { f } = now();

    // Map: when a time field changes, also set its corresponding date to today
    const timeToDateMap = {
      'hi': 'fi',     // hora inicio → fecha inicio
      'hf': 'ff',     // hora fin → fecha fin
      'hiF': 'fiF',   // hora inicio (fin mode) → fecha inicio (fin mode)
    };

    if (timeToDateMap[name]) {
      const dateField = timeToDateMap[name];
      up(x => ({ ...x, fd: { ...x.fd, [name]: value, [dateField]: f } }));
    } else {
      sf(name, value);
    }
  };

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

  // ═══════════════════════════════════════════════════════════════
  // FIX: Auto-set date on time change for service alerts
  // ═══════════════════════════════════════════════════════════════
  const updSA = (i,k,v) => {
    up(x => ({ ...x, servAler: x.servAler.map((sa,j) => {
      if (j!==i) return sa;
      const ns = { ...sa, [k]:v };
      // Auto-set date when time changes
      const { f } = now();
      if (k === 'hi') ns.fi = f;
      if (k === 'hf') ns.ff = f;

      if (ns.fi&&ns.hi&&ns.ff&&ns.hf) {
        try {
          const a = new Date(`${ns.fi}T${ns.hi}`), b = new Date(`${ns.ff}T${ns.hf}`);
          if (b<a) { const dH=Math.abs((b-a)/3600000),dD=Math.abs((b-a)/86400000); ns.err=`${ns.n||`#${i+1}`}: Fin ${dD>=1?dD.toFixed(0)+'d':dH.toFixed(1)+'h'} antes inicio`; const{f:nf,h:nh}=now(); ns.sug=[{t:`Actual: ${fmt(nf)} ${nh}`,f:nf,h:nh},{t:'Inicio+1h',f:ns.fi,h:null}]; ns.dur='ERROR'; }
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

  // ═══════════════════════════════════════════════════════════════
  // FIX: Auto-set date on time change for periods
  // ═══════════════════════════════════════════════════════════════
  const addP = () => { const{f,h}=now(); up(x => ({ ...x, periodos:[...x.periodos,{fi:f,hi:h,ff:f,hf:h,dur:'00:00:00'}] })); };
  const rmP = (i) => up(x => ({ ...x, periodos: x.periodos.length>1?x.periodos.filter((_,j)=>j!==i):x.periodos }));
  const updP = (i,k,v) => up(x => ({ ...x, periodos: x.periodos.map((p,j) => {
    if(j!==i) return p;
    const np={...p,[k]:v};
    // Auto-set date when time changes
    const { f } = now();
    if (k === 'hi') np.fi = f;
    if (k === 'hf') np.ff = f;
    if(np.fi&&np.hi&&np.ff&&np.hf) np.dur=dur(np.fi,np.hi,np.ff,np.hf);
    return np;
  }) }));

  // ═══════════════════════════════════════════════════════════════
  // FIX: Auto-set date on time change for encolamientos
  // ═══════════════════════════════════════════════════════════════
  const addSE = () => { const{f,h}=now(); up(x => ({ ...x, servEnc:[...x.servEnc,{tipo:'Variable General',custom:'',fi:f,hi:h,ff:f,hf:h,dur:'00:00:00',enc:''}] })); };
  const rmSE = (i) => up(x => ({ ...x, servEnc: x.servEnc.length>1?x.servEnc.filter((_,j)=>j!==i):x.servEnc }));
  const updSE = (i,k,v) => up(x => ({ ...x, servEnc: x.servEnc.map((se,j) => {
    if(j!==i) return se;
    const ns={...se,[k]:v};
    const { f } = now();
    if (k === 'hi') ns.fi = f;
    if (k === 'hf') ns.ff = f;
    if(ns.fi&&ns.hi&&ns.ff&&ns.hf) ns.dur=dur(ns.fi,ns.hi,ns.ff,ns.hf);
    return ns;
  }) }));

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
    let r='Períodos de Alertamiento:';
    s.periodos.forEach((p,i)=>{r+=`\n        Período ${i+1}:\n        Inicio: ${fmt(p.fi)} - ${p.hi}`;if(i<s.periodos.length-1)r+='\n';});
    return r;
  };

  const fmtImp = (v,d) => { const x=v||d; const ls=x.split('\n').filter(l=>l.trim()); if(ls.length<=1) return `Impacto: ${x}`; let r="Impacto:"; ls.forEach(l=>{if(l.trim())r+=`\n        • ${l.trim()}`;}); return r; };
  const fmtAcc = (t,l) => { if(!t?.trim())return''; let r=`\n${l}:`; t.split('\n').forEach(ln=>{const x=ln.trim();if(x){if(x.includes('%%')){const[a,rp]=x.split('%%').map(ss=>ss.trim());r+=`\n        • ${a}`;if(rp)r+=`\n          Responsable: ${rp}`;}else r+=`\n        • ${x}`;}}); return r; };
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

  const guardarEnHistorial = async () => {
    const fd = s.fd;
    try {
      if (s.tipo.startsWith('mantenimiento-')) {
        if (!fd.mot?.trim()) { tt('Motivo vacío, nada que guardar'); return; }
        const existe = dbMants.find(x => x.motivo.toLowerCase() === fd.mot.trim().toLowerCase());
        if (existe) {
          const updated = { impacto: fd.impM || existe.impacto, ejecutor: fd.ejec || existe.ejecutor, usos: (existe.usos || 0) + 1, ultimoUso: Date.now() };
          await updateDoc(doc(db, 'mantenimientos', existe.id), updated);
          setDbMants(p => p.map(x => x.id === existe.id ? { ...x, ...updated } : x));
          tt('Mantenimiento actualizado ✓');
        } else {
          const nuevo = { motivo: fd.mot.trim(), impacto: fd.impM || '', ejecutor: fd.ejec || '', usos: 1, creadoEn: Date.now(), ultimoUso: Date.now() };
          const docRef = await addDoc(collection(db, 'mantenimientos'), nuevo);
          setDbMants(p => [...p, { id: docRef.id, ...nuevo }]);
          tt('Mantenimiento guardado ✓');
        }
      } else {
        if (!fd.desc?.trim()) { tt('Descripción vacía, nada que guardar'); return; }
        const cat = s.tipo.startsWith('incidente-') ? 'incidente' : 'evento';
        const existe = dbEventos.find(x => x.descripcion.toLowerCase() === fd.desc.trim().toLowerCase());
        if (existe) {
          const updated = { impacto: fd.imp || existe.impacto, escaladoA: fd.esc || existe.escaladoA, tipo: cat, usos: (existe.usos || 0) + 1, ultimoUso: Date.now() };
          await updateDoc(doc(db, 'eventos', existe.id), updated);
          setDbEventos(p => p.map(x => x.id === existe.id ? { ...x, ...updated } : x));
          tt('Evento actualizado ✓');
        } else {
          const nuevo = { descripcion: fd.desc.trim(), impacto: fd.imp || '', escaladoA: fd.esc || '', tipo: cat, usos: 1, creadoEn: Date.now(), ultimoUso: Date.now() };
          const docRef = await addDoc(collection(db, 'eventos'), nuevo);
          setDbEventos(p => [...p, { id: docRef.id, ...nuevo }]);
          tt('Evento guardado ✓');
        }
      }
    } catch (e) { console.error(e); tt('Error al guardar'); }
  };

  const cargarDesdeHistorial = async (reg) => {
    try {
      if (showHist === 'mant') {
        up(x => ({ ...x, fd: { ...x.fd, mot: reg.motivo, impM: reg.impacto, ejec: reg.ejecutor }, loadedRegId: reg.id, loadedRegTipo: 'mant' }));
        const updated = { usos: (reg.usos || 0) + 1, ultimoUso: Date.now() };
        await updateDoc(doc(db, 'mantenimientos', reg.id), updated);
        setDbMants(p => p.map(x => x.id === reg.id ? { ...x, ...updated } : x));
      } else {
        up(x => ({ ...x, fd: { ...x.fd, desc: reg.descripcion, imp: reg.impacto, esc: reg.escaladoA }, loadedRegId: reg.id, loadedRegTipo: 'evento' }));
        const updated = { usos: (reg.usos || 0) + 1, ultimoUso: Date.now() };
        await updateDoc(doc(db, 'eventos', reg.id), updated);
        setDbEventos(p => p.map(x => x.id === reg.id ? { ...x, ...updated } : x));
      }
      setShowHist(false); setHistBusq(''); tt('Cargado ✓');
    } catch (e) { console.error(e); tt('Error al cargar'); }
  };

  const eliminarDeHistorial = async (id) => {
    try {
      if (showHist === 'mant') {
        await deleteDoc(doc(db, 'mantenimientos', id));
        setDbMants(p => p.filter(x => x.id !== id));
      } else {
        await deleteDoc(doc(db, 'eventos', id));
        setDbEventos(p => p.filter(x => x.id !== id));
      }
      tt('Eliminado');
    } catch (e) { console.error(e); tt('Error al eliminar'); }
  };

  const actualizarRegistro = async () => {
    if (!s.loadedRegId) { tt('Carga un registro primero'); return; }
    const fd = s.fd;
    try {
      if (s.loadedRegTipo === 'mant') {
        const updated = { motivo: fd.mot?.trim(), impacto: fd.impM || '', ejecutor: fd.ejec || '', ultimoUso: Date.now() };
        await updateDoc(doc(db, 'mantenimientos', s.loadedRegId), updated);
        setDbMants(p => p.map(x => x.id === s.loadedRegId ? { ...x, ...updated } : x));
      } else {
        const updated = { descripcion: fd.desc?.trim(), impacto: fd.imp || '', escaladoA: fd.esc || '', ultimoUso: Date.now() };
        await updateDoc(doc(db, 'eventos', s.loadedRegId), updated);
        setDbEventos(p => p.map(x => x.id === s.loadedRegId ? { ...x, ...updated } : x));
      }
      tt('Registro actualizado ✓');
    } catch (e) { console.error(e); tt('Error al actualizar'); }
  };

  const histFiltrado = () => {
    const src = showHist === 'mant' ? dbMants : dbEventos;
    const q = histBusq.toLowerCase();
    const filtered = q ? src.filter(x => {
      const campo = showHist === 'mant' ? x.motivo : x.descripcion;
      return campo.toLowerCase().includes(q) || (x.escaladoA || '').toLowerCase().includes(q) || (x.ejecutor || '').toLowerCase().includes(q);
    }) : src;
    return [...filtered].sort((a, b) => (b.usos||0) - (a.usos||0) || (b.ultimoUso||0) - (a.ultimoUso||0));
  };

  const svcF = SERVICIOS_TRANSACCIONALES.filter(x => x.nombre.toLowerCase().includes(s.busq.toLowerCase())||x.descripcion.toLowerCase().includes(s.busq.toLowerCase()));

  // ─── Google Font ───
  const fontLink = (
    <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
  );

  if (!auth) return (
    <>
      {fontLink}
      <div style={{...S.bg,display:'flex',alignItems:'center',justifyContent:'center'}}>
        <div style={{...S.card,width:'360px',padding:'32px'}}>
          <div style={{textAlign:'center',marginBottom:'24px'}}>
            <div style={{width:'48px',height:'48px',borderRadius:'12px',background:`linear-gradient(135deg, ${c.accent}, #6366f1)`,margin:'0 auto 12px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px'}}>⚡</div>
            <div style={{fontSize:'16px',fontWeight:700,color:c.text}}>Comunicados</div>
            <div style={{fontSize:'11px',color:c.textDim,marginTop:'4px'}}>Service Desk — Diners Club Ecuador</div>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
            <div><label style={S.lbl}>Usuario</label><input style={S.inp} value={lf.u} onChange={e=>setLf(p=>({...p,u:e.target.value}))} placeholder="Usuario" /></div>
            <div><label style={S.lbl}>Contraseña</label>
              <div style={{position:'relative'}}>
                <input style={{...S.inp,paddingRight:'36px'}} type={showPw?'text':'password'} value={lf.p} onChange={e=>setLf(p=>({...p,p:e.target.value}))} placeholder="Contraseña" onKeyDown={e=>e.key==='Enter'&&login()} />
                <button onClick={()=>setShowPw(!showPw)} style={{position:'absolute',right:'8px',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:c.textDim,cursor:'pointer',fontSize:'12px'}}>{showPw?'🙈':'👁'}</button>
              </div>
            </div>
            {lErr && <div style={{...S.errB,textAlign:'center'}}><span style={{fontSize:'12px',color:'#fca5a5'}}>{lErr}</span></div>}
            <B p onClick={login} style={{width:'100%',padding:'10px',borderRadius:'8px'}}>Iniciar Sesión</B>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {fontLink}
      <div style={S.bg}><div style={S.ct}>
        {/* Header */}
        <div style={{...S.card,...S.fb,padding:'10px 16px',borderRadius:'10px'}}>
          <div style={S.fx}>
            <div style={{width:'28px',height:'28px',borderRadius:'7px',background:`linear-gradient(135deg, ${c.accent}, #6366f1)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'13px',flexShrink:0}}>⚡</div>
            <div>
              <span style={{fontSize:'14px',fontWeight:700,color:c.text}}>Comunicados</span>
              <span style={{fontSize:'10px',color:c.textDim,marginLeft:'8px'}}>v7.1</span>
            </div>
          </div>
          <div style={S.fx}>
            <span style={{...S.tag,background:sem().c+'18',color:sem().c,border:`1px solid ${sem().c}33`,borderRadius:'6px',padding:'3px 8px'}}>{sem().e} {cTA().h}h{cTA().m}m</span>
            <button onClick={sync} style={{...S.btn,...S.bSm,...S.bS,borderRadius:'6px'}}>⟳</button>
            <button onClick={()=>up(x=>({...x,modoBLU:!x.modoBLU}))} style={{...S.btn,...S.bSm,borderRadius:'6px',background:s.modoBLU?c.accent+'22':'transparent',color:s.modoBLU?'#93c5fd':c.textDim,border:`1px solid ${s.modoBLU?c.accent:c.border}`}}>BLU {s.modoBLU?'ON':'OFF'}</button>
            <button onClick={()=>{setAuth(false);setLf({u:'',p:''});}} style={{...S.btn,...S.bSm,...S.bS,borderRadius:'6px',color:c.textDim}}>Salir</button>
          </div>
        </div>

        {/* Tabs */}
        <div style={S.tabBar}>
          {sess.map(x => {
            const tc = x.tipo.startsWith('evento-')?c.green:x.tipo.startsWith('incidente-')?c.red:c.amber;
            return (
              <div key={x.id} style={S.tab(x.id===actId)} onClick={()=>setActId(x.id)}>
                <span style={{width:'6px',height:'6px',borderRadius:'50%',background:tc,display:'inline-block',flexShrink:0}}></span>
                <span style={{maxWidth:'150px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{x.label}</span>
                {sess.length>1&&<button onClick={e=>{e.stopPropagation();rmSes(x.id);}} style={S.tabX} title="Cerrar">×</button>}
              </div>
            );
          })}
          <button onClick={addSes} style={{...S.tab(false),color:c.textDim,border:`1px dashed ${c.borderLight}`,background:'transparent'}} title="Nueva sesión">+</button>
        </div>

        {s.modoBLU && <div style={{...S.fx,marginBottom:'10px'}}>
          {['aplicacion','infraestructura','bian'].map(t=><button key={t} onClick={()=>up({tipoBLU:t})} style={S.bT(s.tipoBLU===t,c.accent)}>{t==='aplicacion'?'📱 App':t==='infraestructura'?'🖥️ Infra':'⚠️ BIAN'}</button>)}
        </div>}

        <div style={{display:'grid',gridTemplateColumns:'240px 1fr',gap:'10px'}}>
          {/* LEFT SIDEBAR */}
          <div>
            <div style={S.card}>
              <div style={{...S.lbl,marginBottom:'8px'}}>Tipo de Comunicado</div>
              <div style={{marginBottom:'10px'}}>
                <div style={{fontSize:'10px',color:c.textDim,marginBottom:'4px',fontWeight:600}}>EVENTOS</div>
                <div style={S.g3}>{['evento-inicio','evento-seguimiento','evento-fin'].map((t,i)=><button key={t} onClick={()=>selTipo(t)} style={S.bT(s.tipo===t,c.green)}>{['🟡 Ini','🔁 Seg','🟢 Fin'][i]}</button>)}</div>
              </div>
              <div style={{marginBottom:'10px'}}>
                <div style={{fontSize:'10px',color:c.textDim,marginBottom:'4px',fontWeight:600}}>MANTENIMIENTOS</div>
                <div style={S.g2}>{['mantenimiento-inicio','mantenimiento-fin'].map((t,i)=><button key={t} onClick={()=>selTipo(t)} style={S.bT(s.tipo===t,c.amber)}>{['⚠️ Ini','✅ Fin'][i]}</button>)}</div>
              </div>
              <div>
                <div style={{fontSize:'10px',color:c.textDim,marginBottom:'4px',fontWeight:600}}>INCIDENTES</div>
                <div style={S.g3}>{['incidente-inicio','incidente-avance','incidente-fin'].map((t,i)=><button key={t} onClick={()=>selTipo(t)} style={S.bT(s.tipo===t,c.red)}>{['🟡 Ini','🔁 Av','🟢 Fin'][i]}</button>)}</div>
              </div>
            </div>

            <div style={S.card}>
              <button onClick={()=>up(x=>({...x,showSvc:!x.showSvc}))} style={{...S.fb,width:'100%',background:'none',border:'none',color:c.textMuted,cursor:'pointer',padding:0}}>
                <span style={{fontSize:'11px',fontWeight:600}}>SERVICIOS {s.svcSel.length>0&&<span style={{...S.tag,background:c.accent+'22',color:'#93c5fd',borderRadius:'4px'}}>{s.svcSel.length}</span>}</span>
                <span style={{fontSize:'10px',transition:'transform 0.15s',display:'inline-block',transform:s.showSvc?'rotate(180deg)':'rotate(0)'}}> ▼</span>
              </button>
              {s.showSvc&&<div style={{marginTop:'8px'}}>
                <label style={S.chk}><input type="checkbox" checked={s.autoFill} onChange={e=>{up({autoFill:e.target.checked});tt(e.target.checked?'Auto-llenado ON':'Solo impactos');}} /><span>🚀 Auto-llenado {s.autoFill?'ON':'OFF'}</span></label>
                {s.svcSel.length>0&&<div style={{...S.fx,marginTop:'6px'}}><B sm d onClick={()=>up({svcSel:[]})}>✕ Limpiar</B>{!s.autoFill&&<B sm onClick={()=>{sf(s.tipo.startsWith('mantenimiento-')?'impM':'imp','');tt('Limpiado');}}>✕ Impactos</B>}</div>}
                <input type="text" placeholder="Buscar..." value={s.busq} onChange={e=>up({busq:e.target.value})} style={{...S.inp,marginTop:'6px',fontSize:'11px'}} />
                <div style={{marginTop:'6px',maxHeight:'340px',overflowY:'auto',display:'flex',flexDirection:'column',gap:'3px'}}>
                  {svcF.map(sv=><button key={sv.id} onClick={()=>togSvc(sv)} style={S.sv(s.svcSel.some(x=>x.id===sv.id))} title={sv.descripcion}><span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{sv.emoji} {sv.nombre}</span>{s.svcSel.some(x=>x.id===sv.id)&&<span>✓</span>}</button>)}
                </div>
              </div>}
            </div>
          </div>

          {/* RIGHT MAIN */}
          <div>
            <div style={S.card}>
              {s.modoBLU&&s.tipo.startsWith('evento-')&&<div style={{background:c.surfaceAlt,border:`1px solid ${c.border}`,borderRadius:'6px',padding:'8px 10px',marginBottom:'12px',fontSize:'11px'}}><span style={{color:c.textDim}}>Escalamiento: </span><span style={{color:c.text,fontWeight:600}}>{s.tipoBLU==='bian'?'Miguel Angel López Garavito':s.tipoBLU==='infraestructura'?'Infraestructura Cloud':'Paul Chamorro / David Albuja'}</span>{s.tipoBLU==='bian'&&<span style={{color:c.textDim,marginLeft:'8px'}}>malopez@dinersclub.com.ec</span>}</div>}

              {/* Historial Panel */}
              {showHist&&<div style={{background:'#0a0f1e',border:`1px solid ${c.accent}33`,borderRadius:'8px',padding:'14px',marginBottom:'12px'}}>
                <div style={{...S.fb,marginBottom:'8px'}}>
                  <span style={{fontSize:'12px',fontWeight:700,color:'#93c5fd'}}>📚 Historial — {showHist==='mant'?'Mantenimientos':'Eventos/Incidentes'}</span>
                  <button onClick={()=>setShowHist(false)} style={{background:'none',border:'none',color:c.textDim,cursor:'pointer',fontSize:'16px'}}>✕</button>
                </div>
                <input type="text" placeholder={showHist==='mant'?'Buscar por motivo o ejecutor...':'Buscar por descripción o escalado...'} value={histBusq} onChange={e=>setHistBusq(e.target.value)} style={{...S.inp,marginBottom:'8px',fontSize:'12px'}} />
                <div style={{maxHeight:'220px',overflowY:'auto',display:'flex',flexDirection:'column',gap:'4px'}}>
                  {fbLoading&&<div style={{textAlign:'center',padding:'16px',color:'#60a5fa',fontSize:'12px'}}>Cargando...</div>}
                  {!fbLoading&&histFiltrado().length===0&&<div style={{textAlign:'center',padding:'16px',color:c.textDim,fontSize:'12px'}}>{(showHist==='mant'?dbMants:dbEventos).length===0?'Sin registros. Usa 💾 para guardar.':'Sin resultados.'}</div>}
                  {histFiltrado().map(reg=>(
                    <div key={reg.id} onClick={()=>cargarDesdeHistorial(reg)} style={{background:c.surfaceAlt,border:`1px solid ${c.border}`,borderRadius:'6px',padding:'8px 10px',cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'8px',transition:'border-color 0.15s'}} onMouseEnter={e=>e.currentTarget.style.borderColor=c.accent} onMouseLeave={e=>e.currentTarget.style.borderColor=c.border}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:'12px',fontWeight:600,color:c.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{showHist==='mant'?reg.motivo:reg.descripcion}</div>
                        <div style={{fontSize:'10px',color:c.textDim,marginTop:'2px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{showHist==='mant'?`Ejecutor: ${reg.ejecutor||'—'}`:`Escalado: ${reg.escaladoA||'—'}`}</div>
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:'4px',flexShrink:0}}>
                        <span style={{...S.tag,background:c.accent+'22',color:'#93c5fd'}}>{reg.usos}×</span>
                        <button onClick={e=>{e.stopPropagation();eliminarDeHistorial(reg.id);}} title="Eliminar" style={{background:'none',border:'none',color:c.textDim,cursor:'pointer',fontSize:'12px',padding:'2px'}}>🗑</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>}

              {/* Evento / Incidente fields */}
              {(s.tipo.startsWith('evento-')||s.tipo.startsWith('incidente-'))&&<div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
                <div>
                  <div style={{...S.fb,marginBottom:'4px'}}><label style={{...S.lbl,marginBottom:0}}>Descripción</label>
                    <div style={S.fx}>
                      {s.loadedRegId&&s.loadedRegTipo==='evento'&&<button onClick={actualizarRegistro} style={{...S.btn,...S.bSm,background:'#1a1500',color:c.amber,border:'1px solid #854d0e',padding:'2px 8px',fontSize:'10px'}}>🔄</button>}
                      <button onClick={guardarEnHistorial} style={{...S.btn,...S.bSm,background:'#071a0e',color:'#4ade80',border:`1px solid ${c.greenDim}`,padding:'2px 8px',fontSize:'10px'}}>💾</button>
                      <button onClick={()=>{setShowHist(showHist==='evento'?false:'evento');setHistBusq('');}} style={{...S.btn,...S.bSm,background:showHist==='evento'?c.accent+'22':c.surfaceAlt,color:'#93c5fd',border:`1px solid ${c.accent}44`,padding:'2px 8px',fontSize:'10px'}}>📚 {dbEventos.length}</button>
                    </div>
                  </div>
                  <input style={S.inp} name="desc" placeholder={s.modoBLU?"Alerta CLUSTER_EKS_KB":"Descripción"} value={s.fd.desc} onChange={hi} />
                </div>
                <div><label style={S.lbl}>Impacto</label><textarea style={{...S.ta,height:'70px'}} name="imp" placeholder="Impacto" value={s.fd.imp} onChange={hi} /></div>
                <div><label style={S.lbl}>Escalado a</label>
                  {s.ultEsc&&<div style={{fontSize:'10px',color:c.amber,marginBottom:'4px',padding:'4px 8px',background:'#1a150088',border:'1px solid #42200644',borderRadius:'4px'}}>Último: {s.ultEsc}</div>}
                  <input style={S.inp} name="esc" placeholder="MAYÚSCULAS" value={s.fd.esc} onChange={e=>sf('esc',e.target.value.toUpperCase())} />
                  <div style={{...S.fb,marginTop:'4px'}}><span style={{fontSize:'10px',color:c.textDim}}>Auto MAYÚSCULAS</span><label style={{fontSize:'10px',color:c.textDim,display:'flex',alignItems:'center',gap:'4px',cursor:'pointer'}}><input type="checkbox" checked={s.autoLimpEsc} onChange={e=>up({autoLimpEsc:e.target.checked})} />Auto-limpiar</label></div>
                </div>
              </div>}

              {/* Mantenimiento fields */}
              {s.tipo.startsWith('mantenimiento-')&&<div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
                <div>
                  <div style={{...S.fb,marginBottom:'4px'}}><label style={{...S.lbl,marginBottom:0}}>Motivo</label>
                    <div style={S.fx}>
                      {s.loadedRegId&&s.loadedRegTipo==='mant'&&<button onClick={actualizarRegistro} style={{...S.btn,...S.bSm,background:'#1a1500',color:c.amber,border:'1px solid #854d0e',padding:'2px 8px',fontSize:'10px'}}>🔄</button>}
                      <button onClick={guardarEnHistorial} style={{...S.btn,...S.bSm,background:'#071a0e',color:'#4ade80',border:`1px solid ${c.greenDim}`,padding:'2px 8px',fontSize:'10px'}}>💾</button>
                      <button onClick={()=>{setShowHist(showHist==='mant'?false:'mant');setHistBusq('');}} style={{...S.btn,...S.bSm,background:showHist==='mant'?c.accent+'22':c.surfaceAlt,color:'#93c5fd',border:`1px solid ${c.accent}44`,padding:'2px 8px',fontSize:'10px'}}>📚 {dbMants.length}</button>
                    </div>
                  </div>
                  <input style={S.inp} name="mot" placeholder="Descripción del mantenimiento" value={s.fd.mot} onChange={hi} />
                </div>
                <div><label style={S.lbl}>Impacto</label><textarea style={{...S.ta,height:'70px'}} name="impM" placeholder="Impacto" value={s.fd.impM} onChange={hi} /></div>
                <div><label style={S.lbl}>Ejecutor</label><input style={S.inp} name="ejec" placeholder="Proveedor/área" value={s.fd.ejec} onChange={hi} /></div>
              </div>}

              {/* Options */}
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

              {/* Multi-service alerts */}
              {s.multServ&&(s.tipo.includes('-inicio')||s.tipo.includes('-fin'))&&<div style={S.sec}>
                <div style={{...S.fb,marginBottom:'8px'}}><span style={S.lbl}>Servicios Alertados</span><B sm p onClick={addSA}>+ Agregar</B></div>
                {s.servAler.map((sa,i)=><div key={i} style={{...S.sub,borderColor:sa.err?c.redDim:c.border}}>
                  <div style={{...S.fb,marginBottom:'6px'}}><span style={{fontSize:'11px',fontWeight:600,color:c.textDim}}>#{i+1}</span>{s.servAler.length>1&&<button onClick={()=>rmSA(i)} style={{background:'none',border:'none',color:c.red,cursor:'pointer'}}>✕</button>}</div>
                  <input style={{...S.inp,marginBottom:'6px'}} placeholder="Nombre" value={sa.n} onChange={e=>updSA(i,'n',e.target.value)} />
                  <div style={S.g2}>
                    <div><label style={{...S.lbl,fontSize:'10px'}}>F.Ini</label><input type="date" value={sa.fi} onChange={e=>updSA(i,'fi',e.target.value)} style={{...S.inp,fontSize:'11px'}} /></div>
                    <div><label style={{...S.lbl,fontSize:'10px'}}>H.Ini</label><input type="time" step="1" value={sa.hi} onChange={e=>updSA(i,'hi',e.target.value)} style={{...S.inp,fontSize:'11px'}} /></div>
                    {s.tipo.endsWith('-fin')&&<>
                      <div><label style={{...S.lbl,fontSize:'10px'}}>F.Fin</label><input type="date" value={sa.ff} onChange={e=>updSA(i,'ff',e.target.value)} style={{...S.inp,...(sa.err?S.inpE:{}),fontSize:'11px'}} /></div>
                      <div><label style={{...S.lbl,fontSize:'10px'}}>H.Fin</label><input type="time" step="1" value={sa.hf} onChange={e=>updSA(i,'hf',e.target.value)} style={{...S.inp,...(sa.err?S.inpE:{}),fontSize:'11px'}} /></div>
                      <div style={{gridColumn:'1/-1',textAlign:'center',padding:'6px',background:sa.err?'#1c0a0a':c.surfaceAlt,borderRadius:'4px',fontSize:'13px',fontWeight:600,fontFamily:'"IBM Plex Mono",monospace',color:sa.err?'#fca5a5':'#d4d4d4'}}>{sa.dur}</div>
                    </>}
                  </div>
                  {sa.err&&<div style={S.errB}><div style={{fontSize:'11px',color:'#fca5a5'}}>{sa.err}</div>{sa.sug?.map((sg,si)=><button key={si} onClick={()=>aplSugSA(i,sg.f,sg.h)} style={S.fixB}>{sg.t}</button>)}</div>}
                </div>)}
              </div>}

              {/* Encolamientos */}
              {s.multEnc&&<div style={S.sec}>
                <div style={{...S.fb,marginBottom:'8px'}}><span style={S.lbl}>Encolamientos</span><B sm p onClick={addSE}>+ Agregar</B></div>
                {s.servEnc.map((se,i)=><div key={i} style={S.sub}>
                  <div style={{...S.fb,marginBottom:'6px'}}><span style={{fontSize:'11px',color:c.textDim}}>#{i+1}</span>{s.servEnc.length>1&&<button onClick={()=>rmSE(i)} style={{background:'none',border:'none',color:c.red,cursor:'pointer'}}>✕</button>}</div>
                  <select value={se.tipo} onChange={e=>updSE(i,'tipo',e.target.value)} style={{...S.inp,marginBottom:'4px'}}>{OPCIONES_ENCOLAMIENTO.map(o=><option key={o} value={o}>{o}</option>)}<option value="Otro">Otro</option></select>
                  {se.tipo==='Otro'&&<input style={{...S.inp,marginBottom:'4px'}} placeholder="Especificar" value={se.custom} onChange={e=>updSE(i,'custom',e.target.value)} />}
                  <input type="number" style={S.inp} placeholder="Cantidad" value={se.enc} onChange={e=>updSE(i,'enc',e.target.value)} />
                </div>)}
              </div>}

              {/* Multi-period */}
              {s.multAler&&!s.multServ&&!s.multEnc&&<div style={S.sec}>
                <div style={{...S.fb,marginBottom:'8px'}}><span style={S.lbl}>Períodos {s.tipo.endsWith('-fin')?'':'(Inicio)'}</span><B sm p onClick={addP}>+ Agregar</B></div>
                {s.periodos.map((p,i)=><div key={i} style={S.sub}>
                  <div style={{...S.fb,marginBottom:'6px'}}><span style={{fontSize:'11px',color:c.textDim}}>P{i+1}</span>{s.periodos.length>1&&<button onClick={()=>rmP(i)} style={{background:'none',border:'none',color:c.red,cursor:'pointer'}}>✕</button>}</div>
                  <div style={S.g2}>
                    <div><label style={{...S.lbl,fontSize:'10px'}}>F.Ini</label><input type="date" value={p.fi} onChange={e=>updP(i,'fi',e.target.value)} style={{...S.inp,fontSize:'11px'}} /></div>
                    <div><label style={{...S.lbl,fontSize:'10px'}}>H.Ini</label><input type="time" step="1" value={p.hi} onChange={e=>updP(i,'hi',e.target.value)} style={{...S.inp,fontSize:'11px'}} /></div>
                    {s.tipo.endsWith('-fin')&&<>
                      <div><label style={{...S.lbl,fontSize:'10px'}}>F.Fin</label><input type="date" value={p.ff} onChange={e=>updP(i,'ff',e.target.value)} style={{...S.inp,fontSize:'11px'}} /></div>
                      <div><label style={{...S.lbl,fontSize:'10px'}}>H.Fin</label><input type="time" step="1" value={p.hf} onChange={e=>updP(i,'hf',e.target.value)} style={{...S.inp,fontSize:'11px'}} /></div>
                      <div style={{gridColumn:'1/-1',textAlign:'center',padding:'4px',background:c.surfaceAlt,borderRadius:'4px',fontSize:'12px',fontWeight:600,fontFamily:'"IBM Plex Mono",monospace'}}>{p.dur}</div>
                    </>}
                  </div>
                </div>)}
                {s.tipo.endsWith('-fin')&&<div style={{...S.durD,marginTop:'6px',fontSize:'18px',padding:'8px'}}>Total: {durTot()}</div>}
              </div>}

              {/* Simple date/time inicio */}
              {s.tipo.endsWith('-inicio')&&!s.multServ&&!s.multAler&&<div style={{...S.g2,...S.sec}}>
                <div><label style={S.lbl}>Fecha Inicio</label><input type="date" style={S.inp} name="fi" value={s.fd.fi} onChange={hi} /></div>
                <div><label style={S.lbl}>Hora Inicio</label><input type="time" step="1" style={S.inp} name="hi" value={s.fd.hi} onChange={hi} /></div>
              </div>}

              {s.tipo==='evento-seguimiento'&&<div style={S.sec}><label style={S.lbl}>Acciones</label><textarea style={{...S.ta,height:'80px'}} placeholder="Acción %% Responsable" name="acc" value={s.fd.acc} onChange={hi} /></div>}

              {s.tipo==='incidente-avance'&&<div style={S.sec}>
                <div style={{marginBottom:'8px'}}><label style={S.lbl}>Acciones en Curso</label><textarea style={{...S.ta,height:'60px'}} placeholder="Acción %% Responsable" name="accCur" value={s.fd.accCur} onChange={hi} /></div>
                <div><label style={S.lbl}>Acciones Ejecutadas</label><textarea style={{...S.ta,height:'60px'}} placeholder="Acción %% Responsable" name="accEj" value={s.fd.accEj} onChange={hi} /></div>
              </div>}

              {/* Simple date/time fin */}
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
                {s.tipo==='evento-fin'&&<div style={{fontSize:'10px',color:c.textDim,marginBottom:'4px',padding:'4px 8px',background:c.surfaceAlt,border:`1px solid ${c.border}`,borderRadius:'4px'}}>Indica acción de recuperación</div>}
                <textarea style={{...S.ta,height:'50px'}} placeholder="Observaciones" name="nota" value={s.fd.nota} onChange={hi} />
              </div>

              <B p onClick={gen} dis={s.errFecha?.includes('Error')} style={{width:'100%',marginTop:'14px',padding:'11px',borderRadius:'8px',fontSize:'13px'}}>⚡ Generar Comunicado</B>
            </div>

            {/* Result */}
            <div style={S.card}>
              <div style={{...S.fb,marginBottom:'8px'}}><span style={S.lbl}>Resultado</span><div style={S.fx}><B sm p onClick={copy}>📋 Copiar</B><B sm onClick={limpi}>🗑 Limpiar</B></div></div>
              <pre style={S.pre}>{s.res||'El mensaje aparecerá aquí...'}</pre>
            </div>
          </div>
        </div>
      </div>

      {toast&&<div style={S.toast}>{toast}</div>}

      {showSync&&<div style={S.ov}><div style={S.mod}>
        <div style={{fontWeight:700,color:c.text,marginBottom:'8px'}}>Sincronización</div>
        <div style={{color:c.textMuted,fontSize:'12px',marginBottom:'12px'}}>Tiempo: {cTA().h}h {cTA().m}m</div>
        <div style={S.fx}><B p onClick={sync}>Sincronizar</B><B onClick={()=>setShowSync(false)}>Más tarde</B></div>
        <button onClick={()=>{setNoPr(true);setShowSync(false);}} style={{background:'none',border:'none',color:c.textDim,fontSize:'10px',marginTop:'8px',cursor:'pointer'}}>No preguntar más</button>
      </div></div>}

      {showDurConf&&<div style={S.ov}><div style={{...S.mod,borderColor:c.amber}}>
        <div style={{fontWeight:700,color:c.amber,marginBottom:'8px'}}>⚠️ Duración &gt; 4h</div>
        <div style={{color:c.text,fontSize:'20px',fontFamily:'"IBM Plex Mono",monospace',fontWeight:700,marginBottom:'8px'}}>{s.multAler?durTot():s.fd.durCalc}</div>
        <div style={S.fx}><B p onClick={()=>{setShowDurConf(false);genInt();}}>Confirmar</B><B onClick={()=>setShowDurConf(false)}>Revisar</B></div>
      </div></div>}

      {s.showErrFecha&&<div style={S.ov}><div style={{...S.mod,borderColor:c.red}}>
        <div style={{fontWeight:700,color:c.red,marginBottom:'8px',fontSize:'16px'}}>🚨 Error Temporal</div>
        <div style={{color:'#fca5a5',fontSize:'12px',marginBottom:'12px',whiteSpace:'pre-line'}}>{s.errFecha}</div>
        {s.sugFecha.length>0&&<div style={{marginBottom:'12px'}}>
          <div style={{color:c.textMuted,fontSize:'11px',fontWeight:600,marginBottom:'6px'}}>Correcciones:</div>
          {s.sugFecha.map((sg,i)=><button key={i} onClick={()=>{
            if(sg.f&&sg.h)aplSugF(sg.f,sg.h);
            else{const ini=new Date(`${s.fd.fiF}T${s.fd.hiF}`);ini.setHours(ini.getHours()+1);sf('ff',s.fd.fiF);sf('hf',ini.toTimeString().split(' ')[0]);up({errFecha:'',sugFecha:[],showErrFecha:false});tt('Corregido');}
          }} style={{...S.fixB,marginBottom:'4px'}}>{sg.t}</button>)}
        </div>}
        <B onClick={()=>up({showErrFecha:false})} style={{width:'100%'}}>Revisar Manualmente</B>
      </div></div>}
      </div>
    </>
  );
}
