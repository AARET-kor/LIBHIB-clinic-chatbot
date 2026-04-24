const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.tikidoc.xyz";

export default function LandingPage() {
  return (
    <>
      {/* ── Nav ───────────────────────────────────────────────────── */}
      <nav className="nav">
        <div className="nav-inner wrap">
          <a href="/" className="brand">
            <div className="brand-mark">T</div>
            TikiDoc
          </a>
          <ul className="nav-links">
            <li><a href="#product">제품</a></li>
            <li><a href="#journey">환자 여정</a></li>
            <li><a href="#ops">운영 도구</a></li>
          </ul>
          <div className="nav-actions">
            <a className="btn-ghost" href={`${APP_URL}/login`}>로그인</a>
            <a className="btn-primary" href={APP_URL}>앱 열기</a>
          </div>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="wrap">
        <div className="hero">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="eyebrow-dot" />
              클리닉 운영의 새로운 기준
            </p>
            <h1>진료 전부터 사후 케어까지,<br />하나의 흐름으로</h1>
            <p className="hero-lead">
              Tiki Paste, My Tiki, Tiki Room — 세 개의 전문 도구가 환자 여정 전체를 연결합니다.
              복잡한 도구 없이, 클리닉 운영을 간결하게.
            </p>
            <div className="hero-actions">
              <a className="btn-primary lg" href={APP_URL}>앱 열기 →</a>
              <a className="btn-secondary" href={`${APP_URL}/login`}>로그인</a>
            </div>
            <div className="hero-signals">
              <div className="hero-signal">
                <strong>3개</strong>
                <span>전용 진료 도구</span>
              </div>
              <div className="hero-signal">
                <strong>다국어</strong>
                <span>실시간 지원</span>
              </div>
              <div className="hero-signal">
                <strong>1–3탭</strong>
                <span>직원 워크플로</span>
              </div>
            </div>
          </div>

          {/* Hero card — Tiki Paste demo */}
          <div className="hero-card-wrap">
            <div className="hero-card">
              <div className="hcard-header">
                <div className="hcard-icon"><div className="hcard-icon-dot" /></div>
                <span className="hcard-name">TIKI PASTE</span>
                <div className="hcard-status">
                  <div className="hcard-status-dot" />
                  AI 준비 완료
                </div>
              </div>

              {/* Patient message */}
              <div className="hcard-msg">
                <div className="hcard-msg-meta">
                  <span className="hcard-msg-flag">🇺🇸</span>
                  <span className="hcard-msg-lang">EN</span>
                  <span className="hcard-msg-badge">환자 문의</span>
                </div>
                <p className="hcard-msg-original">
                  "I'm getting a filler treatment tomorrow. What should I avoid eating beforehand?"
                </p>
                <p className="hcard-msg-translated">
                  내일 필러 시술 예정입니다. 사전에 피해야 할 음식이 있나요?
                </p>
              </div>

              {/* Intent tags */}
              <div className="hcard-tags">
                <span className="hcard-tag">시술 전 주의사항</span>
                <span className="hcard-tag">필러</span>
                <span className="hcard-tag">식이 제한</span>
              </div>

              {/* Reply options */}
              <div className="hcard-replies">
                <div className="hcard-reply active">
                  <div className="hcard-reply-dot" style={{background: "var(--accent)"}} />
                  <div>
                    <div className="hcard-reply-label" style={{color: "var(--accent-dk)"}}>추천 답변</div>
                    <div className="hcard-reply-preview">
                      시술 4시간 전부터 금식을 권장드립니다. 알코올과 혈액 희석제는 48시간 전부터 피해주세요.
                    </div>
                  </div>
                  <span className="hcard-reply-selected" style={{background:"var(--accent-pale)", color:"var(--accent-dk)"}}>선택됨</span>
                </div>
                <div className="hcard-reply inactive">
                  <div className="hcard-reply-dot" style={{background: "var(--border)"}} />
                  <div>
                    <div className="hcard-reply-label" style={{color: "var(--text-muted)"}}>대안</div>
                    <div className="hcard-reply-preview">특별한 식이 제한은 없으나 충분한 수분 섭취를 권장합니다.</div>
                  </div>
                </div>
              </div>

              {/* Send bar */}
              <div className="hcard-send">
                <span className="hcard-send-text">선택한 답변을 환자에게 전송합니다</span>
                <span className="hcard-send-btn">전송 →</span>
              </div>

              {/* Footer */}
              <div className="hcard-footer">
                <div className="hcard-footer-check">
                  <div className="hcard-footer-check-inner" />
                </div>
                <span className="hcard-footer-text">직원이 검토 후 전송 — AI가 자동 발송하지 않습니다</span>
                <span className="hcard-footer-flags">🇰🇷 🇺🇸 🇯🇵</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Signal strip ──────────────────────────────────────────── */}
      <div className="signal-strip">
        <div className="signal-strip-inner wrap">
          <div className="signal-item">
            <span className="signal-num">3개</span>
            <div className="signal-desc">
              <strong>전용 진료 도구</strong>
              Tiki Paste · My Tiki · Tiki Room
            </div>
          </div>
          <div className="signal-item">
            <span className="signal-num">다국어</span>
            <div className="signal-desc">
              <strong>실시간 언어 지원</strong>
              한국어, 영어, 일본어, 중국어
            </div>
          </div>
          <div className="signal-item">
            <span className="signal-num">1–3탭</span>
            <div className="signal-desc">
              <strong>직원 워크플로 목표</strong>
              복잡한 도구 없이 빠른 대응
            </div>
          </div>
        </div>
      </div>

      {/* ── Problem ───────────────────────────────────────────────── */}
      <section className="section">
        <div className="wrap">
          <div className="section-header">
            <p className="eyebrow">
              <span className="eyebrow-dot" />
              클리닉이 겪는 문제
            </p>
            <h2>반복되는 세 가지 병목</h2>
            <p>현장에서 매일 발생하는 운영 비효율을 TikiDoc이 해결합니다.</p>
          </div>
          <div className="problem-grid">
            <div className="problem-card">
              <div className="problem-num">01</div>
              <h3>환자 질문이 직원의 발목을 잡습니다</h3>
              <p>
                반복되는 전화, 메시지, 직접 문의로 진료 전 직원 리소스가 낭비됩니다.
                같은 질문에 매번 수동으로 답해야 하는 비효율을 없앱니다.
              </p>
            </div>
            <div className="problem-card">
              <div className="problem-num">02</div>
              <h3>진료실에서 소통이 단절됩니다</h3>
              <p>
                다국어 환자와 의사 사이의 언어 장벽이 진료 품질을 위협합니다.
                실시간 소통 도구 없이는 오해와 불안이 쌓입니다.
              </p>
            </div>
            <div className="problem-card">
              <div className="problem-num">03</div>
              <h3>퇴원 후 팔로업이 사라집니다</h3>
              <p>
                시술 후 환자 케어가 단절되면 재방문율과 만족도가 동시에 떨어집니다.
                체계적인 사후관리 없이는 클리닉 성장이 어렵습니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Product surfaces ──────────────────────────────────────── */}
      <section className="section-alt" id="product">
        <div className="wrap">
          <div className="section-header">
            <p className="eyebrow">
              <span className="eyebrow-dot" />
              세 가지 전용 도구
            </p>
            <h2>환자 여정의 각 단계에 맞는 전문 도구</h2>
            <p>범용 챗봇이 아닙니다. 클리닉 진료 흐름 전용으로 설계된 도구입니다.</p>
          </div>

          <div className="product-grid">
            {/* Tiki Paste */}
            <div className="product-card">
              <div className="product-copy">
                <span className="product-tag tag-paste">Tiki Paste · 진료 전</span>
                <h3>환자 질문에 즉각 답하는<br />직원용 AI 응답 도구</h3>
                <p>
                  환자가 시술, 주의사항, 비용을 물어보면 Tiki Paste가 클리닉 지식을 기반으로
                  검토된 답변을 추천합니다. 직원은 선택하고 전송만 하면 됩니다.
                  반복 질문에 소비되는 시간을 줄이고, 일관된 안내를 보장합니다.
                </p>
                <div className="product-note">
                  <span className="product-note-dot" style={{background:"var(--accent)"}} />
                  직원이 최종 확인 후 전송 — AI가 자동 발송하지 않습니다
                </div>
              </div>
              <div className="product-visual">
                <div className="mock-paste">
                  <div className="mock-paste-msg">
                    <div className="mock-paste-msg-top">
                      <span>🇺🇸</span> 환자 문의
                    </div>
                    <div className="mock-paste-msg-text">
                      보톡스 시술 후 운동해도 되나요?
                    </div>
                  </div>
                  <div className="mock-paste-reply sel">
                    <div className="mock-dot" style={{background:"var(--accent)"}} />
                    <div className="mock-reply-inner">
                      <div className="mock-reply-label" style={{color:"var(--accent-dk)"}}>AI 추천</div>
                      <div className="mock-reply-text">시술 후 24시간은 격렬한 운동을 피해주세요. 가벼운 걷기는 괜찮습니다.</div>
                    </div>
                  </div>
                  <div className="mock-paste-reply unsel">
                    <div className="mock-dot" style={{background:"var(--border)"}} />
                    <div className="mock-reply-inner">
                      <div className="mock-reply-label" style={{color:"var(--text-muted)"}}>대안</div>
                      <div className="mock-reply-text">운동은 48시간 후부터 가능합니다. 사우나도 피해주세요.</div>
                    </div>
                  </div>
                  <div className="mock-send-bar">
                    <span className="mock-send-label">선택한 답변 전송</span>
                    <span className="mock-send-btn">전송 →</span>
                  </div>
                </div>
              </div>
            </div>

            {/* My Tiki + TikiBell */}
            <div className="product-card reverse">
              <div className="product-copy">
                <span className="product-tag tag-mytiki">My Tiki · 환자 여정</span>
                <h3>환자가 스스로<br />방문 여정을 완성하는 포털</h3>
                <p>
                  QR 링크 하나로 환자는 도착 체크인, 문진표, TikiBell 안내, 사후관리까지 모두 처리합니다.
                  다국어 지원으로 외국인 환자도 불안 없이 진료를 준비할 수 있습니다.
                  직원 호출 없이 환자 스스로 흐름을 완성합니다.
                </p>
                <div className="product-note">
                  <span className="product-note-dot" style={{background:"var(--sage)"}} />
                  TikiBell은 클리닉 프로토콜 기반 — 진단이 아닌 안내입니다
                </div>
              </div>
              <div className="product-visual">
                <div className="mock-mytiki">
                  <div className="mock-mytiki-top">
                    <div className="mock-mytiki-logo"><div className="mock-mytiki-logo-dot" /></div>
                    <span className="mock-mytiki-title">My Tiki</span>
                    <span className="mock-mytiki-lang">🇰🇷 한국어</span>
                  </div>
                  <div className="mock-arrival-btn">
                    <div className="mock-flag">✋</div>
                    도착했어요
                  </div>
                  <div className="mock-form-chips">
                    <div className="mock-form-chip done">
                      <span className="mock-form-check">✓</span>
                      사전 문진표 완료
                    </div>
                    <div className="mock-form-chip done">
                      <span className="mock-form-check">✓</span>
                      주의사항 확인 완료
                    </div>
                    <div className="mock-form-chip pending">
                      <span className="mock-form-check">○</span>
                      시술 후 케어 안내 대기 중
                    </div>
                  </div>
                  <div className="mock-bell-row">
                    <div className="mock-bell-label">TikiBell</div>
                    <div className="mock-bell-msg">시술 전 궁금한 점이 있으신가요? 안전한 범위에서 안내해드립니다.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tiki Room */}
            <div className="product-card">
              <div className="product-copy">
                <span className="product-tag tag-room">Tiki Room · 진료 중</span>
                <h3>진료실에서 의사가<br />언어 장벽 없이 소통하는 도구</h3>
                <p>
                  환자의 말을 요약하고, 의사가 선택한 답변을 환자 언어로 전달합니다.
                  음성 입력도 지원해 자연스러운 대화가 가능합니다.
                  소통의 최종 결정은 항상 의사에게 있습니다.
                </p>
                <div className="product-note">
                  <span className="product-note-dot" style={{background:"var(--azure)"}} />
                  의사가 항상 응답을 선택 — 자동 답변 없음
                </div>
              </div>
              <div className="product-visual">
                <div className="mock-room">
                  <div className="mock-room-header">
                    <div className="mock-room-live">
                      <div className="mock-room-live-dot" />
                      LIVE
                    </div>
                    <span className="mock-room-name">진료실 A</span>
                    <span className="mock-room-lang">🇺🇸 EN → 🇰🇷 KO</span>
                  </div>
                  <div className="mock-room-doctor-msg">
                    <div className="mock-room-doctor-meta">환자 말 (요약)</div>
                    <div className="mock-room-doctor-text">
                      "My face feels tight after the procedure. Is that normal?"
                    </div>
                  </div>
                  <div className="mock-room-patient-output">
                    <div className="mock-room-patient-label">
                      <span>의사 → 환자 (번역)</span>
                    </div>
                    <div className="mock-room-patient-text">시술 후 48시간 안에 자연스럽게 완화됩니다.</div>
                    <div className="mock-room-sub">붓기와 당김은 정상 반응입니다.</div>
                  </div>
                  <div className="mock-room-selects">
                    <div className="mock-room-select active">
                      <div className="mock-room-select-dot" style={{background:"var(--azure)"}} />
                      <div className="mock-room-select-text">정상입니다. 48시간 내 완화됩니다.</div>
                    </div>
                    <div className="mock-room-select inactive">
                      <div className="mock-room-select-dot" style={{background:"var(--border)"}} />
                      <div className="mock-room-select-text">냉찜질 후 경과를 지켜봐 주세요.</div>
                    </div>
                  </div>
                  <div className="mock-room-send">
                    환자에게 전달
                    <span className="mock-room-send-btn">전송</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Patient journey ───────────────────────────────────────── */}
      <section className="section" id="journey">
        <div className="wrap">
          <div className="section-header">
            <p className="eyebrow">
              <span className="eyebrow-dot" />
              환자 여정
            </p>
            <h2>예약부터 사후관리까지 끊김 없는 흐름</h2>
            <p>각 단계에서 올바른 도구가 올바른 역할을 수행합니다.</p>
          </div>
          <div className="journey-steps">
            <div className="journey-step">
              <div className="journey-num">
                <div className="journey-num-circle">1</div>
              </div>
              <span className="journey-surface" style={{background:"var(--accent-pale)", color:"var(--accent-dk)"}}>Tiki Paste</span>
              <h4>예약 후 질문 대응</h4>
              <p>직원이 AI 추천 답변으로 환자 질문에 신속하게 대응합니다.</p>
            </div>
            <div className="journey-step">
              <div className="journey-num">
                <div className="journey-num-circle">2</div>
              </div>
              <span className="journey-surface" style={{background:"var(--sage-pale)", color:"#3d7068"}}>My Tiki</span>
              <h4>방문 전 준비</h4>
              <p>환자가 QR 링크로 문진표를 작성하고 주의사항을 확인합니다.</p>
            </div>
            <div className="journey-step">
              <div className="journey-num">
                <div className="journey-num-circle">3</div>
              </div>
              <span className="journey-surface" style={{background:"var(--sage-pale)", color:"#3d7068"}}>My Tiki</span>
              <h4>도착 체크인</h4>
              <p>환자가 직접 체크인 — 직원 호출 없이 자동으로 처리됩니다.</p>
            </div>
            <div className="journey-step">
              <div className="journey-num">
                <div className="journey-num-circle">4</div>
              </div>
              <span className="journey-surface" style={{background:"var(--azure-pale)", color:"#3c4f7a"}}>Tiki Room</span>
              <h4>진료 중 소통</h4>
              <p>의사가 언어에 관계없이 환자와 실시간으로 소통합니다.</p>
            </div>
            <div className="journey-step">
              <div className="journey-num">
                <div className="journey-num-circle">5</div>
              </div>
              <span className="journey-surface" style={{background:"var(--sage-pale)", color:"#3d7068"}}>My Tiki</span>
              <h4>사후관리</h4>
              <p>자동 팔로업 메시지로 케어 연속성을 유지하고 재방문을 유도합니다.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Ops layer (Tiki Desk) ─────────────────────────────────── */}
      <section className="section-alt" id="ops">
        <div className="wrap">
          <div className="ops-inner">
            <div className="ops-copy">
              <span className="ops-tag">Tiki Desk · 내부 운영 도구</span>
              <h2>직원이 보는 운영 보드,<br />환자에게는 보이지 않습니다</h2>
              <p>
                도착 순서, 방 배정, 에스컬레이션, 사후관리 — Tiki Desk가 클리닉 전체를
                한 화면에 정리합니다. 직원 전용 내부 운영 도구로, 환자에게 공개되지 않습니다.
              </p>
              <div className="ops-metrics">
                <div className="ops-metric">
                  <span className="ops-metric-label">오늘 예약</span>
                  <span className="ops-metric-value" style={{color:"var(--text)"}}>12명</span>
                  <span className="ops-metric-sub">예정</span>
                </div>
                <div className="ops-metric">
                  <span className="ops-metric-label">도착 완료</span>
                  <span className="ops-metric-value" style={{color:"var(--sage)"}}>7명</span>
                  <span className="ops-metric-sub">체크인</span>
                </div>
                <div className="ops-metric">
                  <span className="ops-metric-label">방 사용 중</span>
                  <span className="ops-metric-value" style={{color:"var(--azure)"}}>3개</span>
                  <span className="ops-metric-sub">진료 중</span>
                </div>
              </div>
            </div>
            <div>
              <div className="ops-board-mini">
                <div className="ops-board-mini-header">
                  <div className="ops-board-mini-dot" />
                  <span className="ops-board-mini-title">오늘의 환자 현황</span>
                  <span className="ops-board-mini-time">오전 11:24</span>
                </div>
                <div className="ops-board-row arrived">
                  <span className="ops-board-flag">🇺🇸</span>
                  <span className="ops-board-name">Sarah M.</span>
                  <span className="ops-board-badge badge-arrived">도착</span>
                  <span className="ops-board-badge badge-room">룸 A</span>
                </div>
                <div className="ops-board-row checkedin">
                  <span className="ops-board-flag">🇯🇵</span>
                  <span className="ops-board-name">田中 花子</span>
                  <span className="ops-board-badge badge-checkedin">진료 중</span>
                  <span className="ops-board-badge badge-room">룸 B</span>
                </div>
                <div className="ops-board-row waiting">
                  <span className="ops-board-flag">🇰🇷</span>
                  <span className="ops-board-name">김지수</span>
                  <span className="ops-board-badge badge-waiting">대기 중</span>
                </div>
                <div className="ops-board-row waiting">
                  <span className="ops-board-flag">🇨🇳</span>
                  <span className="ops-board-name">李小红</span>
                  <span className="ops-board-badge badge-waiting">예약</span>
                </div>
                <div className="ops-board-mini-footer">
                  + 8명 더 · 오늘 남은 예약
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust ─────────────────────────────────────────────────── */}
      <section className="section">
        <div className="wrap">
          <div className="section-header">
            <p className="eyebrow">
              <span className="eyebrow-dot" />
              신뢰할 수 있는 이유
            </p>
            <h2>클리닉 운영에 맞게 설계된 원칙</h2>
          </div>
          <div className="trust-grid">
            <div className="trust-card">
              <div className="trust-icon">🔒</div>
              <h3>의사가 소통을 통제합니다</h3>
              <p>
                Tiki Room의 모든 환자용 응답은 의사가 직접 선택합니다.
                AI가 자동으로 환자에게 메시지를 보내지 않습니다. 임상 결정권은 항상 의료인에게 있습니다.
              </p>
            </div>
            <div className="trust-card">
              <div className="trust-icon">🗂️</div>
              <h3>클리닉 지식 기반 답변만</h3>
              <p>
                Tiki Paste와 TikiBell은 클리닉이 등록한 시술 정보와 프로토콜만 참조합니다.
                범용 AI 답변이 아닌, 클리닉이 검증한 내용만 안내합니다.
              </p>
            </div>
            <div className="trust-card">
              <div className="trust-icon">🌐</div>
              <h3>다국어, 실시간 지원</h3>
              <p>
                한국어, 영어, 일본어, 중국어 등 환자 언어에 맞게 자동 대응합니다.
                외국인 환자도 불편 없이 진료를 받을 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA banner ────────────────────────────────────────────── */}
      <section className="section">
        <div className="wrap">
          <div className="cta-banner">
            <div className="cta-banner-copy">
              <h2>지금 바로 클리닉에서 사용해보세요</h2>
              <p>app.tikidoc.xyz에서 바로 시작할 수 있습니다.</p>
            </div>
            <div className="cta-banner-actions">
              <a className="btn-white" href={APP_URL}>앱 열기 →</a>
              <a className="btn-ghost-white" href={`${APP_URL}/login`}>이미 계정이 있으신가요? 로그인</a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="footer">
        <div className="footer-inner wrap">
          <div>
            <div className="footer-brand">
              <div className="brand-mark" style={{width:"26px",height:"26px",fontSize:"12px"}}>T</div>
              <span className="footer-brand-name">TikiDoc</span>
            </div>
            <div className="footer-brand-sub">클리닉 운영을 위한 전용 AI 도구</div>
          </div>
          <ul className="footer-links">
            <li><a href={APP_URL}>앱 열기</a></li>
            <li><a href={`${APP_URL}/login`}>로그인</a></li>
          </ul>
        </div>
        <div className="wrap">
          <div className="footer-copy">© 2026 TikiDoc. All rights reserved.</div>
        </div>
      </footer>
    </>
  );
}
