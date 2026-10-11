/* 角色精灵：全部用代码逐像素画出来，再自动描边。
   每个角色得到 { down:[f0,f1], up:[..], left:[..], right:[..] } 四个方向两帧。 */
G.sprites = (function () {
  const S = 16;
  const px = (ctx, col, x, y, w, h) => { ctx.fillStyle = col; ctx.fillRect(x, y, w || 1, h || 1); };
  const make = (fn) => { const { c, ctx } = G.canvas(S, S); fn(ctx); return G.outline(c); };

  /* ---------- 阿福：一只柴犬色的邮差狗，背着蓝色邮包 ---------- */
  const DOG = { fur: '#d9934f', shade: '#b46f37', white: '#f7ead4', dark: '#2b2118', bag: '#4f74a8', bagHi: '#6f93c4', strap: '#c0392b', nose: '#1d1612' };

  function dogSide(f) {
    return make((c) => {
      const C = DOG;
      // 尾巴（卷）
      px(c, C.fur, 1, 5, 2, 2); px(c, C.white, 1, 5); px(c, C.fur, 2, 7, 2, 1);
      // 身体
      px(c, C.fur, 3, 7, 8, 4); px(c, C.white, 4, 10, 6, 1);
      // 腿（两帧交替）
      if (f === 0) { px(c, C.shade, 3, 11, 1, 3); px(c, C.fur, 5, 11, 1, 3); px(c, C.shade, 8, 11, 1, 3); px(c, C.fur, 10, 11, 1, 3); }
      else { px(c, C.shade, 4, 11, 1, 3); px(c, C.fur, 4, 11, 1, 2); px(c, C.shade, 7, 11, 1, 3); px(c, C.fur, 9, 11, 1, 3); px(c, C.fur, 11, 11, 1, 2); }
      // 邮包与背带
      px(c, C.strap, 9, 7, 1, 3); px(c, C.bag, 5, 7, 4, 3); px(c, C.bagHi, 5, 7, 4, 1); px(c, '#f2c14e', 6, 8);
      // 头
      px(c, C.fur, 10, 3, 4, 5); px(c, C.white, 12, 6, 3, 2); px(c, C.white, 10, 6, 1, 2);
      px(c, C.nose, 14, 6); px(c, C.dark, 12, 4); px(c, '#e88f8f', 11, 6);
      // 耳朵
      px(c, C.fur, 10, 1, 1, 2); px(c, C.fur, 11, 2); px(c, C.fur, 13, 1, 1, 2); px(c, C.shade, 12, 2);
      // 项圈
      px(c, C.strap, 10, 8, 2, 1);
    });
  }
  function dogDown(f) {
    return make((c) => {
      const C = DOG;
      px(c, C.fur, 4, 8, 8, 4); px(c, C.white, 6, 8, 4, 4);
      px(c, C.bag, 11, 8, 2, 3); px(c, C.strap, 4, 8, 1, 3);
      if (f === 0) { px(c, C.fur, 5, 12, 2, 2); px(c, C.fur, 9, 12, 2, 1); }
      else { px(c, C.fur, 5, 12, 2, 1); px(c, C.fur, 9, 12, 2, 2); }
      px(c, C.fur, 4, 2, 8, 6); px(c, C.white, 6, 5, 4, 3); px(c, C.white, 4, 5, 1, 2); px(c, C.white, 11, 5, 1, 2);
      px(c, C.dark, 5, 4); px(c, C.dark, 10, 4); px(c, C.nose, 7, 5, 2, 1); px(c, '#e88f8f', 7, 7, 2, 1);
      px(c, C.fur, 4, 0, 2, 2); px(c, C.fur, 10, 0, 2, 2); px(c, C.shade, 5, 1); px(c, C.shade, 10, 1);
      px(c, C.strap, 5, 8, 6, 1);
    });
  }
  function dogUp(f) {
    return make((c) => {
      const C = DOG;
      px(c, C.fur, 4, 7, 8, 5);
      px(c, C.bag, 5, 8, 6, 3); px(c, C.bagHi, 5, 8, 6, 1); px(c, '#f2c14e', 7, 9, 2, 1);
      px(c, C.fur, 6, 11, 4, 2); px(c, C.white, 7, 12, 2, 1); // 卷尾
      if (f === 0) { px(c, C.shade, 4, 12, 2, 2); px(c, C.shade, 10, 12, 2, 1); }
      else { px(c, C.shade, 4, 12, 2, 1); px(c, C.shade, 10, 12, 2, 2); }
      px(c, C.fur, 4, 2, 8, 5); px(c, C.shade, 5, 3, 6, 1);
      px(c, C.fur, 4, 0, 2, 2); px(c, C.fur, 10, 0, 2, 2);
      px(c, C.strap, 4, 7, 8, 1);
    });
  }

  /* ---------- 人类 NPC：用参数组合出不同的人 ---------- */
  function human(o) {
    const kid = !!o.kid;
    const oy = kid ? 3 : 0;
    function frame(dir, f) {
      return make((c) => {
        const skin = o.skin || '#f2c9a0', hair = o.hair || '#3b2a20', shirt = o.shirt || '#6a8caf', pants = o.pants || '#4a4a5a';
        const hy = 1 + oy;                       // 头顶
        const by = kid ? 9 : 7;                  // 身体起点
        const bh = kid ? 3 : 5;
        const ly = by + bh;                      // 腿
        const ll = kid ? 2 : 2;
        // 腿
        const lA = f === 0 ? 0 : 1, lB = f === 0 ? 1 : 0;
        if (dir === 'left' || dir === 'right') {
          px(c, pants, 6, ly, 2, ll + lA); px(c, pants, 8, ly, 2, ll + lB);
          px(c, o.shoes || '#2b2118', 6, ly + ll + lA - 1, 2, 1); px(c, o.shoes || '#2b2118', 8, ly + ll + lB - 1, 2, 1);
        } else {
          px(c, pants, 5, ly, 2, ll + lA); px(c, pants, 9, ly, 2, ll + lB);
        }
        // 身体
        if (dir === 'left' || dir === 'right') {
          px(c, shirt, 5, by, 6, bh);
          if (o.apron && dir !== 'up') px(c, o.apron, 8, by + 1, 3, bh - 1);
          px(c, skin, 8, by + 1, 2, 1); px(c, shirt, 7, by, 2, bh - 1);
        } else {
          px(c, shirt, 4, by, 8, bh);
          px(c, skin, 3, by + 1, 1, bh - 2); px(c, skin, 12, by + 1, 1, bh - 2);
          if (o.apron && dir === 'down') px(c, o.apron, 5, by + 1, 6, bh - 1);
          if (o.scarf) px(c, o.scarf, 5, by, 6, 1);
        }
        if (o.cane && dir !== 'up') px(c, '#7a5230', dir === 'left' ? 3 : 12, by + 2, 1, bh + 2);
        // 头
        const hx = dir === 'left' || dir === 'right' ? 5 : 5;
        px(c, skin, hx, hy + 1, 6, 5);
        // 头发
        const st = o.style || 'short';
        if (st !== 'bald') px(c, hair, hx, hy, 6, 2);
        if (st === 'bald') { px(c, hair, hx, hy + 2, 1, 2); px(c, hair, hx + 5, hy + 2, 1, 2); }
        if (st === 'long') { px(c, hair, hx - 0, hy + 1, 1, 6); px(c, hair, hx + 5, hy + 1, 1, 6); }
        if (st === 'bun') { px(c, hair, hx + 2, hy - 1, 2, 1); px(c, hair, hx, hy + 1, 1, 2); px(c, hair, hx + 5, hy + 1, 1, 2); }
        if (st === 'pigtails') { px(c, hair, hx - 1, hy + 2, 1, 3); px(c, hair, hx + 6, hy + 2, 1, 3); px(c, '#e05a6a', hx - 1, hy + 2); px(c, '#e05a6a', hx + 6, hy + 2); }
        if (o.hat) { px(c, o.hat, hx - 1, hy, 8, 1); px(c, o.hat, hx, hy - 1, 6, 1); }
        if (dir === 'up') {
          px(c, hair, hx, hy, 6, st === 'bald' ? 2 : 5);
          if (st === 'bald') px(c, skin, hx + 1, hy, 4, 2);
          if (o.hat) { px(c, o.hat, hx - 1, hy, 8, 1); px(c, o.hat, hx, hy - 1, 6, 1); }
        } else if (dir === 'down') {
          px(c, '#2b2118', hx + 1, hy + 3); px(c, '#2b2118', hx + 4, hy + 3);
          if (o.glasses) { px(c, '#5a6470', hx, hy + 3, 6, 1); px(c, '#cfe3f0', hx + 1, hy + 3); px(c, '#cfe3f0', hx + 4, hy + 3); }
          if (o.beard) px(c, o.beard, hx + 1, hy + 5, 4, 1);
          if (o.blush) { px(c, '#f0a0a0', hx, hy + 4); px(c, '#f0a0a0', hx + 5, hy + 4); }
          if (st === 'short' || st === 'long' || st === 'pigtails') px(c, hair, hx, hy + 2, 1, 1), px(c, hair, hx + 5, hy + 2, 1, 1);
        } else {
          // 侧面（朝右画，朝左时镜像）
          px(c, hair, hx, hy, 3, 4);
          px(c, '#2b2118', hx + 4, hy + 3);
          if (o.glasses) px(c, '#5a6470', hx + 3, hy + 3, 3, 1);
          if (o.beard) px(c, o.beard, hx + 3, hy + 5, 3, 1);
          px(c, skin, hx + 6, hy + 3);
        }
      });
    }
    const right = [frame('right', 0), frame('right', 1)];
    return {
      down: [frame('down', 0), frame('down', 1)],
      up: [frame('up', 0), frame('up', 1)],
      right,
      left: right.map(G.mirror),
    };
  }

  /* ---------- 煤球：一只黑猫 ---------- */
  function cat() {
    function f(n) {
      return make((c) => {
        const k = '#2a2a33', hi = '#45455a';
        px(c, k, 4, 9, 7, 3); px(c, hi, 5, 9, 5, 1);
        px(c, k, 3, 4 + n, 1, 6 - n); px(c, k, 2, 4 + n, 1, 1);
        px(c, k, 4, 12, 1, 2); px(c, k, 9, 12, 1, 2); px(c, k, 6, 12, 1, 1 + n); px(c, k, 8, 12, 1, 2 - n);
        px(c, k, 9, 5, 5, 4); px(c, k, 9, 4); px(c, k, 13, 4);
        px(c, '#f2c14e', 10, 6); px(c, '#f2c14e', 12, 6); px(c, '#e88f8f', 11, 8);
      });
    }
    const right = [f(0), f(1)];
    return { right, left: right.map(G.mirror), down: right, up: right };
  }

  function dog() {
    const right = [dogSide(0), dogSide(1)];
    return { right, left: right.map(G.mirror), down: [dogDown(0), dogDown(1)], up: [dogUp(0), dogUp(1)] };
  }

  /* 老周：在疗养院的老人（坐轮椅） */
  function oldZhouChair() {
    const base = human({ hair: '#d8d8d8', style: 'bald', shirt: '#3f5f8a', pants: '#3a3a44', glasses: true, beard: '#d8d8d8' });
    const { c, ctx } = G.canvas(S, S);
    ctx.drawImage(base.down[0], 0, 0);
    px(ctx, '#7c7c86', 2, 10, 2, 5); px(ctx, '#7c7c86', 12, 10, 2, 5); px(ctx, '#55555f', 3, 13, 10, 1);
    const chair = G.outline(c);
    return { down: [chair, chair], up: [chair, chair], left: [chair, chair], right: [chair, chair] };
  }

  const cache = {};
  return {
    get(key, def) {
      if (cache[key]) return cache[key];
      let s;
      if (key === 'dog') s = dog();
      else if (key === 'cat') s = cat();
      else if (key === 'zhou-chair') s = oldZhouChair();
      else s = human(def || {});
      cache[key] = s;
      return s;
    },
  };
})();
