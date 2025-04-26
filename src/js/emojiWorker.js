/**
 * Encodes binary data into a BaseN emoji string.
 * Handles Base64 specifically to remove padding.
 * (This function is identical to the one previously in emojiCipher.js)
 * @param {Uint8Array} dataUint8Array The binary data (e.g., IV + ciphertext) to encode.
 * @param {number} baseN The base value (e.g., 64, 128, 256...).
 * @param {string[]} emojiLibrary The full emoji library.
 * @param {number[]} emojiSeedRealIndices The indices defining the BaseN alphabet.
 * @returns {string} The BaseN encoded emoji string.
 */
function encodeBaseN(dataUint8Array, baseN, emojiLibrary, emojiSeedRealIndices) {
    // console.log(`Worker: Encoding ${dataUint8Array.length} bytes to Base${baseN} emojis...`); // Worker Debug
    if (!emojiLibrary || !emojiSeedRealIndices) {
        throw new Error(`Worker: Missing emojiLibrary or emojiSeedRealIndices.`);
    }
    if (emojiSeedRealIndices.length < baseN) {
        throw new Error(`Worker: Cannot encode to Base${baseN}: Not enough unique emojis provided in seed (${emojiSeedRealIndices.length}).`);
    }

    const baseNAlphabet = emojiSeedRealIndices.slice(0, baseN).map(index => {
        if (index < 0 || index >= emojiLibrary.length) {
             throw new Error(`Worker: Invalid index ${index} found in emojiSeedRealIndices for library size ${emojiLibrary.length}.`);
        }
        return emojiLibrary[index];
    });
    
    if (baseNAlphabet.includes(undefined)) {
         // This check is somewhat redundant due to the index check above, but good safety.
         throw new Error(`Worker: Base${baseN} alphabet contains undefined emojis. Check emoji library and indices.`);
    }
    // console.log(`Worker: Using Base${baseN} alphabet of size ${baseNAlphabet.length}`); // Worker Debug

    let bits = 0;
    let value = 0;
    let output = '';
    const bitsPerChar = Math.log2(baseN);
    if (!Number.isInteger(bitsPerChar)) {
        throw new Error(`Worker: Invalid baseN value ${baseN}. Must be a power of 2.`);
    }

    for (let i = 0; i < dataUint8Array.length; i++) {
        value = (value << 8) | dataUint8Array[i];
        bits += 8;

        while (bits >= bitsPerChar) {
            const index = (value >> (bits - bitsPerChar)) & (baseN - 1);
             if (index >= baseNAlphabet.length || index < 0) {
                console.error(`Worker: Calculated index ${index} is out of bounds for Base${baseN} alphabet (size ${baseNAlphabet.length})`);
                 throw new Error(`Worker: Internal error: Calculated index ${index} out of bounds during Base${baseN} encoding.`);
            }
            output += baseNAlphabet[index];
            bits -= bitsPerChar;
        }
    }

    // Handle remaining bits (padding)
    if (bits > 0) {
        if (baseN !== 64) { 
             const index = (value << (bitsPerChar - bits)) & (baseN - 1);
              if (index >= baseNAlphabet.length || index < 0) {
                  console.error(`Worker: Calculated padding index ${index} is out of bounds for Base${baseN} alphabet (size ${baseNAlphabet.length})`);
                  throw new Error(`Worker: Internal error: Calculated padding index ${index} out of bounds during Base${baseN} encoding.`);
              }
            output += baseNAlphabet[index];
         } 
    }

    // console.log(`Worker: Base${baseN} encoding complete. Output length: ${output.length} emojis.`); // Worker Debug
    return output;
}

// Worker message listener
self.onmessage = function(event) {
    // console.log("Worker: Received message"); // Worker Debug
    const { dataUint8ArrayBuffer, baseN, emojiLibrary, emojiSeedRealIndices } = event.data;

    try {
        // Reconstruct the Uint8Array from the transferred ArrayBuffer
        const dataUint8Array = new Uint8Array(dataUint8ArrayBuffer);
        
        if (!dataUint8Array || baseN === undefined || !emojiLibrary || !emojiSeedRealIndices) {
             throw new Error("Worker: Invalid data received.");
        }
        
        // Perform the encoding
        const result = encodeBaseN(dataUint8Array, baseN, emojiLibrary, emojiSeedRealIndices);
        
        // Send the result back to the main thread
        // console.log("Worker: Sending result back"); // Worker Debug
        self.postMessage({ success: true, result: result });
    } catch (error) {
        // console.error("Worker: Error during encoding:", error); // Worker Debug
        // Send error back to the main thread
        self.postMessage({ success: false, error: error.message });
    }
}; 