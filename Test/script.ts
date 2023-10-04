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

console.log("LID Source:" + LIDSource + " 0b'" + BigIntToBinary(LIDSource));
console.log("Printing test LIDs");
LidTests(10).map((lid, index) => {
  console.log(index + ".) " + lid + " 0b'" + BigIntToBinary(lid));
});
