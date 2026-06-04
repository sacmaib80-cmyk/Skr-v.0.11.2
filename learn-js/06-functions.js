// ============================================
// บทที่ 6 — Arrow Function & Destructuring
// วิธีรัน: node 06-functions.js
// ============================================

// ============================================
// Part 1: Arrow Function
// ============================================
// function ธรรมดาที่เคยเขียน:
// function greet(name) {
//   return "สวัสดี " + name
// }

// เขียนแบบ arrow function ได้เลย:
// const greetArrow = (name) => {
//   return "สวัสดี " + name
// }

// ถ้า return บรรทัดเดียว ย่อได้อีก:
// const greetShort = (name) => "สวัสดี " + name



// console.log(greet("CEO"))
// console.log(greetArrow("CEO"))
// console.log(greetShort("CEO"))

// ============================================
// Part 2: Destructuring — Object
// ============================================
// แทนที่จะเข้าถึงทีละตัวแบบนี้:
// let player = { name: "CEO", level: 6, xp: 1700 }
// console.log(player.name)
// console.log(player.level)

// แกะออกมาใส่ตัวแปรได้เลยแบบนี้:
// const { name, level, xp } = player
// console.log(name)   → "CEO"
// console.log(level)  → 6
// console.log(xp)     → 1700


// ============================================
// Part 3: Destructuring — Array
// ============================================
// const colors = ["แดง", "เขียว", "น้ำเงิน"]
// const [first, second, third] = colors
// console.log(first)   → "แดง"
// console.log(second)  → "เขียว"
// console.log(third)   → "น้ำเงิน"

// ============================================
// โจทย์ 1 — Arrow Function
// ============================================
// เขียน arrow function ชื่อ multiply
// รับ 2 parameter: a, b
// return ผลคูณของสองตัว
// แล้ว log: multiply(4, 5) → ต้องได้ 20

// เขียนด้านล่าง:


const multiply = (a,b) => {
  return a * b
}

console.log(multiply(4,5))
// ============================================
// โจทย์ 2 — Destructuring Object
// ============================================
// มี object นี้อยู่:
let quest = {
  title: "เขียนโค้ด",
  minutes: 60,
  done: true
}

// ให้แกะ title, minutes, done ออกมาด้วย destructuring
// แล้ว log แบบนี้: "เขียนโค้ด | 60 นาที | done: true"
// (ใช้ template string)

// เขียนด้านล่าง:
const { title, minutes, done } = quest

console.log(`${title} | ${minutes} นาที | done: ${done}`)


// ============================================
// โจทย์ 3 — รวมกัน
// ============================================
// มี array of objects นี้:
let quests = [
  { title: "อ่านหนังสือ", minutes: 30, done: true },
  { title: "ออกกำลังกาย", minutes: 45, done: false },
  { title: "เขียนโค้ด", minutes: 60, done: true },
]

// ให้เขียน arrow function ชื่อ showDone
// รับ array เข้ามา 1 ตัว
// filter เอาเฉพาะที่ done === true
// แล้ว forEach log ออกมาแบบนี้:
// "✅ อ่านหนังสือ — 30 นาที"
// "✅ เขียนโค้ด — 60 นาที"
//
// Hint: ข้างใน forEach ใช้ destructuring แกะ title กับ minutes ออกมาได้เลย

let showDone = quests.filter((n) => {
return n.done === true
})

showDone.forEach((n) => {
    console.log("✅ "+ n.title +" - " + n.minutes)
})
// เขียนด้านล่าง:
