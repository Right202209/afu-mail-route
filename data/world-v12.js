/* v1.2 新地图：钱记小卖部、栖湾小学教室；西滩的漂流瓶、车站的失物招领箱。 */
(function () {
  const T = G.MAPS.town;
  const bd = (id) => T.buildings.find((b) => b.id === id);
  bd('shop').enter = { to: 'shop_in', x: 5, y: 6, dir: 'up' };
  bd('school').enter = { to: 'school_in', x: 7, y: 7, dir: 'up' };

  T.props.push(
    { kind: 'bottle', x: 5, y: 36, talk: 'pick_bottle', if: 'c:delivered>=1 & !f:bottle_got' },
    { kind: 'lostbox', x: 57, y: 23, solid: true, talk: 'obj_lostbox' },
  );

  G.MAPS.shop_in = {
    id: 'shop_in', name: '钱记小卖部', indoor: true, w: 10, h: 8,
    palette: { wall: '#cfe0b8', wallD: '#a8c090', trim: '#4f6a3a' },
    build(m) { m.fill('W'); m.rect(1, 2, 8, 5, 'F'); m.set(5, 7, 'M'); },
    warps: [{ x: 5, y: 7, to: 'town', tx: 45, ty: 23, dir: 'down' }],
    buildings: [],
    props: [
      { kind: 'shelf', x: 1, y: 2, solid: true, talk: 'obj_shop_shelf' },
      { kind: 'shelf', x: 2, y: 2, solid: true, talk: 'obj_shop_shelf' },
      { kind: 'shelf', x: 3, y: 2, solid: true, talk: 'obj_shop_shelf' },
      { kind: 'counter', x: 6, y: 3, solid: true, talk: 'obj_shop_book' },
      { kind: 'counter', x: 7, y: 3, solid: true, talk: 'obj_shop_book' },
      { kind: 'cabinet', x: 8, y: 2, solid: true, talk: 'obj_shop_postcards' },
      { kind: 'crate', x: 1, y: 6, solid: true }, { kind: 'barrel', x: 8, y: 6, solid: true },
      { kind: 'window', x: 5, y: 1, solid: true },
    ],
    areas: [],
  };

  G.MAPS.school_in = {
    id: 'school_in', name: '栖湾小学 · 教室', indoor: true, w: 14, h: 9,
    palette: { wall: '#efe4c8', wallD: '#d0c09a', trim: '#7a5230' },
    build(m) { m.fill('W'); m.rect(1, 2, 12, 6, 'F'); m.set(7, 8, 'M'); },
    warps: [{ x: 7, y: 8, to: 'town', tx: 9, ty: 13, dir: 'down' }],
    buildings: [],
    props: [
      { kind: 'blackboard', x: 6, y: 1, solid: true, talk: 'obj_blackboard' },
      { kind: 'blackboard', x: 7, y: 1, solid: true, talk: 'obj_blackboard' },
      { kind: 'window', x: 2, y: 1, solid: true }, { kind: 'window', x: 11, y: 1, solid: true },
      { kind: 'desk', x: 7, y: 3, solid: true, talk: 'obj_teacher_desk' },
      { kind: 'table', x: 3, y: 5, solid: true }, { kind: 'table', x: 5, y: 5, solid: true, talk: 'obj_yu_desk' },
      { kind: 'table', x: 9, y: 5, solid: true }, { kind: 'table', x: 11, y: 5, solid: true },
      { kind: 'shelf', x: 12, y: 2, solid: true, talk: 'obj_school_shelf' },
      { kind: 'flowerpot', x: 1, y: 7, solid: true },
    ],
    areas: [],
  };
})();
