---
"linearid": minor
---

Added LIDBufferFromHex so users can give UIDs to clients in hex string format and parse from a hex string to a Buffer. I renamed LIDPrint to LIDToHex and LIDParse to LIDFromHex because that makes the nomenclature consistent. The test got cleaned up via DRY. 
