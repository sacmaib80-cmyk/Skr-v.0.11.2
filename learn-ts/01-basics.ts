// TS 01 — Types พื้นฐาน

// 1. Type Annotation
let name: string = "Fluke";
let age: number = 25;
let isActive: boolean = true;

// 2. ต่างจาก JS ตรงที่กำหนด type แล้วเปลี่ยนไม่ได้
// age = "twenty-five";  // Error!

// 3. Type Inference — TS เดาเองได้ ไม่ต้องเขียน type ทุกครั้ง
let score = 100;        // TS รู้ว่าเป็น number อัตโนมัติ
let greeting = "Hello"; // string

// 4. Array
let numbers: number[] = [1, 2, 3, 4, 5];
let names: string[] = ["Alice", "Bob", "Charlie"];

// 5. Tuple — array ที่กำหนดจำนวนและชนิดแน่นอน
let person: [string, number] = ["Fluke", 25];

// 6. Union Type — รับได้หลาย type
let id: string | number = 101;
id = "ABC-101"; // ได้

// 7. Any — หลีกเลี่ยง (ทำให้ TS ไม่ช่วย)
let anything: any = "hello";
anything = 42; // ไม่ error แต่ไม่แนะนำ

// 8. Function with types
function add(a: number, b: number): number {
  return a + b;
}

function greet(name: string): string {
  return `Hello, ${name}!`;
}

// 9. Optional parameter ใส่ ? ต่อท้าย
function introduce(name: string, age?: number): string {
  if (age !== undefined) {
    return `${name}, ${age} ปี`;
  }
  return name;
}

console.log(add(10, 20));           // 30
console.log(greet("Fluke"));        // Hello, Fluke!
console.log(introduce("Fluke"));    // Fluke
console.log(introduce("Fluke", 25)); // Fluke, 25 ปี
