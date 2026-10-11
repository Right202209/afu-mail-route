/* 游戏状态：旗标、物品、计数器、记忆、已送达的信。
   条件与效果都是短字符串，剧本作者只需要写字符串（语法见 docs/剧本编写指南.md）。 */
G.state = (function () {
  const KEY = 'afu-mail-route/save/v1';
  const META = 'afu-mail-route/meta/v1';
  let s = fresh();

  function fresh() {
    return { flags: {}, items: [], counters: { delivered: 0, memories: 0, peek: 0, kindness: 0 }, mems: [], delivered: [], peeked: [], player: null, started: Date.now(), played: 0 };
  }

  /* ---------- 条件 ---------- */
  function atom(a) {
    a = a.trim();
    if (!a) return true;
    if (a[0] === '!') return !atom(a.slice(1));
    const m = a.match(/^c:(\w+)\s*(>=|<=|==|>|<)\s*(-?\d+)$/);
    if (m) {
      const v = s.counters[m[1]] || 0, n = +m[3];
      return { '>=': v >= n, '<=': v <= n, '==': v === n, '>': v > n, '<': v < n }[m[2]];
    }
    const [k, name] = a.split(':');
    if (k === 'f') return !!s.flags[name];
    if (k === 'i') return s.items.includes(name);
    if (k === 'm') return s.mems.includes(name);
    if (k === 'd') return s.delivered.includes(name);
    if (k === 'p') return s.peeked.includes(name);
    console.warn('未知条件', a);
    return false;
  }
  function test(cond) {
    if (!cond) return true;
    return cond.split('|').some((part) => part.split('&').every(atom));
  }

  /* ---------- 效果 ---------- */
  // 返回需要界面处理的事件（提示、音效、过场）
  function apply(fx) {
    const events = [];
    if (!fx) return events;
    const list = Array.isArray(fx) ? fx : fx.split(';');
    list.forEach((raw) => {
      const e = raw.trim();
      if (!e) return;
      const neg = e[0] === '-';
      const body = neg ? e.slice(1) : e;
      const idx = body.indexOf(':');
      const k = idx < 0 ? body : body.slice(0, idx);
      const v = idx < 0 ? '' : body.slice(idx + 1);
      switch (k) {
        case 'f': if (neg) delete s.flags[v]; else s.flags[v] = true; break;
        case 'i':
          if (neg) { s.items = s.items.filter((x) => x !== v); }
          else if (!s.items.includes(v)) { s.items.push(v); events.push({ type: 'item', id: v }); }
          break;
        case 'c': {
          const m = v.match(/^(\w+)([+-]\d+)$/);
          if (m) s.counters[m[1]] = (s.counters[m[1]] || 0) + +m[2];
          break;
        }
        case 'm':
          if (!s.mems.includes(v)) { s.mems.push(v); s.counters.memories = s.mems.length; events.push({ type: 'memory', id: v }); }
          break;
        case 'd':
          if (!s.delivered.includes(v)) { s.delivered.push(v); s.counters.delivered = s.delivered.length; events.push({ type: 'deliver', id: v }); }
          break;
        case 'peek':
          if (!s.peeked.includes(v)) { s.peeked.push(v); s.counters.peek = s.peeked.length; events.push({ type: 'peek', id: v }); }
          break;
        case 'sfx': events.push({ type: 'sfx', id: v }); break;
        case 'toast': events.push({ type: 'toast', text: v }); break;
        case 'scene': events.push({ type: 'scene', id: v }); break;
        case 'bell': events.push({ type: 'bell' }); break;
        case 'end': events.push({ type: 'end' }); break;
        default: console.warn('未知效果', e);
      }
    });
    return events;
  }

  /* ---------- 存档 ---------- */
  function save(player) {
    if (player) s.player = { x: player.tx, y: player.ty, dir: player.dir };
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* 隐私模式下忽略 */ }
  }
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return false;
      s = Object.assign(fresh(), JSON.parse(raw));
      return true;
    } catch (e) { return false; }
  }
  function hasSave() { try { return !!localStorage.getItem(KEY); } catch (e) { return false; } }
  function reset() { s = fresh(); try { localStorage.removeItem(KEY); } catch (e) { /* */ } }

  function meta() { try { return JSON.parse(localStorage.getItem(META)) || { endings: [] }; } catch (e) { return { endings: [] }; } }
  function recordEnding(id) {
    const m = meta();
    if (!m.endings.includes(id)) m.endings.push(id);
    try { localStorage.setItem(META, JSON.stringify(m)); } catch (e) { /* */ }
  }

  return {
    get s() { return s; },
    test, apply, save, load, hasSave, reset, meta, recordEnding,
    flag: (n) => !!s.flags[n],
  };
})();
