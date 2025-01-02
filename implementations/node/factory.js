// lsf-factory.js

const { createLSF, VersionEnum } = require('./index.js');
const { v4: uuidv4 } = require('uuid'); // Import UUID v4

// Container class
class Container {
    constructor(id, mimetype, sound_data) {
        if (!id || !mimetype || !sound_data) {
            //throw new Error('Container must have id, mimetype, and sound_data.');
        }
        this.id = id; // UUID as a string
        this.mimetype = mimetype; // MIME type as a string
        this.sound_data = sound_data; // Sound data as a binary string or Buffer
    }
}

// Metadata class
class MetaData {
    constructor(id, type, value) {
        if (!id || !type || !value) {
            throw new Error('Metadata must have id, type, and value.');
        }
        this.id = id; // UUID as a string
        this.type = type; // Type as a string
        this.value = value; // Value as a string
    }
}

// LSF class with factory methods for method chaining
class LSF {
    constructor() {
        this.containers = [];
        this.metadata = [];
        this.currentContainer = null; // To hold the current container being built
        this.currentMetaData = null; // To hold the current metadata being built
    }

    static create() {
        return new LSF();
    }
	
	setVersion(v){
		if(typeof v==='string' && Object.keys(VersionEnum).indexOf(v)>-1)this.version = VersionEnum[v]
		else if(typeof v==='number' && Object.values(VersionEnum).indexOf(v)>-1)this.version = VersionEnum[Object.values(VersionEnum).indexOf(v)]
		else throw new Error('No valid Version has been given.');
		return this; // Allow method chaining
	}

    addContainer() {
        this.currentContainer = new Container('', '', null); // Create a new empty container
        this.containers.push(this.currentContainer);
        return this; // Allow method chaining
    }

    setSound(sound_data) {
        if (!this.currentContainer) {
            throw new Error('No container is currently being built.');
        }
        this.currentContainer.sound_data = sound_data;
        return this; // Allow method chaining
    }

    newId() {
        if (!this.currentContainer) {
            throw new Error('No container is currently being built.');
        }
        this.currentContainer.id = this.generateNewId();
        return this; // Allow method chaining
    }

    detectMime() {
        if (!this.currentContainer) {
            throw new Error('No container is currently being built.');
        }
        this.currentContainer.mimetype = this.detectMimeType(this.currentContainer.sound_data);
        return this; // Allow method chaining
    }

    setMime(value) {
        if (!this.currentContainer) {
            throw new Error('No container is currently being built.');
        }
        this.currentContainer.mimetype = value;
        return this; // Allow method chaining
    }

    addMeta(key, value, id) {
        // Use the id of the last container if not provided
        if (!this.currentContainer && this.containers.length === 0 && !id) {
            throw new Error('No container exists to associate metadata with.');
        }

        const metaId = id || (this.currentContainer ? this.currentContainer.id : this.containers[this.containers.length - 1].id);
        this.currentMetaData = new MetaData(metaId, key, value);
        this.metadata.push(this.currentMetaData);
        return this; // Allow method chaining
    }

    setKey(key) {
        if (!this.currentMetaData) {
            throw new Error('No metadata is currently being built.');
        }
        this.currentMetaData.type = key;
        return this; // Allow method chaining
    }

    setValue(value) {
        if (!this.currentMetaData) {
            throw new Error('No metadata is currently being built.');
        }
        this.currentMetaData.value = value;
        return this; // Allow method chaining
    }

    build() {
        if (this.containers.length === 0) {
            throw new Error('At least one container is required to build LSF.');
        }
        return createLSF(this.containers, this.metadata, this.version);
    }

    // Helper method to generate a new ID (UUID4) and ensure uniqueness
    generateNewId() {
        let newId;
        do {
            newId = uuidv4(); // Generate a new UUID4
        } while (this.isIdUsed(newId)); // Check for uniqueness
        return newId;
    }

    // Check if the ID is already used in containers or metadata
    isIdUsed(id) {
        const isUsedInContainers = this.containers.some(container => container.id === id);
        const isUsedInMetadata = this.metadata.some(meta => meta.id === id);
        return isUsedInContainers || isUsedInMetadata;
    }

    // Simple MIME type detection (placeholder)
    detectMimeType(sound_data) {
		// Implement actual MIME type detection logic based on sound_data
        return 'audio/basic'; // audio/x-raw
    }
}

// Export the LSF class, version enum, and other classes
module.exports = {
    LSF,
    VersionEnum,
    Container,
    MetaData,
	lsf()=>LSF.create(),
};
