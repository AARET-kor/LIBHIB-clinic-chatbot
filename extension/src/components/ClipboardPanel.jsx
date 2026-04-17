import { useState, useEffect, useCallback, useRef } from 'react';
import {
  MessageSquare, Sparkles, Search, X, Check,
  Loader2, Globe, Plus, Clipboard, RefreshCw,
  RotateCcw, Copy, Target, AlertCircle, LogOut,
  ChevronRight, CalendarCheck, ShieldCheck, User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTikiPaste } from '../hooks/useTikiPaste';
import { usePatient } from '../hooks/usePatient';
import SalesPanel from './SalesPanel';

// ── Design tokens — Mocha Mousse ──────────────────────────────────────────────
const M = {
  bg:        '#FAF6F3',
  bgSub:     '#F0E8E3',
  bgDark:    '#0E0704',
  text:      '#1C0F0A',
  textSub:   '#6B4A3A',
  textMt:    '#B09080',
  border:    '#E5CFC5',
  borderMd:  '#CCADA0',
  white:     '#FFFFFF',
  mocha:     '#A47764',
  mochaDk:   '#7A5545',
  mochaLt:   '#C4A090',
  mochaPale: '#F5EDE8',
  sage:      '#5A8F80',
  sagePale:  '#E4F2EF',
  gold:      '#D09262',
  goldPale:  '#FBF0E6',
  red:       '#b85c44',
  redBg:     '#fdf2ee',
};
const SANS = "'Pretendard Variable', 'Inter', system-ui, -apple-system, sans-serif";
const LANG_FLAG = { ja:'🇯🇵', zh:'🇨🇳', en:'🇺🇸', ko:'🇰🇷', vi:'🇻🇳', th:'🇹🇭', ar:'🇸🇦', ru:'🇷🇺' };
const LANG_NAME = { ja:'일본어', zh:'중국어', en:'영어', ko:'한국어', vi:'베트남어', th:'태국어', ar:'아랍어', ru:'러시아어' };
const STATUS_COLOR = { consulting: M.mocha, booked: M.sage, done: M.textMt, care: '#8B7BAF', dormant: M.gold };
const STATUS_LABEL = { consulting:'상담중', booked:'예약완료', done:'방문완료', care:'사후케어', dormant:'휴면' };
const CARD_DEFS = [
  { key:'kind',    label:'공감형',   sublabel:'Empathetic',  Icon: MessageSquare, color: M.mocha, bg: M.mochaPale },
  { key:'firm',    label:'정보형',   sublabel:'Informative', Icon: ShieldCheck,   color: M.sage,  bg: M.sagePale  },
  { key:'booking', label:'세일즈형', sublabel:'Closing',     Icon: CalendarCheck, color: M.gold,  bg: M.goldPale  },
];

// ── Global CSS ────────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css');
  *, *::before, *::after { box-sizing: border-box; }
  textarea { outline: none; resize: vertical; }
  button { font-family: inherit; cursor: pointer; }
  input, select { outline: none; font-family: inherit; }
  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #E5CFC5; border-radius: 2px; }

  @keyframes spin      { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes cardIn    { from { opacity:0; transform:translateY(8px);  } to { opacity:1; transform:translateY(0); } }
  @keyframes slideUp   { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn    { from { opacity:0; } to { opacity:1; } }
  @keyframes auroraGlow {
    0%   { background-position:0%   50%; }
    50%  { background-position:100% 50%; }
    100% { background-position:0%   50%; }
  }
  @keyframes pulseRing {
    0%   { box-shadow: 0 0 0 0   rgba(164,119,100,0.4); }
    70%  { box-shadow: 0 0 0 8px rgba(164,119,100,0);   }
    100% { box-shadow: 0 0 0 0   rgba(164,119,100,0);   }
  }
  /* ── TikiFlash animations ── */
  @keyframes tikiBurst {
    0%   { opacity:0; transform:scale(0.15) rotate(-15deg); }
    40%  { opacity:1; transform:scale(1.5)  rotate(8deg);   }
    70%  { opacity:0.8; transform:scale(1.2) rotate(-3deg); }
    100% { opacity:0; transform:scale(1.8)  rotate(12deg);  }
  }
  @keyframes tikiParticle {
    0%   { opacity:1; transform:translate(0,0) scale(1);         }
    100% { opacity:0; transform:translate(var(--tx),var(--ty)) scale(0.2); }
  }
  @keyframes tikiRing {
    0%   { opacity:0.7; transform:scale(0.6); }
    100% { opacity:0;   transform:scale(2.2); }
  }
`;

// ── TikiFlash — signature ✦ sparkle effect ────────────────────────────────────
const SPARKS = [
  { tx:'-38px', ty:'-34px', ch:'✦', sz:11, delay:0    },
  { tx:' 36px', ty:'-30px', ch:'✧', sz: 9, delay:45   },
  { tx:' 42px', ty:' 22px', ch:'·', sz:14, delay:80   },
  { tx:'-36px', ty:' 28px', ch:'✦', sz: 8, delay:30   },
  { tx:'  4px', ty:'-46px', ch:'✧', sz:10, delay:60   },
  { tx:'  6px', ty:' 42px', ch:'·', sz:12, delay:20   },
  { tx:'-50px', ty:' -4px', ch:'✦', sz: 8, delay:90   },
  { tx:' 48px', ty:'  2px', ch:'·', sz: 9, delay:10   },
];

function TikiFlash({ active }) {
  if (!active) return null;
  return (
    <div style={{
      position:'fixed', inset:0, pointerEvents:'none', zIndex:9999,
      display:'flex', alignItems:'center', justifyContent:'center',
    }}>
      {/* Radial glow */}
      <div style={{
        position:'absolute', inset:0,
        background:`radial-gradient(circle at 50% 38%, ${M.mocha}22 0%, transparent 60%)`,
        animation:'fadeIn 0.1s ease forwards',
      }} />
      {/* Pulse ring */}
      <div style={{
        position:'absolute', width:80, height:80, borderRadius:'50%',
        border:`2px solid ${M.mocha}`,
        animation:'tikiRing 0.85s ease-out forwards',
      }} />
      {/* Central ✦ */}
      <div style={{
        position:'relative',
        fontSize:36, lineHeight:1, color:M.mocha,
        filter:`drop-shadow(0 0 10px ${M.mocha}) drop-shadow(0 0 4px ${M.gold})`,
        animation:'tikiBurst 0.9s ease-out forwards',
        userSelect:'none',
      }}>✦</div>
      {/* Particles */}
      {SPARKS.map((s, i) => (
        <span key={i} style={{
          position:'absolute', fontSize:s.sz, color: i%2===0 ? M.mocha : M.gold,
          top:'50%', left:'50%', transform:'translate(-50%,-50%)',
          '--tx':s.tx, '--ty':s.ty,
          animation:`tikiParticle 0.75s ease-out ${s.delay}ms forwards`,
          userSelect:'none', lineHeight:1,
        }}>{s.ch}</span>
      ))}
    </div>
  );
}

// ── Shared header ─────────────────────────────────────────────────────────────
function AppHeader({ session, logout, roleLabel, right }) {
  return (
    <div style={{ flexShrink:0 }}>
      <div style={{ height:3, background:`linear-gradient(90deg,${M.mocha},${M.gold},${M.sage})` }} />
      <div style={{
        background:M.bg, borderBottom:`1px solid ${M.border}`,
        padding:'9px 13px', display:'flex', alignItems:'center', gap:10,
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, flex:1 }}>
          <div style={{
            width:26, height:26, borderRadius:8, background:M.mocha, flexShrink:0,
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:`0 2px 8px ${M.mocha}50`, animation:'pulseRing 3s ease-in-out infinite',
          }}>
            <MessageSquare size={12} color="#fff" fill="#fff" />
          </div>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:5 }}>
              <span style={{ fontSize:13, fontWeight:800, color:M.text, letterSpacing:'-0.03em', lineHeight:1 }}>TikiDoc</span>
              <span style={{ fontSize:8, fontWeight:700, background:M.mocha, color:'#fff', borderRadius:4, padding:'1px 5px', letterSpacing:'0.04em' }}>AI</span>
            </div>
            <span style={{ fontSize:8, color:M.textMt, letterSpacing:'0.04em' }}>Shadow AI · 다국어 상담</span>
          </div>
        </div>
        {right || (
          <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
            <div style={{ textAlign:'right' }}>
              <p style={{ fontSize:10, fontWeight:600, color:M.text, lineHeight:1 }}>{session?.staff?.name}</p>
              <p style={{ fontSize:8, color:M.textMt, marginTop:1 }}>{roleLabel} · {session?.clinic?.name}</p>
            </div>
            <button onClick={logout}
              style={{ background:'none', border:`1px solid ${M.border}`, borderRadius:6, padding:'4px 6px', color:M.textMt, display:'flex', alignItems:'center', transition:'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = M.borderMd; e.currentTarget.style.color = M.text; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = M.border;   e.currentTarget.style.color = M.textMt; }}
            ><LogOut size={10} strokeWidth={1.5} /></button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Patient row in search results ─────────────────────────────────────────────
function PatientRow({ p, onSelect }) {
  const flag = p.flag || LANG_FLAG[p.lang] || '🌍';
  const phone = p.phone ? p.phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3') : '';
  const sc = STATUS_COLOR[p.status] || M.mocha;
  return (
    <button
      onClick={() => onSelect(p)}
      style={{
        width:'100%', display:'flex', alignItems:'center', gap:10,
        padding:'10px 14px', background:'transparent', border:'none',
        borderBottom:`1px solid ${M.border}`, cursor:'pointer', textAlign:'left',
        transition:'background 0.12s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = M.mochaPale}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <div style={{
        width:34, height:34, borderRadius:10, flexShrink:0, fontSize:17,
        background:M.mochaPale, border:`1.5px solid ${M.border}`,
        display:'flex', alignItems:'center', justifyContent:'center',
      }}>{flag}</div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:3 }}>
          <span style={{ fontSize:12, fontWeight:700, color:M.text }}>{p.name}</span>
          {p.name_en && <span style={{ fontSize:9, color:M.textMt }}>{p.name_en}</span>}
          {p.status && (
            <span style={{ fontSize:8, fontWeight:700, color:sc, background:sc+'18', border:`1px solid ${sc}30`, borderRadius:4, padding:'1px 5px' }}>
              {STATUS_LABEL[p.status] || p.status}
            </span>
          )}
        </div>
        <div style={{ display:'flex', gap:8 }}>
          {p.lang && <span style={{ fontSize:9, color:M.textSub }}>{flag} {LANG_NAME[p.lang] || p.lang}</span>}
          {phone   && <span style={{ fontSize:9, color:M.textMt  }}>{phone}</span>}
        </div>
      </div>
      <ChevronRight size={12} color={M.borderMd} strokeWidth={2} />
    </button>
  );
}

// ── Phase 1: Patient Selection ────────────────────────────────────────────────
function PatientSelectScreen({ patientHook, session, logout, roleLabel, onTikiFlash }) {
  const { setCurrentPatient, searchResults, searching, searchPatients, creating, createPatient, parsing, parsePatientText } = patientHook;
  const [query,        setQuery]        = useState('');
  const [parsedInfo,   setParsedInfo]   = useState(null);
  const [showCreate,   setShowCreate]   = useState(false);
  const [form, setForm] = useState({ name:'', name_en:'', phone:'', lang:'ja', flag:'🇯🇵', channel:'', channel_user_id:'' });
  const debounceRef = useRef(null);
  const inputRef    = useRef(null);

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 250); }, []);

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleQuery = (v) => {
    setQuery(v);
    setParsedInfo(null);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchPatients(v), 280);
  };

  const handlePaste = async (e) => {
    const text = (e.clipboardData?.getData('text') || '').trim();
    if (text.length > 10) {
      e.preventDefault();
      setQuery(text.slice(0, 60) + (text.length > 60 ? '…' : ''));
      onTikiFlash();
      const parsed = await parsePatientText(text);
      if (parsed) {
        setParsedInfo(parsed);
        setForm(f => ({
          ...f,
          name:            parsed.name            || f.name,
          name_en:         parsed.name_en         || f.name_en,
          phone:           parsed.phone           || f.phone,
          lang:            parsed.lang            || f.lang,
          flag:            parsed.flag            || LANG_FLAG[parsed.lang] || f.flag,
          channel:         parsed.channel         || f.channel,
          channel_user_id: parsed.channel_user_id || f.channel_user_id,
        }));
      }
    }
  };

  const handleSelect = (p) => { onTikiFlash(); setCurrentPatient(p); };
  const handleRegisterParsed = async () => {
    const p = await createPatient(form);
    if (p) onTikiFlash();
  };
  const handleRegisterManual = async () => {
    if (!form.name.trim()) return;
    const p = await createPatient(form);
    if (p) onTikiFlash();
  };

  const inputSt = {
    width:'100%', padding:'8px 11px', border:`1.5px solid ${M.border}`, borderRadius:8,
    fontSize:12, color:M.text, background:M.white, transition:'border-color 0.15s',
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', background:M.bg, fontFamily:SANS, animation:'slideUp 0.32s ease-out' }}>
      <AppHeader session={session} logout={logout} roleLabel={roleLabel} />

      <div style={{ flex:1, overflowY:'auto', padding:'20px 15px 20px' }}>

        {/* Hero */}
        <div style={{ textAlign:'center', marginBottom:22 }}>
          <div style={{
            width:48, height:48, borderRadius:16, background:M.mochaPale,
            border:`1.5px solid ${M.border}`, margin:'0 auto 13px',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:22, animation:'pulseRing 2.8s ease-in-out infinite',
          }}>
            <User size={22} color={M.mocha} strokeWidth={1.5} />
          </div>
          <p style={{ fontSize:15, fontWeight:800, color:M.text, letterSpacing:'-0.03em', marginBottom:5, lineHeight:1.2 }}>
            누구와 상담 중인가요?
          </p>
          <p style={{ fontSize:10, color:M.textMt, lineHeight:1.6, maxWidth:230, margin:'0 auto' }}>
            이름·전화번호로 검색하거나<br />
            채팅 내용을 붙여넣으면 AI가 자동 등록합니다
          </p>
        </div>

        {/* Search / paste input */}
        <div style={{ position:'relative', marginBottom:10 }}>
          <div style={{
            display:'flex', alignItems:'center', gap:8,
            background:M.white, border:`1.5px solid ${M.border}`,
            borderRadius:12, padding:'10px 12px',
            boxShadow:`0 2px 12px ${M.mocha}10`, transition:'border-color 0.2s, box-shadow 0.2s',
          }} id="search-wrap">
            {(searching || parsing)
              ? <Loader2 size={13} color={M.mocha} style={{ animation:'spin 0.7s linear infinite', flexShrink:0 }} />
              : <Search size={13} color={M.textMt} strokeWidth={2} style={{ flexShrink:0 }} />
            }
            <input
              ref={inputRef}
              value={query}
              onChange={e => handleQuery(e.target.value)}
              onPaste={handlePaste}
              placeholder="이름·전화 검색  또는  채팅 내용 붙여넣기 ↵"
              style={{ flex:1, border:'none', background:'transparent', fontSize:12, color:M.text, letterSpacing:'-0.01em' }}
              onFocus={e => { const w = document.getElementById('search-wrap'); if(w) { w.style.borderColor=M.mocha; w.style.boxShadow=`0 0 0 3px ${M.mocha}18`; } }}
              onBlur={e  => { const w = document.getElementById('search-wrap'); if(w) { w.style.borderColor=M.border; w.style.boxShadow=`0 2px 12px ${M.mocha}10`; } }}
            />
            {query && (
              <button onClick={() => { setQuery(''); setParsedInfo(null); searchPatients(''); }}
                style={{ background:'none', border:'none', padding:2, cursor:'pointer' }}>
                <X size={10} color={M.textMt} />
              </button>
            )}
          </div>
        </div>

        {/* AI parse preview card */}
        {parsedInfo && (
          <div style={{
            background:M.sagePale, border:`1.5px solid ${M.sage}40`, borderRadius:14,
            padding:14, marginBottom:12, animation:'cardIn 0.3s ease-out',
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:11 }}>
              <Sparkles size={12} color={M.sage} />
              <span style={{ fontSize:10, fontWeight:700, color:M.sage, letterSpacing:'0.06em' }}>✦ AI 자동 파싱 완료</span>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:form.phone ? 8 : 12 }}>
              <div style={{ background:M.white, borderRadius:9, padding:'9px 11px', border:`1px solid ${M.border}` }}>
                <p style={{ fontSize:8, fontWeight:700, color:M.textMt, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>이름</p>
                <p style={{ fontSize:14, fontWeight:800, color:M.text, lineHeight:1 }}>{form.name || '—'}</p>
                {form.name_en && <p style={{ fontSize:9, color:M.textMt, marginTop:2 }}>{form.name_en}</p>}
              </div>
              <div style={{ background:M.white, borderRadius:9, padding:'9px 11px', border:`1px solid ${M.border}` }}>
                <p style={{ fontSize:8, fontWeight:700, color:M.textMt, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>언어</p>
                <p style={{ fontSize:18, lineHeight:1 }}>{form.flag}</p>
                <p style={{ fontSize:9, color:M.textSub, marginTop:2 }}>{LANG_NAME[form.lang] || form.lang}</p>
              </div>
            </div>
            {form.phone && (
              <div style={{ background:M.white, borderRadius:9, padding:'9px 11px', border:`1px solid ${M.border}`, marginBottom:12 }}>
                <p style={{ fontSize:8, fontWeight:700, color:M.textMt, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>전화번호</p>
                <p style={{ fontSize:12, color:M.text }}>{form.phone}</p>
              </div>
            )}
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={() => { setParsedInfo(null); setShowCreate(true); }}
                style={{ flex:1, padding:'9px', borderRadius:9, border:`1.5px solid ${M.border}`, background:M.white, fontSize:11, fontWeight:600, color:M.textSub }}>
                수동 입력
              </button>
              <button onClick={handleRegisterParsed} disabled={creating || !form.name.trim()}
                style={{
                  flex:2, padding:'9px', borderRadius:9, border:'none',
                  background: creating || !form.name.trim() ? M.border : M.sage,
                  color: creating || !form.name.trim() ? M.textMt : '#fff',
                  fontSize:11, fontWeight:700, fontFamily:SANS,
                  display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                  boxShadow: creating ? 'none' : `0 3px 10px ${M.sage}40`,
                }}>
                {creating ? <Loader2 size={11} style={{ animation:'spin 0.7s linear infinite' }} /> : <Check size={11} strokeWidth={2.5} />}
                {creating ? '등록 중...' : '바로 등록'}
              </button>
            </div>
          </div>
        )}

        {/* Search results */}
        {!parsedInfo && searchResults.length > 0 && (
          <div style={{ background:M.white, border:`1.5px solid ${M.border}`, borderRadius:13, overflow:'hidden', marginBottom:12, animation:'cardIn 0.25s ease-out' }}>
            {searchResults.map(p => <PatientRow key={p.id} p={p} onSelect={handleSelect} />)}
          </div>
        )}

        {/* No results */}
        {!parsedInfo && query.trim() && searchResults.length === 0 && !searching && (
          <div style={{ textAlign:'center', padding:'10px 0 12px', animation:'fadeIn 0.2s' }}>
            <p style={{ fontSize:11, color:M.textMt, marginBottom:8 }}>검색 결과 없음</p>
            <button onClick={() => setShowCreate(true)}
              style={{ fontSize:11, fontWeight:700, color:M.mocha, background:M.mochaPale, border:`1.5px solid ${M.mocha}30`, borderRadius:8, padding:'7px 16px', fontFamily:SANS }}>
              + 신규 등록
            </button>
          </div>
        )}

        {/* New patient form */}
        {showCreate && !parsedInfo && (
          <div style={{ background:M.white, border:`1.5px solid ${M.border}`, borderRadius:14, padding:15, animation:'slideUp 0.25s ease-out', marginBottom:12 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
              <span style={{ fontSize:12, fontWeight:800, color:M.text, letterSpacing:'-0.02em' }}>신규 환자 등록</span>
              <button onClick={() => setShowCreate(false)} style={{ background:'none', border:'none', cursor:'pointer', padding:2 }}>
                <X size={13} color={M.textMt} />
              </button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {[
                { k:'name',            label:'이름 *',   ph:'야마다 다로' },
                { k:'name_en',         label:'영문명',    ph:'Taro Yamada' },
                { k:'phone',           label:'전화번호',  ph:'+81-90-1234-5678' },
                { k:'channel_user_id', label:'채널 ID',  ph:'line_id_xxx' },
              ].map(({ k, label, ph }) => (
                <div key={k}>
                  <label style={{ fontSize:9, fontWeight:700, color:M.textSub, display:'block', marginBottom:3, textTransform:'uppercase', letterSpacing:'0.04em' }}>{label}</label>
                  <input value={form[k]} onChange={e => setF(k, e.target.value)} placeholder={ph}
                    style={inputSt}
                    onFocus={e => e.target.style.borderColor = M.mocha}
                    onBlur={e  => e.target.style.borderColor = M.border}
                  />
                </div>
              ))}
              <div>
                <label style={{ fontSize:9, fontWeight:700, color:M.textSub, display:'block', marginBottom:3, textTransform:'uppercase', letterSpacing:'0.04em' }}>언어</label>
                <select value={form.lang} onChange={e => { setF('lang', e.target.value); setF('flag', LANG_FLAG[e.target.value] || '🌍'); }}
                  style={{ ...inputSt, cursor:'pointer' }}>
                  {Object.entries(LANG_NAME).map(([code, name]) => (
                    <option key={code} value={code}>{LANG_FLAG[code]} {name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ display:'flex', gap:8, marginTop:12 }}>
              <button onClick={() => setShowCreate(false)}
                style={{ flex:1, padding:'9px', borderRadius:9, border:`1.5px solid ${M.border}`, background:M.bg, color:M.textSub, fontSize:11, fontWeight:600, fontFamily:SANS }}>
                취소
              </button>
              <button onClick={handleRegisterManual} disabled={creating || !form.name.trim()}
                style={{
                  flex:2, padding:'9px', borderRadius:9, border:'none',
                  background: creating || !form.name.trim() ? M.border : M.mocha,
                  color: creating || !form.name.trim() ? M.textMt : '#fff',
                  fontSize:11, fontWeight:700, fontFamily:SANS,
                  display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                  boxShadow: creating || !form.name.trim() ? 'none' : `0 4px 12px ${M.mocha}40`,
                }}>
                {creating ? <Loader2 size={11} style={{ animation:'spin 0.7s linear infinite' }} /> : <Check size={11} strokeWidth={2.5} />}
                {creating ? '등록 중...' : '환자 등록'}
              </button>
            </div>
          </div>
        )}

        {/* Idle CTA */}
        {!query && !showCreate && !parsedInfo && (
          <button onClick={() => setShowCreate(true)}
            style={{
              width:'100%', padding:'11px', borderRadius:10,
              border:`1.5px dashed ${M.border}`, background:'transparent',
              color:M.textSub, fontSize:11, fontWeight:600,
              display:'flex', alignItems:'center', justifyContent:'center', gap:7,
              fontFamily:SANS, cursor:'pointer', transition:'all 0.15s', marginTop:4,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor=M.mocha; e.currentTarget.style.color=M.mocha; e.currentTarget.style.background=M.mochaPale; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor=M.border; e.currentTarget.style.color=M.textSub; e.currentTarget.style.background='transparent'; }}
          >
            <Plus size={13} strokeWidth={2.5} /> 신규 환자 등록
          </button>
        )}
      </div>

      {/* Footer */}
      <div style={{ borderTop:`1px solid ${M.border}`, padding:'6px 14px', background:M.bg, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
        <div style={{ width:3, height:3, borderRadius:'50%', background:M.mocha }} />
        <p style={{ fontSize:9, color:M.textMt, letterSpacing:'0.15em', textTransform:'uppercase' }}>TikiDoc Shadow AI · v2.0</p>
        <div style={{ width:3, height:3, borderRadius:'50%', background:M.mocha }} />
      </div>
    </div>
  );
}

// ── Result card ───────────────────────────────────────────────────────────────
function ResultCard({ def, option, index, onCopy }) {
  const [copied, setCopied] = useState(false);
  const replyText = option?.reply || '';
  const koText    = option?.ko_translation || '';

  const handleCopy = async () => {
    if (!replyText) return;
    try { await navigator.clipboard.writeText(replyText); } catch {}
    setCopied(true);
    onCopy?.();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      marginBottom:10, background:M.white,
      border:`1px solid ${M.border}`, borderRadius:12, overflow:'hidden',
      animation:`cardIn 0.35s ease-out ${index*80}ms both`,
      transition:'border-color 0.15s, box-shadow 0.15s',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor=M.borderMd; e.currentTarget.style.boxShadow=`0 2px 12px ${M.mocha}10`; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor=M.border;   e.currentTarget.style.boxShadow='none'; }}
    >
      <div style={{ height:3, background:def.color }} />
      <div style={{ padding:'10px 13px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`1px solid ${M.border}` }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:28, height:28, borderRadius:8, background:`${def.color}12`, border:`1px solid ${def.color}22`, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <def.Icon size={13} color={def.color} strokeWidth={1.8} />
          </div>
          <div>
            <p style={{ fontSize:12, fontWeight:700, color:M.text, lineHeight:1 }}>{def.label}</p>
            <p style={{ fontSize:9, color:M.textMt, marginTop:2, letterSpacing:'0.05em' }}>{def.sublabel}</p>
          </div>
        </div>
        <button onClick={handleCopy}
          style={{
            display:'flex', alignItems:'center', gap:4,
            padding:'5px 10px', borderRadius:6, fontSize:10, fontWeight:600,
            background: copied ? `${def.color}10` : M.bgSub,
            border: `1px solid ${copied ? def.color : M.border}`,
            color: copied ? def.color : M.textSub, transition:'all 0.15s',
          }}>
          {copied ? <Check size={10} strokeWidth={2.5} /> : <Copy size={10} strokeWidth={1.8} />}
          {copied ? '복사됨' : '복사'}
        </button>
      </div>
      <div style={{ padding:'12px 13px', background:M.bg }}>
        <p style={{ fontSize:12.5, color:M.text, lineHeight:1.72, margin:0, whiteSpace:'pre-wrap', fontFamily:SANS }}>{replyText}</p>
      </div>
      {koText && (
        <div style={{ margin:'0 13px 12px', padding:'9px 11px', background:M.bgSub, borderRadius:8, borderLeft:`3px solid ${def.color}` }}>
          <p style={{ fontSize:9, fontWeight:700, color:def.color, letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:5, opacity:0.8 }}>한국어 해석 · 직원 참고</p>
          <p style={{ fontSize:11.5, color:M.textSub, lineHeight:1.65, margin:0 }}>{koText}</p>
        </div>
      )}
    </div>
  );
}

// ── Phase 2: TikiPaste Screen ─────────────────────────────────────────────────
function PasteScreen({ patientHook, session, logout, roleLabel, onTikiFlash }) {
  const { currentPatient, setCurrentPatient } = patientHook;
  const { generate, result, loading, error, reset } = useTikiPaste();
  const clinicId   = session?.clinic?.id;
  const clinicName = session?.clinic?.name;

  const [inputText,  setInputText]  = useState('');
  const [clipStatus, setClipStatus] = useState('idle');
  const [autoRan,    setAutoRan]    = useState(false);

  const flag = currentPatient?.flag || LANG_FLAG[currentPatient?.lang] || '👤';

  const readClipboard = useCallback(async (autoGen = false) => {
    try {
      const text = await navigator.clipboard.readText();
      if (text?.trim()) {
        setInputText(text.trim());
        setClipStatus('done');
        onTikiFlash();
        if (autoGen && !autoRan) {
          setAutoRan(true);
          generate(text.trim(), { clinicId, clinicName });
        }
      }
    } catch { setClipStatus('denied'); }
  }, [autoRan, generate, clinicId, clinicName, onTikiFlash]);

  useEffect(() => { readClipboard(true); }, []); // eslint-disable-line

  const handleAnalyze = () => {
    if (!inputText.trim() || loading) return;
    reset(); onTikiFlash();
    generate(inputText, { clinicId, clinicName });
  };
  const handleReset = () => { setInputText(''); reset(); setAutoRan(false); setClipStatus('idle'); };
  const canGenerate = !!inputText.trim() && !loading;

  // Patient badge (right slot of header)
  const headerRight = (
    <div style={{ display:'flex', alignItems:'center', gap:7, flex:1, justifyContent:'flex-end' }}>
      <div style={{
        display:'flex', alignItems:'center', gap:7,
        background:M.mochaPale, border:`1.5px solid ${M.mocha}40`,
        borderRadius:9, padding:'5px 9px', maxWidth:160,
      }}>
        <span style={{ fontSize:15, flexShrink:0 }}>{flag}</span>
        <div style={{ flex:1, minWidth:0, overflow:'hidden' }}>
          <p style={{ fontSize:11, fontWeight:700, color:M.mocha, lineHeight:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{currentPatient?.name}</p>
          {currentPatient?.lang && <p style={{ fontSize:8, color:M.textSub, marginTop:1 }}>{LANG_NAME[currentPatient.lang]||currentPatient.lang}</p>}
        </div>
        <button onClick={() => setCurrentPatient(null)} style={{ background:'none', border:'none', cursor:'pointer', padding:2, flexShrink:0 }} title="환자 변경">
          <X size={9} color={M.textMt} />
        </button>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
        <p style={{ fontSize:9, color:M.textSub, fontWeight:600 }}>{session?.staff?.name}</p>
        <button onClick={logout}
          style={{ background:'none', border:`1px solid ${M.border}`, borderRadius:6, padding:'4px 5px', color:M.textMt, display:'flex', alignItems:'center', transition:'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor=M.borderMd; e.currentTarget.style.color=M.text; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor=M.border;   e.currentTarget.style.color=M.textMt; }}
        ><LogOut size={10} strokeWidth={1.5} /></button>
      </div>
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', background:M.bgSub, fontFamily:SANS, color:M.text, animation:'fadeIn 0.25s ease-out' }}>
      <AppHeader session={session} logout={logout} roleLabel={roleLabel} right={headerRight} />

      {/* Status banners */}
      {clipStatus === 'done' && !result && !loading && (
        <div style={{ background:M.sagePale, borderBottom:`1px solid ${M.sage}30`, padding:'5px 13px', display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
          <Sparkles size={10} color={M.sage} />
          <span style={{ fontSize:9, color:M.sage, fontWeight:600 }}>클립보드에서 불러왔습니다 · AI 분석 중</span>
        </div>
      )}
      {clipStatus === 'denied' && (
        <div style={{ background:M.goldPale, borderBottom:`1px solid ${M.gold}30`, padding:'5px 13px', display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
          <Clipboard size={10} color={M.gold} />
          <span style={{ fontSize:9, color:M.gold }}>클립보드 권한 필요 · 직접 붙여넣기 가능</span>
        </div>
      )}

      {/* Scroll area */}
      <div style={{ flex:1, overflowY:'auto', padding:'12px 12px 18px' }}>

        {/* Input controls row */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
          <label style={{ fontSize:10, fontWeight:600, color:M.textSub, letterSpacing:'0.04em' }}>환자 메시지</label>
          <div style={{ display:'flex', gap:5 }}>
            <button onClick={() => readClipboard(false)} disabled={loading}
              style={{ fontSize:9, color:M.textSub, background:M.bg, border:`1px solid ${M.border}`, borderRadius:5, padding:'3px 8px', display:'flex', alignItems:'center', gap:3, opacity:loading?0.4:1 }}>
              <RefreshCw size={8} strokeWidth={2} /> 다시읽기
            </button>
            {(inputText || result) && (
              <button onClick={handleReset}
                style={{ fontSize:9, color:M.red, background:M.bg, border:`1px solid ${M.red}40`, borderRadius:5, padding:'3px 8px', display:'flex', alignItems:'center', gap:3 }}>
                <RotateCcw size={8} strokeWidth={2} /> 초기화
              </button>
            )}
          </div>
        </div>

        {/* Aurora textarea */}
        <div style={{ position:'relative', padding:loading ? 2 : 0, borderRadius:12, marginBottom:8 }}>
          {loading && (
            <div style={{
              position:'absolute', inset:0, borderRadius:12, zIndex:0,
              background:`linear-gradient(270deg,${M.mocha},${M.gold},${M.mochaLt},${M.sage},${M.mocha})`,
              backgroundSize:'400% 400%', animation:'auroraGlow 2.4s ease infinite',
            }} />
          )}
          <textarea
            value={inputText}
            onChange={e => { setInputText(e.target.value); reset(); }}
            placeholder={`환자 메시지를 복사(Ctrl+C)하면 자동으로 불러옵니다.\n직접 붙여넣기(Ctrl+V)도 가능합니다.\n\n예) "肉毒素注射多少钱？"`}
            rows={4}
            style={{
              position:'relative', zIndex:1, width:'100%', padding:'10px 12px',
              border: loading ? 'none' : `1.5px solid ${M.border}`,
              borderRadius: loading ? 10 : 12,
              fontSize:12.5, color:M.text, background:M.bg,
              lineHeight:1.68, fontFamily:SANS, display:'block',
              transition:'border-color 0.2s',
            }}
            onFocus={e => { if(!loading) e.target.style.borderColor=M.mocha; }}
            onBlur={e  => { if(!loading) e.target.style.borderColor=M.border; }}
          />
        </div>

        {/* Generate button */}
        <button
          onClick={handleAnalyze} disabled={!canGenerate}
          style={{
            width:'100%', padding:'12px 0', marginBottom:14,
            background: canGenerate ? M.mocha : M.border,
            color: canGenerate ? M.white : M.textMt,
            border:'none', borderRadius:10, fontSize:12, fontWeight:700,
            letterSpacing:'0.04em',
            display:'flex', alignItems:'center', justifyContent:'center', gap:8,
            transition:'opacity 0.15s',
            boxShadow: canGenerate ? `0 4px 18px ${M.mocha}50` : 'none',
            fontFamily:SANS,
          }}
          onMouseEnter={e => { if(canGenerate) e.currentTarget.style.opacity='0.85'; }}
          onMouseLeave={e => { if(canGenerate) e.currentTarget.style.opacity='1'; }}
        >
          {loading
            ? <Loader2 size={14} style={{ animation:'spin 0.7s linear infinite' }} />
            : <Sparkles size={14} strokeWidth={1.8} />
          }
          {loading ? 'AI 분석 중...' : '✦ 답변 3종 생성'}
        </button>

        {/* Error */}
        {error && (
          <div style={{ marginBottom:14, padding:'11px 13px', background:M.redBg, border:`1px solid ${M.red}30`, borderRadius:10, display:'flex', gap:9 }}>
            <AlertCircle size={13} color={M.red} style={{ marginTop:1, flexShrink:0 }} />
            <div>
              <p style={{ fontSize:12, fontWeight:600, color:M.red, marginBottom:3 }}>분석 실패</p>
              <p style={{ fontSize:10, color:M.red, lineHeight:1.5 }}>{error}</p>
            </div>
          </div>
        )}

        {/* Insight banner */}
        {result && (
          <div style={{
            marginBottom:14, background:M.bgDark, borderRadius:12, overflow:'hidden',
            animation:'cardIn 0.3s ease-out both', boxShadow:`0 4px 20px ${M.mocha}30`,
          }}>
            <div style={{ height:3, background:`linear-gradient(90deg,${M.mocha},${M.gold},${M.sage})` }} />
            <div style={{ display:'flex', minHeight:62 }}>
              {result.detected_language && (
                <div style={{ flex:1, padding:'11px 13px', display:'flex', flexDirection:'column', justifyContent:'center', borderRight:'1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:4 }}>
                    <Globe size={9} color={M.mocha} />
                    <span style={{ fontSize:8, fontWeight:700, color:M.mocha, letterSpacing:'0.2em', textTransform:'uppercase' }}>감지 언어</span>
                  </div>
                  <p style={{ fontSize:18, fontWeight:800, color:'#fff', letterSpacing:'-0.02em', lineHeight:1 }}>{result.detected_language}</p>
                </div>
              )}
              {result.intent && (
                <div style={{ flex:1.6, padding:'11px 13px', display:'flex', flexDirection:'column', justifyContent:'center', background:'rgba(255,255,255,0.02)' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:4 }}>
                    <Target size={9} color={M.sage} />
                    <span style={{ fontSize:8, fontWeight:700, color:M.sage, letterSpacing:'0.2em', textTransform:'uppercase' }}>환자 의도</span>
                  </div>
                  <p style={{ fontSize:13, fontWeight:700, color:'#fff', letterSpacing:'-0.01em', lineHeight:1.25 }}>{result.intent}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Result cards */}
        {result && CARD_DEFS.map((def, idx) => (
          <ResultCard key={def.key} def={def} option={result.options?.[def.key]} index={idx} onCopy={onTikiFlash} />
        ))}

        {/* Empty state */}
        {!result && !loading && !error && (
          <div style={{ textAlign:'center', padding:'24px 0' }}>
            <div style={{ fontSize:30, marginBottom:10, color:M.borderMd, lineHeight:1 }}>✦</div>
            <p style={{ fontSize:11, color:M.textMt, lineHeight:1.85 }}>
              환자 메시지를 복사하면<br />TikiDoc이 자동으로 분석합니다
            </p>
          </div>
        )}

        {/* SalesPanel */}
        {inputText?.trim() && (
          <SalesPanel
            inputText={inputText}
            clinicId={clinicId}
            clinicName={clinicName}
            patientLanguage={result?.detected_language}
            patientMessage={inputText}
          />
        )}
      </div>

      {/* Footer */}
      <div style={{ borderTop:`1px solid ${M.border}`, padding:'6px 14px', background:M.bg, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
        <div style={{ width:3, height:3, borderRadius:'50%', background:M.mocha }} />
        <p style={{ fontSize:9, color:M.textMt, letterSpacing:'0.15em', textTransform:'uppercase' }}>TikiDoc Shadow AI · v2.0</p>
        <div style={{ width:3, height:3, borderRadius:'50%', background:M.mocha }} />
      </div>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function ClipboardPanel() {
  const { session, logout, roleLabel } = useAuth();
  const clinicId   = session?.clinic?.id;
  const patientHook = usePatient(clinicId);
  const { currentPatient } = patientHook;

  const [tikiActive, setTikiActive] = useState(false);
  const tikiTimer = useRef(null);

  const triggerTiki = useCallback(() => {
    clearTimeout(tikiTimer.current);
    setTikiActive(false);
    requestAnimationFrame(() => requestAnimationFrame(() => setTikiActive(true)));
    tikiTimer.current = setTimeout(() => setTikiActive(false), 1000);
  }, []);

  const sharedProps = { patientHook, session, logout, roleLabel, onTikiFlash: triggerTiki };

  return (
    <div style={{ fontFamily:SANS }}>
      <style>{GLOBAL_CSS}</style>
      <TikiFlash active={tikiActive} />
      {currentPatient
        ? <PasteScreen   {...sharedProps} />
        : <PatientSelectScreen {...sharedProps} />
      }
    </div>
  );
}
