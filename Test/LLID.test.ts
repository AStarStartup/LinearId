// Copyright AStartup. MIT License. You can find a copy of the license at 
// http://github.com/AStarStartup/LinearId

const { randomInt: rng } = require('crypto');
const { BigIntInRange, BinaryPad, BinaryPadBitCount, HexPad, HexPadBitCount, 
  LLIDPrint, LLIDTickerBitCount, LLIDTimestampBitCount, LLIDNext, LLIDPack, 
  LLIDTimestamp, LLIDUnpack, NumberCountDecimals, NumberPad, 
  TimestampSecondsAsBigInt, TimestampWindow } = require('linearid');

import { expect, test } from '@jest/globals';
import { TestCount, TestLoopCount, TestPrintCount 
} from './Global';

function LLIDCompare(expected: bigint, received: bigint, 
    tag:string = '', index: number) {
  const UpperBounds = expected + TimestampWindow;
  if(received < expected || received > UpperBounds)
    console.log('\nUnexpected error at LLID' + tag + ' 𝚫:' + TimestampWindow +
      ' ' + (received < expected ? 'low' : 'high') +
      ' index:' + index +
      '\nExpected: ' + HexPadBitCount(expected) + 
      ' 0d' + expected + ' UpperBounds:' + UpperBounds +
      '\nReceived: ' + HexPadBitCount(received) + 
      ' 0d' + received + 
      '\nXOR     : ' + HexPadBitCount(received ^ expected) + '\n' +
      '\nExpected: ' + BinaryPadBitCount(expected) + 
      '\nReceived: ' + BinaryPadBitCount(received) + 
      '\nXOR     : ' + BinaryPadBitCount(received ^ expected));
  expect(received).toBeGreaterThanOrEqual(expected);
  expect(received).toBeLessThanOrEqual(UpperBounds);
}

test("LLID works", () => {
  //console.log("Testing LLIDPrint..." + LLIDPrint(LLIDNext()));
  expect(LLIDPrint(LLIDNext() != 0n)).not.toBe(true);
  let i = 0;
  for(i = 0; i < TestCount; ++i) {
    const Timestamp_E = BigIntInRange(rng, 0, 
      (1n << LLIDTimestampBitCount) - 1n);
    const Ticker_E = BigIntInRange(rng, 0, 
      (1n << LLIDTickerBitCount) - 1n);
    const LID = LLIDPack(Timestamp_E, Ticker_E);
    const [ Timestamp_R, Ticker_R ] = LLIDUnpack(LID);
    LLIDCompare(Timestamp_E, Timestamp_R, '::Pack::Timestamp', i);
    LLIDCompare(Ticker_E, Ticker_R, '::Pack::Ticker', i);
  }

  let o = '';
  const DecimalCount = NumberCountDecimals(TestPrintCount);
  for(let k = 0; k < TestLoopCount; k++) {
    for(i = 0; i < TestPrintCount; ++i) {
      let lid = LLIDNext(rng);
      o += NumberPad(i, DecimalCount) + ': ' + HexPad(lid) + "  "
         + BinaryPad(lid) + ' 0d' + lid + '\n';
    }
    if(TestPrintCount > 0) console.log(o);
    let Expected = TimestampSecondsAsBigInt();
    // Wait until the next second to start the test.
    let then = Expected;
    while (Expected == then) then = TimestampSecondsAsBigInt();
    for(let i = 0; i < TestCount; ++i) {
      const Received = LLIDTimestamp(LLIDNext(rng));
      LLIDCompare(Expected, Received, '::LLIDTimestamp::A', i);
    }
    Expected = TimestampSecondsAsBigInt();
    then = Expected;
    while (Expected == then) then = TimestampSecondsAsBigInt();
    console.log('Waited ' + (then - Expected) + ' seconds');
    o = '';
    for(i = 0; i < TestPrintCount; ++i) {
      const Received = LLIDTimestamp(LLIDNext(rng));
      o += HexPad(Received) + ' ' + BinaryPad(Received) + ' 0d' + Received + 
           '\n';
    }
    if(TestPrintCount > 0) console.log(o);
    for(i = 0; i < TestCount; ++i) {
      const Received = LLIDTimestamp(LLIDNext(rng));
      LLIDCompare(Expected, Received, '::LLIDTimestamp::B', i);
    }
  }
});
