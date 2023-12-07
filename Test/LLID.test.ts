// Copyright AStartup. MIT License. You can find a copy of the license at 
// http://github.com/AStarStartup/LinearId

const { randomInt } = require('crypto');
const { BinaryPad, LLIDNext, LLIDTimestamp } = require('linearid');

import { expect, test } from '@jest/globals';
import { TestLoopCount, TestSpinWaitCount, TestPrintCount 
} from './GTests';

test("LLID works", () => {
  for(let k = 0; k < TestLoopCount; k++) {
    for(let i = 0; i < TestPrintCount; ++i) {
      let lid = LLIDNext(randomInt);
      console.log(i + ': ' + lid + "  " + BinaryPad(lid));
    }
    let now = Math.floor(new Date().getTime() / 100);
    for(let i = 0; i < TestPrintCount; ++i) {
      const LID = LLIDNext(randomInt);
      const Timestamp = LLIDTimestamp(LID);
      expect(Timestamp).toBeGreaterThan(now);
      expect(Timestamp).toBeLessThan(now + 1);
    }
    let then = new Date().getTime();
    for(let i = 0; i < TestSpinWaitCount; ++i) {
    }
    console.log('Waited ' + (new Date().getTime() - then) + ' milliseconds');
    now = Math.floor(new Date().getTime() / 100);
    for(let i = 0; i < TestPrintCount; ++i) {
      const LID = LLIDNext(randomInt);
      const Timestamp = LLIDTimestamp(LID);
      expect(Timestamp).toBeGreaterThan(now);
      expect(Timestamp).toBeLessThan(now + 1);
    }
  }
  /*
  LLIDPack
  LLIDPrint
  LLIDNextHex
  LLIDFromHex
  LLIDNextBuffer
  */
});
