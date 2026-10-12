/* 输入：键盘 + 触屏方向键。方向键按"最后按下的优先"，动作键是一次性事件。 */
G.input = (function () {
  const held = [];               // 正在按住的方向，最后一个优先
  const handlers = [];           // 动作监听（返回 true 表示已处理）
  const DIR = { ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right' };
  const ACT = { Space: 'act', Enter: 'act', KeyZ: 'act', NumpadEnter: 'act', KeyX: 'bark', KeyB: 'bark', KeyQ: 'bag', Tab: 'bag', KeyI: 'bag', Escape: 'back', KeyM: 'map', KeyP: 'sound', KeyF: 'full', KeyO: 'settings' };
  let shift = false, runToggle = false;

  function press(dir) { const i = held.indexOf(dir); if (i >= 0) held.splice(i, 1); held.push(dir); }
  function release(dir) { const i = held.indexOf(dir); if (i >= 0) held.splice(i, 1); }
  function emit(action, extra) {
    G.audio.init();
    for (const h of handlers) if (h.fn(action, extra)) return;
  }

  window.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === 'Shift') { shift = true; return; }
    const d = DIR[e.code];
    if (d) { e.preventDefault(); if (!e.repeat) press(d); emit('dir:' + d); return; }
    if (/^Digit[1-9]$/.test(e.code)) { emit('num', +e.code.slice(5)); return; }
    const a = ACT[e.code];
    if (a) { e.preventDefault(); if (!e.repeat) emit(a); }
  });
  window.addEventListener('keyup', (e) => { if (e.key === 'Shift') shift = false; const d = DIR[e.code]; if (d) release(d); });
  window.addEventListener('blur', () => { held.length = 0; shift = false; });

  // 触屏
  function bindTouch() {
    const touch = G.$('#touch');
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouch) touch.classList.remove('hidden');
    touch.querySelectorAll('[data-dir]').forEach((b) => {
      const d = b.dataset.dir;
      const on = (e) => { e.preventDefault(); b.classList.add('on'); press(d); emit('dir:' + d); };
      const off = (e) => { e.preventDefault(); b.classList.remove('on'); release(d); };
      b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off);
      b.addEventListener('pointerleave', off); b.addEventListener('pointercancel', off);
    });
    const rb = G.$('#t-run');
    if (rb) rb.addEventListener('pointerdown', (e) => { e.preventDefault(); runToggle = !runToggle; rb.classList.toggle('on', runToggle); });
    touch.querySelectorAll('[data-key]').forEach((b) => {
      b.addEventListener('pointerdown', (e) => { e.preventDefault(); b.classList.add('on'); emit(b.dataset.key); });
      b.addEventListener('pointerup', () => b.classList.remove('on'));
      b.addEventListener('pointerleave', () => b.classList.remove('on'));
    });
  }

  return {
    bindTouch,
    get dir() { return held[held.length - 1] || null; },
    get run() { return shift !== runToggle; },
    // prio 越大越先收到；返回 true 表示吃掉这个输入
    on(fn, prio) { handlers.push({ fn, prio: prio || 0 }); handlers.sort((a, b) => b.prio - a.prio); },
    emit,
    clear() { held.length = 0; },
  };
})();
