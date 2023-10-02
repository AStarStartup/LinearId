// Copyright AStartup; all rights reserved.

import { ipv6, mac } from "address";

let time_last = new Date().getTime();
let ticker = 0;

/* Generates a Linear ID using a microsecond timestamp and a spin counter.
Bit Pattern:
[ 48-bits Microsecond Timestamp | 16-bits spin counter ]
*/
export function LID(): number {
  let time_now = new Date().getTime();
  if (time_last != time_now) {
    time_last = time_now;
    ticker = 0;
  }
  if (ticker >= 65536) {
    ticker = 0;
    console.log("Error: More than 2^16 calls to LID in one microsecond");
    return 0;
  }
  let result = (time_now << 16) | ticker;
  ticker++;
  return result;
}

function LIDAddressParseMAC(lid: number) {
  console.log("IPv6 XOR: " + dec2bin(lid));
  // Step 2: XOR the MAC address bytes from MSb to LSb
  // Example MAC Address string: 78:ca:39:b0:e6:7d
  mac(function (err, mac_address) {
    let address: string;
    let offset = 64;
    let cursor = 0;
    if (mac_address == undefined) {
      console.log("Error reading MAC address:");
      console.log(err);
      address = "00:00";
      return;
    }
    address = mac_address;
    console.log("MAC Address:" + address);
    let length = address.length;
    offset = 64;
    cursor = 0;
    while (cursor < length) {
      offset -= 8;
      if (cursor + 5 >= length) return lid;
      console.log ("a:" + address[cursor] + " b:" + address[cursor + 1]);
      let a = HexToNumber(address[cursor++]);
      let b = HexToNumber(address[cursor++]);
      if (a == -1 || b == -1 || address[cursor++] != ":")  {
        console.log("Error: Invalid MAC format 1.");
        return lid;
      }
      let c: number = a ^ b;
      console.log ("c:" + address[cursor] + " d:" + address[cursor + 1]);
      a = HexToNumber(address[cursor++]);
      b = HexToNumber(address[cursor++]);
      if (a == -1 || b == -1) {
        console.log("Error: Invalid MAC format 2.");
        return lid;
      }
      c |= (a ^ b) << 4;
      lid |= c << offset;
      if(address[cursor] == ':') ++cursor;
    }
    return lid;
  });
  console.log("Exited at end:" + lid + " 0b'" + dec2bin(lid))
  return lid;
}

function HexToNumber(input: string | undefined): number {
  if (input == undefined) return -1;
  let value: number = input.charCodeAt(0);
  if (value >= "0".charCodeAt(0) && value <= "9".charCodeAt(0))
    return value - "0".charCodeAt(0);
  if (value >= "a".charCodeAt(0) && value <= "f".charCodeAt(0))
    return 10 + (value - "a".charCodeAt(0));
  if (value >= "A".charCodeAt(0) && value <= "F".charCodeAt(0))
    return 10 + (value - "A".charCodeAt(0));
  return -1;
}

function dec2bin(dec: number) {
  return (dec >>> 0).toString(2);
}

function LIDAddressParse() {
  // Step 1: XOR the IPv6 bytes from LSb to MSb
  // Example IPv6 address string: fe80::7aca:39ff:feb0:e67d
  let address = ipv6() ?? "0000";
  console.log("IPv6 Address:" + address);
  let length = address.length;
  let offset = 0;
  let cursor = 0;
  let lid = 0;
  while (cursor < length) {
    console.log("\n\n------\ncursor:" + cursor + "/" + length + " value:\"" + 
                address[cursor] + '"');
    if (cursor + 4 >= length) {
      return LIDAddressParseMAC(lid);
    }
    console.log ("a:" + address[cursor] + " b:" + address[cursor + 1])
    let a = HexToNumber(address[cursor++]);
    let b = HexToNumber(address[cursor++]);
    if (a == -1 || b == -1) {
      console.log('Error: Invalid hex input 1.')
      return 1;
    }
    let c: number = a ^ b;
    console.log ("c:" + address[cursor] + " d:" + address[cursor + 1])
    a = HexToNumber(address[cursor++]);
    b = HexToNumber(address[cursor++]);
    if (a == -1 || b == -1) {
      console.log('Error: Invalid hex input 2.');
      return 2;
    }
    c |= (a ^ b) << 4;
    lid |= c << (offset * 8);
    console.log('cursor1:' + cursor);
    if (cursor >= length)
      return LIDAddressParseMAC(lid);
    let i = 0;
    while (address[cursor + i] == ':') {
      ++i;
      console.log("cursor++:" + (cursor + i));
      if (cursor >= length) {
        console.log("Error: Invalid IPv6 format 2.");
        return lid;
      }
    }
    cursor += i;
    console.log('cursor2:' + cursor);
    ++offset;
  }
  return LIDAddressParseMAC(lid);
}

export const LIDAddress: number = LIDAddressParse();

/*
module.exports = {
  LID: () => {
    return LID()
  },
  LIDAddress: () => {
    return LIDAddress
  }
}
*/
module.exports = { LID, LIDAddress };
