An npm package for generating 128-bit monotonic unique IDs for use with sharded databases like PlanetScale. PlanetScale automatically shards the database to scale to more users, and when that the database is copied the autoincrement primary key isn't valid anymore. While you might be tempted to use UUID, it does not generate values that always increase (i.e. monotonic), which make it not good for doing binary searches with.

Another solution is to use [Universally Unique Lexicographically Sortable Identifier (ULID)](https://github.com/ulid/spec), but it uses a 48-bit millisecond timestamp MSB and 80-byte random number in the LSB. There are two problems with this design approach. First is that the x86 CPU doesn't have a sub-second timestamp, so databases do not use them. This means that to translate the milliseconds to seconds when you want to work with the database and you will have to divide and multiple by 1000, which is slow and error prone. To get a sub-second timestamp on an x86 server will require a dedicated thread to do a spin clock with an inter-process pipe, which is complex and unnecessary. We want an approach that doesn't have to generate any random numbers at runtime and we work in seconds and it will work for almost everything for thousands of years.

LinearId (LID) uses a 128-bit uid where the Most-Significant Bits (MSB) are a 36-bit Unix second timestamp followed by a 22-bit sub-second spin ticker and 70-bit Cryptographically-Secure Generated-Upon-Boot Random Number (CSGUBRN):

```AsciiArt
 v--MSb                        128-bit LID                           LSb--v
+---------------------------------------------------------------------------+
| 36-bit seconds timestamp | 22-bit sub-second spin ticker | 70-bit CSGUBRN |
+---------------------------------------------------------------------------+
```

Statistically this means that when you have two web servers active, the probability that both servers generate the same random number is 7.12e-41%. If you had 1,000 servers running then the probability would be 8.47e-17%, which is a 1 in 118,063,754,427,391 chance. If you had 1,000,000 servers running, the probability would be 8.47e-14%, which is a 1 in 1,180,591,620,717,411 chance, which is a 64-bit number. While this might not be enough for the most secure applications, this is good enough for almost all web apps.

The 22-bit sub-second spin ticker caps out the number of calls you can make to per second to 2^22, which is 4,194,304. If you make more calls than this per second than the algorithm will spin wait until the next second and then reset the sub-second ticker. Assuming the upper limit of a normal computer, which is no more than 4,294,967,296Hz (4.3GHz) and just so happens to be 2^32 or 32-bits, making the math easy. This would give you about 1024 instructions between when you can call LID. Given not all CPU instructions are single-cycle, you're usually waiting for memory, and you're going to be creating a data structure, it's highly unlikely you'll ever hit this cap and if you ever did you'll probably have no problem with the delay. This is an edge case.

The 36-bit timestamp has an epoch span of 2,177.6 years. By that time everything we know including your software and hardware will be long gone and forgotten. The above characteristics make the 22-bit spin ticker and 70-bit CSGUBRN a sweet spot that will work for almost every computer and last not be outdated for thousands of years.

To [optimize for SQL and other database searches](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-index-design-guide), we need to take advantage of the 64-bit value in the inode data structure used by all in-disk database engines. It's very complicated and you can index your database tables different ways at runtime to optimize your lookups. I'm still learning how to optimize the database queries. Right now I'm looking at just XORing the two 128-bit LID words together, but I have not looked at any potential clustering problems. I'm not a database engineer, or rather I'm not that good of one. Please submit fixes on GitHub at <https://github.com/AStarStartup/LinearId>. I would like to convert this to other languages. Check out my open-source C++ software to at <https://github.com/KabukiStarship>. Thanks.

## Quickstart

**1.** Install npm package:

```BASH
npm install linearid
```

**2.** Set compiler options:

```JSON
{
  "compilerOptions": {
    "target": "es2020",
    //...
  }
  //...
}
```

**3.** Add to your Drizzle ORM schema:

```TypeScript
import { and, bigint, eq, mysqlTable, varbinary } from "drizzle-orm/mysql-core";


export const UserAccounts = mysqlTable('UserAccounts', {
	id: bigint('id').primaryKey(),
	uid: varbinary('uid', { length: 16}),
  //...
});
```

**4.** Add to your code:

```TypeScript
const { LIDFromHex, LIDNext, LIDNextBuffer, LIDPrint, LIDToHex, LIDXOR
} = require("linearid");

[lsb, msb] = LIDNext();
const lid_hex_string = LIDToHex(msb, lsb);
console.log('\nExample LID hex string:0x' + lid_hex_string);
[lsb2, msb2] = LIDFromHex(lid_hex_string);

let buf = LIDNextBuffer();
[lsb, msb] = LIDFromBuffer(buf);

const InsertUserAccount = async (account: UserAccount) => {
  return db.insert(UserAccounts).values(account);
}

const NewAccount: UserAccount = {
  id: lsb ^ msb,
  uid: lid
}
InsertUserAccount(NewAccount);

let results = await db.select().from(UserAccounts).where(
  and(
    eq(users.id, id),
    eq(users.uid, lid)
  )
);
```

## License

Copyright [AStartup](https://astartup.net).

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
