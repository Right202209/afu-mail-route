/* v1.1 新地图：北林、四个室内（邮局、钟楼、面包店、灯塔）。
   室内字符：W 墙  F 木地板  K 石地板  T 瓷砖地  M 门垫（踩上去出门） */
(function () {
  function room(m, w, h, floor, doorX) {
    m.fill('W');
    m.rect(1, 2, w - 2, h - 3, floor);
    m.set(doorX, h - 1, 'M');
  }

  G.MAPS.post_in = {
    id: 'post_in', name: '邮局里', indoor: true, w: 14, h: 9,
    palette: { wall: '#c9b48a', wallD: '#a8915f', trim: '#5c3d22' },
    build(m) { room(m, 14, 9, 'F', 7); },
    warps: [{ x: 7, y: 8, to: 'town', tx: 17, ty: 23, dir: 'down' }],
    buildings: [],
    props: [
      { kind: 'sorter', x: 2, y: 2, solid: true, talk: 'obj_sorter' },
      { kind: 'sorter', x: 3, y: 2, solid: true, talk: 'obj_sorter' },
      { kind: 'sorter', x: 4, y: 2, solid: true, talk: 'obj_sorter' },
      { kind: 'crack', x: 5, y: 1, solid: true, talk: 'obj_crack' },
      { kind: 'calendar', x: 8, y: 1, solid: true, talk: 'obj_calendar' },
      { kind: 'window', x: 10, y: 1, solid: true },
      { kind: 'desk', x: 10, y: 3, solid: true, talk: 'obj_logbook' },
      { kind: 'cabinet', x: 12, y: 2, solid: true, talk: 'obj_drawer' },
      { kind: 'counter', x: 2, y: 5, solid: true, talk: 'obj_counter' },
      { kind: 'counter', x: 3, y: 5, solid: true, talk: 'obj_counter' },
      { kind: 'counter', x: 4, y: 5, solid: true, talk: 'obj_counter' },
      { kind: 'dogbed', x: 11, y: 6, solid: false, talk: 'obj_dogbed' },
      { kind: 'rug', x: 7, y: 5 }, { kind: 'rug', x: 7, y: 6 },
    ],
    areas: [],
  };

  G.MAPS.tower_in = {
    id: 'tower_in', name: '钟楼里', indoor: true, w: 10, h: 9,
    palette: { wall: '#9a948a', wallD: '#7d776c', trim: '#4a4038' },
    build(m) { room(m, 10, 9, 'K', 5); },
    warps: [{ x: 5, y: 8, to: 'town', tx: 29, ty: 12, dir: 'down' }],
    buildings: [],
    props: [
      { kind: 'clockwork', x: 3, y: 2, solid: true, talk: 'obj_clockwork' },
      { kind: 'clockwork', x: 6, y: 2, solid: true, talk: 'obj_clockwork' },
      { kind: 'ladder', x: 1, y: 2, solid: true, talk: 'obj_ladder' },
      { kind: 'desk', x: 8, y: 4, solid: true, talk: 'obj_workbench' },
      { kind: 'crate', x: 1, y: 6, solid: true },
      { kind: 'barrel', x: 8, y: 6, solid: true },
    ],
    areas: [],
  };

  G.MAPS.bakery_in = {
    id: 'bakery_in', name: '林记面包', indoor: true, w: 12, h: 8,
    palette: { wall: '#e8c8a8', wallD: '#c9a07a', trim: '#7a5230' },
    build(m) { room(m, 12, 8, 'T', 6); },
    warps: [{ x: 6, y: 7, to: 'town', tx: 37, ty: 23, dir: 'down' }],
    buildings: [],
    props: [
      { kind: 'oven', x: 2, y: 2, solid: true, talk: 'obj_oven' },
      { kind: 'counter', x: 4, y: 3, solid: true }, { kind: 'counter', x: 5, y: 3, solid: true },
      { kind: 'counter', x: 6, y: 3, solid: true, talk: 'obj_bakery_counter' }, { kind: 'counter', x: 7, y: 3, solid: true },
      { kind: 'frame', x: 8, y: 1, solid: true, talk: 'obj_photowall' },
      { kind: 'shelf', x: 10, y: 2, solid: true, talk: 'obj_breadshelf' },
      { kind: 'table', x: 9, y: 5, solid: true },
      { kind: 'flowerpot', x: 1, y: 6, solid: true },
    ],
    areas: [],
  };

  G.MAPS.lighthouse_in = {
    id: 'lighthouse_in', name: '灯塔里', indoor: true, w: 9, h: 12,
    palette: { wall: '#d8d4cc', wallD: '#b0aaa0', trim: '#c0392b' },
    build(m) { room(m, 9, 12, 'K', 4); },
    warps: [{ x: 4, y: 11, to: 'town', tx: 72, ty: 31, dir: 'down' }],
    buildings: [],
    props: [
      { kind: 'beacon', x: 4, y: 2, solid: true, talk: 'obj_beacon' },
      { kind: 'window', x: 7, y: 1, solid: true, talk: 'obj_lh_window' },
      { kind: 'window', x: 1, y: 1, solid: true, talk: 'obj_lh_window' },
      { kind: 'stairs', x: 1, y: 4, solid: true }, { kind: 'stairs', x: 1, y: 5, solid: true }, { kind: 'stairs', x: 1, y: 6, solid: true },
      { kind: 'stairs', x: 7, y: 6, solid: true }, { kind: 'stairs', x: 7, y: 7, solid: true }, { kind: 'stairs', x: 7, y: 8, solid: true },
      { kind: 'crate', x: 1, y: 9, solid: true, talk: 'obj_lh_crate' },
    ],
    areas: [],
  };

  /* 北林：一条分岔的林间小路，尽头是树洞邮局 */
  G.MAPS.woods = {
    id: 'woods', name: '北林', w: 40, h: 28,
    spawn: { x: 20, y: 26, dir: 'up' },
    build(m) {
      m.fill('g');
      m.scatter(0, 0, 40, 28, 't', 0.6);
      m.rect(0, 0, 40, 1, 't'); m.rect(0, 0, 1, 28, 't'); m.rect(39, 0, 1, 28, 't'); m.rect(0, 27, 40, 1, 't');
      // 小路
      m.rect(20, 18, 1, 10, 'p');
      m.rect(8, 18, 25, 1, 'p');
      m.rect(8, 9, 1, 9, 'p');
      m.rect(32, 8, 1, 10, 'p');
      m.rect(20, 8, 12, 1, 'p');
      m.rect(20, 6, 1, 2, 'p');
      // 池塘
      m.rect(2, 2, 10, 8, 'g'); m.rect(3, 3, 6, 4, 'w');
      // 树洞所在的林间空地
      m.rect(14, 1, 13, 6, 'h');
      m.scatter(14, 1, 13, 6, 'f', 0.15, 'h');
      // 护林员小屋前
      m.rect(21, 19, 8, 5, 'g'); m.rect(21, 23, 4, 1, 'p');
      // 东边死胡同：一片蘑菇地
      m.rect(33, 3, 5, 6, 'h'); m.scatter(33, 3, 5, 6, 'f', 0.3, 'h'); m.rect(32, 4, 1, 4, 'p');
    },
    warps: [{ x: 20, y: 27, to: 'town', tx: 19, ty: 1, dir: 'down' }],
    buildings: [
      { id: 'rangerhut', name: '护林员小屋', x: 23, y: 19, w: 4, h: 4, door: 1, roof: '#6b4a2b', roofD: '#4f351f', roofHi: '#8a6440', wall: '#c9b48a' },
    ],
    props: [
      { kind: 'hollow', x: 20, y: 3, solid: true, talk: 'obj_hollow' },
      { kind: 'sign', x: 21, y: 17, solid: true, talk: 'obj_sign_fork' },
      { kind: 'mushroom', x: 35, y: 5, talk: 'obj_mushroom' },
      { kind: 'bench', x: 9, y: 9, solid: true },
    ],
    areas: [{ name: '树洞空地', x: 13, y: 0, w: 15, h: 8 }, { name: '林中小池', x: 1, y: 1, w: 11, h: 10 }],
  };

  /* 12 枚邮票：栖湾风物系列 */
  G.STAMPS = [
    { id: 's1', name: '栖湾邮局', map: 'post_in', x: 2, y: 7, desc: '蓝屋顶，烟囱冒着烟。面值八分。' },
    { id: 's2', name: '四点十分', map: 'tower_in', x: 8, y: 7, desc: '停住的钟。背面有人用铅笔写：会再走的。' },
    { id: 's3', name: '桂花卷', map: 'bakery_in', x: 10, y: 6, desc: '画得很香。' },
    { id: 's4', name: '灯塔', map: 'lighthouse_in', x: 7, y: 9, desc: '红白条纹，一道光扫过海面。' },
    { id: 's5', name: '大樟树', map: 'town', x: 11, y: 4, desc: '树下坐着一个很小的人影。' },
    { id: 's6', name: '栈桥', map: 'town', x: 12, y: 39, desc: '尽头有个背影，在补网。' },
    { id: 's7', name: '花坡', map: 'town', x: 55, y: 13, desc: '紫色屋顶，漫山的野花。' },
    { id: 's8', name: '东滩礁石', map: 'town', x: 53, y: 37, desc: '一块礁石，像一个坐着发呆的人。' },
    { id: 's9', name: '末班车', map: 'town', x: 56, y: 23, desc: '傍晚六点，车灯亮着。' },
    { id: 's10', name: '树洞', map: 'woods', x: 21, y: 4, desc: '树洞里塞满了纸条。' },
    { id: 's11', name: '林中小池', map: 'woods', x: 10, y: 8, desc: '水面上漂着一片樟树叶。' },
    { id: 's12', name: '老井', map: 'town', x: 26, y: 22, desc: '往下汪一声，会有回声。' },
  ];
  G.STAMPS.forEach((st) => {
    G.MAPS[st.map].props.push({ kind: 'stamp', x: st.x, y: st.y, stamp: st.id, if: '!f:st_' + st.id });
  });
})();
