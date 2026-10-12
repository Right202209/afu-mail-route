/* v1.3 小游戏：广场接飞盘。阿杰扔，阿福左右跑着接。返回接住的个数。 */
G.mini = (function () {
  const W = 320, H = 180, ROUNDS = 6;
  let running = false;

  function frisbee() {
    if (window.__AUTO_MINI != null) return Promise.resolve(window.__AUTO_MINI);
    return new Promise((done) => {
      running = true;
      const box = G.$('#mini'), cv = G.$('#mini-canvas'), c = cv.getContext('2d');
      cv.width = W; cv.height = H; c.imageSmoothingEnabled = false;
      box.classList.remove('hidden');
      const dog = G.sprites.get('dog'), jie = G.sprites.get('jie', G.STORY.npcs.jie.look);
      let x = W / 2, dir = 'up', round = 0, score = 0, t = 0, fly = null, msg = '方向键左右跑，接住飞盘！', msgT = 2, wait = 1.2, last = performance.now(), anim = 0, jump = 0;
      const stopKeys = (a) => { if (!running) return false; if (a === 'act' && jump <= 0) jump = 0.35; return true; };
      G.input.on(stopKeys, 60);
      function throwOne() {
        const tx = 24 + Math.random() * (W - 48), dur = 1.25 + Math.random() * 0.6 - round * 0.05;
        fly = { sx: 40, sy: 40, tx, ty: 150, t: 0, dur, curve: (Math.random() - 0.5) * 120 };
        G.audio.play('select');
      }
      function step(now) {
        const dt = Math.min(0.05, (now - last) / 1000); last = now; t += dt; msgT -= dt; jump -= dt;
        const d = G.input.dir;
        const sp = 150 * (G.input.run ? 1.35 : 1);
        if (d === 'left') { x -= sp * dt; dir = 'left'; anim += dt * 8; } else if (d === 'right') { x += sp * dt; dir = 'right'; anim += dt * 8; } else dir = 'up';
        x = G.clamp(x, 10, W - 10);
        if (!fly) { wait -= dt; if (wait <= 0) { if (round >= ROUNDS) return finish(); round++; throwOne(); } }
        else {
          fly.t += dt;
          const k = fly.t / fly.dur;
          const reach = jump > 0 ? 20 : 13;
          if (k >= 1) {
            const fx = fly.tx;
            if (Math.abs(fx - x) <= reach) { score++; msg = ['接住了！', '漂亮！', '汪！好球！', '阿杰在拍手！'][score % 4]; G.audio.play('item'); }
            else { msg = ['差一点！', '飞盘落在草地上了。', '阿杰：再来！'][round % 3]; G.audio.play('bump'); }
            msgT = 1.1; fly = null; wait = 0.9;
          }
        }
        draw();
        if (running) requestAnimationFrame(step);
      }
      function draw() {
        c.fillStyle = '#8fbf5a'; c.fillRect(0, 0, W, H);
        c.fillStyle = '#a7cf6e'; for (let i = 0; i < 40; i++) c.fillRect((i * 73) % W, (i * 41) % H, 2, 1);
        c.fillStyle = '#c9b8a0'; c.fillRect(0, 0, W, 26);
        c.fillStyle = '#b5a48a'; for (let i = 0; i < W; i += 16) c.fillRect(i, 24, 15, 2);
        c.drawImage(jie.down[0], 32, 28);
        if (fly) {
          const k = Math.min(1, fly.t / fly.dur);
          const gx = G.lerp(fly.sx, fly.tx, k) + Math.sin(k * Math.PI) * fly.curve, gy = G.lerp(fly.sy, fly.ty, k);
          const hgt = Math.sin(k * Math.PI) * 30 + (1 - k) * 10;
          c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(Math.round(gx - 4), Math.round(gy + 2), 8, 2);
          c.fillStyle = '#c0392b'; c.fillRect(Math.round(gx - 5), Math.round(gy - hgt), 10, 3);
          c.fillStyle = '#e8705a'; c.fillRect(Math.round(gx - 3), Math.round(gy - hgt), 6, 1);
          // 落点提示
          c.strokeStyle = 'rgba(255,255,255,.45)'; c.strokeRect(Math.round(fly.tx - 6), fly.ty + 6, 12, 4);
        }
        const jy = jump > 0 ? Math.round(Math.sin((0.35 - jump) / 0.35 * Math.PI) * 8) : 0;
        c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(Math.round(x - 5), 166, 10, 2);
        c.drawImage(dog[dir][Math.floor(anim) % 2], Math.round(x - 8), 152 - jy);
        c.fillStyle = 'rgba(30,22,16,.75)'; c.fillRect(W - 92, 4, 88, 14);
        c.fillStyle = '#f6ecd9'; c.font = '9px ' + getComputedStyle(document.body).fontFamily; c.textAlign = 'right';
        c.fillText(`第 ${Math.min(round, ROUNDS)}/${ROUNDS} 个 · 接住 ${score}`, W - 8, 14);
        if (msgT > 0) { c.textAlign = 'center'; c.fillStyle = 'rgba(30,22,16,.75)'; const w = c.measureText(msg).width + 12; c.fillRect(W / 2 - w / 2, 80, w, 15); c.fillStyle = '#f6ecd9'; c.fillText(msg, W / 2, 91); }
      }
      function finish() {
        running = false;
        box.classList.add('hidden');
        G.input.clear();
        done(score);
      }
      requestAnimationFrame(step);
    });
  }
  return { frisbee, get running() { return running; } };
})();
