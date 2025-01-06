from construct import Struct, Bytes, Int8ul, Int64ul, Array, String, GreedyBytes, Hex, this
import uuid
import hashlib
import struct

# Definition der Container-Struktur
Container = Struct(
    "id" / Hex(Bytes(16)),  # UUID in hex
    "checksum" / Bytes(64),  # SHA-512 Checksumme
    "mimetype" / String(20, "utf-8"),  # MIME-Typ
    "length" / Int8ul,  # Länge der Sounddaten
    "sound_data" / Bytes(this.length)  # Sounddaten mit der angegebenen Länge
)

# Definition der MetaDataEntry-Struktur
MetaDataEntry = Struct(
    "container_id" / Hex(Bytes(16)),  # ID des zugehörigen Containers
    "key" / String(100, "utf-8"),  # Schlüssel
    "value" / String(100, "utf-8")  # Wert
)

# Definition der Hauptdateistruktur
FileFormat = Struct(
    "signature" / Bytes(3),  # Signatur
    "version" / Int8ul,  # Version
    "num_containers" / Int8ul,  # Anzahl der Container
    "containers" / Array(this.num_containers, Container),  # Container
    "num_metadata" / Int8ul,  # Anzahl der Metadaten
    "metadata" / Array(this.num_metadata, MetaDataEntry),  # Metadaten
    "total_size" / Int64ul  # Gesamtgröße
)

def generate_uuid():
    return uuid.uuid4().bytes

def calculate_checksum(mimetype, sound_data):
    sha512 = hashlib.sha512()
    sha512.update(mimetype.encode('utf-8'))
    sha512.update(sound_data)
    return sha512.digest()

def create_file_format(containers, metadata_entries):
    # Erstellen der Datei mit den gegebenen Containern und Metadaten
    signature = b'lsf'
    version = 1  # Version 1, da dies die aktuelle Version ist
    num_containers = len(containers)
    num_metadata = len(metadata_entries)

    # Erstellen der Container-Daten
    container_data = []
    for mimetype, sound_data in containers:
        container_id = generate_uuid()
        checksum = calculate_checksum(mimetype, sound_data)
        length = len(sound_data)
        container_data.append((container_id, checksum, mimetype.ljust(20, '\x00'), length, sound_data))

    # Erstellen der Metadaten-Daten
    metadata_data = []
    for container_id, key, value in metadata_entries:
        metadata_data.append((container_id, key.ljust(100, '\x00'), value.ljust(100, '\x00')))

    # Erstellen der Datei
    file_data = FileFormat.build({
        "signature": signature,
        "version": version,
        "num_containers": num_containers,
        "containers": container_data,
        "num_metadata": num_metadata,
        "metadata": metadata_data,
        "total_size": 0  # Platzhalter für die Gesamtgröße
    })

    # Gesamtgröße berechnen und aktualisieren
    total_size = len(file_data)
    file_data = file_data[:-8] + struct.pack('Q', total_size)  # Gesamtgröße am Ende hinzufügen

    return file_data

# Beispiel zur Verwendung
if __name__ == "__main__":
    containers = [
        ('audio/basic', b'\x01\x02\x03\x04\x05\x06\x07\x08'),  # Beispiel-Sounddaten
    ]
    
    metadata_entries = [
        (containers[0][0], 'Title', 'Sample Sound'),  # Beispiel-Metadaten
    ]

    file_data = create_file_format(containers, metadata_entries)

    # Datei schreiben
    with open('output.lsf', 'wb') as f:
        f.write(file_data)
