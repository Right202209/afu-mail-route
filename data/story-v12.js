/* 剧本（五）· v1.2：漂流瓶、失物招领，小卖部和教室里的对话。 */
(function () {
  const S = G.STORY, N = S.nodes;

  Object.assign(S.items, {
    bottle: { name: '漂流瓶', desc: '从海里漂来的玻璃瓶。信是写给“栖湾任何一个人”的。' },
    reply_bottle: { name: '回信的漂流瓶', desc: '小雨写好了回信，塞回瓶子里。要扔得远远的。' },
    lost_shoe: { name: '一只小运动鞋', desc: '纸条：“广场上跑得最快的孩子。”' },
    lost_glasses: { name: '老花镜', desc: '纸条：“井边看报总眯眼的人。”' },
    lost_keys: { name: '挂铃铛的钥匙', desc: '纸条：“总说自己什么都没丢的那位。”' },
  });

  S.quests.push(
    { id: 'bottle', title: '西滩 · 海那边的信', show: 'f:bottle_got',
      hints: [
        { if: 'f:bottle_done', text: '瓶子漂向雾岛了。往东漂，三天就到。' },
        { if: 'i:reply_bottle', text: '回信写好了。找个胳膊有劲、懂海的人，把瓶子扔得远远的。' },
        { if: 'd:yu', text: '这封信是一个九岁的孩子写的。也许小雨愿意回信？' },
        { text: '这封信是一个九岁的孩子写的。镇上有没有同龄的孩子愿意回信？' }] },
    { id: 'lost', title: '车站 · 失物招领', show: 'f:lost_open',
      hints: [
        { if: 'f:lost_shoe & f:lost_glasses & f:lost_keys', text: '三样东西都物归原主了。' },
        { text: '老周的纸条：鞋——广场上跑得最快的孩子；眼镜——井边看报总眯眼的人；钥匙——总说自己什么都没丢的那位。' }] },
  );

  S.scenes.bottle = { kind: 'letter', tag: '漂流瓶里的信', lines: ['给栖湾任何一个人：', '我住在雾岛，一个很小很小的岛。以前晚上，从我家窗户能看见你们那边的灯塔。最近看不见了。是灯坏了吗？', '我们岛上没有邮局。爸爸说，信扔进海里，总会到的。', '如果你收到了，能给我回信吗？随便写什么都好。', '——雾岛 · 阿汐（九岁）'] };

  Object.assign(N, {
    /* ===== 漂流瓶 ===== */
    pick_bottle: { who: 'none', fx: 'i:bottle;f:bottle_got;sfx:item;scene:bottle', text: ['（浪把一个玻璃瓶推上了沙滩。瓶子里卷着一张纸。）', '（你用爪子扒开软木塞——信是写给“栖湾任何一个人”的。）'] },
    yu_bottle: { who: 'yu', fx: '-i:bottle;i:reply_bottle;c:kindness+1', text: ['……雾岛？是海那边那个岛吗？', '她也在等信啊。', '（小雨从书包里掏出铅笔，趴在台阶上写了很久很久。）', '写好了！我告诉她，我们这儿也有一只会送信的狗。', '还告诉她……灯塔会再亮的。', '阿福，帮我把它扔回海里，扔得远远的。'] },
    hai_bottle: { who: 'hai', fx: '-i:reply_bottle;f:bottle_done;c:kindness+1', text: ['（老海看了看你嘴里的瓶子。）', '回信？给雾岛的？', '……我年轻时也往海里扔过瓶子。没人回。', '（他站起来，胳膊一抡。瓶子划了一道弧，落进很远很远的浪里。）', '往东漂，三天就到。', '……希望有人回。'] },

    /* ===== 失物招领 ===== */
    obj_lostbox: { who: 'none', go: [
      { if: 'f:lost_shoe & f:lost_glasses & f:lost_keys', go: 'lostbox_empty' },
      { if: 'f:lost_open', go: 'lostbox_note' }, { go: 'lostbox_open' }] },
    lostbox_open: { who: 'none', fx: 'f:lost_open;i:lost_shoe;i:lost_glasses;i:lost_keys;sfx:item', text: ['（车站的失物招领箱。木牌上写着：“周守信 代管”。）', '（里面躺着三样东西：一只小运动鞋、一副老花镜、一串挂着铃铛的钥匙。）', '（每一样上面，都夹着老周的纸条。）'] },
    lostbox_note: { who: 'none', text: ['（箱底只剩老周的字：“东西会等主人。主人也会等东西。”）'] },
    lostbox_empty: { who: 'none', text: ['（失物招领箱空了。木牌上，有人在“周守信”旁边添了两个字：阿福。）'] },
    jie_shoe: { who: 'jie', fx: '-i:lost_shoe;f:lost_shoe;c:kindness+1', text: ['我的鞋！！上个月在车站跑丢的那只！', '周爷爷说帮我收着……原来他真的收着。', '（阿杰单脚跳着把鞋套上，绕着广场跑了三圈。）'] },
    liu_glasses: { who: 'liu', fx: '-i:lost_glasses;f:lost_glasses;c:kindness+1', text: ['哎哟，我的老花镜！我还以为掉井里了。', '（刘奶奶戴上眼镜，眯了半年的眼睛一下子睁开了。）', '这下看清你了。……阿福，你瘦了。'] },
    qian_keys: { who: 'qian', fx: '-i:lost_keys;f:lost_keys;c:kindness+1', text: ['这……这是我仓库的钥匙？我说怎么半年没找着！', '我还跟人说，我钱某人从来不丢东西。', '（钱叔不好意思地挠挠头，塞给你一块饼干。）'] },

    /* ===== 小卖部里 ===== */
    obj_shop_shelf: { who: 'none', text: ['（货架上整整齐齐摆着罐头、肥皂、电池。）', '（最下面一层是狗粮，标签上写着：阿福专用，记周的账。）'] },
    obj_shop_book: { who: 'none', text: ['（柜台上放着一本赊账本。老周那一页写着：狗粮、电池、狗粮、信纸、狗粮……）', '（最后一行是钱叔的字：“不用还了。”）'] },
    obj_shop_postcards: { who: 'none', text: ['（抽屉里是一叠明信片，每张都盖着外地的邮戳，落款是“女儿”。）', '（每一张，都是老周送来的。）'] },

    /* ===== 教室里 ===== */
    obj_blackboard: { who: 'none', go: [{ if: 'd:yu', go: 'board2' }, { go: 'board1' }] },
    board1: { who: 'none', text: ['（黑板上写着今天的作文题：《我最想寄出的一封信》。）'] },
    board2: { who: 'none', text: ['（黑板上多了一行字：“祝小雨十岁生日快乐！”）', '（下面画满了歪歪扭扭的蛋糕，还有一只背邮包的狗。）'] },
    obj_teacher_desk: { who: 'none', text: ['（王老师的讲台上摞着作文本。最上面一本写着：）', '“我最想寄出的一封信，是给周爷爷的。我想跟他说：阿福每天都在等你。”'] },
    obj_yu_desk: { who: 'none', text: ['（小雨的课桌。桌角刻着一只小狗，旁边歪歪地写着“阿福”。）'] },
    obj_school_shelf: { who: 'none', text: ['（书架上有一本旧旧的《栖湾镇志》，翻开的那页写着：）', '“雾海之中，群岛相望。邮船往来，人们说：雾，是没送到的话变的。”'] },
  });

  // 接进旧角色
  S.npcs.yu.talk.unshift({ if: 'i:bottle & d:yu', go: 'yu_bottle' });
  S.npcs.hai.talk.unshift({ if: 'i:reply_bottle', go: 'hai_bottle' });
  N.jie_hub.go.unshift({ if: 'i:lost_shoe', go: 'jie_shoe' });
  N.liu_hub.go.unshift({ if: 'i:lost_glasses', go: 'liu_glasses' });
  N.qian_hub.go.unshift({ if: 'i:lost_keys', go: 'qian_keys' });

  // 尾声
  S.epilogues.splice(S.epilogues.length - 1, 0,
    { who: '雾岛', list: [
      { if: 'f:bottle_done & f:light_on', t: '一个月后，渔船从雾岛捎来一封没贴邮票的信：“灯塔又亮了！我每天晚上都看。——阿汐”。小吴说，这是栖湾邮局最远的一条邮路。' },
      { if: 'f:bottle_done', t: '一个月后，渔船从雾岛捎来一封没贴邮票的信：“我收到你的信了！——阿汐”。小吴说，这是栖湾邮局最远的一条邮路。' }] },
    { who: '车站', list: [
      { if: 'f:lost_shoe & f:lost_glasses & f:lost_keys', t: '车站的失物招领箱换了块新木牌：“阿福 代管”。' }] });
})();
