// Copyright AStartup. MIT License. You can find a copy of the license at 
// http://github.com/AStarStartup/LinearId

// Throughout this code when I refer to a timestamp this means a seconds 
// timestamp.

//--- Constants ---//

// Number of bits in a JS number.
export const NumberBitCount = 53;

// The number of bits in a 64-bit LID source id.
export const LID64TimestampBitCount = 32n;

// The number of bits in a 64-bit LID source id.
export const LID64TickerBitCount = 16n;

// The number of bits in a 64-bit LID subsecond ticker.
export const LID64SourceBitCount = 64n - LID64TimestampBitCount 
                                - LID64TickerBitCount;

// The maximum value the 64-bit LID ticker, which is also the mask.
export const LID64TickerMax = (1n << LID64TickerBitCount) - 1n;

// The number of bits in the second or millisecond Local LID subsecond ticker.
export const LLIDTimestampBitCount = 32n;

// The number of bits in the LLID sub-second ticker.
export const LLIDTickerBitCount = 64n - LLIDTimestampBitCount;

// The number of bits in the LID MSb timestamp.
export const LIDTimestampBitCount = 33n;

// The number of bits to use for the spin ticker.
export const LIDTickerBitCount: bigint = 22n;

// The number of cryptographically-secure random numbers in the source id.
export const LIDSourceBitCount = 128n - LIDTimestampBitCount - 
                                 LIDTickerBitCount;

// The maximum value of this spin ticker.
export const  LIDTickerMax = (1n << LIDTickerBitCount) - 1n;

//--- Utilities ---//

// Cryptographically-secure Random Number Generator function type.
type RNG = (min: number, max: number) => number;

// Converts a hex character string to a byte as a number.
export function PrintHexByte(input: number, dest: string = ''): string {
  if(input < 0n || input > 15n) return dest;
  return dest + NumberToHex(input & 0xf) + NumberToHex((input >> 4) & 0xf);
}

// Counts the number of bits in a byte.
export function ByteCountBits(value: number) {
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
  return BitCount + ByteCountBits(msb);
}

// Left pads and prints a number with the given character count.
export function NumberPrint(value: number, char_count: number,
                            pad: string = ' ') {
  const Value = value.toString();
  if(char_count <= 3) return '0'.repeat(char_count);
  if(Value.length > char_count)
    return Value.substring(0, char_count - 3) + '...';
  return pad.repeat(char_count - Value.length) + Value;
}

// Left pads and prints a bigint or number with the given character count.
export function BigIntPrint(value: number | bigint, char_count: number,
                            pad: string = ' ') {
  const Value = value.toString();
  if(char_count <= 3) return '0'.repeat(char_count);
  if(Value.length > char_count)
    return Value.substring(0, char_count - 3) + '...';
    return pad.repeat(char_count - Value.length) + Value;

}

// Returns the number of bits in a bigint.
export function BinaryCount(value: bigint | number): number {
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
export function BigIntCountBytes(value: bigint): number {
  const BitCount = BinaryCount(value);
  return (BitCount >> 3) + (BitCount & 0x7 ? 1 : 0);
}

// Returns the number of bytes in a bigint.
export function BigIntCountBits(value: bigint): number {
  const ByteCount = BigIntCountBytes(value);

  return ((ByteCount - 1) << 3) + NumberCountBits(Number(value))
}

// Counts the number of decimals in a bigint.
export function NumberCountDecimals(value:number): number {
  // 2^53 = 9.007199254740992e15
  if(value < 0) value *= -1;
  
  if(value < 100000000) {
    if (value < 10000) {
      if (value < 100) {
        if(value < 10)
          return 1;
        else
          return 2;
      } else {
        if (value < 1000)
          return 3;
        else
          return 4;
      }
    } else {
      if (value < 1000000) {
        if (value < 100000)
          return 5;
        else
          return 6;
      } else {
        if (value < 10000000)
          return 7;
        else
          return 8;
      }
    }
  } else {
    if (value < 1000000000000) {
      if (value < 10000000000) {
        if (value < 1000000000)
          return 9;
        else
          return 10;
      } else {
        if (value < 100000000000)
          return 11;
        else
          return 12;
      }
    } else {
      if (value < 100000000000000) {
        if (value < 10000000000000)
          return 13;
        else
          return 14;
      } else {
        if (value < 1000000000000000)
          return 15;
        else
          return 16;
      }
    }
  }
}

// Prints amd pads a number to a string to the given character count.
export function NumberPad(value: number, digit_count: number, 
    pad:string = ' ') {
  const DecimalCount = NumberCountDecimals(value);
  if(DecimalCount > digit_count) {
    if(digit_count <= 3) return '.'.repeat(digit_count);
    return value.toString().substring(0, digit_count - 3) + '...';
  }
  return pad.repeat(digit_count - DecimalCount) + value;
}

// Counts the number of decimals in a string, number, or bigint.
// @warning Untested!
export function CountDecimals(value: bigint | number | string): number {
  switch((typeof value).toString()) {
    case 'bigint': return BigIntCountDecimals(BigInt(value));
    case 'number': return NumberCountDecimals(Number(value));
  }
  const Value = String(value);
  let i = 0;
  let c = Value.charCodeAt(i);
  let leading_zero_count = 0;
  if(c == '0'.charCodeAt(0)) {
    c = Value.charCodeAt(++i);
    while(c == '0'.charCodeAt(0)) c = Value.charCodeAt(++i);
    leading_zero_count = i;
  }
  while(c != undefined && c >= '0'.charCodeAt(0) && c <= '9'.charCodeAt(0))
    c = Value.charCodeAt(++i);
  return i - leading_zero_count;
}

// Counts the number of decimals in a bigint.
export function BigIntCountDecimals(value:bigint): number {
  if(value < 0n) value *= -1n;
  let decimal_count = 0;
  const B53DecimalMax = 1000000000000000n;
  while(value >= B53DecimalMax) {
    decimal_count += 15;
    value /= B53DecimalMax;
  }
  return decimal_count + NumberCountDecimals(Number(value));
}

/* Converts a BigInt to a Buffer.
@todo   Improve to copy bigint, which I've read is hacky with Node & CJS and
may require another function pointer type hack.
@return A Buffer containing [lid_source_lsw, LIDNextMSW()]. */
export function BigIntToBuffer(value: bigint) {
  const ByteCount = BigIntCountBytes(value);
  //console.log('value:' + value + ' ByteCount:' + ByteCount);
  const Buf = Buffer.alloc(ByteCount);
  for(let index = 0; index < ByteCount; ++index) {
    Buf[index] = Number((value >> BigInt(index << 3)) & 0xffn);
  }
  return Buf;
}

// Prints amd pads a number to a string to the given character count.
export function BigIntPad(value: bigint, decimals_max: number, 
  pad:string = ' ') {
  const DecimalCount = BigIntCountDecimals(value);
  if(DecimalCount > decimals_max) {
    if(decimals_max <= 3) return pad.repeat(decimals_max);
    return value.toString().substring(0, decimals_max - 3) + '...';
  }
  return pad.repeat(decimals_max - DecimalCount) + value;
}

// Pads a binary string with leading zeros aligned to a bit boundary.
// @warning Does not check if the value string is not a binary string.
export function BinaryPad(value: string | number | bigint,
                          bit_count: number = 64, prefix: string = '0b',
                          pad: string = '0') { 
  if(bit_count <= 0) return '';
  const str = ((typeof value).toString() == 'string')
            ? String(value)
            : value.toString(2);
  if(bit_count < str.length) {
    if (bit_count < 3) return prefix + '.'.repeat(bit_count);
    return prefix + str.substring(0, bit_count - 3) + '...';
  }
  return prefix + pad.repeat(bit_count - str.length) + str;
}

export function BinaryPadBitCount(value: string | number | bigint,
    bit_count: number = 64, prefix: string = '0b') { 
  return BinaryPad(value, bit_count, prefix) + ':' + 
    ((typeof value).toString() == 'string' ? String(value).length 
                                           : BigInt(value).toString(2).length)
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
    result = PrintHexByte(buf[i] ?? 0, result);
  return result;
}

// Pads a hex value with leading zeros aligned to n-bit boundary.
// @warning Does not check if the value string is not a hex string.
export function HexPad(value: string | number | bigint, 
    bit_count: number = 64, prefix: string = '0x', pad: string = '0'): string
{
  if(bit_count <= 0) return '';
  const HexCount = (bit_count >> 2) + ((bit_count & 0x3) ? 1 : 0);
  let hex = (typeof value).toString() == 'string'
          ? String(value)
          : value.toString(16);
  if(hex.length > HexCount) {
    if (HexCount < 3) return prefix + '.'.repeat(HexCount);
    return prefix + hex.substring(0, HexCount - 3) + '...';
  }
  return prefix + pad.repeat(HexCount - hex.length) + hex;
}

// Pads a hex value with leading zeros aligned to n-bit boundary 
// followed by the bit count.
export function HexPadBitCount(value: string | number | bigint,
  bit_count: number = 64, prefix: string = '0x') { 
  return HexPad(value, bit_count, prefix, ) + ':' + 
    ((typeof value).toString() == 'string' ? String(value).length 
                                           : BinaryCount(BigInt(value)));
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
export function BigIntInRange(rng: RNG, 
    min: bigint | number = 0,
    max: bigint | number = 0xffffffffffff): bigint {
  if(min > max) return 0n;
  if(min == max) return BigInt(min);
  // Generate a random number in the given range.
  const Max = BigInt(max);
  const Min = BigInt(min);
  const Range = Max - Min; // 5-(-8)=13
  const RangeBitCount = BigInt(BinaryCount(Range));
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
    result |= BigInt(rng(0, Remainder)) << Shift;
  /*
  console.log('RangeBitCount:' + RangeBitCount + ' count:' + count + 
              ' Remainder: ' + Remainder + 
              ' result.bit_count:' + result.toString(2).length);
  */
  return Min + result;
}

// Generates a cryptographically secure bigint.
export function BigIntInBitRange(rng: RNG, bit_min: bigint | number = 1,
    bit_max: bigint | number = 64): bigint {
  if(bit_min <= 0 || bit_max <= 0 || bit_min > bit_max) return 0n;
  const Max = (1n << BigInt(bit_max)) - 1n;
  const Min = bit_min == 1n ? 0n : (1n << (BigInt(bit_min) - 1n));
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
export function BigIntRandom(rng: RNG, 
    bit_count: bigint | number = 64): bigint {
  return BigIntInBitRange(rng, 0, bit_count);
}

// Generates a random number in the given range of bits.
export function NumberInBitRange(rng: RNG, low_bit: number, high_bit: number)
{
  return Number(BigIntInBitRange(rng, low_bit, high_bit));
}

// Converts a bigint to a 2-byte hex string.
export function NumberToHex(value: number, dest: string = ''): string {
  let hex = value.toString(16);
  if(value < 10) return dest + '0' + hex;
  return dest + hex;
}

// Gets the current date-time in seconds as a bigint.
export function TimestampSeconds(): number {
  return Math.floor(new Date().getTime() / 1000);
}

// Spin waits until the next second.
export function TimestampSecondsNext() {
  let time_start = TimestampSeconds();
  let now = time_start;
  while(now == time_start) now = TimestampSeconds();
  return now;
}

// Gets the current date-time in seconds as a bigint.
export function TimestampSecondsNextBigInt(): bigint {
  return BigInt(TimestampSecondsNext());
}

// Gets the current date-time in seconds as a number.
export function TimestampSecondsAsBigInt(): bigint {
  return BigInt(TimestampSeconds());
}

//--- Variables ---//

// The last time a LID was created.
let lid_timestamp: number = TimestampSeconds();

// The sub-second ticker.
let lid_ticker: number = 0;

// The Source Id bigint.
let lid_source: bigint = 0n;

// The LID64 Source Id as a number.
let lid64_source: bigint = 0n;

// The 64-bit Local LID ticker count.
let lid64_ticker: number = 0;

// The 64-bit Local LID ticker count.
let llid_ticker: number = 0;

//--- LLID ---//

/* A 64-bit Local Linear ID. */
export type LLID = bigint;

// Extracts the timestamp.
export function LLIDTimestamp(lid: LLID) {
  return (BigInt(lid) >> LLIDTickerBitCount);
}

// Extracts the ticker count.
export function LLIDTicker(lid: LLID) {
  return BigInt(lid) & ((1n << LLIDTickerBitCount) - 1n);
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
  const Time = new Date(Number(Timestamp));
  return Time.toISOString().split('T')[0] + ' tick:' + Ticker;
}

// Generates the next Local LID.
export function LLIDNext(): LLID {
  let timestamp = TimestampSeconds();
  let time_last = lid_timestamp;
  let ticker = llid_ticker;
  let invalid_tick_count = 1n << (64n - LLIDTimestampBitCount);
  if(timestamp != time_last) {
    llid_ticker = 0;
    lid_timestamp = timestamp;
  } else {
    if (ticker >= invalid_tick_count) {
      let now = TimestampSeconds();
      while(now == time_last) now = TimestampSeconds();
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

// Converts a hex string to an LID64.
export function LLIDFromHex(input: string):LLID {
  return HexToBigInt(input) as LLID;
}

/* Generates the next LID as a Buffer.
@return A Buffer containing [lid_source_lsw, LIDNextMSW()]. */
export function LLIDNextBuffer(): Buffer {
  return BigIntToBuffer(LLIDNext());
}

//--- LID128 ---//

// A 128-bit Linear ID.
export type LID128 = bigint;

// Extracts the timestamp from the lid.
export function LIDTimestamp(lid: LID128): bigint {
  const LIDSourceTickerBitCount = LIDSourceBitCount + LIDTickerBitCount;
  return (lid >> LIDSourceTickerBitCount);
}

// Extracts the ticker count.
export function LIDTicker(lid: LID128) {
  return (lid >> LIDSourceBitCount) & ((1n << LIDTickerBitCount) - 1n);
}

// Extracts the source id.
export function LIDSource(lid: LID128) {
  return lid & ((1n << LIDSourceBitCount) - 1n);
}

// Extracts the timestamp, ticker, and source from a LID64.
export function LIDPack(timestamp: number, ticker: number, source:bigint)
: LID128 {
  return (BigInt(timestamp) << (LIDTickerBitCount + LIDSourceBitCount)) | 
         (BigInt(ticker) << LIDSourceBitCount) | source;
}

// Extracts the timestamp and ticker from a LLID.
export function LIDUnpack(lid: LLID) {
  return [ LIDTimestamp(lid), LIDTicker(lid), LIDSource(lid) ];
}

// Prints a LID to a string.
export function LIDPrint(lid: LLID) {
  const [ Timestamp, Ticker, Source ] = LIDUnpack(lid);
  const Time = new Date(Number(Timestamp));
  return Time.toISOString().split('T')[0] + ' tick:' + Ticker
       + ' source:' + Source;
}

// Gets the lid_source.
export function LIDSourceId(): bigint {
  return lid_source;
}

// Generates a cryptographically-secure random source id.
export function LIDSourceNext(rng: RNG) {
  let source = 0n;
  while(source == 0n)
    source = BigIntInRange(rng, 1n, (1n << LIDSourceBitCount) - 1n);
  lid_source = source;
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
export function LIDNext(rng: RNG): LID128 {
  let timestamp = TimestampSeconds();
  let time_last = lid_timestamp;
  let ticker = lid_ticker;
  if (timestamp != time_last) {
    lid_timestamp = timestamp;
    ticker = 0;
  } else if(ticker >= LIDTickerMax) {
    timestamp = TimestampSecondsNext();
    ticker = 0;
  }
  lid_ticker = ++ticker;
  let source = lid_source;
  if(source == 0n) LIDSourceNext(rng);
  return LIDPack(timestamp, ticker, source);
}

// Generates the next LID as a string or prints it to the dest.
export function LIDNextHex(rng: RNG, dest: string = ''): string {
  return dest + LIDNext(rng).toString(16);
}

/* Generates the next LID as a Buffer.
@return A Buffer containing [lid_source_lsw, LIDNextMSW()]. */
export function LIDNextBuffer(rng: RNG): Buffer {
  return BigIntToBuffer(LIDNext(rng));
}

//--- LID64 ---//

/* A 64-bit Linear ID. */
export type LID64 = bigint;

// Extracts the timestamp.
export function LID64Timestamp(lid: LID64) {
  return (lid >> (64n - LID64TimestampBitCount));
}

// Extracts the ticker count.
export function LID64Ticker(lid: LID64) {
  return (lid >> LID64TickerBitCount) & ((1n << LID64TickerBitCount) - 1n);
}

// Extracts the source id.
export function LID64Source(lid: LID64) {
  return lid & ((1n << LID64SourceBitCount) - 1n);
}

// Generates a cryptographically-secure random source id.
export function LID64SourceNext(rng: RNG) {
  let source = 0n;
  while(source == 0n)
    source = BigIntInRange(rng, 1n, (1n << LID64SourceBitCount) - 1n);
  lid64_source = source;
}

// Returns the lid64_source.
export function LID64SourceId(): bigint {
  return lid64_source;
}

// Extracts the timestamp, ticker, and source from a LID64.
export function LID64Pack(timestamp: number, ticker: number, source: bigint)
: LID64 {
  return (BigInt(timestamp) << (64n - LID64TimestampBitCount)) | 
         (BigInt(ticker) << LID64SourceBitCount) |
         source;
}

// Extracts the timestamp and ticker from a LLID.
export function LID64Unpack(lid: LLID) {
  return [ LID64Timestamp(lid), LID64Ticker(lid), LID64Source(lid) ];
}

// Prints a LID to a string.
export function LID64Print(lid: LLID) {
  const [ Timestamp, Ticker, Source ] = LID64Unpack(lid);
  const Time = new Date(Number(Timestamp));
  return Time.toISOString().split('T')[0] + ' tick:' + Ticker
       + ' source:' + Source;
}

// Generates the next 64-bit/128-bit LID.
export function LID64Next(rng: RNG): LID64 {
  let timestamp = TimestampSeconds();
  let time_last = lid_timestamp;
  let ticker = lid64_ticker;
  let source = lid64_source;
  if(source == 0n) LID64SourceNext(rng);
  if (timestamp != time_last) {
    lid_timestamp = timestamp;
    ticker = 0;
  } else if(ticker >= LID64TickerMax) {
    timestamp = TimestampSecondsNext();
    ticker = 0;
  }
  lid64_ticker = ++ticker;
  return LID64Pack(timestamp, ticker, source);
}

// Generates the next Local LID hex string.
export function LID64NextHex(rng: RNG): string {
  return LID64Next(rng).toString(16);
}
