// Copyright AStartup. MIT License. You can find a copy of the license at 
// http://github.com/AStarStartup/LinearId

const { randomInt: rng } = require('crypto');
const { BigIntInRange, BinaryPad, BinaryPadBitCount, HexPad, HexPadBitCount, 
  LID64Print, LID64SourceBitCount, LID64TickerBitCount, LID64TimestampBitCount, 
  LID64Next, LID64Pack, LID64Ticker, LID64Timestamp, LID64Source, LID64Unpack, 
  NumberCountDecimals, NumberPad, TimestampSecondsNextBigInt 
} = require('linearid');

import { expect, test } from '@jest/globals';
import { TestCount, TestLoopCount } from './Global';

// Number of times to print the test loop.
const TestPrintCount = 0;

// The window where a timestamp is valid in seconds.
const TimestampWindow = 100n;

function LID64Compare(expected: bigint, received: bigint, 
    tag:string = '', index: number) {
  const UpperBounds = expected + TimestampWindow;
  if(received < expected || received > UpperBounds)
    console.log('\nUnexpected error at LID64' + tag + ' 𝚫:' + TimestampWindow +
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

test('LID64.Test', () => {
  let i = 0;
  for(i = 0; i < TestCount; ++i) {
    const Timestamp_E = BigIntInRange(rng, 0, 
      (1n << LID64TimestampBitCount) - 1n);
    const Ticker_E = BigIntInRange(rng, 0, 
      (1n << LID64TickerBitCount) - 1n);
    const Source_E = BigIntInRange(rng, 0, 
      (1n << LID64SourceBitCount) - 1n);
    const LID = LID64Pack(Timestamp_E, Ticker_E, Source_E);
    const [ Timestamp_R, Ticker_R , Source_R] = LID64Unpack(LID);
    LID64Compare(Timestamp_E, Timestamp_R, '::Pack::Timestamp', i);
    LID64Compare(Ticker_E, Ticker_R, '::Pack::Ticker', i);
    LID64Compare(Source_E, Source_R, '::Pack::Source', i);
  }

  let o = '';
  const DecimalCount = NumberCountDecimals(TestPrintCount);
  for(let k = 0; k < TestLoopCount; k++) {
    for(i = 0; i < TestPrintCount; ++i) {
      let lid = LID64Next(rng);
      o += NumberPad(i, DecimalCount) + '.) ' + HexPad(lid) + "  "
         + BinaryPad(lid) + ' 0d' + lid + '\n';
    }
    if(TestPrintCount > 0) console.log(o);
    let timestamp_e = TimestampSecondsNextBigInt();
    for(let i = 0; i < TestCount; ++i) {
      const Lid = LID64Next(rng);
      const TimestampR = LID64Timestamp(Lid);
      LID64Compare(timestamp_e, TimestampR, '::LID64Timestamp::A', i);
    }
    if(TestPrintCount > 0) console.log(o);
    timestamp_e = TimestampSecondsNextBigInt();
    o = '::LID64Next: timestamp_e:' + HexPadBitCount(timestamp_e) + '\n';
    for(i = 0; i < TestPrintCount; ++i) {
      const Lid = LID64Next(rng);
      o += 'Lid       : ' + HexPad(Lid) + ' ' + BinaryPad(Lid) + '\n';
      const TimestampR = LID64Timestamp(Lid);
      const TickerR = LID64Ticker(Lid);
      const SourceR = LID64Source(Lid);
      o += 'TimestampR: ' + HexPad(TimestampR) + ' ' 
         + BinaryPad(TimestampR) + '\n'
         + 'TickerR   : ' + HexPad(TickerR) + ' ' 
         + BinaryPad(TickerR) + '\n'
         + 'SourceR   : ' + HexPad(SourceR) + ' ' 
         + BinaryPad(SourceR) + '\n\n';
    }
    if(TestPrintCount > 0) console.log(o);
    for(i = 0; i < TestCount; ++i) {
      const Received = LID64Timestamp(LID64Next(rng));
      LID64Compare(timestamp_e, Received, '::LID64Timestamp::B', i);
    }
  }
  expect(LID64Print(LID64Next())).not.toBe(true);
});
