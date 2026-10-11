/* 剧本（一）：设定、信件、物品、记忆、角色登场位置，以及邮局与小镇道具的对话。
   语法速查（详见 docs/剧本编写指南.md）：
     节点 { who, text:[...多页], fx:'效果;效果', choices:[{t, if, fx, go}], go }
     条件 f:旗标  i:物品  m:记忆  d:已送达的信  p:偷看过的信  c:计数>=N   ! 取反  & 并且  | 或者
     效果 f:x 设旗标  -f:x 清除  i:x 得到物品  -i:x 失去  d:信 送达  m:记忆 解锁
          peek:信 偷看  c:x+1 计数  sfx:音效  toast:提示  scene:过场  bell 敲钟  end 结局 */
G.STORY = {
  title: '阿福的最后一班邮路',

  /* ---------- 物品 ---------- */
  items: {
    gear: { name: '黄铜齿轮', desc: '拇指大小的铜齿轮，被人摸得发亮。钟楼的陈师傅一直在找这样一个。' },
    photo: { name: '旧合影', desc: '两个扎辫子的姑娘站在“林记面包”的招牌下，笑得很开心。照片被雨水泡得发白。' },
    dandelion: { name: '蒲公英', desc: '圆滚滚的一球，风一吹就要散。小心叼着。' },
    easel: { name: '没画完的画', desc: '夕阳下，一个老邮差和一只背邮包的狗。角落写着：“邮路——给周叔”。' },
    painting: { name: '《邮路》', desc: '阿木画完了。画里的老邮差，眼角多了一道笑纹。要带给老周。' },
    cranes: { name: '纸鹤', desc: '小雨一路扔下的纸鹤，每只翅膀上都写着一句话。' },
  },

  /* ---------- 信件（顺序即邮包里的顺序） ---------- */
  letters: [
    {
      id: 'hai', to: '码头尽头，不爱说话的人', from: '远洋货轮“栖湾号” · 海生',
      hints: [
        { if: 'd:hai', text: '已送达。码头的风，好像没那么冷了。' },
        { if: 'f:hai_met', text: '老海坐在栈桥的尽头。他说“退回去”。可老周从来没退回去过。' },
        { text: '沿主路往西过桥，看见“码头”的木牌就往南走。' },
      ],
      peekToast: '信里说：船今天傍晚靠岸。',
    },
    {
      id: 'lin', to: '面包店的林姐（今天她可能不在店里）', from: '城里 · 林青',
      hints: [
        { if: 'd:lin & f:lin_warm', text: '已送达。她回店里烤桂花卷去了。' },
        { if: 'd:lin & i:photo', text: '已送达。那张旧合影，也许她还想再看一眼？' },
        { if: 'd:lin', text: '已送达。她还坐在车站，说自己“不是在等人”。' },
        { if: 'f:lin_met', text: '林阿姨在东边车站的长椅上。面包店后墙根下，好像掉着什么东西……' },
        { if: 'f:lin_where', text: '钱叔说，她每年今天都去东边的车站坐着。' },
        { if: 'f:bakery_seen', text: '店门口挂着“今日歇业”。去问问隔壁小卖部的钱叔？' },
        { text: '面包店在中心广场的东边，门口有红白条纹的雨棚。' },
      ],
      peekToast: '信里说：她妹妹坐今天的末班车回来。',
    },
    {
      id: 'yu', to: '小雨（十岁生日当天交给她）', from: '（没有写寄件人）',
      hints: [
        { if: 'd:yu & !f:dandelion_used', text: '已送达。小雨说，妈妈以前带她去花坡吹蒲公英。' },
        { if: 'd:yu', text: '已送达。蒲公英的种子，飞得很远很远。' },
        { if: 'f:yu_missing', text: '王老师说小雨跑不见了。地上有纸鹤，一路往学校后面去了。' },
        { text: '栖湾小学在镇子的西北角，过北边那座小桥就到。' },
      ],
      peekToast: '是小雨妈妈的字。她提到了学校后面的大樟树。',
    },
    {
      id: 'chen', to: '钟楼 · 守钟的人', from: '苏婉（邮戳：四十年前）',
      hints: [
        { if: 'f:su_meet', text: '已送达。钟楼下的长椅上，坐着两个老人。' },
        { if: 'f:clock_fixed', text: '钟响了。花坡上，有人听见了。' },
        { if: 'd:chen & i:gear', text: '你叼着一个铜齿轮。快拿给陈师傅！' },
        { if: 'f:cat_gear_hint', text: '煤球说，面包店和小卖部中间的小巷里有个亮晶晶的东西。' },
        { if: 'd:chen', text: '陈师傅要修钟，可缺一个铜齿轮。镇上谁会有呢？' },
        { text: '钟楼在中心广场往北。钟停在四点十分。' },
      ],
      peekToast: '信里说：“钟响的那天，我就在钟楼下等你。”',
    },
    {
      id: 'mu', to: '桥下的画家（他叫阿木，头发很乱）', from: '省美术学院 招生办',
      hints: [
        { if: 'f:mu_go', text: '已送达。他赶末班车去了。那幅画，在你的邮包里。' },
        { if: 'd:mu & i:easel', text: '已送达。把那幅没画完的画拿给他吧。' },
        { if: 'd:mu', text: '已送达。他说要再想想。桥下的画架还在那儿。' },
        { if: 'f:mu_where', text: '有人说，阿木这两天老往东滩的礁石那儿跑。' },
        { if: 'f:easel_seen', text: '桥下只有画架，人不在。问问镇上的人？' },
        { text: '“桥下”……主路过河的那座桥，东边桥头。' },
      ],
      peekToast: '是录取通知。报到截止：明天。',
    },
    {
      id: 'afu', to: '阿福', from: '周守信', special: true,
      hints: [
        { if: 'f:final_read', text: '“等你送完了，就来山上找我吧。”——山坡上的白房子。' },
        { if: 'c:delivered>=5', text: '信都送完了。可以拆开了。' },
        { text: '背面写着：等你把信都送完，再拆。' },
      ],
    },
  ],

  /* ---------- 记忆碎片（老周的六段往事） ---------- */
  memories: [
    { id: 'm_rain', title: '雨夜的邮袋', lines: ['那是很多年前的一个雨夜。', '邮车到得很晚，最后一个邮袋特别沉，还在动。', '老周解开绳子，里面是一只湿透的小狗，冻得直哆嗦。', '“谁把你寄来的？连邮票都没贴。”', '他把小狗揣进雨衣里，一路走回邮局。', '“既然寄到了栖湾，那你就是栖湾的了。”', '“叫你阿福吧。有福气的福。”'] },
    { id: 'm_sea', title: '码头上的空位', lines: ['老周每天的最后一站，是码头。', '他会在老海旁边坐一会儿，什么也不说。', '阿福趴在两个人中间，看海鸥抢鱼。', '“老海，你儿子来信了。”', '“退回去。”', '老周没有退回去。', '他把那些信，一封一封，收在邮局最里面的柜子里。', '他说：“总有一天，他会想看的。”'] },
    { id: 'm_bread', title: '没有寄件人的蛋糕', lines: ['林家姐妹以前一起开面包店。', '妹妹去城里那年，两个人吵得很凶，后来谁也不肯先开口。', '可每年姐姐生日，邮局都会收到一个没写寄件人的蛋糕盒。', '老周每次都送到，每次都说：“不知道谁寄的。”', '他知道是谁寄的。', '他也知道，每年妹妹生日，姐姐会托他捎一袋刚出炉的桂花卷。', '寄件人那一栏，同样空着。', '二十年，他就这样，替两个不肯开口的人来回跑。'] },
    { id: 'm_promise', title: '提前两年画的圈', lines: ['两年前的冬天，一个瘦瘦的女人走进邮局。', '“周师傅，这封信，请您在我女儿十岁生日那天交给她。”', '“那还有两年呢。”', '“嗯。我等不到了。”', '老周把信收好，放进最里面的抽屉。', '他在日历上，提前两年，画了一个圈。', '那天晚上，阿福看见他坐在灯下，很久很久没有动。'] },
    { id: 'm_clock', title: '墙缝里的信', lines: ['上个月，邮局搬分拣柜。', '柜子后面的墙缝里，掉出一封信。邮戳是四十年前的。', '老周捧着那封信，在柜子边站了一下午。', '“四十年……是我们邮局的错。”', '他想立刻送去钟楼，走到半路，却忘了自己要去哪儿。', '那是他第一次在镇上迷路。', '回来以后，他把信放进了那个写着“一定要送到”的抽屉。'] },
    { id: 'm_road', title: '路是走出来的', lines: ['老周年轻时也想走出去。', '他考上过城里的大学，家里穷，没去成。', '后来他当了邮差，每天走二十里路。', '“别人的信，替我去了很多地方。”他跟桥下画画的年轻人说。', '“我这辈子哪儿也没去，可我把全世界送到了栖湾。”', '“你不一样，阿木。”', '“路是走出来的。”'] },
  ],

  /* ---------- 过场：信的内容、开场等 ---------- */
  scenes: {
    intro: { kind: 'sepia', tag: '序', title: '一定要送到', lines: ['栖湾镇的邮差老周，送了三十八年的信。', '上个月，他住进了山坡上的白房子。', '医生说，他会慢慢忘记很多事。', '先是钥匙放在哪儿，然后是回家的路，然后是人的名字。', '　', '邮局的抽屉里，留着五封他没来得及送的信。', '信封上是他歪歪扭扭的字：“一定要送到。”', '还有一封，写着：“阿福 收”。', '　', '阿福是一只狗。'] },
    letter_hai: { kind: 'letter', tag: '海生的信', lines: ['爸：', '这是我写给你的第一百四十五封信。前面那些，你大概都没拆吧。', '我要回来了。不走了。', '这个月最后一个周六的傍晚，“栖湾号”靠岸。', '你要是不想见我，就别来码头。', '你要是来了，我就知道了。', '我不会先开口的。我跟你一样倔。', '——海生'] },
    letter_lin: { kind: 'letter', tag: '林青的信', lines: ['姐：', '我下个月要做个手术，不是大病，别担心。', '只是躺在病床上的时候，我突然很想吃你做的桂花卷。', '不是寄来的那种，是刚出炉、烫手的那种。', '这个月最后一个周六，我坐末班车回栖湾。', '你愿意的话，就在车站等我。', '你不愿意，我就在车站坐一会儿，再坐车回去。', '——阿青'] },
    letter_yu: { kind: 'letter', tag: '给小雨的信', lines: ['小雨：', '当你读到这封信的时候，你已经十岁了。', '妈妈没能陪你长到十岁，对不起。', '我把这封信交给了邮局的周爷爷。他答应我，一定会在你十岁生日那天亲手交给你。周爷爷是镇上最守信的人。', '妈妈想告诉你：', '难过的时候，可以哭。十岁也可以，二十岁也可以。', '不要因为想我，就不过生日。你的生日，是妈妈这辈子最高兴的一天。', '学校后面那棵大樟树，是你出生那年我种的。你长高一点，它就长高一点。', '你看，它现在长得多好。', '生日快乐，我的小雨。', '——妈妈'] },
    letter_chen: { kind: 'letter', tag: '四十年前的信', lines: ['守钟的：', '我爹把我锁在家里了，我去不了车站。', '你别等我。你一个人去城里吧，去学你想学的。', '等你学成了，就回来，把钟楼的钟修好。', '钟响的那天，我就知道你回来了。', '我会在钟楼下等你。', '多久都等。', '——婉'] },
    letter_mu: { kind: 'letter', tag: '录取通知（附一张便条）', lines: ['阿木同学：经审核，你已被我院绘画专业录取。请于本月最后一个周日前报到。', '　', '（便条，是老周的字）', '阿木：', '通知到了三个月了，你一直不在桥下，我替你收着。', '我知道你在犹豫。怕钱不够，怕走了，就没人陪我这个老头子在桥上说话。', '别怕。我记性不好了，可我记得你画画的样子。', '去吧。路是走出来的。', '——老周'] },
    letter_afu: { kind: 'letter', tag: '阿福 收', lines: ['阿福：', '我知道你不认字。那你就闻一闻吧，上面有我的味道。', '我的记性越来越坏了。昨天我在邮局门口站了半天，想不起来要去哪儿。', '所以我把最后这几封信，都留到了它们该到的那一天。我在日历上画了圈。', '可我怕到了那天，我连日历都看不懂了。', '所以，拜托你了。', '你跟我走了十一年的邮路，每一户人家、每一条小巷，你都比我记得清楚。', '等你送完了，就来山上找我吧。', '如果我认不出你了，别难过。你就趴在我脚边，像以前在码头那样。', '我会想起来的。就算想不起来名字，我也会知道，你是我的狗。', '——周守信', '　', '附：疗养院的护士同志，请让这只狗进来。它是来交班的。'] },
  },

  /* ---------- 角色：外观与登场位置（at 按顺序取第一个满足条件的） ---------- */
  npcs: {
    xiaowu: { name: '小吴', look: { hair: '#2b2118', style: 'long', shirt: '#3f7a5a', pants: '#3a3a44', blush: true }, at: [{ x: 15, y: 23, dir: 'right' }],
      talk: [{ if: '!f:intro_done', go: 'wu_intro' }, { if: 'f:final_read', go: 'wu_final' }, { if: 'c:delivered>=5', go: 'wu_all' }, { go: 'wu_hub' }] },
    cat: { name: '煤球', sprite: 'cat', at: [{ if: 'c:delivered<2', x: 21, y: 21, dir: 'left' }, { if: 'c:delivered<4', x: 33, y: 21, dir: 'left' }, { x: 42, y: 22, dir: 'left' }],
      talk: [{ if: 'c:delivered>=5', go: 'cat_end' }, { go: 'cat_hub' }] },
    hai: { name: '老海', look: { hair: '#8a8a8a', style: 'short', shirt: '#3d5a7a', pants: '#4a3a2a', beard: '#8a8a8a', hat: '#2b3a4a' }, at: [{ x: 12, y: 42, dir: 'down' }],
      talk: [{ if: 'd:hai', go: 'hai_after' }, { go: 'hai_first' }] },
    lin: { name: '林阿姨', look: { hair: '#4a3020', style: 'bun', shirt: '#c98a7a', pants: '#5a4a5a', apron: '#f6ecd9' }, at: [{ if: 'f:lin_warm', x: 36, y: 23, dir: 'down' }, { x: 52, y: 22, dir: 'down' }],
      talk: [{ if: 'f:lin_warm', go: 'lin_warm_after' }, { if: 'd:lin & i:photo', go: 'lin_photo_late' }, { if: 'd:lin', go: 'lin_after' }, { go: 'lin_first' }] },
    qian: { name: '钱叔', look: { hair: '#2b2118', style: 'bald', shirt: '#e0c070', pants: '#4a4a5a', glasses: true }, at: [{ x: 46, y: 23, dir: 'down' }],
      talk: [{ go: 'qian_hub' }] },
    teacher: { name: '王老师', look: { hair: '#2b2118', style: 'short', shirt: '#7a5a8a', pants: '#3a3a44', glasses: true }, at: [{ x: 10, y: 15, dir: 'down' }],
      talk: [{ if: 'd:yu', go: 'teacher_after' }, { go: 'teacher_first' }] },
    yu: { name: '小雨', look: { kid: true, hair: '#2b2118', style: 'pigtails', shirt: '#e86a8a', pants: '#4f74a8', blush: true }, at: [{ if: 'd:yu', x: 8, y: 15, dir: 'down' }, { x: 6, y: 5, dir: 'down' }],
      talk: [{ if: 'd:yu & i:dandelion', go: 'yu_dandelion_late' }, { if: 'd:yu', go: 'yu_after' }, { go: 'yu_first' }] },
    chen: { name: '陈师傅', look: { hair: '#c8c8c8', style: 'short', shirt: '#6a5a4a', pants: '#3a3a44', glasses: true }, at: [{ x: 31, y: 12, dir: 'down' }],
      talk: [{ if: 'f:su_meet', go: 'chen_together' }, { if: 'f:clock_fixed', go: 'chen_fixed' }, { if: 'd:chen & i:gear', go: 'chen_gear' }, { if: 'd:chen', go: 'chen_wait' }, { go: 'chen_first' }] },
    su: { name: '苏婆婆', look: { hair: '#e0e0e0', style: 'bun', shirt: '#9a5aa8', pants: '#4a3a5a', cane: true, scarf: '#f6ecd9' }, at: [{ if: 'f:clock_fixed', x: 27, y: 13, dir: 'right' }, { x: 46, y: 8, dir: 'down' }],
      talk: [{ if: 'f:su_meet', go: 'su_together' }, { if: 'f:clock_fixed', go: 'su_meet' }, { go: 'su_first' }] },
    mu: { name: '阿木', look: { hair: '#2b2118', style: 'long', shirt: '#c0603a', pants: '#3a4a5a' }, at: [{ if: '!f:mu_go', x: 52, y: 36, dir: 'down' }],
      talk: [{ if: 'd:mu & i:easel', go: 'mu_easel' }, { if: 'd:mu', go: 'mu_think_after' }, { go: 'mu_first' }] },
    jie: { name: '阿杰', look: { kid: true, hair: '#2b2118', style: 'short', shirt: '#f2c14e', pants: '#3a5a7a' }, at: [{ x: 30, y: 22, dir: 'down' }],
      talk: [{ go: 'jie_hub' }] },
    liu: { name: '刘奶奶', look: { hair: '#d8d8d8', style: 'bun', shirt: '#5a7a5a', pants: '#3a3a44', cane: true }, at: [{ x: 28, y: 21, dir: 'left' }],
      talk: [{ go: 'liu_hub' }] },
    nurse: { name: '何护士', look: { hair: '#2b2118', style: 'bun', shirt: '#f6f6f0', pants: '#f6f6f0', hat: '#ffffff' }, at: [{ x: 52, y: 10, dir: 'down' }],
      talk: [{ if: 'f:gate_open', go: 'nurse_open' }, { if: 'f:final_read', go: 'nurse_letter' }, { go: 'nurse_first' }] },
    zhou: { name: '老周', sprite: 'zhou-chair', at: [{ x: 55, y: 8, dir: 'left' }],
      talk: [{ if: 'f:ending', go: 'zhou_done' }, { go: 'zhou_start' }] },
  },

  nodes: {},
};

/* ================= 邮局 · 小吴 ================= */
Object.assign(G.STORY.nodes, {
  wu_intro: { who: 'xiaowu', text: ['阿福！你又叼着那个邮包跑出来了。', '……这是老周师傅抽屉里的？抽屉上贴着：“一定要送到”。', '可这地址也太离谱了吧。“码头尽头，不爱说话的人”、“桥下的画家，头发很乱”……', '还有一封：“小雨，十岁生日当天交给她”。', '我才来三个星期，镇上的人一个都认不全。'],
    choices: [
      { t: '【叼起邮包，冲她摇尾巴】', go: 'wu_intro2' },
      { t: '【趴下，把下巴搁在邮包上】', go: 'wu_intro2' },
    ] },
  wu_intro2: { who: 'xiaowu', text: ['你想替他送？', '……也是。这镇子上，没有谁比你更熟老周的邮路了。', '好吧，阿福邮差，今天的班交给你了。信都在你的邮包里，按 Q 能看看信封上写了什么。', '还有这封“阿福 收”。背面写着：“等你把信都送完，再拆。”', '……他连这个都想到了。', '对了，老周师傅总说，你是他在一个下雨天，从邮袋里捡回来的。'],
    fx: 'f:intro_done;m:m_rain', go: 'wu_intro3' },
  wu_intro3: { who: 'xiaowu', text: ['去吧。送完了，我们一起上山看他。', '（空格键对话，X 键可以“汪”。遇到岔路就看看邮包里的提示。）'] },
  wu_hub: { who: 'xiaowu', go: [
    { if: 'c:delivered>=3', go: 'wu_hub3' }, { if: 'c:delivered>=1', go: 'wu_hub1' }, { go: 'wu_hub0' }] },
  wu_hub0: { who: 'xiaowu', text: ['不知道先去哪儿？打开邮包（Q），每封信都有地址和线索。', '镇上的人都认识你。多跟他们聊聊。'] },
  wu_hub1: { who: 'xiaowu', text: ['已经送出去了？阿福你太厉害了。', '我刚才翻老周师傅的工作日志，每一页的最后一行都写着同一句：“今天的信，都送到了。”'] },
  wu_hub3: { who: 'xiaowu', text: ['天快黑了。镇上好像……有点不一样了。', '路过的人都在说，今天傍晚码头要来船，车站要来人。'] },
  wu_all: { who: 'xiaowu', text: ['五封都送到了？！', '那你是不是……可以拆那封“阿福 收”了？', '（打开邮包，信件那一页，最下面。）'] },
  wu_final: { who: 'xiaowu', text: ['“它是来交班的”……', '去吧，阿福。白房子在花坡的最东边。', '我收拾一下就来。'] },

  /* ================= 煤球（猫） ================= */
  cat_hub: { who: 'cat', text: ['喵。老周的狗。', '听说你在替他送信？那么多信，你就不好奇里面写了什么？'],
    choices: [
      { t: '看看码头那封', if: '!p:hai & !d:hai', go: 'cat_peek_hai' },
      { t: '看看面包店那封', if: '!p:lin & !d:lin', go: 'cat_peek_lin' },
      { t: '看看给小雨那封', if: '!p:yu & !d:yu', go: 'cat_peek_yu' },
      { t: '看看钟楼那封', if: '!p:chen & !d:chen', go: 'cat_peek_chen' },
      { t: '看看画家那封', if: '!p:mu & !d:mu', go: 'cat_peek_mu' },
      { t: '（问齿轮的事）', if: 'd:chen & !f:clock_fixed & !i:gear & !f:cat_gear_hint', go: 'cat_gear' },
      { t: '【别过头去】', go: 'cat_no' },
    ] },
  cat_no: { who: 'cat', text: ['哼，老周教出来的狗，跟他一个样。', '他送了三十八年信，一封都没拆过。真没意思。'] },
  cat_peek_hai: { who: 'cat', fx: 'peek:hai;scene:letter_hai', text: ['……喵。原来如此。', '撕开的口子，用口水粘不回去的哦。'] },
  cat_peek_lin: { who: 'cat', fx: 'peek:lin;scene:letter_lin', text: ['桂花卷，听起来不错。', '撕开的口子，用口水粘不回去的哦。'] },
  cat_peek_yu: { who: 'cat', fx: 'peek:yu;scene:letter_yu', text: ['……', '这一封，我们不该看的。'] },
  cat_peek_chen: { who: 'cat', fx: 'peek:chen;scene:letter_chen', text: ['四十年。人类真是麻烦的动物。'] },
  cat_peek_mu: { who: 'cat', fx: 'peek:mu;scene:letter_mu', text: ['明天截止？那家伙还在礁石上发呆呢。'] },
  cat_gear: { who: 'cat', fx: 'f:cat_gear_hint', text: ['齿轮？亮晶晶、硌脚的那种？', '面包店和小卖部中间的小巷子，我昨天在那儿踩到过一个。', '不用谢。记得欠我一条鱼。'] },
  cat_end: { who: 'cat', text: ['都送完啦？', '……去山上吧。那老头每天傍晚都在窗边，往邮局的方向看。', '喵。'] },

  /* ================= 道具与拾取 ================= */
  obj_mailbox: { who: 'none', go: [{ if: 'c:delivered>=5', go: 'obj_mailbox2' }, { go: 'obj_mailbox1' }] },
  obj_mailbox1: { who: 'none', text: ['（绿色的邮筒。老周每天早上第一件事，就是拍拍它的脑袋。）'] },
  obj_mailbox2: { who: 'none', text: ['（你也拍了拍它——用爪子。）'] },
  obj_postboard: { who: 'none', text: ['（邮局门口的公告栏，贴着一张日历。）', '（今天的日期，被红笔圈了五个圈。旁边是老周的字：“别忘了”。）'] },
  obj_bowl: { who: 'none', text: ['（阿福的饭碗。碗底刻着一个“福”字，是老周拿钉子一点一点刻的。）'] },
  obj_well: { who: 'none', text: ['（老井。井沿被磨得发亮。往下汪一声，会有回声。）'] },
  obj_stall: { who: 'none', text: ['（集市的摊子。今天的萝卜特别大。）'] },
  obj_sign_tower: { who: 'none', text: ['（木牌：“↑ 钟楼”。）', '（下面有人用小字补了一句：“钟是坏的，别信它的时间”。）'] },
  obj_sign_hill: { who: 'none', text: ['（木牌：“花坡 · 白房子疗养院 ↑”。）'] },
  obj_sign_harbor: { who: 'none', text: ['（木牌：“↓ 码头”。）'] },
  obj_bakery_closed: { who: 'none', fx: 'f:bakery_seen', text: ['（木牌：“今日歇业”。）', '（门缝里飘出一点点桂花的香味，是昨天的。）'] },
  obj_busstop: { who: 'none', text: ['（站牌：栖湾 ⇄ 城里。末班车：傍晚六点。）'] },
  obj_shopstall: { who: 'none', text: ['（小卖部门口的货架：酱油、火柴、橘子汽水。）', '（还有一罐狗饼干。钱叔从来不收阿福的钱。）'] },
  obj_crate: { who: 'none', text: ['（一箱刚卸下来的鱼。很香。）', '（你忍住了。你是一只有工作的狗。）'] },
  obj_gate: { who: 'none', text: ['（白色的铁门，锁着。门里的院子很安静。）'] },
  obj_easel: { who: 'none', fx: 'f:easel_seen', text: ['（桥头的画架上，是一幅没画完的画：夕阳下，一个穿绿制服的老邮差，和一只背邮包的狗。）', '（角落写着：“邮路——给周叔”。画架下压着一张纸条：“不画了。画不出来。”）'],
    choices: [
      { t: '【小心地把画叼走】', fx: 'i:easel;sfx:item', go: 'obj_easel_take' },
      { t: '【先不动它】' },
    ] },
  obj_easel_take: { who: 'none', text: ['（画框不重。你叼得很稳，一点颜料都没蹭掉。）'] },
  pick_crane1: { who: 'none', fx: 'f:crane1;i:cranes;sfx:item', text: ['（一只纸鹤。翅膀上写着：“妈妈，今天我十岁了。”）'] },
  pick_crane2: { who: 'none', fx: 'f:crane2;i:cranes;sfx:item', text: ['（又一只纸鹤：“王老师说，十岁是大孩子了，大孩子不可以哭。”）'] },
  pick_crane3: { who: 'none', fx: 'f:crane3;i:cranes;sfx:item', text: ['（第三只纸鹤：“可是我还是好想你。”）', '（纸鹤一路往大樟树那边去了。）'] },
  pick_photo: { who: 'none', fx: 'i:photo;sfx:item', text: ['（面包店后墙根下，压在碎花盆底下的一张旧照片。）', '（两个扎辫子的姑娘站在“林记面包”的招牌下，笑得很开心。）'] },
  pick_dandelion: { who: 'none', fx: 'i:dandelion;sfx:item', text: ['（一株圆滚滚的蒲公英。你屏住呼吸，把它叼了起来。）'] },
  pick_gear_alley: { who: 'none', fx: 'f:gear_alley;i:gear;sfx:item', text: ['（小巷的石缝里，卡着一个铜齿轮。上面有一道小小的划痕，像是被谁咬过。）', '（……大概是煤球。）'] },

  /* 门 */
  door_default: { who: 'none', text: ['（门关着。）'] },
  door_post: { who: 'none', text: ['（邮局的门。门框上，有一道道铅笔刻的线——是老周每年给阿福量的身高。）'] },
  door_school: { who: 'none', text: ['（教室里传来唱生日歌的排练声，唱到一半就停了。）'] },
  door_bakery: { who: 'none', go: [{ if: 'f:lin_warm', go: 'door_bakery2' }, { go: 'obj_bakery_closed' }] },
  door_bakery2: { who: 'none', text: ['（门里传来烤箱“叮”的一声。桂花的香味，烫的。）'] },
  door_shop: { who: 'none', text: ['（小卖部的门开着一条缝。收音机在放老歌。）'] },
  door_hut: { who: 'none', text: ['（渔具屋。门上挂着一串晒干的海星。）'] },
  door_cottage: { who: 'none', go: [{ if: 'f:clock_fixed', go: 'door_cottage2' }, { go: 'door_cottage1' }] },
  door_cottage1: { who: 'none', text: ['（门口的花盆里，种的都是一种紫色的小花。）'] },
  door_cottage2: { who: 'none', text: ['（门开着，屋里没人。桌上一杯茶，还冒着热气。）'] },
  door_carehome: { who: 'none', text: ['（白房子里很安静。走廊尽头，有人在轻轻地哼歌。）'] },
  door_tower: { who: 'none', go: [{ if: 'f:clock_fixed', go: 'door_tower2' }, { go: 'door_tower1' }] },
  door_tower1: { who: 'none', text: ['（钟楼的门锁着。从门缝里，能看见一地的旧齿轮。）'] },
  door_tower2: { who: 'none', text: ['（钟楼里，齿轮咔哒咔哒地转。声音很好听。）'] },
});
