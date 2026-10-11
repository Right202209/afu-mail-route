/* 剧本（二）：五封信的五条故事线，以及镇上提供线索的居民。 */
Object.assign(G.STORY.nodes, {

  /* ===== 第一封 · 码头 · 老海 ===== */
  hai_first: { who: 'hai', fx: 'f:hai_met', text: ['（栈桥的尽头，一个老人背对着小镇，在补渔网。）', '……老周的狗。', '又是那小子的信吧。跟老周说过多少回了——退回去。'],
    choices: [
      { t: '【把信放在他脚边，转身离开】', fx: 'd:hai;f:hai_left', go: 'hai_left' },
      { t: '【在他旁边趴下，等】', go: 'hai_wait1' },
    ] },
  hai_left: { who: 'none', text: ['（你走出几步，回头。）', '（老海没有看那封信。可他补网的手，停住了。）'] },
  hai_wait1: { who: 'hai', fx: 'd:hai;f:hai_wait;scene:letter_hai', text: ['……', '（海浪拍着栈桥。一只海鸥落在桅杆上，又飞走了。）', '……你倒是跟老周一个脾气。他也这样，在这儿一坐就是半天，什么都不说。', '（老海叹了口气，把信拿了起来。）'],
    go: [{ if: 'f:clock_fixed | i:gear', go: 'hai_wait2b' }, { go: 'hai_wait2' }] },
  hai_wait2: { who: 'hai', fx: 'i:gear;m:m_sea;c:kindness+1', text: ['……今天傍晚。', '十二年了。这小子，说回来就回来。', '（他从怀里摸出一个东西，在手心里攥了很久。）', '这是海生小时候从船钟上拆下来玩的齿轮。他走那天落在家里了。我揣了十二年。', '钟楼的老陈，前阵子满镇子找这么大的铜齿轮。你替我拿给他吧。', '我要等的东西，今天就回来了。用不着它了。'] },
  hai_wait2b: { who: 'hai', fx: 'm:m_sea;c:kindness+1', text: ['……今天傍晚。', '十二年了。这小子，说回来就回来。', '（他把信折好，揣进贴胸的口袋。）', '回去跟老周说……算了。我自己上山去跟他说。'] },
  hai_after: { who: 'hai', go: [{ if: 'f:hai_wait', go: 'hai_after_w' }, { go: 'hai_after_l' }] },
  hai_after_w: { who: 'hai', text: ['天黑之前，我得把这身鱼腥味洗洗。', '……看什么看。我又不是去见谁。'] },
  hai_after_l: { who: 'none', text: ['（那封信还躺在原地。老海的网补了一下午，还是同一个洞。）'],
    choices: [{ t: '【在他旁边趴下，等】', go: 'hai_wait1' }, { t: '【走开】' }] },

  /* ===== 第二封 · 车站 · 林阿姨 ===== */
  lin_first: { who: 'lin', fx: 'f:lin_met', text: ['（林阿姨坐在车站的长椅上，膝盖上放着一个纸袋，纸袋里飘出桂花的香味。）', '阿福？今天店里不开门，没有面包边给你。', '……我？我不是在等车。我每年今天都来这儿坐坐，习惯了。'],
    choices: [
      { t: '【把信放在她手里】', go: 'lin_give' },
      { t: '【叼出那张旧合影】', if: 'i:photo', go: 'lin_photo' },
      { t: '【在她旁边坐下】', go: 'lin_sit' },
    ] },
  lin_sit: { who: 'lin', text: ['……二十年前的今天，我妹妹就是从这儿坐车走的。', '我们吵了一架。我说，你走了就别回来。', '她真就没回来。', '（她把纸袋攥得更紧了一点。）', '……你嘴里叼着什么？'],
    choices: [
      { t: '【把信放在她手里】', go: 'lin_give' },
      { t: '【叼出那张旧合影】', if: 'i:photo', go: 'lin_photo' },
    ] },
  lin_give: { who: 'lin', fx: 'd:lin;scene:letter_lin', text: ['……这字，是阿青的。', '（她读了很久。）'], go: 'lin_give2' },
  lin_give2: { who: 'lin', fx: 'f:lin_plain', text: ['……今天？末班车？', '她总是这样，什么都不提前说。', '我、我才不是在等她。我每年都来，跟她没关系。', '（她低头看了看纸袋里的桂花卷。早就凉了。）'] },
  lin_photo: { who: 'lin', fx: 'd:lin;-i:photo;f:photo_used;scene:letter_lin', text: ['……这是阿青的字。', '（她读完信。你把那张旧合影，轻轻放在她膝盖上。）'], go: 'lin_photo2' },
  lin_photo_late: { who: 'lin', fx: '-i:photo;f:photo_used', text: ['阿福？你怎么又回来了。', '（你把那张旧合影，轻轻放在她膝盖上。）'], go: 'lin_photo2' },
  lin_photo2: { who: 'lin', fx: 'f:lin_warm;m:m_bread;c:kindness+1', text: ['这张照片……', '她走的那天，我把它从窗户扔了出去。二十年，原来一直在店后面。', '（林阿姨笑了，眼泪掉在照片上。）', '阿福，你说，我是不是太犟了。', '不坐了。我回店里烤一炉新的。烫手的那种。', '她最喜欢烫手的那种。'] },
  lin_after: { who: 'lin', text: ['末班车六点到。', '……我就再坐一会儿。反正每年都坐。'] },
  lin_warm_after: { who: 'lin', text: ['（店里飘出刚出炉的桂花香。）', '阿福，等这一炉出来，我就去车站。', '你说她会不会嫌我老了？……算了，她自己也不年轻了。'] },

  /* ===== 第三封 · 学校 · 小雨 ===== */
  teacher_first: { who: 'teacher', fx: 'f:yu_missing', text: ['阿福？你是来找小雨的吗？', '今天是她十岁生日。我们准备了蛋糕，可她一下课就跑不见了。', '她妈妈……走了两年了。每年生日，她都会躲起来。', '地上那些纸鹤，是她一路扔的。她一难过就叠纸鹤。', '我找过了，没找到。也许你的鼻子比我灵。'] },
  teacher_after: { who: 'teacher', go: [{ if: 'f:yu_helper', go: 'teacher_helper' }, { go: 'teacher_after1' }] },
  teacher_after1: { who: 'teacher', text: ['小雨回来了，还主动说要吹蜡烛。', '谢谢你，阿福。也谢谢那位守信的周师傅。'] },
  teacher_helper: { who: 'teacher', text: ['小雨说她以后要当邮差。', '我说当邮差得认很多字。她说，那她从今天起，每天多认十个。'] },

  yu_first: { who: 'yu', text: ['（大樟树下，一个小女孩抱着膝盖坐着。）', '……阿福？你怎么找到我的。', '你别告诉王老师。我不想吹蜡烛。', '吹蜡烛要许愿。可我的愿望，又不会实现。'],
    choices: [
      { t: '【把那封信放在她面前】', go: 'yu_give' },
      { t: '【把纸鹤一只一只放回她手里】', if: 'f:crane1 & f:crane2 & f:crane3', go: 'yu_cranes' },
    ] },
  yu_cranes: { who: 'yu', fx: '-i:cranes', text: ['……你把它们都捡回来了？', '（她把三只纸鹤排成一排。）', '“可是我还是好想你。”……这句写得最丑，我是哭着写的。', '……你嘴里还叼着什么？'],
    choices: [{ t: '【把那封信放在她面前】', go: 'yu_give' }] },
  yu_give: { who: 'yu', fx: 'd:yu;scene:letter_yu', text: ['给我的？“小雨，十岁生日当天交给她”……是周爷爷的字。', '（她打开了信。）'], go: 'yu_give2' },
  yu_give2: { who: 'yu', text: ['……', '妈妈说，可以哭。', '（小雨哇的一声哭了出来，哭得很大声，像是要把两年攒下的眼泪一次哭完。）'],
    choices: [
      { t: '【安静地靠在她身边】', go: 'yu_comfort' },
      { t: '【把蒲公英递给她】', if: 'i:dandelion', go: 'yu_dandelion' },
    ] },
  yu_comfort: { who: 'yu', fx: 'f:yu_comfort', text: ['……阿福，你身上有太阳的味道。', '（过了很久，她擦了擦脸。）', '这棵樟树是妈妈种的。它长得这么好，那我也要长得这么好。'], go: 'yu_gear' },
  yu_dandelion: { who: 'yu', fx: 'f:yu_comfort;-i:dandelion;f:dandelion_used;m:m_promise', text: ['蒲公英……', '妈妈以前说，对着蒲公英吹气，种子会把话带到很远很远的地方。', '那我不对蛋糕许愿了。我对它许。', '（她鼓起腮帮子用力一吹。白色的小伞飞过樟树，飞过钟楼，飞向海那边。）', '妈妈，我十岁了。我过得很好。'], go: 'yu_gear' },
  yu_gear: { who: 'yu', go: [{ if: 'd:chen & !i:gear & !f:clock_fixed & !f:gear_yu', go: 'yu_gear2' }, { go: 'yu_ask' }] },
  yu_gear2: { who: 'yu', fx: 'i:gear;f:gear_yu', text: ['对了！你是不是在帮钟楼的陈爷爷找齿轮？阿杰说的。', '我的八音盒坏了好久，掉出来一个小铜齿轮。给你。', '反正它唱的那首歌，我已经会自己唱了。'], go: 'yu_ask' },
  yu_ask: { who: 'yu', text: ['阿福，周爷爷是不是生病了？大家说他会忘记所有人。', '他还会记得我吗？', '……我以后能帮你送信吗？镇上所有的路我都认识！'],
    choices: [
      { t: '【汪！】', fx: 'f:yu_helper;sfx:bark', go: 'yu_yes' },
      { t: '【歪头】', go: 'yu_tilt' },
    ] },
  yu_yes: { who: 'yu', text: ['真的？！说好了哦！', '我先回去吹蜡烛。吹完蜡烛，我就是见习邮差了！'] },
  yu_tilt: { who: 'yu', text: ['好吧……等我再长高一点。像这棵树一样高。', '我回去吹蜡烛啦。'] },
  yu_after: { who: 'yu', go: [{ if: 'f:dandelion_used', go: 'yu_after2' }, { go: 'yu_after1' }] },
  yu_after1: { who: 'yu', text: ['阿福！蛋糕好甜。我给你留了一块奶油……王老师说狗不能吃。', '对了，妈妈以前常带我去花坡吹蒲公英。不知道现在还有没有。'] },
  yu_after2: { who: 'yu', text: ['我许的愿，种子已经带走啦。', '你说，它们现在飞到哪儿了？'] },
  yu_dandelion_late: { who: 'yu', fx: '-i:dandelion;f:dandelion_used;m:m_promise', text: ['蒲公英！你从花坡叼来的？', '妈妈以前说，对着蒲公英吹气，种子会把话带到很远很远的地方。', '（她鼓起腮帮子用力一吹。白色的小伞飞过樟树，飞过钟楼，飞向海那边。）', '妈妈，我十岁了。我过得很好。'] },

  /* ===== 第四封 · 钟楼 · 陈师傅与苏婆婆 ===== */
  chen_first: { who: 'chen', text: ['（一个头发花白的老人，仰头看着钟楼。钟停在四点十分。）', '阿福啊。这钟停了四十年了，镇上的人都说我修不好。', '其实，是我不想修。'],
    choices: [
      { t: '【把那封信叼给他】', go: 'chen_give' },
      { t: '【歪头】', go: 'chen_story' },
    ] },
  chen_story: { who: 'chen', text: ['你想听？', '四十年前，我跟一个姑娘约好，下午四点在车站见，一起去城里。', '我等到四点十分。车开了，她没来。', '回来以后，我就把钟停在了四点十分。', '……你嘴里叼的是什么？给我的？'], go: 'chen_give' },
  chen_give: { who: 'chen', fx: 'd:chen;scene:letter_chen', text: ['我这辈子，就没收过几封信。', '（他戴上眼镜。手在发抖。）'], go: 'chen_give2' },
  chen_give2: { who: 'chen', fx: 'f:chen_need_gear', text: ['……', '她来过信。', '她叫我回来修钟。我却在这儿守着一座停了的钟，怪了她四十年。', '花坡上那间紫色屋顶的房子……她一个人住了好多年了。我每天都看得见那个屋顶。', '钟。我得先把钟修好。', '可里头缺一个铜齿轮，这么大。我找遍了镇子都没找到。'] },
  chen_wait: { who: 'chen', text: ['铜的，拇指那么大，齿要细。', '……找不到的话，我就这么走上花坡去？不行，不行。说好了钟响的。'] },
  chen_gear: { who: 'chen', text: ['你嘴里——', '这……这正是那个尺寸！'], choices: [{ t: '【把齿轮放在他手心】', go: 'chen_fix' }] },
  chen_fix: { who: 'chen', fx: '-i:gear;f:clock_fixed;c:kindness+1', text: ['你等着。你等着啊！', '（陈师傅冲进钟楼。里面传来叮叮当当的声音。咔哒。咔哒——）'], go: 'chen_fix2' },
  chen_fix2: { who: 'none', fx: 'bell', text: ['当——', '当——', '当——', '（四十年没响过的钟声，滚过广场，滚过小河，滚上了花坡。）', '（花坡上，紫色屋顶的小屋，门开了。）'] },
  chen_fixed: { who: 'chen', text: ['（陈师傅站在钟楼门口，满身是灰，手足无措。）', '她……她会来吗？', '四十年了，她说不定早忘了。'] },
  chen_together: { who: 'chen', text: ['四十年，我们俩隔着一个山坡，谁都没先开口。', '阿福，替我谢谢老周。告诉他，信送到了。晚是晚了点，可送到了。'] },

  su_first: { who: 'su', go: [{ if: 'd:chen', go: 'su_first_chen' }, { go: 'su_first0' }] },
  su_first0: { who: 'su', text: ['阿福呀，过来，婆婆这儿有饼干。', '今天怎么背着邮包？老周呢？……哦，对，他上山了。', '这花坡啊，以前常有一对母女来吹蒲公英。那个小姑娘，现在也该上小学了。', '（她望了一眼山下的钟楼。）那座钟，四十年没响了。'],
    choices: [{ t: '【叼住她的衣角，往钟楼方向拽】', go: 'su_pull' }, { t: '【摇尾巴】' }] },
  su_first_chen: { who: 'su', text: ['阿福，你从钟楼那边来？', '那个守钟的老头子，今天在钟楼下转了一上午的圈。', '我年轻时跟人约过：钟响的那天，就在钟楼下见。', '……可钟一直没响。'],
    choices: [{ t: '【叼住她的衣角，往钟楼方向拽】', go: 'su_pull' }, { t: '【摇尾巴】' }] },
  su_pull: { who: 'su', text: ['傻狗，钟没响呢。', '钟不响，我是不会下山的。我说话算话。'] },
  su_meet: { who: 'su', text: ['……你回来了。'], go: 'su_meet2' },
  su_meet2: { who: 'chen', text: ['我没走。我一直在这儿。'], go: 'su_meet3' },
  su_meet3: { who: 'su', text: ['我知道。我每天都看得见这座钟。'], go: 'su_meet4' },
  su_meet4: { who: 'chen', text: ['那封信……今天才到。在邮局的墙缝里压了四十年。'], go: 'su_meet5' },
  su_meet5: { who: 'su', text: ['……我就说嘛。', '你这个人，怎么可能不来。'], go: 'su_meet6' },
  su_meet6: { who: 'chen', text: ['现在开口……还来得及吗？'], go: 'su_meet7' },
  su_meet7: { who: 'su', fx: 'f:su_meet;m:m_clock', text: ['钟都响了。', '（她把手放进他的手心。你在两个人脚边，安安静静地趴下。）'] },
  su_together: { who: 'su', text: ['阿福，替我跟老周说声谢谢。', '他上个月来过花坡一次，站在我门口，好像要说什么，最后只说了句“今天天气真好”。', '……原来是想送这封信啊。'] },

  /* ===== 第五封 · 东滩 · 阿木 ===== */
  mu_first: { who: 'mu', text: ['（礁石上坐着一个头发乱糟糟的年轻人，盯着海。）', '老周的狗……你也是来劝我回去画画的？', '我画不出来了。', '周叔不记得我了。我上山去看他，他问我是谁。', '我想把那幅画画完送给他，可我连他的脸都画不好了。'],
    choices: [{ t: '【把信放在他膝盖上】', go: 'mu_give' }] },
  mu_give: { who: 'mu', fx: 'd:mu;scene:letter_mu', text: ['这是……美术学院的？三个月前就到了？', '（他翻到背面那张便条，看了很久。）'], go: 'mu_give2' },
  mu_give2: { who: 'mu', text: ['“路是走出来的”……他老这么说。', '报到截止是明天。今天傍晚，有最后一班车。', '可那幅画……我答应过要画完送他的。画不完，我走不了。'],
    choices: [
      { t: '【把那幅没画完的画放在他面前】', if: 'i:easel', go: 'mu_easel' },
      { t: '【歪着头看他】', go: 'mu_think' },
    ] },
  mu_think: { who: 'mu', fx: 'f:mu_think', text: ['你是说……让我自己决定？', '……我再想想。我再坐一会儿。'] },
  mu_think_after: { who: 'mu', text: ['（阿木还坐在礁石上。）', '桥头那幅画……我不敢回去看它。'] },
  mu_easel: { who: 'mu', fx: '-i:easel;i:painting;f:mu_go;m:m_road;c:kindness+1', text: ['……你把它叼来了。', '（他盯着那幅画看了很久，然后从口袋里摸出一支炭笔，在老邮差的眼角添了一道笑纹。）', '画完了。不是画得多好，是终于敢画完了。', '阿福，你帮我把这幅画带给周叔吧。', '我去赶车。'] },

  /* ===== 居民：线索与闲聊 ===== */
  qian_hub: { who: 'qian', go: [
    { if: 'f:bakery_seen & !f:lin_met & !d:lin', go: 'qian_lin' },
    { if: 'f:easel_seen & !d:mu & !f:mu_where', go: 'qian_mu' },
    { if: 'd:chen & !f:clock_fixed & !i:gear', go: 'qian_gear' },
    { if: 'c:delivered>=4', go: 'qian_late' },
    { go: 'qian_0' }] },
  qian_lin: { who: 'qian', fx: 'f:lin_where', text: ['找林姐？她每年今天都关店，跑去东边的车站坐一整天。', '别问为什么。问了她也只说“习惯了”。'] },
  qian_mu: { who: 'qian', fx: 'f:mu_where', text: ['阿木啊？那孩子这两天跟丢了魂似的，老往东滩的礁石那儿跑。', '一坐一下午，对着海发呆。'] },
  qian_gear: { who: 'qian', text: ['齿轮？我这儿只有酱油和火柴。', '码头的老海以前跑过船，船上的零碎他那儿多。就是那人脾气倔，得有耐心。'] },
  qian_late: { who: 'qian', text: ['今天镇上怪热闹的。', '码头说傍晚有船，车站说末班车上有人回来。连钟楼都……哎，老周要是看见就好了。'] },
  qian_0: { who: 'qian', text: ['阿福！今天这么正式，背着邮包呢？', '来，饼干。老规矩，不收钱。', '（你吃了饼干。是你最喜欢的那种。）'] },

  jie_hub: { who: 'jie', go: [
    { if: 'f:yu_missing & !d:yu', go: 'jie_yu' },
    { if: 'd:chen & !f:clock_fixed', go: 'jie_gear' },
    { if: 'f:clock_fixed', go: 'jie_bell' },
    { go: 'jie_0' }] },
  jie_yu: { who: 'jie', text: ['小雨今天生日！可她跑了。', '我看见她往学校后面去了……啊！我什么都没说！', '（他用两只手捂住了嘴。）'] },
  jie_gear: { who: 'jie', text: ['陈爷爷在找齿轮！我听见了！', '小雨的八音盒里就有一个铜的，可她宝贝得不得了。'] },
  jie_bell: { who: 'jie', text: ['钟响了钟响了！我妈说她这辈子第一次听见！', '阿福，汪一个！'] },
  jie_0: { who: 'jie', text: ['阿福！比赛跑步吗？', '……你在上班？狗也要上班吗？'] },

  liu_hub: { who: 'liu', go: [{ if: 'f:final_read', go: 'liu_final' }, { if: 'c:delivered>=3', go: 'liu_2' }, { go: 'liu_1' }] },
  liu_1: { who: 'liu', text: ['阿福，今天替老周上班呢？', '他啊，记不住事以后，还天天早上穿好制服，说要去上班。', '扣子都扣错了，还非说自己扣得对。'] },
  liu_2: { who: 'liu', text: ['老周送了三十八年信，一天没歇过。', '台风那年，他是蹚着齐腰深的水把信送到的。', '他说，信晚到一天，等信的人就多难过一天。'] },
  liu_final: { who: 'liu', text: ['要上山了？', '去吧。人老了，记不住名字，可还记得味道，记得声音，记得一起走过的路。', '你把这一路，都带上去给他。'] },
});
