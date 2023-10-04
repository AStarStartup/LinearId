// Copyright AStartup; all rights reserved.

const { randomInt } = require('crypto');

let time_last = BigInt(new Date().getTime());
let ticker = BigInt(0);

/* Generates a Linear ID using a microsecond timestamp and a spin counter.
Bit Pattern: [ 48-bits Microsecond Timestamp | 16-bits spin counter ] */
function LID(): BigInt {
  let time_now = BigInt(new Date().getTime());
  if (time_now != time_last) {
    time_last = time_now;
    ticker = BigInt(0);
  }
  while (ticker >= 65536n) {
    time_now = BigInt(new Date().getTime());
    if (time_now != time_last) {
      time_last = time_now;
      ticker = BigInt(0);
    }
  }
  return (time_now << 16n) | ticker++;
}
let lsb = BigInt(randomInt(1, 0xffffffff));
let msb = BigInt(randomInt(1, 0xffffffff));
const LIDSource: BigInt = lsb | (msb << 32n);

module.exports = { LID, LIDSource };
