// Copyright AStartup. MIT License. You can find a copy of the license at 
// http://github.com/AStarStartup/LinearId

const { randomInt } = require('crypto');
const { BigIntInRange, BinaryPad, BinaryPadBitCount, HexPad, HexPadBitCount, LLID, 
  LLIDTickerBitCount, LLIDTimestampBitCount, LLIDNext, LLIDPack, LLIDTicker, 
  LLIDTimestamp, LLIDUnpack, TimestampBigInt } = require('linearid');

import { expect, test } from '@jest/globals';
import { TestCount, TestLoopCount, TestPrintCount 
} from './Global';

function LLIDCompare(expected: bigint, received: bigint, 
    tag:string = '', delta: bigint = 0n) {
  const UpperBounds = expected + delta;
  if(received < expected || received > UpperBounds)
    console.log('\nUnexpected error at LLID' + tag + ' 𝚫:' + delta +
      '\nExpected: ' + HexPadBitCount(expected) + 
      '\nReceived: ' + HexPadBitCount(received) + 
      '\nXOR     : ' + HexPadBitCount(received ^ expected) + '\n' +
      '\nExpected: ' + BinaryPadBitCount(expected) + 
      '\nReceived: ' + BinaryPadBitCount(received) + 
      '\nXOR     : ' + BinaryPadBitCount(received ^ expected));
  expect(received).toBeGreaterThanOrEqual(expected);
  expect(received).toBeLessThanOrEqual(UpperBounds);
}

test("LLID works", () => {
  const Delta = 1n;
  let i = 0;
  for(i = 0; i < TestCount; ++i) {
    const Timestamp_E = BigIntInRange(randomInt, 0, 
      (1n << LLIDTimestampBitCount) - 1n);
    const Ticker_E = BigIntInRange(randomInt, 0, 
      (1n << LLIDTickerBitCount) - 1n);
    const LID = LLIDPack(Timestamp_E, Ticker_E);
    const [ Timestamp_R, Ticker_R ] = LLIDUnpack(LID);
    LLIDCompare(Timestamp_E, Timestamp_R, '::Pack::Timestamp');
    LLIDCompare(Ticker_E, Ticker_R, '::Pack::Ticker');
  }

  let o = '';
  for(let k = 0; k < TestLoopCount; k++) {
    for(i = 0; i < TestPrintCount; ++i) {
      let lid = LLIDNext(randomInt);
      o += i + ': ' + lid + "  " + BinaryPad(lid) + ' 0d' + lid + '\n';
    }
    if(TestPrintCount > 0) console.log(o);
    let Expected = TimestampBigInt();
    let then = Expected;
    while (Expected == then)
      then = TimestampBigInt();
    for(let i = 0; i < TestCount; ++i) {
      const Received = LLIDTimestamp(LLIDNext(randomInt));
      LLIDCompare(Expected, Received, '::LLIDTimestamp::Test.A', Delta);
    }
    Expected = TimestampBigInt();
    then = Expected;
    while (Expected == then) then = TimestampBigInt();
    console.log('Waited ' + (then - Expected) + ' seconds');
    o = '';
    for(i = 0; i < TestPrintCount; ++i) {
      const Received = LLIDTimestamp(LLIDNext(randomInt));
      o += HexPad(Received) + ' ' + BinaryPad(Received) + ' 0d' + Received;
    }
    if(TestPrintCount > 0) console.log(o);
    for(i = 0; i < TestCount; ++i) {
      const Received = LLIDTimestamp(LLIDNext(randomInt));
      LLIDCompare(Expected, Received, '::LLIDTimestamp', Delta);
    }
  }
  /* @todo Test me!
  LLIDPrint
  LLIDNextHex
  LLIDNextBuffer
  */
});
