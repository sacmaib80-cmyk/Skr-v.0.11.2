let firstName: string | null = prompt("");
let lastName: string | null = prompt("");
console.log(`Hello ${firstName} ${lastName}`);

let nickName: string = firstName.substring(0, 2) + lastName.substring(0, 2);
console.log(nickName)