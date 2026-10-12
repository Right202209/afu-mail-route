/* 剧本（六）· v1.3：苏婆婆的小屋、渔具屋、广场接飞盘、成就。 */
(function () {
  const S = G.STORY, N = S.nodes;

  Object.assign(N, {
    /* ===== 苏婆婆的小屋 ===== */
    obj_su_box: { who: 'none', go: [{ if: 'f:su_meet', go: 'su_box2' }, { go: 'su_box1' }] },
    su_box1: { who: 'none', text: ['（樟木箱里是厚厚一摞信。每个信封上都写着“钟楼 陈师傅 收”。）', '（没有一封贴了邮票。最上面那封的日期是昨天。）'] },
    su_box2: { who: 'none', text: ['（樟木箱开着，里面空了。）', '（那一摞信，大概已经交到它们该去的地方了。）'] },
    obj_su_photo: { who: 'none', text: ['（墙上挂着一张黑白照片：钟楼下，一个扎辫子的姑娘，旁边是一个拿扳手的年轻人。）', '（两个人都没看镜头，都在偷偷看对方。）'] },
    obj_su_table: { who: 'none', text: ['（桌上摆着两只茶杯。一只用了很多年，杯沿有个小缺口；另一只是新的，从来没用过。）'] },
    obj_su_flower: { who: 'none', text: ['（窗台上种着一盆桂花。花盆上贴着纸条：“他喜欢这个味道”。）'] },
    obj_su_radio: { who: 'none', go: [{ if: 'f:clock_fixed', go: 'su_radio2' }, { go: 'su_radio1' }] },
    su_radio1: { who: 'none', text: ['（一台旧收音机，指针停在整点报时的频道。）', '（这些年，她大概一直靠它知道几点了。）'] },
    su_radio2: { who: 'none', fx: 'bell', text: ['（收音机没开。窗外传来钟楼的钟声。）', '（她用不着它了。）'] },

    /* ===== 渔具屋 ===== */
    obj_chart: { who: 'none', fx: 'f:chart_seen', text: ['（墙上钉着一张泛黄的海图。栖湾之外，雾里还画着几座岛：盐田岛、钟鸣城、无名礁……）', '（铅笔在一条虚线旁写着：“邮船，每月初一。”后面又添了一句：“停航”。）'] },
    obj_net: { who: 'none', text: ['（一张补了又补的渔网。有几处的结打得特别整齐，看得出是另一个人的手艺。）'] },
    obj_hut_barrel: { who: 'none', text: ['（木桶里塞满了旧信封，全是退回的，每一封都写着“海生 寄”。）', '（……原来老海把它们都收着。）'] },
    obj_hut_lamp: { who: 'none', go: [{ if: 'd:hai', go: 'hut_lamp2' }, { go: 'hut_lamp1' }] },
    hut_lamp1: { who: 'none', text: ['（桌上的马灯擦得锃亮，可灯芯是新的，从没点过。）'] },
    hut_lamp2: { who: 'none', text: ['（马灯点着。灯下压着一张纸，上面只写了两个字：“回来”。）'] },

    /* ===== 接飞盘 ===== */
    jie_frisbee_ask: { who: 'jie', text: ['阿福！阿福！我新买了飞盘！', '陪我玩一会儿嘛，就一会儿！'], choices: [
      { t: '【摇尾巴，蹲好】', fx: 'f:frisbee_try;mini:frisbee', go: 'jie_frisbee_go' },
      { t: '【叼了叼邮包，表示还在上班】', go: 'jie_frisbee_no' }] },
    jie_frisbee_go: { who: 'jie', text: ['好！我扔了啊——看好了！'] },
    jie_frisbee_no: { who: 'jie', text: ['哦……那你下班了再来！我就在广场！'] , fx: 'f:frisbee_try' },
    jie_frisbee_again: { who: 'jie', text: ['再来一局？'], choices: [
      { t: '【摇尾巴，蹲好】', fx: 'mini:frisbee', go: 'jie_frisbee_go' },
      { t: '【摇摇头】', go: 'jie_0' }] },
    jie_frisbee_end: { who: 'jie', go: [{ if: 'c:frisbee_last>=6', go: 'fb_6' }, { if: 'c:frisbee_last>=4', go: 'fb_4' }, { if: 'c:frisbee_last>=1', go: 'fb_1' }, { go: 'fb_0' }] },
    fb_6: { who: 'jie', fx: 'f:frisbee_best;c:kindness+1', text: ['六个全接住了！！', '你比周爷爷扔的时候还厉害！', '……周爷爷以前也陪我玩。他扔得可远了。'] },
    fb_4: { who: 'jie', fx: 'f:frisbee_good', text: ['好厉害！', '下次我要扔得更刁钻一点！'] },
    fb_1: { who: 'jie', text: ['嘿嘿，还行还行。', '是我扔歪了，不怪你。'] },
    fb_0: { who: 'jie', text: ['……一个都没接到？', '你今天是不是太累了？'] },
  });
  // 钟声那句只说一次，之后才轮到飞盘
  const bell = N.jie_hub.go.find((g) => g.go === 'jie_bell');
  bell.if = 'f:clock_fixed & !f:jie_bell_seen';
  N.jie_bell.fx = (N.jie_bell.fx ? N.jie_bell.fx + ';' : '') + 'f:jie_bell_seen';
  N.jie_hub.go.splice(N.jie_hub.go.length - 1, 0,
    { if: '!f:frisbee_try', go: 'jie_frisbee_ask' },
    { if: '!f:frisbee_best', go: 'jie_frisbee_again' });

  /* ---------- 成就（跨存档保存） ---------- */
  S.achievements = [
    { id: 'first', name: '第一封信', desc: '送出第一封信', if: 'c:delivered>=1' },
    { id: 'all5', name: '风雨无阻', desc: '五封信全部送达', if: 'c:delivered>=5' },
    { id: 'mem8', name: '记得', desc: '找回老周全部 8 段记忆', if: 'c:memories>=8' },
    { id: 'honest', name: '守口如瓶', desc: '一封信都没偷看，走到结局', if: 'f:ending & c:peek==0' },
    { id: 'stamps', name: '集邮家', desc: '收集全部 12 枚邮票', if: 'c:stamps>=12' },
    { id: 'light', name: '守灯人', desc: '重新点亮灯塔', if: 'f:light_on' },
    { id: 'tree', name: '树洞先生', desc: '完成北林的树洞邮局', if: 'f:tree_done' },
    { id: 'bottle', name: '最远的邮路', desc: '把回信送往雾岛', if: 'f:bottle_done' },
    { id: 'lost', name: '物归原主', desc: '失物招领箱里的东西都还回去了', if: 'f:lost_shoe & f:lost_glasses & f:lost_keys' },
    { id: 'frisbee', name: '飞盘高手', desc: '接飞盘六个全中', if: 'f:frisbee_best' },
    { id: 'bark', name: '汪汪汪', desc: '叫了 30 声', if: 'c:barks>=30' },
    { id: 'chart', name: '雾里的岛', desc: '在渔具屋看到那张海图', if: 'f:chart_seen' },
  ];
})();
