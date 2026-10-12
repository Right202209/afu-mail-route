/* 主循环：移动、碰撞、互动、镜头、昼夜、标题与结局 */
G.game = (function () {
  const T = G.TILE, S = G.STORY, W = G.MAPS.town;
  const cv = G.$('#screen');
  let ctx = cv.getContext('2d'), scale = 1;
  const player = { tx: W.spawn.x, ty: W.spawn.y, x: 0, y: 0, dir: W.spawn.dir, moving: false, fx: 0, fy: 0, anim: 0, frame: 0 };
  let mode = 'title';            // title | play | ending
  let time = 0, last = 0, area = '', titleSel = 1, tint = 0, bellT = -10, talkingTo = null, bumpCD = 0, fade = 0, warping = false;
  const bubbles = [], dust = [];
  const DIRV = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  const OPP = { up: 'down', down: 'up', left: 'right', right: 'left' };

  /* ---------- 世界查询 ---------- */
  function npcPos(id) {
    const n = S.npcs[id];
    const a = (n.at || []).find((x) => G.state.test(x.if));
    return a && (a.map || 'town') === G.map.id ? a : null;
  }
  function npcAt(x, y) {
    for (const id in S.npcs) { const p = npcPos(id); if (p && p.x === x && p.y === y) return id; }
    return null;
  }
  function propsVisible() { return G.map.def.props.filter((p) => G.state.test(p.if)); }
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
      if (d.x === f.x && d.y === f.y) return { type: 'door', id: b, b: bd };
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
      if (t.b.enter && G.state.test(t.b.lock)) { enter(t.b); return; }
      const lockNode = 'door_' + t.id + '_locked';
      G.dialogue.start(t.b.enter && S.nodes[lockNode] ? lockNode : S.nodes['door_' + t.id] ? 'door_' + t.id : 'door_default');
    }
  }

  function bark() {
    G.audio.play('bark');
    G.state.s.counters.barks = (G.state.s.counters.barks || 0) + 1; G.extras.checkAch();
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

  // 这个人有没有还没听过的话
  function leadNode(id) {
    let g = 0;
    while (id && g++ < 30) {
      const n = S.nodes[id];
      if (!n) return null;
      if ((n.text && n.text.length) || n.choices) return id;
      id = typeof n.go === 'string' ? n.go : ((n.go || []).find((x) => G.state.test(x.if)) || {}).go;
    }
    return null;
  }
  function hasNew(id) {
    const n = S.npcs[id];
    const t = (n.talk || []).find((x) => G.state.test(x.if));
    if (!t) return false;
    const lead = leadNode(t.go);
    return !!lead && !(G.state.s.seen || {})[lead];
  }

  function canAct() { return mode === 'play' && !warping && !G.extras.open && !G.dialogue.active && !G.ui.sceneOpen && !G.ui.bagOpen(); }

  /* ---------- 切换地图（进门、出门、走出地图边缘） ---------- */
  async function warpTo(to, x, y, dir) {
    warping = true;
    G.audio.play('step');
    for (let i = 0; i <= 8; i++) { fade = i / 8; await G.wait(18); }
    G.map.use(to);
    placePlayer(x, y, dir);
    area = '';
    onArrive(true);
    for (let i = 8; i >= 0; i--) { fade = i / 8; await G.wait(18); }
    warping = false;
    G.state.save(player);
  }
  function enter(b) { warpTo(b.enter.to, b.enter.x, b.enter.y, b.enter.dir); }
  function tryDoor(x, y) {
    const id = G.map.building(x, y);
    if (!id) return false;
    const b = G.map.buildingById(id), d = G.map.doorOf(b);
    if (!b.enter || d.x !== x || d.y !== y || player.dir !== 'up') return false;
    if (G.state.test(b.lock)) { enter(b); return true; }
    return false;
  }

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
        } else if (!tryDoor(nx, ny) && bumpCD <= 0) { bumpCD = 0.35; }
      }
    }
    if (player.moving) {
      const running = G.input.run !== G.settings.get('autoRun');
      player.anim += dt * (running ? 10.5 : 6.2);
      if (running && player.anim > 0.5 && !player.dusted) { player.dusted = true; if (!G.map.def.indoor) dust.push({ x: player.x + 8, y: player.y + 14, t: 0 }); }
      if (player.anim >= 1) {
        player.anim = 1; player.moving = false; player.dusted = false;
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
    for (let i = dust.length - 1; i >= 0; i--) { dust[i].t += dt; if (dust[i].t > 0.4) dust.splice(i, 1); }
  }

  function onArrive(fromWarp) {
    const a = G.map.areaAt(player.tx, player.ty);
    if (a !== area) { area = a; G.$('#hud-area').textContent = a; if (mode === 'play') G.ui.banner(a); }
    if (!fromWarp) { const w = G.map.warpAt(player.tx, player.ty); if (w) { warpTo(w.to, w.tx, w.ty, w.dir); return; } }
    const p = propAt(player.tx, player.ty);
    if (p && p.stamp) { pickStamp(p.stamp); return; }
    if (p && p.talk && /^pick_/.test(p.talk) && !p.solid) G.dialogue.start(p.talk);
  }
  function pickStamp(id) {
    const st = G.STAMPS.find((x) => x.id === id);
    G.state.apply('f:st_' + id + ';c:stamps+1');
    G.audio.play('item');
    const n = G.state.s.counters.stamps;
    G.ui.toast('得到邮票「' + st.name + '」（' + n + '/' + G.STAMPS.length + '）' + (n === G.STAMPS.length ? ' · 集齐了！' : ''), 3000);
    G.ui.refresh();
    G.state.save(player);
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
    if (mode === 'title') { cx = 30 * T + Math.sin(time * 0.08) * 200; cy = 20 * T + Math.cos(time * 0.06) * 40; }
    else { cx = player.x + 8; cy = player.y + 8; }
    const mw = G.map.w * T, mh = G.map.h * T;
    const fit = (c, m, v) => (m <= v ? Math.round((m - v) / 2) : Math.round(G.clamp(c - v / 2, 0, m - v)));
    return { x: fit(cx, mw, vw), y: fit(cy, mh, vh) };
  }

  function draw() {
    const cam = camera();
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#0d0e16'; ctx.fillRect(0, 0, G.VIEW_W, G.VIEW_H);
    ctx.save();
    ctx.translate(-cam.x, -cam.y);
    ctx.drawImage(G.map.ground, 0, 0);
    const x0 = Math.floor(cam.x / T), y0 = Math.floor(cam.y / T), x1 = x0 + Math.ceil(G.VIEW_W / T) + 1, y1 = y0 + Math.ceil(G.VIEW_H / T) + 1;
    const wf = Math.floor(time * 2.2) % 3;
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (G.map.get(x, y) === 'w') G.tiles.water(ctx, x, y, wf, G.map.at);

    const night = G.state.s.counters.delivered >= 4 || G.state.s.flags.final_read;
    // 角色与道具按 y 排序
    const list = [];
    const pctx = { time, night, fixed: G.state.s.flags.clock_fixed, warm: G.state.s.flags.lin_warm, light: G.state.s.flags.light_on };
    propsVisible().forEach((p) => { if (p.x >= x0 - 2 && p.x <= x1 + 2 && p.y >= y0 - 2 && p.y <= y1 + 2) list.push({ y: p.y * T + (p.solid ? 0 : -8), draw: () => G.tiles.prop(ctx, p.kind, p.x, p.y, pctx) }); });
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
    const inTown = G.map.id === 'town';
    if (inTown) {
      if (st.flags.clock_fixed) { const h = st.flags.final_read ? 17.6 : 9 + st.counters.delivered * 1.6 + (time % 600) / 600 * 0.3; G.tiles.clockHands(ctx, tower, Math.floor(h), Math.floor((h % 1) * 60)); }
      else G.tiles.clockHands(ctx, tower, 4, 10);
    }
    // 钟声波纹
    const bt = time - bellT;
    if (bt < 3 && inTown) {
      const cx = (tower.x + 1.5) * T, cy = tower.y * T + 32;
      for (let i = 0; i < 3; i++) { const r = ((bt * 60) + i * 30) % 90; ctx.strokeStyle = `rgba(255,236,160,${Math.max(0, 0.6 - r / 150)})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke(); }
    }
    // 跑步扬起的尘土
    dust.forEach((d) => { const a = 1 - d.t / 0.4; ctx.fillStyle = `rgba(220,200,160,${a * 0.7})`; const r = 1 + d.t * 6; ctx.fillRect(Math.round(d.x - r), Math.round(d.y - d.t * 4), Math.round(r), Math.round(r)); ctx.fillRect(Math.round(d.x + 2), Math.round(d.y - d.t * 6), Math.round(r * 0.7), Math.round(r * 0.7)); });
    // 有新话要说的人头上冒“！”
    if (mode === 'play' && G.settings.get('newMarks')) for (const id in S.npcs) {
      if (talkingTo === id || !hasNew(id)) continue;
      const p = npcPos(id); if (!p) continue;
      const by = Math.round(Math.sin(time * 4 + p.x) * 1.5);
      const bx = p.x * T + 5, byy = p.y * T - 13 + by;
      ctx.fillStyle = '#2b2118'; ctx.fillRect(bx - 1, byy - 1, 8, 10);
      ctx.fillStyle = '#f6ecd9'; ctx.fillRect(bx, byy, 6, 8);
      ctx.fillStyle = '#c0603a'; ctx.fillRect(bx + 2, byy + 1, 2, 4); ctx.fillRect(bx + 2, byy + 6, 2, 1);
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
      if (t) G.$('#prompt').textContent = t.type === 'npc' ? '空格 · 对话' : t.type === 'door' && t.b.enter && G.state.test(t.b.lock) ? '空格 · 进门' : '空格 · 查看';
    } else G.$('#prompt').classList.add('hidden');
    ctx.restore();

    // 昼夜色调（室内减半）
    const c = tintColor(tint);
    if (G.map.def.indoor) c[3] *= 0.4;
    if (c[3] > 0.005) {
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},1)`;
      ctx.globalAlpha = Math.min(1, c[3] * 2.4);
      ctx.fillRect(0, 0, G.VIEW_W, G.VIEW_H);
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    }
    if (bt < 0.25) { ctx.fillStyle = `rgba(255,240,200,${0.25 - bt})`; ctx.fillRect(0, 0, G.VIEW_W, G.VIEW_H); }
    // 灯塔的光束（入夜且点亮后）
    if (inTown && st.flags.light_on && tint > 2.5) {
      const lh = G.map.buildingById('lighthouse');
      const lx = (lh.x + 1.5) * T - cam.x, ly = lh.y * T + 11 - cam.y;
      const a = time * 0.9;
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (const off of [0, Math.PI]) {
        const g = ctx.createRadialGradient(lx, ly, 2, lx, ly, 220);
        g.addColorStop(0, 'rgba(255,240,170,.45)'); g.addColorStop(1, 'rgba(255,240,170,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(lx, ly); ctx.arc(lx, ly, 220, a + off - 0.18, a + off + 0.18); ctx.closePath(); ctx.fill();
      }
      ctx.fillStyle = 'rgba(255,240,170,.8)'; ctx.fillRect(lx - 3, ly - 3, 6, 6);
      ctx.restore();
    }
    // 入夜：窗户亮灯、萤火虫
    if (!G.map.def.indoor && tint > 3.6) {
      const night = G.clamp((tint - 3.6) / 1.8, 0, 1);
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      if (inTown) G.map.def.buildings.forEach((b) => {
        if (b.special) return;
        const d = G.map.doorOf(b), gx = d.x * T + 8 - cam.x, gy = d.y * T + 4 - cam.y;
        if (gx < -60 || gy < -60 || gx > G.VIEW_W + 60 || gy > G.VIEW_H + 60) return;
        const fl = 0.85 + Math.sin(time * 3 + b.x) * 0.08;
        const g = ctx.createRadialGradient(gx, gy, 2, gx, gy, 34);
        g.addColorStop(0, `rgba(255,200,110,${0.42 * night * fl})`); g.addColorStop(1, 'rgba(255,200,110,0)');
        ctx.fillStyle = g; ctx.fillRect(gx - 34, gy - 34, 68, 68);
      });
      const zone = G.map.id === 'woods' ? { x: 0, y: 0, w: G.map.def.w, h: G.map.def.h } : (G.map.def.areas || []).find((a) => a.name === '花坡');
      if (zone) for (let i = 0; i < 26; i++) {
        const fx = (zone.x + ((i * 37.7) % zone.w)) * T + Math.sin(time * 0.7 + i) * 18 - cam.x;
        const fy = (zone.y + ((i * 23.3) % zone.h)) * T + Math.cos(time * 0.5 + i * 1.7) * 12 - cam.y;
        const a = Math.max(0, Math.sin(time * 2.2 + i * 2.1)) * night;
        if (a < 0.05 || fx < 0 || fy < 0 || fx > G.VIEW_W || fy > G.VIEW_H) continue;
        ctx.fillStyle = `rgba(220,255,140,${a})`; ctx.fillRect(Math.round(fx), Math.round(fy), 1, 1);
        ctx.fillStyle = `rgba(220,255,140,${a * 0.25})`; ctx.fillRect(Math.round(fx) - 1, Math.round(fy) - 1, 3, 3);
      }
      ctx.restore();
    }
    // 黄昏起雾（灯塔点亮后雾会淡很多）
    if (inTown && G.settings.get('weather')) {
      let fog = G.clamp((st.counters.delivered - 2) / 2, 0, 1) * (st.flags.light_on ? 0.35 : 1) * (st.flags.final_read ? 0.4 : 1);
      if (fog > 0.01) {
        ctx.fillStyle = `rgba(214,220,232,${0.1 * fog})`; ctx.fillRect(0, 0, G.VIEW_W, G.VIEW_H);
        for (let i = 0; i < 7; i++) {
          const fx = ((i * 97 + time * (5 + i)) % (G.VIEW_W + 200)) - 100 - (cam.x * 0.15) % 40, fy = 16 + (i * 53) % 160;
          const g = ctx.createRadialGradient(fx, fy, 4, fx, fy, 70);
          g.addColorStop(0, `rgba(230,234,242,${0.22 * fog})`); g.addColorStop(1, 'rgba(230,234,242,0)');
          ctx.fillStyle = g; ctx.fillRect(fx - 70, fy - 70, 140, 140);
        }
      }
    }
    if (fade > 0) { ctx.fillStyle = `rgba(13,14,22,${fade})`; ctx.fillRect(0, 0, G.VIEW_W, G.VIEW_H); }
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
    G.map.use('town');
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
    G.map.use(p.map && G.MAPS[p.map] ? p.map : 'town');
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
    G.state.s.flags.ending = true; G.extras.checkAch();
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
    if (a === 'map') { G.extras.openMap(); return true; }
    if (a === 'back' || a === 'settings') { G.extras.openSettings(); return true; }
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
    G.extras.bind();
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

  return { player, canAct, ending, bell, openFinalLetter, get mode() { return mode; }, hasNew, npcPos, _debug: { blocked, npcPos, placePlayer, act, warpTo, pickStamp } };
})();
