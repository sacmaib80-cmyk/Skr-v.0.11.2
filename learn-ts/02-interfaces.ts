// TS 02 — Interface & Type Alias

// 1. Interface — กำหนดรูปแบบของ object
interface User {
  name: string;
  age: number;
  email?: string; // optional
}

const user: User = {
  name: "Fluke",
  age: 25,
};

// 2. Function ที่รับ interface
function printUser(u: User): void {
  console.log(`${u.name} (${u.age})`);
  if (u.email) console.log(`Email: ${u.email}`);
}

printUser(user);

// 3. Type Alias — คล้าย interface แต่ยืดหยุ่นกว่า
type Point = {
  x: number;
  y: number;
};

type Status = "active" | "inactive" | "banned"; // Union ของค่าที่กำหนด

let p: Point = { x: 10, y: 20 };
let s: Status = "active";
// s = "deleted"; // Error!

// 4. Interface vs Type ต่างกันตรงไหน?
// Interface → extend ได้ (OOP style)
// Type     → Union/Intersection ได้ง่ายกว่า

interface Animal {
  name: string;
}

interface Dog extends Animal {
  breed: string;
}

const dog: Dog = { name: "Buddy", breed: "Golden" };
console.log(dog);

// 5. Readonly — ป้องกันแก้ไข
interface Config {
  readonly apiUrl: string;
  timeout: number;
}

const config: Config = { apiUrl: "https://api.example.com", timeout: 3000 };
// config.apiUrl = "other"; // Error!
config.timeout = 5000;     // OK

console.log(config);
