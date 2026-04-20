import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, UserPlus, X, Check, Loader2, ChevronDown, User, Clipboard, Phone, Globe } from 'lucide-react';

const M = {
  bg:        '#FAF6F3',
  bgSub:     '#F0E8E3',
  text:      '#1C0F0A',
  textSub:   '#6B4A3A',
  textMt:    '#B09080',
  border:    '#E5CFC5',
  borderMd:  '#CCADA0',
  mocha:     '#A47764',
  mochaDk:   '#7A5545',
  mochaLt:   '#C4A090',
  mochaPale: '#F5EDE8',
  sage:      '#5A8F80',
  sagePale:  '#E4F2EF',
  gold:      '#D09262',
  white:     '#FFFFFF',
};
const SANS = "'Pretendard Variable', 'Inter', system-ui, -apple-system, sans-serif";

const LANG_FLAG = { ja:'🇯🇵', zh:'🇨🇳', en:'🇺🇸', ko:'🇰🇷', vi:'🇻🇳', th:'🇹🇭', ar:'🇸🇦', ru:'🇷🇺' };
const LANG_NAME = { ja:'일본어', zh:'중국어', en:'영어', ko:'한국어', vi:'베트남어', th:'태국어', ar:'아랍어', ru:'러시아어' };

const STATUS_COLOR = {
  consulting: M.mocha, booked: M.sage, done: M.textMt, care: '#8B7BAF', dormant: M.gold,
};
const STATUS_LABEL = { consulting:'상담중', booked:'예약완료', done:'방문완료', care:'사후케어', dormant:'휴면' };

// ── 환자 카드 ─────────────────────────────────────────────────────────────────
function PatientCard({ p, onSelect }) {
  const flag     = p.flag || LANG_FLAG[p.lang] || '🌍';
  const langLabel = LANG_NAME[p.lang] || p.lang || '';
  const phone    = p.phone ? p.phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3') : '';
  const statusColor = STATUS_COLOR[p.status] || M.mocha;

  return (
    <div
      onClick={() => onSelect(p)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px',
        cursor: 'pointer', borderBottom: `1px solid ${M.border}`,
        transition: 'background 0.12s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = M.mochaPale}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <div style={{
        width: 32, height: 32, borderRadius: 9, background: M.mochaPale,
        border: `1px solid ${M.border}`, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 15, flexShrink: 0,
      }}>{flag}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: M.text, lineHeight: 1, letterSpacing: '-0.01em' }}>
            {p.name}
          </p>
          {p.name_en && <span style={{ fontSize: 9, color: M.textMt, fontWeight: 400 }}>{p.name_en}</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          {langLabel && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 9, color: M.textSub }}>
              <Globe size={8} /> {langLabel}
            </span>
          )}
          {phone && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 9, color: M.textSub }}>
              <Phone size={8} /> {phone}
            </span>
          )}
          {p.last_visit && (
            <span style={{ fontSize: 9, color: M.textMt }}>· {p.last_visit.slice(0,10)}</span>
          )}
        </div>
      </div>
      {p.status && (
        <span style={{
          fontSize: 8, fontWeight: 700, letterSpacing: '0.04em',
          color: statusColor, background: statusColor + '18',
          border: `1px solid ${statusColor}30`,
          borderRadius: 5, padding: '2px 6px', flexShrink: 0,
        }}>
          {STATUS_LABEL[p.status] || p.status}
        </span>
      )}
    </div>
  );
}

// ── 신규 환자 등록 폼 ─────────────────────────────────────────────────────────
function NewPatientForm({ onClose, onCreated, usePatientHook }) {
  const { createPatient, parsePatientText, creating, parsing } = usePatientHook;
  const [form, setForm] = useState({
    name:'', name_en:'', phone:'', lang:'ja', flag:'🇯🇵', channel:'', channel_user_id:'',
  });
  const [pasteText, setPasteText] = useState('');
  const [pasteMode, setPasteMode] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleParse = async () => {
    const parsed = await parsePatientText(pasteText);
    if (parsed) {
      setForm(f => ({
        ...f,
        name: parsed.name || f.name,
        name_en: parsed.name_en || f.name_en,
        phone: parsed.phone || f.phone,
        lang: parsed.lang || f.lang,
        flag: parsed.flag || LANG_FLAG[parsed.lang] || f.flag,
        channel: parsed.channel || f.channel,
        channel_user_id: parsed.channel_user_id || f.channel_user_id,
      }));
      setPasteMode(false);
    }
  };

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    const patient = await createPatient(form);
    if (patient) onCreated(patient);
  };

  const inputStyle = {
    width: '100%', padding: '8px 11px',
    border: `1.5px solid ${M.border}`, borderRadius: 8,
    fontSize: 12, fontFamily: SANS, color: M.text, background: M.white,
    outline: 'none', transition: 'border-color 0.15s',
  };

  return (
    <div style={{ padding: '14px', background: M.white }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <p style={{ fontSize: 12, fontWeight: 800, color: M.text, letterSpacing: '-0.02em' }}>신규 환자 등록</p>
        <button
          onClick={() => setPasteMode(v => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700,
            color: M.sage, background: M.sagePale, border: `1px solid ${M.sage}30`,
            borderRadius: 6, padding: '4px 9px', cursor: 'pointer', letterSpacing: '-0.01em',
          }}
        >
          <Clipboard size={9} /> Magic Paste AI
        </button>
      </div>

      {/* Magic Paste */}
      {pasteMode && (
        <div style={{ marginBottom: 12, padding: 10, background: M.sagePale, borderRadius: 10, border: `1px solid ${M.sage}30` }}>
          <textarea
            value={pasteText}
            onChange={e => setPasteText(e.target.value)}
            placeholder="채널 프로필, 메시지, 명함 등 텍스트 붙여넣기 → AI가 자동 파싱합니다"
            rows={3}
            style={{ ...inputStyle, background: M.white, resize: 'none', marginBottom: 8 }}
          />
          <button
            onClick={handleParse}
            disabled={parsing || !pasteText.trim()}
            style={{
              width: '100%', padding: '8px', borderRadius: 8,
              background: parsing || !pasteText.trim() ? M.border : M.sage,
              color: parsing || !pasteText.trim() ? M.textMt : M.white,
              border: 'none', fontSize: 11, fontWeight: 700, cursor: parsing ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: SANS,
            }}
          >
            {parsing && <Loader2 size={11} style={{ animation: 'spin 0.7s linear infinite' }} />}
            {parsing ? 'AI 파싱 중...' : '✦ AI 자동 파싱'}
          </button>
        </div>
      )}

      {/* Fields */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { key: 'name',            label: '이름 *',   placeholder: '유키' },
          { key: 'name_en',         label: '영문명',    placeholder: 'Yuki Tanaka' },
          { key: 'phone',           label: '전화번호',  placeholder: '+81-90-1234-5678' },
          { key: 'channel',         label: '채널',      placeholder: 'Line / WhatsApp / WeChat' },
          { key: 'channel_user_id', label: '채널 ID',  placeholder: 'yuki_line_123' },
        ].map(({ key, label, placeholder }) => (
          <div key={key}>
            <label style={{ fontSize: 9, fontWeight: 700, color: M.textSub, display: 'block', marginBottom: 4, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</label>
            <input
              value={form[key]}
              onChange={e => set(key, e.target.value)}
              placeholder={placeholder}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = M.mocha}
              onBlur={e => e.target.style.borderColor = M.border}
            />
          </div>
        ))}

        {/* Language */}
        <div>
          <label style={{ fontSize: 9, fontWeight: 700, color: M.textSub, display: 'block', marginBottom: 4, letterSpacing: '0.04em', textTransform: 'uppercase' }}>언어</label>
          <select
            value={form.lang}
            onChange={e => { set('lang', e.target.value); set('flag', LANG_FLAG[e.target.value] || '🌍'); }}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            {Object.entries(LANG_NAME).map(([code, name]) => (
              <option key={code} value={code}>{LANG_FLAG[code]} {name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        <button
          onClick={onClose}
          style={{
            flex: 1, padding: '9px', borderRadius: 9, border: `1.5px solid ${M.border}`,
            background: M.bg, color: M.textSub, fontSize: 11, fontWeight: 600,
            cursor: 'pointer', fontFamily: SANS, letterSpacing: '-0.01em',
          }}
        >
          취소
        </button>
        <button
          onClick={handleCreate}
          disabled={creating || !form.name.trim()}
          style={{
            flex: 2, padding: '9px', borderRadius: 9, border: 'none',
            background: creating || !form.name.trim() ? M.border : M.mocha,
            color: creating || !form.name.trim() ? M.textMt : M.white,
            fontSize: 11, fontWeight: 700,
            cursor: creating || !form.name.trim() ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            fontFamily: SANS, letterSpacing: '-0.01em',
            boxShadow: creating || !form.name.trim() ? 'none' : `0 4px 12px ${M.mocha}40`,
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => { if (!creating && form.name.trim()) e.currentTarget.style.opacity = '0.85'; }}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          {creating
            ? <Loader2 size={11} style={{ animation: 'spin 0.7s linear infinite' }} />
            : <Check size={11} strokeWidth={2.5} />
          }
          {creating ? '등록 중...' : '환자 등록'}
        </button>
      </div>
    </div>
  );
}

// ── PatientBar ────────────────────────────────────────────────────────────────
export default function PatientBar({ usePatientHook }) {
  const { currentPatient, setCurrentPatient, searchResults, searching, searchPatients } = usePatientHook;
  const [open,    setOpen]    = useState(false);
  const [query,   setQuery]   = useState('');
  const [showNew, setShowNew] = useState(false);
  const inputRef    = useRef(null);
  const debounceRef = useRef(null);

  const handleQuery = useCallback((v) => {
    setQuery(v);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchPatients(v), 300);
  }, [searchPatients]);

  useEffect(() => {
    if (open && !showNew) setTimeout(() => inputRef.current?.focus(), 80);
  }, [open, showNew]);

  const selectPatient = (p) => {
    setCurrentPatient(p);
    setOpen(false);
    setQuery('');
    setShowNew(false);
  };

  const flag = currentPatient?.flag || LANG_FLAG[currentPatient?.lang] || '';
  const hasPatient = !!currentPatient;

  return (
    <div style={{ fontFamily: SANS, position: 'relative', zIndex: 100 }}>
      {/* 상단 바 */}
      <div
        onClick={() => { setOpen(v => !v); setShowNew(false); }}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '6px 14px',
          background: hasPatient ? M.mochaPale : M.bgSub,
          borderBottom: `1px solid ${hasPatient ? M.mocha + '50' : M.border}`,
          cursor: 'pointer', transition: 'all 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = hasPatient ? '#EDE0D8' : '#E5D9D0'}
        onMouseLeave={e => e.currentTarget.style.background = hasPatient ? M.mochaPale : M.bgSub}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{
            width: 18, height: 18, borderRadius: 5,
            background: hasPatient ? M.mocha : M.borderMd,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <User size={9} color="#fff" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: hasPatient ? M.mocha : M.textSub, letterSpacing: '-0.01em' }}>
            {hasPatient ? `${flag} ${currentPatient.name}` : '상담 환자 선택'}
          </span>
          {hasPatient && currentPatient.lang && (
            <span style={{ fontSize: 9, color: M.textMt }}>{LANG_NAME[currentPatient.lang] || currentPatient.lang}</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {hasPatient && (
            <button
              onClick={e => { e.stopPropagation(); setCurrentPatient(null); }}
              style={{ background: 'none', border: 'none', padding: 2, cursor: 'pointer', display: 'flex', lineHeight: 1, borderRadius: 4 }}
              onMouseEnter={e => e.currentTarget.style.background = M.border}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <X size={10} color={M.textMt} />
            </button>
          )}
          <ChevronDown
            size={10} color={M.textMt}
            style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
          />
        </div>
      </div>

      {/* 드롭다운 */}
      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0,
          background: M.white, border: `1.5px solid ${M.border}`, borderTop: 'none',
          borderRadius: '0 0 12px 12px',
          boxShadow: `0 12px 32px rgba(164,119,100,0.15), 0 4px 12px rgba(0,0,0,0.08)`,
          maxHeight: 360, overflowY: 'auto',
          zIndex: 200,
        }}>
          {showNew ? (
            <NewPatientForm
              usePatientHook={usePatientHook}
              onClose={() => setShowNew(false)}
              onCreated={selectPatient}
            />
          ) : (
            <>
              {/* 검색 */}
              <div style={{ padding: '10px 12px', borderBottom: `1px solid ${M.border}`, display: 'flex', gap: 7 }}>
                <div style={{
                  flex: 1, display: 'flex', alignItems: 'center', gap: 7,
                  background: M.bgSub, border: `1.5px solid ${M.border}`,
                  borderRadius: 9, padding: '6px 10px',
                }}>
                  {searching
                    ? <Loader2 size={12} color={M.mocha} style={{ animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
                    : <Search size={12} color={M.textMt} strokeWidth={2} />
                  }
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={e => handleQuery(e.target.value)}
                    placeholder="이름 · 전화번호 · 채널ID"
                    style={{
                      border: 'none', background: 'transparent',
                      fontSize: 12, fontFamily: SANS, color: M.text,
                      flex: 1, outline: 'none', letterSpacing: '-0.01em',
                    }}
                  />
                  {query && (
                    <button onClick={() => handleQuery('')} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', lineHeight: 1 }}>
                      <X size={10} color={M.textMt} />
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setShowNew(true)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4, padding: '6px 11px',
                    background: M.mocha, color: M.white, border: 'none', borderRadius: 9,
                    fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: SANS,
                    flexShrink: 0, letterSpacing: '-0.01em',
                    boxShadow: `0 3px 10px ${M.mocha}40`,
                  }}
                >
                  <UserPlus size={11} /> 신규
                </button>
              </div>

              {/* 결과 없음 */}
              {query.trim() && searchResults.length === 0 && !searching && (
                <div style={{ padding: '20px 14px', textAlign: 'center' }}>
                  <p style={{ fontSize: 11, color: M.textMt, marginBottom: 8 }}>검색 결과가 없습니다</p>
                  <button
                    onClick={() => setShowNew(true)}
                    style={{
                      fontSize: 11, fontWeight: 700, color: M.mocha,
                      background: M.mochaPale, border: `1px solid ${M.mocha}30`,
                      borderRadius: 7, padding: '6px 14px', cursor: 'pointer', fontFamily: SANS,
                    }}
                  >
                    + 신규 등록
                  </button>
                </div>
              )}

              {/* 검색 결과 */}
              {searchResults.map(p => (
                <PatientCard key={p.id} p={p} onSelect={selectPatient} />
              ))}

              {/* 기본 안내 */}
              {!query.trim() && (
                <div style={{ padding: '18px 14px', textAlign: 'center' }}>
                  <User size={20} color={M.border} style={{ margin: '0 auto 8px' }} />
                  <p style={{ fontSize: 11, color: M.textMt, letterSpacing: '-0.01em' }}>이름, 전화번호, 채널 ID로 검색</p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
