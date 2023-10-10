const { LIDBufferFromHex, LIDBufferToHex, LIDFromBuffer, LIDNext, 
  LIDNextBuffer, LIDNextMSW, LIDFromHex, LIDToHex, LIDSource, RandomBigInt
} = require("linearid");

/* @todo I don't want to create this in memory, i would rather do it on the
fly. */
function LIDTests(amount) {
  if(amount <= 0) return [];
  let lids = [LIDNextMSW()];
  while(--amount > 0) lids.push(LIDNextMSW());
  return lids;
}

// Asserts the lsw_i and msw_i are the same as the lsw_p and msw_p respectively.
function LIDVerifyMLSW(lsw_i, msw_i, lsw_p, msw_p, tag) {
  if(lsw_i != lsw_p) {
    console.log('\nError!');
    console.log('lsw_i:0x' + lsw_i.toString(16) + "  0b'" + lsw_i.toString(2));
    console.log('lsw_p:0x' + lsw_p.toString(16) + "  0b'" + lsw_p.toString(2));
    console.log('diff :0x' + (lsw_p - lsw_i).toString(16));
  }
  console.assert(lsw_i == lsw_p, 'LSW did not print and parse correctly for ' +
                tag);
  if(msw_i != msw_p) {
    console.log('\nError!');
    console.log('msw_i:0x' + msw_i.toString(16) + "  0b'" + msw_i.toString(2));
    console.log('msw_p:0x' + msw_p.toString(16) + "  0b'" + msw_p.toString(2));
    console.log('diff :0x' + (msw_p - msw_i).toString(16));
  }
  console.assert(msw_i == msw_p, 'MSW did not print and parse correctly for ' +
                tag);
}

let test_number = 10;
console.log('Printing ' + test_number + ' test LIDs');
LIDTests(test_number).map((lid, index) => {
  console.log(index + '.) ' + lid + "  0b'" + lid.toString(2));
});
let [lsw_i, msw_i] = LIDNext();
console.assert(lsw_i == LIDSource, "lsw_i not equal to LIDSource!");
console.log('\n\nBefore:\n');
console.log('MSW:0x' + msw_i.toString(16) + "  0b'" + msw_i.toString(2));
console.log('LSW:0x' + lsw_i.toString(16) + "  0b'" + lsw_i.toString(2));

let hex = LIDToHex([lsw_i, msw_i]);
console.log('\nLID Hex:0x' + hex + '     length:' + hex.length);
let [lsw_p, msw_p] = LIDFromHex(hex);
console.assert(lsw_p == LIDSource, "lsw_p not equal to LIDSource1!");
console.log('Scanning LID Hex...\n\n');
console.log('MSB:0x' + msw_p.toString(16) + "  0b'" + msw_p.toString(2));
console.log('LSW:0x' + lsw_p.toString(16) + "  0b'" + lsw_p.toString(2));
LIDVerifyMLSW(lsw_i, msw_i, lsw_p, msw_p, 'Script.ts::A');

let buf = LIDNextBuffer([lsw_i, msw_i]);
[lsw_p, msw_p] = LIDFromBuffer(buf);
LIDVerifyMLSW(lsw_i, msw_i, lsw_p, msw_p, 'Script.ts::B');

buf = LIDBufferFromHex(hex);
console.assert(buf != undefined, '{buf = LIDBufferFromHex(hex)} is undefined!');
[lsw_p, msw_p] = LIDFromBuffer(buf);
LIDVerifyMLSW(lsw_i, msw_i, lsw_p, msw_p, 'Script.ts::C');

for (let i = 0; i < 1000000; ++i) {
  msw_i = RandomBigInt();
  lsw_i = RandomBigInt();
  hex = LIDToHex([lsw_i, msw_i]);
  [lsw_p, msw_p] = LIDFromHex(hex);
  LIDVerifyMLSW(lsw_i, msw_i, lsw_p, msw_p, 'Script.ts::D');

  buf = LIDNextBuffer([lsw_i, msw_i]);
  [lsw_p, msw_p] = LIDFromBuffer(buf);
  LIDVerifyMLSW(lsw_i, msw_i, lsw_p, msw_p, 'Script.ts::E');

  buf = LIDBufferFromHex(hex);
  [lsw_p, msw_p] = LIDFromBuffer(buf);
  LIDVerifyMLSW(lsw_i, msw_i, lsw_p, msw_p, 'Script.ts::F');
}


console.log("\n\nFinished running linearid tests.");