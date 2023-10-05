// Copyright AStartup; all rights reserved.

const { randomInt } = require('crypto');

let time_last = BigInt(new Date().getTime());
let ticker = BigInt(0);

/* Prints the given bigint value to string. */
export function BigIntToBinary(value: bigint) {
  let result = "";
  let mask = BigInt(0x8000000000000000)
  while(mask != 0n) {
    result += (value & mask) ? '1' : '0';
    mask = mask >> 1n;
  }
  return result;
}

/* Generates a Linear ID using a microsecond timestamp and a spin counter.
Bit Pattern: [ 42-bits Microsecond Timestamp | 22-bits spin counter ] */
export function LIDNext(): bigint {
  let time_now = BigInt(new Date().getTime());
  if (time_now != time_last) {
    time_last = time_now;
    ticker = BigInt(0);
  }
  while (ticker >= 4194304) {
    time_now = BigInt(new Date().getTime());
    if (time_now != time_last) {
      time_last = time_now;
      ticker = BigInt(0);
    }
  }
  return (time_now << 22n) | ticker++;
}

export const LIDSource: bigint = RandomBigInt();

/* Returns [ LIDNext(), LIDSource ]. */
export function LID(): [bigint, bigint] {
  return [ LIDNext(), LIDSource ];
}

/* Generates a cryptographically secure bigint. */
export function RandomBigInt(): bigint {
  return BigInt(randomInt(1, 0xffffffff)) | 
          (BigInt(randomInt(1, 0xffffffff)) << 32n);
}

/* Prints the LID to string. */
export function LIDString(target: string = '') {
  return LIDPrint(LIDNext(), LIDSource, target);
}

/* Converts a bigint to a 2-byte hex string. */
export function BigIntToHex(value: bigint) {
  let hex = value.toString(16)
  if(value < 16) return '0' + hex
  return hex;
}

/* A Linear Id string. */
export function LIDPrint(msb: bigint, lsb: bigint, dest: string = '') {
  let shift = BigInt(56);
  while (shift > 0) {
    dest += BigIntToHex((msb >> shift) & 0xffn);
    shift -= 8n;
  }
  dest += BigIntToHex(msb & 0xffn);

  shift = BigInt(56);
  while (shift > 0) {
    dest += BigIntToHex((lsb >> shift) & 0xffn);
    shift -= 8n;
  }
  dest += BigIntToHex(lsb & 0xffn);
  return dest;
}

export function HexToNumber(hex: string | undefined) {
  if (hex == undefined) return -1;
  let c = hex.charCodeAt(0);
  if(c < '0'.charCodeAt(0) || c > 'z'.charCodeAt(0)) return -1;
  if(c <= '9'.charCodeAt(0)) return c - '0'.charCodeAt(0);
  if(c >= 'a'.charCodeAt(0)) return c - 'a'.charCodeAt(0) + 10;
  if(c < 'A'.charCodeAt(0) || c > 'Z'.charCodeAt(0)) return -1;
  return c - 'A'.charCodeAt(0) + 10;
}

/* Parses a LID from the input.
@return Returns [ msb: bigint, lsb: bigint ] and lsb and msb will be 0 up 
error. */
export function LIDParse(input: string): [BigInt, BigInt] {
  let lsb = 0n;
  let msb = 0n;
  if(input == undefined || input.length < 32) return [msb, lsb];
  // Read MSB
  let index = 0;
  let shift = 60n;
  while(shift > 0) {
    let c = HexToNumber(input[index++]);
    if(c < 0) return [0n, 0n];
    msb |= BigInt(c) << shift;
    shift -= 4n;
  }
  let c = HexToNumber(input[index++]);
  if(c < 0) return [0n, 0n];
  msb |= BigInt(c);

  // Read LSB
  shift = 60n;
  while(shift > 0) {
    c = HexToNumber(input[index++]);
    if(c < 0) return [0n, 0n];
    lsb |= BigInt(c) << shift;
    shift -= 4n;
  }
  c = HexToNumber(input[index++]);
  if(c < 0) return [0n, 0n];
  lsb |= BigInt(c);
  
  return [msb, lsb];
}

module.exports = { BigIntToBinary, HexToNumber, LID: LIDNext, LIDSource, LIDString, LIDPrint, LIDParse, RandomBigInt, ToHex: BigIntToHex };
