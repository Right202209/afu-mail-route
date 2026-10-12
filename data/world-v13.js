/* v1.3 新室内：苏婆婆的小屋、渔具屋。 */
(function () {
  const T = G.MAPS.town;
  const bd = (id) => T.buildings.find((b) => b.id === id);
  bd('cottage').enter = { to: 'cottage_in', x: 5, y: 6, dir: 'up' };
  bd('hut').enter = { to: 'hut_in', x: 4, y: 6, dir: 'up' };

  G.MAPS.cottage_in = {
    id: 'cottage_in', name: '苏婆婆的小屋', indoor: true, w: 10, h: 8,
    palette: { wall: '#e4d4ec', wallD: '#c4aed0', trim: '#6e3f7a' },
    build(m) { m.fill('W'); m.rect(1, 2, 8, 5, 'F'); m.set(5, 7, 'M'); },
    warps: [{ x: 5, y: 7, to: 'town', tx: 45, ty: 8, dir: 'down' }],
    buildings: [],
    props: [
      { kind: 'window', x: 3, y: 1, solid: true }, { kind: 'window', x: 7, y: 1, solid: true },
      { kind: 'cabinet', x: 1, y: 2, solid: true, talk: 'obj_su_box' },
      { kind: 'frame', x: 5, y: 1, solid: true, talk: 'obj_su_photo' },
      { kind: 'table', x: 6, y: 4, solid: true, talk: 'obj_su_table' },
      { kind: 'rug', x: 4, y: 5 },
      { kind: 'flowerpot', x: 8, y: 2, solid: true, talk: 'obj_su_flower' },
      { kind: 'shelf', x: 8, y: 6, solid: true, talk: 'obj_su_radio' },
    ],
    areas: [],
  };

  G.MAPS.hut_in = {
    id: 'hut_in', name: '渔具屋', indoor: true, w: 8, h: 8,
    palette: { wall: '#cbbba0', wallD: '#a8987c', trim: '#5a4c3e' },
    build(m) { m.fill('W'); m.rect(1, 2, 6, 5, 'F'); m.set(4, 7, 'M'); },
    warps: [{ x: 4, y: 7, to: 'town', tx: 6, ty: 34, dir: 'down' }],
    buildings: [],
    props: [
      { kind: 'chart', x: 3, y: 1, solid: true, talk: 'obj_chart' },
      { kind: 'net', x: 1, y: 2, solid: true, talk: 'obj_net' },
      { kind: 'barrel', x: 6, y: 2, solid: true, talk: 'obj_hut_barrel' },
      { kind: 'crate', x: 1, y: 6, solid: true },
      { kind: 'table', x: 5, y: 5, solid: true, talk: 'obj_hut_lamp' },
    ],
    areas: [],
  };
})();
