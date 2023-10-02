//import { LID, LIDAddress } from "linearid"
const { LID, LIDAddress } = require("linearid");

function dec2bin(dec) {
  return (dec >>> 0).toString(2);
}

function LidTests(amount) {
  if(amount <= 0) return [];
  let lids = [LID()];
  while(--amount > 0) lids.push(LID());
  return lids;
}

console.log("LID Address:" + LIDAddress + " 0b'" + dec2bin(LIDAddress));
console.log("Printing test LIDs");
LidTests(10).map((lid, index) => {
  console.log(index + ".) " + lid + " 0b'" + dec2bin(lid));
})
