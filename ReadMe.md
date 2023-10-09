An npm package for generating 128-bit monotonic unique IDs for use with sharded databases like PlanetScale. PlanetScale automatically shards the database to scale to more users, and when that the database is copied the autoincrement primary key isn't valid anymore. While you might be tempted to use UUID, it does not generate values that always increase (i.e. monotonic). Another solution is to use [(ULID)(https://github.com/ulid/spec), but it uses an 80-byte random number in the LSB and millisecond timestamp in the MSB, and that uses a lot of CPU. We want an approach that doesn't have to generate any random numbers at runtime.

LinearId (LID) works using two 64-bit words where where the first MSB word is a microsecond ticker bit shifted up 22 bits and ORed with a 22-bit spin ticker. The current microsecond time is stored and each time a new LID is created it checks if it's the next millisecond and if it is then  it resets the ticker, else it increments the spin ticker. This limits you to a total of 4194304 calls to LID() per millisecond, at which time the system will spin wait until the next millisecond, but this is never expected to actually happen in real life except in some rare edge cases.

The LSB word is a cryptographically-secure randomly generated 64-bit number that gets generated upon boot. This allows your servers to name new database entries on one server and when they submit new database entries they will be mostly sorted by the millisecond of the request generation. SQL table data is theoretically unordered and we only have second timestamps, so the fastest way to search through table rows is to look for the date. Because the LID stores a millisecond timestamp, we can quickly extract the seconds timestamp to use to search through the SQL database by date and uid.

## Quickstart

**1.** Install npm package:

```BASH
npm install linearid
```

**2.** Add to your Drizzle ORM schema:

```TypeScript
import { datetime, mysqlTable, varbinary } from "drizzle-orm/mysql-core";


export const UserAccounts = mysqlTable('UserAccounts', {
	uid: varbinary('uid', { length: 16}).primaryKey(),
	created: datetime('datetime'),
  //...
});
```

**3.** Add to your code:

```TypeScript
const { LIDNext, LIDPrint, LIDParse, LIDSeconds } = require("linearid");

[lsb, msb] = LIDNext();
const Example = LIDPrint(msb, lsb);
console.log('\nExample LID hex string:0x' + Example);
[lsb2, msb2] = LIDParse(Example);
let lid = LEDNextBuffer();

const TimeS = LIDSeconds(msb);

let results = await db.select().from(UserAccounts).where(
  and(
    eq(users.created, TimeS), 
    eq(users.uid, lid)
));
```

## License

Copyright 2023 [AStartup](https://astartup.net).

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
