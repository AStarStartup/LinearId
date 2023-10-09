const { LIDNextBuffer, LIDFromBuffer, LIDNext, LIDNextMSW, LIDParse, LIDPrint, 
  LIDSource, RandomBigInt } = require("linearid");

function LIDTests(amount) {
  if(amount <= 0) return [];
  let lids = [LIDNextMSW()];
  while(--amount > 0) lids.push(LIDNextMSW());
  return lids;
}

let test_number = 10;
console.log('Printing ' + test_number + ' test LIDs');
LIDTests(test_number).map((lid, index) => {
  console.log(index + '.) ' + lid + "  0b'" + lid.toString(2));
});
let [lsw_i, msw_i] = LIDNext();
console.assert(lsw_i == LIDSource, "lsw_i not equal to LIDSource!");
console.log('\n\nBefore:\n');
console.log('MSB:0x' + msw_i.toString(16) + "  0b'" + msw_i.toString(2));
console.log('LSW:0x' + lsw_i.toString(16) + "  0b'" + lsw_i.toString(2));

let lid_string = LIDPrint([lsw_i, msw_i]);
console.log('\nLID Hex:0x' + lid_string + '     length:' + lid_string.length);
let [lsw_p, msw_p] = LIDParse(lid_string);
console.assert(lsw_p == LIDSource, "lsw_p not equal to LIDSource1!");
console.log('Scanning LID Hex...\n\n');
console.log('MSB:0x' + msw_p.toString(16) + "  0b'" + msw_p.toString(2));
console.log('LSW:0x' + lsw_p.toString(16) + "  0b'" + lsw_p.toString(2));
if(lsw_i != lsw_p) {
  console.log('\nError!');
  console.log('lsw_i:0x' + lsw_i.toString(16) + "  0b'" + lsw_i.toString(2));
  console.log('lsw_p:0x' + lsw_p.toString(16) + "  0b'" + lsw_p.toString(2));
  console.log('diff :0x' + (lsw_p - lsw_i).toString(16));
}
console.assert(lsw_i == lsw_p, 'LSW did not print and parse correctly 1!');
if(msw_i != msw_p) {
  console.log('\nError!');
  console.log('msw_i:0x' + msw_i.toString(16) + "  0b'" + msw_i.toString(2));
  console.log('msw_p:0x' + msw_p.toString(16) + "  0b'" + msw_p.toString(2));
  console.log('diff :0x' + (msw_p - msw_i).toString(16));
}
console.assert(msw_i == msw_p, 'MSW did not print and parse correctly 1!');

let lid_buffer = LIDNextBuffer([lsw_i, msw_i]);
[lsw_p, msw_p] = LIDFromBuffer(lid_buffer);
if(lsw_i != lsw_p) {
  console.log('\nError!');
  console.log('lsw_i:0x' + lsw_i.toString(16) + "  0b'" + lsw_i.toString(2));
  console.log('lsw_p:0x' + lsw_p.toString(16) + "  0b'" + lsw_p.toString(2));
  console.log('diff :0x' + (lsw_p - lsw_i).toString(16));
}
console.assert(lsw_i == lsw_p, 'LSW LIDNextBuffer or LIDFromBuffer failed 1!\n');
if(msw_i != msw_p) {
  console.log('\nError!');
  console.log('msw_i:0x' + msw_i.toString(16) + "  0b'" + msw_i.toString(2));
  console.log('msw_p:0x' + msw_p.toString(16) + "  0b'" + msw_p.toString(2));
  console.log('diff :0x' + (msw_p - msw_i).toString(16));
}
console.assert(msw_i == msw_p, 'MSW LIDNextBuffer or LIDFromBuffer failed 1!\n');

for (let i = 0; i < 1000000; ++i) {
  msw_i = RandomBigInt();
  lsw_i = RandomBigInt();
  let lid_string = LIDPrint([lsw_i, msw_i]);
  [lsw_p, msw_p] = LIDParse(lid_string);
  if(lsw_i != lsw_p) {
    console.log('\nError!');
    console.log('lsw_i:0x' + lsw_i.toString(16) + "  0b'" + lsw_i.toString(2));
    console.log('lsw_p:0x' + lsw_p.toString(16) + "  0b'" + lsw_p.toString(2));
    console.log('diff :0x' + (lsw_p - lsw_i).toString(16));
  }
  console.assert(lsw_i == lsw_p, 'LSW LIDPrint or LIDParse failed 2!\n');
  if(lsw_i != lsw_p || msw_i != msw_p) {
    console.log('\nError!');
    console.log('msw_i:0x' + msw_i.toString(16) + "  0b'" + msw_i.toString(2));
    console.log('msw_p:0x' + msw_p.toString(16) + "  0b'" + msw_p.toString(2));
    console.log('diff :0x' + (msw_p - msw_i).toString(16));
  }
  console.assert(msw_i == msw_p, 'MSW LIDPrint or LIDParse failed 2!\n');

  lid_buffer = LIDNextBuffer([lsw_i, msw_i]);
  [lsw_p, msw_p] = LIDFromBuffer(lid_buffer);
  if(lsw_i != lsw_p) {
    console.log('\nError!');
    console.log('lsw_i:0x' + lsw_i.toString(16) + "  0b'" + lsw_i.toString(2));
    console.log('lsw_p:0x' + lsw_p.toString(16) + "  0b'" + lsw_p.toString(2));
    console.log('diff :0x' + (lsw_p - lsw_i).toString(16));
    console.log('lid_buffer.toString():' + lid_buffer.toString());
  }
  console.assert(lsw_i == lsw_p, 'LSW LIDNextBuffer or LIDFromBuffer failed 2!\n');
  if(msw_i != msw_p) {
    console.log('\nError!');
    console.log('msw_i:0x' + msw_i.toString(16) + "  0b'" + msw_i.toString(2));
    console.log('msw_p:0x' + msw_p.toString(16) + "  0b'" + msw_p.toString(2));
    console.log('diff :0x' + (msw_p - msw_i).toString(16));
  }
  console.assert(msw_i == msw_p, 'MSW LIDNextBuffer or LIDFromBuffer failed 2!\n');
}
console.log("\n\nFinished running linearid tests.");
