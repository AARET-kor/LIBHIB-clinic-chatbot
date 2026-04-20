import { useState, useEffect, useRef, useCallback } from 'react';

// ── CSS keyframes ──────────────────────────────────────────────────────────────
const KEYFRAMES = `
  @keyframes trFadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes trFadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes trSlideDown {
    from { opacity: 0; transform: translateY(-12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes trWave {
    0%, 100% { height: 5px; }
    50%       { height: 22px; }
  }
  @keyframes trPulse {
    0%, 100% { opacity: 1; }
    50%      { opacity: 0.35; }
  }
  @keyframes trToast {
    0%   { opacity: 0; transform: translateY(8px); }
    15%  { opacity: 1; transform: translateY(0); }
    80%  { opacity: 1; }
    100% { opacity: 0; }
  }
`;

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  bg:          '#FAF7F4',
  surface:     '#FFFFFF',
  mocha:       '#A47864',
  mochaDark:   '#8B6352',
  mochaLight:  '#E8D8CF',
  mochaPale:   '#F5EDE8',
  sage:        '#5A8F80',
  sageDark:    '#3D7265',
  sagePale:    '#ECF4F2',
  risk:        '#C04A3F',
  riskPale:    '#FEF3F2',
  riskBorder:  'rgba(192,74,63,0.18)',
  warn:        '#B5701A',
  warnPale:    '#FEF8EC',
  warnBorder:  'rgba(181,112,26,0.18)',
  text:        '#2C2420',
  textMid:     '#7A6858',
  textLight:   '#B5A498',
  border:      'rgba(164,120,100,0.10)',
  borderMid:   'rgba(164,120,100,0.18)',
  F:           "'Pretendard Variable', 'Inter', system-ui, sans-serif",
};

// ── Mock data ─────────────────────────────────────────────────────────────────
const SESSION = {
  patient: {
    name:      '다나카 유미',
    nameOrig:  '田中由美',
    lang:      '일본어',
    langCode:  'ja',
    flag:      '🇯🇵',
    age:       34,
    procedure: '히알루론산 필러 상담',
  },
  room: { name: '진료실 B', type: '진료실' },
};

const TURNS = [
  {
    id: 't1', speaker: 'patient', elapsedSec: 8,
    original:    '先生、初めてきました。目の下のくぼみがずっと気になっているんですが…',
    translation: '선생님, 처음 왔어요. 눈 밑 꺼짐이 계속 신경 쓰여서요…',
    confidence: 0.94, risk: null,
  },
  {
    id: 't2', speaker: 'doctor', elapsedSec: 24,
    original:    '어떤 부분이 특히 신경 쓰이세요? 자세히 말씀해 주시면 잘 도와드릴 수 있어요.',
    translation: 'どの部分が特に気になりますか？詳しく教えていただけると助かります。',
    confidence: 0.97, risk: null,
  },
  {
    id: 't3', speaker: 'patient', elapsedSec: 45,
    original:    '目の下のくまと、頬骨のあたりがペタンとしてるのが嫌で。以前に別のクリニックでやったことがあるんですが、6ヶ月前に。',
    translation: '눈 밑 다크서클이랑 광대 부위가 납작한 게 싫어요. 이전에 다른 클리닉에서 한 적 있는데, 6개월 전이에요.',
    confidence: 0.91, risk: null,
  },
  {
    id: 't4', speaker: 'doctor', elapsedSec: 78,
    original:    '히알루론산 필러로 자연스럽게 교정이 가능해요. 15~20분 정도 걸리고, 멍이나 붓기는 3~5일 있을 수 있습니다.',
    translation: 'ヒアルロン酸フィラーで自然に整えることができます。15〜20分ほどで、あざや腫れが3〜5日続くことがあります。',
    confidence: 0.96, risk: null,
  },
  {
    id: 't5', speaker: 'patient', elapsedSec: 112,
    original:    'なんか、急に頭がふわふわしてきた感じがするんですが… 大丈夫ですか？',
    translation: '갑자기 머리가 어지러운 느낌이 드는데요… 괜찮은 건가요?',
    confidence: 0.89,
    risk: {
      level:    'HIGH',
      category: 'distress',
      phrase:   '頭がふわふわ · 어지러운 느낌',
    },
  },
  {
    id: 't6', speaker: 'doctor', elapsedSec: 130,
    original:    '걱정하지 마세요. 눈 감고 천천히 호흡해 보세요. 긴장할 때 흔히 나타나는 반응이에요.',
    translation: '心配しないでください。目を閉じてゆっくり呼吸してみてください。緊張でよくある反応ですよ。',
    confidence: 0.98, risk: null,
  },
];

const SUMMARY = [
  { cat: 'concern', text: '눈 밑 꺼짐 및 광대 볼륨 부족 불만' },
  { cat: 'history', text: '6개월 전 타 클리닉 필러 시술 경험' },
  { cat: 'allergy', text: '알레르기 병력 언급 없음' },
  { cat: 'symptom', text: '상담 중 경미한 어지러움 호소 (긴장성 추정)' },
  { cat: 'consent', text: '시술 설명 청취 완료 · 동의 미확인' },
];

const ENTITIES = [
  { type: '부위',   values: ['눈 밑', '광대', '다크서클'] },
  { type: '시술',   values: ['히알루론산 필러'] },
  { type: '병력',   values: ['타 클리닉 필러 (6개월 전)'] },
  { type: '증상',   values: ['경미한 어지러움'] },
];

const CAT = {
  concern: { label: '불만',      color: C.mocha,   bg: C.mochaPale },
  history: { label: '병력',      color: '#7058A8', bg: '#F4F0FB'   },
  allergy: { label: '알레르기',  color: C.risk,    bg: C.riskPale  },
  symptom: { label: '증상',      color: C.warn,    bg: C.warnPale  },
  consent: { label: '동의',      color: C.sage,    bg: C.sagePale  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtTime(secs) {
  const m = String(Math.floor(secs / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function confColor(c) {
  if (c >= 0.80) return C.sage;
  if (c >= 0.55) return C.warn;
  return C.risk;
}

function confLabel(c) {
  if (c >= 0.80) return '높음';
  if (c >= 0.55) return '중간';
  return '낮음';
}

// ── ConfidencePill ─────────────────────────────────────────────────────────────
function ConfidencePill({ conf }) {
  const color = confColor(conf);
  return (
    <span style={{
      fontSize: 9, fontWeight: 700, letterSpacing: '0.03em',
      color, background: `${color}18`,
      padding: '2px 6px', borderRadius: 5,
    }}>
      {Math.round(conf * 100)}%
    </span>
  );
}

// ── PatientCard ───────────────────────────────────────────────────────────────
function PatientCard({ turn }) {
  return (
    <div style={{
      animation: 'trFadeUp 0.35s ease both',
      alignSelf: 'flex-start',
      maxWidth: '68%',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
        <span style={{ fontSize: 17 }}>{SESSION.patient.flag}</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: C.textMid }}>
          {SESSION.patient.nameOrig}
        </span>
        <span style={{ fontSize: 10, color: C.textLight }}>환자</span>
        <ConfidencePill conf={turn.confidence} />
        {turn.risk && (
          <span style={{
            fontSize: 9, fontWeight: 700,
            color: turn.risk.level === 'HIGH' ? C.risk : C.warn,
            background: turn.risk.level === 'HIGH' ? C.riskPale : C.warnPale,
            border: `1px solid ${turn.risk.level === 'HIGH' ? C.riskBorder : C.warnBorder}`,
            padding: '2px 7px', borderRadius: 6, letterSpacing: '0.04em',
          }}>
            ⚠ {turn.risk.level}
          </span>
        )}
      </div>
      <div style={{
        background: C.mochaPale,
        border: `1px solid rgba(164,120,100,0.11)`,
        borderRadius: '4px 16px 16px 16px',
        padding: '16px 20px',
        boxShadow: '0 2px 14px rgba(164,120,100,0.07)',
      }}>
        <p style={{ fontSize: 15, color: C.text, lineHeight: 1.65, margin: 0, fontWeight: 400 }}>
          {turn.original}
        </p>
        <div style={{
          marginTop: 12, paddingTop: 12,
          borderTop: '1px solid rgba(164,120,100,0.10)',
        }}>
          <p style={{ fontSize: 13, color: C.textMid, lineHeight: 1.6, margin: 0 }}>
            {turn.translation}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── DoctorCard ─────────────────────────────────────────────────────────────────
function DoctorCard({ turn }) {
  return (
    <div style={{
      animation: 'trFadeUp 0.30s ease both',
      alignSelf: 'flex-end',
      maxWidth: '68%',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        marginBottom: 7, justifyContent: 'flex-end',
      }}>
        <ConfidencePill conf={turn.confidence} />
        <span style={{ fontSize: 10, color: C.textLight }}>의사</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: C.sage }}>Dr.</span>
      </div>
      <div style={{
        background: C.surface,
        border: `1.5px solid ${C.sagePale}`,
        borderRadius: '16px 4px 16px 16px',
        padding: '16px 20px',
        boxShadow: '0 2px 14px rgba(90,143,128,0.07)',
      }}>
        <p style={{ fontSize: 15, color: C.text, lineHeight: 1.65, margin: 0 }}>
          {turn.original}
        </p>
        <div style={{
          marginTop: 12, paddingTop: 12,
          borderTop: '1px solid rgba(90,143,128,0.10)',
          display: 'flex', alignItems: 'flex-start', gap: 8,
        }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: C.sage, flexShrink: 0, marginTop: 2 }}>
            {SESSION.patient.flag}
          </span>
          <p style={{ fontSize: 13, color: C.textMid, lineHeight: 1.6, margin: 0 }}>
            {turn.translation}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── LiveCard ───────────────────────────────────────────────────────────────────
function LiveCard({ speaker }) {
  const isPatient = speaker === 'patient';
  const accent    = isPatient ? C.mocha : C.sage;
  return (
    <div style={{
      animation: 'trFadeIn 0.2s ease both',
      alignSelf: isPatient ? 'flex-start' : 'flex-end',
      display: 'flex', alignItems: 'center', gap: 12,
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 14,
      padding: '12px 18px',
      boxShadow: '0 1px 8px rgba(164,120,100,0.05)',
    }}>
      <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 26 }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{
            width: 3, borderRadius: 2,
            background: accent,
            animation: 'trWave 0.85s ease-in-out infinite',
            animationDelay: `${i * 0.14}s`,
            height: 5,
          }} />
        ))}
      </div>
      <span style={{ fontSize: 12, color: C.textMid }}>
        {isPatient ? '환자 발화 번역 중…' : '의사 발화 인식 중…'}
      </span>
    </div>
  );
}

// ── RiskBanner ─────────────────────────────────────────────────────────────────
function RiskBanner({ risk, onDismiss }) {
  const isHigh   = risk.level === 'HIGH';
  const bg       = isHigh ? C.riskPale   : C.warnPale;
  const border   = isHigh ? C.riskBorder : C.warnBorder;
  const accent   = isHigh ? C.risk       : C.warn;
  return (
    <div style={{
      animation: 'trSlideDown 0.28s ease both',
      background: bg,
      border: `1px solid ${border}`,
      borderRadius: 12,
      padding: '14px 20px',
      display: 'flex', alignItems: 'center', gap: 16,
      flexShrink: 0,
    }}>
      <span style={{ fontSize: 22, flexShrink: 0 }}>{isHigh ? '🚨' : '⚠️'}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{
            fontSize: 11, fontWeight: 800, letterSpacing: '0.06em', color: accent,
          }}>
            {risk.level} 위험 감지
          </span>
          <span style={{
            fontSize: 9, fontWeight: 600, color: C.textMid,
            background: 'rgba(0,0,0,0.05)', padding: '2px 7px', borderRadius: 5,
          }}>
            {risk.category}
          </span>
        </div>
        <p style={{ margin: 0, fontSize: 13, color: C.text }}>
          「{risk.phrase}」 — 의료진 확인 권고
        </p>
      </div>
      <button
        onClick={onDismiss}
        style={{
          padding: '8px 18px', borderRadius: 8,
          background: accent, border: 'none', color: '#fff',
          fontSize: 12, fontWeight: 700, cursor: 'pointer',
          fontFamily: C.F, flexShrink: 0,
          boxShadow: `0 2px 10px ${accent}40`,
        }}
      >
        확인
      </button>
    </div>
  );
}

// ── RightPanel ─────────────────────────────────────────────────────────────────
function RightPanel({ turns }) {
  const hasContent = turns.length >= 2;
  const latestRisk = turns.slice().reverse().find(t => t.risk)?.risk ?? null;
  const avgConf    = turns.length > 0
    ? turns.reduce((a, t) => a + t.confidence, 0) / turns.length
    : null;
  const lastConf   = turns.length > 0 ? turns[turns.length - 1].confidence : null;

  const sHead = (label) => (
    <div style={{
      fontSize: 9, fontWeight: 800, letterSpacing: '0.10em',
      textTransform: 'uppercase', color: C.textLight,
      marginBottom: 10,
    }}>
      {label}
    </div>
  );

  return (
    <div style={{
      width: 272, flexShrink: 0,
      background: C.surface,
      boxShadow: `-1px 0 0 ${C.border}`,
      display: 'flex', flexDirection: 'column',
      overflowY: 'auto',
      padding: '22px 18px',
      gap: 24,
    }}>

      {/* ── Confidence ── */}
      <div>
        {sHead('신뢰도')}
        <div style={{
          background: C.bg, borderRadius: 10,
          padding: '13px 14px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: C.textMid }}>세션 평균</span>
            {avgConf != null ? (
              <span style={{ fontSize: 14, fontWeight: 700, color: confColor(avgConf) }}>
                {Math.round(avgConf * 100)}%
              </span>
            ) : (
              <span style={{ fontSize: 12, color: C.textLight }}>—</span>
            )}
          </div>
          <div style={{ height: 4, background: C.mochaLight, borderRadius: 3, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 3,
              width: avgConf != null ? `${avgConf * 100}%` : '0%',
              background: avgConf != null ? confColor(avgConf) : C.mochaLight,
              transition: 'width 0.6s ease',
            }} />
          </div>
          {lastConf != null && (
            <div style={{ marginTop: 8, fontSize: 10, color: C.textLight }}>
              최근 발화&nbsp;
              <span style={{ color: confColor(lastConf), fontWeight: 700 }}>
                {confLabel(lastConf)}
              </span>
              &nbsp;({Math.round(lastConf * 100)}%)
            </div>
          )}
        </div>
      </div>

      {/* ── Risk log ── */}
      <div>
        {sHead('위험 감지')}
        {latestRisk ? (
          <div style={{
            animation: 'trFadeIn 0.3s ease both',
            background: C.riskPale,
            border: `1px solid ${C.riskBorder}`,
            borderRadius: 10, padding: '12px 14px',
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.risk, marginBottom: 5 }}>
              ⚠ {latestRisk.level}
            </div>
            <div style={{ fontSize: 12, color: C.text, lineHeight: 1.55, marginBottom: 4 }}>
              {latestRisk.phrase}
            </div>
            <div style={{ fontSize: 10, color: C.textMid }}>{latestRisk.category}</div>
          </div>
        ) : (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 7,
            fontSize: 12, color: C.textLight, padding: '4px 0',
          }}>
            <span style={{ color: C.sage, fontSize: 14 }}>✓</span>
            감지된 위험 없음
          </div>
        )}
      </div>

      {/* ── Entities ── */}
      <div>
        {sHead('추출 정보')}
        {hasContent ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, animation: 'trFadeIn 0.4s ease both' }}>
            {ENTITIES.map((e, i) => (
              <div key={i}>
                <div style={{ fontSize: 9, color: C.textLight, marginBottom: 5, fontWeight: 600 }}>
                  {e.type}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {e.values.map((v, j) => (
                    <span key={j} style={{
                      fontSize: 11, color: C.mochaDark,
                      background: C.mochaPale,
                      padding: '3px 9px', borderRadius: 7,
                      fontWeight: 500,
                    }}>
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: 12, color: C.textLight, padding: '4px 0' }}>
            대화 누적 중…
          </div>
        )}
      </div>

      {/* ── Korean summary ── */}
      <div>
        {sHead('한국어 요약')}
        {hasContent ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, animation: 'trFadeIn 0.4s ease both' }}>
            {SUMMARY.map((item, i) => {
              const c = CAT[item.cat] || { label: item.cat, color: C.textMid, bg: C.bg };
              return (
                <div key={i} style={{
                  animation: `trFadeIn ${0.15 + i * 0.07}s ease both`,
                  display: 'flex', gap: 8, alignItems: 'flex-start',
                  padding: '8px 10px', background: C.bg, borderRadius: 8,
                }}>
                  <span style={{
                    fontSize: 9, fontWeight: 700,
                    color: c.color, background: c.bg,
                    padding: '2px 6px', borderRadius: 5,
                    flexShrink: 0, marginTop: 1,
                    letterSpacing: '0.02em',
                  }}>
                    {c.label}
                  </span>
                  <p style={{ fontSize: 12, color: C.text, lineHeight: 1.55, margin: 0 }}>
                    {item.text}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ fontSize: 12, color: C.textLight, padding: '4px 0' }}>
            대화 누적 중…
          </div>
        )}
      </div>
    </div>
  );
}

// ── DoctorTalkOverlay ─────────────────────────────────────────────────────────
function DoctorTalkOverlay({ lastDoctorTurn, onDeactivate }) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'rgba(245,237,232,0.60)',
      backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 30,
      animation: 'trFadeIn 0.2s ease both',
    }}>
      <div style={{
        animation: 'trFadeUp 0.28s ease both',
        background: C.surface,
        borderRadius: 24,
        padding: '40px 48px',
        maxWidth: 520, width: '88%',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(90,143,128,0.16), 0 4px 16px rgba(90,143,128,0.08)',
      }}>

        {/* Waveform */}
        <div style={{
          display: 'flex', justifyContent: 'center',
          gap: 4, alignItems: 'flex-end',
          height: 32, marginBottom: 22,
        }}>
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} style={{
              width: 4, borderRadius: 2, background: C.sage,
              animation: 'trWave 0.80s ease-in-out infinite',
              animationDelay: `${i * 0.12}s`,
              height: 6,
            }} />
          ))}
        </div>

        <div style={{
          fontSize: 10, fontWeight: 800, letterSpacing: '0.12em',
          color: C.sage, textTransform: 'uppercase', marginBottom: 18,
        }}>
          의사 모드 활성 · 번역 출력 중
        </div>

        {lastDoctorTurn ? (
          <>
            <p style={{
              fontSize: 14, color: C.textMid, marginBottom: 22,
              lineHeight: 1.65, margin: '0 0 22px',
            }}>
              {lastDoctorTurn.original}
            </p>
            <div style={{
              background: C.sagePale, borderRadius: 16,
              padding: '24px 28px', marginBottom: 28,
            }}>
              <p style={{
                fontSize: 24, color: C.text,
                lineHeight: 1.75, margin: 0,
                fontWeight: 300, letterSpacing: '0.01em',
              }}>
                {lastDoctorTurn.translation}
              </p>
            </div>
          </>
        ) : (
          <div style={{ marginBottom: 28, padding: '24px 0' }}>
            <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.6, margin: 0 }}>
              의사 발화 대기 중…
            </p>
          </div>
        )}

        <button
          onClick={onDeactivate}
          style={{
            padding: '10px 32px', borderRadius: 10,
            background: 'transparent',
            border: `1.5px solid ${C.sage}`,
            color: C.sage, fontSize: 13, fontWeight: 700,
            cursor: 'pointer', fontFamily: C.F,
            transition: 'all 0.15s',
          }}
        >
          의사 모드 종료
        </button>
      </div>
    </div>
  );
}

// ── Toast ──────────────────────────────────────────────────────────────────────
function Toast({ message }) {
  return (
    <div style={{
      position: 'fixed', bottom: 88, left: '50%',
      transform: 'translateX(-50%)',
      animation: 'trToast 2.6s ease both',
      background: C.text, color: '#fff',
      fontSize: 13, fontWeight: 600,
      padding: '10px 22px', borderRadius: 10,
      boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
      zIndex: 50, whiteSpace: 'nowrap',
      pointerEvents: 'none',
    }}>
      {message}
    </div>
  );
}

// ── SetupScreen ────────────────────────────────────────────────────────────────
function SetupScreen({ onStart }) {
  return (
    <div style={{
      minHeight: '100vh', background: C.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: C.F,
    }}>
      <div style={{
        animation: 'trFadeUp 0.4s ease both',
        background: C.surface,
        borderRadius: 24, padding: '48px 52px',
        maxWidth: 440, width: '90%',
        boxShadow: '0 8px 40px rgba(164,120,100,0.12), 0 2px 8px rgba(164,120,100,0.06)',
        textAlign: 'center',
      }}>

        <div style={{
          width: 52, height: 52, borderRadius: 16,
          background: C.mocha, margin: '0 auto 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 4px 18px ${C.mocha}45`,
        }}>
          <span style={{ fontSize: 22 }}>🏥</span>
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: '0 0 5px' }}>
          Tiki Room
        </h1>
        <p style={{ fontSize: 13, color: C.textMid, margin: '0 0 32px' }}>
          {SESSION.room.name} · {SESSION.room.type}
        </p>

        {/* Patient card */}
        <div style={{
          background: C.bg, borderRadius: 14,
          padding: '20px 22px', marginBottom: 28,
          textAlign: 'left',
        }}>
          <div style={{
            fontSize: 9, fontWeight: 800, letterSpacing: '0.10em',
            textTransform: 'uppercase', color: C.textLight, marginBottom: 14,
          }}>
            예약 환자
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 32 }}>{SESSION.patient.flag}</span>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 3 }}>
                {SESSION.patient.name}
              </div>
              <div style={{ fontSize: 12, color: C.textMid, marginBottom: 4 }}>
                {SESSION.patient.nameOrig} · {SESSION.patient.lang} · {SESSION.patient.age}세
              </div>
              <div style={{
                display: 'inline-block', fontSize: 11, fontWeight: 600,
                color: C.mocha, background: C.mochaPale,
                padding: '2px 10px', borderRadius: 6,
              }}>
                {SESSION.patient.procedure}
              </div>
            </div>
          </div>
        </div>

        {/* Language badge */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 6, marginBottom: 28,
        }}>
          <span style={{
            fontSize: 10, fontWeight: 600, color: C.textMid,
            background: C.bg,
            padding: '4px 12px', borderRadius: 8,
          }}>
            🔊 자동 언어 감지 — 기본 {SESSION.patient.lang}
          </span>
        </div>

        <button
          onClick={onStart}
          style={{
            width: '100%', padding: '14px',
            background: C.mocha, border: 'none',
            borderRadius: 12, color: '#fff',
            fontSize: 15, fontWeight: 700,
            cursor: 'pointer', fontFamily: C.F,
            boxShadow: `0 4px 18px ${C.mocha}45`,
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          세션 시작
        </button>
      </div>
    </div>
  );
}

// ── SavedScreen ────────────────────────────────────────────────────────────────
function SavedScreen({ turnCount, elapsed, onReset }) {
  return (
    <div style={{
      minHeight: '100vh', background: C.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: C.F,
    }}>
      <div style={{
        animation: 'trFadeUp 0.35s ease both',
        background: C.surface,
        borderRadius: 24, padding: '48px 52px',
        maxWidth: 440, width: '90%',
        boxShadow: '0 8px 40px rgba(164,120,100,0.12), 0 2px 8px rgba(164,120,100,0.06)',
        textAlign: 'center',
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: 16,
          background: '#ECF8F1', margin: '0 auto 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24,
        }}>
          ✓
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: '0 0 7px' }}>
          세션 저장 완료
        </h2>
        <p style={{ fontSize: 13, color: C.textMid, margin: '0 0 28px' }}>
          {turnCount}개 발화 · {fmtTime(elapsed)} · Tiki Memory에 기록됨
        </p>

        <div style={{
          background: C.bg, borderRadius: 12,
          padding: '16px 18px', marginBottom: 28,
          textAlign: 'left',
        }}>
          {SUMMARY.slice(0, 3).map((item, i) => {
            const c = CAT[item.cat] || { label: item.cat, color: C.textMid, bg: C.bg };
            return (
              <div key={i} style={{
                display: 'flex', gap: 8, marginBottom: i < 2 ? 8 : 0,
              }}>
                <span style={{
                  fontSize: 9, fontWeight: 700,
                  color: c.color, background: c.bg,
                  padding: '2px 6px', borderRadius: 5, flexShrink: 0,
                }}>
                  {c.label}
                </span>
                <span style={{ fontSize: 12, color: C.text, lineHeight: 1.5 }}>
                  {item.text}
                </span>
              </div>
            );
          })}
        </div>

        <button
          onClick={onReset}
          style={{
            width: '100%', padding: '12px',
            background: C.mocha, border: 'none',
            borderRadius: 12, color: '#fff',
            fontSize: 14, fontWeight: 700,
            cursor: 'pointer', fontFamily: C.F,
          }}
        >
          새 세션 시작
        </button>
      </div>
    </div>
  );
}

// ── TikiRoomPage ──────────────────────────────────────────────────────────────
export default function TikiRoomPage() {

  // Inject CSS
  useEffect(() => {
    const el = document.createElement('style');
    el.textContent = KEYFRAMES;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  const [phase,            setPhase]           = useState('setup');
  const [visibleTurns,     setVisibleTurns]    = useState([]);
  const [nextTurnIdx,      setNextTurnIdx]     = useState(0);
  const [liveCard,         setLiveCard]        = useState(null);
  const [speakerMode,      setSpeakerMode]     = useState('idle');
  const [doctorTalkActive, setDoctorTalkActive]= useState(false);
  const [elapsed,          setElapsed]         = useState(0);
  const [activeRisk,       setActiveRisk]      = useState(null);
  const [toast,            setToast]           = useState(null);

  const scrollRef = useRef(null);

  // Elapsed timer
  useEffect(() => {
    if (phase !== 'active') return;
    const id = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(id);
  }, [phase]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [visibleTurns, liveCard]);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  }, []);

  // Trigger a turn by speaker type
  const triggerTurn = useCallback((speakerFilter) => {
    if (speakerMode !== 'idle') return;

    let idx = nextTurnIdx;
    while (idx < TURNS.length && TURNS[idx].speaker !== speakerFilter) idx++;
    if (idx >= TURNS.length) {
      showToast(`더 이상 ${speakerFilter === 'patient' ? '환자' : '의사'} 발화가 없습니다`);
      return;
    }

    const turn = TURNS[idx];
    setSpeakerMode('processing');
    setLiveCard({ speaker: speakerFilter });

    const delay = speakerFilter === 'patient' ? 1600 : 1200;
    setTimeout(() => {
      setLiveCard(null);
      setVisibleTurns(prev => [...prev, turn]);
      setNextTurnIdx(idx + 1);
      setSpeakerMode('idle');
      if (turn.risk) setActiveRisk(turn.risk);
    }, delay);
  }, [speakerMode, nextTurnIdx, showToast]);

  const lastDoctorTurn = [...visibleTurns].reverse().find(t => t.speaker === 'doctor') ?? null;

  const reset = () => {
    setPhase('setup');
    setVisibleTurns([]);
    setNextTurnIdx(0);
    setLiveCard(null);
    setSpeakerMode('idle');
    setDoctorTalkActive(false);
    setElapsed(0);
    setActiveRisk(null);
    setToast(null);
  };

  // ── Screens ──────────────────────────────────────────────────────────────────
  if (phase === 'setup') return <SetupScreen onStart={() => setPhase('active')} />;
  if (phase === 'saved') return <SavedScreen turnCount={visibleTurns.length} elapsed={elapsed} onReset={reset} />;

  // ── Active session ──────────────────────────────────────────────────────────
  return (
    <div style={{
      height: '100vh', background: C.bg,
      display: 'flex', flexDirection: 'column',
      fontFamily: C.F, overflow: 'hidden',
      position: 'relative',
    }}>

      {/* ── Top bar ── */}
      <div style={{
        height: 54, flexShrink: 0,
        background: C.surface,
        borderBottom: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center',
        padding: '0 20px', gap: 14,
      }}>

        {/* Logo mark */}
        <div style={{
          width: 30, height: 30, borderRadius: 9,
          background: C.mocha, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 2px 10px ${C.mocha}45`,
        }}>
          <span style={{ fontSize: 13 }}>🏥</span>
        </div>

        {/* Room */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>
            {SESSION.room.name}
          </span>
          <span style={{
            fontSize: 10, color: C.textMid,
            background: C.bg, padding: '2px 8px', borderRadius: 5,
          }}>
            {SESSION.room.type}
          </span>
        </div>

        <div style={{ width: 1, height: 18, background: C.border }} />

        {/* Patient */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 17 }}>{SESSION.patient.flag}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>
            {SESSION.patient.name}
          </span>
          <span style={{ fontSize: 11, color: C.textMid }}>
            {SESSION.patient.nameOrig}
          </span>
          <span style={{
            fontSize: 10, fontWeight: 600, color: C.mocha,
            background: C.mochaPale, padding: '2px 8px', borderRadius: 5,
          }}>
            {SESSION.patient.lang}
          </span>
          <span style={{ fontSize: 11, color: C.textLight }}>
            · {SESSION.patient.procedure}
          </span>
        </div>

        <div style={{ flex: 1 }} />

        {/* LIVE status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: speakerMode === 'processing' ? C.mocha : '#4CAF50',
            animation: 'trPulse 1.4s ease-in-out infinite',
          }} />
          <span style={{
            fontSize: 11, fontWeight: 700,
            color: speakerMode === 'processing' ? C.mocha : '#4CAF50',
            letterSpacing: '0.04em',
          }}>
            {speakerMode === 'processing' ? '번역 중' : 'LIVE'}
          </span>
        </div>

        {/* Timer */}
        <div style={{
          fontSize: 14, fontWeight: 700, color: C.textMid,
          letterSpacing: '0.06em',
          background: C.bg, padding: '5px 13px', borderRadius: 8,
          minWidth: 58, textAlign: 'center',
        }}>
          {fmtTime(elapsed)}
        </div>
      </div>

      {/* ── Main area ── */}
      <div style={{
        flex: 1, display: 'flex', minHeight: 0,
        overflow: 'hidden', position: 'relative',
      }}>

        {/* Transcript column */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          minWidth: 0, position: 'relative',
        }}>

          {/* Risk banner */}
          {activeRisk && (
            <div style={{ padding: '14px 20px 0', flexShrink: 0 }}>
              <RiskBanner
                risk={activeRisk}
                onDismiss={() => setActiveRisk(null)}
              />
            </div>
          )}

          {/* Turn list */}
          <div
            ref={scrollRef}
            style={{
              flex: 1, overflowY: 'auto',
              padding: '20px 24px',
              display: 'flex', flexDirection: 'column',
              gap: 18,
            }}
          >
            {visibleTurns.length === 0 && !liveCard && (
              <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: 14, opacity: 0.45, paddingBottom: 80,
              }}>
                <span style={{ fontSize: 40 }}>{SESSION.patient.flag}</span>
                <p style={{
                  fontSize: 14, color: C.textMid,
                  textAlign: 'center', maxWidth: 260, lineHeight: 1.7, margin: 0,
                }}>
                  아래 버튼으로 발화를 시뮬레이션하세요
                </p>
              </div>
            )}

            {visibleTurns.map(turn =>
              turn.speaker === 'patient'
                ? <PatientCard key={turn.id} turn={turn} />
                : <DoctorCard  key={turn.id} turn={turn} />
            )}

            {liveCard && <LiveCard speaker={liveCard.speaker} />}
          </div>
        </div>

        {/* Right panel */}
        <RightPanel turns={visibleTurns} />

        {/* Doctor Talk overlay */}
        {doctorTalkActive && (
          <DoctorTalkOverlay
            lastDoctorTurn={lastDoctorTurn}
            onDeactivate={() => setDoctorTalkActive(false)}
          />
        )}
      </div>

      {/* ── Bottom bar ── */}
      <div style={{
        height: 68, flexShrink: 0,
        background: C.surface,
        borderTop: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center',
        padding: '0 20px', gap: 10,
      }}>

        {/* Listening indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginRight: 2 }}>
          <div style={{ display: 'flex', gap: 2.5, alignItems: 'flex-end', height: 22 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 3, borderRadius: 2,
                background: speakerMode === 'processing' ? C.mocha : C.border,
                animation: speakerMode === 'processing'
                  ? `trWave 0.8s ease-in-out infinite`
                  : 'none',
                animationDelay: `${i * 0.16}s`,
                height: speakerMode === 'processing' ? 7 : 4,
                transition: 'background 0.3s, height 0.3s',
              }} />
            ))}
          </div>
          <span style={{
            fontSize: 10, fontWeight: 600,
            color: speakerMode === 'processing' ? C.mocha : C.textLight,
            transition: 'color 0.3s',
          }}>
            {speakerMode === 'processing' ? '인식 중' : '대기'}
          </span>
        </div>

        <div style={{ width: 1, height: 28, background: C.border }} />

        {/* Simulation buttons */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => triggerTurn('patient')}
            disabled={speakerMode !== 'idle'}
            style={{
              padding: '8px 16px', borderRadius: 9,
              background: speakerMode !== 'idle' ? C.bg : C.mochaPale,
              border: `1.5px solid ${speakerMode !== 'idle' ? C.border : C.mochaLight}`,
              color: speakerMode !== 'idle' ? C.textLight : C.mochaDark,
              fontSize: 12, fontWeight: 600,
              cursor: speakerMode !== 'idle' ? 'default' : 'pointer',
              fontFamily: C.F, transition: 'all 0.15s',
            }}
          >
            {SESSION.patient.flag} 환자 발화
          </button>
          <button
            onClick={() => triggerTurn('doctor')}
            disabled={speakerMode !== 'idle'}
            style={{
              padding: '8px 16px', borderRadius: 9,
              background: speakerMode !== 'idle' ? C.bg : C.sagePale,
              border: `1.5px solid ${speakerMode !== 'idle' ? C.border : 'rgba(90,143,128,0.25)'}`,
              color: speakerMode !== 'idle' ? C.textLight : C.sageDark,
              fontSize: 12, fontWeight: 600,
              cursor: speakerMode !== 'idle' ? 'default' : 'pointer',
              fontFamily: C.F, transition: 'all 0.15s',
            }}
          >
            👨‍⚕️ 의사 발화
          </button>
        </div>

        <div style={{ flex: 1 }} />

        {/* Doctor Talk toggle */}
        <button
          onClick={() => setDoctorTalkActive(v => !v)}
          style={{
            padding: '9px 20px', borderRadius: 9,
            background: doctorTalkActive ? C.sage : 'transparent',
            border: `1.5px solid ${C.sage}`,
            color: doctorTalkActive ? '#fff' : C.sage,
            fontSize: 12, fontWeight: 700,
            cursor: 'pointer', fontFamily: C.F,
            transition: 'all 0.2s',
            boxShadow: doctorTalkActive ? `0 2px 12px ${C.sage}45` : 'none',
          }}
        >
          {doctorTalkActive ? '🎙 의사 모드 ON' : '의사 모드'}
        </button>

        {/* Call staff */}
        <button
          onClick={() => showToast('직원 호출 알림이 전송되었습니다')}
          style={{
            padding: '9px 18px', borderRadius: 9,
            background: 'transparent',
            border: `1.5px solid ${C.border}`,
            color: C.textMid, fontSize: 12, fontWeight: 600,
            cursor: 'pointer', fontFamily: C.F,
            transition: 'border-color 0.15s, color 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = C.borderMid;
            e.currentTarget.style.color = C.text;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = C.border;
            e.currentTarget.style.color = C.textMid;
          }}
        >
          직원 호출
        </button>

        {/* Save session */}
        <button
          onClick={() => setPhase('saved')}
          style={{
            padding: '9px 22px', borderRadius: 9,
            background: C.mocha, border: 'none',
            color: '#fff', fontSize: 12, fontWeight: 700,
            cursor: 'pointer', fontFamily: C.F,
            boxShadow: `0 3px 12px ${C.mocha}40`,
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          세션 저장
        </button>
      </div>

      {/* Toast */}
      {toast && <Toast message={toast} />}
    </div>
  );
}
