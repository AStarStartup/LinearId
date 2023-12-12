import { expect } from '@jest/globals';
import { randomInt } from 'crypto';
const { NumberInBitRange } = require('linearid');

// Number of bits to exhaustively test. Default: 17 Min: 11
export const TestBitCount = 17;

// Number of bits to test up to.
export const TestBitsUpTo = 64;

//  Number of times to run the test loop.
export const TestCount = 1 << TestBitCount;

// Number of test loop counts to iterate through.
export const TestLoopCount = 2;

// Number of times to print the test loop.
export const TestPrintCount = 16;

// Number of times to test each bit range with random numbers. Default: 1024
export const TestsPerBit = 1 << 10;

// Generates a random number that is not in the exhaustive test range.
export function NumberInTestRange() {
  return NumberInBitRange(randomInt, TestBitCount, 48);
}
