/* 栖湾镇地图
   地形字符：g 草地  h 花坡草地  f 野花  p 土路  o 石板广场  s 沙滩  w 水
             b 桥  k 栈桥  t 树  u 灌木  e 篱笆  r 礁石
   不可通行：w t u e r、建筑、标了 solid 的道具、NPC。
   想改地图：改 build() 里的画刷调用即可，坐标单位是格（16px）。 */
G.MAPS = G.MAPS || {};
G.WORLD = G.MAPS.town = {
  id: 'town', name: '栖湾镇',
  w: 80, h: 44,
  spawn: { x: 17, y: 23, dir: 'down' },
  // 走到这些格子上会切换地图
  warps: [{ x: 19, y: 0, to: 'woods', tx: 20, ty: 26, dir: 'up' }],

  build(m) {
    m.fill('g');
    // 海与沙滩
    m.rect(0, 38, 80, 6, 'w');
    m.rect(1, 35, 58, 3, 's');
    // v1.1 灯塔岬（东扩）：海岸线向北收，灯塔立在岬角上
    m.rect(58, 33, 22, 5, 'w');
    m.rect(58, 31, 18, 2, 's');
    m.rect(76, 6, 4, 32, 'w');
    m.rect(74, 12, 2, 19, 's');
    [[61, 31], [64, 30], [62, 32], [69, 32], [75, 29], [74, 26], [59, 32]].forEach(([x, y]) => m.set(x, y, 'r'));
    // 小河（从北向南汇入海）
    m.rect(22, 2, 2, 36, 'w');
    // 花坡
    m.rect(37, 2, 21, 13, 'h');
    m.scatter(37, 2, 21, 13, 'f', 0.12, 'h');
    m.rect(37, 15, 20, 1, 'u');
    // 主路、广场、各条小路
    m.rect(3, 24, 64, 2, 'p');
    m.rect(66, 26, 2, 5, 'p');
    m.rect(66, 31, 7, 1, 'p');
    // v1.1 往北林的小路（地图顶端是传送口）
    m.rect(19, 0, 1, 14, 'p');
    m.rect(25, 18, 10, 11, 'o');
    m.rect(26, 12, 8, 3, 'o');
    m.rect(29, 15, 2, 3, 'p');
    m.rect(29, 29, 2, 6, 'p');
    m.rect(17, 23, 1, 1, 'p');
    m.rect(9, 13, 1, 11, 'p');
    m.rect(15, 14, 11, 1, 'p');
    m.rect(12, 26, 1, 9, 'p');
    m.rect(41, 8, 1, 16, 'p');
    m.rect(42, 8, 4, 1, 'p');
    m.rect(42, 11, 12, 1, 'p');
    m.rect(53, 8, 1, 3, 'p');
    m.rect(37, 23, 1, 1, 'p'); m.rect(45, 23, 1, 1, 'p');
    // 桥与栈桥
    m.rect(22, 24, 2, 2, 'b');
    m.rect(22, 14, 2, 1, 'b');
    m.rect(12, 38, 1, 5, 'k');
    // 学校操场的篱笆（下方留门）
    m.frame(4, 13, 11, 5, 'e');
    m.rect(9, 17, 1, 1, 'p'); m.rect(9, 13, 1, 1, 'p');
    // 白房子的篱笆（南侧留门，门是道具 gate）
    m.rect(49, 9, 9, 1, 'e');
    m.rect(49, 2, 1, 7, 'e');
    m.rect(58, 2, 1, 8, 'e'); m.rect(54, 9, 5, 1, 'e');
    m.rect(53, 9, 1, 1, 'p');
    // 东滩礁石
    [[48, 35], [49, 36], [55, 35], [56, 36], [50, 34], [57, 35], [46, 36], [54, 37]].forEach(([x, y]) => m.set(x, y, 'r'));
    // 四周的树
    m.rect(0, 0, 80, 2, 't'); m.rect(0, 0, 2, 35, 't');
    m.set(19, 0, 'p'); m.set(19, 1, 'p');
    // 随机树林（避开路、建筑等），用固定种子保证每次一样
    m.forest(0.09, 7);
    // 几处手工点缀
    [[5, 4], [13, 5], [2, 20], [3, 28], [7, 27], [18, 30], [26, 32], [34, 33], [36, 30], [44, 29], [26, 6], [34, 7], [24, 9], [35, 11]].forEach(([x, y]) => m.set(x, y, 't'));
    [[16, 16], [20, 16], [34, 16], [24, 21], [24, 22]].forEach(([x, y]) => m.set(x, y, 'u'));
  },

  // 建筑：x,y 左上角，w,h 宽高（格），door 门所在列（相对）
  buildings: [
    { id: 'post', name: '栖湾邮局', x: 14, y: 18, w: 7, h: 5, door: 3, icon: 'post', roof: '#3f6fa0', roofD: '#2c5078', roofHi: '#5a8cc0', wall: '#efe2c8', chimney: true, enter: { to: 'post_in', x: 7, y: 7, dir: 'up' } },
    { id: 'school', name: '栖湾小学', x: 5, y: 8, w: 9, h: 5, door: 4, icon: 'book', roof: '#c47a3c', roofD: '#8f5428', roofHi: '#e09a5a', wall: '#f3ead6' },
    { id: 'bakery', name: '林记面包', x: 35, y: 18, w: 6, h: 5, door: 2, icon: 'bread', roof: '#b5533c', awning: '#c0392b', boxes: true, enter: { to: 'bakery_in', x: 6, y: 6, dir: 'up' }, lock: 'f:lin_warm' },
    { id: 'shop', name: '钱记小卖部', x: 43, y: 18, w: 5, h: 5, door: 2, icon: 'shop', roof: '#4f8a3a', roofD: '#386628', roofHi: '#6fae55', awning: '#4f8a3a' },
    { id: 'hut', name: '渔具屋', x: 5, y: 30, w: 4, h: 4, door: 1, roof: '#7a6a5a', roofD: '#5a4c3e', roofHi: '#9a8a78', wall: '#d9c8a8' },
    { id: 'cottage', name: '苏婆婆的小屋', x: 43, y: 4, w: 5, h: 4, door: 2, icon: 'home', roof: '#9a5aa8', roofD: '#6e3f7a', roofHi: '#b87ac6', boxes: true, chimney: true },
    { id: 'carehome', name: '白房子疗养院', x: 50, y: 3, w: 6, h: 5, door: 3, icon: 'cross', roof: '#e8e8e0', roofD: '#b8b8b0', roofHi: '#ffffff', wall: '#f6f6f0' },
    { id: 'tower', name: '钟楼', x: 28, y: 6, w: 3, h: 6, door: 1, special: 'clock', enter: { to: 'tower_in', x: 5, y: 7, dir: 'up' }, lock: 'd:chen' },
    { id: 'lighthouse', name: '灯塔', x: 71, y: 25, w: 3, h: 6, door: 1, special: 'lighthouse', enter: { to: 'lighthouse_in', x: 4, y: 10, dir: 'up' }, lock: 'i:lhkey | f:light_on' },
    { id: 'tanghut', name: '守灯人小屋', x: 62, y: 26, w: 4, h: 4, door: 1, roof: '#4f74a8', roofD: '#3a5780', roofHi: '#6f93c4', wall: '#e8e0d0' },
  ],

  // 道具。solid 挡路；if 是显示条件；talk 指向 story 里的对话入口
  props: [
    { kind: 'mailbox', x: 20, y: 23, solid: true, talk: 'obj_mailbox' },
    { kind: 'board', x: 13, y: 23, solid: true, talk: 'obj_postboard' },
    { kind: 'lamp', x: 25, y: 18, solid: true }, { kind: 'lamp', x: 34, y: 18, solid: true },
    { kind: 'lamp', x: 25, y: 28, solid: true }, { kind: 'lamp', x: 34, y: 28, solid: true },
    { kind: 'well', x: 27, y: 20, solid: true, talk: 'obj_well' },
    { kind: 'stall', x: 26, y: 27, solid: true, talk: 'obj_stall' }, { kind: 'stall', x: 33, y: 27, solid: true, talk: 'obj_stall' },
    { kind: 'bench', x: 32, y: 20, solid: true },
    { kind: 'sign', x: 28, y: 15, solid: true, talk: 'obj_sign_tower' },
    { kind: 'sign', x: 40, y: 16, solid: true, talk: 'obj_sign_hill' },
    { kind: 'sign', x: 11, y: 26, solid: true, talk: 'obj_sign_harbor' },
    { kind: 'board', x: 38, y: 23, solid: true, talk: 'obj_bakery_closed' },
    { kind: 'bench', x: 51, y: 22, solid: true },
    { kind: 'busstop', x: 54, y: 22, solid: true, talk: 'obj_busstop' },
    { kind: 'stall', x: 47, y: 23, solid: true, talk: 'obj_shopstall' },
    { kind: 'crate', x: 10, y: 36, solid: true }, { kind: 'barrel', x: 11, y: 36, solid: true },
    { kind: 'crate', x: 14, y: 36, solid: true, talk: 'obj_crate' },
    { kind: 'boat', x: 14, y: 40, solid: true },
    { kind: 'easel', x: 24, y: 27, solid: true, talk: 'obj_easel', if: '!i:easel & !f:mu_go' },
    { kind: 'flowerpot', x: 42, y: 7, solid: true }, { kind: 'flowerpot', x: 48, y: 7, solid: true },
    { kind: 'bowl', x: 21, y: 22, solid: false, talk: 'obj_bowl' },
    // 可拾取
    { kind: 'crane', x: 5, y: 18, talk: 'pick_crane1', if: '!f:crane1 & f:yu_missing' },
    { kind: 'crane', x: 3, y: 13, talk: 'pick_crane2', if: '!f:crane2 & f:yu_missing' },
    { kind: 'crane', x: 3, y: 8, talk: 'pick_crane3', if: '!f:crane3 & f:yu_missing' },
    { kind: 'photo', x: 39, y: 17, talk: 'pick_photo', if: '!i:photo & !f:photo_used' },
    { kind: 'dandelion', x: 47, y: 12, talk: 'pick_dandelion', if: '!i:dandelion & !f:dandelion_used' },
    { kind: 'gear', x: 42, y: 19, talk: 'pick_gear_alley', if: 'f:cat_gear_hint & !f:gear_alley & !f:clock_fixed' },
    { kind: 'gate', x: 53, y: 9, solid: true, talk: 'obj_gate', if: '!f:gate_open' },
    { kind: 'gateOpen', x: 53, y: 9, if: 'f:gate_open' },
    { kind: 'bench', x: 51, y: 8, solid: true },
    // v1.1 北林入口、灯塔岬
    { kind: 'sign', x: 18, y: 4, solid: true, talk: 'obj_sign_woods' },
    { kind: 'sign', x: 65, y: 23, solid: true, talk: 'obj_sign_cape' },
    { kind: 'key', x: 63, y: 32, talk: 'pick_lhkey', if: 'f:light_need & !i:lhkey & !f:light_on' },
    { kind: 'boat', x: 70, y: 35, solid: true },
    { kind: 'barrel', x: 61, y: 30, solid: true },
  ],

  // 区域名（进入时顶部出现横幅）
  areas: [
    { name: '栖湾邮局', x: 13, y: 16, w: 9, h: 9 },
    { name: '码头', x: 2, y: 29, w: 20, h: 15 },
    { name: '栖湾小学', x: 2, y: 2, w: 14, h: 17 },
    { name: '钟楼', x: 24, y: 3, w: 12, h: 13 },
    { name: '中心广场', x: 24, y: 16, w: 11, h: 15 },
    { name: '商业街', x: 35, y: 16, w: 15, h: 9 },
    { name: '车站', x: 50, y: 16, w: 8, h: 10 },
    { name: '花坡', x: 37, y: 2, w: 12, h: 13 },
    { name: '白房子', x: 49, y: 2, w: 9, h: 11 },
    { name: '东滩', x: 36, y: 26, w: 22, h: 18 },
    { name: '灯塔岬', x: 58, y: 2, w: 22, h: 42 },
    { name: '北林小径', x: 16, y: 0, w: 6, h: 8 },
    { name: '河边', x: 18, y: 26, w: 18, h: 18 },
  ],
};
