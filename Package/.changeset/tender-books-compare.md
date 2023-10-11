---
"linearid": minor
---

The timestamp bit pattern has been changed to a 36-bit Unix second timestamp in the MSB, a 6-bit cryptographically generated upon boot random number (CGUBRN), a 22-bit sub-second spin ticker, and 64-bit CGUBRN Least-significant word. 

```AsciiArt
 v--MSb                       128-bit LID                           LSb--v
+--------------------------------------------------------------------------+
| 36-bit seconds timestamp | 6-bit CSRUBRN | 22-bit sub-second spin ticker |
+--------------------------------------------------------------------------+
```

The x86 CPU doesn't have a sub-second timestamp so to work with SQL databases and most servers you need second timestamps. Added LIDBufferFromHex so users can give UIDs to clients in hex string format and parse from a hex string to a Buffer. I renamed LIDPrint to LIDToHex and LIDParse to LIDFromHex because that makes the nomenclature consistent. The test got cleaned up via DRY. 
