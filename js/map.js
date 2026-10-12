/* 地图：支持多张地图（小镇、北林、室内）。每张图生成格子、碰撞，并预渲染静态地面。
   G.map.use(id) 切换当前地图；其余查询都针对当前地图。 */
G.map = (function () {
  const T = G.TILE;
  const built = {};
  let cur = null;

  function make(def) {
    const rec = { def, grid: [], bmap: [], ground: null, trees: [] };
    const W = def;
    const get = (x, y) => (x < 0 || y < 0 || x >= W.w || y >= W.h) ? (def.indoor ? 'W' : 't') : rec.grid[y][x];
    const at = (x, y, chars) => (x < 0 || y < 0 || x >= W.w || y >= W.h) ? false : chars.includes(rec.grid[y][x]);
    rec.get = get; rec.at = at;

    const brush = {
      fill(ch) { rec.grid = Array.from({ length: W.h }, () => Array(W.w).fill(ch)); },
      set(x, y, ch) { if (x >= 0 && y >= 0 && x < W.w && y < W.h) rec.grid[y][x] = ch; },
      rect(x, y, w, h, ch) { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) brush.set(i, j, ch); },
      frame(x, y, w, h, ch) { for (let i = x; i < x + w; i++) { brush.set(i, y, ch); brush.set(i, y + h - 1, ch); } for (let j = y; j < y + h; j++) { brush.set(x, j, ch); brush.set(x + w - 1, j, ch); } },
      scatter(x, y, w, h, ch, p, onlyOn) { const r = G.rng(x * 31 + y * 17 + 5 + W.w); for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (r() < p && j < W.h && i < W.w && (!onlyOn || rec.grid[j][i] === onlyOn)) brush.set(i, j, ch); },
      forest(p, seed) {
        const r = G.rng(seed);
        const keep = new Set();
        const mark = (x, y, rad) => { for (let j = -rad; j <= rad; j++) for (let i = -rad; i <= rad; i++) keep.add((x + i) + ',' + (y + j)); };
        W.buildings.forEach((b) => { for (let j = b.y - 1; j <= b.y + b.h + 1; j++) for (let i = b.x - 1; i <= b.x + b.w; i++) keep.add(i + ',' + j); });
        W.props.forEach((o) => mark(o.x, o.y, 1));
        Object.values(G.STORY.npcs).forEach((n) => (n.at || []).forEach((a) => { if ((a.map || 'town') === W.id) mark(a.x, a.y, 1); }));
        if (W.spawn) mark(W.spawn.x, W.spawn.y, 2);
        for (let y = 2; y < W.h; y++) for (let x = 2; x < W.w - 2; x++) {
          const ch = rec.grid[y][x];
          if (ch !== 'g' && ch !== 'h') continue;
          if (keep.has(x + ',' + y)) continue;
          let near = false;
          for (let j = -1; j <= 1 && !near; j++) for (let i = -1; i <= 1; i++) { const c = get(x + i, y + j); if ('pobksw'.includes(c)) { near = true; break; } }
          if (near) continue;
          if (r() < p) rec.grid[y][x] = 't';
        }
      },
    };

    W.build(brush);
    // 道具和角色脚下不能是树
    const clear = (x, y) => { if (rec.grid[y] && rec.grid[y][x] === 't') rec.grid[y][x] = 'g'; };
    W.props.forEach((o) => clear(o.x, o.y));
    Object.values(G.STORY.npcs).forEach((n) => (n.at || []).forEach((a) => { if ((a.map || 'town') === W.id) clear(a.x, a.y); }));
    (W.warps || []).forEach((w) => { clear(w.x, w.y); });
    rec.bmap = Array.from({ length: W.h }, () => Array(W.w).fill(null));
    W.buildings.forEach((b) => {
      for (let j = b.y; j < b.y + b.h; j++) for (let i = b.x; i < b.x + b.w; i++) { rec.bmap[j][i] = b.id; if (rec.grid[j][i] === 't') rec.grid[j][i] = 'g'; }
    });
    for (let y = 0; y < W.h; y++) for (let x = 0; x < W.w; x++) if (rec.grid[y][x] === 't') rec.trees.push([x, y]);
    render(rec);
    return rec;
  }

  function render(rec) {
    const W = rec.def;
    const { c, ctx } = G.canvas(W.w * T, W.h * T);
    G.tiles.palette = W.palette || null;
    for (let y = 0; y < W.h; y++) for (let x = 0; x < W.w; x++) {
      const ch = rec.grid[y][x];
      G.tiles.ground(ctx, ch, x, y, rec.at);
      if (ch === 't') G.tiles.trunk(ctx, x, y);
      if (ch === 'u') G.tiles.bush(ctx, x, y);
      if (ch === 'e') G.tiles.fence(ctx, x, y, rec.at);
    }
    W.buildings.forEach((b) => (b.special === 'clock' ? G.tiles.clockTower(ctx, b) : b.special === 'lighthouse' ? G.tiles.lighthouse(ctx, b) : G.tiles.building(ctx, b)));
    G.tiles.palette = null;
    rec.ground = c;
  }

  function build() { Object.values(G.MAPS).forEach((def) => { built[def.id] = make(def); }); cur = built.town; }
  function use(id) { cur = built[id]; G.tiles.palette = cur.def.palette || null; }

  function walkable(x, y) {
    const W = cur.def;
    if (x < 0 || y < 0 || x >= W.w || y >= W.h) return false;
    if (cur.bmap[y][x]) return false;
    return G.tiles.isWalk(cur.grid[y][x]);
  }
  function areaAt(x, y) {
    const a = (cur.def.areas || []).find((r) => x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h);
    return a ? a.name : cur.def.name;
  }
  function warpAt(x, y) { return (cur.def.warps || []).find((w) => w.x === x && w.y === y); }

  return {
    build, use, walkable, areaAt, warpAt,
    at: (x, y, c) => cur.at(x, y, c), get: (x, y) => cur.get(x, y),
    building: (x, y) => cur.bmap[y] && cur.bmap[y][x],
    buildingById: (id) => cur.def.buildings.find((b) => b.id === id) || G.MAPS.town.buildings.find((b) => b.id === id),
    doorOf: (b) => ({ x: b.x + b.door, y: b.y + b.h - 1 }),
    groundOf: (id) => built[id].ground,
    get id() { return cur.def.id; }, get def() { return cur.def; },
    get ground() { return cur.ground; }, get trees() { return cur.trees; },
    get w() { return cur.def.w; }, get h() { return cur.def.h; },
  };
})();
