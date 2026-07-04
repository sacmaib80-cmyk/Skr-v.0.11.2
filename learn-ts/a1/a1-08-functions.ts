// ==========================================================
// A1 — บทที่ 08: ฟังก์ชัน (Function) — บทแรกที่เริ่มเขียน function เอง!
// ==========================================================
//
// 🎯 บทนี้ต้องใช้:
//   - เขียนฟังก์ชันของตัวเอง:
//
//       function ชื่อ(พารามิเตอร์: type): typeที่คืน {
//         return ...;
//       }
//
//   - พารามิเตอร์ = ค่าที่ส่งเข้าไป
//   - return      = ค่าที่ส่งกลับออกมา
//
// ⚠️ ก่อนหน้านี้เราทำทุกอย่างเป็นบรรทัดตรงๆ
//    บทนี้เอาโค้ดมา "ห่อเป็นฟังก์ชัน" เพื่อเรียกใช้ซ้ำได้
//    (พอเข้าใจบทนี้แล้ว ค่อยไปทำโจทย์จริงในโฟลเดอร์ toi/)
// ----------------------------------------------------------


// ── ตัวอย่าง ──────────────────────────────────────────────
function add(a: number, b: number): number {
  return a + b;
}
console.log(add(2, 3));   // 5
console.log(add(10, 20)); // 30  (เรียกซ้ำด้วยค่าใหม่ได้เลย)


// ── โจทย์ 1 ───────────────────────────────────────────────
// เขียนฟังก์ชัน  square  รับ number 1 ตัว คืนค่ายกกำลังสอง (n × n)
//   เรียก square(4)  ต้องได้:  16

function square(n: number): number {
  // เขียนตรงนี้ 👇

}

console.log(square(4)); // 16


// ── โจทย์ 2 ───────────────────────────────────────────────
// เขียนฟังก์ชัน  sayHello  รับชื่อ (string) คืนข้อความทักทาย
//   เรียก sayHello("Fluke")  ต้องได้:  Hello, Fluke!
//
// 💡 hint: ใช้ template literal  `Hello, ${name}!`

function sayHello(name: string): string {
  // เขียนตรงนี้ 👇

}

console.log(sayHello("Fluke")); // Hello, Fluke!


// ── โจทย์ 3 ───────────────────────────────────────────────
// เขียนฟังก์ชัน  isEven  รับ number คืน boolean ว่าเป็นเลขคู่ไหม
//   เรียก isEven(10) ต้องได้ true,  isEven(7) ต้องได้ false
//
// 💡 hint: เลขคู่คือ  n % 2 === 0

function isEven(n: number): boolean {
  // เขียนตรงนี้ 👇

}

console.log(isEven(10)); // true
console.log(isEven(7));  // false


// ── โจทย์ 4 ───────────────────────────────────────────────
// เขียนฟังก์ชัน  maxOf  รับ number 2 ตัว คืนตัวที่มากกว่า
//   เรียก maxOf(3, 9) ต้องได้:  9
//
// 💡 hint: ข้างในใช้ if/else ได้เลย

function maxOf(a: number, b: number): number {
  // เขียนตรงนี้ 👇

}

console.log(maxOf(3, 9)); // 9


// ── โจทย์ 5 ───────────────────────────────────────────────
// เขียนฟังก์ชัน  greetByLang  รับ name (string) และ lang (string, optional)
//   - ถ้าไม่ส่ง lang        → คืน "สวัสดี, <name>"
//   - ถ้าส่ง lang = "en"    → คืน "Hello, <name>"
//
// 💡 hint: พารามิเตอร์ optional ใส่ ? ต่อท้าย  →  lang?: string

function greetByLang(name: string, lang?: string): string {
  // เขียนตรงนี้ 👇

}

console.log(greetByLang("Fluke"));       // สวัสดี, Fluke
console.log(greetByLang("Fluke", "en")); // Hello, Fluke
