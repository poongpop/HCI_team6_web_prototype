// 민원 유형별 페이지 공통 화면 (환경민원, 안내방송, 질서저해, 긴급상황)
// cfg = { title, options, cols, roles, memo, photo, warn, timeline }
function renderComplaint(cfg) {
  const { car, key } = getParams();
  if (!verifyQr(car, key)) { location.replace('../index.html'); return; }

  const info = CARS[car];
  const carLabel = `${info.line} ${car}호차`;
  const home = '../index.html' + qs(car);
  const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
  const optBtns = (list, group) => list.map(o => `<button type="button" class="opt" data-g="${group}" data-v="${esc(o)}" aria-pressed="false">${esc(o)}</button>`).join('');

  document.title = `${cfg.title} 민원 (프로토타입)`;
  document.body.innerHTML = `
  <header class="topbar"><div class="inner"><a class="back" href="${home}" aria-label="뒤로">‹</a><h1>${cfg.title}</h1></div></header>
  <main class="wrap">
    <div class="carbadge"><span class="dot"></span><div><b>${carLabel} · ${info.pos}번째 칸</b><small>지금 타고 있는 칸으로 접수돼요</small></div></div>

    <section class="step on" id="s1">
      ${cfg.warn ? `<div class="warn">${cfg.warn}</div>` : ''}
      <p class="lead">어떤 불편이 있으신가요?</p>
      <div class="opts ${cfg.cols === 1 ? 'one' : ''}">${optBtns(cfg.options, 'type')}</div>

      ${cfg.roles ? `<p class="sub-label">${cfg.roles.label}</p><div class="opts">${optBtns(cfg.roles.options, 'role')}</div>` : ''}

      ${cfg.memo ? `<p class="sub-label">${cfg.memo.label}</p>
        <textarea class="memo" id="memo" maxlength="${cfg.memo.max}" placeholder="${esc(cfg.memo.placeholder)}"></textarea>
        <div class="count"><span id="cnt">0</span>/${cfg.memo.max}자</div>` : ''}

      ${cfg.photo ? `<div class="photos">
        <label class="photo-btn">사진촬영<input type="file" accept="image/*" capture="environment"></label>
        <label class="photo-btn">사진첨부<input type="file" accept="image/*"></label>
        <span id="thumbs"></span>
      </div>` : ''}

      <div class="submit-bar"><button class="btn primary" id="submitBtn" disabled>민원신고</button></div>
    </section>

    <section class="step" id="s3">
      <div class="done-icon"><svg width="36" height="36" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" stroke="#1f9d61" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
      <p class="lead center" style="margin-top:8px">접수되었어요</p>
      <p class="desc center" id="doneDesc"></p>
      <div class="card"><ul class="timeline" id="timeline"></ul></div>
      <div class="card" style="font-size:14px;color:var(--sub);line-height:1.6">
        <table class="summary">
          <tr><th>접수번호</th><td id="ticket"></td></tr>
          <tr><th>접수 시각</th><td id="time"></td></tr>
        </table>
      </div>
      <a class="btn ghost" href="${home}" style="margin-top:12px">처음으로</a>
    </section>

    <p class="footer">HCI 6조 프로토타입 · 실제 민원은 접수되지 않습니다</p>
  </main>`;

  // 선택지: 그룹마다 하나만 선택
  const picked = {};
  const submitBtn = document.getElementById('submitBtn');
  document.querySelectorAll('.opt').forEach(b => b.addEventListener('click', () => {
    const g = b.dataset.g;
    const already = b.getAttribute('aria-pressed') === 'true';
    document.querySelectorAll(`.opt[data-g="${g}"]`).forEach(x => x.setAttribute('aria-pressed', 'false'));
    if (!already) { b.setAttribute('aria-pressed', 'true'); picked[g] = b.dataset.v; } else { delete picked[g]; }
    submitBtn.disabled = !picked.type;
  }));

  const memo = document.getElementById('memo');
  if (memo) memo.addEventListener('input', () => { document.getElementById('cnt').textContent = memo.value.length; });

  // 사진: 미리보기만 하고 어디에도 전송하지 않음
  document.querySelectorAll('.photo-btn input').forEach(inp => inp.addEventListener('change', () => {
    const f = inp.files && inp.files[0];
    if (!f) return;
    const img = document.createElement('img');
    img.className = 'thumb'; img.alt = '첨부한 사진';
    img.src = URL.createObjectURL(f);
    document.getElementById('thumbs').appendChild(img);
    inp.value = '';
  }));

  submitBtn.addEventListener('click', () => {
    if (!picked.type) return;
    const now = new Date();
    const hm = now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('ticket').textContent = 'T' + now.toISOString().slice(2, 10).replace(/-/g, '') + '-' + String(Math.floor(Math.random() * 9000) + 1000);
    document.getElementById('time').textContent = now.toLocaleString('ko-KR');
    document.getElementById('doneDesc').textContent = `${carLabel} · ${cfg.title} · ${picked.type}${picked.role ? ' (' + picked.role + ')' : ''}`;
    const steps = cfg.timeline.map((t, i) => `<li class="${i < 2 ? 'ok' : ''}">${t[0]}<small>${i === 0 ? hm : t[1]}</small></li>`);
    document.getElementById('timeline').innerHTML = steps.join('');
    document.querySelectorAll('.step').forEach(s => s.classList.toggle('on', s.id === 's3'));
    window.scrollTo(0, 0);
  });
}
