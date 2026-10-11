/* 主循环：移动、碰撞、互动、镜头、昼夜、标题与结局 */
G.game = (function () {
  const T = G.TILE, S = G.STORY, W = G.WORLD;
  const cv = G.$('#screen');
  let ctx = cv.getContext('2d'), scale = 1;
  const player = { tx: W.spawn.x, ty: W.spawn.y, x: 0, y: 0, dir: W.spawn.dir, moving: false, fx: 0, fy: 0, anim: 0, frame: 0 };
  let mode = 'title';            // title | play | ending
  let time = 0, last = 0, area = '', titleSel = 1, tint = 0, bellT = -10, talkingTo = null, bumpCD = 0;
  const bubbles = [];
  const DIRV = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  const OPP = { up: 'down', down: 'up', left: 'right', right: 'left' };

  /* ---------- 世界查询 ---------- */
  function npcPos(id) {
    const n = S.npcs[id];
    return (n.at || []).find((a) => G.state.test(a.if)) || null;
  }
  function npcAt(x, y) {
    for (const id in S.npcs) { const p = npcPos(id); if (p && p.x === x && p.y === y) return id; }
    return null;
  }
  function propsVisible() { return W.props.filter((p) => G.state.test(p.if)); }
  function propAt(x, y) { return propsVisible().find((p) => p.x === x && p.y === y); }
  function blocked(x, y) {
    if (!G.map.walkable(x, y)) return true;
    if (npcAt(x, y)) return true;
    const p = propAt(x, y);
    return !!(p && p.solid);
  }
  function facing() { const [dx, dy] = DIRV[player.dir]; return { x: player.tx + dx, y: player.ty + dy }; }

  function interactTarget() {
    const f = facing();
    const n = npcAt(f.x, f.y);
    if (n) return { type: 'npc', id: n };
    const p = propAt(f.x, f.y) || propAt(player.tx, player.ty);
    if (p && p.talk) return { type: 'prop', p };
    const b = G.map.building(f.x, f.y);
    if (b) {
      const bd = G.map.buildingById(b), d = G.map.doorOf(bd);
      if (d.x === f.x && d.y === f.y) return { type: 'door', id: b };
    }
    return null;
  }

  function act() {
    const t = interactTarget();
    if (!t) return;
    if (t.type === 'npc') {
      const n = S.npcs[t.id];
      const entry = (n.talk || []).find((e) => G.state.test(e.if));
      if (!entry) return;
      talkingTo = t.id;
      G.dialogue.start(entry.go, () => { talkingTo = null; });
    } else if (t.type === 'prop') {
      G.dialogue.start(t.p.talk);
    } else if (t.type === 'door') {
      G.dialogue.start(S.nodes['door_' + t.id] ? 'door_' + t.id : 'door_default');
    }
  }

  function bark() {
    G.audio.play('bark');
    bubbles.push({ text: '汪！', x: player.x + 8, y: player.y - 4, t: 0, life: 0.9 });
    for (const id in S.npcs) {
      const p = npcPos(id);
      if (!p) continue;
      const d = Math.abs(p.x - player.tx) + Math.abs(p.y - player.ty);
      if (d <= 3) bubbles.push({ text: id === 'cat' ? '喵？' : id === 'jie' ? '汪！' : '♪', x: p.x * T + 8, y: p.y * T - 4, t: -0.25, life: 0.9 });
    }
    const f = facing(), pr = propAt(f.x, f.y);
    if (pr && pr.kind === 'well') setTimeout(() => G.ui.toast('……汪……汪……'), 500);
  }

  function canAct() { return mode === 'play' && !G.dialogue.active && !G.ui.sceneOpen && !G.ui.bagOpen(); }

  /* ---------- 更新 ---------- */
  function update(dt) {
    time += dt;
    if (mode === 'play') G.state.s.played += dt;
    bumpCD -= dt;
    if (mode === 'play' && canAct()) {
      const d = G.input.dir;
      if (!player.moving && d) {
        player.dir = d;
        const [dx, dy] = DIRV[d];
        const nx = player.tx + dx, ny = player.ty + dy;
        if (!blocked(nx, ny)) {
          player.moving = true; player.fx = player.tx; player.fy = player.ty; player.tx = nx; player.ty = ny; player.anim = 0;
        } else if (bumpCD <= 0) { bumpCD = 0.35; }
      }
    }
    if (player.moving) {
      player.anim += dt * 6.2;
      if (player.anim >= 1) {
        player.anim = 1; player.moving = false;
        if (Math.random() < 0.5) G.audio.play('step');
        onArrive();
      }
    }
    const k = player.moving ? player.anim : 1;
    const ox = player.moving ? player.fx : player.tx, oy = player.moving ? player.fy : player.ty;
    player.x = G.lerp(ox, player.tx, k) * T; player.y = G.lerp(oy, player.ty, k) * T;
    player.frame = player.moving ? (Math.floor((player.tx + player.ty) % 2)) : 0;
    // 对话时 NPC 转向阿福
    // 昼夜
    const target = dayTint();
    tint = G.lerp(tint, target, Math.min(1, dt * 0.8));
    for (let i = bubbles.length - 1; i >= 0; i--) { bubbles[i].t += dt; if (bubbles[i].t > bubbles[i].life) bubbles.splice(i, 1); }
  }

  function onArrive() {
    const a = G.map.areaAt(player.tx, player.ty);
    if (a !== area) { area = a; G.$('#hud-area').textContent = a; if (mode === 'play') G.ui.banner(a); }
    const p = propAt(player.tx, player.ty);
    if (p && p.talk && /^pick_/.test(p.talk) && !p.solid) G.dialogue.start(p.talk);
  }

  function dayTint() {
    const st = G.state.s;
    if (st.flags.final_read) return 6;
    return Math.min(5, st.counters.delivered);
  }
  const TINTS = [[255, 255, 255, 0], [255, 244, 214, 0.05], [255, 222, 170, 0.09], [255, 190, 130, 0.14], [245, 150, 110, 0.2], [200, 110, 120, 0.27], [110, 70, 130, 0.36]];
  function tintColor(v) {
    const i = Math.floor(v), f = v - i, a = TINTS[i], b = TINTS[Math.min(TINTS.length - 1, i + 1)];
    return a.map((x, j) => G.lerp(x, b[j], f));
  }

  /* ---------- 绘制 ---------- */
  function camera() {
    const vw = G.VIEW_W, vh = G.VIEW_H;
    let cx, cy;
    if (mode === 'title') { cx = 22 * T + Math.sin(time * 0.08) * 120; cy = 20 * T + Math.cos(time * 0.06) * 40; }
    else { cx = player.x + 8; cy = player.y + 8; }
    return { x: Math.round(G.clamp(cx - vw / 2, 0, G.map.w * T - vw)), y: Math.round(G.clamp(cy - vh / 2, 0, G.map.h * T - vh)) };
  }

  function draw() {
    const cam = camera();
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#0d0e16'; ctx.fillRect(0, 0, G.VIEW_W, G.VIEW_H);
    ctx.drawImage(G.map.ground, cam.x, cam.y, G.VIEW_W, G.VIEW_H, 0, 0, G.VIEW_W, G.VIEW_H);
    ctx.save();
    ctx.translate(-cam.x, -cam.y);
    const x0 = Math.floor(cam.x / T), y0 = Math.floor(cam.y / T), x1 = x0 + Math.ceil(G.VIEW_W / T) + 1, y1 = y0 + Math.ceil(G.VIEW_H / T) + 1;
    const wf = Math.floor(time * 2.2) % 3;
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (G.map.get(x, y) === 'w') G.tiles.water(ctx, x, y, wf, G.map.at);

    const night = G.state.s.counters.delivered >= 4 || G.state.s.flags.final_read;
    // 角色与道具按 y 排序
    const list = [];
    propsVisible().forEach((p) => { if (p.x >= x0 - 2 && p.x <= x1 + 2 && p.y >= y0 - 2 && p.y <= y1 + 2) list.push({ y: p.y * T + (p.solid ? 0 : -8), draw: () => G.tiles.prop(ctx, p.kind, p.x, p.y, { time, night }) }); });
    for (const id in S.npcs) {
      const p = npcPos(id);
      if (!p) continue;
      const n = S.npcs[id];
      const spr = G.sprites.get(n.sprite || id, n.look);
      let dir = p.dir || 'down';
      if (talkingTo === id) { const dx = player.tx - p.x, dy = player.ty - p.y; dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'); }
      const fr = (Math.floor(time * 1.3 + p.x) % 4 === 0) ? 1 : 0;
      list.push({ y: p.y * T, draw: () => { shadow(p.x * T, p.y * T); ctx.drawImage(spr[dir][id === 'cat' ? fr : 0], p.x * T, p.y * T - (fr && id !== 'cat' ? 1 : 0)); } });
    }
    const dog = G.sprites.get('dog');
    list.push({ y: player.y + 0.5, draw: () => { shadow(Math.round(player.x), Math.round(player.y)); ctx.drawImage(dog[player.dir][player.moving ? (player.anim < 0.5 ? 1 : 0) : 0], Math.round(player.x), Math.round(player.y) - (player.moving && player.anim < 0.5 ? 1 : 0)); } });
    list.sort((a, b) => a.y - b.y).forEach((o) => o.draw());

    // 树冠
    G.map.trees.forEach(([x, y]) => { if (x >= x0 - 1 && x <= x1 + 1 && y >= y0 - 1 && y <= y1 + 1) G.tiles.canopy(ctx, x, y); });
    // 钟楼指针
    const tower = G.map.buildingById('tower');
    const st = G.state.s;
    if (st.flags.clock_fixed) { const h = st.flags.final_read ? 17.6 : 9 + st.counters.delivered * 1.6 + (time % 600) / 600 * 0.3; G.tiles.clockHands(ctx, tower, Math.floor(h), Math.floor((h % 1) * 60)); }
    else G.tiles.clockHands(ctx, tower, 4, 10);
    // 钟声波纹
    const bt = time - bellT;
    if (bt < 3) {
      const cx = (tower.x + 1.5) * T, cy = tower.y * T + 32;
      for (let i = 0; i < 3; i++) { const r = ((bt * 60) + i * 30) % 90; ctx.strokeStyle = `rgba(255,236,160,${Math.max(0, 0.6 - r / 150)})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke(); }
    }
    // 气泡
    ctx.font = '7px ' + getComputedStyle(document.body).fontFamily;
    ctx.textAlign = 'center';
    bubbles.forEach((b) => {
      if (b.t < 0) return;
      const yy = b.y - b.t * 10;
      const w = ctx.measureText(b.text).width + 6;
      ctx.fillStyle = 'rgba(246,236,217,.95)'; ctx.fillRect(Math.round(b.x - w / 2), Math.round(yy - 8), Math.round(w), 10);
      ctx.fillStyle = '#2b2118'; ctx.fillText(b.text, Math.round(b.x), Math.round(yy));
    });
    // 互动提示箭头
    if (mode === 'play' && canAct()) {
      const t = interactTarget();
      if (t) { const f = t.type === 'prop' && propAt(player.tx, player.ty) === t.p ? { x: player.tx, y: player.ty } : facing(); const by = Math.sin(time * 6) > 0 ? 0 : 1; ctx.fillStyle = '#f2c14e'; ctx.fillRect(f.x * T + 6, f.y * T - 9 + by, 4, 2); ctx.fillRect(f.x * T + 7, f.y * T - 7 + by, 2, 2); }
      G.$('#prompt').classList.toggle('hidden', !t);
      if (t) G.$('#prompt').textContent = t.type === 'npc' ? '空格 · 对话' : '空格 · 查看';
    } else G.$('#prompt').classList.add('hidden');
    ctx.restore();

    // 昼夜色调
    const c = tintColor(tint);
    if (c[3] > 0.005) {
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},1)`;
      ctx.globalAlpha = Math.min(1, c[3] * 2.4);
      ctx.fillRect(0, 0, G.VIEW_W, G.VIEW_H);
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    }
    if (bt < 0.25) { ctx.fillStyle = `rgba(255,240,200,${0.25 - bt})`; ctx.fillRect(0, 0, G.VIEW_W, G.VIEW_H); }
  }
  function shadow(x, y) { ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.fillRect(x + 3, y + 13, 10, 2); }

  function loop(ts) {
    const dt = Math.min(0.05, (ts - last) / 1000 || 0);
    last = ts;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  /* ---------- 尺寸 ---------- */
  function resize() {
    const stage = G.$('#stage');
    const w = stage.clientWidth;
    stage.style.fontSize = (w / 320 * 6.4) + 'px';
    const dpr = window.devicePixelRatio || 1;
    scale = Math.max(1, Math.round(w * dpr / G.VIEW_W));
    cv.width = G.VIEW_W * scale; cv.height = G.VIEW_H * scale;
    ctx = cv.getContext('2d');
  }

  /* ---------- 标题 / 开始 ---------- */
  function placePlayer(x, y, dir) { player.tx = x; player.ty = y; player.dir = dir || 'down'; player.moving = false; player.x = x * T; player.y = y * T; }

  function showTitle() {
    mode = 'title';
    const hasSave = G.state.hasSave();
    G.$('#btn-continue').classList.toggle('hidden', !hasSave);
    titleSel = hasSave ? 0 : 1;
    markTitle();
    const m = G.state.meta();
    G.$('#title-endings').textContent = m.endings.length ? '已解锁结局 ' + m.endings.length + '/' + S.endings.length + '：' + S.endings.map((e) => (m.endings.includes(e.id) ? e.title : '？？')).join(' · ') : '';
  }
  function markTitle() { G.$('#btn-continue').classList.toggle('sel', titleSel === 0); G.$('#btn-new').classList.toggle('sel', titleSel === 1); }

  async function newGame() {
    G.state.reset();
    G.$('#title').classList.add('hidden');
    placePlayer(W.spawn.x, W.spawn.y, W.spawn.dir);
    G.audio.startMusic();
    mode = 'play';
    G.$('#hud').classList.remove('hidden');
    G.ui.refresh();
    await G.ui.scene(S.scenes.intro);
    area = G.map.areaAt(player.tx, player.ty); G.$('#hud-area').textContent = area; G.ui.banner(area);
    player.dir = 'left';
    talkingTo = 'xiaowu';
    G.dialogue.start('wu_intro', () => { talkingTo = null; });
  }
  function continueGame() {
    G.state.load();
    const p = G.state.s.player || W.spawn;
    placePlayer(p.x, p.y, p.dir);
    G.$('#title').classList.add('hidden');
    G.audio.startMusic();
    mode = 'play';
    G.$('#hud').classList.remove('hidden');
    G.ui.refresh();
    area = G.map.areaAt(player.tx, player.ty); G.$('#hud-area').textContent = area; G.ui.banner(area);
  }

  async function openFinalLetter() {
    await G.ui.scene(S.scenes.letter_afu);
    if (!G.state.s.flags.final_read) {
      G.state.apply('f:final_read');
      G.state.save(player);
      G.ui.refresh();
      G.ui.toast('去花坡最东边的白房子。他在等你。', 4200);
    }
  }

  function ending() {
    mode = 'ending';
    G.$('#hud').classList.add('hidden');
    const e = S.endings.find((x) => G.state.test(x.if));
    G.state.recordEnding(e.id);
    G.audio.play('memory');
    setTimeout(() => {
      G.ui.ending(e);
      G.state.reset();
    }, 900);
  }

  function bell() { bellT = time; }

  /* ---------- 输入 ---------- */
  G.input.on((a) => {
    if (mode === 'title') {
      if (a === 'dir:left' || a === 'dir:right' || a === 'dir:up' || a === 'dir:down') { if (G.state.hasSave()) { titleSel = 1 - titleSel; markTitle(); G.audio.play('select'); } }
      if (a === 'act') { G.audio.play('confirm'); titleSel === 0 ? continueGame() : newGame(); }
      return true;
    }
    if (mode === 'ending') {
      if (a === 'act') G.ui.fastRoll();
      return true;
    }
    return false;
  }, 25);
  G.input.on((a) => {
    if (a === 'sound') { const on = G.audio.toggle(); G.$('#btn-sound').textContent = on ? '♪' : '✕'; return true; }
    if (a === 'full') { const st = G.$('#stage'); if (document.fullscreenElement) document.exitFullscreen(); else if (st.requestFullscreen) st.requestFullscreen(); return true; }
    if (!canAct()) return false;
    if (a === 'act') { act(); return true; }
    if (a === 'bark') { bark(); return true; }
    if (a === 'bag') { G.ui.openBag(); return true; }
    return false;
  }, 0);

  /* ---------- 启动 ---------- */
  function boot() {
    G.map.build();
    resize();
    window.addEventListener('resize', resize);
    document.addEventListener('fullscreenchange', () => setTimeout(resize, 50));
    G.input.bindTouch();
    G.ui.bindBag();
    G.$('#btn-new').addEventListener('click', () => { G.audio.play('confirm'); newGame(); });
    G.$('#btn-continue').addEventListener('click', () => { G.audio.play('confirm'); continueGame(); });
    G.$('#btn-sound').addEventListener('click', () => G.input.emit('sound'));
    G.$('#screen').addEventListener('pointerdown', () => G.audio.init());
    placePlayer(W.spawn.x, W.spawn.y, W.spawn.dir);
    showTitle();
    requestAnimationFrame(loop);
    window.addEventListener('beforeunload', () => { if (mode === 'play') G.state.save(player); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();

  return { player, canAct, ending, bell, openFinalLetter, get mode() { return mode; }, _debug: { blocked, npcPos, placePlayer, act } };
})();
