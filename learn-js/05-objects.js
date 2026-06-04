// ============================================
// บทที่ 5 — Object
// วิธีรัน: node 05-objects.js
// ============================================

// Object คือกล่องที่เก็บข้อมูลหลายอย่างพร้อมกัน
// แทนที่จะมีตัวแปรแยกกันเยอะๆ แบบนี้:
//   let name = "CEO"
//   let level = 5
//   let xp = 1200
//
// รวมไว้ใน object เดียว:
//   let player = { name: "CEO", level: 5, xp: 1200 }
//
// เข้าถึงด้วย .ชื่อ หรือ ["ชื่อ"]
//   player.name    → "CEO"
//   player.level   → 5

// ตัวอย่าง:
let player = {
  name: "CEO",
  level: 5,
  xp: 1200,
  isAwesome: true
}

console.log(player.name)
console.log(player.level)
console.log(player)  // log ทั้ง object

// ============================================
// โจทย์ 1 — สร้าง Object
// ============================================
// สร้าง object ชื่อ quest ที่มี:
//   title = ชื่อ quest อะไรก็ได้
//   minutes = เวลา (ตัวเลข)
//   category = "Learning" / "Work" / "Physical"
//   done = true หรือ false
//
// แล้ว log ออกมาแบบนี้:
// "Quest: อ่านหนังสือ | 30 นาที | Learning"

// เขียนด้านล่าง:
let quest = {
  title: "อ่านหนังสือ",
  minutes: 30,
  category: "Learning",
  done: true
}

console.log(quest)


// ============================================
// โจทย์ 2 — แก้ค่าใน Object
// ============================================
// เพิ่ม xp ให้ player อีก 500
// แล้ว level ขึ้นเป็น 6
// แล้ว log player ใหม่ออกมา
//
// Hint: player.xp = player.xp + 500

// เขียนด้านล่าง:
player.xp = player.xp + 500
player.level = 6
console.log(player)

// ============================================
// โจทย์ 3 — Array of Objects
// ============================================
// นี่คือสิ่งที่ใช้บ่อยที่สุดในโค้ดจริง
// มี quests หลายอันเก็บใน array:

let quests = [
  { title: "อ่านหนังสือ", minutes: 30, done: true },
  { title: "ออกกำลังกาย", minutes: 45, done: false },
  { title: "เขียนโค้ด", minutes: 60, done: true },
  { title: "นั่งสมาธิ", minutes: 20, done: false }
]

// ให้ log เฉพาะ quest ที่ done === true ออกมาแบบนี้:
// "✅ อ่านหนังสือ"
// "✅ เขียนโค้ด"


//
// Hint: ใช้ .filter() แล้วต่อด้วย .forEach()

let questsdone = quests.filter(function(n) {
return n.done === true
})

questsdone.forEach(function(n) {
  console.log("✅"+ n.title )
})

// เขียนด้านล่าง:
