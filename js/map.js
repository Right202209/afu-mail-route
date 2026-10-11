/* 地图：根据 data/world.js 生成格子、碰撞，并预渲染静态地面 */
G.map = (function () {
  const W = G.WORLD;
  const T = G.TILE;
  let grid = [], bmap = [];   // bmap[y][x] = 建筑 id
  let groundCanvas = null;
  const trees = [];

  function at(x, y, chars) {
    if (x < 0 || y < 0 || x >= W.w || y >= W.h) return false;
    return chars.includes(grid[y][x]);
  }
  function get(x, y) { return (x < 0 || y < 0 || x >= W.w || y >= W.h) ? 't' : grid[y][x]; }

  // 地图画刷
  const brush = {
    fill(ch) { grid = Array.from({ length: W.h }, () => Array(W.w).fill(ch)); },
    set(x, y, ch) { if (x >= 0 && y >= 0 && x < W.w && y < W.h) grid[y][x] = ch; },
    rect(x, y, w, h, ch) { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) brush.set(i, j, ch); },
    frame(x, y, w, h, ch) { for (let i = x; i < x + w; i++) { brush.set(i, y, ch); brush.set(i, y + h - 1, ch); } for (let j = y; j < y + h; j++) { brush.set(x, j, ch); brush.set(x + w - 1, j, ch); } },
    scatter(x, y, w, h, ch, p, onlyOn) { const r = G.rng(x * 31 + y * 17 + 5); for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (r() < p && (!onlyOn || grid[j][i] === onlyOn)) brush.set(i, j, ch); },
    forest(p, seed) {
      const r = G.rng(seed);
      const keep = new Set();
      const mark = (x, y, rad) => { for (let j = -rad; j <= rad; j++) for (let i = -rad; i <= rad; i++) keep.add((x + i) + ',' + (y + j)); };
      W.buildings.forEach((b) => { for (let j = b.y - 1; j <= b.y + b.h + 1; j++) for (let i = b.x - 1; i <= b.x + b.w; i++) keep.add(i + ',' + j); });
      W.props.forEach((o) => mark(o.x, o.y, 1));
      Object.values(G.STORY.npcs).forEach((n) => (n.at || []).forEach((a) => mark(a.x, a.y, 1)));
      mark(W.spawn.x, W.spawn.y, 2);
      for (let y = 2; y < W.h; y++) for (let x = 2; x < W.w - 2; x++) {
        const ch = grid[y][x];
        if (ch !== 'g' && ch !== 'h') continue;
        if (keep.has(x + ',' + y)) continue;
        let near = false;
        for (let j = -1; j <= 1 && !near; j++) for (let i = -1; i <= 1; i++) { const c = get(x + i, y + j); if ('pobksw'.includes(c)) { near = true; break; } }
        if (near) continue;
        if (r() < p) grid[y][x] = 't';
      }
    },
  };

  function build() {
    W.build(brush);
    bmap = Array.from({ length: W.h }, () => Array(W.w).fill(null));
    W.buildings.forEach((b) => {
      for (let j = b.y; j < b.y + b.h; j++) for (let i = b.x; i < b.x + b.w; i++) { bmap[j][i] = b.id; if (grid[j][i] === 't') grid[j][i] = 'g'; }
    });
    trees.length = 0;
    for (let y = 0; y < W.h; y++) for (let x = 0; x < W.w; x++) if (grid[y][x] === 't') trees.push([x, y]);
    render();
  }

  function render() {
    const { c, ctx } = G.canvas(W.w * T, W.h * T);
    for (let y = 0; y < W.h; y++) for (let x = 0; x < W.w; x++) {
      const ch = grid[y][x];
      G.tiles.ground(ctx, ch, x, y, at);
      if (ch === 't') G.tiles.trunk(ctx, x, y);
      if (ch === 'u') G.tiles.bush(ctx, x, y);
      if (ch === 'e') G.tiles.fence(ctx, x, y, at);
    }
    W.buildings.forEach((b) => (b.special === 'clock' ? G.tiles.clockTower(ctx, b) : G.tiles.building(ctx, b)));
    groundCanvas = c;
  }

  function building(x, y) { return bmap[y] && bmap[y][x]; }
  function buildingById(id) { return W.buildings.find((b) => b.id === id); }
  function doorOf(b) { return { x: b.x + b.door, y: b.y + b.h - 1 }; }

  function walkable(x, y) {
    if (x < 0 || y < 0 || x >= W.w || y >= W.h) return false;
    if (bmap[y][x]) return false;
    return G.tiles.isWalk(grid[y][x]);
  }

  function areaAt(x, y) {
    const a = W.areas.find((r) => x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h);
    return a ? a.name : '栖湾镇';
  }

  return {
    build, at, get, walkable, building, buildingById, doorOf, areaAt,
    get ground() { return groundCanvas; },
    get trees() { return trees; },
    get w() { return W.w; }, get h() { return W.h; },
  };
})();
