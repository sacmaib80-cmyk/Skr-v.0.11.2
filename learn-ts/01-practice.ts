// TS 01 — แบบฝึกหัด (ลองเขียนเอง)

// ข้อ 1: ประกาศตัวแปรให้ถูก type
// ชื่อของคุณ, อายุ, และว่าชอบเล่นเกมไหม
let myName: string = "film"; // เติมค่าของคุณ
let myAge:  number = 18;// เติมค่าของคุณ
let likesGames: boolean = true; // true หรือ false


// ข้อ 2: ประกาศ array ของตัวเลข 5 ตัว แล้ว log ตัวแรก
let scores: number[] = [1 , 2 ,3 ,4 ,5]// เติม
console.log(scores[0]);

// ข้อ 3: ประกาศ Union Type ที่รับได้ทั้ง string และ number
// แล้วลองเปลี่ยนค่าทั้งสองแบบ
let userId: string | number = 501;
userId = "user-501";
// เติม


// ข้อ 4: เขียนฟังก์ชัน multiply รับตัวเลข 2 ตัว คืนค่าผลคูณ
function multiply(a: number, b: number): number {
  // เติม
  return a * b;
}

console.log(multiply(4, 5)); // ต้องได้ 20


// ข้อ 5: เขียนฟังก์ชัน greeting
// รับ name (string) และ lang (string) ที่เป็น optional
// ถ้าไม่ส่ง lang มา → คืน "สวัสดี, <name>"
// ถ้าส่ง lang = "en"  → คืน "Hello, <name>"
function greeting(name: string , lang?: string): string {
  // เติม
  if (lang === "en") {
    return "Hello, " + name;
  }
  return "สวัสดี," + name;
}

console.log(greeting("Fluke"));      // สวัสดี, Fluke
console.log(greeting("Fluke", "en")); // Hello, Fluke
