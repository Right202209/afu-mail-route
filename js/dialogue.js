/* 对话引擎：逐字显示、多页、选项、条件分支、效果。
   节点在进入时执行 fx；scene（信件/过场）在本节点文字播完后弹出；
   memory 和 end 等到整段对话结束后再处理。 */
G.dialogue = (function () {
  const box = () => G.$('#dialogue');
  let node = null, pages = [], page = 0, shown = 0, timer = null;
  let choices = [], sel = 0, pendingScenes = [], afterClose = [], onClose = null, active = false, busy = false;
  const N = () => G.STORY.nodes;

  function resolve(go) {
    if (!go) return null;
    if (typeof go === 'string') return go;
    const hit = go.find((g) => G.state.test(g.if));
    return hit ? hit.go : null;
  }

  function start(id, cb) {
    if (!N()[id]) { console.warn('找不到对话节点', id); return; }
    active = true; onClose = cb || null; afterClose = [];
    G.input.clear();
    enter(id);
  }

  function handle(events) {
    events.forEach((e) => {
      if (e.type === 'scene') pendingScenes.push(e.id);
      else if (e.type === 'memory' || e.type === 'end' || e.type === 'mini') afterClose.push(e);
      else G.ui.event(e);
    });
  }

  function enter(id) {
    let guard = 0;
    while (id && guard++ < 50) {
      node = N()[id];
      if (!node) { console.warn('找不到对话节点', id); return close(); }
      (G.state.s.seen || (G.state.s.seen = {}))[id] = 1;
      handle(G.state.apply(node.fx));
      if (node.text && node.text.length) break;
      // 纯路由节点：没有文字，直接跳转
      if (node.choices) break;
      id = resolve(node.go);
      if (!id) return close();
    }
    pages = node.text ? (Array.isArray(node.text) ? node.text : [node.text]) : [];
    page = 0;
    renderSpeaker();
    box().classList.remove('hidden');
    G.$('#dlg-choices').innerHTML = '';
    if (pages.length) typePage(); else afterText();
  }

  function renderSpeaker() {
    const who = node.who;
    const nameEl = G.$('#dlg-name'), pc = G.$('#portrait');
    const def = G.STORY.npcs[who];
    if (!def) {
      nameEl.textContent = who && who !== 'none' ? who : '';
      pc.style.display = who === 'none' ? 'none' : '';
      G.ui.drawPortrait(pc, who === 'none' ? null : 'dog');
    } else {
      nameEl.textContent = def.name;
      pc.style.display = '';
      G.ui.drawPortrait(pc, who);
    }
  }

  function typePage() {
    const txt = pages[page];
    const el = G.$('#dlg-text');
    el.textContent = '';
    shown = 0;
    G.$('#dlg-more').style.visibility = 'hidden';
    clearInterval(timer);
    const delay = G.settings.textDelay();
    if (delay <= 0) { el.textContent = txt; shown = txt.length; timer = null; pageDone(); return; }
    timer = setInterval(() => {
      shown++;
      el.textContent = txt.slice(0, shown);
      if (shown % 2 === 0 && node.who !== 'none') G.audio.play('blip');
      if (shown >= txt.length) { clearInterval(timer); timer = null; pageDone(); }
    }, delay);
  }
  function pageDone() {
    if (page < pages.length - 1) { G.$('#dlg-more').style.visibility = 'visible'; return; }
    afterText();
  }

  async function afterText() {
    if (pendingScenes.length) {
      busy = true;
      box().classList.add('hidden');
      while (pendingScenes.length) await G.ui.scene(G.STORY.scenes[pendingScenes.shift()]);
      box().classList.remove('hidden');
      busy = false;
    }
    choices = (node.choices || []).filter((c) => G.state.test(c.if));
    if (choices.length) {
      sel = 0; renderChoices();
      G.$('#dlg-more').style.visibility = 'hidden';
    } else {
      G.$('#dlg-more').style.visibility = 'visible';
    }
  }

  function renderChoices() {
    const ol = G.$('#dlg-choices');
    ol.innerHTML = '';
    choices.forEach((c, i) => {
      const li = document.createElement('li');
      li.innerHTML = `<span class="k">${i + 1}.</span>${G.esc(c.t)}`;
      if (i === sel) li.className = 'sel';
      li.addEventListener('pointerenter', () => { sel = i; mark(); });
      li.addEventListener('click', (e) => { e.stopPropagation(); sel = i; choose(); });
      ol.appendChild(li);
    });
  }
  function mark() { [...G.$('#dlg-choices').children].forEach((li, i) => li.classList.toggle('sel', i === sel)); }

  function choose() {
    const c = choices[sel];
    if (!c) return;
    G.audio.play('confirm');
    choices = [];
    G.$('#dlg-choices').innerHTML = '';
    handle(G.state.apply(c.fx));
    const nxt = resolve(c.go);
    if (nxt) enter(nxt); else close();
  }

  function advance() {
    if (busy) return;
    if (timer) { clearInterval(timer); timer = null; G.$('#dlg-text').textContent = pages[page]; pageDone(); return; }
    if (page < pages.length - 1) { page++; G.audio.play('select'); typePage(); return; }
    if (choices.length) { choose(); return; }
    const nxt = resolve(node.go);
    if (nxt) enter(nxt); else close();
  }

  async function close() {
    clearInterval(timer); timer = null;
    box().classList.add('hidden');
    active = false; node = null;
    const ev = afterClose; afterClose = [];
    for (const e of ev) {
      if (e.type === 'memory') await G.ui.memory(e.id);
    }
    const mini = ev.find((e) => e.type === 'mini');
    if (mini) {
      const n = await G.mini.frisbee();
      const st = G.state.s;
      st.counters.frisbee_last = n; st.counters.frisbee = Math.max(st.counters.frisbee || 0, n);
      G.state.save(G.game && G.game.player);
      return start('jie_frisbee_end', onClose);
    }
    G.state.save(G.game && G.game.player);
    G.ui.refresh();
    if (ev.some((e) => e.type === 'end')) { G.game.ending(); return; }
    if (onClose) onClose();
  }

  // 键盘与点击
  G.input.on((a, extra) => {
    if (!active) return false;
    if (busy) return true;
    if (a === 'act') { advance(); return true; }
    if (choices.length) {
      if (a === 'dir:up') { sel = (sel + choices.length - 1) % choices.length; mark(); G.audio.play('select'); }
      if (a === 'dir:down') { sel = (sel + 1) % choices.length; mark(); G.audio.play('select'); }
      if (a === 'num' && extra <= choices.length) { sel = extra - 1; choose(); }
    }
    return true;
  }, 10);
  document.addEventListener('DOMContentLoaded', () => {
    G.$('#dialogue').addEventListener('click', () => { if (active && !choices.length) advance(); });
  });

  return { start, get active() { return active; } };
})();
