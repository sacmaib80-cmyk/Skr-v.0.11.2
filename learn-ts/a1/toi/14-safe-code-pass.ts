// ==========================================================
// TOI A1-013 — รหัสเซฟ (Safe code)
// ==========================================================
//
// 📋 โจทย์: รหัสเซฟที่ถูกต้องคือ ตัวอักษร 'H' และตัวเลข 4567
//    รับตัวอักษร 1 ตัว + จำนวนเต็ม 1 ค่า แล้วเทียบ:
//    - ถูกทั้งคู่                → "safe unlocked"
//    - ถูกเฉพาะตัวอักษร (H)      → "safe locked - change digit"
//    - ถูกเฉพาะตัวเลข (4567)     → "safe locked - change char"
//    - ผิดทั้งคู่                → "safe locked"
//
// ตัวอย่าง:
//    "h", 4567   →  safe locked - change char   (ตัวเลขถูก แต่ h ≠ H)
//    "H", 56579  →  safe locked - change digit  (ตัวอักษรถูก แต่เลขผิด)
//    "h", 5678   →  safe locked                 (ผิดทั้งคู่)
//
// 🎯 ต้องใช้:  === , && , if / else if / else
// 🚫 ยังไม่ต้องใช้ function
//
// 💡 hint: ตัวอักษรเทียบแบบตรงตัวพิมพ์ →  "h" ไม่เท่ากับ "H"
// ----------------------------------------------------------

let charInput: string | boolean = (String(prompt("")));
let numInput: number | boolean = (Number(prompt("")));
let unlocked: string = ("safe locked");

// 👇
// ต้องได้:  safe locked - change char
if (charInput === "H" && numInput === 4567) {
    console.log("safe unlocked"); 
}else if(charInput === "H" && true) {
    console.log(unlocked + " " + "-" + " " + "change digit");
}else if(numInput === 4567 && true) {
    console.log(unlocked + " " + "-" + " " + "change char");
}else {
    console.log("safe locked");
}

