const { BigIntToBinary, LID, LIDSource, LIDPrint, LIDParse, RandomBigInt
} = require("linearid");

function LIDTests(amount) {
  if(amount <= 0) return [];
  let lids = [LID()];
  while(--amount > 0) lids.push(LID());
  return lids;
}

let test_number = 10;
console.log('Printing ' + test_number + ' test LIDs');
LIDTests(test_number).map((lid, index) => {
  console.log(index + '.) ' + lid + "     0b'" + BigIntToBinary(lid));
});
let msb_i = LID();
let lsb_i = LIDSource;
console.log('\n\nBefore:\nMSB:' + msb_i + "     0b'" + BigIntToBinary(msb_i));
console.log('LSB:' + lsb_i + "     0b'" + BigIntToBinary(lsb_i));

let lid_string = LIDPrint(msb_i, lsb_i);
console.log('\nLID Hex:' + lid_string + '     length:' + lid_string.length);
let [ msb_p, lsb_p ] = LIDParse(lid_string);
console.log('Scanning LID Hex...\n\nMSB:' + msb_p + "     0b'" + 
            BigIntToBinary(msb_p));
console.log('LSB:' + lsb_p + "     0b'" + BigIntToBinary(lsb_p));
if(msb_i != msb_p || lsb_i != lsb_p) {
  console.log('\nError!')
  console.log('msb_i: ' + msb_i + "     0b'" + BigIntToBinary(msb_i));
  console.log('msb_p: ' + msb_p + "     0b'" + BigIntToBinary(msb_p));
  console.log('\n')
  console.log('lsb_i: ' + lsb_i + "     0b'" + BigIntToBinary(lsb_i));
  console.log('lsb_p: ' + lsb_p + "     0b'" + BigIntToBinary(lsb_p));
}
console.assert(msb_i == msb_p, 'MSB did not print and parse correctly!');
console.assert(lsb_i == lsb_p, 'LSB did not print and parse correctly!');

for (let i = 0; i < 100000; ++i) {
  msb_i = RandomBigInt();
  lsb_i = RandomBigInt();
  let lid_string = LIDPrint(msb_i, lsb_i);
  [ msb_p, lsb_p ] = LIDParse(lid_string);
  if(msb_i != msb_p || lsb_i != lsb_p) {
    console.log('msb_i: ' + msb_i + "     0b'" + BigIntToBinary(msb_i));
    console.log('msb_p: ' + msb_p + "     0b'" + BigIntToBinary(msb_p));
    console.log('\n')
    console.log('lsb_i: ' + lsb_i + "     0b'" + BigIntToBinary(lsb_i));
    console.log('lsb_p: ' + lsb_p + "     0b'" + BigIntToBinary(lsb_p));
  }
  console.assert(msb_i == msb_p, 'MSB did not print and parse correctly!\n\n');
  console.assert(lsb_i == lsb_p, 'LSB did not print and parse correctly!\n\n');
}
