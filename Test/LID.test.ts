// Copyright AStartup. MIT License. You can find a copy of the license at 
// http://github.com/AStarStartup/LinearId

const { randomInt: rng } = require('crypto');
import { BigIntInRange, BinaryPad, BinaryPadBitCount, HexPad, HexPadBitCount, 
  LIDPrint, LIDSourceBitCount, LIDTickerBitCount, LIDTimestampBitCount, 
  LIDNext, LIDPack, LIDTimestamp, LIDUnpack, NumberCountDecimals, NumberPad, 
  TimestampSecondsNextBigInt 
} from '../Source';

import { expect, test } from '@jest/globals';
import { TestCount, TestLoopCount } from './Global';

// Number of times to print the test loop.
const TestPrintCount = 0;

// The window where a timestamp is valid in seconds.
const TimestampWindow = 100n;

function LIDCompare(expected: bigint, received: bigint, 
    tag:string = '', index: number) {
  const UpperBounds = expected + TimestampWindow;
  if(received < expected || received > UpperBounds)
    console.log('\nUnexpected error at LID' + tag + ' 𝚫:' + TimestampWindow
    + ' ' + (received < expected ? 'low' : 'high') 
    + ' index:' + index 
    + '\nExpected: ' + HexPadBitCount(expected)  
    + ' 0d' + expected + ' UpperBounds:' + UpperBounds +
    + '\nReceived: ' + HexPadBitCount(received)  
    + ' 0d' + received  
    + '\nXOR     : ' + HexPadBitCount(received ^ expected) + '\n' 
    + '\nExpected: ' + BinaryPadBitCount(expected)  
    + '\nReceived: ' + BinaryPadBitCount(received)  
    + '\nXOR     : ' + BinaryPadBitCount(received ^ expected));
  expect(received).toBeGreaterThanOrEqual(expected);
  expect(received).toBeLessThanOrEqual(UpperBounds);
}

test('LID.Test', () => {
  let i = 0;
  for(i = 0; i < TestCount; ++i) {
    const TimestampE = BigIntInRange(rng, 0, 
      (1n << LIDTimestampBitCount) - 1n);
    const TickerE = BigIntInRange(rng, 0, 
      (1n << LIDTickerBitCount) - 1n);
    const SourceE = BigIntInRange(rng, 0, 
      (1n << LIDSourceBitCount) - 1n);
    const Lid = LIDPack(TimestampE, TickerE, SourceE);
    const [ TimestampR, TickerR , SourceR] = LIDUnpack(Lid);
    // if(i < TestPrintCount)
    //   console.log('\n\nLid       : ' + HexPad(Lid, 128) + ' ' 
    //   + BinaryPad(Lid, 128)
    //   + '\nTimestampE: ' + HexPad(TimestampE, 128) + ' ' 
    //   + BinaryPad(TimestampE, 128)
    //   + '\nTimestampR: ' + HexPad(TimestampR, 128) + ' ' 
    //   + BinaryPad(TimestampR, 128)
    //   + '\nTickerE   : ' + HexPad(TickerE, 128) + ' ' 
    //   + BinaryPad(TickerE, 128)
    //   + '\nTickerR   : ' + HexPad(TickerR, 128) + ' ' 
    //   + BinaryPad(TickerR, 128)
    //   + '\nSourceE   : ' + HexPad(SourceE, 128) + ' ' 
    //   + BinaryPad(SourceE, 128)
    //   + '\nSourceR   : ' + HexPad(SourceR, 128) + ' ' 
    //   + BinaryPad(SourceR, 128));
    LIDCompare(TimestampE, TimestampR, '::PackUnpack::Timestamp', i);
    LIDCompare(TickerE, TickerR, '::PackUnpack::Ticker', i);
    LIDCompare(SourceE, SourceR, '::PackUnpack::Source', i);
  }

  let o = '';
  const DecimalCount = NumberCountDecimals(TestPrintCount);
  for(let k = 0; k < TestLoopCount; k++) {
    for(i = 0; i < TestPrintCount; ++i) {
      let lid = LIDNext(rng);
      o += '\n' + NumberPad(i, DecimalCount) + '.) ' + HexPad(lid, 128) + "  "
         + BinaryPad(lid, 128);// + ' 0d' + lid;
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
      const [ TimestampR, TickerR, SourceR ] = LIDUnpack(Lid);
      o += '\nLid       : ' + HexPad(Lid, 128) + ' ' + BinaryPad(Lid, 128)
         + '\nTimestampR: ' + HexPad(TimestampR, 128) + ' ' 
         + BinaryPad(TimestampR, 128)
         + '\nTickerR   : ' + HexPad(TickerR, 128) + ' ' 
         + BinaryPad(TickerR, 128)
         + '\nSourceR   : ' + HexPad(SourceR, 128) + ' ' 
         + BinaryPad(SourceR, 128);
    }
    if(TestPrintCount > 0) console.log(o);
    for(i = 0; i < TestCount; ++i) {
      const Received = LIDTimestamp(LIDNext(rng));
      LIDCompare(timestamp_e, Received, '::LIDTimestamp::B', i);
    }
  }
  expect(LIDPrint(LIDNext(rng))).not.toBe(true);
});
