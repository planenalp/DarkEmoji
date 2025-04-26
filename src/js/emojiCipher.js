const optionAlgorithmEmojiMap = {
  'AES-256-GCM': ['😄', '😆', '😅', '😂', '😍', '😝', '😵', '😭', '😩', '😫'],
  'ChaCha20-Poly1305': ['🙂', '😉', '😘', '😗', '🤔', '🙃', '🤐', '😐', '😶', '😕']
};

const optionBaseEmojiMap = {
  'Base64': ['🛐', '🕉️', '✡️'],
  'Base128': ['☸️', '☯️', '✝️'],
  'Base256': ['☦️', '☪️', '☮️'],
  'Base512': ['🕎', '🔯', '♈'],
  'Base1024': ['♉', '♊', '♋'],
  'Base2048': ['♌', '♍', '♎'],
  'Base4096': ['♏', '♐', '♑'],
  'Base8192': ['♒', '♓', '⛎']
};

const optionEmojiVersionEmojiMap = {
  'Emoji-v4.0': ['⬆️', '◀️', '🚰'],
  'Emoji-v5.0': ['⬇️', '▶️', '♿'],
  'Emoji-v11.0': ['⬅️', '🔼', '🚹'],
  'Emoji-v12.0': ['➡️', '🔽', '🚻'],
  'Emoji-v12.1': ['↖️', '⏪', '🚼'],
  'Emoji-v13.0': ['↗️', '⏩', '🚾'],
  'Emoji-v13.1': ['↙️', '⏫', '🛂'],
  'Emoji-v14.0': ['↘️', '⏬', '🛃'],
  'Emoji-v15.0': ['↕️', '⏮️', '🛄'],
  'Emoji-v15.1': ['↔️', '⏭️', '🛅'],
  'Emoji-v16.0': ['↩️', '⏯️', '🔠'],
  'Emoji-v17.0': ['↪️', '⏸️', '🔡'],
  'Emoji-v18.0': ['⤴️', '⏹️', '🔢'],
  'Emoji-v19.0': ['⤵️', '⏺️', '🔣'],
  'Emoji-v20.0': ['🔃', '⏏️', '🔤'],
  'Emoji-v21.0': ['🔄', '🎦', '🆒'],
  'Emoji-v22.0': ['🔀', '📶', '🆓'],
  'Emoji-v23.0': ['🔁', '🏧', '🆕'],
  'Emoji-v24.0': ['🔂', '🚮', '🆖']
};

const optionAlgorithmSelectionMap = {
  'AES-256-GCM': 'AES-256-GCM',
  'ChaCha20-Poly1305': 'ChaCha20-Poly1305'
};

const optionIterationsCountMap = {
  'Iterations-100k': 100000,
  'Iterations-500k': 500000,
  'Iterations-1M': 1000000,
  'Iterations-5M': 5000000,
  'Iterations-10M': 10000000,
  'Iterations-50M': 50000000
};

const optionBaseValueMap = {
  'Base64': 64,
  'Base128': 128,
  'Base256': 256,
  'Base512': 512,
  'Base1024': 1024,
  'Base2048': 2048,
  'Base4096': 4096,
  'Base8192': 8192
};

const optionDummyEmojPercentageMap = {
  'DummyEmoji-0%': 0,
  'DummyEmoji-5%': 5,
  'DummyEmoji-10%': 10,
  'DummyEmoji-20%': 20,
  'DummyEmoji-30%': 30,
  'DummyEmoji-40%': 40,
  'DummyEmoji-50%': 50,
  'DummyEmoji-60%': 60,
  'DummyEmoji-70%': 70,
  'DummyEmoji-80%': 80,
  'DummyEmoji-90%': 90, 
  'DummyEmoji-100%': 100
};  

// Helper function to select a random element from an array
function getRandomElement(arr) {
  if (!arr || arr.length === 0) {
    console.error("Cannot select random element from empty or invalid array:", arr);
    // In a real scenario, might want to throw an error or return a specific failure indicator
    return undefined; 
  }
  return arr[Math.floor(Math.random() * arr.length)];
}

// Helper function to select two different random elements from an array
function getTwoDifferentRandomElements(arr) {
  if (!arr || arr.length < 2) {
    console.error("Cannot select two different random elements from an array with less than 2 elements:", arr);
    // In a real scenario, might want to throw an error or return a specific failure indicator
    return [undefined, undefined]; 
  }
  let index1 = Math.floor(Math.random() * arr.length);
  let index2;
  do {
    index2 = Math.floor(Math.random() * arr.length);
  } while (index2 === index1); // Ensure indices are different
  
  // Return the actual elements, not indices
  return [arr[index1], arr[index2]];
}

// Helper function to fetch and parse the emoji JSON library
// Handles both browser (fetch) and Node.js (fs) environments
async function loadEmojiLibrary(versionKey) {
  const versionMap = {
    'Emoji-v4.0': 'Emoji-v4.0.json',
    'Emoji-v5.0': 'Emoji-v5.0.json',
    'Emoji-v11.0': 'Emoji-v11.0.json',
    'Emoji-v12.0': 'Emoji-v12.0.json',
    'Emoji-v12.1': 'Emoji-v12.1.json',
    'Emoji-v13.0': 'Emoji-v13.0.json',
    'Emoji-v13.1': 'Emoji-v13.1.json',
    'Emoji-v14.0': 'Emoji-v14.0.json',
    'Emoji-v15.0': 'Emoji-v15.0.json',
    'Emoji-v15.1': 'Emoji-v15.1.json',
    'Emoji-v16.0': 'Emoji-v16.0.json',
    'Emoji-v17.0': 'Emoji-v17.0.json',
    // Add mappings for v18.0 to v24.0 based on the maps above
    'Emoji-v18.0': 'Emoji-v18.0.json', 
    'Emoji-v19.0': 'Emoji-v19.0.json',
    'Emoji-v20.0': 'Emoji-v20.0.json',
    'Emoji-v21.0': 'Emoji-v21.0.json',
    'Emoji-v22.0': 'Emoji-v22.0.json',
    'Emoji-v23.0': 'Emoji-v23.0.json',
    'Emoji-v24.0': 'Emoji-v24.0.json'
    // Add future versions here if needed
  };
  const fileName = versionMap[versionKey];
  if (!fileName) {
    throw new Error(`Invalid or unmapped emoji version key: ${versionKey}`);
  }
  // Assuming the assets directory is relative to the HTML file in browser or project root in Node
  const filePath = `./assets/emoji/${fileName}`; 

  try {
    let emojiArray;
    // Browser environment
    if (typeof window !== 'undefined' && typeof fetch !== 'undefined') {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} fetching ${filePath}`);
        }
        emojiArray = await response.json();
    } 
    // Node.js environment
    else if (typeof require !== 'undefined') {
        // Dynamically require 'fs' and 'path' only in Node.js environment
        const fs = require('fs').promises;
        const path = require('path');
        // Construct path relative to the project root or expected execution context
        // This might need adjustment depending on how the Node script is run.
        // Assuming it's run from the project root or similar.
        const absolutePath = path.resolve(process.cwd(), 'assets', 'emoji', fileName); 
        // console.log(`Node.js: Attempting to read emoji file from: ${absolutePath}`); // Debug log
        try {
            const data = await fs.readFile(absolutePath, 'utf8');
            emojiArray = JSON.parse(data);
        } catch (readError) {
             // console.error(`Node.js: Error reading file ${absolutePath}:`, readError); // Debug log
             throw new Error(`Failed to read emoji file in Node.js: ${absolutePath}. Error: ${readError.message}`);
        }
    } else {
        throw new Error("Unsupported environment: Neither browser fetch nor Node.js require found.");
    }

    // Validate the loaded data
    if (!Array.isArray(emojiArray)) {
        throw new Error(`Invalid format in emoji file: ${fileName}. Expected an array.`);
    }
    
    // Filter out any potentially problematic entries (though JSON parsing should handle valid strings)
    const cleanedEmojiArray = emojiArray.filter(e => typeof e === 'string' && e.length > 0);
    
    if (cleanedEmojiArray.length !== emojiArray.length) {
         console.warn(`Emoji library ${fileName} contained non-string or empty values which were removed.`);
    }
    
    // Final check for undefined still being present (shouldn't happen with strings)
    if (cleanedEmojiArray.some(e => e === undefined)) {
         console.error(`Emoji library ${fileName} unexpectedly contains undefined values after cleaning.`);
         throw new Error(`Unexpected undefined values in cleaned emoji library ${fileName}.`);
    }
    
    // console.log(`Loaded ${cleanedEmojiArray.length} emojis from ${fileName}`); // Debug log
    return cleanedEmojiArray;

  } catch (error) {
    console.error(`Failed to load or parse emoji library ${fileName} from ${filePath}:`, error);
    // Propagate the error for upstream handling
    throw error; 
  }
}


/**
 * Sets up the initial parameters required for encryption based on user selections.
 * @param {object} options - User selected options.
 * @param {string} options.selectedAlgorithm - e.g., 'AES-256-GCM'
 * @param {string} options.selectedIterations - e.g., 'Iterations-100k'
 * @param {string} options.selectedBase - e.g., 'Base64'
 * @param {string} options.selectedDummyEmoji - e.g., 'DummyEmoji-0%'
 * @param {string} options.selectedEmojiVersion - e.g., 'Emoji-v13.1'
 * @returns {Promise<object>} A promise that resolves with an object containing the parameters.
 */
async function setupEncryption(options) {
  const {
    selectedAlgorithm,
    selectedIterations,
    selectedBase,
    selectedDummyEmoji,
    selectedEmojiVersion 
  } = options;

  console.log("Setting up encryption with options:", options); // Debug log

  // 1. Determine Core Parameters from Maps
  const algorithm = optionAlgorithmSelectionMap[selectedAlgorithm];
  const iterations = optionIterationsCountMap[selectedIterations];
  const baseN = optionBaseValueMap[selectedBase];
  const dummyPercentage = optionDummyEmojPercentageMap[selectedDummyEmoji];
  const emojiVersionKey = selectedEmojiVersion; // The key to use for emoji maps/loading

  // Basic validation of selected options mapping
  if (algorithm === undefined || iterations === undefined || baseN === undefined || dummyPercentage === undefined || !emojiVersionKey) {
      console.error("Failed to map selected options:", { algorithm, iterations, baseN, dummyPercentage, emojiVersionKey });
      throw new Error(`One or more selected options could not be mapped to configuration values. Algorithm: ${selectedAlgorithm}, Iterations: ${selectedIterations}, Base: ${selectedBase}, Dummy: ${selectedDummyEmoji}, Version: ${selectedEmojiVersion}`);
  }

  // 2. Load Emoji Library Asynchronously
  let emojiLibrary;
  try {
      emojiLibrary = await loadEmojiLibrary(emojiVersionKey);
  } catch (error) {
      // Error is logged within loadEmojiLibrary, re-throw for caller handling
      throw new Error(`Failed to load emoji library for version ${emojiVersionKey}: ${error.message}`);
  }
   
  if (!emojiLibrary || emojiLibrary.length === 0) {
       throw new Error(`Loaded emoji library for ${emojiVersionKey} is empty or invalid.`);
  }
  
  // Ensure the library has enough unique emojis for the chosen BaseN
  if (emojiLibrary.length < baseN) {
       throw new Error(`Emoji library for ${emojiVersionKey} (${emojiLibrary.length} emojis) is too small for the selected Base${baseN}. Requires at least ${baseN} unique emojis.`);
  }
  // Technically, we should also check for uniqueness, but JSON loading implies they are distinct entries.
  // A Set could be used for rigorous check: if (new Set(emojiLibrary).size < baseN) ...

  // 3. Select Key Emojis Randomly
  const emojiAlgorithmSymbols = optionAlgorithmEmojiMap[selectedAlgorithm];
  const emojiBaseSymbols = optionBaseEmojiMap[selectedBase];
  const emojiVersionSymbols = optionEmojiVersionEmojiMap[emojiVersionKey];
  
  if (!emojiAlgorithmSymbols || !emojiBaseSymbols || !emojiVersionSymbols) {
       throw new Error(`Could not find symbol lists for Algorithm: ${selectedAlgorithm}, Base: ${selectedBase}, or Version: ${emojiVersionKey}`);
  }

  const emojiAlgorithmKeySymbol = getRandomElement(emojiAlgorithmSymbols);
  const emojiBaseKeySymbol = getRandomElement(emojiBaseSymbols);
  const emojiVersionKeySymbol = getRandomElement(emojiVersionSymbols);
  
  // Select two DIFFERENT emojis from the main loaded library for the password key part
  const [emojiPass1, emojiPass2] = getTwoDifferentRandomElements(emojiLibrary);

  // Validate that all key emojis were successfully selected
  if (!emojiAlgorithmKeySymbol || !emojiBaseKeySymbol || !emojiVersionKeySymbol || !emojiPass1 || !emojiPass2) {
      console.error("Failed to select one or more key emojis:", {emojiAlgorithmKeySymbol, emojiBaseKeySymbol, emojiVersionKeySymbol, emojiPass1, emojiPass2});
      throw new Error("Failed to randomly select all necessary key component emojis.");
  }


  // 4. Construct PBKDF2 Salt (ensure correct order and reversed password key)
  const saltPBKDF2 = `${emojiAlgorithmKeySymbol}${emojiBaseKeySymbol}${emojiVersionKeySymbol}${emojiPass2}${emojiPass1}`; // Password parts reversed

  console.log("Derived Encryption Parameters:"); // Debug log
  console.log(`  Algorithm: ${algorithm}`);
  console.log(`  Iterations: ${iterations}`);
  console.log(`  Base N: ${baseN}`);
  console.log(`  Dummy %: ${dummyPercentage}`);
  console.log(`  Emoji Version: ${emojiVersionKey} (using ${emojiLibrary.length} emojis)`);
  console.log(`  Salt (PBKDF2): ${saltPBKDF2}`);
  console.log(`    Salt Components: Algo=${emojiAlgorithmKeySymbol}, Base=${emojiBaseKeySymbol}, Ver=${emojiVersionKeySymbol}, Pass2=${emojiPass2}, Pass1=${emojiPass1}`);


  // 5. Return all derived parameters needed for subsequent steps
  return {
    algorithm,          // e.g., 'AES-256-GCM'
    iterations,         // e.g., 100000
    baseN,              // e.g., 64
    dummyPercentage,    // e.g., 0
    emojiLibrary,       // The actual array of emojis loaded, e.g., ['#️⃣', '*️⃣', ...]
    saltPBKDF2,         // The constructed 5-emoji salt string
    emojiPass1,         // Return for default password generation
    emojiPass2          // Return for default password generation
  };
}

// TODO: Implement the actual encryption function using these parameters and Web Crypto API.
// TODO: Implement the BaseN encoding function.
// TODO: Implement the dummy emoji insertion logic.
// TODO: Implement the decryption counterpart.

// Example of how setupEncryption might be called from index.js (or similar)
/*
async function handleEncryptionClick() {
  try {
    // Assume getSelectedOptions() fetches values from the UI dropdowns
    const options = getSelectedOptions(); 
    
    const params = await setupEncryption(options);
    
    console.log("Encryption parameters successfully generated:", params);

    // Now, proceed with the rest of the encryption process:
    // 1. Get plaintext and password from UI inputs
    // 2. Derive key using PBKDF2 (params.saltPBKDF2, password, params.iterations)
    // 3. Encrypt plaintext using Web Crypto (params.algorithm, derivedKey, iv)
    // 4. Encode ciphertext + IV using BaseN (params.baseN, params.emojiLibrary)
    // 5. Add dummy emojis (params.dummyPercentage, params.emojiLibrary)
    // 6. Prepend key symbols to the final output string? (Need clarification)
    // 7. Display the final emoji string

  } catch (error) {
    console.error("Encryption process failed:", error);
    // Display error message to the user
  }
}
*/

// If this script is intended to be used as a module (e.g., in Node.js or with browser modules)
// export { setupEncryption /*, other functions */ }; 
// For simple browser <script> tag inclusion, functions are globally accessible (or within scope)

// --- Cryptographic Key Derivation and Seed Generation ---

/**
 * Converts a string to a Uint8Array using UTF-8 encoding.
 * @param {string} str The string to convert.
 * @returns {Uint8Array} The UTF-8 encoded byte array.
 */
function stringToUint8Array(str) {
  return new TextEncoder().encode(str);
}

/**
 * Derives a key using PBKDF2.
 * @param {string} password The password string.
 * @param {string} saltString The salt string (will be UTF-8 encoded).
 * @param {number} iterations The number of iterations.
 * @returns {Promise<ArrayBuffer>} A promise that resolves with the derived key material (ArrayBuffer).
 */
async function deriveKeyPBKDF2(password, saltString, iterations) {
  console.log(`Deriving key with PBKDF2: iterations=${iterations}`); // Debug
  const passwordBuffer = stringToUint8Array(password);
  const saltBuffer = stringToUint8Array(saltString);

  try {
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      { name: 'PBKDF2' },
      false, // not extractable
      ['deriveBits']
    );

    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: saltBuffer,
        iterations: iterations,
        hash: 'SHA-256' // Use SHA-256 as specified
      },
      keyMaterial,
      256 // Derive 256 bits for the intermediate key material
    );
    console.log("PBKDF2 key material derived successfully."); // Debug
    return derivedBits; // Returns ArrayBuffer
  } catch (error) {
    console.error("PBKDF2 key derivation failed:", error);
    throw error;
  }
}

/**
 * Simple HKDF-Expand implementation using HMAC-SHA256 (RFC 5869).
 * Assumes PRK (pseudorandom key) is the input IKM directly for simplicity here,
 * as PBKDF2 output is already suitable. A full HKDF includes Extract step.
 * @param {ArrayBuffer} ikm Input Keying Material (e.g., from PBKDF2).
 * @param {string} info Context/application-specific info string.
 * @param {number} length Desired output key length in bytes.
 * @returns {Promise<ArrayBuffer>} A promise resolving with the derived key (ArrayBuffer).
 */
async function hkdfExpand(ikm, info, length) {
  const infoBuffer = stringToUint8Array(info);
  const hashLen = 32; // SHA-256 output length in bytes
  const iterations = Math.ceil(length / hashLen);
  if (iterations > 255) {
    throw new Error("HKDF length too long, requires too many iterations.");
  }

  const okm = new Uint8Array(iterations * hashLen); // Output Keying Material buffer
  let t = new Uint8Array(0); // T(0) is empty
  const hmacKey = await crypto.subtle.importKey(
      'raw',
      ikm,
      { name: 'HMAC', hash: 'SHA-256' },
      false, // not extractable
      ['sign']
    );

  console.log(`HKDF Expanding for info="${info}", length=${length} bytes`); // Debug

  for (let i = 1; i <= iterations; i++) {
    const T_prev = t;
    const cBuffer = new Uint8Array([i]); // Iteration counter as byte

    // Concatenate T(i-1), info, and counter byte
    const inputBuffer = new Uint8Array(T_prev.length + infoBuffer.length + cBuffer.length);
    inputBuffer.set(T_prev, 0);
    inputBuffer.set(infoBuffer, T_prev.length);
    inputBuffer.set(cBuffer, T_prev.length + infoBuffer.length);

    // Calculate T(i) = HMAC(ikm, T(i-1) | info | C)
    t = new Uint8Array(await crypto.subtle.sign('HMAC', hmacKey, inputBuffer));
    okm.set(t, (i - 1) * hashLen);
  }

  console.log(`HKDF expansion complete for "${info}"`); // Debug
  // Return only the required number of bytes
  return okm.buffer.slice(0, length);
}

/**
 * Generates pseudo-random bytes using HMAC-DRBG (deterministic random bit generator) logic.
 * Simplified: Uses HMAC repeatedly with a counter.
 * @param {ArrayBuffer} seed The seed material.
 * @param {number} numBytes The number of pseudo-random bytes to generate.
 * @returns {Promise<Uint8Array>} A promise resolving with the generated bytes.
 */
async function generatePseudoRandomBytes(seed, numBytes) {
    const hmacKey = await crypto.subtle.importKey(
        'raw', 
        seed, 
        { name: 'HMAC', hash: 'SHA-256' }, 
        false, 
        ['sign']
    );
    const hashLen = 32; // SHA-256 output bytes
    const numBlocks = Math.ceil(numBytes / hashLen);
    const output = new Uint8Array(numBlocks * hashLen);
    let currentData = new Uint8Array(0);

    for (let i = 0; i < numBlocks; i++) {
        const counter = new Uint8Array(4); // Use a 32-bit counter
        new DataView(counter.buffer).setUint32(0, i, false); // Big-endian counter
        
        const input = new Uint8Array(currentData.length + counter.length);
        input.set(currentData, 0);
        input.set(counter, currentData.length);

        currentData = new Uint8Array(await crypto.subtle.sign('HMAC', hmacKey, input));
        output.set(currentData, i * hashLen);
    }

    return output.slice(0, numBytes);
}

/**
 * Deterministically shuffles an array of indices based on a seed using Fisher-Yates algorithm
 * driven by pseudo-random numbers generated from the seed.
 * @param {ArrayBuffer} seed The seed for the PRNG.
 * @param {number[]} indices The array of indices to shuffle.
 * @returns {Promise<number[]>} A promise resolving with the shuffled array of indices.
 */
async function seededShuffleIndices(seed, indices) {
    const n = indices.length;
    if (n <= 1) return indices.slice(); // No need to shuffle

    const shuffledIndices = indices.slice(); // Create a copy to modify
    
    // Generate enough random bytes for the shuffle. Need ~log2(n!) bits.
    // Simplification: generate enough bytes to map to indices 0 to n-1 for each swap.
    // Need n-1 random numbers, each up to n-1. Use 4 bytes per number for safety.
    const bytesNeeded = (n - 1) * 4; 
    const randomBytes = await generatePseudoRandomBytes(seed, bytesNeeded);
    const randomDataView = new DataView(randomBytes.buffer);

    console.log(`Shuffling ${n} indices using seed.`); // Debug

    // Fisher-Yates shuffle
    for (let i = n - 1; i > 0; i--) {
        // Get a random integer j such that 0 <= j <= i
        // Read 4 bytes and scale to the range [0, i]
        const randomUint32 = randomDataView.getUint32( (n - 1 - i) * 4 , false); // Big-endian
        const j = Math.floor((randomUint32 / (0xFFFFFFFF + 1)) * (i + 1));

        // Swap elements at indices i and j
        [shuffledIndices[i], shuffledIndices[j]] = [shuffledIndices[j], shuffledIndices[i]];
    }
    console.log("Index shuffling complete."); // Debug
    return shuffledIndices;
}

/**
 * Finds the first index of each emoji from a list within a larger library.
 * @param {string[]} emojisToFind An array of emoji strings to find.
 * @param {string[]} emojiLibrary The library to search within.
 * @returns {number[]} An array of indices corresponding to the found emojis. Returns -1 if not found.
 */
function findEmojiIndices(emojisToFind, emojiLibrary) {
    return emojisToFind.map(emoji => emojiLibrary.indexOf(emoji));
}


/**
 * Derives cryptographic keys and generates deterministic emoji index seeds.
 * @param {object} encryptionParams Parameters from setupEncryption.
 * @param {string} [password] Optional user-provided password string.
 * @returns {Promise<object>} A promise resolving with derived keys and seed index arrays.
 */
async function deriveKeysAndSeeds(encryptionParams, password) {
  const { 
    algorithm, 
    iterations, 
    baseN, 
    dummyPercentage, 
    emojiLibrary, 
    saltPBKDF2,
    emojiPass1,
    emojiPass2
  } = encryptionParams;

  console.log("Deriving keys and seeds..."); // Debug

  // 1. Determine Password for PBKDF2
  // If no password provided, use the 2 randomly selected emojis (emojiPasswordKey)
  const pbkdfPassword = (password && password.length > 0) ? password : (emojiPass1 + emojiPass2);
  console.log(`Using ${ (password && password.length > 0) ? "user-provided password" : `generated emoji password (${emojiPass1}${emojiPass2})`} for PBKDF2.`); // Debug

  // 2. Derive Intermediate Key Material via PBKDF2
  const keyMaterial = await deriveKeyPBKDF2(pbkdfPassword, saltPBKDF2, iterations);

  // 3. Derive Final Keys via HKDF
  // Define required lengths (e.g., 32 bytes = 256 bits)
  const keyLengthBytes = 32; 
  const cipherKey = await hkdfExpand(keyMaterial, "cipherKey", keyLengthBytes);
  const emojiKeyReal = await hkdfExpand(keyMaterial, "emojiKeyReal", keyLengthBytes); // Seed for real emojis
  const emojiKeyDummy = await hkdfExpand(keyMaterial, "emojiKeyDummy", keyLengthBytes); // Seed for dummy emojis
  const authKey = await hkdfExpand(keyMaterial, "authKey", keyLengthBytes);
  console.log("HKDF keys derived (cipher, emojiReal, emojiDummy, auth)."); // Debug

  // 4. Generate emojiSeedRealIndices (Indices for BaseN mapping)
  const allIndices = emojiLibrary.map((_, index) => index);
  const shuffledRealIndices = await seededShuffleIndices(emojiKeyReal, allIndices);
  const emojiSeedRealIndices = shuffledRealIndices.slice(0, baseN);
  console.log(`Selected ${emojiSeedRealIndices.length} real emoji indices using emojiKeyReal.`); // Debug

  // 5. Generate emojiSeedDummyIndices (Indices for Dummy/Padding emojis)
  // 5a. Find indices of salt emojis to exclude them from the dummy pool
  // Extract the 5 emojis from saltPBKDF2. Handle potential multi-byte chars correctly.
  const saltEmojis = Array.from(saltPBKDF2); // Splits into individual grapheme clusters (emojis)
  if (saltEmojis.length !== 5) {
      console.warn(`Expected 5 emojis in saltPBKDF2, but found ${saltEmojis.length}. Salt: "${saltPBKDF2}"`);
      // Proceeding, but exclusion might be inaccurate
  }
  const saltEmojiIndices = findEmojiIndices(saltEmojis, emojiLibrary);
  const uniqueSaltIndices = [...new Set(saltEmojiIndices.filter(idx => idx !== -1))]; // Unique, valid indices
  console.log(`Indices of salt emojis to exclude from dummy pool: ${uniqueSaltIndices.join(', ')}`); // Debug

  // 5b. Determine the pool of indices available for dummy emojis
  const realIndicesSet = new Set(emojiSeedRealIndices);
  const saltIndicesSet = new Set(uniqueSaltIndices);
  
  const availableDummyIndices = allIndices.filter(index => 
      !realIndicesSet.has(index) && 
      !saltIndicesSet.has(index)
  );
  console.log(`Available pool size for dummy indices: ${availableDummyIndices.length}`); // Debug

  // 5c. Shuffle the available dummy indices using emojiKeyDummy
  const shuffledDummyIndices = await seededShuffleIndices(emojiKeyDummy, availableDummyIndices);
  const emojiSeedDummyIndices = shuffledDummyIndices; // Use all remaining shuffled indices
  console.log(`Selected ${emojiSeedDummyIndices.length} dummy emoji indices using emojiKeyDummy.`); // Debug

  // 6. Return derived keys and seed indices
  const result = {
    cipherKey,         // ArrayBuffer (for Web Crypto encryption)
    authKey,           // ArrayBuffer (for potential MAC/authentication)
    emojiSeedRealIndices, // Array of numbers (indices into emojiLibrary for BaseN)
    emojiSeedDummyIndices // Array of numbers (indices into emojiLibrary for dummies)
  };
  console.log("Keys and seeds derivation complete.", result); // Debug
  return result;
}

// TODO: Implement actual encryption (AES-GCM / ChaChaPoly) using cipherKey.
// TODO: Implement BaseN encoding using emojiSeedRealIndices.
// TODO: Implement dummy emoji insertion using emojiSeedDummyIndices and dummyPercentage.
// TODO: Implement final output assembly.
// TODO: Implement decryption.

// --- Core Encryption, Encoding, and Output Generation ---

/**
 * Encrypts plaintext using Web Crypto API (AES-GCM or ChaCha20-Poly1305).
 * @param {Uint8Array} plaintextUint8Array The data to encrypt.
 * @param {ArrayBuffer} cipherKeyArrayBuffer The raw key material for encryption.
 * @param {string} algorithmName The algorithm name ('AES-256-GCM' or 'ChaCha20-Poly1305').
 * @returns {Promise<{iv: Uint8Array, ciphertext: ArrayBuffer}>} IV and Ciphertext.
 */
async function encryptData(plaintextUint8Array, cipherKeyArrayBuffer, algorithmName) {
  console.log(`Encrypting data using ${algorithmName}...`); // Debug
  let ivLengthBytes;
  let cryptoAlgorithm;

  if (algorithmName === 'AES-256-GCM') {
    ivLengthBytes = 12; // Standard GCM IV size
    cryptoAlgorithm = { name: 'AES-GCM', length: 256 }; // Specify key length
  } else if (algorithmName === 'ChaCha20-Poly1305') {
    ivLengthBytes = 12; // Standard ChaCha20 IV size
    cryptoAlgorithm = { name: 'ChaCha20-Poly1305' }; 
  } else {
    throw new Error(`Unsupported encryption algorithm: ${algorithmName}`);
  }

  const iv = crypto.getRandomValues(new Uint8Array(ivLengthBytes));
  console.log(`Generated IV (${iv.length} bytes)`); // Debug

  try {
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      cipherKeyArrayBuffer,
      cryptoAlgorithm.name, // Use only the name here
      false, // not extractable
      ['encrypt']
    );
    console.log("Cipher key imported successfully for encryption."); // Debug

    const ciphertext = await crypto.subtle.encrypt(
      { name: cryptoAlgorithm.name, iv: iv }, // Pass algorithm name and IV
      cryptoKey,
      plaintextUint8Array
    );
    console.log(`Encryption successful. Ciphertext length: ${ciphertext.byteLength} bytes.`); // Debug

    return { iv, ciphertext }; // ciphertext is ArrayBuffer
  } catch (error) {
    console.error(`Encryption failed using ${algorithmName}:`, error);
    throw error;
  }
}

/**
 * Calls the Web Worker to perform BaseN encoding.
 * @param {Uint8Array} dataUint8Array Data to encode.
 * @param {number} baseN Base value.
 * @param {string[]} emojiLibrary Full emoji library.
 * @param {number[]} emojiSeedRealIndices Indices for BaseN alphabet.
 * @returns {Promise<string>} Promise resolving with the encoded string or rejecting with an error.
 */
function callBaseNWorker(dataUint8Array, baseN, emojiLibrary, emojiSeedRealIndices) {
    return new Promise((resolve, reject) => {
        // Check if Worker support exists
        if (!window.Worker) {
            reject(new Error('Web Workers are not supported in this browser.'));
            return;
        }

        console.log("Creating BaseN encoding worker..."); // Debug
        const worker = new Worker('./src/js/emojiWorker.js'); // Path relative to the HTML file

        worker.onmessage = (event) => {
            console.log("Received message from BaseN worker:", event.data.success); // Debug
            if (event.data.success) {
                resolve(event.data.result);
            } else {
                reject(new Error(event.data.error || 'BaseN Worker failed with unspecified error'));
            }
            worker.terminate(); // Clean up the worker
        };

        worker.onerror = (error) => {
            console.error("Error from BaseN worker:", error); // Debug
            reject(new Error(`BaseN Worker error: ${error.message} (filename: ${error.filename}, lineno: ${error.lineno})`));
            worker.terminate(); // Clean up the worker
        };

        console.log("Posting message to BaseN worker..."); // Debug
        // Prepare data for the worker
        const messageData = {
            dataUint8ArrayBuffer: dataUint8Array.buffer,
            baseN: baseN,
            emojiLibrary: emojiLibrary, // This will be copied
            emojiSeedRealIndices: emojiSeedRealIndices // This will be copied
        };

        // Post the message, transferring the ArrayBuffer
        worker.postMessage(messageData, [dataUint8Array.buffer]);
    });
}

/**
 * Main encryption function.
 * @param {string} jsonStringInput The input JSON string to encrypt.
 * @param {string} password User-provided password (can be empty).
 * @param {object} options User selections (selectedAlgorithm, etc.).
 * @param {function(number):void} [onProgress] Optional callback for progress (0-100).
 * @returns {Promise<string>} The final encrypted emoji string.
 */
async function encrypt(jsonStringInput, password, options, onProgress = () => {}) {
    console.log("--- Starting Encryption Process ---");
    onProgress(0);
    let log = ["Encryption Process Log:"];
    
    try {
        log.push(`[${new Date().toISOString()}] Input JSON string length: ${jsonStringInput.length}`);
        // 1. Convert input string to Uint8Array
        const plaintextUint8Array = stringToUint8Array(jsonStringInput);
        log.push(`[${new Date().toISOString()}] Plaintext converted to Uint8Array (${plaintextUint8Array.length} bytes).`);
        onProgress(5);

        // 2. Setup initial parameters (load emoji lib, etc.)
        log.push(`[${new Date().toISOString()}] Setting up encryption parameters...`);
        const encryptionParams = await setupEncryption(options);
        log.push(`[${new Date().toISOString()}] Parameters set: Algorithm=${encryptionParams.algorithm}, Iterations=${encryptionParams.iterations}, BaseN=${encryptionParams.baseN}, Dummy=${encryptionParams.dummyPercentage}%, EmojiLibSize=${encryptionParams.emojiLibrary.length}, Salt=${encryptionParams.saltPBKDF2}`);
        onProgress(10);
        
        // 3. Derive Keys and Seeds (includes PBKDF2)
        log.push(`[${new Date().toISOString()}] Deriving keys and seeds (PBKDF2 + HKDF)...`);
        const derivedKeysAndSeeds = await deriveKeysAndSeeds(encryptionParams, password);
        log.push(`[${new Date().toISOString()}] Keys derived. Real indices: ${derivedKeysAndSeeds.emojiSeedRealIndices.length}, Dummy indices: ${derivedKeysAndSeeds.emojiSeedDummyIndices.length}`);
        // PBKDF2 is the slowest part
        onProgress(50); 

        // 4. Encrypt Data
        log.push(`[${new Date().toISOString()}] Encrypting data...`);
        const { iv, ciphertext } = await encryptData(
            plaintextUint8Array,
            derivedKeysAndSeeds.cipherKey,
            encryptionParams.algorithm
        );
        log.push(`[${new Date().toISOString()}] Encryption complete. IV: ${iv.length} bytes, Ciphertext: ${ciphertext.byteLength} bytes.`);
        onProgress(60);

        // 5. Combine IV and Ciphertext
        const combinedData = new Uint8Array(iv.length + ciphertext.byteLength);
        combinedData.set(iv, 0);
        combinedData.set(new Uint8Array(ciphertext), iv.length);
        log.push(`[${new Date().toISOString()}] Combined IV + Ciphertext: ${combinedData.length} bytes.`);

        // 6. BaseN Encode (Using Web Worker)
        log.push(`[${new Date().toISOString()}] Sending data to Base${encryptionParams.baseN} encoding worker...`);
        const emojiOutputBaseN = await callBaseNWorker(
            combinedData,
            encryptionParams.baseN,
            encryptionParams.emojiLibrary,
            derivedKeysAndSeeds.emojiSeedRealIndices
        );
        log.push(`[${new Date().toISOString()}] Received BaseN encoded result from worker. Length: ${Array.from(emojiOutputBaseN).length} emojis.`);
        // Update progress *after* worker finishes, allocate large chunk
        onProgress(90); 

        // 7. Insert Dummy Emojis
        log.push(`[${new Date().toISOString()}] Inserting dummy emojis (${encryptionParams.dummyPercentage}%) using Intl.Segmenter...`);
        const baseNWithDummies = insertDummyEmojis(
            emojiOutputBaseN, 
            encryptionParams.dummyPercentage,
            encryptionParams.emojiLibrary,
            derivedKeysAndSeeds.emojiSeedDummyIndices
        );
        log.push(`[${new Date().toISOString()}] Dummy insertion complete. Length after dummies: ${Array.from(baseNWithDummies).length} code units.`);

        // 7. Append Salt (Append after dummy insertion)
        const finalOutputWithSalt = baseNWithDummies + encryptionParams.saltPBKDF2;
        log.push(`[${new Date().toISOString()}] Appended salt. Final output length: ${Array.from(finalOutputWithSalt).length} emojis.`);
        onProgress(95); 

        // 9. Finalize
        log.push(`[${new Date().toISOString()}] --- Encryption Process Successful ---`);
        console.log(log.join('\n')); // Print log to console
        onProgress(100);
        return finalOutputWithSalt;

    } catch (error) {
        console.error("--- Encryption Process Failed ---", error);
        log.push(`[${new Date().toISOString()}] --- ERROR: ${error.message} ---`);
        log.push(`Stack: ${error.stack}`);
        console.log(log.join('\n')); // Print log even on error
        onProgress(100); // Indicate completion even if failed
        throw error; // Re-throw the error to be handled by the caller (e.g., UI)
    }
}


// --- Decryption Logic (Placeholder) ---
// TODO: Implement decryption counterpart
/*
async function decrypt(finalEmojiString, password, onProgress = () => {}) {
    console.log("--- Starting Decryption Process ---");
    onProgress(0);
    let log = ["Decryption Process Log:"];
    
    try {
        log.push(`[${new Date().toISOString()}] Input emoji string length: ${Array.from(finalEmojiString).length}`);
        // 1. Identify and Extract Salt Emojis (last 5 non-dummy? tricky!)
        //    - Need a way to distinguish dummy vs non-dummy without the key first.
        //    - This implies the structure needs rethinking, maybe salt isn't at the end, or dummies aren't inserted *after* salt?
        //    - OR: The salt *must* be extracted first using the known algorithm/base/version key symbols? Yes, this is likely.
        //      The first 3 emojis of the salt are the key symbols. We need to read those first.

        // -------- Rethink Required for Decryption Start ----------
        // Assume we can somehow extract the key symbols and salt first
        // This means the final output structure should probably be:
        // [Key Symbols (3)] + [BaseN(IV+Cipher)] + [Dummies interspersed in BaseN part] + [Salt Pass Emojis (2)]
        // Or maybe: [Key Symbols (3)] + [Salt Pass Emojis (2)] + [BaseN(IV+Cipher) + Dummies interspersed]
        // Let's assume the saltPBKDF2 (5 emojis) is reliably at the END for now, but acknowledge dummy removal is hard.
        
        // TEMPORARY ASSUMPTION: We magically know which are dummies and remove them.
        // This part needs solid implementation later.
        const { nonDummyString, saltEmojis } = extractSaltAndRemoveDummies_MAGIC(finalEmojiString);
        const saltPBKDF2 = saltEmojis.join('');
        log.push(`[${new Date().toISOString()}] Extracted Salt: ${saltPBKDF2}, String after dummy removal: ${Array.from(nonDummyString).length} emojis`);
        onProgress(10);

        // 2. Decode Key Symbols from Salt to get Options
        const { algorithm, baseN, iterations, dummyPercentage, emojiVersionKey } = decodeOptionsFromSalt_MAGIC(saltPBKDF2);
        const options = { selectedAlgorithm: algorithm, selectedIterations: `Iterations-${iterations}`, selectedBase: `Base${baseN}`, selectedDummyEmoji: `DummyEmoji-${dummyPercentage}%`, selectedEmojiVersion: emojiVersionKey };
        log.push(`[${new Date().toISOString()}] Decoded options from salt.`);
        onProgress(15);
        
        // 3. Setup Decryption Parameters (Load correct Emoji Lib)
        const decryptionParams = await setupEncryption(options); // Re-use setup to get library etc.
        log.push(`[${new Date().toISOString()}] Decryption parameters set.`);
        onProgress(20);
        
        // 4. Derive Keys (PBKDF2 + HKDF) - same as encryption
        log.push(`[${new Date().toISOString()}] Deriving keys for decryption...`);
        const derivedKeys = await deriveKeysAndSeeds(decryptionParams, password);
        log.push(`[${new Date().toISOString()}] Decryption keys derived.`);
        onProgress(50); 
        
        // 5. BaseN Decode the nonDummyString
        log.push(`[${new Date().toISOString()}] Decoding Base${baseN} emojis...`);
        const combinedData = decodeBaseN_MAGIC(nonDummyString, baseN, decryptionParams.emojiLibrary, derivedKeys.emojiSeedRealIndices);
        log.push(`[${new Date().toISOString()}] BaseN decoding complete. ${combinedData.length} bytes.`);
        onProgress(70);
        
        // 6. Split IV and Ciphertext
        const ivLength = (algorithm === 'AES-256-GCM' || algorithm === 'ChaCha20-Poly1305') ? 12 : 0;
        const iv = combinedData.slice(0, ivLength);
        const ciphertext = combinedData.slice(ivLength);
        log.push(`[${new Date().toISOString()}] Split IV (${iv.length} bytes) and Ciphertext (${ciphertext.length} bytes).`);
        onProgress(80);
        
        // 7. Decrypt Data
        log.push(`[${new Date().toISOString()}] Decrypting data...`);
        const decryptedData = await decryptData_MAGIC(ciphertext, derivedKeys.cipherKey, iv, algorithm);
        log.push(`[${new Date().toISOString()}] Decryption complete.`);
        onProgress(95);
        
        // 8. Convert back to JSON string
        const jsonStringOutput = uint8ArrayToString_MAGIC(decryptedData);
        log.push(`[${new Date().toISOString()}] Decrypted data converted to string (length ${jsonStringOutput.length}).`);
        
        // 9. Finalize
        log.push(`[${new Date().toISOString()}] --- Decryption Process Successful ---`);
        console.log(log.join('\n'));
        onProgress(100);
        return jsonStringOutput;

    } catch (error) {
        console.error("--- Decryption Process Failed ---", error);
        log.push(`[${new Date().toISOString()}] --- ERROR: ${error.message} ---`);
        log.push(`Stack: ${error.stack}`);
        console.log(log.join('\n'));
        onProgress(100);
        throw error;
    }
}
*/

/**
 * Inserts dummy emojis randomly between grapheme clusters in a base string.
 * Uses Intl.Segmenter to correctly handle multi-codepoint emojis.
 * @param {string} baseString The string to insert dummies into (e.g., BaseN output).
 * @param {number} dummyPercentage Percentage of dummy emojis relative to baseString length (0-100).
 * @param {string[]} emojiLibrary Full emoji library.
 * @param {number[]} emojiSeedDummyIndices Indices defining the dummy emoji alphabet.
 * @returns {string} The string with dummy emojis inserted.
 */
function insertDummyEmojis(baseString, dummyPercentage, emojiLibrary, emojiSeedDummyIndices) {
    // Use Intl.Segmenter to split the base string into grapheme clusters
    let graphemes = [];
    try {
        const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
        graphemes = Array.from(segmenter.segment(baseString)).map(s => s.segment);
    } catch (e) {
        console.error("Intl.Segmenter failed, falling back to simple split (may break complex emojis):", e);
        // Fallback (less reliable)
        graphemes = Array.from(baseString); 
    }

    const baseLen = graphemes.length; // Length is now based on grapheme count
    const numDummies = Math.floor(baseLen * (dummyPercentage / 100));
    console.log(`Attempting to insert ${numDummies} dummy emojis (${dummyPercentage}%) into string of ${baseLen} graphemes.`); // Debug

    if (numDummies === 0 || !emojiSeedDummyIndices || emojiSeedDummyIndices.length === 0) {
        console.log("No dummy emojis to insert or no dummy alphabet available.");
        return baseString; // Nothing to insert
    }

    // Prepare the dummy alphabet, filtering undefined
    const dummyAlphabet = emojiSeedDummyIndices.map(index => emojiLibrary[index]).filter(e => e !== undefined);
    if (dummyAlphabet.length === 0) {
        console.error("Dummy alphabet is empty after filtering undefined. Cannot insert dummies.");
        return baseString;
    }
    console.log(`Using dummy alphabet of size ${dummyAlphabet.length}`); // Debug

    // Select the dummy emojis to insert
    const dummiesToInsert = [];
    for (let i = 0; i < numDummies; i++) {
        const randomDummyIndex = Math.floor(Math.random() * dummyAlphabet.length);
        dummiesToInsert.push(dummyAlphabet[randomDummyIndex]);
    }

    // Insert dummies randomly into the graphemes array
    for (const dummy of dummiesToInsert) {
        // Choose insertion index from 0 to current graphemes.length (inclusive)
        const insertPos = Math.floor(Math.random() * (graphemes.length + 1));
        graphemes.splice(insertPos, 0, dummy);
    }

    const finalString = graphemes.join('');
    console.log(`Dummy insertion complete. Final length: ${Array.from(finalString).length} code units, ${graphemes.length} graphemes.`); // Debug
    return finalString;
}
