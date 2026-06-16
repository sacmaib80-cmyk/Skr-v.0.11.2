// TS 02 — แบบฝึกหัด Interface

// ข้อ 1: สร้าง interface ชื่อ Product
// มี name (string), price (number), inStock (boolean)
// และ description ที่เป็น optional
interface product {
    name: string ;
    price: number ;
    inStock: boolean ;
    description?: string ;
}

// ข้อ 2: สร้าง object ตาม Product interface
// ไม่ต้องใส่ description
const product1 : product = {
    name: "sakuraQ" ,
    price: 100 ,
    inStock: true ,
};


// ข้อ 3: เขียนฟังก์ชัน printProduct รับ Product แล้ว log ออกมา
// ถ้ามี description ให้ log ด้วย ถ้าไม่มีก็ข้าม
// ฟังก์ชันนี้ไม่คืนค่าอะไร
function printProduct(p: product): void {
    console.log(p.name + " " + p.price)
    if (p.description) {
        console.log(p.description);
    }
}

printProduct(product1);


// ข้อ 4: สร้าง interface ชื่อ DiscountProduct
// ต่อยอดจาก Product แล้วเพิ่ม discount (number)
interface DiscountProduct extends product {
    discount: number ;
}


// ข้อ 5: สร้าง object ตาม DiscountProduct แล้ว log ราคาหลังหัก discount
// เช่น price=100, discount=20 → log "ราคาสุทธิ: 80"
const product2 : DiscountProduct  = {
    name: "sakuraQ" ,
    price: 100 ,
    inStock: true ,
    discount: 20
}

console.log("ราคาสุทธิ:" + (product2.price - product2.discount)
);
