// Copyright AStartup; all rights reserved.

const { randomInt } = require('crypto');

let time_last: bigint = BigInt(new Date().getTime());
let ticker: bigint = 0n;
let SpinTickerBitCount: bigint = 22n;

/* Generates a Linear ID using a microsecond timestamp and a spin counter.
Bit Pattern: [ 42-bits Microsecond Timestamp | 22-bits spin counter ] */
export function LIDNext(): bigint {
  let time_now = BigInt(new Date().getTime());
  if (time_now != time_last) {
    time_last = time_now;
    ticker = 0n;
  }
  while (ticker >= 1n << SpinTickerBitCount) {
    time_now = BigInt(new Date().getTime());
    if (time_now != time_last) {
      time_last = time_now;
      ticker = 0n;
    }
  }
  return (time_now << SpinTickerBitCount) | ticker++;
}

/* Generates a cryptographically secure bigint. */
export function RandomBigInt(): bigint {
  return BigInt(randomInt(1, 0xffffffff)) | 
                (BigInt(randomInt(1, 0xffffffff)) << 32n);
}

export const LIDSource: bigint = RandomBigInt();

/* Returns [ LIDNext(), LIDSource ]. */
export function LID(): [bigint, bigint] {
  return [ LIDNext(), LIDSource ];
}

/* Extracts the milliseconds timestamp. */
export function LIDMilliseconds(msb: bigint) {
  return Number(msb >> SpinTickerBitCount);
}

/* Extracts the seconds timestamp. */
export function LIDSeconds(msb: bigint, epoch: number) {
  return (LIDMilliseconds(msb) / 1000) - epoch;
}

/* Prints the LID to string. */
export function LIDString(target: string = '') {
  return LIDPrint(LIDNext(), LIDSource, target);
}

/* Converts a bigint to a 2-byte hex string. */
export function BigIntToHex(value: bigint) {
  let hex = value.toString(16);
  if(value < 16) return '0' + hex;
  return hex;
}

/* A Linear Id string. */
export function LIDPrint(msb: bigint, lsb: bigint, dest: string = '') {
  let shift = 56n;
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

/* Converts a hex character string to a bigint. */
export function HexToBigInt(hex: string | undefined): bigint {
  if (hex == undefined) return -1n;
  let c = hex.charCodeAt(0);
  if(c < '0'.charCodeAt(0) || c > 'z'.charCodeAt(0)) return -1n;
  if(c <= '9'.charCodeAt(0)) 
    return BigInt(c - '0'.charCodeAt(0));
  if(c >= 'a'.charCodeAt(0)) 
    return BigInt(c) - BigInt('a'.charCodeAt(0)) + 10n;
  if(c < 'A'.charCodeAt(0) || c > 'Z'.charCodeAt(0))
    return -1n;
  return BigInt(c - 'A'.charCodeAt(0)) + 10n;
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
  while(shift > 0n) {
    let c = HexToBigInt(input[index++]);
    if(c < 0n) return [0n, 0n];
    msb |= c << shift;
    shift -= 4n;
  }
  let c = HexToBigInt(input[index++]);
  if(c < 0n) return [0n, 0n];
  msb |= c;

  // Read LSB
  shift = 60n;
  while(shift > 0) {
    c = HexToBigInt(input[index++]);
    if(c < 0n) return [0n, 0n];
    lsb |= c << shift;
    shift -= 4n;
  }
  c = HexToBigInt(input[index++]);
  if(c < 0n) return [0n, 0n];
  lsb |= c;
  
  return [msb, lsb];
}
