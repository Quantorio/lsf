// lsf-parser/index.js

const { Parser } = require('binary-parser');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

// Define the version enum
const VersionEnum = {
    v0: 0,
    v1: 1
};

// Define the UUID structure
const UUID = 16; // 16 bytes for UUID

// Define the container structure
const ContainerParser = new Parser()
    .string('id', { encoding:'hex', length: UUID }) // 16 bytes for UUID
    .array('checksum', { type:'uint8', length: 64 }) // 64 bytes for checksum
    .string('mimetype', { length: 20, stripNull:true }) // 20 bytes for MIME type
    .uint8('sound_data_length') // 1 byte for sound data length
    .buffer('sound_data', { length: 'sound_data_length' }); // Compressed sound data

// Define the metadata structure
const MetaDataParser = new Parser()
    .string('id', { encoding: 'hex', length: UUID }) // 16 bytes for UUID
    .string('type', { length: 100, encoding: 'utf8', stripNull:true }) // Variable length for type
    .string('value', { length: 100, encoding: 'utf8', stripNull:true }); // Variable length for value

// Define the main structure
const LSFFormatParser = new Parser()
    .string('signature', { length: 3 }) // Signature
    .uint8('version') // Version enum
	.uint8('container_length') // Container length
    .array('containers', { type: ContainerParser, length: (ctx) => ctx.container_length }) // Array of containers
	.uint8('metadata_length') // Metadata length
    .array('metadata', { type: MetaDataParser, length: (ctx) => ctx.metadata_length }) // Array of metadata
    .uint64('total_size'); // 8 bytes for total size

// Function to calculate checksum
function calculateChecksum(mimetype, soundData) {
    return crypto.createHash('sha512').update(Buffer.concat([mimetype, soundData])).digest();
}

// Function to create LSF binary data
function createLSF(containersData, metadataData, version) {
	if(Object.values(VersionEnum).indexOf(version)===-1)throw new Error('No valid Version');
    const containers = containersData.map(container => {
        const id = Buffer.from(container.id.replace(/-/g, ''), 'hex'); // UUID as bytes
        const checksum = calculateChecksum(Buffer.from(container.mimetype), Buffer.from(container.sound_data));
        const mimetype = Buffer.from(container.mimetype);
        const sound_data = Buffer.from(container.sound_data);
        const sound_data_length = sound_data.length;

        const paddedMime = Buffer.concat([mimetype, Buffer.alloc(20 - mimetype.length)]);
		
        return Buffer.concat([id, checksum, paddedMime, Buffer.from([sound_data_length]), sound_data]);
    });

    const metadata = metadataData.map(meta => {
        const id = meta.id ? Buffer.from(meta.id.replace(/-/g, ''),'hex') : Buffer.from(uuidv4().replace(/-/g, ''), 'hex'); // UUID as bytes
        const type = Buffer.from(meta.type, 'utf8');
        const value = Buffer.from(meta.value, 'utf8');

        // Ensure type and value are padded to 100 bytes
        const paddedType = Buffer.concat([type, Buffer.alloc(100 - type.length)]);
        const paddedValue = Buffer.concat([value, Buffer.alloc(100 - value.length)]);

        return Buffer.concat([id, paddedType, paddedValue]);
    });

    // Build the LSF structure
    const signature = Buffer.from('lsf', 'utf8');
    const version = Buffer.from([version?version:VersionEnum.v0]);
    const total_size = 0; // Placeholder for total size

    const lsfData = Buffer.concat([
        signature,
        version,
        Buffer.from([containers.length]),
        Buffer.concat(containers),
        Buffer.from([metadata.length]),
        Buffer.concat(metadata),
        Buffer.alloc(8) // Placeholder for total size
    ]);

    // Calculate total size and update it
    const totalSize = lsfData.length;
	const sizeBuffer=Buffer.alloc(8);
	sizeBuffer.writeBigInt64BE(BigInt(totalSize));
    const updatedLsfData = Buffer.concat([lsfData.slice(0, -8), sizeBuffer]); // Update total size

    return updatedLsfData;
}

// Export the functions and enums
module.exports = {
    createLSF,
    LSFFormatParser,
	VersionEnum,
};
