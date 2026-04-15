import { useState, useEffect, useCallback } from 'react';
import {
  Search, Plus, Pencil, Trash2, X, Check, ChevronDown, ChevronUp,
  Loader2, Database, Clipboard, AlertCircle, CheckSquare, Square,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// ─────────────────────────────────────────────────────────────────────────────
// 카테고리 라벨 (서버의 CATEGORY_LABELS 미러링)
// ─────────────────────────────────────────────────────────────────────────────
const CATEGORY_LABELS = {
  face:      '얼굴 시술',
  skin:      '피부 레이저',
  lifting:   '리프팅',
  body:      '바디 & 지방',
  hair:      '탈모 & 모발',
  wellness:  '웰니스 & 비타민',
  men:       '남성 시술',
  others:    '기타',
};

const CATEGORIES = Object.keys(CATEGORY_LABELS);

// ─────────────────────────────────────────────────────────────────────────────
// EditModal — 클리닉 시술 정보 수정
// ─────────────────────────────────────────────────────────────────────────────
function EditModal({ proc, darkMode, onSave, onClose }) {
  const [form, setForm] = useState({
    name_ko:      proc.name_ko      || '',
    price_range:  proc.price_range  || '',
    downtime:     proc.downtime     || '',
    duration:     proc.duration     || '',
    effects_ko:   Array.isArray(proc.effects_ko)  ? proc.effects_ko.join('\n')  : (proc.effects_ko  || ''),
    cautions_ko:  Array.isArray(proc.cautions_ko) ? proc.cautions_ko.join('\n') : (proc.cautions_ko || ''),
    faq_ko:       proc.faq_ko       || '',
    faq_en:       proc.faq_en       || '',
    faq_ja:       proc.faq_ja       || '',
    faq_zh:       proc.faq_zh       || '',
  });
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      ...form,
      effects_ko:  form.effects_ko.split('\n').map(s => s.trim()).filter(Boolean),
      cautions_ko: form.cautions_ko.split('\n').map(s => s.trim()).filter(Boolean),
    };
    await onSave(proc.id, payload);
    setSaving(false);
    onClose();
  };

  const modal = darkMode ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-slate-200';
  const input = darkMode
    ? 'bg-zinc-800 border-zinc-600 text-zinc-100 placeholder-zinc-500 focus:ring-zinc-400/30'
    : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-zinc-400';
  const label = darkMode ? 'text-zinc-400' : 'text-slate-500';
  const tabActive = darkMode
    ? 'bg-purple-600/20 text-purple-400 border-purple-600/40'
    : 'bg-zinc-900 text-white border-zinc-700';
  const tabInactive = darkMode
    ? 'text-zinc-500 hover:text-zinc-300 border-transparent'
    : 'text-slate-500 hover:text-slate-700 border-transparent';

  const TABS = [
    { id: 'basic', label: '기본 정보' },
    { id: 'faq',   label: 'FAQ' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className={`w-full max-w-2xl rounded-2xl shadow-2xl border flex flex-col max-h-[90vh] ${modal}`}>

        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${darkMode ? 'border-zinc-700' : 'border-slate-100'}`}>
          <div>
            <h3 className={`text-sm font-bold ${darkMode ? 'text-zinc-100' : 'text-slate-800'}`}>
              시술 정보 수정
            </h3>
            <p className={`text-xs mt-0.5 ${darkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
              {proc.name_ko}
            </p>
          </div>
          <button onClick={onClose} className={`p-1.5 rounded-lg transition-colors ${darkMode ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-slate-100 text-slate-500'}`}>
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className={`flex gap-1 px-6 pt-3 border-b ${darkMode ? 'border-zinc-800' : 'border-slate-100'}`}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-t-lg border-b-2 -mb-px transition-all ${
                activeTab === t.id ? tabActive : tabInactive
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          {activeTab === 'basic' && (
            <>
              <Field label="시술명 (한국어)" className={label}>
                <input value={form.name_ko} onChange={set('name_ko')}
                  className={`w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 ${input}`} />
              </Field>
              <Field label="가격 범위 (예: 5만~30만원)" className={label}>
                <input value={form.price_range} onChange={set('price_range')}
                  className={`w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 ${input}`} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="다운타임" className={label}>
                  <input value={form.downtime} onChange={set('downtime')}
                    className={`w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 ${input}`} />
                </Field>
                <Field label="지속 기간" className={label}>
                  <input value={form.duration} onChange={set('duration')}
                    className={`w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 ${input}`} />
                </Field>
              </div>
              <Field label="효과 (줄바꿈으로 구분)" className={label}>
                <textarea value={form.effects_ko} onChange={set('effects_ko')} rows={3}
                  className={`w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 resize-none ${input}`} />
              </Field>
              <Field label="주의사항 (줄바꿈으로 구분)" className={label}>
                <textarea value={form.cautions_ko} onChange={set('cautions_ko')} rows={2}
                  className={`w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 resize-none ${input}`} />
              </Field>
            </>
          )}

          {activeTab === 'faq' && (
            <>
              <Field label="FAQ — 한국어" className={label}>
                <textarea value={form.faq_ko} onChange={set('faq_ko')} rows={5}
                  placeholder="Q. 질문\nA. 답변"
                  className={`w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 resize-none font-mono text-xs ${input}`} />
              </Field>
              <Field label="FAQ — English" className={label}>
                <textarea value={form.faq_en} onChange={set('faq_en')} rows={4}
                  placeholder="Q. Question\nA. Answer"
                  className={`w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 resize-none font-mono text-xs ${input}`} />
              </Field>
              <Field label="FAQ — 日本語" className={label}>
                <textarea value={form.faq_ja} onChange={set('faq_ja')} rows={4}
                  placeholder="Q. 質問\nA. 回答"
                  className={`w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 resize-none font-mono text-xs ${input}`} />
              </Field>
              <Field label="FAQ — 中文" className={label}>
                <textarea value={form.faq_zh} onChange={set('faq_zh')} rows={4}
                  placeholder="Q. 问题\nA. 回答"
                  className={`w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 resize-none font-mono text-xs ${input}`} />
              </Field>
            </>
          )}
        </div>

        {/* Footer */}
        <div className={`flex gap-2.5 justify-end px-6 py-4 border-t ${darkMode ? 'border-zinc-700' : 'border-slate-100'}`}>
          <button onClick={onClose}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-colors ${
              darkMode ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}>
            취소
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-zinc-800 to-zinc-700 text-white hover:from-purple-500 hover:to-fuchsia-400 transition-all disabled:opacity-60">
            {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
            저장
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, className }) {
  return (
    <div>
      <label className={`block text-[11px] font-semibold uppercase tracking-wide mb-1.5 ${className}`}>
        {label}
      </label>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ProceduresTab
// ─────────────────────────────────────────────────────────────────────────────
export default function ProceduresTab({ darkMode }) {
  const { clinicId } = useAuth();

  // ── Master templates (left panel) ─────────────────────────────────────────
  const [templates,         setTemplates]         = useState([]);
  const [templatesLoading,  setTemplatesLoading]  = useState(true);
  const [templateError,     setTemplateError]     = useState(null);
  const [selectedCategory,  setSelectedCategory]  = useState('all');
  const [templateSearch,    setTemplateSearch]    = useState('');
  const [checkedIds,        setCheckedIds]        = useState(new Set());
  const [copying,           setCopying]           = useState(false);
  const [copySuccess,       setCopySuccess]       = useState(null); // message string

  // ── Clinic procedures (right panel) ───────────────────────────────────────
  const [clinicProcs,       setClinicProcs]       = useState([]);
  const [clinicLoading,     setClinicLoading]     = useState(true);
  const [clinicError,       setClinicError]       = useState(null);
  const [editingProc,       setEditingProc]       = useState(null);
  const [deletingId,        setDeletingId]        = useState(null);
  const [clinicSearch,      setClinicSearch]      = useState('');
  const [expandedId,        setExpandedId]        = useState(null);

  // ── Fetch master templates ─────────────────────────────────────────────────
  const fetchTemplates = useCallback(async () => {
    setTemplatesLoading(true);
    setTemplateError(null);
    try {
      const res = await fetch('/api/procedure-templates');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setTemplates(data.templates || []);
    } catch (err) {
      setTemplateError(err.message);
    } finally {
      setTemplatesLoading(false);
    }
  }, []);

  // ── Fetch clinic procedures ────────────────────────────────────────────────
  const fetchClinicProcs = useCallback(async () => {
    if (!clinicId) return;
    setClinicLoading(true);
    setClinicError(null);
    try {
      const res = await fetch(`/api/clinic-procedures?clinic_id=${clinicId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setClinicProcs(data.procedures || []);
    } catch (err) {
      setClinicError(err.message);
    } finally {
      setClinicLoading(false);
    }
  }, [clinicId]);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);
  useEffect(() => { fetchClinicProcs(); }, [fetchClinicProcs]);

  // ── Derived: already-added template_ids ───────────────────────────────────
  const addedTemplateIds = new Set(clinicProcs.map(p => p.template_id).filter(Boolean));

  // ── Filtered templates ─────────────────────────────────────────────────────
  const filteredTemplates = templates.filter(t => {
    const matchCat  = selectedCategory === 'all' || t.category === selectedCategory;
    const matchText = !templateSearch ||
      t.name_ko.includes(templateSearch) ||
      t.name_en.toLowerCase().includes(templateSearch.toLowerCase());
    return matchCat && matchText;
  });

  // ── Filtered clinic procs ──────────────────────────────────────────────────
  const filteredClinicProcs = clinicProcs.filter(p =>
    !clinicSearch || p.name_ko?.includes(clinicSearch) || p.name_en?.toLowerCase().includes(clinicSearch.toLowerCase())
  );

  // ── Copy selected templates → clinic ──────────────────────────────────────
  const handleCopy = async () => {
    if (checkedIds.size === 0 || !clinicId) return;
    setCopying(true);
    setCopySuccess(null);
    try {
      const res = await fetch('/api/clinic-procedures/copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clinic_id: clinicId, template_ids: Array.from(checkedIds) }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setCopySuccess(`${data.added ?? checkedIds.size}개 시술이 추가되었습니다`);
      setCheckedIds(new Set());
      await fetchClinicProcs();
    } catch (err) {
      setCopySuccess(`오류: ${err.message}`);
    } finally {
      setCopying(false);
      setTimeout(() => setCopySuccess(null), 3000);
    }
  };

  // ── Update clinic procedure ────────────────────────────────────────────────
  const handleUpdate = async (id, payload) => {
    const res = await fetch(`/api/clinic-procedures/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, clinic_id: clinicId }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    await fetchClinicProcs();
  };

  // ── Delete clinic procedure ────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('이 시술을 병원 목록에서 삭제할까요?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/clinic-procedures/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clinic_id: clinicId }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setClinicProcs(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert(`삭제 실패: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  // ── Toggle checkbox ────────────────────────────────────────────────────────
  const toggleCheck = (id) => {
    setCheckedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ── Select all visible ────────────────────────────────────────────────────
  const handleSelectAll = () => {
    const available = filteredTemplates.filter(t => !addedTemplateIds.has(t.template_id));
    if (available.every(t => checkedIds.has(t.template_id))) {
      setCheckedIds(prev => {
        const next = new Set(prev);
        available.forEach(t => next.delete(t.template_id));
        return next;
      });
    } else {
      setCheckedIds(prev => {
        const next = new Set(prev);
        available.forEach(t => next.add(t.template_id));
        return next;
      });
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Styles
  // ─────────────────────────────────────────────────────────────────────────
  const panel      = darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200';
  const panelTitle = darkMode ? 'text-zinc-100' : 'text-slate-800';
  const muted      = darkMode ? 'text-zinc-500' : 'text-slate-400';
  const inputCls   = darkMode
    ? 'bg-zinc-800 border-zinc-700 text-zinc-200 placeholder-zinc-600 focus:ring-zinc-400/30'
    : 'bg-slate-50 border-slate-200 text-slate-700 placeholder-slate-400 focus:ring-zinc-300';
  const rowHover   = darkMode ? 'hover:bg-zinc-800/70' : 'hover:bg-slate-50';
  const divider    = darkMode ? 'divide-zinc-800' : 'divide-slate-100';
  const border     = darkMode ? 'border-zinc-800' : 'border-slate-200';
  const catActive  = darkMode
    ? 'bg-zinc-900 text-zinc-100 border-zinc-700'
    : 'bg-zinc-900 text-white border-zinc-700';
  const catInact   = darkMode
    ? 'text-zinc-500 hover:text-zinc-300 border-zinc-700 hover:border-zinc-600'
    : 'text-slate-500 hover:text-slate-700 border-slate-200 hover:border-slate-300';

  const availableChecked = filteredTemplates.filter(t =>
    !addedTemplateIds.has(t.template_id) && checkedIds.has(t.template_id)
  ).length;

  return (
    <div className={`flex flex-1 min-w-0 overflow-hidden gap-0 ${darkMode ? 'bg-zinc-950' : 'bg-slate-100'}`}>

      {/* ══════════════════════════════════════════════════════════════════════
          LEFT PANEL — Master Templates
         ══════════════════════════════════════════════════════════════════════ */}
      <div className={`w-[360px] shrink-0 flex flex-col border-r ${panel} ${border}`}>

        {/* Header */}
        <div className={`px-5 py-4 border-b ${border}`}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center">
                <Database size={12} className="text-white" />
              </div>
              <h2 className={`text-sm font-bold ${panelTitle}`}>마스터 시술 목록</h2>
            </div>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
              darkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-400' : 'bg-slate-100 border-slate-200 text-slate-500'
            }`}>
              {templates.length}개 표준 시술
            </span>
          </div>
          <p className={`text-[11px] ${muted}`}>원하는 시술을 선택해 병원 목록에 추가하세요</p>
        </div>

        {/* Search */}
        <div className={`px-4 py-2.5 border-b ${border}`}>
          <div className="relative">
            <Search size={12} className={`absolute left-3 top-1/2 -translate-y-1/2 ${muted}`} />
            <input
              value={templateSearch}
              onChange={e => setTemplateSearch(e.target.value)}
              placeholder="시술명 검색..."
              className={`w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border focus:outline-none focus:ring-2 ${inputCls}`}
            />
          </div>
        </div>

        {/* Category filter */}
        <div className={`px-4 py-2 border-b ${border} flex gap-1.5 flex-wrap`}>
          <button
            onClick={() => setSelectedCategory('all')}
            className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-all ${
              selectedCategory === 'all' ? catActive : catInact
            }`}
          >
            전체
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-all ${
                selectedCategory === cat ? catActive : catInact
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {/* Template list */}
        <div className={`flex-1 overflow-y-auto divide-y ${divider}`}>
          {templatesLoading ? (
            <div className="flex items-center justify-center py-16 gap-2">
              <Loader2 size={16} className={`animate-spin ${muted}`} />
              <span className={`text-xs ${muted}`}>불러오는 중...</span>
            </div>
          ) : templateError ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2 px-6 text-center">
              <AlertCircle size={20} className="text-red-400" />
              <p className="text-xs text-red-400">{templateError}</p>
              <button onClick={fetchTemplates} className="text-xs text-purple-400 hover:underline mt-1">다시 시도</button>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className={`flex flex-col items-center justify-center py-16 gap-1 ${muted}`}>
              <Database size={20} strokeWidth={1.3} />
              <p className="text-xs">검색 결과가 없습니다</p>
            </div>
          ) : (
            filteredTemplates.map(t => {
              const isAdded   = addedTemplateIds.has(t.template_id);
              const isChecked = checkedIds.has(t.template_id);
              return (
                <label
                  key={t.template_id}
                  className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors
                    ${isAdded ? (darkMode ? 'opacity-40' : 'opacity-40') : rowHover}
                  `}
                >
                  <div className="mt-0.5 shrink-0">
                    {isAdded ? (
                      <div className="w-4 h-4 rounded flex items-center justify-center bg-emerald-500">
                        <Check size={9} className="text-white" />
                      </div>
                    ) : (
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => !isAdded && toggleCheck(t.template_id)}
                        disabled={isAdded}
                        className="w-4 h-4 rounded accent-purple-600 cursor-pointer"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-xs font-semibold ${darkMode ? 'text-zinc-200' : 'text-slate-700'}`}>
                        {t.name_ko}
                      </span>
                      <span className={`text-[10px] ${muted}`}>{t.name_en}</span>
                      {isAdded && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                          추가됨
                        </span>
                      )}
                    </div>
                    <p className={`text-[10px] mt-0.5 line-clamp-1 ${muted}`}>{t.description_ko}</p>
                    <div className="flex gap-2 mt-1">
                      <span className={`text-[10px] font-medium ${darkMode ? 'text-amber-400/80' : 'text-amber-600'}`}>
                        💰 {t.price_range}
                      </span>
                      <span className={`text-[10px] ${muted}`}>⏱ {t.downtime}</span>
                    </div>
                  </div>
                </label>
              );
            })
          )}
        </div>

        {/* Bottom action bar */}
        <div className={`px-4 py-3 border-t ${border} flex items-center gap-2`}>
          <button
            onClick={handleSelectAll}
            className={`flex items-center gap-1.5 text-[11px] font-medium transition-colors ${
              darkMode ? 'text-zinc-400 hover:text-zinc-200' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {filteredTemplates.filter(t => !addedTemplateIds.has(t.template_id)).every(t => checkedIds.has(t.template_id)) && filteredTemplates.filter(t => !addedTemplateIds.has(t.template_id)).length > 0
              ? <CheckSquare size={13} className="text-purple-500" />
              : <Square size={13} />
            }
            전체 선택
          </button>

          <div className="flex-1" />

          {copySuccess && (
            <span className={`text-[11px] font-semibold ${
              copySuccess.startsWith('오류') ? 'text-red-500' : 'text-emerald-600'
            }`}>
              {copySuccess}
            </span>
          )}

          <button
            onClick={handleCopy}
            disabled={availableChecked === 0 || copying || !clinicId}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm
              ${availableChecked > 0 && !copying
                ? 'bg-gradient-to-r from-zinc-800 to-zinc-700 text-white hover:from-purple-500 hover:to-fuchsia-400'
                : darkMode
                  ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
          >
            {copying
              ? <Loader2 size={12} className="animate-spin" />
              : <Plus size={12} />
            }
            {availableChecked > 0 ? `${availableChecked}개 추가` : '병원에 추가'}
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          RIGHT PANEL — Clinic Procedures
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-1 min-w-0 flex-col overflow-hidden">

        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between shrink-0 ${
          darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
        }`}>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center">
                <Clipboard size={12} className="text-white" />
              </div>
              <h2 className={`text-sm font-bold ${panelTitle}`}>우리 병원 시술 목록</h2>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                darkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-400' : 'bg-slate-100 border-slate-200 text-slate-500'
              }`}>
                {clinicProcs.length}개
              </span>
            </div>
            <p className={`text-[11px] ${muted}`}>가격·FAQ·다운타임 등을 자유롭게 수정하세요</p>
          </div>

          {/* Clinic search */}
          <div className="relative w-52">
            <Search size={12} className={`absolute left-3 top-1/2 -translate-y-1/2 ${muted}`} />
            <input
              value={clinicSearch}
              onChange={e => setClinicSearch(e.target.value)}
              placeholder="시술 검색..."
              className={`w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border focus:outline-none focus:ring-2 ${inputCls}`}
            />
          </div>
        </div>

        {/* Procedures list */}
        <div className={`flex-1 overflow-y-auto divide-y ${divider} ${darkMode ? 'bg-zinc-900' : 'bg-white'}`}>
          {clinicLoading ? (
            <div className="flex items-center justify-center py-24 gap-2">
              <Loader2 size={18} className={`animate-spin ${muted}`} />
              <span className={`text-sm ${muted}`}>불러오는 중...</span>
            </div>
          ) : clinicError ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 px-8 text-center">
              <AlertCircle size={24} className="text-red-400" />
              <p className="text-sm text-red-400 font-medium">{clinicError}</p>
              <button onClick={fetchClinicProcs} className="text-xs text-purple-400 hover:underline">다시 시도</button>
            </div>
          ) : filteredClinicProcs.length === 0 ? (
            <div className={`flex flex-col items-center justify-center py-24 gap-3 ${muted}`}>
              <Clipboard size={36} strokeWidth={1.2} />
              <div className="text-center">
                <p className={`text-sm font-semibold ${darkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  {clinicSearch ? '검색 결과가 없습니다' : '등록된 시술이 없습니다'}
                </p>
                {!clinicSearch && (
                  <p className={`text-xs mt-1 ${muted}`}>왼쪽 목록에서 시술을 선택해 추가해 보세요</p>
                )}
              </div>
            </div>
          ) : (
            filteredClinicProcs.map(p => {
              const isExpanded = expandedId === p.id;
              const isDeleting = deletingId === p.id;
              return (
                <div key={p.id} className={`transition-colors ${rowHover}`}>
                  {/* Row header */}
                  <div className="flex items-center px-6 py-3.5 gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-sm font-semibold ${darkMode ? 'text-zinc-100' : 'text-slate-800'}`}>
                          {p.name_ko}
                        </span>
                        {p.category && (
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            darkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-400' : 'bg-slate-100 border-slate-200 text-slate-500'
                          }`}>
                            {CATEGORY_LABELS[p.category] || p.category}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        {p.price_range && (
                          <span className={`text-[11px] font-medium ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                            💰 {p.price_range}
                          </span>
                        )}
                        {p.downtime && (
                          <span className={`text-[11px] ${muted}`}>⏱ {p.downtime}</span>
                        )}
                        {p.duration && (
                          <span className={`text-[11px] ${muted}`}>📅 {p.duration}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Expand/collapse */}
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : p.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          darkMode ? 'text-zinc-500 hover:bg-zinc-700 hover:text-zinc-300' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                        }`}
                        title="상세 보기"
                      >
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => setEditingProc(p)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          darkMode ? 'text-zinc-500 hover:bg-zinc-700 hover:text-zinc-300' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                        }`}
                        title="수정"
                      >
                        <Pencil size={13} />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(p.id)}
                        disabled={isDeleting}
                        className={`p-1.5 rounded-lg transition-colors ${
                          darkMode ? 'text-zinc-600 hover:bg-red-900/30 hover:text-red-400' : 'text-slate-300 hover:bg-red-50 hover:text-red-500'
                        }`}
                        title="삭제"
                      >
                        {isDeleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className={`px-6 pb-4 pt-0 border-t ${border} mt-0`}>
                      <div className="grid grid-cols-2 gap-4 mt-3">
                        {/* Effects */}
                        {p.effects_ko?.length > 0 && (
                          <div>
                            <p className={`text-[10px] font-bold uppercase tracking-wide mb-1.5 ${muted}`}>효과</p>
                            <ul className="space-y-0.5">
                              {(Array.isArray(p.effects_ko) ? p.effects_ko : [p.effects_ko]).map((e, i) => (
                                <li key={i} className={`text-[11px] flex gap-1.5 ${darkMode ? 'text-zinc-300' : 'text-slate-600'}`}>
                                  <span className="text-emerald-500 mt-0.5">✓</span>
                                  {e}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Cautions */}
                        {p.cautions_ko?.length > 0 && (
                          <div>
                            <p className={`text-[10px] font-bold uppercase tracking-wide mb-1.5 ${muted}`}>주의사항</p>
                            <ul className="space-y-0.5">
                              {(Array.isArray(p.cautions_ko) ? p.cautions_ko : [p.cautions_ko]).map((c, i) => (
                                <li key={i} className={`text-[11px] flex gap-1.5 ${darkMode ? 'text-zinc-300' : 'text-slate-600'}`}>
                                  <span className="text-amber-500 mt-0.5">⚠</span>
                                  {c}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* FAQ preview */}
                      {p.faq_ko && (
                        <div className="mt-3">
                          <p className={`text-[10px] font-bold uppercase tracking-wide mb-1.5 ${muted}`}>FAQ (한국어 미리보기)</p>
                          <pre className={`text-[11px] leading-relaxed whitespace-pre-wrap font-sans line-clamp-4 ${
                            darkMode ? 'text-zinc-400' : 'text-slate-500'
                          }`}>
                            {p.faq_ko}
                          </pre>
                        </div>
                      )}

                      <button
                        onClick={() => setEditingProc(p)}
                        className={`mt-3 flex items-center gap-1.5 text-[11px] font-semibold transition-colors ${
                          darkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'
                        }`}
                      >
                        <Pencil size={11} />
                        가격·FAQ 수정하기
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer notice */}
        <div className={`px-6 py-2.5 border-t flex items-center gap-2 shrink-0 ${
          darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <AlertCircle size={11} className={muted} />
          <p className={`text-[10px] ${muted}`}>
            수정된 정보는 AI 상담 답변에 즉시 반영됩니다 · 모든 데이터는 클리닉 ID로 격리됩니다
          </p>
        </div>
      </div>

      {/* ── Edit Modal ── */}
      {editingProc && (
        <EditModal
          proc={editingProc}
          darkMode={darkMode}
          onSave={handleUpdate}
          onClose={() => setEditingProc(null)}
        />
      )}
    </div>
  );
}
