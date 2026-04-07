import { TrendingUp, Users, MessageSquare, Star } from 'lucide-react';

const metrics = [
  { label: '이번 달 신규 문의', value: '47', change: '+12%', icon: MessageSquare, color: 'text-navy-600', bg: 'bg-navy-50' },
  { label: '외국인 환자 수', value: '23', change: '+8%', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
  { label: '응답 시간 단축', value: '78%', change: 'AI 도입 후', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: '환자 만족도', value: '4.8', change: '/ 5.0', icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
];

const langBreakdown = [
  { lang: '일본어', flag: '🇯🇵', count: 18, pct: 39, color: 'bg-rose-400' },
  { lang: '영어',   flag: '🇺🇸', count: 12, pct: 26, color: 'bg-sky-400' },
  { lang: '중국어', flag: '🇨🇳', count: 9,  pct: 20, color: 'bg-red-400' },
  { lang: '아랍어', flag: '🇸🇦', count: 8,  pct: 17, color: 'bg-amber-400' },
];

export default function StatsTab() {
  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin bg-slate-50 p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-1">성과 대시보드</h2>
        <p className="text-sm text-slate-500">2026년 4월 기준</p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {metrics.map(({ label, value, change, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-500">{label}</span>
              <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center`}>
                <Icon size={14} className={color} />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-2xl font-bold ${color}`}>{value}</span>
              <span className="text-xs text-slate-400">{change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Language breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">언어별 문의 현황</h3>
        <div className="flex flex-col gap-3">
          {langBreakdown.map(({ lang, flag, count, pct, color }) => (
            <div key={lang} className="flex items-center gap-3">
              <div className="w-20 flex items-center gap-1.5">
                <span className="text-sm">{flag}</span>
                <span className="text-xs font-medium text-slate-600">{lang}</span>
              </div>
              <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full ${color} rounded-full transition-all`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-slate-500 w-8 text-right">{count}건</span>
              <span className="text-xs text-slate-400 w-8 text-right">{pct}%</span>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-500 leading-relaxed">
            💡 <strong className="text-navy-700">AI 도입 효과:</strong> 다국어 코디네이터 없이 4개 언어 대응 중.
            월 인건비 절감 추정액 <strong className="text-emerald-600">₩3,500,000+</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
