// Copyright AStartup. MIT License. You can find a copy of the license at 
// http://github.com/AStarStartup/LinearId

import { randomInt as rng } from 'crypto';
import { BigIntInRange, BinaryPad, BinaryPadBitCount, HexPad, HexPadBitCount, 
  LID64Print, LID64SourceBitCount, LID64TickerBitCount, LID64TimestampBitCount, 
  LID64Next, LID64Pack, LID64Ticker, LID64Timestamp, LID64Source, LID64Unpack, 
  NumberCountDecimals, NumberPad, TimestampSecondsNextBigInt 
} from '../dist';

import { expect, test } from '@jest/globals';
import { TestCount, TestLoopCount } from './Global';

// Number of times to print the test loop.
const TestPrintCount = 0;

// The window where a timestamp is valid in seconds.
const TimestampWindow = 100n;

function LID64Compare(expected: bigint, received: bigint | undefined, 
    tag:string = '', index: number) {
  const UpperBounds = expected + TimestampWindow;
  if(received == undefined) {
    console.log("LID64Compare::ERROR: received == undefined");
    return;
  }
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
    const TimestampE = BigIntInRange(rng, 0, 
      (1n << LID64TimestampBitCount) - 1n);
    const TickerE = BigIntInRange(rng, 0, 
      (1n << LID64TickerBitCount) - 1n);
    const SourceE = BigIntInRange(rng, 0, 
      (1n << LID64SourceBitCount) - 1n);
    const LID = LID64Pack(TimestampE, TickerE, SourceE);
    const [ TimestampR, TickerR , SourceR] = LID64Unpack(LID);
    LID64Compare(TimestampE, TimestampR, '::Pack::Timestamp', i);
    LID64Compare(TickerE, TickerR, '::Pack::Ticker', i);
    LID64Compare(SourceE, SourceR, '::Pack::Source', i);
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
  expect(LID64Print(LID64Next(rng))).not.toBe(true);
});
