
LinearId is an npm package for generating 64-bit and 128-bit monotonic unique IDs for use with sharded databases like PlanetScale. Please read [this ReadMe file on GitHub](https://github.com/AStarStartup/LinearId) for the latest updates, where you can also contribute code, bug reports, feature requests, documentation improvements, etc.

## Contributing

We need so people to help test LinearId and improve our documentation to ensure everything is working properly, to use LinearId with the popular database engines, and contribute to the unit tests to get optimal test coverage.

I can't figure out how to configure the NPM package so we can use the import syntax, you have to use const require syntax for now. I can use some help on #11. Please start by reading the [Contributing Guide](./Contributing.md). Thanks.

## Solution

When your website grows to a large number of users, you need to shard the database and use multiple SQL servers. When that the database is copied the autoincrement primary key isn't valid anymore. PlanetScale automatically shards the database to scale to more users, so this is why there are no foreign keys with PlanetScale. While you might be tempted to use UUID, it does not generate values that always increase (i.e. monotonically increasing), which is not good for doing binary searches with. Binary searches require monotonically increasing search indexes, and the SQL database engine uses the inode structure in your data drives to search for SQL table rows.

Another solution is to use [Universally Unique Lexicographically Sortable Identifier (ULID)](https://github.com/ulid/spec), but it uses a 48-bit millisecond timestamp MSB and 80-byte random number in the LSB. There are two problems with this design approach. First is that the x86 CPU doesn't have a sub-second timestamp, so databases do not use them. This means that to translate the milliseconds to seconds when you want to work with the database and you will have to divide and multiple by 1000, which is slow and error prone. To get a sub-second timestamp on an x86 server will require a dedicated thread to do a spin clock with an inter-process pipe, which is complex and unnecessary. We want an approach that doesn't have to generate any random numbers at runtime and we work in seconds and it will work for almost everything for thousands of years.

128-bit LinearId (LID16) use a 33-bit Unix second timestamp in the Most-Significant Bits (MSB) followed by a 22-bit sub-second spin ticker and 73-bit Cryptographically-Secure Generated-Upon-Boot Random Number (CSGUBRN):

```AsciiArt
 v--MSb                        128-bit LID                           LSb--v
+---------------------------------------------------------------------------+
| 33-bit seconds timestamp | 22-bit sub-second spin ticker | 73-bit CSGUBRN |
+---------------------------------------------------------------------------+
```

Statistically this means that when you have two web servers active, the probability that both servers generate the same random number is 7.12e-41%. If you had 1,000 servers running then the probability would be 1.06e-22%, which is a 1 in 9,444,732,965,739,290,427,392 chance. If you had 1,000,000 servers running, the probability would be 1.06e-16%, which is a 1 in 9,444,732,965,739,290 chance and is a 53-bit number. If there ever is actually is more than one server with the same source id, this means that the server will have to regenerate a 73-bit random source id upon boot, which will result in the first database write from that server to have to be performed one. This makes this bit pattern statistically acceptable to use for military and banking applications.

The 22-bit sub-second spin ticker caps out the number of calls you can make to per second to 2^22, which is 4,194,304. If you make more calls than this per second than the algorithm will spin wait until the next second and then reset the sub-second ticker. Assuming the upper limit of a normal computer, which is no more than 4,294,967,296Hz (4.3GHz) and just so happens to be 2^32 or 32-bits, making the math easy. This would give you about 1024 instructions between when you can call LID. Given not all CPU instructions are single-cycle, you're usually waiting for memory, and you're going to be creating a data structure, it's highly unlikely you'll ever hit this cap and if you ever did you'll probably have no problem with the delay. This is an edge case.

The 36-bit timestamp has an epoch span of 2,177.6 years. By that time everything we know including your software and hardware will be long gone and forgotten. The above characteristics make the 22-bit spin ticker and 70-bit CSGUBRN a sweet spot that will work for almost every computer and last not be outdated for thousands of years.

The benefit of LID is that you don't need a naming server. You can use a 32-bit timestamp, a 22-bit sub-second ticker, and 10-bit server id if you use a naming server and that will give you an optimized 64-bit index, but each thread that uses LID will have to have it's own source, so you can quickly run out of source ids.

To [optimize for SQL and other database searches](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-index-design-guide), we need to take advantage of the 64-bit index in the inode data structure used by all in-disk database engines. Indexing can be very complicated and you can index your database tables different ways at runtime to optimize your lookups. You don't just want to XOR the LID LSW and MSW together because you'll get clustering, the result will be non-monotonic, and as the database grows you will get collisions. For this reason it's better to create new database rows using 128-indexes that you then index contiguously.

For users of your websites using LID, they will get HTML where the items with LIDs will show up with an HTML property uid that will be a string. When this string is 32-characters long (in hex so that is 16-bytes) that means it's a 128-bit LID that has not been compacted to a 64-bit UID. In the OS filesystem, inodes have timestamps, so when you see these 32-character UIDs you will need to extract the seconds from the timestamp and search for the database row by timestamp and UID.

Also, check out my open-source C++ software to at <https://github.com/KabukiStarship>. Thanks.

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
	uidx: bigint('uidx').primaryKey(),
	uid: varbinary('uid', { length: 16}),
  time_created: bigint('time_created', { mode: 'number' }),
  //...
});
```

**4** Add to your TypeScript or JavaScript imports:

```TypeScript
//import { LIDFromHex, LIDNext, LIDNextBuffer, LIDToHex } from "linearid";
//import { randomInt } from 'crypto';

// or

const { randomInt } = require('crypto');
const { BufferToBigInt, HexToBigInt, LIDNext, LIDNextBuffer
} = require("linearid");
```

**5** Generate LIDs (Drizzle example in TypeScript):

```TypeScript
import { eq, gte, lte } from 'drizzle-orm';

let lid = LIDNext(randomInt);
const LidHexString = lid.toString(16);
console.log('\nExample LID hex string:0x' + LidHexString);
lid = HexToBigInt(lid_hex_string);

let Buf = LIDNextBuffer(randomInt);
lid = BufferToBigInt(Buf);

const InsertUserAccount = async (account: UserAccount) => {
  return db.insert(UserAccounts).values(account);
}

/*/* XORing the LSW and MSW of the LID is not how you generate a 64-bit index,
but it will work for small databases. The next version of LID will have 
multiple strategies for generating 64-bit indexes from 128-bit LIDs by using
the 128-bit LID and seconds timestamp to do SQL queries to avoid a full table
scan and the clustering and non-linearity problems with the XOR method. */
const NewAccount: UserAccount = {
  id: lsb ^ msb,
  uid: lid
}

InsertUserAccount(NewAccount);

let Timestamp = LIDTimestamp(lid);

/* I think this is how you do it but I'm still trying to get
this working. If you know how to do this please contribute on
GitHub and we will love you forever; thanks. */
let results = await db.select().from(UserAccounts).where(
  and(
    and(
      gte(users.date_created, Timestamp),
      lte(users.date_created, Timestamp + 2)
    ),
    eq(users.uid, uid)
  )
);

// When you have converted the LID 
results = await db.select().from(UserAccounts).where(
  eq(users.uidx, uidx)
);
```

### 64-bit Local LIDS

When rendering UI components on client and in many other situations you need to generate a UID, or a ref in React, without adding it to a database, so there is no need for a source id. JavaScript uses a millisecond timestamp natively, which when truncated to 32-bits provides an epoch of 49.7 days, which is much longer than the expected time that a webpage. It's not expected for users to need to generate 2^32 Local LID (LLID) per second, but it's nice and easy to just use either a 32-bit seconds timer or the lower 32-bits of a milliseconds timer in the Most Significant 32-bits ORed with a 32-bit sub-timer ticker; sub-timer meaning either sub-second or sub-millisecond.

```TypeScript
import { LLIDNextString } from 'linearid';

const ExampleItems = [ 'Foo', 'Bar' ]

export function ExampleList() {
  return <ul> { ExampleItems?.map((item) => {
      return <li ref={LLIDNextString()}>{item}</li>
    })}
  <ul>
}
```

## License

Copyright [AStartup](https://astartup.net).

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
