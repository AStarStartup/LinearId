const { BigIntToBinary, LID, LIDNext, LIDSource, LIDPrint, LIDParse, 
  RandomBigInt
} = require("linearid");

function LIDTests(amount) {
  if(amount <= 0) return [];
  let lids = [LIDNext()];
  while(--amount > 0) lids.push(LIDNext());
  return lids;
}

let test_number = 10;
console.log('Printing ' + test_number + ' test LIDs');
LIDTests(test_number).map((lid, index) => {
  console.log(index + '.) ' + lid + "     0b'" + lid.toString(2));
});
let msb_i = LIDNext();
let lsb_i = LIDSource;
console.log('\n\nBefore:\nMSB:' + msb_i + "     0b'" + msb_i.toString(2));
console.log('LSB:' + lsb_i + "     0b'" + lsb_i.toString(2));

let lid_string = LIDPrint(msb_i, lsb_i);
console.log('\nLID Hex:' + lid_string + '     length:' + lid_string.length);
let [ msb_p, lsb_p ] = LIDParse(lid_string);
console.log('Scanning LID Hex...\n\nMSB:' + msb_p + "     0b'" + 
            msb_p.toString(2));
console.log('LSB:' + lsb_p + "     0b'" + lsb_p.toString(2));
if(msb_i != msb_p || lsb_i != lsb_p) {
  console.log('\nError!')
  console.log('msb_i: ' + msb_i + "     0b'" + msb_i.toString(2));
  console.log('msb_p: ' + msb_p + "     0b'" + msb_p.toString(2));
  console.log('\n')
  console.log('lsb_i: ' + lsb_i + "     0b'" + lsb_i.toString(2));
  console.log('lsb_p: ' + lsb_p + "     0b'" + lsb_p.toString(2));
}
console.assert(msb_i == msb_p, 'MSB did not print and parse correctly!');
console.assert(lsb_i == lsb_p, 'LSB did not print and parse correctly!');

for (let i = 0; i < 100000; ++i) {
  msb_i = RandomBigInt();
  lsb_i = RandomBigInt();
  let lid_string = LIDPrint(msb_i, lsb_i);
  [ msb_p, lsb_p ] = LIDParse(lid_string);
  if(msb_i != msb_p || lsb_i != lsb_p) {
    console.log('msb_i: ' + msb_i + "     0b'" + msb_i.toString(2));
    console.log('msb_p: ' + msb_p + "     0b'" + msb_p.toString(2));
    console.log('\n')
    console.log('lsb_i: ' + lsb_i + "     0b'" + lsb_i.toString(2));
    console.log('lsb_p: ' + lsb_p + "     0b'" + lsb_p.toString(2));
  }
  console.assert(msb_i == msb_p, 'MSB did not print and parse correctly!\n\n');
  console.assert(lsb_i == lsb_p, 'LSB did not print and parse correctly!\n\n');
}
