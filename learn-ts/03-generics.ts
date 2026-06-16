// TS 03 — Generics (เทพสุด ต้องรู้)

// 1. Generic Function — ฟังก์ชันที่ทำงานกับ type ใดก็ได้
function identity<T>(value: T): T {
  return value;
}

console.log(identity<string>("Hello")); // Hello
console.log(identity<number>(42));      // 42
console.log(identity(true));           // TS เดา type เองได้

// 2. Generic กับ Array
function firstItem<T>(arr: T[]): T | undefined {
  return arr[0];
}

console.log(firstItem([1, 2, 3]));        // 1
console.log(firstItem(["a", "b", "c"])); // a

// 3. Generic Interface
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

interface Quest {
  id: number;
  name: string;
  points: number;
}

const questResponse: ApiResponse<Quest> = {
  data: { id: 1, name: "อ่านหนังสือ 30 นาที", points: 12 },
  status: 200,
  message: "ok",
};

console.log(questResponse.data.name); // อ่านหนังสือ 30 นาที

// 4. Generic กับ Constraint
function getLength<T extends { length: number }>(value: T): number {
  return value.length;
}

console.log(getLength("hello"));     // 5
console.log(getLength([1, 2, 3]));   // 3
// console.log(getLength(42));       // Error! number ไม่มี .length

// 5. Utility Types (built-in generics ที่ TS ให้มา)
interface Todo {
  title: string;
  completed: boolean;
  priority: number;
}

// Partial — ทุก field กลายเป็น optional
type PartialTodo = Partial<Todo>;
const draft: PartialTodo = { title: "Buy milk" }; // ไม่ต้องครบ

// Required — ทุก field บังคับ (ตรงข้าม Partial)
type RequiredTodo = Required<PartialTodo>;

// Pick — เลือกแค่บาง field
type TodoPreview = Pick<Todo, "title" | "completed">;
const preview: TodoPreview = { title: "Learn TS", completed: false };

// Omit — ตัด field ออก
type TodoWithoutPriority = Omit<Todo, "priority">;

console.log(draft);
console.log(preview);
