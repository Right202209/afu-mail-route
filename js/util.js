/* 通用工具：全局命名空间 G、随机数、画布、描边 */
window.G = window.G || {};

G.TILE = 16;            // 一格 16 像素
G.VIEW_W = 320;         // 内部分辨率
G.VIEW_H = 192;

G.$ = (sel) => document.querySelector(sel);

// 可复现的随机数（同一种子每次生成一样的小镇）
G.rng = function (seed) {
  let s = seed >>> 0 || 1;
  return function () {
    s ^= s << 13; s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5; s >>>= 0;
    return (s >>> 0) / 4294967296;
  };
};
// 按坐标取稳定的伪随机值（用于瓷砖细节）
G.hash = function (x, y, k) {
  let h = (x * 374761393 + y * 668265263 + (k || 0) * 2147483647) >>> 0;
  h = (h ^ (h >>> 13)) * 1274126177 >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

G.canvas = function (w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  return { c, ctx };
};

// 给精灵自动描一圈深色像素边
G.outline = function (src, color) {
  const w = src.width, h = src.height;
  const { c, ctx } = G.canvas(w, h);
  const sctx = src.getContext('2d');
  const d = sctx.getImageData(0, 0, w, h).data;
  const out = ctx.createImageData(w, h);
  const o = out.data;
  const rgb = G.hex(color || '#2b2118');
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (d[i + 3] > 0) { o[i] = d[i]; o[i + 1] = d[i + 1]; o[i + 2] = d[i + 2]; o[i + 3] = 255; continue; }
      const n = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => {
        const nx = x + dx, ny = y + dy;
        return nx >= 0 && ny >= 0 && nx < w && ny < h && d[(ny * w + nx) * 4 + 3] > 0;
      });
      if (n) { o[i] = rgb[0]; o[i + 1] = rgb[1]; o[i + 2] = rgb[2]; o[i + 3] = 255; }
    }
  }
  ctx.putImageData(out, 0, 0);
  return c;
};

G.hex = function (h) {
  const v = parseInt(h.replace('#', ''), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
};

// 左右镜像
G.mirror = function (src) {
  const { c, ctx } = G.canvas(src.width, src.height);
  ctx.translate(src.width, 0); ctx.scale(-1, 1);
  ctx.drawImage(src, 0, 0);
  return c;
};

G.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
G.lerp = (a, b, t) => a + (b - a) * t;
G.wait = (ms) => new Promise((r) => setTimeout(r, ms));
G.esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
