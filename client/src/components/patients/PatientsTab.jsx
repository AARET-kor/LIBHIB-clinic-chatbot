import { useState, useMemo } from 'react';
import {
  Search, Plus, Upload, X, ChevronDown, ChevronRight,
  Edit3, Save, Phone, MessageSquare, Instagram,
  Calendar, DollarSign, Activity, FileText, Star
} from 'lucide-react';

// ── Dummy Patient Data (20명) ─────────────────────────────────────────────────
const ALL_PATIENTS = [
  {
    id: 'p001', name: '田中 ゆき', nameEn: 'Yuki Tanaka', flag: '🇯🇵', country: '일본',
    lang: 'JA', gender: 'F', age: 28, channel: 'instagram',
    procedure: '보톡스', lastVisit: '2026-04-05', nextBooking: '2026-04-20',
    status: 'consulting', totalSpent: 1250000,
    phone: '+81-90-xxxx-1234', email: 'yuki.t@email.jp',
    note: '통증에 매우 예민함. 일본어만 가능. 항상 오전 예약 선호.',
    tags: ['VIP', '노쇼경고'],
    timeline: [
      { date: '2026-04-05', type: 'chat', text: '보톡스 관련 문의 — AI 답변 자동 발송', icon: '💬' },
      { date: '2026-03-10', type: 'visit', text: '리쥬란 힐러 시술 완료', icon: '✅' },
      { date: '2026-03-11', type: 'aftercare', text: 'D+1 애프터케어 메시지 자동 발송', icon: '📩' },
      { date: '2026-02-15', type: 'visit', text: '첫 방문 — 보톡스 이마 시술', icon: '🏥' },
    ],
  },
  {
    id: 'p002', name: '佐藤 花子', nameEn: 'Hanako Sato', flag: '🇯🇵', country: '일본',
    lang: 'JA', gender: 'F', age: 35, channel: 'instagram',
    procedure: '리쥬란 힐러', lastVisit: '2026-04-01', nextBooking: '2026-04-15',
    status: 'booked', totalSpent: 2100000,
    phone: '+81-90-xxxx-5678', email: 'hanako.s@email.jp',
    note: '재방문 고객. SNS 후기 게시 동의. 팔로워 2만명.',
    tags: ['VIP', '인플루언서'],
    timeline: [
      { date: '2026-04-01', type: 'booking', text: '4/15 리쥬란 예약 확정', icon: '📅' },
      { date: '2026-03-01', type: 'visit', text: '쁘띠 필러 시술 완료', icon: '✅' },
      { date: '2026-02-01', type: 'visit', text: '리쥬란 2회차', icon: '✅' },
    ],
  },
  {
    id: 'p003', name: '山田 太郎', nameEn: 'Taro Yamada', flag: '🇯🇵', country: '일본',
    lang: 'JA', gender: 'M', age: 42, channel: 'instagram',
    procedure: '실리프팅', lastVisit: '2026-03-15', nextBooking: null,
    status: 'done', totalSpent: 3800000,
    phone: '+81-90-xxxx-9012', email: 'taro.y@email.jp',
    note: '토요일 예약만 가능. 영어 약간 가능. 고액 결제 고객.',
    tags: ['VIP'],
    timeline: [
      { date: '2026-03-15', type: 'visit', text: '실리프팅 + 보톡스 패키지 시술', icon: '✅' },
      { date: '2026-03-16', type: 'aftercare', text: 'D+1 케어 메시지 발송', icon: '📩' },
      { date: '2026-03-18', type: 'aftercare', text: 'D+3 케어 메시지 발송', icon: '📩' },
    ],
  },
  {
    id: 'p004', name: 'Sarah Johnson', nameEn: 'Sarah Johnson', flag: '🇺🇸', country: '미국',
    lang: 'EN', gender: 'F', age: 31, channel: 'whatsapp',
    procedure: '히알루론산 필러', lastVisit: '2026-04-03', nextBooking: '2026-04-18',
    status: 'booked', totalSpent: 1900000,
    phone: '+1-310-xxx-1234', email: 'sarah.j@email.com',
    note: '인스타 인플루언서 @sarahj (팔로워 12만). 결과 공유 동의.',
    tags: ['인플루언서', 'SNS허락'],
    timeline: [
      { date: '2026-04-03', type: 'booking', text: '4/18 필러 시술 예약', icon: '📅' },
      { date: '2026-03-10', type: 'visit', text: '리프팅 시술 완료', icon: '✅' },
    ],
  },
  {
    id: 'p005', name: 'Michael Chen', nameEn: 'Michael Chen', flag: '🇺🇸', country: '미국',
    lang: 'EN', gender: 'M', age: 38, channel: 'whatsapp',
    procedure: '보톡스 + 필러', lastVisit: '2026-03-28', nextBooking: null,
    status: 'care', totalSpent: 2750000,
    phone: '+1-213-xxx-5678', email: 'michael.c@email.com',
    note: 'USD 카드 결제 선호. 영어 외 중국어도 가능.',
    tags: ['VIP'],
    timeline: [
      { date: '2026-03-28', type: 'visit', text: '보톡스+필러 콤보 시술', icon: '✅' },
      { date: '2026-03-29', type: 'aftercare', text: 'D+1 케어 발송', icon: '📩' },
      { date: '2026-03-31', type: 'aftercare', text: 'D+3 케어 발송', icon: '📩' },
    ],
  },
  {
    id: 'p006', name: '김하늘', nameEn: 'Kim Haneul', flag: '🇰🇷', country: '한국',
    lang: 'KO', gender: 'F', age: 25, channel: 'kakaotalk',
    procedure: '쁘띠 성형', lastVisit: '2026-04-06', nextBooking: '2026-04-19',
    status: 'booked', totalSpent: 890000,
    phone: '010-xxxx-1234', email: 'haneul.k@email.kr',
    note: '직장인. 주말 예약만 가능. 학생 할인 문의 있었음.',
    tags: [],
    timeline: [
      { date: '2026-04-06', type: 'booking', text: '4/19 쁘띠 시술 예약', icon: '📅' },
      { date: '2026-03-08', type: 'visit', text: '보톡스 첫 시술', icon: '✅' },
    ],
  },
  {
    id: 'p007', name: '박준호', nameEn: 'Park Junho', flag: '🇰🇷', country: '한국',
    lang: 'KO', gender: 'M', age: 22, channel: 'kakaotalk',
    procedure: '여드름 레이저', lastVisit: '2026-01-10', nextBooking: null,
    status: 'dormant', totalSpent: 450000,
    phone: '010-xxxx-5678', email: 'junho.p@email.kr',
    note: '6개월 이상 미방문. 리마케팅 필요.',
    tags: ['휴면'],
    timeline: [
      { date: '2026-01-10', type: 'visit', text: '여드름 레이저 2회차', icon: '✅' },
      { date: '2025-12-05', type: 'visit', text: '여드름 레이저 1회차', icon: '✅' },
    ],
  },
  {
    id: 'p008', name: '李美玲', nameEn: 'Li Meiling', flag: '🇨🇳', country: '중국',
    lang: 'ZH', gender: 'F', age: 29, channel: 'instagram',
    procedure: '레이저 미백', lastVisit: '2026-04-04', nextBooking: '2026-04-21',
    status: 'consulting', totalSpent: 1650000,
    phone: '+86-138-xxxx-1234', email: 'meiling@email.cn',
    note: '샤오홍슈 인플루언서 (팔로워 8만). 촬영 동의.',
    tags: ['인플루언서', 'SNS허락'],
    timeline: [
      { date: '2026-04-04', type: 'chat', text: '레이저 미백 상담 진행 중', icon: '💬' },
      { date: '2026-03-20', type: 'visit', text: '리쥬란 시술', icon: '✅' },
    ],
  },
  {
    id: 'p009', name: '王芳', nameEn: 'Wang Fang', flag: '🇨🇳', country: '중국',
    lang: 'ZH', gender: 'F', age: 27, channel: 'instagram',
    procedure: '쌍꺼풀 수술', lastVisit: '2026-03-20', nextBooking: '2026-05-10',
    status: 'booked', totalSpent: 2900000,
    phone: '+86-139-xxxx-5678', email: 'wangfang@email.cn',
    note: '수술 후 SNS 게시 동의. 회복 기간 고려 5월 예약.',
    tags: ['VIP', 'SNS허락'],
    timeline: [
      { date: '2026-03-20', type: 'visit', text: '필러 시술 완료', icon: '✅' },
      { date: '2026-05-10', type: 'booking', text: '쌍꺼풀 수술 예약 확정', icon: '📅' },
    ],
  },
  {
    id: 'p010', name: '陈建国', nameEn: 'Chen Jianguo', flag: '🇨🇳', country: '중국',
    lang: 'ZH', gender: 'M', age: 45, channel: 'whatsapp',
    procedure: '남성 안티에이징', lastVisit: '2026-03-10', nextBooking: null,
    status: 'done', totalSpent: 1200000,
    phone: '+86-135-xxxx-9012', email: 'jianguo@email.cn',
    note: '회사 임원. 단체 예약 가능성 있음. 비밀 유지 중요.',
    tags: ['VIP'],
    timeline: [
      { date: '2026-03-10', type: 'visit', text: '남성 보톡스 시술', icon: '✅' },
      { date: '2026-01-20', type: 'visit', text: '첫 방문 — 피부 상담', icon: '🏥' },
    ],
  },
  {
    id: 'p011', name: 'Nguyen Thi Mai', nameEn: 'Nguyen Thi Mai', flag: '🇻🇳', country: '베트남',
    lang: 'VI', gender: 'F', age: 24, channel: 'instagram',
    procedure: '코 필러', lastVisit: '2026-04-02', nextBooking: '2026-04-16',
    status: 'consulting', totalSpent: 750000,
    phone: '+84-90-xxx-1234', email: 'mai.nt@email.vn',
    note: '영어 가능. 베트남어 응대 선호.',
    tags: [],
    timeline: [
      { date: '2026-04-02', type: 'chat', text: '코 필러 가격 문의', icon: '💬' },
    ],
  },
  {
    id: 'p012', name: 'Tran Van Duc', nameEn: 'Tran Van Duc', flag: '🇻🇳', country: '베트남',
    lang: 'VI', gender: 'M', age: 33, channel: 'instagram',
    procedure: '리쥬란 힐러', lastVisit: '2026-03-25', nextBooking: '2026-04-22',
    status: 'booked', totalSpent: 980000,
    phone: '+84-91-xxx-5678', email: 'duc.tv@email.vn',
    note: '',
    tags: [],
    timeline: [
      { date: '2026-03-25', type: 'visit', text: '리쥬란 1회차', icon: '✅' },
      { date: '2026-04-22', type: 'booking', text: '2회차 예약', icon: '📅' },
    ],
  },
  {
    id: 'p013', name: 'Siriluk Chaiya', nameEn: 'Siriluk Chaiya', flag: '🇹🇭', country: '태국',
    lang: 'TH', gender: 'F', age: 30, channel: 'instagram',
    procedure: '보톡스 + 스킨부스터', lastVisit: '2026-03-30', nextBooking: null,
    status: 'care', totalSpent: 1450000,
    phone: '+66-8-xxxx-1234', email: 'siriluk@email.th',
    note: 'K-뷰티 유튜브 채널 운영. 영어 가능.',
    tags: ['인플루언서'],
    timeline: [
      { date: '2026-03-30', type: 'visit', text: '보톡스+스킨부스터 시술', icon: '✅' },
      { date: '2026-03-31', type: 'aftercare', text: 'D+1 케어 발송', icon: '📩' },
      { date: '2026-04-02', type: 'aftercare', text: 'D+3 케어 발송', icon: '📩' },
    ],
  },
  {
    id: 'p014', name: 'Pattaraporn K.', nameEn: 'Pattaraporn K.', flag: '🇹🇭', country: '태국',
    lang: 'TH', gender: 'F', age: 38, channel: 'instagram',
    procedure: '실리프팅', lastVisit: '2026-03-05', nextBooking: '2026-09-01',
    status: 'done', totalSpent: 3200000,
    phone: '+66-8-xxxx-5678', email: 'patta@email.th',
    note: '연 2회 정기 방문 고객. 매우 만족도 높음.',
    tags: ['VIP'],
    timeline: [
      { date: '2026-03-05', type: 'visit', text: '실리프팅 연간 2회차', icon: '✅' },
      { date: '2025-09-10', type: 'visit', text: '실리프팅 연간 1회차', icon: '✅' },
    ],
  },
  {
    id: 'p015', name: 'Ahmed Al-Rashidi', nameEn: 'Ahmed Al-Rashidi', flag: '🇸🇦', country: '사우디',
    lang: 'AR', gender: 'M', age: 36, channel: 'whatsapp',
    procedure: '안면 성형 상담', lastVisit: '2026-04-07', nextBooking: '2026-05-15',
    status: 'booked', totalSpent: 0,
    phone: '+966-5x-xxxx-1234', email: 'ahmed.r@email.sa',
    note: '라마단 이후 방문 예약. 아랍어만 가능. 남성 의사 상담 선호.',
    tags: ['신규'],
    timeline: [
      { date: '2026-04-07', type: 'chat', text: '안면 성형 초기 상담', icon: '💬' },
      { date: '2026-05-15', type: 'booking', text: '대면 상담 예약 확정', icon: '📅' },
    ],
  },
  {
    id: 'p016', name: 'Fatima Al-Amri', nameEn: 'Fatima Al-Amri', flag: '🇦🇪', country: 'UAE',
    lang: 'AR', gender: 'F', age: 28, channel: 'whatsapp',
    procedure: '히알루론산 필러', lastVisit: '2026-04-05', nextBooking: '2026-04-25',
    status: 'consulting', totalSpent: 1100000,
    phone: '+971-5x-xxxx-5678', email: 'fatima.a@email.ae',
    note: '여성 의사 또는 여성 코디네이터 응대 요청.',
    tags: [],
    timeline: [
      { date: '2026-04-05', type: 'chat', text: '필러 관련 상세 문의', icon: '💬' },
      { date: '2026-03-15', type: 'visit', text: '스킨케어 패키지', icon: '✅' },
    ],
  },
  {
    id: 'p017', name: 'Olga Petrova', nameEn: 'Olga Petrova', flag: '🇷🇺', country: '러시아',
    lang: 'RU', gender: 'F', age: 34, channel: 'whatsapp',
    procedure: '레이저 토닝', lastVisit: '2026-02-15', nextBooking: null,
    status: 'done', totalSpent: 870000,
    phone: '+7-9xx-xxx-1234', email: 'olga.p@email.ru',
    note: 'AI 러시아어 번역 만족도 높음. 영어도 가능.',
    tags: [],
    timeline: [
      { date: '2026-02-15', type: 'visit', text: '레이저 토닝 3회차 완료', icon: '✅' },
    ],
  },
  {
    id: 'p018', name: 'Ivan Volkov', nameEn: 'Ivan Volkov', flag: '🇷🇺', country: '러시아',
    lang: 'RU', gender: 'M', age: 41, channel: 'whatsapp',
    procedure: '탈모 치료', lastVisit: '2025-12-20', nextBooking: null,
    status: 'dormant', totalSpent: 620000,
    phone: '+7-9xx-xxx-5678', email: 'ivan.v@email.ru',
    note: '장기 미방문. 재유입 캠페인 대상.',
    tags: ['휴면'],
    timeline: [
      { date: '2025-12-20', type: 'visit', text: '탈모 치료 2회차', icon: '✅' },
    ],
  },
  {
    id: 'p019', name: 'Sophie Dubois', nameEn: 'Sophie Dubois', flag: '🇫🇷', country: '프랑스',
    lang: 'FR', gender: 'F', age: 42, channel: 'instagram',
    procedure: '보톡스', lastVisit: '2026-04-01', nextBooking: null,
    status: 'care', totalSpent: 750000,
    phone: '+33-6-xx-xx-1234', email: 'sophie.d@email.fr',
    note: '파리 귀국 후 D+7 애프터케어 진행 중.',
    tags: [],
    timeline: [
      { date: '2026-04-01', type: 'visit', text: '보톡스 이마+미간 시술', icon: '✅' },
      { date: '2026-04-02', type: 'aftercare', text: 'D+1 케어 메시지 발송', icon: '📩' },
      { date: '2026-04-04', type: 'aftercare', text: 'D+3 케어 메시지 발송', icon: '📩' },
    ],
  },
  {
    id: 'p020', name: 'James Wilson', nameEn: 'James Wilson', flag: '🇦🇺', country: '호주',
    lang: 'EN', gender: 'M', age: 48, channel: 'whatsapp',
    procedure: '남성 안티에이징 패키지', lastVisit: '2026-04-06', nextBooking: '2026-10-01',
    status: 'booked', totalSpent: 4200000,
    phone: '+61-4xx-xxx-123', email: 'james.w@email.au',
    note: '시드니 사업가. 연 2회 방문. 최고 등급 VIP.',
    tags: ['VIP'],
    timeline: [
      { date: '2026-04-06', type: 'visit', text: '안티에이징 풀 패키지 시술', icon: '✅' },
      { date: '2026-10-01', type: 'booking', text: '하반기 예약 확정', icon: '📅' },
    ],
  },
];

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS = {
  consulting: { label: '상담 중', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  booked:     { label: '예약확정', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  done:       { label: '시술완료', color: 'bg-sky-100 text-sky-700 border-sky-200' },
  care:       { label: '케어중', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  dormant:    { label: '휴면', color: 'bg-slate-100 text-slate-500 border-slate-200' },
};

const CHANNELS = {
  instagram:  { label: 'Instagram', color: 'text-pink-600', bg: 'bg-pink-50', icon: '📸' },
  whatsapp:   { label: 'WhatsApp',  color: 'text-emerald-600', bg: 'bg-emerald-50', icon: '💬' },
  kakaotalk:  { label: 'KakaoTalk', color: 'text-amber-600', bg: 'bg-amber-50', icon: '💛' },
};

const TAG_COLORS = {
  'VIP':      'bg-amber-100 text-amber-700 border-amber-200',
  '인플루언서':  'bg-pink-100 text-pink-700 border-pink-200',
  'SNS허락':   'bg-sky-100 text-sky-700 border-sky-200',
  '휴면':      'bg-slate-100 text-slate-500 border-slate-200',
  '신규':      'bg-violet-100 text-violet-700 border-violet-200',
  '노쇼경고':  'bg-red-100 text-red-700 border-red-200',
};

// ── Format helpers ────────────────────────────────────────────────────────────
const fmt = (n) => n > 0 ? `₩${(n / 10000).toFixed(0)}만` : '—';
const fmtFull = (n) => n > 0 ? `₩${n.toLocaleString()}` : '—';

// ── Patient Drawer ────────────────────────────────────────────────────────────
function PatientDrawer({ patient, onClose }) {
  const [tab, setTab] = useState('info');
  const [editMode, setEditMode] = useState(false);
  const [note, setNote] = useState(patient.note);

  if (!patient) return null;
  const st = STATUS[patient.status];
  const ch = CHANNELS[patient.channel];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-30"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-[400px] bg-white border-l border-slate-200 shadow-2xl z-40 flex flex-col animate-[slideInRight_0.2s_ease-out]">
        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-100 to-fuchsia-100 border border-purple-200 flex items-center justify-center text-xl">
                {patient.flag}
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">{patient.name}</h2>
                <p className="text-xs text-slate-500">{patient.nameEn}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[11px] text-slate-500">{patient.country} · {patient.age}세 · {patient.gender === 'F' ? '여' : '남'}</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Status + channel badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${st.color}`}>
              {st.label}
            </span>
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${ch.bg} ${ch.color}`}>
              {ch.icon} {ch.label}
            </span>
            {patient.tags.map(tag => (
              <span key={tag} className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${TAG_COLORS[tag] || 'bg-slate-100 text-slate-600'}`}>
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-5 shrink-0">
          {[
            { id: 'info', label: '기본 정보' },
            { id: 'timeline', label: '시술 이력' },
            { id: 'note', label: '메모' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors -mb-px ${
                tab === t.id
                  ? 'border-purple-500 text-purple-700'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">

          {/* ── 기본 정보 ── */}
          {tab === 'info' && (
            <div className="space-y-4">
              {/* Key stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
                  <p className="text-[10px] text-purple-500 font-medium mb-0.5">누적 결제액</p>
                  <p className="text-lg font-extrabold text-purple-700">{fmt(patient.totalSpent)}</p>
                  <p className="text-[10px] text-purple-400">{fmtFull(patient.totalSpent)}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-[10px] text-slate-500 font-medium mb-0.5">최근 시술</p>
                  <p className="text-sm font-bold text-slate-800">{patient.procedure}</p>
                  <p className="text-[10px] text-slate-400">{patient.lastVisit}</p>
                </div>
              </div>

              {/* Contact info */}
              <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
                <div className="flex items-center gap-3 px-4 py-3">
                  <Phone size={14} className="text-slate-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400">연락처</p>
                    <p className="text-xs font-medium text-slate-800">{patient.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-4 py-3">
                  <MessageSquare size={14} className="text-slate-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400">유입 채널</p>
                    <p className="text-xs font-medium text-slate-800">{ch.icon} {ch.label}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-4 py-3">
                  <Calendar size={14} className="text-slate-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400">다음 예약</p>
                    <p className="text-xs font-medium text-slate-800">
                      {patient.nextBooking || '예약 없음'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-4 py-3">
                  <DollarSign size={14} className="text-slate-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400">총 결제</p>
                    <p className="text-xs font-medium text-slate-800">{fmtFull(patient.totalSpent)}</p>
                  </div>
                </div>
              </div>

              {/* Edit button */}
              <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-purple-200 text-purple-700 text-xs font-semibold hover:bg-purple-50 transition-colors">
                <Edit3 size={13} /> 정보 수정
              </button>
            </div>
          )}

          {/* ── 시술 이력 타임라인 ── */}
          {tab === 'timeline' && (
            <div className="relative">
              <div className="absolute left-3.5 top-0 bottom-0 w-px bg-slate-200" />
              <div className="space-y-4 pl-8">
                {patient.timeline.map((item, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[22px] w-5 h-5 rounded-full bg-white border-2 border-purple-300 flex items-center justify-center text-[10px]">
                      {item.icon}
                    </div>
                    <div className="bg-slate-50 rounded-xl border border-slate-100 p-3 hover:border-purple-200 transition-colors">
                      <p className="text-[10px] text-slate-400 mb-0.5">{item.date}</p>
                      <p className="text-xs font-medium text-slate-700">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── 메모 ── */}
          {tab === 'note' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-600">직원 메모</p>
                <button
                  onClick={() => setEditMode(v => !v)}
                  className="flex items-center gap-1 text-[11px] text-purple-600 hover:text-purple-800 font-medium"
                >
                  {editMode ? <><Save size={11} /> 저장</> : <><Edit3 size={11} /> 편집</>}
                </button>
              </div>
              {editMode ? (
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  rows={6}
                  className="w-full text-sm text-slate-700 bg-white border border-purple-300 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-purple-200"
                  placeholder="환자에 대한 메모를 입력하세요..."
                />
              ) : (
                <div className="bg-amber-50 rounded-xl border border-amber-100 p-3.5">
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {note || '메모 없음'}
                  </p>
                </div>
              )}

              <div className="pt-2 space-y-2">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">특이사항 태그</p>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(TAG_COLORS).map(([tag, cls]) => (
                    <button key={tag}
                      className={`text-[11px] px-2.5 py-1 rounded-full border font-medium transition-opacity ${
                        patient.tags.includes(tag) ? cls : 'bg-slate-50 text-slate-400 border-slate-200 opacity-60'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-5 py-3 border-t border-slate-100 flex gap-2 shrink-0">
          <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-500 hover:from-purple-500 hover:to-fuchsia-400 text-white text-xs font-semibold transition-all shadow-[0_0_12px_rgba(168,85,247,0.3)]">
            <MessageSquare size={12} /> 채팅으로 이동
          </button>
          <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors">
            <Calendar size={12} /> 예약 잡기
          </button>
        </div>
      </div>
    </>
  );
}

// ── Main PatientsTab ──────────────────────────────────────────────────────────
export default function PatientsTab() {
  const [search, setSearch] = useState('');
  const [filterCountry, setFilterCountry] = useState('전체');
  const [filterChannel, setFilterChannel] = useState('전체');
  const [filterStatus, setFilterStatus] = useState('전체');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [sortBy, setSortBy] = useState('lastVisit');

  // Filter + search + sort
  const filtered = useMemo(() => {
    return ALL_PATIENTS
      .filter(p => {
        const q = search.toLowerCase();
        const matchSearch = !q ||
          p.name.toLowerCase().includes(q) ||
          p.nameEn.toLowerCase().includes(q) ||
          p.procedure.toLowerCase().includes(q) ||
          p.phone.includes(q);
        const matchCountry = filterCountry === '전체' || p.country === filterCountry;
        const matchChannel = filterChannel === '전체' || p.channel === filterChannel;
        const matchStatus  = filterStatus  === '전체' || p.status  === filterStatus;
        return matchSearch && matchCountry && matchChannel && matchStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'spent') return b.totalSpent - a.totalSpent;
        if (sortBy === 'name') return a.nameEn.localeCompare(b.nameEn);
        return b.lastVisit.localeCompare(a.lastVisit);
      });
  }, [search, filterCountry, filterChannel, filterStatus, sortBy]);

  // Summary stats
  const totalSpent = ALL_PATIENTS.reduce((s, p) => s + p.totalSpent, 0);
  const activeCount = ALL_PATIENTS.filter(p => ['consulting','booked','care'].includes(p.status)).length;

  const countries = ['전체', ...new Set(ALL_PATIENTS.map(p => p.country))];
  const channels  = ['전체', ...Object.keys(CHANNELS)];
  const statuses  = ['전체', ...Object.keys(STATUS)];

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
      {/* Page header */}
      <div className="px-6 pt-5 pb-4 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-extrabold text-slate-900">환자 관리</h1>
            <p className="text-xs text-slate-400 mt-0.5">전체 {ALL_PATIENTS.length}명 등록됨</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 hover:border-purple-200 transition-all">
              <Upload size={13} /> CSV 업로드
            </button>
            <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-500 hover:from-purple-500 hover:to-fuchsia-400 text-white text-xs font-semibold transition-all shadow-[0_0_12px_rgba(168,85,247,0.3)]">
              <Plus size={13} /> 환자 등록
            </button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          {[
            { label: '전체 환자', value: ALL_PATIENTS.length + '명', icon: '👥', color: 'text-slate-700', bg: 'bg-slate-50' },
            { label: '활성 환자', value: activeCount + '명', icon: '🟢', color: 'text-emerald-700', bg: 'bg-emerald-50' },
            { label: '이번 달 신규', value: '8명', icon: '✨', color: 'text-purple-700', bg: 'bg-purple-50' },
            { label: '누적 결제', value: `₩${(totalSpent / 100000000).toFixed(1)}억`, icon: '💰', color: 'text-amber-700', bg: 'bg-amber-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl px-4 py-3 border border-white`}>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-sm">{s.icon}</span>
                <span className="text-[10px] text-slate-500">{s.label}</span>
              </div>
              <p className={`text-xl font-extrabold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-44">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="이름, 시술, 전화번호 검색..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100 transition-all"
            />
          </div>

          {/* Country filter */}
          <div className="relative">
            <select
              value={filterCountry}
              onChange={e => setFilterCountry(e.target.value)}
              className="pl-3 pr-7 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-purple-300 appearance-none cursor-pointer"
            >
              {countries.map(c => <option key={c}>{c}</option>)}
            </select>
            <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Channel filter */}
          <div className="relative">
            <select
              value={filterChannel}
              onChange={e => setFilterChannel(e.target.value)}
              className="pl-3 pr-7 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-purple-300 appearance-none cursor-pointer"
            >
              <option value="전체">전체 채널</option>
              {channels.slice(1).map(c => <option key={c} value={c}>{CHANNELS[c]?.label}</option>)}
            </select>
            <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Status filter */}
          <div className="relative">
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="pl-3 pr-7 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-purple-300 appearance-none cursor-pointer"
            >
              <option value="전체">전체 상태</option>
              {statuses.slice(1).map(s => <option key={s} value={s}>{STATUS[s]?.label}</option>)}
            </select>
            <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="pl-3 pr-7 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-purple-300 appearance-none cursor-pointer"
            >
              <option value="lastVisit">최근 방문순</option>
              <option value="spent">결제액순</option>
              <option value="name">이름순</option>
            </select>
            <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          <span className="text-xs text-slate-400 ml-1">{filtered.length}명</span>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-white border-b border-slate-200 z-10">
            <tr>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-500 tracking-wide">이름 / 국적</th>
              <th className="text-left px-3 py-3 text-[11px] font-semibold text-slate-500 tracking-wide">채널</th>
              <th className="text-left px-3 py-3 text-[11px] font-semibold text-slate-500 tracking-wide">최근 시술</th>
              <th className="text-left px-3 py-3 text-[11px] font-semibold text-slate-500 tracking-wide">예약 현황</th>
              <th className="text-left px-3 py-3 text-[11px] font-semibold text-slate-500 tracking-wide">누적 결제</th>
              <th className="text-center px-3 py-3 text-[11px] font-semibold text-slate-500 tracking-wide">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(p => {
              const st = STATUS[p.status];
              const ch = CHANNELS[p.channel];
              return (
                <tr
                  key={p.id}
                  onClick={() => setSelectedPatient(p)}
                  className="hover:bg-purple-50/40 hover:border-purple-100 cursor-pointer transition-colors group"
                >
                  {/* Name + nationality */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-base shrink-0 group-hover:border-purple-200 border border-transparent transition-colors">
                        {p.flag}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{p.name}</p>
                        <p className="text-slate-400 text-[11px]">{p.nameEn} · {p.age}세 · {p.gender === 'F' ? '여' : '남'}</p>
                      </div>
                    </div>
                  </td>

                  {/* Channel */}
                  <td className="px-3 py-3.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${ch.bg} ${ch.color}`}>
                      {ch.icon} {ch.label}
                    </span>
                  </td>

                  {/* Last procedure */}
                  <td className="px-3 py-3.5">
                    <p className="font-medium text-slate-700">{p.procedure}</p>
                    <p className="text-slate-400 text-[11px]">{p.lastVisit}</p>
                  </td>

                  {/* Status */}
                  <td className="px-3 py-3.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${st.color}`}>
                      {st.label}
                    </span>
                    {p.nextBooking && (
                      <p className="text-slate-400 text-[10px] mt-0.5">{p.nextBooking}</p>
                    )}
                  </td>

                  {/* Total spent */}
                  <td className="px-3 py-3.5">
                    <p className={`font-bold ${p.totalSpent >= 2000000 ? 'text-purple-700' : 'text-slate-700'}`}>
                      {fmt(p.totalSpent)}
                    </p>
                    {p.tags.includes('VIP') && (
                      <span className="flex items-center gap-0.5 text-[10px] text-amber-600">
                        <Star size={9} fill="currentColor" /> VIP
                      </span>
                    )}
                  </td>

                  {/* Action */}
                  <td className="px-3 py-3.5 text-center">
                    <button
                      onClick={e => { e.stopPropagation(); setSelectedPatient(p); }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors"
                    >
                      상세 <ChevronRight size={10} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl mb-3">🔍</div>
            <p className="text-sm font-medium text-slate-500">검색 결과가 없습니다</p>
            <p className="text-xs mt-1">필터를 조정해 보세요</p>
          </div>
        )}
      </div>

      {/* Drawer */}
      {selectedPatient && (
        <PatientDrawer
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
        />
      )}
    </div>
  );
}
