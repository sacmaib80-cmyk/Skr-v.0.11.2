// ==========================================================
// TOI A1-009 — ผ่าน/ไม่ผ่าน (Pass / Fail จากคะแนนรวม)
// ==========================================================
//
// 📋 โจทย์: รับคะแนนกลางภาค (เต็ม 50) และปลายภาค (เต็ม 50)
//    - แสดง "คะแนนรวม" ก่อน
//    - แล้วแสดง "pass" ถ้าคะแนนรวม >= 50 , ไม่งั้น "fail"
//
// ตัวอย่าง:
//    25, 35  →  60  แล้ว  pass
//    25, 10  →  35  แล้ว  fail
//
// 🎯 ต้องใช้:  +  ,  if / else  ,  console.log 2 บรรทัด
// 🚫 ยังไม่ต้องใช้ function
// ----------------------------------------------------------

let midterm: number | boolean = (Number(prompt("Enter your score:")));
let final: number | boolean = (Number(prompt("Enter your score:")));
let sum: number = midterm + final

// 1) log ผลรวม   2) log pass/fail
// 👇
// ต้องได้:  60
//          pass
if(midterm + final <= 50 && true){
    console.log(sum)
    console.log("fail")
}else {
    console.log(sum)
    console.log("pass")
}
