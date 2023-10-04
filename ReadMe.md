An npm package for generating unique IDs for use with sharded databases like PlanetScale.

LinearId works using two 64-bit where where the first word is a microsecond ticker bit shifting up 16 bits and ORed with a 16-bit spin ticker. The current microsecond time is stored and each time a new LinearId is created it checks if it's the next millisecond and if it is then  it resets the ticker, else it increments the spin ticker.

This means that there is a hard limit of 2^16 or 65536 maximum calls to LID per
second. For this reason it's recommended to use LID before you make calls to the database to ensure you can't reach the 16-bit ticker cap.

The other 64-bit word is a unique identifier created by bitwise XORing the bytes of the computer's IPv6 address, which uses 5 bytes from LSb to MSb. The algorithm then XORs the MAC Address byte-by-byte from MSb to LSb. This produces a nice spread out of the bits without any clumping. Often the MAC Address gets randomly generated.

It's high improbable to get the IPAddress or MAC Address back after you XOR them. First let's look at the XOR truth table:

| A | B | XOR |
|:-:|:-:|:---:|
| 0 | 0 |  0  |
| 0 | 1 |  1  |
| 1 | 0 |  1  |
| 1 | 1 |  0  |

This means that for each bit in a 64-bit LID address, we would have two bits that it can be, which means it's equivalent to 128-bit encryption. While I would not trust this level of encryption for selling narcotics on the dark web, most guys would trust their marriage to that level of encryption.

## License

Copyright 2023 [AStartup](https://astartup.net).

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
