// HCI 6조 프로토타입 공통 스크립트
// 시연용 칸 데이터: QR 키(QR 주소 안에만 들어감). QR이 작동하지 않으면 문자 접수로 안내
// ※ 정적 호스팅이라 이 목록은 공개 파일에 포함됨 → 보고서에 한계로 기재
// temp: 칸 내부 현재 온도(모의 데이터, 실제 서비스에서는 열차 온도 센서 값)
// pos: 열차에서 몇 번째 칸인지, cars: 열차 전체 칸 수 (QR이 칸에 붙어 있으므로 정확히 알 수 있음)
const CARS = {
  '2045':   { line: '2호선', key: 'K7P2QX', temp: 24.5, pos: 4, cars: 10 },
  '2046':   { line: '2호선', key: 'R4M8TZ', temp: 19.0, pos: 5, cars: 10 },
  '7123':   { line: '7호선', key: 'B9X3LW', temp: 22.0, pos: 3, cars: 8 },
  '341106': { line: '4호선', key: 'H2D6VN', temp: 21.5, pos: 6, cars: 10 }, // 신형 열차(6자리) 예시
};

// 타고 있는 칸 그림
function trainDiagram(car) {
  const c = CARS[car];
  let cells = '';
  for (let i = 1; i <= c.cars; i++) {
    const cls = i === c.pos ? 'me' : '';
    cells += `<span class="tc ${cls}${i === 1 ? ' head' : ''}">${i}</span>`;
  }
  return `<div class="train" role="img" aria-label="${c.cars}칸 열차 중 ${c.pos}번째 칸에 타고 계세요">
    <div class="train-pin" style="--p:${c.pos};--n:${c.cars}"><span>타고 계신 칸</span><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M12 22s7-7.2 7-12.5A7 7 0 0 0 5 9.5C5 14.8 12 22 12 22z" fill="#f07a2b"/><circle cx="12" cy="9.5" r="2.6" fill="#fff"/></svg></div>
    <div class="train-cars" style="--n:${c.cars}">${cells}</div>
    <p class="train-cap"><b>${c.pos}번째 칸</b> · ${car}호차 <span>(${c.cars}칸 열차)</span></p>
  </div>`;
}
const RECOMMENDED_WINTER = 20; // 겨울철 권장 난방 온도

function getParams() {
  const p = new URLSearchParams(location.search);
  return { car: (p.get('car') || '').trim(), key: (p.get('key') || '').trim() };
}

// QR로 들어온 접속인지 확인: 칸 번호와 키가 짝이 맞아야 통과
function verifyQr(car, key) {
  const c = CARS[car];
  return !!(c && key && c.key === key);
}


function qs(car) {
  return `?car=${encodeURIComponent(car)}&key=${encodeURIComponent(CARS[car].key)}`;
}

function showToast(msg) {
  let t = document.querySelector('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove('show'), 2200);
}

// 저장소 접근은 실패할 수 있으므로 항상 감싸서 사용
const store = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
};
