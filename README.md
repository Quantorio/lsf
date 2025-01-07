# Layered Sound Format
The Layered Sound Format is an experimental file format primary intendet to preserve the full recorded audio from multiple instrumental/voice layers without loss providing full configurability in terms of ambience, mixing and more.

Last changed on 07.01.2025
## LayeredSoundFormat Definition
![Structure](https://github.com/user-attachments/assets/f933fa6a-d393-4026-871b-76252a19a5a9)

See rfc-2119 for definition of the terms '**must**', '**must not**', '**should**', '**should not**' and '**may**'.
### Signature
Each file must start with a 3 bytes signature.
If using this definition it must be 'lsf'.
### Version
Each file must include a version in uint8.
This may be a number other than 0 or 1 but be advised that 0 and 1 are the only official version numbers.
Version 1 should be used by default as it is the most current definition.
This document references only version 1.
### Number of Containers
The file must include uint8 as length of the containers.
It must be natural and should be greater than 0.
### Containers
The file should include containers.
Its length must equal number of containers as it was declarred before.
#### Defenition of container
##### Id
Each Container must include an unique identifier.
It should be an uuidv4 with stripped minus '-' by default.
It must be string in hex format with 16 bytes length.
It must not be 16 null bytes.
##### Checksum
Each Container must include a checksum for the concanation of mimetype and data.
It has to be 64 bytes of uint8.
It should be sha512.
##### MimeType
Each Container must set a valid MimeType for the sounddata.
It must be a string of 20 bytes consisting of the MimeType and if needed following null bytes.
It should be something lossfree and may be 'audio/basic' or 'audio/x-raw' for raw recorded buffer data.
##### Length
Each Container must define a uint8 length for the data.
##### Sound Data
Each Container must set its sounddata with equal length as defined before.
It must be in the declared MimeType.

### Number of MetaData entries
Each file must declare a uint8 length of the following MetaData entries.
### MetaData entries
Each file should contain MetaData entries.
The number of entries must equal the declarred length and should be greater than 0.
#### Definition of MetaData
##### Id
Each MetaData entry must specify an ID of an associated container.
It may be 16 null bytes to associate it to every container.
In terms of priority, a direct reference must be prioritised higher than 16 zero bytes.
Secondary, it must be prioritised in the order of presence.
##### Key
Each MetaData entry must have a key.
It must be an utf8 string with a length of 100 bytes, padded with zero bytes.
##### Value
Each MetaData entry must have a value.
It must be an utf8 string with a length of 100 bytes, padded with zero bytes.
### Virtual Speaker
Each file may declares configuration for virtual speakers.
If declared any application which not edits the file should respect this configuration.
An application may let the user edit this configuration as part of a system like a equalizer.
#### Declaration of Virtual speakers
### Id
Each virtual speaker entry must set the id of the assigned sound layer.
#### Speaker Id
Each virtual speaker entry must define the speakers as uint8 binary.
The unique Id of a speaker must be a derivate of the bit numbers.

The provided Id may include multiple speakers by applying the logical or operation to their binary id.

Following a example for 3 speakers(1,2,4):
- 1(001) & 2(010) --> 3 (011)
- 2(010) & 4(100) --> 6 (110)
- 1(001) & 2(010) & 4(100) --> 7 (111)
#### Volume
Each vitual speaker entry must define the volume as a num from 0 to 255.
### Total Size
Each file must end with 8 bytes uint64.
It must equal the file size.
