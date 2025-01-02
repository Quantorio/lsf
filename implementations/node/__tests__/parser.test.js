// __tests__/lsf-parser.test.js

const { createLSF, VersionEnum } = require('../index');

describe('LSF Parser', () => {
    test('should create valid LSF binary data', () => {
        const containersData = [
            {
                id: '550e8400e29b41d4a716446655440000', // Example UUID
                mimetype: 'audio/basic',
                sound_data: 'compressed_sound_data'
            }
        ];

        const metadataData = [
            { type: 'volume', value: '75' },
            { type: 'duration', value: '120' }
        ];

        const lsfBinaryData = createLSF(containersData, metadataData);
        
        // Check that the output is a Buffer
        expect(Buffer.isBuffer(lsfBinaryData)).toBe(true);
        
        // Additional checks can be added here based on expected output
    });
});
