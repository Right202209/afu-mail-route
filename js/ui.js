/* 界面：HUD、提示、过场（信件/记忆）、邮包、结局字幕 */
G.ui = (function () {
  const S = G.STORY;
  let rollFast = false;
  let toastTimer = null, bannerTimer = null, sceneResolve = null, sceneStage = 0, bagTab = 'letters';
  const letterById = (id) => S.letters.find((l) => l.id === id);

  function toast(text, ms) {
    const el = G.$('#toast');
    el.textContent = text; el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), ms || 2600);
  }
  function banner(text) {
    const el = G.$('#banner');
    el.textContent = '— ' + text + ' —'; el.classList.add('show');
    clearTimeout(bannerTimer);
    bannerTimer = setTimeout(() => el.classList.remove('show'), 2200);
  }

  function event(e) {
    const st = G.state.s;
    if (e.type === 'item') { G.audio.play('item'); toast('得到了：' + (S.items[e.id] ? S.items[e.id].name : e.id)); }
    if (e.type === 'deliver') {
      G.audio.play('letter');
      const l = letterById(e.id);
      let msg = '✉ 信已送达（' + st.counters.delivered + '/5）';
      if (st.peeked.includes(e.id)) msg += ' · 信封的封口被撕开过';
      toast(msg, 3200);
      if (st.counters.delivered === 5) setTimeout(() => toast('五封信都送到了。邮包里还剩一封“阿福 收”。', 4200), 3400);
      if (l) refresh();
    }
    if (e.type === 'peek') { const l = letterById(e.id); G.audio.play('bump'); if (l && l.peekToast) setTimeout(() => toast(l.peekToast, 3600), 200); }
    if (e.type === 'toast') toast(e.text);
    if (e.type === 'sfx') G.audio.play(e.id);
    if (e.type === 'bell') { G.audio.play('bell'); G.game.bell(); }
    refresh();
  }

  /* ---------- 过场 ---------- */
  function scene(def, tag) {
    return new Promise((resolve) => {
      if (!def) return resolve();
      const el = G.$('#scene');
      el.className = def.kind || '';
      G.$('#scene-tag').textContent = tag || def.tag || '';
      G.$('#scene-title').textContent = def.title || '';
      const tx = G.$('#scene-text');
      tx.innerHTML = '';
      const delay = def.kind === 'letter' ? 0.18 : 0.7;
      def.lines.forEach((ln, i) => {
        const s = document.createElement('span');
        s.className = 'ln'; s.textContent = ln;
        s.style.animationDelay = (i * delay) + 's';
        tx.appendChild(s);
      });
      tx.scrollTop = 0;
      sceneStage = 0;
      sceneResolve = resolve;
    });
  }
  function sceneAdvance() {
    const lines = G.$('#scene-text').querySelectorAll('.ln');
    if (sceneStage === 0) {
      // 第一次按键：直接显示全部文字
      lines.forEach((l) => { l.style.animation = 'none'; l.style.opacity = 1; });
      sceneStage = 1;
      return;
    }
    G.$('#scene').classList.add('hidden');
    const r = sceneResolve; sceneResolve = null;
    G.audio.play('select');
    r && r();
  }
  G.input.on((a) => {
    if (!sceneResolve) return false;
    if (a === 'act' || a === 'back') sceneAdvance();
    if (a === 'dir:down') G.$('#scene-text').scrollTop += 30;
    if (a === 'dir:up') G.$('#scene-text').scrollTop -= 30;
    return true;
  }, 30);

  async function memory(id) {
    const idx = S.memories.findIndex((m) => m.id === id);
    const m = S.memories[idx];
    if (!m) return;
    G.audio.play('memory');
    await scene({ kind: 'sepia', title: m.title, lines: m.lines }, '记忆碎片 ' + (idx + 1) + ' / ' + S.memories.length);
    toast('✦ 你想起了老周的一段往事（' + G.state.s.mems.length + '/6）');
  }

  /* ---------- 头像 ---------- */
  function drawPortrait(pc, who) {
    const ctx = pc.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, pc.width, pc.height);
    if (!who) return;
    let spr;
    if (who === 'dog') spr = G.sprites.get('dog');
    else { const d = S.npcs[who]; spr = G.sprites.get(d.sprite || who, d.look); }
    ctx.drawImage(spr.down[0], 0, 0, 16, 12, 0, 6, 48, 36);
  }

  /* ---------- HUD ---------- */
  function refresh() {
    const st = G.state.s;
    G.$('#hud-letters').textContent = '✉ ' + st.counters.delivered + '/5';
    G.$('#hud-mem').textContent = '✦ ' + st.mems.length + '/6';
    if (!G.$('#bag').classList.contains('hidden')) renderBag();
  }

  /* ---------- 邮包 ---------- */
  function openBag() { G.$('#bag').classList.remove('hidden'); G.audio.play('select'); renderBag(); }
  function closeBag() { G.$('#bag').classList.add('hidden'); }
  function bagOpen() { return !G.$('#bag').classList.contains('hidden'); }

  function renderBag() {
    const st = G.state.s, body = G.$('#bag-body');
    document.querySelectorAll('.tab[data-tab]').forEach((t) => t.classList.toggle('on', t.dataset.tab === bagTab));
    let h = '';
    if (bagTab === 'letters') {
      S.letters.forEach((l) => {
        const done = st.delivered.includes(l.id);
        const hint = (l.hints.find((x) => G.state.test(x.if)) || {}).text || '';
        let status = done ? '<span class="st done">已送达</span>' : '<span class="st">在邮包里</span>';
        if (st.peeked.includes(l.id)) status += ' <span class="st peek">拆过</span>';
        if (l.special) status = st.flags.final_read ? '<span class="st done">已拆开</span>' : '<span class="st">封着</span>';
        h += `<div class="card"><h3>${G.esc(l.to)} ${status}</h3><p>寄自：${G.esc(l.from)}</p><p>${G.esc(hint)}</p>`;
        if (l.special && st.counters.delivered >= 5) h += `<button data-open="afu">${st.flags.final_read ? '再读一遍' : '拆开'}</button>`;
        else if (done && l.id !== 'afu' && (st.peeked.includes(l.id) || done)) h += `<button data-read="${l.id}">再读一遍</button>`;
        h += '</div>';
      });
    } else if (bagTab === 'items') {
      if (!st.items.length) h = '<div class="empty">邮包里除了信，什么都没有。</div>';
      st.items.forEach((id) => { const it = S.items[id]; if (it) h += `<div class="card"><h3>${G.esc(it.name)}</h3><p>${G.esc(it.desc)}</p></div>`; });
    } else {
      S.memories.forEach((m, i) => {
        const got = st.mems.includes(m.id);
        h += got ? `<div class="card"><h3>${i + 1}. ${G.esc(m.title)}</h3><p>${G.esc(m.lines[0])}……</p><button data-mem="${m.id}">回想</button></div>`
          : `<div class="card locked"><h3>${i + 1}. ？？？</h3><p>还没有想起来。</p></div>`;
      });
    }
    body.innerHTML = h;
    body.querySelectorAll('[data-open]').forEach((b) => b.addEventListener('click', () => { closeBag(); G.game.openFinalLetter(); }));
    body.querySelectorAll('[data-read]').forEach((b) => b.addEventListener('click', () => { closeBag(); scene(S.scenes['letter_' + b.dataset.read]); }));
    body.querySelectorAll('[data-mem]').forEach((b) => b.addEventListener('click', () => {
      const m = S.memories.find((x) => x.id === b.dataset.mem); closeBag();
      scene({ kind: 'sepia', title: m.title, lines: m.lines }, '记忆碎片');
    }));
  }
  function bindBag() {
    document.querySelectorAll('.tab[data-tab]').forEach((t) => t.addEventListener('click', () => { bagTab = t.dataset.tab; G.audio.play('select'); renderBag(); }));
    G.$('#bag-close').addEventListener('click', closeBag);
    G.$('#btn-bag').addEventListener('click', () => (bagOpen() ? closeBag() : (G.game.canAct() && openBag())));
    G.input.on((a) => {
      if (!bagOpen()) return false;
      if (a === 'bag' || a === 'back') closeBag();
      const tabs = ['letters', 'items', 'memories'];
      if (a === 'dir:right' || a === 'dir:left') { bagTab = tabs[(tabs.indexOf(bagTab) + (a === 'dir:right' ? 1 : 2)) % 3]; G.audio.play('select'); renderBag(); }
      if (a === 'dir:down') G.$('#bag-body').scrollTop += 40;
      if (a === 'dir:up') G.$('#bag-body').scrollTop -= 40;
      if (a === 'act') { const b = G.$('#bag-body [data-open]'); if (b && bagTab === 'letters' && !G.state.s.flags.final_read) b.click(); }
      return true;
    }, 20);
  }

  /* ---------- 结局字幕 ---------- */
  function ending(e, extra) {
    const st = G.state.s;
    const el = G.$('#ending'), sc = G.$('#ending-scroll');
    const lines = e.lines.filter((l) => typeof l === 'string' || G.state.test(l.if)).map((l) => (typeof l === 'string' ? l : l.t));
    let h = lines.map((l) => `<div>${G.esc(l)}</div>`).join('');
    h += `<h2>${G.esc(e.title)}</h2><div class="stats">${G.esc(e.sub)}</div><h4>后 来</h4>`;
    S.epilogues.forEach((ep) => {
      const hit = ep.list.find((x) => G.state.test(x.if));
      if (hit) h += `<div class="ep"><b>${G.esc(ep.who)}</b>${G.esc(hit.t)}</div>`;
    });
    const mins = Math.max(1, Math.round(st.played / 60));
    const found = G.state.meta().endings.length;
    h += `<h4>邮 路 记 录</h4><div class="stats">送达 ${st.counters.delivered}/5 封信 · 想起 ${st.mems.length}/6 段往事 · 偷看 ${st.peeked.length} 封 · 用时约 ${mins} 分钟</div>`;
    h += `<div class="stats">已解锁结局 ${found}/${S.endings.length}：${S.endings.map((x) => (G.state.meta().endings.includes(x.id) ? x.title : '？？')).join(' · ')}</div>`;
    h += `<h2 style="margin-top:2.5em">THE END</h2><div class="stats">谢谢你替老周，走完了这一班邮路。</div><button class="menu-btn" id="btn-again">再走一次邮路</button>`;
    sc.innerHTML = h;
    el.classList.remove('hidden');
    // 字幕滚动：用 scrollTop 驱动，玩家也可以自己滚轮/拖动
    el.scrollTop = 0;
    let acc = 0, lastT = 0;
    const roll = (ts) => {
      if (el.classList.contains('hidden')) return;
      const dt = lastT ? (ts - lastT) / 1000 : 0; lastT = ts;
      acc += dt * el.clientHeight * 0.06 * (rollFast ? 8 : 1);
      if (acc >= 1) { el.scrollTop += Math.floor(acc); acc -= Math.floor(acc); }
      if (el.scrollTop + el.clientHeight < el.scrollHeight - 1) requestAnimationFrame(roll);
    };
    rollFast = false;
    requestAnimationFrame(roll);
    G.$('#btn-again').addEventListener('click', () => { G.state.reset(); location.reload(); });
    if (extra) extra();
  }

  return { fastRoll() { rollFast = true; }, toast, banner, event, scene, memory, drawPortrait, refresh, openBag, closeBag, bagOpen, bindBag, ending, get sceneOpen() { return !!sceneResolve; } };
})();
