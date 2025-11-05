# Compression/Decompression

## Overview

Compression/Decompression uses LZ4 compression to efficiently store messages and snapshots. LZ4 provides fast compression and decompression with good compression ratios for text data.

## Key Components

### Components

- **`convex/lz4.ts`** - LZ4 compression implementation
- **`convex/lz4Wasm.ts`** - WASM source for LZ4
- **`convex/compressMessages.ts`** - Message compression utilities
- **`app/lib/compression.ts`** - Client-side compression

## Implementation Details

### LZ4 Implementation

LZ4 implemented via WebAssembly:

- **WASM Module**: LZ4 compiled to WASM
- **Fast Compression**: Fast compression algorithm
- **Good Ratio**: Good compression for text
- **Browser Support**: Runs entirely in browser

### Compression Process

1. **Data Preparation**: Data serialized (e.g., JSON)
2. **Encoding**: Text encoded to UTF-8 bytes
3. **Compression**: Bytes compressed with LZ4
4. **Storage**: Compressed data stored

### Decompression Process

1. **Data Retrieval**: Compressed data retrieved
2. **Decompression**: Data decompressed with LZ4
3. **Decoding**: Bytes decoded from UTF-8
4. **Deserialization**: Data deserialized (e.g., JSON)

## Code References

### LZ4 Class
```11:43:convex/lz4.ts
export class Lz4 {
  private instance?: WebAssembly.Instance;
  private textDecoder: TextDecoder;

  private uint8Memory0: Uint8Array | null = null;
  private int32Memory0: Int32Array | null = null;
  private wasmVectorLen: number = 0;

  private heap: any[];
  private heap_next: number;

  constructor() {
    this.textDecoder = new TextDecoder("utf-8", { ignoreBOM: true, fatal: true });
    this.textDecoder.decode();

    this.heap = new Array(32).fill(undefined);
    this.heap.push(undefined, null, true, false);
    this.heap_next = this.heap.length;
  }

  static async initialize() {
    const lz4 = new Lz4();
    const { instance } = await WebAssembly.instantiate(wasmBuffer, {
      "./lz4_wasm_bg.js": {
        __wbindgen_string_new: (arg0: number, arg1: number) => {
          const ret = lz4.getStringFromWasm0(arg0, arg1);
          return lz4.addHeapObject(ret);
        },
      },
    });
    lz4.instance = instance;
    return lz4;
  }
```

### Message Compression
```4:15:convex/compressMessages.ts
export async function compressMessages(messages: SerializedMessage[]) {
  const lz4 = await Lz4.initialize();
  const compressed = lz4.compress(new TextEncoder().encode(JSON.stringify(messages)));
  return compressed;
}

export async function decompressMessages(response: Response) {
  const lz4 = await Lz4.initialize();
  const compressed = await response.arrayBuffer();
  const decompressed = lz4.decompress(new Uint8Array(compressed));
  return JSON.parse(new TextDecoder().decode(decompressed));
}
```

## Usage

Compression used for:

- **Message Storage**: Chat messages compressed
- **Snapshot Storage**: Project snapshots compressed
- **Data Transfer**: Compressed data for faster transfer
- **Storage Efficiency**: Reduced storage costs

## Performance

- **Fast Compression**: LZ4 is fast
- **Fast Decompression**: Fast decompression
- **Memory Efficient**: Low memory usage
- **Browser Optimized**: Optimized for browser

## Related Features

- **Message Management**: Message compression
- **Snapshots**: Snapshot compression
- **Storage**: Efficient storage usage

