// Copyright AStartup; all rights reserved.

const { randomInt } = require('crypto');

let time_last: bigint = BigInt(new Date().getTime());
let ticker: bigint = 0n;
let SpinTickerBitCount: bigint = 22n;

/* A Linear ID with 42-bit MSb millisecond ticker, 22-bit sub-ms spin ticker,
and 64-bit server ID. */
export type LID = [bigint, bigint];

/* Generates a Linear ID Most-significant Word from a microsecond timestamp
and a spin counter.
Bit Pattern: `[ `42-bits Microsecond Timestamp | 22-bits spin counter ] */
export function LIDNextMSW(): bigint {
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

/* Generates the next LID as an array of two bigint.
@return [LIDNextMSW(), LIDSource]. */
export function LIDNext(): LID {
  return [LIDSource, LIDNextMSW()];
}

/* Converts a bigint to a 2-byte hex string. */
export function BigIntByteToHex(value: bigint): string {
  let hex = value.toString(16);
  if(value < 16) return '0' + hex;
  return hex;
}

/* Prints the Linear Id to the dest string. */
export function LIDPrint(lid: LID, dest: string = ''): string {
  const [LSW, MSW] = lid;
  let shift = 56n;
  while (shift > 0) {
    dest += BigIntByteToHex((MSW >> shift) & 0xffn);
    shift -= 8n;
  }
  dest += BigIntByteToHex(MSW & 0xffn);

  shift = 56n;
  while (shift > 0) {
    dest += BigIntByteToHex((LSW >> shift) & 0xffn);
    shift -= 8n;
  }
  dest += BigIntByteToHex(LSW & 0xffn);
  return dest;
}

/* Generates the next LID as a string or prints it to the dest. */
export function LIDNextString(dest: string = ''): string {
  return LIDPrint(LIDNext (), dest);
}

/* Generates the next LID as a Buffer.
@return A Buffer containing [LIDSource, LIDNextMSW()]. */
export function LIDNextBuffer(lid: LID | undefined = undefined) {
  const [LSW, MSW] = (lid == undefined) ? [LIDSource, LIDNextMSW()] 
                                        : [lid[0], lid[1]];
  const Buf = Buffer.alloc(16);
  for (let index = 0; index < 8; index++) {
    const Shift = BigInt(index << 3); // << 3 to * 8.
    Buf[index    ] = Number((LSW >> Shift) & 0xffn);
    Buf[index + 8] = Number((MSW >> Shift) & 0xffn);
  }
  return Buf;
}

/* Converts a LID in a buffer to a [bigint, bigint] LID. */
export function LIDFromBuffer(lid: Buffer) {
  let LSW = 0n;
  let MSW = 0n;
  for (let index = 0; index < 8; index++) {
    const LSB = lid[index    ];
    const MSB = lid[index + 8];
    if(LSB == undefined || MSB == undefined) return [0n, 0n];
    const Shift = BigInt(index << 3); // << 3 to * 8.
    LSW |= BigInt(LSB) << Shift;
    MSW |= BigInt(MSB) << Shift;
  }
  return [LSW, MSW];
}

/* Extracts the LSW from the LID. */
export function LIDBufferLSW(lid: Buffer) {
  let word = 0n;
  for(let index = 0; index < 8;) {
    let b = lid[index];
    if(b == undefined) return 0n;
    word |= BigInt(b) << BigInt(index << 3); // << 3 to * 8.
  }
  return word;
}

/* Extracts the MSW from the LID. */
export function LIDBufferMSW(lid: Buffer) {
  let word = 0n;
  for(let index = 0; index < 8;) {
    let b = lid[index + 8];
    if(b == undefined) return 0n;
    word |= BigInt(b) << BigInt(index << 3); // << 3 to * 8.
  }
  return word;
}

/* Extracts the milliseconds timestamp. */
export function LIDMilliseconds(msw: bigint): number {
  return Number(msw >> SpinTickerBitCount);
}

/* Extracts the seconds timestamp. */
export function LIDSeconds(msw: bigint): number {
  return LIDMilliseconds(msw) / 1000;
}

/* Converts a hex character string to a bigint. */
export function HexToBigInt(hex: string | undefined): bigint {
  if (hex == undefined) return -1n;
  let c = hex.charCodeAt(0);
  if(c < '0'.charCodeAt(0) || c > 'z'.charCodeAt(0)) return -1n;
  if(c <= '9'.charCodeAt(0)) 
    return BigInt(c - '0'.charCodeAt(0));
  if(c >= 'a'.charCodeAt(0)) 
    return BigInt(c - 'a'.charCodeAt(0) + 10);
  if(c < 'A'.charCodeAt(0) || c > 'Z'.charCodeAt(0))
    return -1n;
  return BigInt(c - 'A'.charCodeAt(0) + 10);
}

/* Parses a LID from the input.
@return Returns [ msw: bigint, lsw: bigint ] and lsw and msw will be 0 up 
error. */
export function LIDParse(input: string): LID {
  let lsw = 0n;
  let msw = 0n;
  if(input == undefined || input.length < 32) return [lsw, msw];
  // Read MSW
  let index = 0;
  let shift = 60n;
  while(shift > 0n) {
    let c = HexToBigInt(input[index++]);
    if(c < 0n) return [0n, 0n];
    msw |= c << shift;
    shift -= 4n;
  }
  let c = HexToBigInt(input[index++]);
  if(c < 0n) return [0n, 0n];
  msw |= c;

  // Read LSW
  shift = 60n;
  while(shift > 0) {
    c = HexToBigInt(input[index++]);
    if(c < 0n) return [0n, 0n];
    lsw |= c << shift;
    shift -= 4n;
  }
  c = HexToBigInt(input[index++]);
  if(c < 0n) return [0n, 0n];
  lsw |= c;
  
  return [lsw, msw];
}
