# TypeScript — ระดับ A1 (พื้นฐานสุด)

โครงสร้าง 2 ส่วน:
1. **พื้นฐาน** (`a1-01` … `a1-08`) — ปูเครื่องมือทีละอย่าง ช่วงแรกยังไม่ใช้ function
2. **โจทย์จริง** (`toi/`) — โจทย์ TOI-Zero / TOI National Grader (A1) เรียงจากง่าย → ยาก

แต่ละไฟล์บอกด้านบนว่า "บทนี้ต้องใช้อะไร" และถ้าโจทย์ไหนต้องใช้เมธอด/ตัวช่วยที่ยังไม่เคยเจอ จะมี `💡 hint` กำกับไว้ (ไม่ใช้ตัวช่วยนั้นจะทำไม่ได้)

## ส่วนที่ 1 — พื้นฐาน

| ลำดับ | ไฟล์ | เรื่อง | เครื่องมือใหม่ |
|------|------|--------|----------------|
| 01 | `a1-01-variables.ts` | ตัวแปร + string/number/boolean | `let` `const` `console.log` |
| 02 | `a1-02-type-annotation.ts` | กำหนด type เอง vs ให้ TS เดา | annotation, inference |
| 03 | `a1-03-strings.ts` | ข้อความ ต่อ/แทรก/นับ | `+` , `` `${}` `` , `.length` , `.toUpperCase()` |
| 04 | `a1-04-numbers-math.ts` | ตัวเลข + คำนวณ | `+ - * / %` , `Math.floor()` |
| 05 | `a1-05-boolean-compare.ts` | จริง/เท็จ + เปรียบเทียบ | `=== !== > < >= <=` , `&& \|\| !` |
| 06 | `a1-06-if-else.ts` | **การตัดสินใจ** (สำคัญมาก) | `if` `else if` `else` |
| 07 | `a1-07-arrays.ts` | เก็บหลายค่าใน array | `[]` , index, `.length` , `.push()` |
| 08 | `a1-08-functions.ts` | **บทแรกที่เขียน function เอง** | `function` , parameter, `return` |

## ส่วนที่ 2 — โจทย์จริง TOI (ทำหลังจบพื้นฐาน)

ดู [`toi/README.md`](toi/README.md) — โจทย์ 20 ข้อ เรียงตามความยาก
พร้อมเลข TOI ต้นฉบับกำกับ (เทียบกับไฟล์ PDF ใน Google Drive ได้)

## วิธีรัน

```powershell
# ติดตั้งครั้งเดียว (ถ้ายังไม่มี)
npm i -g ts-node typescript

# รันทีละไฟล์
npx ts-node learn-ts/a1/a1-01-variables.ts
npx ts-node learn-ts/a1/toi/01-max-of-three.ts
```

> โจทย์ทุกข้อมีคอมเมนต์ `ต้องได้: ...` บอกคำตอบที่ถูก เขียนโค้ดตรง `👇` แล้วรันเช็คว่าตรงไหม
