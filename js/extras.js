/* v1.2 体验层：设置、当前目标、小地图。 */
G.settings = (function () {
  const KEY = 'afu-mail-route/settings/v1';
  const DEF = { text: 'normal', autoRun: false, goal: true, newMarks: true, weather: true };
  const DELAY = { slow: 46, normal: 28, fast: 12, instant: 0 };
  let v = Object.assign({}, DEF);
  try { Object.assign(v, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { /* 忽略 */ }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) { /* 忽略 */ } };
  return {
    get: (k) => v[k],
    set(k, val) { v[k] = val; save(); },
    textDelay: () => DELAY[v.text] != null ? DELAY[v.text] : 28,
    all: () => v,
  };
})();

G.extras = (function () {
  const S = G.STORY;
  const last = {};               // 每条线上一次的提示，用来判断"刚有进展"
  let mapOpen = false, setOpen = false, flashT = null;

  /* ---------- 当前目标 ---------- */
  function hintOf(list) { return (list.find((x) => G.state.test(x.if)) || {}).text || ''; }
  function lines() {
    const st = G.state.s, out = [];
    S.letters.forEach((l) => {
      if (l.id === 'afu') { if (st.counters.delivered >= 5) out.push({ id: 'L_afu', title: '“阿福 收”', hint: hintOf(l.hints), done: G.state.test('f:ending') }); return; }
      out.push({ id: 'L_' + l.id, title: l.to, hint: hintOf(l.hints), done: G.state.test('d:' + l.id) });
    });
    (S.quests || []).forEach((q) => { if (G.state.test(q.show)) out.push({ id: 'Q_' + q.id, title: q.title, hint: hintOf(q.hints), done: G.state.test(q.hints[0].if), side: true }); });
    return out;
  }
  function goal() {
    const st = G.state.s;
    if (!st.flags.intro_done) return { title: '', hint: '和邮局门口的小吴说说话。' };
    const ls = lines();
    let changed = null;
    ls.forEach((l) => { if (last[l.id] !== undefined && last[l.id] !== l.hint && !l.done) changed = l.id; last[l.id] = l.hint; });
    if (changed) { st.goal = changed; flash(); }
    let cur = ls.find((l) => l.id === st.goal && !l.done);
    if (!cur) cur = ls.find((l) => !l.done && !l.side) || ls.find((l) => !l.done);
    if (cur) st.goal = cur.id;
    return cur || { hint: '' };
  }
  function flash() {
    const el = G.$('#goal');
    el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash');
    clearTimeout(flashT); flashT = setTimeout(() => el.classList.remove('flash'), 1600);
  }
  function refresh() {
    const el = G.$('#goal');
    if (!el) return;
    const g = goal();
    const show = G.settings.get('goal') && g.hint && G.game && G.game.mode === 'play';
    el.classList.toggle('hidden', !show);
    if (show) el.innerHTML = '<b>▸</b> ' + G.esc(g.hint);
  }
  // 点目标：切到下一条进行中的线
  function cycle() {
    const ls = lines().filter((l) => !l.done);
    if (!ls.length) return;
    const i = ls.findIndex((l) => l.id === G.state.s.goal);
    G.state.s.goal = ls[(i + 1) % ls.length].id;
    G.audio.play('select'); refresh(); flash();
  }

  /* ---------- 小地图 ---------- */
  function openMap() {
    mapOpen = true;
    G.$('#mapview').classList.remove('hidden');
    G.audio.play('select');
    drawMap();
  }
  function closeMap() { mapOpen = false; G.$('#mapview').classList.add('hidden'); }
  function drawMap() {
    let id = G.map.id, px = G.game.player.tx, py = G.game.player.ty;
    const def = G.MAPS[id];
    if (def.indoor) {   // 室内就显示小镇，标在门口
      const b = G.MAPS.town.buildings.find((x) => x.enter && x.enter.to === id);
      id = 'town'; if (b) { px = b.x + b.door; py = b.y + b.h; }
    }
    const M = G.MAPS[id], ground = G.map.groundOf(id);
    const cv = G.$('#map-canvas'), sc = Math.min(640 / ground.width, 360 / ground.height);
    cv.width = Math.round(ground.width * sc); cv.height = Math.round(ground.height * sc);
    const c = cv.getContext('2d');
    c.imageSmoothingEnabled = false;
    c.fillStyle = '#3d6f9a'; c.fillRect(0, 0, cv.width, cv.height);
    c.drawImage(ground, 0, 0, cv.width, cv.height);
    c.fillStyle = 'rgba(30,22,16,.18)'; c.fillRect(0, 0, cv.width, cv.height);
    const k = sc * G.TILE;
    // 区域名
    c.font = 'bold 12px ' + getComputedStyle(document.body).fontFamily; c.textAlign = 'center';
    (M.areas || []).forEach((a) => {
      const x = (a.x + a.w / 2) * k, y = (a.y + a.h / 2) * k;
      c.lineWidth = 3; c.strokeStyle = 'rgba(30,22,16,.85)'; c.strokeText(a.name, x, y); c.fillStyle = '#f6ecd9'; c.fillText(a.name, x, y);
    });
    // 有新话的人
    const cur = G.map.id;
    let marks = 0;
    for (const nid in S.npcs) {
      const a = (S.npcs[nid].at || []).find((x) => G.state.test(x.if));
      if (!a || (a.map || 'town') !== id) continue;
      G.map.use(a.map || 'town');
      const isNew = G.game.hasNew(nid);
      G.map.use(cur);
      const x = (a.x + 0.5) * k, y = (a.y + 0.5) * k;
      c.fillStyle = isNew ? '#f2c14e' : 'rgba(246,236,217,.7)';
      c.beginPath(); c.arc(x, y, isNew ? 5 : 3, 0, Math.PI * 2); c.fill();
      if (isNew) { marks++; c.fillStyle = '#2b2118'; c.font = 'bold 9px sans-serif'; c.fillText('!', x, y + 3); }
    }
    // 阿福
    c.fillStyle = '#c0392b'; c.strokeStyle = '#fff'; c.lineWidth = 2;
    c.beginPath(); c.arc((px + 0.5) * k, (py + 0.5) * k, 6, 0, Math.PI * 2); c.fill(); c.stroke();
    const st = G.state.s;
    G.$('#map-legend').innerHTML = `<span class="dot me"></span>阿福　<span class="dot new"></span>有话要说（${marks}）　<span class="dot"></span>镇上的人　· 邮票 ${st.counters.stamps || 0}/${G.STAMPS.length}　· M 或 Esc 关闭`;
    G.$('#map-title').textContent = M.name;
  }

  /* ---------- 设置 ---------- */
  const OPTS = [
    { k: 'text', name: '文字速度', vals: [['slow', '慢'], ['normal', '中'], ['fast', '快'], ['instant', '瞬间']] },
    { k: 'autoRun', name: '默认跑步（按住 Shift 切换）', vals: [[false, '关'], [true, '开']] },
    { k: 'goal', name: '显示当前目标', vals: [[true, '开'], [false, '关']] },
    { k: 'newMarks', name: '有新话的人头顶显示“！”', vals: [[true, '开'], [false, '关']] },
    { k: 'weather', name: '天气效果（黄昏起雾）', vals: [[true, '开'], [false, '关']] },
  ];
  let setSel = 0;
  function openSettings() { setOpen = true; setSel = 0; G.$('#settings').classList.remove('hidden'); G.audio.play('select'); renderSettings(); }
  function closeSettings() { setOpen = false; G.$('#settings').classList.add('hidden'); refresh(); }
  function renderSettings() {
    const body = G.$('#set-body');
    body.innerHTML = OPTS.map((o, i) => `<div class="opt${i === setSel ? ' sel' : ''}" data-i="${i}"><span>${G.esc(o.name)}</span><span class="vals">${o.vals.map(([v, l]) => `<button data-k="${o.k}" data-v="${JSON.stringify(v).replace(/"/g, '&quot;')}" class="${G.settings.get(o.k) === v ? 'on' : ''}">${l}</button>`).join('')}</span></div>`).join('') +
      '<p class="keys">方向键 / WASD 移动 · Shift 跑步 · 空格 互动 · X 汪 · Q 邮包 · M 地图 · P 声音 · F 全屏 · Esc 设置</p>';
    body.querySelectorAll('button[data-k]').forEach((b) => b.addEventListener('click', () => { G.settings.set(b.dataset.k, JSON.parse(b.dataset.v)); G.audio.play('select'); renderSettings(); }));
  }
  function stepSetting(d) {
    const o = OPTS[setSel], i = o.vals.findIndex(([v]) => v === G.settings.get(o.k));
    G.settings.set(o.k, o.vals[(i + d + o.vals.length) % o.vals.length][0]); G.audio.play('select'); renderSettings();
  }

  function bind() {
    G.$('#goal').addEventListener('click', cycle);
    G.$('#btn-map').addEventListener('click', () => (mapOpen ? closeMap() : G.game.canAct() && openMap()));
    G.$('#btn-set').addEventListener('click', () => (setOpen ? closeSettings() : G.game.canAct() && openSettings()));
    G.$('#map-close').addEventListener('click', closeMap);
    G.$('#set-close').addEventListener('click', closeSettings);
    G.input.on((a) => {
      if (mapOpen) { if (a === 'map' || a === 'back' || a === 'act') closeMap(); return true; }
      if (setOpen) {
        if (a === 'back' || a === 'settings') closeSettings();
        else if (a === 'dir:up') { setSel = (setSel + OPTS.length - 1) % OPTS.length; renderSettings(); }
        else if (a === 'dir:down') { setSel = (setSel + 1) % OPTS.length; renderSettings(); }
        else if (a === 'dir:left') stepSetting(-1);
        else if (a === 'dir:right' || a === 'act') stepSetting(1);
        return true;
      }
      return false;
    }, 40);
    // 包一层 ui.refresh：每次界面刷新都顺便更新目标
    const orig = G.ui.refresh;
    G.ui.refresh = function () { orig.apply(this, arguments); refresh(); };
    setInterval(refresh, 1500);
  }

  return { bind, refresh, openMap, closeMap, openSettings, closeSettings, get open() { return mapOpen || setOpen; }, lines };
})();
