// ── SakuraQ core constants (ported faithfully from the vanilla app) ──

// Scoring rules — must match the original engine.
export const RULES = {
  basePerMinute: 0.4,
  bonusMinMinutes: 25,           // no bonus below this
  baseCapPerQuestNamePerDay: 60, // base minutes cap per quest-name per day
  dayGoal: 100,                  // progress bar target
  pointsPerLevel: 100,
}

// Categories with their signature gradients (from the original CSS).
export const CATEGORIES = [
  {
    id: 'Learning',
    label: 'เรียนรู้',
    labelEn: 'Learning',
    color: '#10b981',
    grad: ['#34d399', '#059669'],
    soft: 'rgba(52,211,153,0.16)',
    desc: 'อ่าน เรียน ฝึกทักษะใหม่',
  },
  {
    id: 'Work/Project',
    label: 'งาน / โปรเจกต์',
    labelEn: 'Work / Project',
    color: '#3b82f6',
    grad: ['#60a5fa', '#2563eb'],
    soft: 'rgba(96,165,250,0.16)',
    desc: 'งานจริง ชิ้นงาน ผลลัพธ์',
  },
  {
    id: 'Physical',
    label: 'ร่างกาย',
    labelEn: 'Physical',
    color: '#8b5cf6',
    grad: ['#a78bfa', '#7c3aed'],
    soft: 'rgba(167,139,250,0.18)',
    desc: 'ออกกำลัง ยืดเส้น ดูแลตัวเอง',
  },
  {
    id: 'Connection',
    label: 'ความสัมพันธ์',
    labelEn: 'Connection',
    color: '#ec4899',
    grad: ['#f472b6', '#db2777'],
    soft: 'rgba(244,114,182,0.16)',
    desc: 'คนสำคัญ เพื่อน ครอบครัว',
  },
]

export const CAT_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]))

// Quick-pick durations (minutes) for the start flow.
export const DURATION_PRESETS = [15, 25, 45, 60, 90]

// ── Morning Gate (discipline lock) ──
export const GATE_RULES = {
  limitMin: 10, // minutes after trigger time to start a qualifying quest
  qualifyMin: 3, // quest must reach this many base minutes to count
  bonusPoints: 6, // reward for passing the gate
  lockDays: 7, // lock length after a miss
}

// ── Break Time (forced rest + penalty for over-resting) ──
export const BREAK_RULES = {
  freeMins: 10, // base rest granted
  graceMs: 60 * 1000, // 1 min grace after break ends
  toggleCooldownMs: 2 * 60 * 60 * 1000, // 2h between enable/disable
  // penalty by minutes past the grace window before you get back to work
  tiers: [
    { minOver: 1, maxOver: 20, pts: 2 },
    { minOver: 21, maxOver: 59, pts: 4 },
    { minOver: 60, maxOver: Infinity, pts: 6 },
  ],
}

// ── Random-quest pools (per category) for the dice generator ──
export const QUEST_POOLS = {
  Learning: ['อ่านหนังสือ', 'ทบทวนบทเรียน', 'ดูคอร์สออนไลน์', 'ฝึกคำศัพท์', 'จดสรุปความรู้', 'ฝึกเขียนโปรแกรม', 'อ่านบทความ'],
  'Work/Project': ['เขียนโค้ดฟีเจอร์', 'ออกแบบ UI', 'เคลียร์อีเมล', 'วางแผนงาน', 'รีวิวงานตัวเอง', 'เขียนเอกสาร', 'ทำสไลด์'],
  Physical: ['วิ่ง', 'โยคะ', 'เวทเทรนนิ่ง', 'ยืดเส้น', 'เดินเร็ว', 'วิดพื้น', 'คาร์ดิโอ'],
  Connection: ['โทรหาครอบครัว', 'นัดเจอเพื่อน', 'เขียนขอบคุณใครสักคน', 'ทักคนสำคัญ', 'ฟังเพื่อนระบาย', 'ส่งข้อความให้กำลังใจ'],
}
export const QUEST_POOLS_EN = {
  Learning: ['Read a book', 'Review a lesson', 'Watch a course', 'Practice vocabulary', 'Write notes', 'Practice coding', 'Read an article'],
  'Work/Project': ['Build a feature', 'Design UI', 'Clear inbox', 'Plan the work', 'Self-review work', 'Write docs', 'Make slides'],
  Physical: ['Run', 'Yoga', 'Weight training', 'Stretch', 'Brisk walk', 'Push-ups', 'Cardio'],
  Connection: ['Call family', 'Meet a friend', 'Write a thank-you', 'Message someone dear', 'Listen to a friend', 'Send encouragement'],
}
export const DICE_DURATIONS = [15, 20, 25, 30, 45]

// Store catalog — cosmetics bought with earned points.
// slot: startBtn | dice | accent. `nameKey` resolves via i18n.
export const STORE_ITEMS = [
  // ── start-button skins ──
  { id: 'btn-indigo', slot: 'startBtn', nameKey: 'store.btnIndigo', price: 0, swatch: 'linear-gradient(135deg,#5b6af0,#7c7de8)', def: true },
  { id: 'btn-rose', slot: 'startBtn', nameKey: 'store.btnRose', price: 40, swatch: 'linear-gradient(135deg,#fb7185,#f472b6)' },
  { id: 'btn-emerald', slot: 'startBtn', nameKey: 'store.btnEmerald', price: 40, swatch: 'linear-gradient(135deg,#34d399,#059669)' },
  { id: 'btn-sunset', slot: 'startBtn', nameKey: 'store.btnSunset', price: 80, swatch: 'linear-gradient(135deg,#fbbf24,#f97316,#ef4444)' },
  { id: 'btn-fire', slot: 'startBtn', nameKey: 'store.btnFire', price: 120, swatch: 'linear-gradient(135deg,#f97316,#ef4444)', fire: true },

  // ── dice skins (real PNG art) ──
  { id: 'dice-glass', slot: 'dice', nameKey: 'store.diceGlass', price: 60, img: '/dice-glass.png' },
  { id: 'dice-marble', slot: 'dice', nameKey: 'store.diceMarble', price: 60, img: '/dice-marble.png' },
  { id: 'dice-catpink', slot: 'dice', nameKey: 'store.diceCatPink', price: 120, img: '/dice-catpink.png' },
  { id: 'dice-catblack', slot: 'dice', nameKey: 'store.diceCatBlack', price: 120, img: '/dice-catblack.png' },

  // ── accent themes ──
  { id: 'theme-aurora', slot: 'accent', nameKey: 'store.themeAurora', price: 150, swatch: 'linear-gradient(135deg,#2dd4bf,#a78bfa,#f472b6)', accent: ['#2dd4bf', '#a78bfa'] },
  { id: 'theme-midnight', slot: 'accent', nameKey: 'store.themeMidnight', price: 220, swatch: 'linear-gradient(135deg,#312e81,#5b6af0)', accent: ['#6366f1', '#818cf8'] },
]
