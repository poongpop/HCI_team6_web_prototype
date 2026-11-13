// HCI 6조 프로토타입 공통 스크립트
// 시연용 칸 데이터: QR 키(QR 주소 안에만 들어감). QR이 작동하지 않으면 문자 접수로 안내
// ※ 정적 호스팅이라 이 목록은 공개 파일에 포함됨 → 보고서에 한계로 기재
// temp: 칸 내부 현재 온도(모의 데이터, 실제 서비스에서는 열차 온도 센서 값)
const CARS = {
  '2045':   { line: '2호선', key: 'K7P2QX', temp: 24.5 },
  '2046':   { line: '2호선', key: 'R4M8TZ', temp: 19.0 },
  '7123':   { line: '7호선', key: 'B9X3LW', temp: 22.0 },
  '341106': { line: '4호선', key: 'H2D6VN', temp: 21.5 }, // 신형 열차(6자리) 예시
};
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
