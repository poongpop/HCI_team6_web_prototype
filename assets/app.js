// HCI 6조 프로토타입 공통 스크립트
// 시연용 칸 데이터: QR 키(QR 안에만 들어감) + 확인코드(칸 안에 따로 표시, QR 훼손 시 수동 입력용)
// ※ 정적 호스팅이라 이 목록은 공개 파일에 포함됨 → 보고서에 한계로 기재
// temp: 칸 내부 현재 온도(모의 데이터, 실제 서비스에서는 열차 온도 센서 값)
const CARS = {
  '2045':   { line: '2호선', key: 'K7P2QX', code: '7318', temp: 24.5 },
  '2046':   { line: '2호선', key: 'R4M8TZ', code: '5902', temp: 19.0 },
  '7123':   { line: '7호선', key: 'B9X3LW', code: '2647', temp: 22.0 },
  '341106': { line: '4호선', key: 'H2D6VN', code: '8051', temp: 21.5 }, // 신형 열차(6자리) 예시
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

// QR 훼손 시 수동 입력 확인: 칸 번호 + 확인코드
function verifyManual(car, code) {
  const c = CARS[car];
  if (!c) return 'NO_CAR';
  if (c.code !== code) return 'BAD_CODE';
  return 'OK';
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
