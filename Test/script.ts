const { LIDBufferFromHex, LIDFromBuffer, LIDNext, LIDNextBuffer, LIDNextMSW,
  LIDFromHex, LIDToHex, RandomBigInt } = require('linearid');

const { randomInt } = require('crypto');

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

console.log("\n\nTesting linearid");

let date = new Date();
let now = date.getTime();
let now_seconds = Math.floor(now / 1000);
let now_binary = now.toString(2);
let now_seconds_binary = now_seconds.toString(2);
console.log('now(milliseconds):' + now);
console.log("0b'" + now_binary + ':' + now_binary.length);
console.log('now(seconds):' + now_seconds);
console.log("0b'" + now_seconds_binary + ':' + now_seconds_binary.length);
let years_since_epoch = Math.floor(now/(365.25*24*60*60*1000));
console.log('Epoch year: ' + (date.getFullYear() - years_since_epoch) + 
            '\n\n');

let test_number = 10;
console.log('Printing ' + test_number + ' test LIDs');
LIDTests(test_number).map((lid, index) => {
  console.log(index + '.) ' + lid + "  0b'" + lid.toString(2));
});
let [lsw_i, msw_i] = LIDNext(randomInt);
let hex = LIDToHex([lsw_i, msw_i]);
let [lsw_p, msw_p] = LIDFromHex(hex);
LIDVerifyMLSW(lsw_i, msw_i, lsw_p, msw_p, 'Script.ts::A');
console.log('Scanning LID Hex...\n\n');
console.log('MSB:0x' + msw_p.toString(16) + "  0b'" + msw_p.toString(2));
console.log('LSW:0x' + lsw_p.toString(16) + "  0b'" + lsw_p.toString(2));
console.log('LID:0x' + hex);
LIDVerifyMLSW(lsw_i, msw_i, lsw_p, msw_p, 'Script.ts::B');

let buf = LIDNextBuffer([lsw_i, msw_i]);
[lsw_p, msw_p] = LIDFromBuffer(buf);
LIDVerifyMLSW(lsw_i, msw_i, lsw_p, msw_p, 'Script.ts::C');

buf = LIDBufferFromHex(hex);
console.assert(buf != undefined, '{buf = LIDBufferFromHex(hex)} is undefined!');
[lsw_p, msw_p] = LIDFromBuffer(buf);
LIDVerifyMLSW(lsw_i, msw_i, lsw_p, msw_p, 'Script.ts::D');

for (let i = 0; i < 1000000; ++i) { // 1000000
  msw_i = RandomBigInt(randomInt);
  lsw_i = RandomBigInt(randomInt);
  hex = LIDToHex([lsw_i, msw_i]);
  [lsw_p, msw_p] = LIDFromHex(hex);
  LIDVerifyMLSW(lsw_i, msw_i, lsw_p, msw_p, 'Script.ts::E');

  buf = LIDNextBuffer([lsw_i, msw_i]);
  [lsw_p, msw_p] = LIDFromBuffer(buf);
  LIDVerifyMLSW(lsw_i, msw_i, lsw_p, msw_p, 'Script.ts::F');

  buf = LIDBufferFromHex(hex);
  [lsw_p, msw_p] = LIDFromBuffer(buf);
  LIDVerifyMLSW(lsw_i, msw_i, lsw_p, msw_p, 'Script.ts::G');
}


console.log("\n\nFinished running linearid tests.");
