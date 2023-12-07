// Copyright AStartup. MIT License. You can find a copy of the license at 
// http://github.com/AStarStartup/LinearId

// Throughout this code when I refer to a timestamp this means a seconds 
// timestamp.

//--- Variables ---//

// The last time a LID was created.
let lid_timestamp: number = Math.floor(new Date().getTime() / 1000);

// The number of times that LIDNext has been called this second.
let lid_ticker: number = 0;

// The Source Id bigint.
let lid_source: bigint = 0n;

// The LID8 Source Id as a number.
let lid8_source: number = 0;

// Flat to check the lid upon epoch. 
let lid_source_check_on_epoch: boolean = false; 

// The 8-byte Local LID ticker count.
let lid8_ticker: number = 0;

// The 8-byte Local LID ticker count.
let llid_ticker: number = 0;

//--- Utilities ---//

// Cryptographically-secure Random Number Generator function type.
type CSRNG = (min: number, max: number) => number;

// Number of bits in a JS number.
export const NumberBitCount = 53;

// Converts a hex character string to a byte as a number.
export function ByteToHex(input: number, dest: string = ''): string {
  if(input < 0n || input > 15n) return dest;
  return dest + NumberToHex(input & 0xf) + NumberToHex((input >> 4) & 0xf);
}

export function CountBitsInByte(value: number) {
  if(value < 16) {
    if(value < 4) {
      if(value < 2) {
        if (value < 1)    return 0;
        else              return 1;
      }
      else                return 2;
    } else {
      if (value < 8)      return 3;
      else                return 4;
    }
  } else {
    if (value < 64) {
      if (value < 32)     return 5;
      else                return 6;
    } else
      if (value < 128)    return 7;
  }
  return 8
}

// Returns the number of bytes in a number.
export function NumberCountBytes(value: number): number {
  if (value <= 0xffffffff) {
    if (value <= 0xffff) {
      if(value <= 0xff)
        return 1;
      else
        return 2;
    } else {
      if (value <= 0xffffff)
        return 3;
      else
        return 4;
    }
  } else {
    if (value <= 0xffffffffffff) {
      if (value <= 0xffffffffff)
        return 5;
      else
        return 6;
    }
  }
  return 7;
}

// Returns the number of bits in a bigint.
export function NumberCountBits(value: number): number {
  const BitCount = (NumberCountBytes(value) - 1) << 3; // << 3 to * 8
  let msb = (value < 1 << 30) ? value >> BitCount 
                              : Number(BigInt(value) >> BigInt(BitCount));
  return BitCount + CountBitsInByte(msb);
}

// Returns the number of bits in a bigint.
export function CountBits(value: bigint | number): number {
  let v: bigint = BigInt(value);
  let count = 0;
  while(v >= Number.MAX_SAFE_INTEGER) {
    v >>= 53n;
    ++count;
  }
  const ByteCount = NumberCountBytes(Number(v));
  const MSB = Number(v >> BigInt(ByteCount - 1));
  return 53 * count + ByteCount + NumberCountBits(MSB);
}

// Returns the number of bytes in a bigint.
export function BigIntByteCount(value: bigint): number {
  const BitCount = CountBits(value);
  return (BitCount >> 3) + (BitCount & 0x7 ? 1 : 0);
}

/* Converts a BigInt to a Buffer.
@todo   Improve to copy bigint, which I've read is hacky with Node & CJS and
may require another function pointer type hack.
@return A Buffer containing [lid_source_lsw, LIDNextMSW()]. */
export function BigIntToBuffer(value: bigint) {
  const ByteCount = BigIntByteCount(value);
  //console.log('value:' + value + ' ByteCount:' + ByteCount);
  const Buf = Buffer.alloc(ByteCount);
  for(let index = 0; index < ByteCount; ++index) {
    Buf[index] = Number((value >> BigInt(index << 3)) & 0xffn);
  }
  return Buf;
}

// Pads a binary string with leading zeros aligned to a bit boundary.
export function BinaryPad(value: string | number | bigint,
                          bit_count: number = 64, prefix: string = '0b') { 
  const str = ((typeof value).toString() == 'string')
            ? String(value)
            : value.toString(2);
  if(bit_count < str.length) {
    if (bit_count < 3) return prefix + '.'.repeat(bit_count);
    return prefix + str.substring(0, bit_count - 3) + '...';
  }
  return prefix + '0'.repeat(bit_count - str.length) + str;
}

export function BinaryPadBitCount(value: string | number | bigint,
    bit_count: number = 64, prefix: string = '0b') { 
  return BinaryPad(value, bit_count, prefix) + ':' + 
    ((typeof value).toString() == 'string' ? String(value).length 
                                           : BigInt(value).toString(2).length)
}

// Gets the current date-time in seconds.
export function DateTimeSeconds(): number {
  return Math.floor(new Date().getTime() / 1000);
}

// Converts a Buffer to a BigInt.
export function BufferToBigInt(buf: Buffer): bigint {
  //console.log('buf:"' + buf.toString() + '":' + buf.length);
  let result = 0n;
  for(let i = 0; i < buf.length; ++i)
    result |= BigInt(buf[i] ?? 0) << BigInt(i << 3);
  return result;
}

// Converts a Buffer to a BigInt.
export function BufferToHex(buf: Buffer): string {
  let result = '';
  for(let i = 0; i < buf.length; ++i)
    result = ByteToHex(buf[i] ?? 0, result);
  return result;
}

// Pads a hex value with leading zeros aligned to n-bit boundary.
export function HexPad(value: string | number | bigint, 
    bit_count: number = 64, prefix: string = '0x'): string {
  if(bit_count <= 0) return 'ERROR::HexPad bit_count <= 0';
  const HexCount = (bit_count >> 2) + ((bit_count & 0x3) ? 1 : 0);
  let str = (typeof value).toString() == 'string'
          ? String(value)
          : value.toString(16);
  if(str.length > HexCount) {
    if (HexCount < 3) return prefix + '.'.repeat(HexCount);
    return prefix + str.substring(0, HexCount - 3) + '...';
  }
  return prefix + '0'.repeat(HexCount - str.length) + str;
}

// Pads a hex value with leading zeros aligned to n-bit boundary 
// followed by the bit count.
export function HexPadBitCount(value: string | number | bigint,
  bit_count: number = 64, prefix: string = '0x') { 
  return HexPad(value, bit_count, prefix, ) + ':' + 
    ((typeof value).toString() == 'string' ? String(value).length 
                                           : BigInt(value).toString(2).length);
}

// Converts a hex character string to a number.
export function HexToNibble(input: string | undefined): number {
  if (input == undefined) return -1;
  let c = input.charCodeAt(0);
  if(c < '0'.charCodeAt(0) || c > 'z'.charCodeAt(0)) return -1;
  if(c <= '9'.charCodeAt(0))
    return c - '0'.charCodeAt(0);
  if(c >= 'a'.charCodeAt(0))
    return c - 'a'.charCodeAt(0) + 10;
  if(c < 'A'.charCodeAt(0) || c > 'Z'.charCodeAt(0))
    return -1;
  return c - 'A'.charCodeAt(0) + 10;
}

// Converts a hex string to an bigint.
export function HexToBigInt(input: string): bigint {
  let result = 0n;
  let length = input.length;
  if(input == undefined || length == 0) return result;
  let i = 0;
  while(--length >= 0)
  result |= BigInt(HexToNibble(input[i++]) << (length << 2));
  return result;
}

// Converts a hex string to a Buffer.
export function HexToBuffer(hex: string): Buffer {
  //console.log ('::HexToBuffer(hex):"' + hex + '"');
  let length = hex.length;
  let j = 0;
  let nibble = hex[j];
  while(nibble == '0') nibble = hex[++j];
  let count = length - j;
  const LSb = count & 0x1;
  const ByteCount = (count >> 1) + LSb; // >> 1 to / 2
  const Buf = Buffer.alloc(ByteCount);
  if(ByteCount <= 0) return Buf;
  let i = ByteCount - 1;
  let a = HexToNibble(nibble);
  if(a < 0) return Buf;
  if(LSb == 1) {
    Buf[i--] = a;
    a = HexToNibble(hex[++j]);
    if(a < 0) return Buf;
  }
  while (a >= 0) {
    let b =  HexToNibble(hex[++j]);
    //console.log('a:' + a + ' b:' + b);
    if(b < 0) {
      Buf[i] = a;
      return Buf;
    }
    Buf[i--] = (a << 4) | b;
    a = HexToNibble(hex[++j]);
  }
  return Buf;
}

// Generates a random bigint in the given min:max range.
export function BigIntInRange(rng: CSRNG, 
    min: bigint | number = 0,
    max: bigint | number = 0xffffffffffff): bigint {
  if(min > max) return 0n;
  if(min == max) return BigInt(min);
  // Generate a random number in the given range.
  const Max = BigInt(max);
  const Min = BigInt(min);
  const Range = Max - Min; // 5-(-8)=13
  const RangeBitCount = BigInt(CountBits(Range));
  //console.log('BigIntInRange: Min:' + Min + ':' + Min.toString(2).length +
  //            ' Max:' + Max + ':' + Max.toString(2).length + 
  //            ' RangeBitCount:' + RangeBitCount);
  let result = 0n;
  let count = RangeBitCount - 1n;
  while(count > 48n) {
    count -= 48n;
    result |= BigInt(rng(0, 0xffffffffffff)) << count;
    //console.log('count:' + count + ' result:0b' + BinaryPad(result) +
    //            ':' + result.toString(2).length);
  }
  // Generate the last 48 or less bits
  const Shift = (RangeBitCount - count);
  const Remainder = Number(Range >> Shift);
  if(Remainder != 0)
    result |= BigInt(rng(0, Remainder)) << Shift
  /*
  console.log('RangeBitCount:' + RangeBitCount + ' count:' + count + 
              ' Remainder: ' + Remainder + 
              ' result.bit_count:' + result.toString(2).length);
  */
  return Min + result;
}

// Generates a cryptographically secure bigint.
export function BigIntInBitRange(rng: CSRNG, bit_min: bigint | number = 1,
    bit_max: bigint | number = 64): bigint {
  if(bit_min <= 0 || bit_max <= 0 || bit_min > bit_max) return 0n;
  const Max = (1n << BigInt(bit_max)) - 1n;
  const Min = bit_min == 1n ? 0n: (1n << (BigInt(bit_min) - 1n));
  //console.log('bit_min:' + bit_min + ' bit_max:' + bit_max + ' Min:' + 
  //            Min + ' Max:' + Max);
  return BigIntInRange(rng, Min, Max);
}

// Returns the maximum and one integer below the minimum value of the given bit 
// range.
// Examples: bit_min: 1 bit_max: 1 -> -1 < value <= 1
//           bit_min: 1 bit_max: 2 -> -1 < value <= 3
//           bit_min: 2 bit_max: 2 ->  1 < value <= 3
//           bit_min: 2 bit_max: 3 ->  1 < value <= 7
//           bit_min: 3 bit_max: 3 ->  3 < value <= 7
//           bit_min: 3 bit_max: 4 ->  3 < value <= 7
export function BitRangeMinMax(bit_min: bigint | number = 0, 
  bit_max: bigint | number = 64) : [number, number] {
  const Max = (1n << BigInt(bit_max)) - 1n;
  const Min = bit_min <= 1n ? -1n : ((1n << (BigInt(bit_min) - 1n)) - 1n);
  return [Number(Min), Number(Max)];
}

// Checks to see if a BigInt is in the given range.
export function BigIntIsInBitRange(value: bigint | number, 
    bit_min: bigint | number = 0, bit_max: bigint | number = 64): boolean {
  const V = BigInt(value);
  const [Min, Max] = BitRangeMinMax(bit_min, bit_max);
  /*
  console.log('BigIntIsInBitRange: value:0x' + value.toString(16) + ':' + 
              value.toString(2).length + ' bit_min:' + bit_min + 
              ' bit_max:' + bit_max + 
              ' Min:0x' + Min.toString(16) + ':' + Min.toString(2).length +
              ' Max:0x' + Max.toString(16) + ':' + Max.toString(2).length);
  */
  return V > Min && V <= Max;
}

// Generates a cryptographically secure bigint.
export function BigIntRandom(rng: CSRNG, 
    bit_count: bigint | number = 64): bigint {
  return BigIntInBitRange(rng, 0, bit_count);
}

// Generates a random number in the given range of bits.
export function NumberInBitRange(rng: CSRNG, low_bit: number, high_bit: number)
{
  return Number(BigIntInBitRange(rng, low_bit, high_bit));
}

// Generates a cryptographically secure bigint.
export function NumberRandom(rng: CSRNG): number {
  return Number(BigIntRandom(rng, NumberBitCount));
}

// Converts a bigint to a 2-byte hex string.
export function NumberToHex(value: number, dest: string = ''): string {
  let hex = value.toString(16);
  if(value < 10) return dest + '0' + hex;
  return dest + hex;
}

//--- LLID ---//

/* A 8-byte Local Linear ID. */
export type LLID = bigint;

// The number of bits in the second or millisecond Local LID subsecond ticker.
export const LLIDTimestampBitCount = 32n;

// The number of bits in the LLID sub-second ticker.
export const LLIDTickerBitCount = 64n - LLIDTimestampBitCount;

// Extracts the timestamp.
export function LLIDTimestamp(lid: LLID) {
  const Mask = (1n << LLIDTimestampBitCount) - 1n;
  return (lid >> (LLIDTickerBitCount + LLIDTimestampBitCount)) & Mask;
}

// Extracts the ticker count.
export function LLIDTicker(lid: LLID) {
  return (lid >> LLIDTickerBitCount) & ((1n << LLIDTickerBitCount) - 1n);
}

// Extracts the timestamp and ticker from a LLID.
export function LLIDUnpack(llid: LLID) {
  return [ LLIDTimestamp(llid), LLIDTicker(llid) ];
}

// Extracts the timestamp and ticker from a LLID.
export function LLIDPack(timestamp: bigint, ticker: bigint): LLID {
  return (timestamp << LLIDTimestampBitCount) | ticker;
}

// Prints a LID to a string.
export function LLIDPrint(llid: LLID) {
  const [ Timestamp, Ticker ] = LLIDUnpack(llid);
  return (new Date(Number(Timestamp)).toString()) + ' tick:' + Ticker;
}

// Generates the next Local LID.
export function LLIDNext(): LLID {
  let timestamp = DateTimeSeconds();
  let time_last = lid_timestamp;
  let ticker = llid_ticker;
  let invalid_tick_count = 1n << (64n - LLIDTimestampBitCount);
  if(timestamp != time_last) {
    llid_ticker = 0;
    lid_timestamp = timestamp;
  } else {
    if (ticker >= invalid_tick_count) {
      let now = DateTimeSeconds();
      while(now == time_last) now = DateTimeSeconds();
      timestamp = now;
      llid_ticker = 0;
    } else {
      llid_ticker = ticker + 1;
    }
  }
  return (BigInt(timestamp) << LLIDTickerBitCount) | BigInt(ticker);
}

// Generates the next Local LID hex string.
export function LLIDNextHex(): string {
  return LLIDNext().toString(16);
}

// Converts a hex string to an LID8.
export function LLIDFromHex(input: string):LLID {
  return HexToBigInt(input) as LLID;
}

/* Generates the next LID as a Buffer.
@return A Buffer containing [lid_source_lsw, LIDNextMSW()]. */
export function LLIDNextBuffer(): Buffer {
  return BigIntToBuffer(LLIDNext());
}

//--- LID16 ---//

/* A 16-bit Linear ID. */
export type LID16 = bigint;

// The number of bits in the LID MSb timestamp.
export const LIDTimestampBitCount = 33n;

// The number of bits to use for the spin ticker.
export const LIDTickerBitCount: bigint = 22n;

// The number of cryptographically-secure random numbers in the source id.
export const LIDSourceBitCount = 128n - LIDTimestampBitCount - 
                                 LIDTickerBitCount;

// The number of bits in the Source and ticker.
export const LIDSourceTickerBitCount = LIDSourceBitCount + LIDTickerBitCount;

// The maximum value of this spin ticker.
export const  LIDTickerMax = (1n << LIDTickerBitCount) - 1n;

// Extracts the timestamp from the lid.
export function LIDTimestamp(lid: LID16): bigint {
  if(lid == undefined) return -1n;
  return (lid >> (LIDSourceTickerBitCount + LIDSourceBitCount)) &
         ((1n << LIDTimestampBitCount) - 1n);
}

// Extracts the ticker count.
export function LIDTicker(lid: LID16) {
  return (lid >> LIDSourceBitCount) & ((1n << LIDTickerBitCount) - 1n);
}

// Extracts the source id.
export function LIDSource(lid: LID16) {
  return lid & ((1n << LIDSourceBitCount) - 1n);
}

// Extracts the timestamp, ticker, and source from a LID8.
export function LIDPack(timestamp: number, ticker: number, source:bigint)
: LID16 {
  return (BigInt(timestamp) << (LIDTickerBitCount + LIDSourceBitCount)) | 
         (BigInt(ticker) << LIDSourceBitCount) | source;
}

export function LIDSourceId(): bigint {
  return lid_source;
}

// Generates a cryptographically-secure random source id.
export function LIDSourceNext(rng: CSRNG) {
  // crypto.randomInt can generate 48-bit random numbers.
  const MSBBitCount = Number(LIDSourceBitCount) - 48;
  const MSBMask = (1 << MSBBitCount) - 1;
  const LSB = BigInt(rng(1, (1 << 48) - 1));
  const MSB = BigInt(rng(0, MSBMask));
  lid_source = LSB | MSB << 48n;
  lid_source_check_on_epoch = (lid_source >> 64n) == 0n;
}

// Increments the lid_source.
export function LIDSourceIncrement() {
  let source = lid_source;
  if(source >= 1n << LIDSourceBitCount) 
    lid_source = 1n;
  else 
    lid_source = source + 1n;
}

/* Generates the next LID as an array of two bigint.
@return [LIDNextMSW(), lid_source_lsw]. */
export function LIDNext(rng: CSRNG): LID16 {
  if(lid_source == 0n) LIDSourceNext(rng);

  let timestamp = DateTimeSeconds();
  if (timestamp != lid_timestamp) {
    lid_timestamp = timestamp;
    lid_ticker = 0;
  }
  while (lid_ticker >= (1n << LIDTickerBitCount)) {
    timestamp = DateTimeSeconds();
    if (timestamp != lid_timestamp) {
      lid_timestamp = timestamp;
      lid_ticker = 0;
    }
  }
  return LIDPack(timestamp, lid_ticker, lid_source);
}

// Generates the next LID as a string or prints it to the dest.
export function LIDNextHex(rng: CSRNG, dest: string = ''): string {
  return dest + LIDNext(rng).toString(16);
}

/* Generates the next LID as a Buffer.
@return A Buffer containing [lid_source_lsw, LIDNextMSW()]. */
export function LIDNextBuffer(rng: CSRNG): Buffer {
  return BigIntToBuffer(LIDNext(rng));
}

//--- LID8 ---//

/* A 8-byte Linear ID. */
export type LID8 = bigint;

// The number of bits in a 8-byte LID source id.
export const LID8TimestampBitCount = 32n;

// The number of bits in a 8-byte LID source id.
export const LID8TickerBitCount = 16n;

// The number of bits in a 8-byte LID subsecond ticker.
export const LID8SourceBitCount = 64n - LID8TimestampBitCount - 
                                  LID8TickerBitCount;

// The maximum value the 8-byte LID ticker, which is also the mask.
export const LID8TickerMax = (1n << LID8TickerBitCount) - 1n;

// Extracts the timestamp.
export function LID8Timestamp(lid: LID8) {
  const Mask = (1n << LID8TimestampBitCount) - 1n;
  return (lid >> (LID8TickerBitCount + LID8TimestampBitCount)) & Mask;
}

// Extracts the ticker count.
export function LID8Ticker(lid: LID8) {
  return (lid >> LID8TickerBitCount) & ((1n << LID8TickerBitCount) - 1n);
}

// Extracts the source id.
export function LID8Source(lid: LID8) {
  return lid & ((1n << LID8SourceBitCount) - 1n);
}

export function LID8SourceId(): number {
  return lid8_source;
}

// Extracts the timestamp, ticker, and source from a LID8.
export function LID8Pack(timestamp: number, ticker: number, source: bigint)
: LID8 {
  return (BigInt(timestamp) << (64n - LID8TimestampBitCount)) | 
         (BigInt(ticker) << LID8SourceBitCount) |
         source;
}

// Extracts the timestamp and ticker from a LLID.
export function LID8Unpack(llid: LLID) {
  return [ LID8Timestamp(llid), LID8Ticker(llid) ];
}

// Prints a LID to a string.
export function LID8Print(llid: LLID) {
  const [ Timestamp, Ticker ] = LLIDUnpack(llid);
  return (new Date(Number(Timestamp)).toString()) + ' tick:' + Ticker;
}

// Generates the next 8-byte/128-bit LID.
export function LID8Next(rng: CSRNG): LID8 {
  let timestamp = DateTimeSeconds();
  let time_last = lid_timestamp;
  let ticker = lid8_ticker;
  let lid = lid_source >> (64n - LID8SourceBitCount);
  if(lid == 0n) LIDSourceNext(rng);
  if (timestamp != time_last) {
    lid_timestamp = timestamp;
    ticker = 0;
  } else {
    if(ticker >= LID8TickerMax) {
      let time_now = DateTimeSeconds();
      while (timestamp == time_now) time_now = DateTimeSeconds();
      ticker = 0;
      timestamp = time_now;
    }
    if(lid_source_check_on_epoch) {
      if(timestamp == 0 && ticker == 0) ticker = 1;
    }
  }
  lid8_ticker = ticker;
  return LID8Pack(timestamp, ticker, 
                  lid_source & ((1n << LIDSourceBitCount) - 1n));
}

// Generates the next Local LID hex string.
export function LID8NextHex(rng: CSRNG): string {
  return LID8Next(rng).toString(16);
}
