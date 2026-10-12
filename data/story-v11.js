/* 剧本（四）· v1.1 扩展：灯塔岬、北林树洞邮局、室内、邮票，以及对旧剧情的补丁。 */
(function () {
  const S = G.STORY, N = S.nodes;

  /* ---------- 新物品 ---------- */
  Object.assign(S.items, {
    lhkey: { name: '灯塔钥匙', desc: '生锈的铜钥匙，挂着一块木牌：“灯塔”。' },
    lamp_oil: { name: '灯油', desc: '钱叔送的一壶灯油。“灯亮了，我请他喝酒。”' },
    treeletters: { name: '树洞里的纸条', desc: '十七张孩子们写的纸条，和一本“树洞先生的回信本”。字是老周的。' },
  });

  /* ---------- 新记忆（第 7、8 段） ---------- */
  S.memories.push(
    { id: 'm_light', title: '台风夜的灯塔', lines: ['台风那年，灯塔的灯被风吹灭了。', '守灯的老唐在塔下急得直跺脚。那晚，还有一条渔船没回来。', '老周把一只小狗揣进雨衣，一级一级往上爬。', '一百二十级台阶。风大得像要把塔掀翻。', '灯亮的那一刻，海上有人吹响了哨子。', '下塔的时候，老周的腿一直在抖。他笑着说：“阿福，你可是爬过灯塔的狗了。”'] },
    { id: 'm_tree', title: '树洞先生', lines: ['北林里有一棵老樟树，树干上有一个洞。', '不知从哪年开始，镇上的孩子往里面塞纸条：写给去世的外婆，写给走丢的猫，写给十年后的自己。', '每个礼拜，老周都会去一趟树洞。', '第二天，纸条就变成了回信，署名“树洞先生”。', '他从来没告诉过任何人。', '阿福知道。阿福每次都蹲在树下，替他望风。'] },
  );

  /* ---------- 支线委托（显示在邮包“信件”页底部） ---------- */
  S.quests = [
    { id: 'light', title: '灯塔岬 · 熄灭的灯', show: 'f:light_need | f:light_on',
      hints: [
        { if: 'm:m_light', text: '灯亮了。唐伯想起了一个台风夜。' },
        { if: 'f:light_on', text: '灯亮了！回去告诉唐伯。' },
        { if: 'i:lhkey & i:lamp_oil', text: '钥匙和灯油都有了。进灯塔，灯在最顶上。' },
        { if: 'i:lhkey', text: '钥匙找到了。还差灯油——钱记小卖部。' },
        { if: 'i:lamp_oil', text: '灯油有了。还差钥匙——唐伯说大概掉在礁石那边。' },
        { text: '唐伯需要灯塔的钥匙（岬角的礁石那边）和灯油（钱记小卖部）。' }] },
    { id: 'tree', title: '北林 · 树洞邮局', show: 'f:tree_hint | i:treeletters | f:tree_done',
      hints: [
        { if: 'f:tree_done', text: '小吴接了班，成了新的树洞先生。' },
        { if: 'i:treeletters', text: '把这捆纸条和回信本带回邮局，交给小吴。' },
        { text: '阿杰说北林里有个树洞邮局。北林的入口在小学东边那条小路的尽头。' }] },
  ];

  /* ---------- 新角色 ---------- */
  Object.assign(S.npcs, {
    tang: { name: '唐伯', look: { hair: '#bfbfbf', style: 'short', shirt: '#2f4a6a', pants: '#e8e8e0', beard: '#bfbfbf', hat: '#c0392b', cane: true }, at: [{ x: 70, y: 32, dir: 'up' }],
      talk: [{ if: 'f:light_on & !m:m_light', go: 'tang_lit' }, { if: 'f:light_on', go: 'tang_after' }, { if: 'f:light_need', go: 'tang_wait' }, { go: 'tang_first' }] },
    alan: { name: '阿兰', look: { hair: '#5a3a20', style: 'short', shirt: '#4e7a3c', pants: '#5a4a3a', hat: '#6b4a2b' }, at: [{ map: 'woods', x: 26, y: 23, dir: 'left' }],
      talk: [{ if: 'f:tree_done', go: 'alan_after' }, { go: 'alan_first' }] },
  });
  // 林阿姨和好后回店里烤面包
  S.npcs.lin.at[0] = { if: 'f:lin_warm', map: 'bakery_in', x: 4, y: 5, dir: 'right' };
  // 小吴：树洞的纸条
  S.npcs.xiaowu.talk.splice(1, 0, { if: 'i:treeletters', go: 'wu_tree' });

  Object.assign(N, {
    /* ===== 灯塔岬 · 唐伯 ===== */
    tang_first: { who: 'tang', fx: 'f:light_need', text: ['（一个老人坐在小屋门口，腿上缠着绷带，望着灯塔。）', '是老周的狗啊。好久没人来岬角了。', '这灯两个月没亮了。我摔了腿，爬不上那一百二十级台阶。', '钥匙也不知道丢哪儿去了，大概在礁石那边。灯油也早烧干了。', '今天傍晚有船进港。“栖湾号”。没有灯，雾一起，船就得在外面摸黑。'],
      choices: [{ t: '【汪！】', fx: 'sfx:bark', go: 'tang_ok' }, { t: '【歪头】', go: 'tang_ok' }] },
    tang_ok: { who: 'tang', text: ['你要替我去？哈哈……老周以前也这样，什么闲事都管。', '钥匙去礁石那边找找。灯油嘛，镇上钱记小卖部有。'] },
    tang_wait: { who: 'tang', go: [
      { if: 'i:lhkey & i:lamp_oil', go: 'tang_wait2' }, { if: 'i:lhkey', go: 'tang_wait_k' }, { if: 'i:lamp_oil', go: 'tang_wait_o' }, { go: 'tang_ok' }] },
    tang_wait2: { who: 'tang', text: ['钥匙、灯油都有了？去吧。', '门开了一直往上走，灯在最顶上。小心台阶。'] },
    tang_wait_k: { who: 'tang', text: ['钥匙找着了！好狗。', '还差灯油。钱记小卖部，跟老钱说是我要的。'] },
    tang_wait_o: { who: 'tang', text: ['老钱给的油？他还记得我啊。', '钥匙还在礁石那边，你鼻子灵，再找找。'] },
    tang_lit: { who: 'tang', fx: 'm:m_light;c:kindness+1', text: ['（灯塔的光扫过海面。老人看了很久。）', '亮了。', '……台风那年，也是这样。灯被风吹灭了，我在塔下急得团团转。', '是老周背着一只小狗，冒着雨爬上去点亮的。那天晚上，一条渔船回来了。', '那只小狗，就是你吧。'] },
    tang_after: { who: 'tang', go: [{ if: 'f:hai_wait', go: 'tang_after2' }, { go: 'tang_after1' }] },
    tang_after1: { who: 'tang', text: ['“栖湾号”看得见了。', '你回镇上去吧。我在这儿数灯，一圈，两圈……'] },
    tang_after2: { who: 'tang', text: ['“栖湾号”看得见了。', '我刚才看见老海那个倔老头往码头走，走得比谁都快。'] },
    door_lighthouse_locked: { who: 'none', text: ['（灯塔的铁门锁着，锁锈得发红。）'] },
    obj_sign_cape: { who: 'none', text: ['（木牌：“→ 灯塔岬”。）'] },
    pick_lhkey: { who: 'none', fx: 'i:lhkey;sfx:item', text: ['（礁石缝里卡着一把生锈的铜钥匙，挂着一块木牌：“灯塔”。）'] },
    obj_beacon: { who: 'none', go: [{ if: 'f:light_on', go: 'beacon_on' }, { if: 'i:lamp_oil', go: 'beacon_fill' }, { go: 'beacon_off' }] },
    beacon_off: { who: 'none', text: ['（巨大的透镜蒙着一层灰。灯座里一滴油都没有了。）'] },
    beacon_fill: { who: 'none', text: ['（巨大的透镜蒙着一层灰。灯座里一滴油都没有了。）'],
      choices: [{ t: '【用鼻子把油壶推到灯座边】', fx: '-i:lamp_oil;-i:lhkey;f:light_on;sfx:memory', go: 'beacon_lit' }, { t: '【先不动】' }] },
    beacon_lit: { who: 'none', text: ['（灯芯吸饱了油，火苗一下子窜了起来。）', '（透镜开始缓缓转动。一道光越过礁石，越过东滩，一直伸到海的那一边。）', '（天黑以后，整片海都看得见它。）'] },
    beacon_on: { who: 'none', text: ['（灯亮着，一圈一圈地转。海面上铺着一条光的路。）'] },
    obj_lh_window: { who: 'none', go: [{ if: 'c:delivered>=4', go: 'lh_window2' }, { go: 'lh_window1' }] },
    lh_window1: { who: 'none', text: ['（从窗口望出去，整个栖湾镇都在脚下：邮局的蓝屋顶、钟楼、花坡、白房子……）', '（老周每天走的路，原来这么长。）'] },
    lh_window2: { who: 'none', text: ['（从窗口望出去，镇上的灯一盏一盏亮了起来。）', '（白房子的窗户也亮着。）'] },
    obj_lh_crate: { who: 'none', text: ['（一箱旧报纸。最上面一张夹着字条：“老唐，今天的报纸。——周”）', '（下面还有一张，再下面还有一张。一整箱，都是。）'] },

    qian_oil: { who: 'qian', fx: 'i:lamp_oil', text: ['唐老头的灯？他好几个月没来买油了，我还以为……', '拿去，这壶算我的。', '替我跟他说：灯亮了，我请他喝酒。'] },

    /* ===== 北林 · 树洞邮局 ===== */
    jie_tree: { who: 'jie', fx: 'f:tree_hint', text: ['阿福阿福，你去过北林的树洞邮局吗？', '往树洞里放信，过几天就会有回信！署名是“树洞先生”。', '可是最近一封回信都没有了……树洞先生是不是也生病了？'] },
    alan_first: { who: 'alan', fx: 'f:tree_hint', text: ['哟，邮差狗？跑这么远进林子来。', '去树洞的话，岔路口往右，再一直往左。往左那条通到池塘，是死路。', '那棵老樟树里塞满了孩子们的纸条。以前每个礼拜，都有个老邮差来取，第二天就有回信。', '后来他不来了。纸条越塞越多。'] },
    alan_after: { who: 'alan', text: ['小吴姑娘接班了？好啊。', '这林子里，又有回信了。'] },
    obj_hollow: { who: 'none', go: [{ if: 'f:tree_done', go: 'hollow_done' }, { if: 'i:treeletters', go: 'hollow_empty' }, { go: 'hollow_take' }] },
    hollow_take: { who: 'none', fx: 'i:treeletters;f:tree_hint;sfx:item', text: ['（老樟树的树洞里，塞满了折成各种形状的纸条。）', '（最上面一张是阿杰的字：“树洞先生，你是不是生病了？你要是生病了，我把我的退烧贴给你。”）', '（纸条下面压着一个本子，封面写着：“树洞先生的回信本”。）', '（字，是老周的。）'] },
    hollow_empty: { who: 'none', text: ['（树洞空了。只剩几片樟树叶。）'] },
    hollow_done: { who: 'none', text: ['（树洞里放着一张新纸条，是小吴的字：“树洞先生收到了你们的信。回信，正在路上。”）'] },
    obj_sign_fork: { who: 'none', text: ['（木牌：“← 小池　→ 树洞、蘑菇地”。箭头画得很潦草。）'] },
    obj_sign_woods: { who: 'none', text: ['（木牌：“↑ 北林”。）', '（下面有一行小字：“林里有树洞邮局。请勿乱扔纸条——除非是信。”）'] },
    obj_mushroom: { who: 'none', text: ['（一圈红色的蘑菇。阿兰说过，这种不能吃。）', '（你只是闻了闻。）'] },
    wu_tree: { who: 'xiaowu', fx: '-i:treeletters;f:tree_done;m:m_tree;c:kindness+1', text: ['这是什么？……“树洞先生的回信本”？', '（她翻开本子，一页一页地看。）', '“阿杰：狗会说话的，只是它们说的话，只有信得过的人才听得懂。——树洞先生”', '“小雨：你妈妈变成风了。风会经过樟树，也会经过你。——树洞先生”', '……原来是老周师傅。', '（小吴把那一大捆纸条抱在怀里。）十七封，一封都没回。', '阿福，你说……我能接着当树洞先生吗？我字没他写得好，可我会认真回的。'],
      choices: [{ t: '【汪！】', fx: 'sfx:bark', go: 'wu_tree2' }, { t: '【把下巴搁在她手背上】', go: 'wu_tree2' }] },
    wu_tree2: { who: 'xiaowu', text: ['那就说定了。今晚我就开始写。'] },

    /* ===== 邮局里 ===== */
    obj_sorter: { who: 'none', text: ['（分拣柜。每个小格子上都贴着纸条：码头、花坡、钟楼……字是老周的。）', '（最下面一格贴着“阿福”，里面放着一块磨得发亮的骨头。）'] },
    obj_crack: { who: 'none', go: [{ if: 'd:chen', go: 'crack2' }, { go: 'crack1' }] },
    crack1: { who: 'none', text: ['（墙上有一道裂缝，是上个月搬柜子时露出来的。）', '（钟楼那封四十年前的信，就是从这里掉出来的。）'] },
    crack2: { who: 'none', text: ['（墙上的裂缝。那封压了四十年的信，从这里出发，今天终于到了。）'] },
    obj_calendar: { who: 'none', text: ['（墙上的日历。今天这一页，红笔圈了五个圈，旁边写着：别忘了。）', '（往前翻，每天的格子里都写着同一句：今天的信，都送到了。）', '（上个月开始，字越写越歪。最后几天，只画了一个圈。）'] },
    obj_logbook: { who: 'none', fx: 'scene:logbook', text: ['（老周的工作日志，摊开在桌上。）'] },
    obj_drawer: { who: 'none', text: ['（写着“一定要送到”的抽屉，空了。）', '（抽屉底下压着一张手画的邮路图，每一站旁边，都画着一只小狗。）'] },
    obj_counter: { who: 'none', text: ['（柜台上贴着小吴的便签：“今日信件由阿福负责派送，有事找狗。”）'] },
    obj_dogbed: { who: 'none', text: ['（阿福的窝。垫子上铺着一件旧的绿色邮差制服，有老周的味道。）', '（你趴上去闻了闻，又站了起来。还有活要干。）'] },
    door_post: { who: 'none', text: ['（邮局的门。门框上有一道道铅笔刻的线——是老周每年给阿福量的身高。）'] },

    /* ===== 钟楼里 ===== */
    door_tower_locked: { who: 'none', go: [{ if: 'f:clock_fixed', go: 'door_tower2' }, { go: 'door_tower1' }] },
    obj_clockwork: { who: 'none', go: [{ if: 'f:clock_fixed', go: 'clockwork2' }, { go: 'clockwork1' }] },
    clockwork1: { who: 'none', text: ['（巨大的齿轮一动不动。正中间，缺了一个拇指大小的位置。）'] },
    clockwork2: { who: 'none', text: ['（齿轮咔哒咔哒地转。一个小小的黄铜齿轮，咬在最中间。）'] },
    obj_ladder: { who: 'none', text: ['（梯子通向钟面背后。太陡了，狗上不去。）'] },
    obj_workbench: { who: 'none', go: [{ if: 'f:su_meet', go: 'bench2' }, { go: 'bench1' }] },
    bench1: { who: 'none', text: ['（陈师傅的工作台。抽屉里是四十年来他画的钟楼图纸。）', '（每一张的指针，都停在四点十分。）'] },
    bench2: { who: 'none', text: ['（陈师傅的工作台。最上面一张图纸是新画的。）', '（指针指着五点。旁边写着：她来了。）'] },

    /* ===== 面包店里 ===== */
    door_bakery_locked: { who: 'none', go: [{ go: 'obj_bakery_closed' }] },
    obj_oven: { who: 'none', text: ['（烤箱暖烘烘的。里面的桂花卷正在一点一点鼓起来。）'] },
    obj_bakery_counter: { who: 'none', text: ['（柜台上压着一张泛黄的价目表。桂花卷：两毛。）', '（是二十年前的价钱，林阿姨一直没换。）'] },
    obj_photowall: { who: 'none', go: [{ if: 'f:photo_used', go: 'photowall2' }, { go: 'photowall1' }] },
    photowall1: { who: 'none', text: ['（墙上挂满了照片，有一个相框空着。）'] },
    photowall2: { who: 'none', text: ['（墙上挂满了照片。那个空了二十年的相框里，放着那张泡白了的合影。）'] },
    obj_breadshelf: { who: 'none', text: ['（货架上的面包都卖完了，只剩一个歪歪扭扭的小面包，上面用果酱画了一只狗。）', '（旁边的纸条写着：给阿福。）'] },
  });

  // 工作日志过场
  S.scenes.logbook = { kind: 'letter', tag: '老周的工作日志', lines: ['三月二日　晴。码头老海，又说“退回去”。没退。第一百三十一封。', '五月十日　雨。林家妹妹寄来蛋糕盒。照旧说不知道谁寄的。', '七月一日　阴。树洞里十七张纸条，回了十二张。阿杰问狗会不会说话。', '八月九日　晴。灯塔老唐摔了腿，灯两个月没亮。要记得跟镇上说。要记得。', '九月三日　搬柜子。墙缝里一封信，四十年。是我们的错。', '九月四日　在花坡上站了很久，忘了来干什么。', '九月十日　字写不好了。小吴来了，是个好姑娘。阿福，你要带带她。'] };

  /* ---------- 补丁：把新线索接进旧的路由 ---------- */
  N.qian_hub.go.unshift({ if: 'f:light_need & !i:lamp_oil & !f:light_on', go: 'qian_oil' });
  N.jie_hub.go.splice(2, 0, { if: '!f:tree_hint & !f:tree_done', go: 'jie_tree' });

  // 终章：新增两个记忆动作（插在“把头搁在他膝盖上”之前）
  const zc = N.zhou_hub.choices;
  zc.splice(zc.length - 1, 0,
    { t: '【对着窗外的灯塔，轻轻叫一声】', if: 'm:m_light & !f:z_light', go: 'z_light' },
    { t: '【把一片樟树叶放在他手心】', if: 'm:m_tree & !f:z_tree', go: 'z_tree' });
  Object.assign(N, {
    z_light: { who: 'zhou', fx: 'f:z_light;c:zc+1', text: ['（远处的海面上，灯塔的光转了一圈。）', '灯塔……亮了？', '那年台风，我背着一只小狗爬上去。一百二十级。', '它一路都没叫。乖得很。'], go: 'zhou_check' },
    z_tree: { who: 'zhou', fx: 'f:z_tree;c:zc+1', text: ['樟树叶……', '树洞。有个孩子问我，狗会不会说话。', '我说会。只是它们说的话，只有信得过的人才听得懂。', '（他低头看着你。）……我好像，听得懂。'], go: 'zhou_check' },
  });

  // 完美结局：八段记忆全齐
  S.endings[0].if = S.endings[0].if.replace('c:memories>=6', 'c:memories>=8');

  // 尾声
  S.epilogues.splice(5, 0,
    { who: '灯塔岬', list: [
      { if: 'f:light_on', t: '那天傍晚起了雾。“栖湾号”看见灯塔的光，准时进了港。唐伯坐在小屋门口数着一圈一圈的光，一直数到睡着。第二天，钱叔真的提着酒上了岬角。' },
      { t: '灯塔还是黑的。“栖湾号”在雾里摸索了很久，比预定晚了一个钟头才靠岸。好在，还是到了。' }] },
    { who: '北林', list: [
      { if: 'f:tree_done', t: '北林的树洞里，又开始有回信了。署名还是“树洞先生”，只是字迹圆了一些。' },
      { t: '北林的树洞里，纸条还在一张一张变多。总有一天，会有人发现它们的。' }] });
  S.epilogues.push({ who: '邮票册', list: [
    { if: 'c:stamps>=12', t: '小吴把阿福一路叼回来的十二枚邮票，贴进了一本新邮票册。扉页上写着：栖湾风物——阿福 集。' }] });
})();
