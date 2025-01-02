// lsf-factory.test.js

const { LSF, Container, MetaData } = require('../factory');
const { LSFFormatParser } = require('../index');
const crypto = require('crypto');

describe('LSF Class', () => {
    let lsf;

    beforeEach(() => {
        lsf = LSF.create();
    });

    test('should create a new container', () => {
        lsf.addContainer();
        expect(lsf.containers.length).toBe(1);
        expect(lsf.currentContainer).toBeInstanceOf(Container);
    });

    test('should set sound data for the current container', () => {
        lsf.addContainer().setSound('binarySoundData');
        expect(lsf.currentContainer.sound_data).toBe('binarySoundData');
    });

    test('should generate a new ID for the current container', () => {
        lsf.addContainer().newId();
        expect(lsf.currentContainer.id).toBeDefined();
    });

    test('should detect MIME type for the current container', () => {
        lsf.addContainer().setSound('binarySoundData').detectMime();
        expect(lsf.currentContainer.mimetype).toBe('audio/wav'); // Adjust based on your detectMimeType implementation
    });

    test('should add metadata with a specified key and value', () => {
        lsf.addContainer().newId();
        lsf.addMeta('title', 'My Sound');
        expect(lsf.metadata.length).toBe(1);
        expect(lsf.metadata[0].type).toBe('title');
        expect(lsf.metadata[0].value).toBe('My Sound');
    });

    test('should use the last container ID for metadata if no ID is provided', () => {
        lsf.addContainer().newId();
        const containerId = lsf.currentContainer.id;
        lsf.addMeta('title', 'My Sound');
        expect(lsf.metadata[0].id).toBe(containerId);
    });

    test('should build the LSF object', () => {
        lsf.addContainer().newId().setSound('binarySoundData').detectMime();
        lsf.addMeta('title', 'My Sound');
        const builtLSF = lsf.build();
        expect(builtLSF).toBeDefined(); // Adjust based on your createLSF implementation
    });

    test('should throw an error if no container is added before building', () => {
        expect(() => lsf.build()).toThrow('At least one container is required to build LSF.');
    });

    test('should parse the built LSF object', () => {
        lsf.addContainer().newId().setSound('binarySoundData').detectMime();
        lsf.addMeta('title', 'My Sound');
        const builtLSF = lsf.build();
        expect(builtLSF).toBeDefined(); // Adjust based on your createLSF implementation
        expect(Buffer.isBuffer(builtLSF)).toBe(true);
		let parsed;
        expect(()=> parsed = LSFFormatParser.parse(builtLSF)).not.toThrow();
		expect(parsed.signature).toEqual('lsf');
		expect(parsed.version).toBe(0);
		expect(parsed.container_length).toBe(1);
		expect(parsed.containers[0].id).toBe(lsf.containers[0].id.replaceAll('-',''));
		expect(parsed.containers[0].checksum).toEqual(crypto.createHash('sha512').update(Buffer.concat([Buffer.from(lsf.containers[0].mimetype), Buffer.from(lsf.containers[0].sound_data)])).digest().toJSON().data);
		expect(parsed.containers[0].mimetype).toEqual(lsf.containers[0].mimetype);
		expect(parsed.containers[0].sound_data_length).toBe(lsf.containers[0].sound_data.length);
		expect(parsed.containers[0].sound_data.length).toBe(Buffer.from(lsf.containers[0].sound_data).length);
		expect(parsed.containers[0].sound_data).toEqual(Buffer.from(lsf.containers[0].sound_data));
		expect(parsed.metadata_length).toBe(1);
		expect(parsed.metadata[0].id).toBe(parsed.metadata[0].id.replaceAll('-',''));
		expect(parsed.containers[0].title).toEqual(lsf.containers[0].title);
		expect(parsed.containers[0].value).toEqual(lsf.containers[0].value);
		expect(parsed.total_size).toBe(BigInt(builtLSF.length));
    });
});
