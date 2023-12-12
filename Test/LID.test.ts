// Copyright AStartup. MIT License. You can find a copy of the license at 
// http://github.com/AStarStartup/LinearId

const { randomInt } = require('crypto');
const { HexToBigInt, LIDNext, LIDSource, LIDSourceId, LIDSourceBitCount, LIDSourceNext
} = require('linearid');

import { expect, test } from '@jest/globals';
import {TestPrintCount } from './Global';

test("LID Works", () => {
  /*
  let date = new Date();
  let now = date.getTime();
  let now_seconds = Math.floor(now / 1000);
  let now_binary = now.toString(2);
  let now_seconds_binary = now_seconds.toString(2);
  let years_since_epoch = Math.floor(now/(365.25*24*60*60*1000));
  let o = 'now(milliseconds):' + now + 
          "\n0b'" + now_binary + ':' + now_binary.length + 
          '\nnow(seconds):' + now_seconds +
          "\n0b'" + now_seconds_binary + ':' + now_seconds_binary.length +
          '\nEpoch year: ' + (date.getFullYear() - years_since_epoch) + 
          '\n\n';
  console.log(o);

  console.log('\n\nTesting Source ID:');

  for(let i = 0; i < TestPrintCount; ++i) {
    LIDSourceNext(randomInt);
    expect(LIDSourceId()).toBeLessThan(1n << LIDSourceBitCount)
    expect(LIDSourceId()).not.toEqual(0n);
  }

  console.log('Printing ' + TestPrintCount + ' test LIDs');
  for(let i = 0; i < TestPrintCount; ++i) {
    const LIDCurrent = LIDNext(randomInt);
    console.log(i + '.) ' + LIDCurrent + "  0b'" + LIDCurrent.toString(2));
  }
  let int_i = LIDNext(randomInt);
  let hex = int_i.toString(16);
  let int_p = HexToBigInt(hex);
  BigIntVerify(int_i, int_p, 'Script.ts::A');
  o = 'Scanning LID Hex...\n\n' +
      '\nint_i: 0x' + int_i.toString(16) + "  0b'" + int_i.toString(2) + 
      '\nint_p: 0x' + int_p.toString(16) + "  0b'" + int_p.toString(2) +
      '\nlid_h: 0x' + hex;
  console.log(o);
  */
  /* @todo Test me!
LIDSourceMSWBitCount
LIDTickerMax
LIDTimestamp
LIDTicker
LIDSource
LIDSourceId
LIDSourceIncrement
LIDNextHex
LIDNextBuffer
LIDFromBuffer
LIDBufferLSW
LIDBufferMSW
LIDMSWSeconds
*/
});
