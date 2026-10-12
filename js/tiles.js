/* 地形、建筑与道具的像素绘制。地图字符的含义见 data/world.js 顶部注释。 */
G.tiles = (function () {
  const T = 16;
  const api = { palette: null };
  const px = (c, col, x, y, w, h) => { c.fillStyle = col; c.fillRect(x, y, w || 1, h || 1); };
  const H = G.hash;

  const WALK = { g: 1, h: 1, p: 1, o: 1, s: 1, b: 1, k: 1, f: 1, d: 1, F: 1, K: 1, T: 1, M: 1 };
  const isWalk = (ch) => !!WALK[ch];

  const COL = {
    g: ['#6fae55', '#62a04a', '#7dbb60'],
    h: ['#9cc463', '#8db857', '#acd170'],
    p: ['#d4b07a', '#c49e66', '#e0bf8a'],
    o: ['#b9b2a3', '#a39c8d', '#cbc5b7'],
    s: ['#ecd8a0', '#dcc68a', '#f6e6b8'],
  };

  function grassy(c, x, y, tx, ty, pal) {
    px(c, pal[0], x, y, T, T);
    for (let i = 0; i < 6; i++) {
      const r = H(tx, ty, i);
      const gx = (r * 997 | 0) % 15, gy = (r * 7919 | 0) % 15;
      px(c, i % 2 ? pal[1] : pal[2], x + gx, y + gy, 1, 2);
    }
    if (H(tx, ty, 9) > 0.86) { px(c, pal[1], x + 4, y + 9, 1, 2); px(c, pal[1], x + 6, y + 8, 1, 3); px(c, pal[1], x + 8, y + 9, 1, 2); }
  }

  function ground(c, ch, tx, ty, at) {
    const x = tx * T, y = ty * T;
    switch (ch) {
      case 'g': case 't': case 'u': case 'e': return grassy(c, x, y, tx, ty, COL.g);
      case 'h': return grassy(c, x, y, tx, ty, COL.h);
      case 'f': {
        grassy(c, x, y, tx, ty, at(tx, ty, 'h') ? COL.h : COL.g);
        const cols = ['#f4e04d', '#ffffff', '#e86a8a', '#b48ae8', '#f29b4a'];
        for (let i = 0; i < 5; i++) {
          const r = H(tx, ty, 20 + i);
          const fx = 1 + ((r * 113) | 0) % 13, fy = 1 + ((r * 7717) | 0) % 13;
          px(c, '#4e8a3c', x + fx, y + fy + 1, 1, 2);
          px(c, cols[((r * 31) | 0) % cols.length], x + fx - 1, y + fy, 3, 1); px(c, cols[((r * 31) | 0) % cols.length], x + fx, y + fy - 1, 1, 3);
          px(c, '#f6d36b', x + fx, y + fy);
        }
        return;
      }
      case 'p': case 'd': {
        px(c, COL.p[0], x, y, T, T);
        for (let i = 0; i < 5; i++) { const r = H(tx, ty, i); px(c, i % 2 ? COL.p[1] : COL.p[2], x + ((r * 977) | 0) % 15, y + ((r * 7907) | 0) % 15, 2, 1); }
        // 和草地相邻的一侧画一条暗边
        const edge = '#a8865a';
        if (!at(tx, ty - 1, 'pdob')) px(c, edge, x, y, T, 1);
        if (!at(tx, ty + 1, 'pdob')) px(c, edge, x, y + T - 1, T, 1);
        if (!at(tx - 1, ty, 'pdob')) px(c, edge, x, y, 1, T);
        if (!at(tx + 1, ty, 'pdob')) px(c, edge, x + T - 1, y, 1, T);
        return;
      }
      case 'o': {
        px(c, COL.o[0], x, y, T, T);
        const off = ty % 2 ? 4 : 0;
        px(c, COL.o[1], x, y + 7, T, 1); px(c, COL.o[1], x, y + 15, T, 1);
        px(c, COL.o[1], x + ((off + 0) % 16), y, 1, 7); px(c, COL.o[1], x + ((off + 8) % 16), y + 8, 1, 7);
        px(c, COL.o[2], x + 2, y + 2, 2, 1); px(c, COL.o[2], x + 10, y + 10, 2, 1);
        return;
      }
      case 's': {
        px(c, COL.s[0], x, y, T, T);
        for (let i = 0; i < 7; i++) { const r = H(tx, ty, i); px(c, i % 2 ? COL.s[1] : COL.s[2], x + ((r * 977) | 0) % 16, y + ((r * 7907) | 0) % 16); }
        if (H(tx, ty, 40) > 0.93) { px(c, '#f2f2ee', x + 6, y + 8, 3, 2); px(c, '#e0a0a0', x + 7, y + 8); }
        return;
      }
      case 'w': return; // 水面每帧单独画
      /* ---- 室内 ---- */
      case 'W': {
        const P = api.palette || { wall: '#c9b48a', wallD: '#a8915f', trim: '#5c3d22' };
        if (at(tx, ty + 1, 'FKTM')) {
          px(c, P.wall, x, y, T, T);
          for (let i = 0; i < T; i += 4) px(c, P.wallD, x + i + 1, y, 1, 10);
          px(c, P.trim, x, y + 10, T, 2); px(c, P.wallD, x, y + 12, T, 3); px(c, '#2b2118', x, y + 15, T, 1);
        } else {
          px(c, '#2b2118', x, y, T, T); px(c, '#3a2f26', x + 1, y + 1, T - 2, T - 2);
        }
        return;
      }
      case 'F': case 'M': {
        px(c, '#b5834f', x, y, T, T);
        for (let i = 0; i < 4; i++) { px(c, '#9a6c3c', x, y + i * 4 + 3, T, 1); px(c, '#9a6c3c', x + ((ty + i) % 2 ? 5 : 11), y + i * 4, 1, 3); }
        px(c, '#c9965f', x + 2, y + 1, 3, 1);
        if (at(tx, ty - 1, 'W')) px(c, 'rgba(0,0,0,.18)', x, y, T, 3);
        if (ch === 'M') { px(c, '#7a3a2c', x + 1, y + 2, 14, 12); px(c, '#a8553a', x + 2, y + 3, 12, 10); px(c, '#f2c14e', x + 4, y + 7, 8, 1); }
        return;
      }
      case 'K': {
        px(c, '#a39c8d', x, y, T, T); px(c, '#8f887a', x, y + 7, T, 1); px(c, '#8f887a', x + (ty % 2 ? 4 : 10), y, 1, 7); px(c, '#8f887a', x + (ty % 2 ? 12 : 2), y + 8, 1, 8);
        if (at(tx, ty - 1, 'W')) px(c, 'rgba(0,0,0,.2)', x, y, T, 3);
        return;
      }
      case 'T': {
        px(c, '#f0e6d2', x, y, T, T); px(c, '#d9c8a8', x + 7, y, 1, T); px(c, '#d9c8a8', x, y + 7, T, 1); if ((tx + ty) % 2) px(c, '#e6d6b8', x, y, 7, 7), px(c, '#e6d6b8', x + 8, y + 8, 8, 8);
        if (at(tx, ty - 1, 'W')) px(c, 'rgba(0,0,0,.18)', x, y, T, 3);
        return;
      }
      case 'b': case 'k': {
        // 桥（横向木板）/ 栈桥（纵向木板）——下面先垫水
        px(c, '#3d6f9e', x, y, T, T);
        const wood = '#a8763f', dark = '#7a5230', hi = '#c08c52';
        if (ch === 'b') {
          px(c, wood, x, y + 1, T, 14);
          for (let i = 0; i < 4; i++) { px(c, dark, x, y + 1 + i * 4, T, 1); px(c, hi, x, y + 2 + i * 4, T, 1); }
          if (!at(tx, ty - 1, 'b')) { px(c, dark, x, y, T, 2); px(c, '#5c3d22', x + 2, y - 0, 2, 2); }
          if (!at(tx, ty + 1, 'b')) { px(c, dark, x, y + 14, T, 2); }
        } else {
          px(c, wood, x + 1, y, 14, T);
          for (let i = 0; i < 4; i++) { px(c, dark, x + 1 + i * 4, y, 1, T); px(c, hi, x + 2 + i * 4, y, 1, T); }
          if (!at(tx, ty + 1, 'k')) { px(c, '#5c3d22', x + 1, y + 13, 2, 3); px(c, '#5c3d22', x + 13, y + 13, 2, 3); }
        }
        return;
      }
      case 'r': {
        grassy(c, x, y, tx, ty, at(tx, ty + 1, 's') || at(tx, ty, 's') ? COL.s : COL.g);
        px(c, '#7d7a72', x + 2, y + 5, 12, 9); px(c, '#9a968c', x + 3, y + 4, 9, 4); px(c, '#b6b2a6', x + 5, y + 5, 4, 1); px(c, '#5e5b55', x + 2, y + 13, 12, 1);
        return;
      }
      default: px(c, '#ff00ff', x, y, T, T);
    }
  }

  // 树干画在地面层，树冠在角色之后画（这样阿福能"走到树后面"）
  function trunk(c, tx, ty) {
    const x = tx * T, y = ty * T;
    px(c, 'rgba(0,0,0,.18)', x + 2, y + 12, 12, 3);
    px(c, '#6b4a2b', x + 6, y + 8, 4, 6); px(c, '#4f351f', x + 6, y + 8, 1, 6);
  }
  function canopy(c, tx, ty) {
    const x = tx * T, y = ty * T - 7;
    const v = H(tx, ty, 77);
    const dark = v > 0.5 ? '#2f6b3a' : '#336f2e', mid = v > 0.5 ? '#3f8a4a' : '#4a8a3a', hi = v > 0.5 ? '#5aa860' : '#66a64c';
    px(c, '#1f3d22', x + 1, y + 3, 14, 12); px(c, '#1f3d22', x + 3, y + 1, 10, 16);
    px(c, dark, x + 2, y + 3, 12, 11); px(c, dark, x + 4, y + 2, 8, 14);
    px(c, mid, x + 3, y + 3, 9, 8); px(c, mid, x + 5, y + 2, 6, 10);
    px(c, hi, x + 5, y + 4, 3, 2); px(c, hi, x + 9, y + 6, 2, 2); px(c, hi, x + 4, y + 8, 2, 1);
    if (v > 0.8) { px(c, '#e05a4a', x + 6, y + 9, 2, 2); px(c, '#e05a4a', x + 10, y + 4, 2, 2); }
  }
  function bush(c, tx, ty) {
    const x = tx * T, y = ty * T;
    px(c, '#1f3d22', x + 1, y + 4, 14, 11); px(c, '#3f8a4a', x + 2, y + 5, 12, 9); px(c, '#5aa860', x + 4, y + 6, 4, 2); px(c, '#2f6b3a', x + 2, y + 12, 12, 2);
  }
  function fence(c, tx, ty, at) {
    const x = tx * T, y = ty * T;
    const w = '#c9a46a', d = '#7a5230';
    const lr = at(tx - 1, ty, 'e') || at(tx + 1, ty, 'e');
    const ud = at(tx, ty - 1, 'e') || at(tx, ty + 1, 'e');
    px(c, d, x + 6, y + 3, 4, 11); px(c, w, x + 7, y + 3, 2, 10);
    if (lr || !ud) { px(c, d, x, y + 6, T, 3); px(c, w, x, y + 6, T, 1); px(c, d, x, y + 11, T, 2); px(c, w, x, y + 11, T, 1); }
    if (ud) { px(c, d, x + 7, y, 2, T); px(c, w, x + 7, y, 1, T); }
  }

  // 水面三帧
  const waterFrames = [0, 1, 2].map((f) => {
    const { c, ctx } = G.canvas(T, T);
    px(ctx, '#3d6f9e', 0, 0, T, T);
    px(ctx, '#356390', 0, 12, T, 4);
    for (let i = 0; i < 3; i++) {
      const xx = (i * 6 + f * 2) % 16, yy = (i * 5 + 2) % 12;
      px(ctx, '#6c9cc8', xx, yy, 4, 1); px(ctx, '#8fb8dc', xx + 1, yy, 2, 1);
    }
    return ctx.canvas;
  });
  function water(c, tx, ty, frame, at) {
    const x = tx * T, y = ty * T;
    c.drawImage(waterFrames[(frame + ((tx + ty) % 3)) % 3], x, y);
    if (!at(tx, ty - 1, 'wbk')) { px(c, '#e9f3f7', x, y, T, 2); px(c, '#a9cde4', x, y + 2, T, 1); if (frame % 2) px(c, '#e9f3f7', x + 3, y + 3, 4, 1); }
  }

  /* ---------- 建筑 ---------- */
  function icon(c, kind, x, y) {
    // 门楣上的小招牌 10×7
    px(c, '#5c3d22', x - 1, y - 1, 12, 9); px(c, '#f3e3c3', x, y, 10, 7);
    const k = '#2b2118';
    if (kind === 'post') { px(c, '#c0392b', x + 2, y + 1, 6, 5); px(c, '#f3e3c3', x + 3, y + 2, 4, 1); px(c, '#f3e3c3', x + 4, y + 3, 2, 1); }
    if (kind === 'bread') { px(c, '#c98a4b', x + 2, y + 2, 6, 3); px(c, '#e8b878', x + 3, y + 2, 4, 1); px(c, '#8a5a2b', x + 4, y + 3, 1, 1); px(c, '#8a5a2b', x + 6, y + 3, 1, 1); }
    if (kind === 'shop') { px(c, '#4f8a3a', x + 2, y + 1, 2, 5); px(c, '#4f74a8', x + 5, y + 2, 2, 4); px(c, '#c0392b', x + 7, y + 3, 2, 3); }
    if (kind === 'book') { px(c, '#4f74a8', x + 2, y + 1, 6, 5); px(c, '#f3e3c3', x + 4, y + 2, 3, 1); px(c, k, x + 2, y + 1, 1, 5); }
    if (kind === 'cross') { px(c, '#c0392b', x + 4, y + 1, 2, 5); px(c, '#c0392b', x + 2, y + 3, 6, 1); }
    if (kind === 'home') { px(c, '#e86a8a', x + 3, y + 2, 4, 3); px(c, '#e86a8a', x + 2, y + 3, 6, 1); }
  }
  function building(c, b) {
    const x = b.x * T, y = b.y * T, w = b.w * T, h = b.h * T;
    const roofH = h - 2 * T + 6;
    const wallY = y + roofH - 2;
    const wall = b.wall || '#e8d9bd', wallD = b.wallD || '#cbb994', roof = b.roof || '#b5533c', roofD = b.roofD || '#8a3c2c';
    // 阴影
    px(c, 'rgba(0,0,0,.2)', x + 3, y + h - 2, w - 2, 3);
    // 墙
    px(c, wall, x + 2, wallY, w - 4, y + h - wallY);
    for (let yy = wallY + 4; yy < y + h; yy += 5) px(c, wallD, x + 2, yy, w - 4, 1);
    px(c, wallD, x + 2, y + h - 2, w - 4, 2);
    // 窗
    const doorX = x + b.door * T;
    for (let i = 0; i < b.w; i++) {
      if (i === b.door || i === 0 || i === b.w - 1 && b.w > 3) continue;
      if (Math.abs(i - b.door) === 1 && b.w < 6) continue;
      const wx = x + i * T + 3, wy = wallY + 6;
      px(c, '#5c3d22', wx - 1, wy - 1, 12, 10); px(c, b.night ? '#f6d36b' : '#9fc7e0', wx, wy, 10, 8);
      px(c, '#5c3d22', wx + 4, wy, 1, 8); px(c, '#5c3d22', wx, wy + 4, 10, 1); px(c, '#d7ecf7', wx + 1, wy + 1, 2, 2);
      if (b.boxes) { px(c, '#7a5230', wx - 1, wy + 9, 12, 3); px(c, '#e86a8a', wx + 1, wy + 8, 2, 1); px(c, '#f4e04d', wx + 5, wy + 8, 2, 1); }
    }
    // 门
    px(c, '#5c3d22', doorX + 2, wallY + 7, 12, y + h - wallY - 7); px(c, b.doorCol || '#8a5a2b', doorX + 3, wallY + 8, 10, y + h - wallY - 8);
    px(c, '#f2c14e', doorX + 10, wallY + 15, 1, 2); px(c, '#6e4524', doorX + 7, wallY + 8, 1, y + h - wallY - 8);
    if (b.icon) icon(c, b.icon, doorX + 3, wallY - 1);
    // 雨棚
    if (b.awning) {
      for (let i = 2; i < w - 2; i += 4) { px(c, i % 8 < 4 ? b.awning : '#f6ecd9', x + i, wallY + 1, 4, 4); }
      px(c, 'rgba(0,0,0,.2)', x + 2, wallY + 5, w - 4, 1);
    }
    // 屋顶
    px(c, roofD, x, y + roofH - 4, w, 4);
    px(c, roof, x, y + 2, w, roofH - 6);
    for (let yy = y + 5; yy < y + roofH - 4; yy += 4) {
      px(c, roofD, x, yy, w, 1);
      for (let xx = x + ((yy / 4) % 2 ? 0 : 4); xx < x + w; xx += 8) px(c, roofD, xx, yy - 3, 1, 3);
    }
    px(c, roofD, x + 2, y, w - 4, 3); px(c, b.roofHi || '#d07055', x + 2, y + 1, w - 4, 1);
    if (b.chimney) { px(c, '#7d7a72', x + w - 16, y - 6, 6, 9); px(c, '#5e5b55', x + w - 17, y - 7, 8, 2); }
  }
  function clockTower(c, b) {
    const x = b.x * T, y = b.y * T, w = b.w * T, h = b.h * T;
    px(c, 'rgba(0,0,0,.2)', x + 3, y + h - 2, w - 2, 3);
    px(c, '#b9b2a3', x + 4, y + 18, w - 8, h - 18);
    for (let yy = y + 22; yy < y + h; yy += 6) { px(c, '#a39c8d', x + 4, yy, w - 8, 1); }
    px(c, '#8f887a', x + 4, y + 18, 2, h - 18); px(c, '#cbc5b7', x + w - 8, y + 18, 2, h - 18);
    // 尖顶
    for (let i = 0; i < 18; i++) px(c, i % 4 === 0 ? '#5a3a6e' : '#6e4a86', x + 4 + Math.floor(i * 0.9), y + 18 - i, w - 8 - Math.floor(i * 1.8), 1);
    px(c, '#f2c14e', x + w / 2 - 1, y - 2, 2, 4);
    // 钟面
    const cx = x + w / 2, cy = y + 32;
    c.fillStyle = '#5c3d22'; c.beginPath(); c.arc(cx, cy, 11, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#f6ecd9'; c.beginPath(); c.arc(cx, cy, 9, 0, Math.PI * 2); c.fill();
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; px(c, '#5c3d22', Math.round(cx + Math.sin(a) * 7.5), Math.round(cy - Math.cos(a) * 7.5)); }
    // 钟窗与门
    px(c, '#2b2118', cx - 5, y + 48, 10, 12); px(c, '#f2c14e', cx - 2, y + 51, 4, 5);
    px(c, '#5c3d22', cx - 7, y + h - 18, 14, 18); px(c, '#6e4524', cx - 6, y + h - 17, 12, 17); px(c, '#f2c14e', cx + 3, y + h - 9, 1, 2);
  }
  function lighthouse(c, b) {
    const x = b.x * T, y = b.y * T, w = b.w * T, h = b.h * T;
    px(c, 'rgba(0,0,0,.2)', x + 3, y + h - 2, w - 2, 3);
    // 塔身：下宽上窄，红白条纹
    for (let yy = 16; yy < h; yy++) {
      const inset = Math.round(10 - (yy - 16) / (h - 16) * 6);
      const band = Math.floor((yy - 16) / 10) % 2;
      px(c, band ? '#c0392b' : '#f6f6f0', x + inset, y + yy, w - inset * 2, 1);
      px(c, 'rgba(0,0,0,.12)', x + w - inset - 3, y + yy, 3, 1);
    }
    // 灯室与顶
    px(c, '#2b2118', x + 9, y + 6, w - 18, 11); px(c, '#f6d36b', x + 11, y + 8, w - 22, 7);
    px(c, '#2b2118', x + 7, y + 16, w - 14, 2);
    px(c, '#c0392b', x + 10, y + 1, w - 20, 5); px(c, '#2b2118', x + w / 2 - 1, y - 2, 2, 3);
    // 门与窗
    px(c, '#5c3d22', x + w / 2 - 5, y + h - 14, 10, 14); px(c, '#6e4524', x + w / 2 - 4, y + h - 13, 8, 13);
    px(c, '#2b2118', x + w / 2 - 2, y + 34, 4, 6); px(c, '#9fc7e0', x + w / 2 - 1, y + 35, 2, 4);
  }
  function clockHands(c, b, hour, minute) {
    const cx = b.x * T + b.w * T / 2, cy = b.y * T + 32;
    const ha = (hour % 12 + minute / 60) / 12 * Math.PI * 2, ma = minute / 60 * Math.PI * 2;
    c.strokeStyle = '#2b2118'; c.lineWidth = 1.4;
    c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.sin(ha) * 4.5, cy - Math.cos(ha) * 4.5); c.stroke();
    c.lineWidth = 1;
    c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.sin(ma) * 7, cy - Math.cos(ma) * 7); c.stroke();
  }

  /* ---------- 道具（每帧画，可以出现/消失） ---------- */
  function prop(c, kind, tx, ty, t) {
    const x = tx * T, y = ty * T;
    const sh = () => px(c, 'rgba(0,0,0,.18)', x + 3, y + 13, 10, 2);
    switch (kind) {
      case 'mailbox': sh(); px(c, '#2b2118', x + 4, y + 2, 8, 12); px(c, '#2f7a4a', x + 5, y + 3, 6, 10); px(c, '#3f9a5e', x + 5, y + 3, 6, 2); px(c, '#2b2118', x + 6, y + 6, 4, 1); px(c, '#f2c14e', x + 7, y + 9, 2, 1); break;
      case 'sign': sh(); px(c, '#5c3d22', x + 7, y + 8, 2, 7); px(c, '#5c3d22', x + 2, y + 2, 12, 7); px(c, '#c9a46a', x + 3, y + 3, 10, 5); px(c, '#7a5230', x + 4, y + 4, 8, 1); px(c, '#7a5230', x + 4, y + 6, 6, 1); break;
      case 'board': sh(); px(c, '#5c3d22', x + 1, y + 1, 14, 11); px(c, '#c9a46a', x + 2, y + 2, 12, 9); px(c, '#f6ecd9', x + 3, y + 3, 4, 3); px(c, '#f6ecd9', x + 8, y + 4, 4, 4); px(c, '#e86a8a', x + 4, y + 7, 3, 3); px(c, '#5c3d22', x + 2, y + 12, 2, 3); px(c, '#5c3d22', x + 12, y + 12, 2, 3); break;
      case 'lamp': px(c, 'rgba(0,0,0,.18)', x + 5, y + 13, 6, 2); px(c, '#2b2118', x + 7, y + 2, 2, 12); px(c, '#2b2118', x + 5, y - 3, 6, 6); px(c, t && t.night ? '#ffe28a' : '#f6ecd9', x + 6, y - 2, 4, 4); if (t && t.night) px(c, 'rgba(255,226,138,.18)', x - 4, y - 6, 24, 22); break;
      case 'bench': px(c, 'rgba(0,0,0,.18)', x, y + 13, 16, 2); px(c, '#5c3d22', x, y + 4, 16, 3); px(c, '#a8763f', x, y + 4, 16, 1); px(c, '#5c3d22', x, y + 9, 16, 2); px(c, '#a8763f', x, y + 9, 16, 1); px(c, '#2b2118', x + 1, y + 11, 2, 3); px(c, '#2b2118', x + 13, y + 11, 2, 3); break;
      case 'crate': sh(); px(c, '#5c3d22', x + 2, y + 3, 12, 11); px(c, '#a8763f', x + 3, y + 4, 10, 9); px(c, '#7a5230', x + 3, y + 8, 10, 1); px(c, '#7a5230', x + 7, y + 4, 1, 9); break;
      case 'barrel': sh(); px(c, '#5c3d22', x + 3, y + 2, 10, 12); px(c, '#a8763f', x + 4, y + 3, 8, 10); px(c, '#4a4a5a', x + 3, y + 5, 10, 1); px(c, '#4a4a5a', x + 3, y + 10, 10, 1); break;
      case 'well': px(c, 'rgba(0,0,0,.18)', x, y + 13, 16, 3); px(c, '#7d7a72', x + 1, y + 6, 14, 8); px(c, '#9a968c', x + 2, y + 6, 12, 2); px(c, '#24435e', x + 3, y + 7, 10, 3); px(c, '#5c3d22', x + 2, y - 2, 2, 9); px(c, '#5c3d22', x + 12, y - 2, 2, 9); px(c, '#8a3c2c', x, y - 4, 16, 3); break;
      case 'boat': px(c, '#5c3d22', x - 4, y + 5, 24, 8); px(c, '#c0603a', x - 3, y + 5, 22, 3); px(c, '#a8763f', x - 2, y + 8, 20, 4); px(c, '#f6ecd9', x + 6, y - 8, 1, 13); px(c, '#f6ecd9', x + 7, y - 7, 6, 8); break;
      case 'easel': px(c, 'rgba(0,0,0,.18)', x + 3, y + 13, 10, 2); px(c, '#5c3d22', x + 3, y + 4, 1, 10); px(c, '#5c3d22', x + 12, y + 4, 1, 10); px(c, '#5c3d22', x + 7, y + 1, 2, 4); px(c, '#2b2118', x + 2, y + 2, 12, 9); px(c, '#9fc7e0', x + 3, y + 3, 10, 7); px(c, '#f2c14e', x + 9, y + 4, 2, 2); px(c, '#6fae55', x + 3, y + 7, 10, 3); px(c, '#d9934f', x + 5, y + 6, 2, 2); px(c, '#3f5f8a', x + 7, y + 5, 1, 3); break;
      case 'crane': { const b = Math.sin((t ? t.time : 0) * 3 + tx) > 0 ? 0 : 1; px(c, '#f6ecd9', x + 4, y + 7 + b, 8, 3); px(c, '#ffffff', x + 6, y + 5 + b, 4, 2); px(c, '#e86a8a', x + 7, y + 4 + b, 2, 1); px(c, '#d0c4b0', x + 4, y + 9 + b, 8, 1); break; }
      case 'gear': { const b = Math.sin((t ? t.time : 0) * 4) > 0 ? 0 : 1; px(c, '#8a6a20', x + 5, y + 5 + b, 6, 6); px(c, '#f2c14e', x + 6, y + 6 + b, 4, 4); px(c, '#8a6a20', x + 7, y + 4 + b, 2, 8); px(c, '#8a6a20', x + 4, y + 7 + b, 8, 2); px(c, '#5c3d22', x + 7, y + 7 + b, 2, 2); break; }
      case 'photo': { const b = Math.sin((t ? t.time : 0) * 4) > 0 ? 0 : 1; px(c, '#2b2118', x + 4, y + 5 + b, 9, 7); px(c, '#f6ecd9', x + 5, y + 6 + b, 7, 5); px(c, '#c9a46a', x + 6, y + 7 + b, 2, 3); px(c, '#c9a46a', x + 9, y + 7 + b, 2, 3); break; }
      case 'dandelion': px(c, '#4e8a3c', x + 7, y + 7, 1, 7); px(c, '#ffffff', x + 5, y + 3, 5, 5); px(c, '#e8e8e0', x + 6, y + 4, 3, 3); break;
      case 'gate': px(c, '#5c3d22', x, y + 2, 2, 13); px(c, '#5c3d22', x + 14, y + 2, 2, 13); for (let i = 3; i < 14; i += 3) px(c, '#e8e8e0', x + i, y + 4, 1, 10); px(c, '#e8e8e0', x + 2, y + 5, 12, 1); px(c, '#e8e8e0', x + 2, y + 11, 12, 1); break;
      case 'gateOpen': px(c, '#5c3d22', x, y + 2, 2, 13); px(c, '#5c3d22', x + 14, y + 2, 2, 13); break;
      case 'flowerpot': px(c, '#a8553a', x + 4, y + 9, 8, 5); px(c, '#c0603a', x + 3, y + 8, 10, 2); px(c, '#4e8a3c', x + 5, y + 4, 6, 4); px(c, '#e86a8a', x + 6, y + 3, 2, 2); px(c, '#f4e04d', x + 9, y + 4, 2, 2); break;
      case 'stall': px(c, 'rgba(0,0,0,.18)', x, y + 13, 16, 2); px(c, '#5c3d22', x + 1, y + 7, 14, 7); px(c, '#a8763f', x + 2, y + 8, 12, 5); px(c, '#e05a4a', x + 3, y + 6, 3, 2); px(c, '#f29b4a', x + 7, y + 6, 3, 2); px(c, '#6fae55', x + 11, y + 6, 2, 2); for (let i = 0; i < 16; i += 4) px(c, i % 8 ? '#f6ecd9' : '#4f74a8', x + i, y, 4, 3); px(c, '#5c3d22', x + 1, y + 3, 1, 4); px(c, '#5c3d22', x + 14, y + 3, 1, 4); break;
      case 'bowl': px(c, '#4f74a8', x + 4, y + 9, 8, 4); px(c, '#6f93c4', x + 4, y + 9, 8, 1); px(c, '#c98a4b', x + 5, y + 8, 6, 1); break;
      case 'busstop': px(c, '#5c3d22', x + 7, y + 3, 2, 12); px(c, '#3f5f8a', x + 3, y - 2, 10, 7); px(c, '#f6ecd9', x + 5, y, 6, 3); break;
      /* ---- v1.1 室内与新道具 ---- */
      case 'sorter': px(c, '#5c3d22', x, y - 6, 16, 20); px(c, '#8a5a2b', x + 1, y - 5, 14, 18); for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) { px(c, '#5c3d22', x + 1 + j * 5, y - 5 + i * 4, 4, 1); px(c, '#f6ecd9', x + 2 + j * 5, y - 3 + i * 4, 2, 1); } break;
      case 'crack': px(c, '#2b2118', x + 7, y + 2, 1, 6); px(c, '#2b2118', x + 8, y + 5, 1, 4); px(c, '#2b2118', x + 6, y + 7, 1, 3); px(c, '#f6ecd9', x + 8, y + 3, 2, 1); break;
      case 'calendar': px(c, '#5c3d22', x + 3, y + 1, 10, 9); px(c, '#f6ecd9', x + 4, y + 2, 8, 7); px(c, '#c0392b', x + 4, y + 2, 8, 2); px(c, '#c0392b', x + 7, y + 5, 3, 3); px(c, '#f6ecd9', x + 8, y + 6); break;
      case 'window': px(c, '#5c3d22', x + 2, y + 1, 12, 9); px(c, '#9fc7e0', x + 3, y + 2, 10, 7); px(c, '#5c3d22', x + 7, y + 2, 1, 7); px(c, '#d7ecf7', x + 4, y + 3, 2, 2); break;
      case 'desk': sh(); px(c, '#5c3d22', x, y + 4, 16, 9); px(c, '#a8763f', x + 1, y + 4, 14, 3); px(c, '#5c3d22', x + 1, y + 12, 2, 3); px(c, '#5c3d22', x + 13, y + 12, 2, 3); px(c, '#f6ecd9', x + 4, y + 2, 7, 3); px(c, '#4f74a8', x + 11, y + 1, 2, 4); break;
      case 'cabinet': sh(); px(c, '#5c3d22', x + 1, y - 2, 14, 16); px(c, '#8a5a2b', x + 2, y - 1, 12, 14); for (let i = 0; i < 3; i++) { px(c, '#5c3d22', x + 2, y + 3 + i * 4, 12, 1); px(c, '#f2c14e', x + 7, y + i * 4, 2, 1); } px(c, '#f6ecd9', x + 4, y + 8, 8, 2); break;
      case 'counter': px(c, '#5c3d22', x, y + 1, 16, 14); px(c, '#a8763f', x, y + 1, 16, 4); px(c, '#8a5a2b', x, y + 6, 16, 8); px(c, '#5c3d22', x, y + 9, 16, 1); break;
      case 'dogbed': px(c, '#4f74a8', x + 1, y + 6, 14, 8); px(c, '#6f93c4', x + 3, y + 7, 10, 5); px(c, '#f6ecd9', x + 5, y + 8, 6, 3); break;
      case 'rug': px(c, '#a8553a', x, y + 1, 16, 14); px(c, '#c0603a', x + 1, y + 2, 14, 12); px(c, '#f2c14e', x + 3, y + 7, 10, 1); break;
      case 'clockwork': { const a = (t ? t.time : 0) * (t && t.fixed ? 1.4 : 0); sh(); c.save(); c.translate(x + 8, y + 4); c.rotate(a * (tx % 2 ? 1 : -1)); c.fillStyle = '#8a6a20'; for (let i = 0; i < 8; i++) { c.rotate(Math.PI / 4); c.fillRect(-1.5, -10, 3, 4); } c.beginPath(); c.arc(0, 0, 7, 0, Math.PI * 2); c.fill(); c.fillStyle = '#f2c14e'; c.beginPath(); c.arc(0, 0, 5, 0, Math.PI * 2); c.fill(); c.fillStyle = '#5c3d22'; c.fillRect(-1, -1, 2, 2); c.restore(); break; }
      case 'ladder': px(c, '#7a5230', x + 3, y - 8, 2, 22); px(c, '#7a5230', x + 11, y - 8, 2, 22); for (let i = -6; i < 14; i += 4) px(c, '#a8763f', x + 3, y + i, 10, 1); break;
      case 'oven': px(c, '#5e5b55', x, y - 4, 16, 18); px(c, '#7d7a72', x + 1, y - 3, 14, 16); px(c, '#2b2118', x + 3, y + 3, 10, 7); px(c, t && t.warm ? '#f29b4a' : '#4a3a2a', x + 4, y + 4, 8, 5); px(c, '#5e5b55', x + 5, y - 8, 4, 5); break;
      case 'frame': px(c, '#5c3d22', x + 1, y + 1, 6, 6); px(c, '#f6ecd9', x + 2, y + 2, 4, 4); px(c, '#5c3d22', x + 9, y + 2, 6, 7); px(c, '#c9a46a', x + 10, y + 3, 4, 5); px(c, '#e86a8a', x + 11, y + 4, 2, 2); break;
      case 'shelf': px(c, '#5c3d22', x, y - 4, 16, 18); for (let i = 0; i < 3; i++) { px(c, '#a8763f', x + 1, y - 3 + i * 6, 14, 1); px(c, '#d9934f', x + 2, y - 6 + i * 6 + 4, 4, 2); px(c, '#e8b878', x + 8, y - 6 + i * 6 + 4, 5, 2); } break;
      case 'table': sh(); px(c, '#5c3d22', x, y + 4, 16, 6); px(c, '#a8763f', x + 1, y + 4, 14, 3); px(c, '#5c3d22', x + 2, y + 10, 2, 4); px(c, '#5c3d22', x + 12, y + 10, 2, 4); px(c, '#f6ecd9', x + 5, y + 2, 6, 2); break;
      case 'stairs': px(c, '#8f887a', x, y, 16, 16); for (let i = 0; i < 4; i++) { px(c, '#b9b2a3', x, y + i * 4, 16, 2); px(c, '#6e685e', x, y + i * 4 + 3, 16, 1); } break;
      case 'beacon': { px(c, '#2b2118', x - 2, y - 6, 20, 20); px(c, '#5c3d22', x, y + 8, 16, 6); const lit = t && t.light; px(c, lit ? '#fff2b0' : '#7d7a72', x + 2, y - 4, 12, 12); px(c, lit ? '#ffd24a' : '#5e5b55', x + 5, y - 1, 6, 6); if (lit) { px(c, 'rgba(255,240,170,.25)', x - 8, y - 10, 32, 28); } break; }
      case 'hollow': px(c, 'rgba(0,0,0,.2)', x - 4, y + 12, 24, 4); px(c, '#4f351f', x - 2, y - 6, 20, 20); px(c, '#6b4a2b', x, y - 6, 16, 20); px(c, '#4f351f', x + 3, y - 6, 1, 20); px(c, '#4f351f', x + 11, y - 6, 1, 20); px(c, '#1d1612', x + 4, y + 1, 8, 8); px(c, '#f6ecd9', x + 5, y + 5, 3, 2); px(c, '#ffffff', x + 8, y + 6, 3, 2); px(c, '#2f6b3a', x - 6, y - 16, 28, 12); px(c, '#3f8a4a', x - 4, y - 17, 24, 9); px(c, '#5aa860', x, y - 15, 6, 3); break;
      case 'mushroom': px(c, '#f6ecd9', x + 6, y + 9, 3, 5); px(c, '#c0392b', x + 3, y + 5, 9, 4); px(c, '#ffffff', x + 5, y + 6, 2, 1); px(c, '#ffffff', x + 9, y + 6, 1, 1); break;
      case 'stamp': { const b = Math.sin((t ? t.time : 0) * 4 + tx) > 0 ? 0 : 1; px(c, '#f6ecd9', x + 4, y + 4 + b, 8, 9); for (let i = 0; i < 4; i++) { px(c, '#d0c4b0', x + 4 + i * 2, y + 4 + b); px(c, '#d0c4b0', x + 4 + i * 2, y + 12 + b); } px(c, '#c0603a', x + 5, y + 6 + b, 6, 5); px(c, '#f2c14e', x + 7, y + 7 + b, 2, 2); break; }
      case 'key': { const b = Math.sin((t ? t.time : 0) * 4) > 0 ? 0 : 1; px(c, '#f2c14e', x + 4, y + 6 + b, 4, 4); px(c, '#8a6a20', x + 5, y + 7 + b, 2, 2); px(c, '#f2c14e', x + 8, y + 7 + b, 5, 2); px(c, '#f2c14e', x + 11, y + 9 + b, 1, 2); break; }
      case 'bottle': { const b = Math.sin((t ? t.time : 0) * 3) > 0 ? 0 : 1; px(c, 'rgba(0,0,0,.15)', x + 3, y + 12, 10, 2); px(c, '#7fb8a8', x + 4, y + 7 + b, 8, 4); px(c, '#a8d8c8', x + 5, y + 7 + b, 3, 1); px(c, '#8a5a2b', x + 12, y + 8 + b, 2, 2); px(c, '#f6ecd9', x + 6, y + 8 + b, 4, 2); break; }
      case 'lostbox': sh(); px(c, '#5c3d22', x + 1, y + 2, 14, 12); px(c, '#a8763f', x + 2, y + 3, 12, 10); px(c, '#5c3d22', x + 2, y + 6, 12, 1); px(c, '#f6ecd9', x + 4, y + 8, 8, 3); px(c, '#c0392b', x + 5, y + 9, 6, 1); break;
      case 'blackboard': px(c, '#5c3d22', x - 4, y + 1, 24, 10); px(c, '#2f5a3a', x - 3, y + 2, 22, 8); px(c, '#f6ecd9', x - 1, y + 4, 8, 1); px(c, '#f6ecd9', x + 1, y + 6, 12, 1); px(c, '#e86a8a', x + 13, y + 4, 3, 3); break;
      case 'chart': px(c, '#5c3d22', x - 3, y + 1, 22, 11); px(c, '#e8dcb8', x - 2, y + 2, 20, 9); px(c, '#7fb8d8', x - 2, y + 2, 20, 9); px(c, '#e8dcb8', x, y + 4, 4, 3); px(c, '#e8dcb8', x + 8, y + 3, 3, 2); px(c, '#e8dcb8', x + 13, y + 6, 3, 2); px(c, '#c0392b', x + 4, y + 5, 9, 1); break;
      case 'net': sh(); px(c, '#7a6a5a', x + 2, y + 1, 1, 13); for (let i = 0; i < 4; i++) { px(c, '#c8b890', x + 3, y + 2 + i * 3, 10, 1); px(c, '#c8b890', x + 4 + i * 3, y + 2, 1, 11); } px(c, '#e86a3a', x + 11, y + 12, 3, 2); break;
      case 'spark': { const a = (Math.sin((t ? t.time : 0) * 5 + tx * 2) + 1) / 2; px(c, `rgba(255,236,160,${0.35 + a * 0.5})`, x + 7, y + 3, 2, 10); px(c, `rgba(255,236,160,${0.35 + a * 0.5})`, x + 3, y + 7, 10, 2); px(c, '#fff', x + 7, y + 7, 2, 2); break; }
      default: break;
    }
  }

  Object.assign(api, { T, isWalk, ground, trunk, canopy, bush, fence, water, building, clockTower, lighthouse, clockHands, prop });
  return api;
})();
