// ==========================================================
// TOI A1-010 — ค่าตั๋ว (Ticket price)
// ==========================================================
//
// 📋 โจทย์: รับอายุ (จำนวนเต็ม) และสถานะ (ตัวอักษร 1 ตัว)
//    ถ้า "อายุน้อยกว่า 18" หรือ "เป็นนักเรียน/นักศึกษา (s หรือ S)"
//        → ค่าตั๋ว 20
//    กรณีอื่น → ค่าตั๋ว 50
//
// ตัวอย่าง:
//    15, "s"  →  20
//    20, "a"  →  50
//
// 🎯 ต้องใช้:  < , || , === , if / else
// 🚫 ยังไม่ต้องใช้ function
//
// 💡 hint: เงื่อนไข =  age < 18 || status === "s" || status === "S"
// ----------------------------------------------------------

// // รับค่าเดือน
// let inputMonth: number = Number(prompt("Enter Month:"));
// // รับค่าวัน
// // let inputDay: number = Number(prompt("Enter Day:"));
// // // ตัวแปรรอรับผลลัพธ์
// // let seasons: string | null = "";

// // if (inputMonth === 1 || inputMonth === 2 || inputMonth === 3) {
// //     seasons = "winter";
// // } else if (inputMonth === 4 || inputMonth === 5 || inputMonth === 6) {
// //     seasons = "spring";
// // } else if (inputMonth === 7 || inputMonth === 8 || inputMonth === 9) {
// //     seasons = "summer";
// // } else if (inputMonth === 10 || inputMonth === 11 || inputMonth === 12) {
// //     seasons = "fall";
// // }

// // if (inputMonth % 3 === 0 && inputDay >= 21) {
// //     if (seasons === "winter") {
// //         seasons = "spring";
// //     } else if (seasons === "spring") {
// //         seasons = "summer";
// //     } else if (seasons === "summer") {
// //         seasons = "fall";
// //     } else if (seasons === "fall") {
// //         seasons = "winter";
// //     }
// // }

// // console.log(`season:${seasons}`)


// รับค่าเดือน
let inputMonth: number = Number(prompt("Enter Month:"));
// รับค่าวัน
let inputDay: number = Number(prompt("Enter Day:"));
// ตัวแปรรอเก็บผลลัพธ์
let season: string | null = "";

// หาว่าเดือนที่รับมามีวันสูงสุดกี่วัน (28 / 30 / 31)
let maxDay: number = 0;
if (inputMonth === 1 || inputMonth === 3 || inputMonth === 5 || inputMonth === 7 || inputMonth === 8 || inputMonth === 10 || inputMonth === 12) {
    maxDay = 31;
} else if (inputMonth === 4 || inputMonth === 6 || inputMonth === 9 || inputMonth === 11) {
    maxDay = 30;
} else if (inputMonth === 2) {
    maxDay = 28;
}

// ถ้าวันที่เกินขอบเขตของเดือนนั้น (หรือเดือนไม่ถูกต้อง) ให้แจ้งว่า invalid แล้วไม่ไปคิดฤดูต่อ
if (inputDay < 1 || inputDay > maxDay) {
    console.log("invalid date");
} else {
    switch (inputMonth) {
        case 1:
        case 2:
        case 3:
            season = "winter";
            break;

        case 4:
        case 5:
        case 6:
            season = "spring";
            break;

        case 7:
        case 8:
        case 9:
            season = "summer";
            break;

        case 10:
        case 11:
        case 12:
            season = "fall";
            break;

        default:
            season = "unknown";
    }
    if (inputMonth % 3 === 0 && inputDay >= 21) {
        if (season === "winter") {
            season = "spring";
        } else if (season === "spring") {
            season = "summer";
        } else if (season === "summer") {
            season = "fall";
        } else if (season === "fall") {
            season = "winter";
        }
    }

    console.log(`season:${season}`)
}