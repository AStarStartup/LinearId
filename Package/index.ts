// Copyright AStartup. MIT License. You can find a copy of the license at 
// http://github.com/AStarStartup/LinearId

const crypto = require('crypto');

// The number of bits to use for the spin ticker.
let SpinTickerBitCount: bigint = 22n;

// The number of bits to use for the spin-ticker MSb offset.
let SpinTickerMSbOffsetBits = 7n;

// The 
let SpinTickerMax = (1n << (SpinTickerBitCount - SpinTickerMSbOffsetBits)) - 1n;

// The last time a LID was created.
let time_last: bigint = BigInt(new Date().getTime());

// The current number of times that LIDNextMSW has been called this millisecond.
let ticker: bigint = 0n;

/* A Linear ID with 42-bit MSb millisecond ticker, 22-bit sub-ms spin ticker,
and 64-bit server ID. */
export type LID = [bigint, bigint];

/* Generates a cryptographically secure bigint. */
export function RandomBigIntPlus24Bits(): [bigint, bigint] {
  let a = BigInt(crypto.randomInt(1, 0xffffffffffff));
  let b = BigInt(crypto.randomInt(1, 0xffffffffffff));
  let c = (a & 0xffffffffn) | ((b & 0xffffffffn) << 32n);
  let d = (a >> 32n) | ((b >> 32n) << 12n);
  let mask = (1n << SpinTickerMSbOffsetBits) - 1n;
  return [c, (d & mask) << SpinTickerMSbOffsetBits];
}

/* Generates a cryptographically secure bigint. */
export function RandomBigInt(): bigint {
  let [rnd, rem] = RandomBigIntPlus24Bits();
  return rnd;
}

export const [LIDSource, TickerOffset] = RandomBigIntPlus24Bits();

/* XORs the LSW and MSW. */
export function LIDXOR(lid: LID): bigint {
  return lid[0] ^ lid[1];
}

/* Converts a bigint to a 2-byte hex string. */
export function NumberByteToHex(value: number, dest: string = ''): string {
  let hex = value.toString(16);
  if(value < 16) return '0' + hex;
  return hex;
}

/* Converts a number to a 2-byte hex string. */
export function BigIntByteToHex(value: bigint, dest: string = ''): string {
  if(value < 0n || value > 255n) return dest;
  let hex = value.toString(16);
  if(hex.length == 1) return '0' + hex;
  return hex;
}

/* Converts a hex character string to a byte as a number. */
export function ByteToHex(input: bigint, dest: string = ''): string {
  if(input < 0n || input > 15n) return dest;
  return BigIntByteToHex(input & 0xfn) + BigIntByteToHex((input >> 4n) & 0xfn);
}

/* Converts a hex character string to a byte as a number. */
export function HexToByte(input: string, index: number): number {
  let a = HexToBigInt(input[index]);
  let b = HexToBigInt(input[index + 1]);
  if(a < 0 || b < 0) return -1;
  let result = Number((a << 4n) | b);
  return result
}

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

/* Generates the next LID as an array of two bigint.
@return [LIDNextMSW(), LIDSource]. */
export function LIDNext(): LID {
  return [LIDSource, LIDNextMSW()];
}

/* Prints the Linear Id to the dest string. */
export function LIDToHex(lid: LID, dest: string = ''): string {
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
export function LIDNextHex(dest: string = ''): string {
  return LIDToHex(LIDNext (), dest);
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

/* Converts a LID in a buffer to a LID. */
export function LIDFromBuffer(buf: Buffer) {
  if(buf == undefined)return [0n, 0n];
  if(buf.length != 16) return [0n, 0n];
  let LSW = 0n;
  let MSW = 0n;
  for (let index = 0; index < 8; index++) {
    const LSB = buf[index    ];
    const MSB = buf[index + 8];
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
@return Returns a LID that will be 0 upon error. */
export function LIDFromHex(input: string): LID {
  let lsw = 0n;
  let msw = 0n;
  if(input == undefined || input.length < 32) return [lsw, msw];
  let index = 0;
  let shift = 60n;
  while (shift >= 0n) {
    let c = HexToBigInt(input[index]);
    if(c < 0n) return [0n, 0n];
    msw |= c << shift;
    c = HexToBigInt(input[index++ + 16]);
    if(c < 0n) return [0n, 0n];
    lsw |= c << shift;
    shift -= 4n;
  }
  
  return [lsw, msw];
}

/* Converts LID Buffer to a hex string. */
export function LIDBufferToHex(lid: Buffer, dest: string = ''): string {
  if(lid == undefined || lid.length != 16) return dest + 'ERROR';
  let result = '';
  for(let i = 15; i >= 0; --i) {
    let b = lid[i];
    if(b == undefined) return dest + 'ERROR';
    dest += NumberByteToHex(b);
  }
  if(dest.length == 0) return result;
  return dest + result;
}

/* Converts a LID hex string to a Buffer. */
export function LIDBufferFromHex(input: string): Buffer | undefined {
  let buf = Buffer.alloc(16);
  if(input == undefined || input.length < 32) return undefined;
  for(let index = 0; index < 8; index++) {
    let c = HexToByte(input, 30 - 2 * index);
    if(c < 0) return undefined;
    buf[index] = c;
    c = HexToByte(input, 14 - 2 * index);
    if(c < 0) return undefined;
    buf[index + 8] = c;
  }
  return buf;
}
