/* 声音：全部用 WebAudio 现场合成，不需要任何音频文件 */
G.audio = (function () {
  let ac = null, master = null, musicGain = null, on = true, musicTimer = null, step = 0;

  function init() {
    if (ac) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ac = new AC();
    master = ac.createGain(); master.gain.value = 0.5; master.connect(ac.destination);
    musicGain = ac.createGain(); musicGain.gain.value = 0.16; musicGain.connect(master);
  }

  function tone(freq, dur, type, vol, when, dest) {
    if (!ac || !on) return;
    const t = ac.currentTime + (when || 0);
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type || 'square'; o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.15, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest || master);
    o.start(t); o.stop(t + dur + 0.02);
    return o;
  }

  const sfx = {
    blip() { tone(520 + Math.random() * 60, 0.04, 'square', 0.03); },
    select() { tone(660, 0.06, 'square', 0.06); },
    confirm() { tone(523, 0.07, 'square', 0.07); tone(784, 0.1, 'square', 0.07, 0.06); },
    bump() { tone(110, 0.08, 'triangle', 0.12); },
    step() { tone(180 + Math.random() * 30, 0.03, 'triangle', 0.025); },
    bark() {
      if (!ac || !on) return;
      const o = tone(420, 0.16, 'sawtooth', 0.12);
      if (o) { o.frequency.exponentialRampToValueAtTime(240, ac.currentTime + 0.14); }
      const o2 = tone(500, 0.12, 'sawtooth', 0.09, 0.2);
      if (o2) { o2.frequency.exponentialRampToValueAtTime(280, ac.currentTime + 0.32); }
    },
    item() { [659, 784, 988, 1319].forEach((f, i) => tone(f, 0.12, 'square', 0.06, i * 0.07)); },
    letter() { [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, 0.16, 'triangle', 0.12, i * 0.09)); },
    memory() { [392, 494, 587, 740, 880].forEach((f, i) => tone(f, 0.9, 'sine', 0.07, i * 0.16)); },
    bell() { [0, 1.1, 2.2].forEach((w) => { tone(392, 2.2, 'sine', 0.18, w); tone(784, 1.4, 'sine', 0.06, w); tone(588, 1.8, 'sine', 0.05, w); }); },
  };

  // 一段很轻的五声音阶循环，当作小镇的背景乐
  const MEL = [0, 2, 4, 7, 4, 2, 9, 7, 4, 2, 0, -3, 0, 2, 4, 2, 7, 9, 7, 4, 2, 4, 2, 0, -1, -1, -1, -1];
  const BASS = [0, 0, -5, -5, -3, -3, -7, -7];
  function noteHz(n) { return 392 * Math.pow(2, n / 12); }
  function tick() {
    if (!ac || !on) return;
    const n = MEL[step % MEL.length];
    if (n >= -5 && n !== -1) tone(noteHz(n), 0.34, 'triangle', 0.5, 0, musicGain);
    if (step % 4 === 0) tone(noteHz(BASS[(step / 4) % BASS.length] - 24), 0.9, 'sine', 0.6, 0, musicGain);
    step++;
  }
  function startMusic() {
    init(); if (musicTimer || !ac) return;
    musicTimer = setInterval(tick, 360);
  }
  function stopMusic() { clearInterval(musicTimer); musicTimer = null; }

  return {
    init, sfx, startMusic, stopMusic,
    play(name) { init(); if (ac && ac.state === 'suspended') ac.resume(); sfx[name] && sfx[name](); },
    toggle() { on = !on; if (!on) stopMusic(); else startMusic(); return on; },
    get on() { return on; },
    set on(v) { on = v; },
  };
})();
