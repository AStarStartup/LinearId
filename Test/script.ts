//import { LID, LIDSource } from "linearid";
const { LID, LIDSource } = require("linearid");

function BigIntToBinary(value) {
  let result = "";
  let mask = BigInt(0x8000000000000000)
  while(mask != 0n) {
    result += (value & mask) ? '1' : '0';
    mask = mask >> 1n;
  }
  return result;
}

function LidTests(amount) {
  if(amount <= 0) return [];
  let lids = [LID()];
  while(--amount > 0) lids.push(LID());
  return lids;
}

let test_number = 1000;
console.log("Printing " + test_number + " test LIDs");
LidTests(test_number).map((lid, index) => {
  console.log(index + ".) " + lid + " 0b'" + BigIntToBinary(lid));
});
console.log("LID Source:" + LIDSource + " 0b'" + BigIntToBinary(LIDSource));
