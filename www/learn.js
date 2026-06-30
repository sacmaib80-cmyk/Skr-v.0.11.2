// วิธีรัน: node www/learn.js
// แล้วพิม เช่น XYZZZ กด Enter

const readline = require("readline");
const rl = readline.createInterface({ input: process.stdin });

rl.on("line", (input) => {

  let result = ""
  let currentchar = input[0]
  let count = 1

  for (let i = 1; i < input.length; i++) {
    if (input[i] === currentchar) {
      count++;
    } else {
      result += count + currentchar;
      currentchar = input[i];
      count = 1;
    }
  }

  result += count + currentchar;

  console.log(result);
  rl.close();
});
