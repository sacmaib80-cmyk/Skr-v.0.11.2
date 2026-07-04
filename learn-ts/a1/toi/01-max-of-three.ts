import { exchangeCoins } from "./functions";


//  ไม่ใช้ For และ functions

let money = Number(prompt("Enter Coins")); // 48

// เหรียญ 10
const Coins10 = Math.floor(money/10);
// 48 = 48 / 10 = 4 เหลือ 8
money = money % 10;
// 8

// เหรียญ 5
const Coins5 = Math.floor(money/5);
// 8 = 8 / 5 = 1 เหลือ 3
money = money % 5;
// 3

// เหรียญ 2
const Coins2 = Math.floor(money/2);
// 3 = 3 / 2 = 1 เหลือ 1
money = money % 2;
// 1

// เหรียญ 1
const Coins1 = money;
// 1 = 1 / 1 = 1 เหลือ 0
money = money % 1;


console.log({
    "10":Coins10,
    "5":Coins5,
    "2":Coins2,
    "1":Coins1
});

// //===========================================================================

// // ใช้ for 

const coins = [10, 5, 2, 1]


while (coins.length > 0 && money > 0) {
    for (const coin of coins){
    // วงลูปเข้าไปหารแต่ละตัวที่อยู่ array coins
    const count = Math.floor(money/coin);
    // ทำ modulo เพื่อหาส่วนที่เหลือ
    money = money % coin;
    // แสดงผลลัพธ์
    console.log(`เหรียญ ${coin} : ${count} บาท`);
    
    money = money % coin; // อัปเดตเงินที่เหลือ
}

}

//
for (const coin of coins){
    // วงลูปเข้าไปหารแต่ละตัวที่อยู่ array coins
    const count = Math.floor(money/coin);
    // ทำ modulo เพื่อหาส่วนที่เหลือ
    money = money % coin;
    // แสดงผลลัพธ์
    console.log(`เหรียญ ${coin} : ${count} บาท`);
    
    money = money % coin; // อัปเดตเงินที่เหลือ
}



export function exchangeCoins(money:number) {
    // let money = Number(prompt('Enter Number Coin : '));
    const coins = [10, 5, 2, 1]

    console.log(`--------- ผลการแลกเงิน ${money} บาท ---------`);

    for (const coin of coins){
        // วนลูปเข้าไปหารแต่ละตัวที่อยู่ array coins
        const count = Math.floor(money/coin);

        // หาส่วนที่เหลือ
        money = money % coin;
        // แสดงผลลัพธ์
        console.log(`เหรียญ ${coin} : ${count} บาท`);
    }
    
    console.log('---------------------------------------------');

}

exchangeCoins(48);  