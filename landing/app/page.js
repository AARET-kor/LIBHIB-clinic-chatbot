const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.tikidoc.xyz";

const products = [
  {
    name: "Tiki Paste",
    stage: "진료 전 문의",
    title: "반복 질문을 직원이 검토 가능한 답변으로 정리합니다",
    body: "환자가 시술, 주의사항, 비용을 물어보면 클리닉 지식 기반의 답변 후보를 제안합니다. 직원은 확인하고 보낼 답변만 고르면 됩니다.",
    note: "AI가 자동 발송하지 않고, 직원 검토를 유지합니다.",
    className: "paste",
  },
  {
    name: "My Tiki + TikiBell",
    stage: "환자 포털",
    title: "환자가 링크 하나로 도착, 문진, 안내, 사후관리를 이어갑니다",
    body: "My Tiki는 환자용 입구이고, TikiBell은 그 안에서 환자를 안내하는 helper입니다. 다국어 환자도 같은 흐름 안에서 방문을 준비합니다.",
    note: "환자에게는 간단하고, 직원에게는 누락이 보입니다.",
    className: "mytiki",
  },
  {
    name: "Tiki Room",
    stage: "진료실 소통",
    title: "진료실 안에서 의사가 통제하는 다국어 소통을 돕습니다",
    body: "환자 말을 요약하고, 의사가 선택한 표현을 환자 언어로 전달합니다. 진료실 대화의 주도권은 항상 의료진에게 있습니다.",
    note: "자동 답변이 아니라 doctor-controlled flow입니다.",
    className: "room",
  },
];

const plans = [
  {
    name: "Pilot Clinic",
    scale: "작은 클리닉 / 첫 도입",
    highlight: "가장 낮은 리스크로 시작",
    description: "한 지점에서 실제 환자 흐름을 검증하고 싶은 클리닉에 맞춥니다.",
    features: ["기본 환자 링크 흐름", "Tiki Paste / My Tiki / Tiki Room", "초기 운영 세팅 지원"],
  },
  {
    name: "Growth Clinic",
    scale: "운영량이 있는 클리닉",
    highlight: "권장",
    description: "여러 시술과 반복 문의, 사후관리 흐름을 안정적으로 운영하려는 팀에 적합합니다.",
    features: ["운영 보드 중심 워크플로", "시술/프로토콜 기반 응답", "사후관리 플랜 운영", "직원 사용 온보딩"],
    featured: true,
  },
  {
    name: "Clinic Group",
    scale: "다지점 / 확장 운영",
    highlight: "상담 후 설계",
    description: "여러 지점, 여러 역할, 운영 정책 차이가 있는 조직에 맞춰 도입 범위를 정합니다.",
    features: ["지점별 운영 구성", "고급 설정 협의", "도입/교육 계획", "확장 로드맵 정리"],
  },
];

export default function LandingPage() {
  return (
    <>
      <nav className="nav">
        <div className="nav-inner wrap">
          <a href="/" className="brand" aria-label="TikiDoc home">
            <span className="brand-mark">T</span>
            <span>TikiDoc</span>
          </a>
          <ul className="nav-links">
            <li><a href="#why-now">문제</a></li>
            <li><a href="#journey">환자 여정</a></li>
            <li><a href="#products">제품</a></li>
            <li><a href="#pricing">도입 상담</a></li>
          </ul>
          <div className="nav-actions">
            <a className="btn btn-quiet" href={`${APP_URL}/login`}>로그인</a>
            <a className="btn btn-primary" href={APP_URL}>앱 열기</a>
          </div>
        </div>
      </nav>

      <main>
        <section className="hero wrap">
          <div className="hero-copy">
            <p className="eyebrow"><span />클리닉 운영을 조용하게 정리하는 AI 운영 도구</p>
            <h1>
              환자 흐름은 더 선명하게,
              <br />
              직원 업무는 더 가볍게.
            </h1>
            <p className="hero-lead">
              TikiDoc은 진료 전 문의, 환자 포털, 진료실 소통, 사후관리를 하나의 운영 흐름으로 연결합니다.
              화려한 챗봇이 아니라 실제 클리닉이 매일 쓰는 도구에 가깝게 설계했습니다.
            </p>
            <div className="hero-actions">
              <a className="btn btn-primary btn-large" href={APP_URL}>앱에서 확인하기</a>
              <a className="btn btn-secondary btn-large" href="#pricing">도입 상담 보기</a>
            </div>
          </div>

          <div className="hero-board" aria-label="TikiDoc patient flow preview">
            <div className="board-top">
              <div>
                <span className="board-kicker">TODAY FLOW</span>
                <strong>오전 진료 운영</strong>
              </div>
              <span className="board-status">정상 운영</span>
            </div>
            <div className="flow-stack">
              <div className="flow-row active">
                <span className="flow-time">09:40</span>
                <div>
                  <strong>Sarah M. 도착</strong>
                  <p>문진 완료 · Tiki Room 준비 가능</p>
                </div>
                <span className="flow-badge">룸 대기</span>
              </div>
              <div className="flow-row">
                <span className="flow-time">10:10</span>
                <div>
                  <strong>김지수 예약</strong>
                  <p>동의서 미완료 · My Tiki 알림 필요</p>
                </div>
                <span className="flow-badge warning">확인</span>
              </div>
              <div className="flow-row">
                <span className="flow-time">11:30</span>
                <div>
                  <strong>田中 花子 사후관리</strong>
                  <p>TikiBell 안내 완료 · 증상 이상 없음</p>
                </div>
                <span className="flow-badge calm">완료</span>
              </div>
            </div>
            <div className="board-metrics">
              <div><strong>12</strong><span>오늘 예약</span></div>
              <div><strong>7</strong><span>도착 완료</span></div>
              <div><strong>2</strong><span>확인 필요</span></div>
            </div>
          </div>
        </section>

        <section className="section" id="why-now">
          <div className="wrap split">
            <div className="section-copy">
              <p className="eyebrow"><span />Why now</p>
              <h2>클리닉 운영의 병목은 이미 환자 여정 안에서 생깁니다.</h2>
              <p>
                직원은 문의, 문진, 도착 확인, 진료실 소통, 사후관리까지 계속 끊긴 화면을 오갑니다.
                TikiDoc은 이 병목을 더 많은 대시보드가 아니라 더 명확한 환자 흐름으로 정리합니다.
              </p>
            </div>
            <div className="problem-list">
              <article>
                <span>01</span>
                <strong>질문은 반복되지만 답변 품질은 흔들립니다</strong>
                <p>시술 전 안내와 주의사항이 직원별로 달라지면 환자 경험도 흔들립니다.</p>
              </article>
              <article>
                <span>02</span>
                <strong>도착 후 누가 무엇을 해야 하는지 늦게 보입니다</strong>
                <p>예약 순서, 실제 도착 순서, 준비 상태가 분리되면 현장 판단이 늦어집니다.</p>
              </article>
              <article>
                <span>03</span>
                <strong>사후관리는 중요하지만 운영에서는 자주 빠집니다</strong>
                <p>환자 반응과 이상 신호가 보이지 않으면 재방문과 안전 관리가 모두 약해집니다.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="section warm" id="journey">
          <div className="wrap">
            <div className="section-header">
              <p className="eyebrow"><span />Patient journey</p>
              <h2>예약부터 사후관리까지, 한 번에 읽히는 환자 흐름.</h2>
            </div>
            <div className="journey-track">
              {["문의", "예약", "방문 준비", "도착", "진료실", "사후관리"].map((step, index) => (
                <article className="journey-card" key={step}>
                  <span className="journey-number">{String(index + 1).padStart(2, "0")}</span>
                  <strong>{step}</strong>
                  <p>
                    {[
                      "Tiki Paste가 반복 문의를 정리합니다.",
                      "환자 링크가 다음 준비를 안내합니다.",
                      "My Tiki에서 문진과 안내를 완료합니다.",
                      "도착 신호가 직원 보드에 반영됩니다.",
                      "Tiki Room이 다국어 소통을 돕습니다.",
                      "TikiBell이 케어 흐름을 이어갑니다.",
                    ][index]}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="products">
          <div className="wrap">
            <div className="section-header">
              <p className="eyebrow"><span />Product surfaces</p>
              <h2>세 개의 제품 표면이 각자 한 가지 일을 분명하게 합니다.</h2>
              <p>모든 것을 하나의 챗봇으로 밀어 넣지 않고, 현장 사용 맥락에 맞춰 나눴습니다.</p>
            </div>
            <div className="product-grid">
              {products.map((product) => (
                <article className={`product-card ${product.className}`} key={product.name}>
                  <div className="product-card-head">
                    <span className="product-dot" />
                    <span>{product.stage}</span>
                  </div>
                  <h3>{product.name}</h3>
                  <h4>{product.title}</h4>
                  <p>{product.body}</p>
                  <div className="product-note">{product.note}</div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section warm" id="ops">
          <div className="wrap ops-grid">
            <div className="section-copy">
              <p className="eyebrow"><span />Operational value</p>
              <h2>운영팀이 바로 알아야 하는 것만 앞으로 끌어옵니다.</h2>
              <p>
                Tiki Desk는 예약 순서, 실제 도착 순서, 준비 상태, urgent 신호를 한 화면에서 읽도록 설계됩니다.
                환자에게 보이지 않는 내부 운영 표면입니다.
              </p>
            </div>
            <div className="ops-panel">
              <div className="ops-line"><span>도착 순서</span><strong>체크인 기준으로 자동 정렬</strong></div>
              <div className="ops-line"><span>준비 상태</span><strong>문진 · 동의 · 룸 준비를 한눈에</strong></div>
              <div className="ops-line urgent"><span>확인 필요</span><strong>긴급/우려 신호는 색으로 분리</strong></div>
              <div className="ops-line"><span>사후관리</span><strong>환자 반응과 clinic review를 연결</strong></div>
            </div>
          </div>
        </section>

        <section className="section" id="pricing">
          <div className="wrap">
            <div className="section-header pricing-header">
              <p className="eyebrow"><span />Pricing</p>
              <h2>가격은 공개 고정가가 아니라, 클리닉 운영 규모에 맞춰 상담합니다.</h2>
              <p>
                TikiDoc은 단순 좌석 과금보다 환자 흐름, 시술 수, 운영 복잡도에 영향을 받습니다.
                아래 플랜은 견적 기준을 잡기 위한 도입 범위입니다.
              </p>
            </div>
            <div className="pricing-grid">
              {plans.map((plan) => (
                <article className={`plan-card ${plan.featured ? "featured" : ""}`} key={plan.name}>
                  <div className="plan-top">
                    <span className="plan-scale">{plan.scale}</span>
                    <span className="plan-highlight">{plan.highlight}</span>
                  </div>
                  <h3>{plan.name}</h3>
                  <p>{plan.description}</p>
                  <div className="plan-price">상담 후 견적</div>
                  <ul>
                    {plan.features.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                  <a className={plan.featured ? "btn btn-primary" : "btn btn-secondary"} href={`${APP_URL}/login`}>
                    도입 상담 문의
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="cta-section">
          <div className="wrap cta-panel">
            <div>
              <p className="eyebrow light"><span />Start calmly</p>
              <h2>작게 시작해도, 운영 흐름은 처음부터 선명해야 합니다.</h2>
              <p>랜딩은 `tikidoc.xyz`, 실제 제품은 `app.tikidoc.xyz`에서 유지합니다.</p>
            </div>
            <div className="cta-actions">
              <a className="btn btn-invert btn-large" href={APP_URL}>앱 열기</a>
              <a className="cta-login" href={`${APP_URL}/login`}>이미 계정이 있으면 로그인</a>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-inner wrap">
          <div className="footer-brand">
            <span className="brand-mark small">T</span>
            <div>
              <strong>TikiDoc</strong>
              <p>Warm clinical operations for modern clinics.</p>
            </div>
          </div>
          <div className="footer-links">
            <a href={APP_URL}>app.tikidoc.xyz</a>
            <a href={`${APP_URL}/login`}>로그인</a>
          </div>
        </div>
      </footer>
    </>
  );
}
