An npm package for generating 128-bit monotonic unique IDs for use with sharded databases like PlanetScale.

LinearId (LID) works using two 64-bit where where the first MSB word is a microsecond ticker bit shifting up 22 bits and ORed with a 22-bit spin ticker. The current microsecond time is stored and each time a new LID is created it checks if it's the next millisecond and if it is then  it resets the ticker, else it increments the spin ticker. This limits you to a total of 4194304 calls to LID() per millisecond, at which time the system will spin wait until the next millisecond, but this is never expected to actually happen in real life.

The LSB word is a 64-bit cryptographically-secure randomly generated value.

## Quickstart

**1.** Install npm package:

```BASH
npm install linearid
```

**2.** Add to your Drizzle ORM schema:

```TypeScript

import { mysqlTable, varbinary } from 'drizzle-orm/mysql-core';


export const UserAccounts = mysqlTable('UserAccounts', {
	uid: varbinary('uid', { length: 16}).primaryKey(),
  //...
});
```

**3.** Add to your code:

```TypeScript
const { LID, LIDPrint, LIDParse } = require("linearid");

[msb, lsb] = LID();
const Example = LIDPrint(msb, lsb);
console.log('\nExample LID hex string:');
[msb2, lsb2] = LIDParse(Example);
```

## License

Copyright 2023 [AStartup](https://astartup.net).

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
