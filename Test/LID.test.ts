// Copyright AStartup. MIT License. You can find a copy of the license at 
// http://github.com/AStarStartup/LinearId

const { randomInt: rng } = require('crypto');
const { BigIntInRange, BinaryPad, BinaryPadBitCount, HexPad, HexPadBitCount, 
  LIDPrint, LIDSourceBitCount, LIDTickerBitCount, LIDTimestampBitCount, 
  LIDNext, LIDPack, LIDTicker, LIDTimestamp, LIDSource, LIDUnpack, 
  NumberCountDecimals, NumberPad, TimestampSecondsNextBigInt, TimestampWindow 
} = require('linearid');

import { expect, test } from '@jest/globals';
import { TestCount, TestLoopCount } from './Global';

// Number of times to print the test loop.
export const TestPrintCount = 16;

function LIDCompare(expected: bigint, received: bigint, 
    tag:string = '', index: number) {
  const UpperBounds = expected + TimestampWindow;
  if(received < expected || received > UpperBounds)
    console.log('\nUnexpected error at LID' + tag + ' 𝚫:' + TimestampWindow +
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

test("LID works", () => {
  let i = 0;
  for(i = 0; i < TestCount; ++i) {
    const Timestamp_E = BigIntInRange(rng, 0, 
      (1n << LIDTimestampBitCount) - 1n);
    const Ticker_E = BigIntInRange(rng, 0, 
      (1n << LIDTickerBitCount) - 1n);
    const Source_E = BigIntInRange(rng, 0, 
      (1n << LIDSourceBitCount) - 1n);
    const LID = LIDPack(Timestamp_E, Ticker_E, Source_E);
    const [ Timestamp_R, Ticker_R , Source_R] = LIDUnpack(LID);
    LIDCompare(Timestamp_E, Timestamp_R, '::Pack::Timestamp', i);
    LIDCompare(Ticker_E, Ticker_R, '::Pack::Ticker', i);
    LIDCompare(Source_E, Source_R, '::Pack::Source', i);
  }

  let o = '';
  const DecimalCount = NumberCountDecimals(TestPrintCount);
  for(let k = 0; k < TestLoopCount; k++) {
    for(i = 0; i < TestPrintCount; ++i) {
      let lid = LIDNext(rng);
      o += NumberPad(i, DecimalCount) + '.) ' + HexPad(lid, 64) + "  "
         + BinaryPad(lid, 64) + ' 0d' + lid + '\n';
    }
    if(TestPrintCount > 0) console.log(o);
    let timestamp_e = TimestampSecondsNextBigInt();
    for(let i = 0; i < TestCount; ++i) {
      const Lid = LIDNext(rng);
      const TimestampR = LIDTimestamp(Lid);
      LIDCompare(timestamp_e, TimestampR, '::LIDTimestamp::A', i);
    }
    if(TestPrintCount > 0) console.log(o);
    timestamp_e = TimestampSecondsNextBigInt();
    o = '::LIDNext: timestamp_e:' + HexPadBitCount(timestamp_e) + '\n';
    for(i = 0; i < TestPrintCount; ++i) {
      const Lid = LIDNext(rng);
      o += 'Lid       : ' + HexPad(Lid, 64) + ' ' + BinaryPad(Lid, 64) + '\n';
      const TimestampR = LIDTimestamp(Lid);
      const TickerR = LIDTicker(Lid);
      const SourceR = LIDSource(Lid);
      o += 'TimestampR: ' + HexPad(TimestampR, 64) + ' ' 
         + BinaryPad(TimestampR, 64) + '\n'
         + 'TickerR   : ' + HexPad(TickerR, 64) + ' ' 
         + BinaryPad(TickerR, 64) + '\n'
         + 'SourceR   : ' + HexPad(SourceR, 64) + ' ' 
         + BinaryPad(SourceR, 64) + '\n\n';
    }
    if(TestPrintCount > 0) console.log(o);
    for(i = 0; i < TestCount; ++i) {
      const Received = LIDTimestamp(LIDNext(rng));
      LIDCompare(timestamp_e, Received, '::LIDTimestamp::B', i);
    }
  }
  expect(LIDPrint(LIDNext())).not.toBe(true);
});
