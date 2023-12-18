// Copyright AStartup. MIT License. You can find a copy of the license at 
// http://github.com/AStarStartup/LinearId

const { randomInt: rng } = require('crypto');
const { BigIntInRange, BinaryPad, BinaryPadBitCount, HexPad, HexPadBitCount, 
  LID8Print, LID8SourceBitCount, LID8TickerBitCount, LID8TimestampBitCount, 
  LID8Next, LID8Pack, LID8Ticker, LID8Timestamp, LID8Source, LID8Unpack, 
  NumberCountDecimals, NumberPad, TimestampSecondsNextBigInt, TimestampWindow 
} = require('linearid');

import { expect, test } from '@jest/globals';
import { TestCount, TestLoopCount } from './Global';

// Number of times to print the test loop.
export const TestPrintCount = 16;

function LID8Compare(expected: bigint, received: bigint, 
    tag:string = '', index: number) {
  const UpperBounds = expected + TimestampWindow;
  if(received < expected || received > UpperBounds)
    console.log('\nUnexpected error at LID8' + tag + ' 𝚫:' + TimestampWindow +
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

test("LID8 works", () => {
  let i = 0;
  for(i = 0; i < TestCount; ++i) {
    const Timestamp_E = BigIntInRange(rng, 0, 
      (1n << LID8TimestampBitCount) - 1n);
    const Ticker_E = BigIntInRange(rng, 0, 
      (1n << LID8TickerBitCount) - 1n);
    const Source_E = BigIntInRange(rng, 0, 
      (1n << LID8SourceBitCount) - 1n);
    const LID = LID8Pack(Timestamp_E, Ticker_E, Source_E);
    const [ Timestamp_R, Ticker_R , Source_R] = LID8Unpack(LID);
    LID8Compare(Timestamp_E, Timestamp_R, '::Pack::Timestamp', i);
    LID8Compare(Ticker_E, Ticker_R, '::Pack::Ticker', i);
    LID8Compare(Source_E, Source_R, '::Pack::Source', i);
  }

  let o = '';
  const DecimalCount = NumberCountDecimals(TestPrintCount);
  for(let k = 0; k < TestLoopCount; k++) {
    for(i = 0; i < TestPrintCount; ++i) {
      let lid = LID8Next(rng);
      o += NumberPad(i, DecimalCount) + '.) ' + HexPad(lid, 64) + "  "
         + BinaryPad(lid, 64) + ' 0d' + lid + '\n';
    }
    if(TestPrintCount > 0) console.log(o);
    let timestamp_e = TimestampSecondsNextBigInt();
    for(let i = 0; i < TestCount; ++i) {
      const Lid = LID8Next(rng);
      const TimestampR = LID8Timestamp(Lid);
      LID8Compare(timestamp_e, TimestampR, '::LID8Timestamp::A', i);
    }
    if(TestPrintCount > 0) console.log(o);
    timestamp_e = TimestampSecondsNextBigInt();
    o = '::LID8Next: timestamp_e:' + HexPadBitCount(timestamp_e) + '\n';
    for(i = 0; i < TestPrintCount; ++i) {
      const Lid = LID8Next(rng);
      o += 'Lid       : ' + HexPad(Lid, 64) + ' ' + BinaryPad(Lid, 64) + '\n';
      const TimestampR = LID8Timestamp(Lid);
      const TickerR = LID8Ticker(Lid);
      const SourceR = LID8Source(Lid);
      o += 'TimestampR: ' + HexPad(TimestampR, 64) + ' ' 
         + BinaryPad(TimestampR, 64) + '\n'
         + 'TickerR   : ' + HexPad(TickerR, 64) + ' ' 
         + BinaryPad(TickerR, 64) + '\n'
         + 'SourceR   : ' + HexPad(SourceR, 64) + ' ' 
         + BinaryPad(SourceR, 64) + '\n\n';
    }
    if(TestPrintCount > 0) console.log(o);
    for(i = 0; i < TestCount; ++i) {
      const Received = LID8Timestamp(LID8Next(rng));
      LID8Compare(timestamp_e, Received, '::LID8Timestamp::B', i);
    }
  }
  expect(LID8Print(LID8Next())).not.toBe(true);
});
