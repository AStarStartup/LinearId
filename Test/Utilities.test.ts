// Copyright AStartup. MIT License. You can find a copy of the license at 
// http://github.com/AStarStartup/LinearId

const { randomInt } = require('crypto');
const { BigIntInBitRange, BigIntIsInBitRange, BigIntToBuffer, BigIntRandom,
  BinaryPad, BinaryPadBitCount, BufferToBigInt, CountBitsInByte, HexToBigInt, 
  HexToBuffer, HexPadBitCount, NumberCountBits, NumberCountBytes
} = require('linearid'); 

import { expect, test } from '@jest/globals';
import { NumberInTestRange, TestBitCount, TestBitsUpTo, TestCount, 
  TestsPerBit, TestPrintCount } from './GTests';

/* @todo Test me!
HexToBuffer
ByteToHex
*/

// Asserts the lsw_i and msw_i are the same as the lsw_p and msw_p 
// respectively.
export function BigIntVerify(int_i: bigint, int_p: bigint, tag: string) {
  let o = '';
  if(int_i != int_p) {
    o = '\nError at ' + tag + 
        '\nint_i: ' + HexPadBitCount(int_i) + 
        '\nint_p: ' + HexPadBitCount(int_p) + 
        '\ndiff : ' + HexPadBitCount((int_p ^ int_i)) + '\n' +
        '\nint_i: ' + BinaryPadBitCount(int_i) + 
        '\nint_p: ' + BinaryPadBitCount(int_p) + 
        '\ndiff : ' + BinaryPadBitCount((int_p ^ int_i));
    console.log(o);
  }
  expect(int_i == int_p).toBe(true); 
}

test("Utilities", () => {
  let i = 0;
  let j = 0;
  let o = '';

  //console.log('Testing CountBitsInByte');
  expect(CountBitsInByte(0)).toBe(0);
  for(j = 1; j <= 8; ++j)
    while(++i < 1 << j) expect(CountBitsInByte(i)).toBe(j);

  //console.log('Testing BigIntRandom...');
  for(i = 0; i < TestPrintCount; ++i) {
    const BitCount = 64;
    const STR = BigIntRandom(randomInt, BitCount);
    if(STR.toString(2).length > BitCount)
      console.log('STR: ' + STR + ' 0b' + STR.toString(2) + ':' + 
                  STR.toString(2).length + '\n');
    const STRPad = BinaryPad(STR, BitCount, '');
    if(STRPad.length > BitCount)
      console.log('STRPad: ' + STRPad + ':' + STRPad.length + '\n');
    expect(STR.toString(2).length).toBeLessThanOrEqual(BitCount);
    expect(STRPad.length).toBeLessThanOrEqual(BitCount);
  }
  
  //console.log('Testing BigIntInBitRange...');
  for(i = 1; i <= TestBitsUpTo; ++i) {
    for(j = 1; j <= 100; ++j) {
      //console.log('-------------------------------------------------------');
      const V = BigIntInBitRange(randomInt, i, i);
      let padded = BinaryPad(V, 64);
      if (!BigIntIsInBitRange(V, i, i))
        console.log(i + '.) V:0x' + V.toString(16) + 
                    ':' + V.toString(2).length +
                    ' 0b' + padded + ':' + V.toString(2).length + '\n');
      expect(BigIntIsInBitRange(V, i, i)).toBe(true);
    }
  }
  
  //console.log('Testing NumberCountBytes');
  i = 0;
  for(j = 0; j < TestBitCount; ++j)
    while(++i < (1 << j))
      expect(NumberCountBytes(i)).toBe(Math.ceil(i.toString(16).length / 2));
  
  for(j = 0; j < TestCount; ++j) {
    const V = NumberInTestRange();
    expect(NumberCountBytes(V)).toBe(Math.ceil(V.toString(16).length / 2));
  }
  
  //console.log('Testing NumberCountBits');
  i = 0;
  for(j = 0; j < TestBitCount; ++j)
    while(++i < (1 << j)) expect(NumberCountBits(i)).toBe(j);

  for(j = 0; j < TestCount; ++j) {
    const V = NumberInTestRange();
    if (NumberCountBits(V) != V.toString(2).length) {
      console.log('V:' + V + ' 0x' + V.toString(16) + ' 0b' + V.toString(2));
    }
    expect(NumberCountBits(V)).toBe(V.toString(2).length);
  }

  let problem_children: number[] = [81034501338101, 133095497592179];
  for(let k = 0; k < problem_children.length; ++k){
    let red_headed_stepchild = problem_children[k];
    if(red_headed_stepchild == undefined) break;
    expect(NumberCountBits(red_headed_stepchild)).
      toBe(red_headed_stepchild.toString(2).length)
  }

  console.log('Testing HexToBigInt');
  for(j = 0; j < TestPrintCount; ++j) {
    let Value = BigIntRandom(randomInt);
    //console.log('Value:0x' + Value);
    const Result = HexToBigInt(Value.toString(16));
    //console.log('Result:' + Result);
    if(Value != Result) {
      console.log('HexToBigInt CRITICAL ERROR ' + Value + ': 0x' + 
                  Value.toString(16) + ' found ' + Result + ': 0x' + 
                  Result.toString(16));
    }
    expect(Value).toBe(Result);
  }
  
  let int_i = BigIntRandom(randomInt);

  let str = int_i.toString(16);
  let int_p = HexToBigInt(str);
  BigIntVerify(int_i, int_p, '::HexToBigInt::A');
  //console.log(
  //  'Scanning LID Hex...\n\n' +
  //  '\nint_i: 0x' + int_i.toString(16) + "  0b'" + int_i.toString(2) + 
  //  '\nint_p: 0x' + int_p.toString(16) + "  0b'" + int_p.toString(2) +
  //  '\nint_h: 0x' + str);

  BigIntVerify(int_i, int_p, '::B');

  let buf = BigIntToBuffer(int_i);
  int_p = BufferToBigInt(buf);
  BigIntVerify(int_i, int_p, '::C');

  buf = HexToBuffer(str);
  expect(buf).not.toBe(undefined);
  int_p = BufferToBigInt(buf);
  BigIntVerify(int_i, int_p, '::D');
  
  for(j = 2; j < TestBitCount; ++j) {
    for (let i = 0; i < (j < TestsPerBit ? j >> 2 : TestsPerBit); ++i) {
      int_i = BigIntInBitRange(randomInt, j < TestsPerBit ? 1 : j, j);
      const IntIHex = int_i.toString(16);
      int_p = HexToBigInt(IntIHex);
      BigIntVerify(int_i, int_p, '::BigIntToHex');
      
      buf = BigIntToBuffer(int_i);
      int_p = BufferToBigInt(buf);
      BigIntVerify(int_i, int_p, '::BigIntToBuffer');
      
      buf = HexToBuffer(IntIHex);
      int_p = BufferToBigInt(buf);
      BigIntVerify(int_i, int_p, '::HexToBuffer');
    }
  }
});
