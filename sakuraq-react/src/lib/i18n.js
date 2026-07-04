// Tiny i18n: flat dictionary + {var} interpolation. Language lives in the store.

export const LANGS = ['th', 'en']

const DICT = {
  th: {
    // nav
    'nav.home': 'หน้าหลัก', 'nav.today': 'วันนี้', 'nav.history': 'ประวัติ', 'nav.store': 'ร้านค้า',
    // common
    'common.next': 'ต่อไป', 'common.back': 'กลับ', 'common.confirm': 'ยืนยัน', 'common.cancel': 'ยกเลิก',
    'common.save': 'บันทึก', 'common.discard': 'ทิ้ง', 'common.close': 'ปิด', 'common.enable': 'เปิดใช้งาน',
    'common.disable': 'ปิด', 'common.on': 'เปิด', 'common.off': 'ปิด', 'common.min': 'นาที', 'common.points': 'แต้ม',
    'common.day': 'วัน', 'common.done': 'เสร็จ',
    // home
    'home.today': 'แต้มวันนี้', 'home.viewToday': 'ดูวันนี้', 'home.level': 'เลเวล', 'home.lifetime': 'แต้มสะสม',
    'home.lifetimeSub': 'ตลอดกาล', 'home.start': 'เริ่มเควสกันเลย', 'home.streakDays': '{n} วัน',
    'home.namePrompt': 'เรียกคุณว่าอะไรดี?', 'home.lvPts': '{n}/100 แต้ม', 'home.defaultName': 'เพื่อน',
    'home.g.zero': 'มาลุยกันนะ', 'home.g.zeroSub': '{period}ยังไม่เริ่มเลย เริ่มเควสแรกกันมั้ย?',
    'home.g.low': 'ดีมากเลย', 'home.g.lowSub': 'เริ่มไป <b>{s}</b> แล้ว ไปต่อกันเถอะ!',
    'home.g.mid': 'กำลังมาแรง', 'home.g.midSub': '<b>{s}</b> แต้มแล้ว วันนี้เริ่ดมาก ✨',
    'home.g.near': 'สุดยอดไปเลย', 'home.g.nearSub': '<b>{s}</b>/100 อีกนิดเดียวก็เต็มแล้ว!',
    'home.g.max': 'เทพมาก!', 'home.g.maxSub': 'ทำครบ <b>100</b> แล้ววันนี้ พักได้เลยนะ 🌸',
    'period.morning': 'เช้านี้', 'period.afternoon': 'บ่ายนี้', 'period.evening': 'เย็นนี้', 'period.night': 'ค่ำนี้',
    // flow
    'flow.new': 'เริ่มเควสใหม่', 'flow.step.cat': 'เลือกหมวด', 'flow.step.name': 'ตั้งชื่อเควส', 'flow.step.dur': 'ตั้งเวลา',
    'flow.nameQ': 'เควสนี้ทำอะไร?', 'flow.namePh': 'เช่น อ่านหนังสือบทที่ 3', 'flow.recent': 'เควสล่าสุด',
    'flow.bonusOn': '✓ ปลดล็อกโบนัสได้ (+2/+4/+6)', 'flow.bonusOff': 'ต้อง ≥ 25 นาที ถึงมีลุ้นโบนัส',
    'flow.startNow': 'เริ่มเลย!', 'flow.dice': 'สุ่มเควสให้',
    // categories
    'cat.Learning': 'เรียนรู้', 'cat.Work/Project': 'งาน / โปรเจกต์', 'cat.Physical': 'ร่างกาย', 'cat.Connection': 'ความสัมพันธ์',
    'catDesc.Learning': 'อ่าน เรียน ฝึกทักษะใหม่', 'catDesc.Work/Project': 'งานจริง ชิ้นงาน ผลลัพธ์',
    'catDesc.Physical': 'ออกกำลัง ยืดเส้น ดูแลตัวเอง', 'catDesc.Connection': 'คนสำคัญ เพื่อน ครอบครัว',
    // run
    'run.focus': 'กำลังโฟกัส', 'run.paused': '⏸ หยุดชั่วคราว', 'run.overtime': 'เกินเวลาแล้ว!', 'run.end': 'จบเควส',
    // report
    'report.done': 'เควสสำเร็จ!', 'report.howLong': 'ทำไปกี่นาที?', 'report.willGet': 'จะได้', 'report.bonus': 'โบนัส +{n}',
    'report.reflectTitle': 'เขียนสะท้อน → รับโบนัส', 'report.reflectSub': 'บันทึกสิ่งที่ได้เรียนรู้ +2/+4/+6',
    'report.reflectNeed': 'ต้องทำ ≥ {min} นาทีก่อน', 'report.save': 'บันทึกเลย',
    'report.note': 'สะท้อนสั้นๆ ว่าได้อะไร (+2)', 'report.noteHint': '≥ 20 ตัวอักษร',
    'report.why': 'ทำไปทำไม / สำคัญยังไง (+4)', 'report.whyHint': '≥ 12 ตัวอักษร',
    'report.from': 'ก่อนหน้านี้…', 'report.to': 'ตอนนี้เปลี่ยนเป็น…', 'report.charHint': '≥ {n} ตัว',
    'report.proof': 'หลักฐาน / สิ่งที่ทำได้จริง (+6)', 'report.proofHint': '≥ 10 ตัวอักษร',
    // celebrate
    'celebrate.gained': 'ได้รับแต้ม', 'celebrate.bonus': '⚡ โบนัสคุณภาพ +{n}', 'celebrate.tap': 'แตะเพื่อไปต่อ',
    // today
    'today.eyebrow': 'วันนี้', 'today.title': 'ผลงานวันนี้', 'today.fromGoal': 'จาก {goal} แต้ม · {n} เควส',
    'today.empty': 'ยังไม่มีเควสวันนี้', 'today.emptySub': 'กดปุ่มเริ่มที่หน้าหลักได้เลย', 'today.deleted': 'ลบเควสแล้ว',
    'today.penalty': 'โดนหักจากพักนานเกิน',
    // history
    'history.eyebrow': 'ประวัติ', 'history.title': 'เส้นทางของคุณ', 'history.streak': 'สตรีค', 'history.level': 'เลเวล',
    'history.lifetime': 'แต้มรวม', 'history.range': '{n} วันล่าสุด', 'history.avg': 'เฉลี่ย {n}/วัน',
    'history.today': 'วันนี้', 'history.noQuest': 'วันนี้ไม่มีเควส',
    // store
    'store.eyebrow': 'ร้านค้า', 'store.title': 'แต่งแอปด้วยแต้ม', 'store.wallet': 'แต้มที่ใช้ได้',
    'store.walletNote': '* แต้มที่ใช้ได้ = แต้มสะสมทั้งหมด − ที่ใช้ไปแล้ว เลเวลและสตรีคไม่ลดนะ',
    'store.slot.startBtn': 'สีปุ่มเริ่มเควส', 'store.slot.dice': 'ลูกเต๋าสุ่มเควส', 'store.slot.accent': 'ธีมสีแอป',
    'store.free': 'ฟรี', 'store.equipped': 'กำลังใช้', 'store.tapEquip': 'แตะเพื่อใส่', 'store.tapUnequip': 'แตะเพื่อถอด',
    'store.notEnough': 'แต้มไม่พอ เก็บเพิ่มอีกนิด', 'store.bought': 'ซื้อ {name} สำเร็จ! 🎉',
    'store.equippedMsg': 'ใส่ {name} แล้ว', 'store.unequippedMsg': 'ถอดออกแล้ว',
    'store.btnIndigo': 'ปุ่มอินดิโก้', 'store.btnRose': 'ปุ่มโรสควอตซ์', 'store.btnEmerald': 'ปุ่มมรกต',
    'store.btnSunset': 'ปุ่มพระอาทิตย์ตก', 'store.btnFire': 'ปุ่มเปลวไฟ',
    'store.diceGlass': 'ลูกเต๋าแก้ว', 'store.diceMarble': 'ลูกเต๋าหินอ่อน', 'store.diceCatPink': 'ลูกเต๋าแมวชมพู', 'store.diceCatBlack': 'ลูกเต๋าแมวดำ',
    'store.themeAurora': 'ธีมออโรร่า', 'store.themeMidnight': 'ธีมมิดไนต์',
    // menu
    'menu.title': 'เมนู', 'menu.language': 'ภาษา', 'menu.gate': 'Morning Gate', 'menu.gateSub': 'ระบบวินัยตอนเช้า',
    'menu.break': 'Break Time', 'menu.breakSub': 'บังคับพักหลังเควส', 'menu.schedule': 'แผนเควส', 'menu.scheduleSub': 'วางแผนล่วงหน้า',
    'menu.reset': 'ล้างข้อมูลวันนี้', 'menu.resetSub': 'ลบเควสทั้งหมดของวันนี้', 'menu.resetDone': 'ล้างข้อมูลวันนี้แล้ว',
    'menu.about': 'SakuraQ · React edition', 'menu.langTH': 'ไทย', 'menu.langEN': 'English',
    // gate
    'gate.title': 'Morning Gate', 'gate.desc': 'ตั้งเวลาปลุกวินัย — ต้องเริ่มเควสภายใน {limit} นาทีหลังเวลาที่ตั้ง ไม่งั้นแอปล็อก {days} วัน',
    'gate.enable': 'เปิด Morning Gate', 'gate.time': 'เวลาปลุก', 'gate.saved': 'บันทึกการตั้งค่าแล้ว',
    'gate.armed': 'ถึงเวลาแล้ว! รีบเริ่มเควส', 'gate.armedSub': 'เหลือ {time} · เริ่มเควส ≥ {q} นาที',
    'gate.passed': 'ผ่าน Gate วันนี้แล้ว 🎉', 'gate.passedSub': 'ได้โบนัส +{n} แต้ม',
    'gate.locked': 'ถูกล็อก', 'gate.lockedSub': 'พลาด Gate — ปลดล็อกได้ {n} วัน', 'gate.unlock': 'ปลดล็อกเลย',
    'gate.unlockConfirm': 'ปลดล็อกและเริ่มใหม่?', 'gate.bonusToast': 'ผ่าน Gate! +{n} แต้ม 🌅',
    // break
    'break.title': 'Break Time', 'break.desc': 'หลังจบเควสจะบังคับพัก {free} นาที + ครึ่งหนึ่งของเวลาเควส ถ้าพักนานเกินจะโดนหักแต้ม',
    'break.enable': 'เปิด Break Time', 'break.resting': 'กำลังพัก', 'break.restLabel': 'เวลาพักคงเหลือ',
    'break.grace': 'ได้เวลากลับมาแล้ว!', 'break.over': 'พักนานเกินไป!', 'break.overSub': 'เริ่มเควสตอนนี้จะโดนหัก {n} แต้ม',
    'break.penaltyToast': 'พักนานเกิน −{n} แต้ม', 'break.cooldown': 'ปรับได้อีกครั้งใน {n}',
    // schedule
    'sched.title': 'แผนเควส', 'sched.desc': 'วางแผนเควสไว้ล่วงหน้า แล้วกดเริ่มได้เลย', 'sched.add': 'เพิ่มแผน',
    'sched.empty': 'ยังไม่มีแผน', 'sched.emptySub': 'เพิ่มเควสที่อยากทำไว้ล่วงหน้า', 'sched.start': 'เริ่ม',
    'sched.namePh': 'จะทำอะไร?', 'sched.banner': 'มีแผนเควสรออยู่ {n} อัน!', 'sched.added': 'เพิ่มแผนแล้ว',
    // dice
    'dice.title': 'สุ่มเควส', 'dice.roll': 'ทอยลูกเต๋า', 'dice.again': 'สุ่มใหม่', 'dice.use': 'ใช้อันนี้',
  },
  en: {
    'nav.home': 'Home', 'nav.today': 'Today', 'nav.history': 'History', 'nav.store': 'Store',
    'common.next': 'Next', 'common.back': 'Back', 'common.confirm': 'Confirm', 'common.cancel': 'Cancel',
    'common.save': 'Save', 'common.discard': 'Discard', 'common.close': 'Close', 'common.enable': 'Enable',
    'common.disable': 'Disable', 'common.on': 'On', 'common.off': 'Off', 'common.min': 'min', 'common.points': 'pts',
    'common.day': 'd', 'common.done': 'Done',
    'home.today': "Today's points", 'home.viewToday': 'View today', 'home.level': 'Level', 'home.lifetime': 'Total',
    'home.lifetimeSub': 'all time', 'home.start': "Let's start a quest", 'home.streakDays': '{n}d',
    'home.namePrompt': 'What should I call you?', 'home.lvPts': '{n}/100 pts', 'home.defaultName': 'friend',
    'home.g.zero': "Let's go", 'home.g.zeroSub': "Nothing {period} yet — start your first quest?",
    'home.g.low': 'Nice start', 'home.g.lowSub': "You're at <b>{s}</b> — keep going!",
    'home.g.mid': "You're on fire", 'home.g.midSub': '<b>{s}</b> points already. Crushing it ✨',
    'home.g.near': 'Amazing', 'home.g.nearSub': '<b>{s}</b>/100 — almost full!',
    'home.g.max': 'Legendary!', 'home.g.maxSub': 'You hit <b>100</b> today. Go rest 🌸',
    'period.morning': 'this morning', 'period.afternoon': 'this afternoon', 'period.evening': 'this evening', 'period.night': 'tonight',
    'flow.new': 'New quest', 'flow.step.cat': 'Pick a category', 'flow.step.name': 'Name it', 'flow.step.dur': 'Set time',
    'flow.nameQ': 'What will you do?', 'flow.namePh': 'e.g. Read chapter 3', 'flow.recent': 'Recent',
    'flow.bonusOn': '✓ Bonus unlocked (+2/+4/+6)', 'flow.bonusOff': 'Need ≥ 25 min for a bonus',
    'flow.startNow': "Let's go!", 'flow.dice': 'Roll a quest',
    'cat.Learning': 'Learning', 'cat.Work/Project': 'Work / Project', 'cat.Physical': 'Physical', 'cat.Connection': 'Connection',
    'catDesc.Learning': 'Read, study, learn skills', 'catDesc.Work/Project': 'Real work, output',
    'catDesc.Physical': 'Exercise, stretch, self-care', 'catDesc.Connection': 'People who matter',
    'run.focus': 'Focusing', 'run.paused': '⏸ Paused', 'run.overtime': 'Overtime!', 'run.end': 'End quest',
    'report.done': 'Quest complete!', 'report.howLong': 'How many minutes?', 'report.willGet': "You'll get", 'report.bonus': 'Bonus +{n}',
    'report.reflectTitle': 'Reflect → earn bonus', 'report.reflectSub': 'Note what you learned +2/+4/+6',
    'report.reflectNeed': 'Need ≥ {min} min first', 'report.save': 'Save it',
    'report.note': 'Short reflection: what did you get? (+2)', 'report.noteHint': '≥ 20 chars',
    'report.why': 'Why / why it matters (+4)', 'report.whyHint': '≥ 12 chars',
    'report.from': 'Before…', 'report.to': 'Now changed to…', 'report.charHint': '≥ {n} chars',
    'report.proof': 'Proof / what you actually did (+6)', 'report.proofHint': '≥ 10 chars',
    'celebrate.gained': 'Points earned', 'celebrate.bonus': '⚡ Quality bonus +{n}', 'celebrate.tap': 'Tap to continue',
    'today.eyebrow': 'Today', 'today.title': "Today's work", 'today.fromGoal': 'of {goal} pts · {n} quests',
    'today.empty': 'No quests today yet', 'today.emptySub': 'Tap start on the home screen', 'today.deleted': 'Quest deleted',
    'today.penalty': 'Penalty from over-resting',
    'history.eyebrow': 'History', 'history.title': 'Your journey', 'history.streak': 'Streak', 'history.level': 'Level',
    'history.lifetime': 'Total', 'history.range': 'Last {n} days', 'history.avg': 'avg {n}/day',
    'history.today': 'Today', 'history.noQuest': 'No quests this day',
    'store.eyebrow': 'Store', 'store.title': 'Customize with points', 'store.wallet': 'Spendable points',
    'store.walletNote': '* Spendable = total earned − spent. Level & streak never drop.',
    'store.slot.startBtn': 'Start-button color', 'store.slot.dice': 'Quest dice', 'store.slot.accent': 'App theme',
    'store.free': 'Free', 'store.equipped': 'Equipped', 'store.tapEquip': 'Tap to equip', 'store.tapUnequip': 'Tap to remove',
    'store.notEnough': 'Not enough points yet', 'store.bought': 'Bought {name}! 🎉',
    'store.equippedMsg': 'Equipped {name}', 'store.unequippedMsg': 'Removed',
    'store.btnIndigo': 'Indigo', 'store.btnRose': 'Rose Quartz', 'store.btnEmerald': 'Emerald',
    'store.btnSunset': 'Sunset', 'store.btnFire': 'Flame',
    'store.diceGlass': 'Glass die', 'store.diceMarble': 'Marble die', 'store.diceCatPink': 'Pink cat die', 'store.diceCatBlack': 'Black cat die',
    'store.themeAurora': 'Aurora', 'store.themeMidnight': 'Midnight',
    'menu.title': 'Menu', 'menu.language': 'Language', 'menu.gate': 'Morning Gate', 'menu.gateSub': 'Morning discipline',
    'menu.break': 'Break Time', 'menu.breakSub': 'Forced rest after a quest', 'menu.schedule': 'Quest plan', 'menu.scheduleSub': 'Plan ahead',
    'menu.reset': "Clear today's data", 'menu.resetSub': "Delete today's quests", 'menu.resetDone': "Today's data cleared",
    'menu.about': 'SakuraQ · React edition', 'menu.langTH': 'ไทย', 'menu.langEN': 'English',
    'gate.title': 'Morning Gate', 'gate.desc': 'Discipline alarm — start a quest within {limit} min of your set time, or the app locks for {days} days',
    'gate.enable': 'Enable Morning Gate', 'gate.time': 'Alarm time', 'gate.saved': 'Settings saved',
    'gate.armed': "It's time! Start a quest now", 'gate.armedSub': '{time} left · start ≥ {q} min',
    'gate.passed': 'Gate passed today 🎉', 'gate.passedSub': 'Bonus +{n} points',
    'gate.locked': 'Locked', 'gate.lockedSub': 'Missed the gate — unlock in {n} days', 'gate.unlock': 'Unlock now',
    'gate.unlockConfirm': 'Unlock and restart?', 'gate.bonusToast': 'Gate passed! +{n} pts 🌅',
    'break.title': 'Break Time', 'break.desc': 'After a quest you must rest {free} min + half the quest time. Resting too long costs points.',
    'break.enable': 'Enable Break Time', 'break.resting': 'Resting', 'break.restLabel': 'Break time left',
    'break.grace': 'Time to get back!', 'break.over': 'Resting too long!', 'break.overSub': 'Starting now costs {n} points',
    'break.penaltyToast': 'Over-rested −{n} points', 'break.cooldown': 'Adjustable again in {n}',
    'sched.title': 'Quest plan', 'sched.desc': 'Plan quests ahead and start with one tap', 'sched.add': 'Add plan',
    'sched.empty': 'No plans yet', 'sched.emptySub': 'Add quests you want to do', 'sched.start': 'Start',
    'sched.namePh': 'What to do?', 'sched.banner': '{n} planned quest(s) waiting!', 'sched.added': 'Plan added',
    'dice.title': 'Random quest', 'dice.roll': 'Roll the dice', 'dice.again': 'Roll again', 'dice.use': 'Use this',
  },
}

export function translate(lang, key, vars) {
  const table = DICT[lang] || DICT.th
  let s = table[key]
  if (s == null) s = DICT.th[key] != null ? DICT.th[key] : key
  if (vars) {
    for (const k in vars) s = s.replaceAll(`{${k}}`, String(vars[k]))
  }
  return s
}
