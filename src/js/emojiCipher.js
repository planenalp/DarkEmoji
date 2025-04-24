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

// --- ORIGINAL Helper Functions ---
// (Moved back to top-level scope)
function getRandomElement(arr) {
  if (!arr || arr.length === 0) {
    throw new Error("Cannot select random element from empty or invalid array.");
  }
  return arr[Math.floor(Math.random() * arr.length)];
}

function getTwoDistinctRandomElements(arr) {
  if (!arr || arr.length < 2) {
    throw new Error("Array must contain at least two elements to select two distinct ones.");
  }
  let index1 = Math.floor(Math.random() * arr.length);
  let index2 = Math.floor(Math.random() * arr.length);
  while (index2 === index1) {
    index2 = Math.floor(Math.random() * arr.length);
  }
  return [arr[index1], arr[index2]];
}

// --- Crypto Helper Functions ---

// REMOVED Global textEncoder/textDecoder
// const textEncoder = new TextEncoder();
// const textDecoder = new TextDecoder();

// HKDF implementation using Web Crypto API
async function hkdf(ikm, salt, info, hash, length) {
    // HKDF needs TextEncoder, pass it or define it here?
    // Assuming TextEncoder is available globally or passed if needed separately
    const localTextEncoder = new TextEncoder(); // Instantiate locally if needed by HKDF info
    const ikmKey = await window.crypto.subtle.importKey(
        'raw',
        ikm, // Input Keying Material (e.g., output of PBKDF2)
        { name: 'HKDF' },
        false, // not extractable
        ['deriveBits']
    );
    return window.crypto.subtle.deriveBits(
        {
            name: 'HKDF',
            salt: salt || new Uint8Array(), // Salt (optional, can be empty)
            info: localTextEncoder.encode(info), // Use local instance
            hash: hash // Hash algorithm (e.g., 'SHA-256')
        },
        ikmKey,
        length // Length of the derived key in bits
    );
}

// Function to generate a deterministic shuffle of indices using a key (HMAC-based PRNG)
async function deterministicShuffleIndices(key, arrayLength) {
    const localTextEncoder = new TextEncoder(); // Instantiate locally
    const indices = Array.from({ length: arrayLength }, (_, i) => i);
    const keyBytes = new Uint8Array(key); // Key should be ArrayBuffer

    // Import key for HMAC
    const hmacKey = await window.crypto.subtle.importKey(
        'raw',
        keyBytes,
        { name: 'HMAC', hash: { name: 'SHA-256' } },
        false, // not extractable
        ['sign']
    );

    // Fisher-Yates shuffle using HMAC-based PRNG
    for (let i = indices.length - 1; i > 0; i--) {
        // Generate a pseudo-random number for this iteration
        const counterBytes = localTextEncoder.encode(i.toString()); // Use local instance
        const hmacBuffer = await window.crypto.subtle.sign('HMAC', hmacKey, counterBytes);
        const hmacBytes = new Uint8Array(hmacBuffer);

        // Convert first 4 bytes of HMAC to an integer
        let randomValue = 0;
        for(let k = 0; k < 4 && k < hmacBytes.length; k++) {
             randomValue = (randomValue << 8) | hmacBytes[k];
        }
        randomValue = Math.abs(randomValue); // Ensure positive
        
        const j = randomValue % (i + 1); // Get index between 0 and i (inclusive)

        // Swap elements
        [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    return indices;
}

// --- BaseN Encoding/Decoding Helpers ---

// BigInt Feature Detection
const supportsBigInt = typeof BigInt !== 'undefined';

// Convert Uint8Array to BigInt
function bytesToBigInt(bytes) {
    if (!supportsBigInt) throw new Error('BigInt not supported, cannot perform BaseN encoding for large data.');
    let result = BigInt(0);
    for (let i = 0; i < bytes.length; i++) {
        result = (result << BigInt(8)) + BigInt(bytes[i]);
    }
    return result;
}

// Convert BigInt to BaseN digits (returns array of numbers)
function bigIntToBaseNDigits(bigIntValue, base) {
    if (!supportsBigInt) throw new Error('BigInt not supported, cannot perform BaseN encoding.');
    if (base <= 1) throw new Error('Base must be greater than 1.');
    const bigIntBase = BigInt(base);
    const digits = [];
    if (bigIntValue === BigInt(0)) {
        return [0];
    }
    let current = bigIntValue;
    while (current > 0) {
        const remainder = current % bigIntBase;
        digits.push(Number(remainder)); // Convert BigInt remainder to Number
        current = current / bigIntBase;
    }
    return digits.reverse(); // Most significant digit first
}

// Encode bytes to BaseN emoji string using the provided seed indices
function encodeBytesToBaseNEmoji(bytes, baseN, emojiLibrary, emojiSeedIndices) {
    if (bytes.length === 0) return '';
    if (emojiSeedIndices.length < baseN) {
        throw new Error(`Insufficient emojis in seed (${emojiSeedIndices.length}) for Base${baseN}`);
    }

    console.log(`BaseN Encoding: Input bytes length: ${bytes.length}, Base: ${baseN}`);
    let digits;
    try {
        const bigIntValue = bytesToBigInt(bytes);
        digits = bigIntToBaseNDigits(bigIntValue, baseN);
    } catch (e) {
        // Fallback or error for browsers without BigInt?
        // For simplicity, we'll rely on BigInt for now.
        console.error("BaseN encoding requires BigInt support.", e);
        throw e;
    }
    
    console.log(`BaseN Encoding: Number of digits: ${digits.length}`);

    // Map digits to emojis using the seed
    let emojiString = '';
    for (const digit of digits) {
        if (digit < 0 || digit >= baseN) {
             throw new Error(`Internal error: Invalid BaseN digit ${digit} for Base${baseN}`);
        }
        const emojiIndex = emojiSeedIndices[digit];
        emojiString += emojiLibrary[emojiIndex];
    }
    console.log(`BaseN Encoding: Output emoji length: ${emojiString.length}`);
    
    // Base64 padding removal is not strictly needed as we don't add '='.
    // The number of emojis naturally represents the number.

    return emojiString;
}

// --- Dummy Emoji Insertion Helper ---
function insertDummyEmojis(baseEmojiString, dummyEmojisToInsert) {
     if (!dummyEmojisToInsert || dummyEmojisToInsert.length === 0) {
         return baseEmojiString;
     }
     
     // Convert base string to array for easier insertion
     // Important: Use Array.from for proper Unicode character handling
     const baseEmojiArray = Array.from(baseEmojiString);
     const finalLength = baseEmojiArray.length + dummyEmojisToInsert.length;
     let resultEmojiArray = new Array(finalLength);
     
     let baseIndex = 0;
     let dummyIndex = 0;
     
     // Simple random insertion (can be improved with seeded PRNG if needed)
     // Distribute dummies somewhat evenly using probability
     for (let i = 0; i < finalLength; i++) {
         // Probability of inserting a dummy at this position
         const remainingDummies = dummyEmojisToInsert.length - dummyIndex;
         const remainingSlots = finalLength - i;
         const insertProb = remainingDummies / remainingSlots;

         if (Math.random() < insertProb && dummyIndex < dummyEmojisToInsert.length) {
             resultEmojiArray[i] = dummyEmojisToInsert[dummyIndex];
             dummyIndex++;
         } else if (baseIndex < baseEmojiArray.length) {
             resultEmojiArray[i] = baseEmojiArray[baseIndex];
             baseIndex++;
         } else if (dummyIndex < dummyEmojisToInsert.length) {
             // Should only happen if probability logic is slightly off at the end
             // Fill remaining slots with dummies if base emojis run out first
             resultEmojiArray[i] = dummyEmojisToInsert[dummyIndex];
             dummyIndex++;
         } else {
             // Should not happen, but as a fallback
             console.warn("Unexpected state during dummy emoji insertion");
             // Potentially throw error or break
         }
     }
     
     return resultEmojiArray.join('');
}

// Main encryption function - FINAL STEPS
async function encryptData(options, inputData, userPassword) { // inputData: {filename, data?}|{filename, rawText?}
  // --- ADD Crypto API Check ---
  if (!window.crypto || !window.crypto.subtle) {
      throw new Error("Web Crypto API (crypto.subtle) is not available. Ensure the page is served over HTTPS or via localhost.");
  }
  // --- END Check ---

  // Define helpers and encoder/decoder INSIDE the function scope
  const textEncoder = new TextEncoder();
  const textDecoder = new TextDecoder();

  // --- Unicode Safe Base64 Helpers (Moved Inside) ---
  function unicodeToBase64(str) {
      try {
          const uint8Array = textEncoder.encode(str);
          let binaryString = '';
          uint8Array.forEach(byte => {
              binaryString += String.fromCharCode(byte);
          });
          return btoa(binaryString);
      } catch (error) {
          console.error("Error encoding Unicode to Base64:", error);
          throw new Error('Failed to encode content to Base64.'); 
      }
  }

  function base64ToUnicode(base64) {
      try {
          const binaryString = atob(base64);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
              bytes[i] = binaryString.charCodeAt(i);
          }
          return textDecoder.decode(bytes);
      } catch (error) {
          console.error("Error decoding Base64 to Unicode:", error);
          throw new Error('Failed to decode Base64 content.');
      }
  }

  const log = []; // Array to store log messages
  const startTime = performance.now();
  log.push(`Encryption started at ${new Date().toISOString()}`);
  
  try {
    // 1. Extract and map options
    const selectedAlgorithm = optionAlgorithmSelectionMap[options.algorithm];
    const iterations = optionIterationsCountMap[options.iterations];
    const baseN = optionBaseValueMap[options.base];
    const dummyPercentage = optionDummyEmojPercentageMap[options.dummyEmoji];
    const emojiVersion = options.emojiVersion;
    log.push(`Options: Algorithm=${selectedAlgorithm}, Iterations=${iterations}, Base=${baseN}, Dummy=${dummyPercentage}%, EmojiVer=${emojiVersion}`);

    if (!selectedAlgorithm || iterations === undefined || baseN === undefined || dummyPercentage === undefined || !emojiVersion) {
      throw new Error("Invalid options provided for encryption.");
    }

    // 1b. Prepare Data to Encrypt (JSON Structure)
    log.push("Preparing data for encryption...");
    let filename = "content.txt"; // Default filename
    let dataBase64;
    if (inputData.rawText) {
        filename = inputData.filename || filename;
        log.push(`Input type: Raw text, filename: ${filename}`);
        dataBase64 = unicodeToBase64(inputData.rawText); // Uses inner helper now
    } else if (inputData.data) {
        filename = inputData.filename || filename;
        log.push(`Input type: Cached file data (already Base64), filename: ${filename}`);
        dataBase64 = inputData.data; // Already Base64
    } else {
        throw new Error("No input data (rawText or data) provided.");
    }
    const dataToEncrypt = JSON.stringify({ filename: filename, data: dataBase64 });
    const dataToEncryptBytes = textEncoder.encode(dataToEncrypt); // Uses inner encoder
    log.push(`Data prepared. JSON size: ${dataToEncryptBytes.length} bytes.`);

    // 2. Load Emoji Library
    log.push(`Loading emoji library: ${emojiVersion}...`);
    const emojiFilePath = `assets/emoji/${emojiVersion}.json`;
    const response = await fetch(emojiFilePath);
    if (!response.ok) {
        throw new Error(`Failed to load emoji library: ${emojiFilePath} - ${response.statusText}`);
    }
    const emojiLibrary = await response.json();
    log.push(`Emoji library loaded. Count: ${emojiLibrary.length}`);

    if (!Array.isArray(emojiLibrary) || emojiLibrary.length === 0) {
         throw new Error(`Invalid or empty emoji library loaded from ${emojiFilePath}`);
    }
    if (emojiLibrary.length < baseN) {
        log.push(`Warning: Emoji library has ${emojiLibrary.length} emojis, less than required Base${baseN}.`);
    }
     if (emojiLibrary.length < 2) {
        throw new Error(`Emoji library must contain at least 2 emojis for password key generation.`);
     }

    // 3. Generate Random Keys/Emojis
    log.push("Generating random components (password key emojis, version/base/algo keys)...");
    const [emojiPass1, emojiPass2] = getTwoDistinctRandomElements(emojiLibrary);
    const emojiPasswordKeyArr = [emojiPass1, emojiPass2];
    const emojiPasswordKeyString = emojiPasswordKeyArr.join('');

    const emojiVersionKey = getRandomElement(optionEmojiVersionEmojiMap[emojiVersion]);
    const emojiBaseKey = getRandomElement(optionBaseEmojiMap[options.base]);
    const emojiAlgorithmKey = getRandomElement(optionAlgorithmEmojiMap[options.algorithm]);
    log.push(` - Password Key Emojis: ${emojiPasswordKeyArr.join('')}`);
    log.push(` - Version Key Emoji: ${emojiVersionKey}`);
    log.push(` - Base Key Emoji: ${emojiBaseKey}`);
    log.push(` - Algorithm Key Emoji: ${emojiAlgorithmKey}`);

    // 4. Generate saltPBKDF2
    const saltPBKDF2String = `${emojiAlgorithmKey}${emojiBaseKey}${emojiVersionKey}${emojiPasswordKeyArr[1]}${emojiPasswordKeyArr[0]}`;
    const saltPBKDF2Bytes = textEncoder.encode(saltPBKDF2String); // Uses inner encoder
    log.push(`PBKDF2 Salt Generated: ${saltPBKDF2String} (${saltPBKDF2Bytes.length} bytes)`);

    // 5. Determine Password for PBKDF2
    const passwordToUse = userPassword ? userPassword : emojiPasswordKeyString;
    const passwordBytes = textEncoder.encode(passwordToUse); // Uses inner encoder
    log.push(`Password source: ${userPassword ? 'User Input' : 'Generated Emoji Key'}`);
    
    // 6. Derive Master Key (keyMaterial) using PBKDF2
    log.push(`Deriving master key (PBKDF2, ${iterations} iterations)...`);
    const pbkdf2StartTime = performance.now();
    const pbkdf2ImportedKey = await window.crypto.subtle.importKey(
        'raw',
        passwordBytes,
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey'] 
    );
    const keyMaterial = await window.crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt: saltPBKDF2Bytes,
            iterations: iterations,
            hash: 'SHA-256'
        },
        pbkdf2ImportedKey,
        256 // Derive 256 bits
    );
    const pbkdf2EndTime = performance.now();
    log.push(`PBKDF2 Key Material Derived (${(pbkdf2EndTime - pbkdf2StartTime).toFixed(2)} ms).`);

    // 7. Derive Sub-keys using HKDF
    log.push("Deriving sub-keys (HKDF-SHA256)...");
    const keyLengthBits = 256;
    const cipherKey = await hkdf(keyMaterial, null, "cipherKey", 'SHA-256', keyLengthBits);
    const emojiKeyRealBytes = await hkdf(keyMaterial, null, "emojiKeyReal", 'SHA-256', keyLengthBits);
    const emojiKeyDummyBytes = await hkdf(keyMaterial, null, "emojiKeyDummy", 'SHA-256', keyLengthBits);
    const authKey = await hkdf(keyMaterial, null, "authKey", 'SHA-256', keyLengthBits);
    log.push(`HKDF Sub-keys Derived (cipherKey, emojiKeyReal, emojiKeyDummy, authKey).`);

    // 8. Generate Deterministic Emoji Seeds (Indices)
    log.push("Generating deterministic emoji seeds...");
    // 8a. emojiSeedReal
    const shuffledIndices = await deterministicShuffleIndices(emojiKeyRealBytes, emojiLibrary.length);
    const emojiSeedRealIndices = shuffledIndices.slice(0, baseN);
    log.push(`Generated emojiSeedReal: ${emojiSeedRealIndices.length} indices for Base${baseN}.`);
    // 8b. emojiSeedDummy
    const forbiddenEmojis = new Set([
        ...optionAlgorithmEmojiMap[options.algorithm],
        ...optionBaseEmojiMap[options.base],
        ...optionEmojiVersionEmojiMap[emojiVersion],
        ...Array.from(saltPBKDF2String)
    ]);
    emojiSeedRealIndices.forEach(index => forbiddenEmojis.add(emojiLibrary[index]));
    const availableDummyIndices = [];
    for (let i = 0; i < emojiLibrary.length; i++) {
        if (!forbiddenEmojis.has(emojiLibrary[i])) {
            availableDummyIndices.push(i);
        }
    }
    const shuffledDummyIndicesRaw = await deterministicShuffleIndices(emojiKeyDummyBytes, availableDummyIndices.length);
    const finalEmojiSeedDummyIndices = shuffledDummyIndicesRaw.map(i => availableDummyIndices[i]);
    log.push(`Generated emojiSeedDummy: ${finalEmojiSeedDummyIndices.length} potential indices.`);
    
    // 9. Perform Actual Encryption
    log.push(`Performing encryption (${selectedAlgorithm})...`);
    const ivLengthBytes = 12; // Standard for AES-GCM and ChaCha20-Poly1305
    const iv = window.crypto.getRandomValues(new Uint8Array(ivLengthBytes));
    log.push(`Generated IV: ${iv.length} bytes`);
    
    const importedCipherKey = await window.crypto.subtle.importKey(
        'raw',
        cipherKey,
        selectedAlgorithm === 'AES-256-GCM' ? 'AES-GCM' : 'ChaCha20-Poly1305', // Algorithm name for importKey
        false,
        ['encrypt']
    );
    
    let algorithmParams;
    if (selectedAlgorithm === 'AES-256-GCM') {
        algorithmParams = { name: 'AES-GCM', iv: iv };
    } else if (selectedAlgorithm === 'ChaCha20-Poly1305') {
        algorithmParams = { name: 'ChaCha20-Poly1305', iv: iv }; // 'iv' is used for nonce here
    } else {
        throw new Error(`Unsupported encryption algorithm: ${selectedAlgorithm}`);
    }

    const ciphertextBuffer = await window.crypto.subtle.encrypt(
        algorithmParams,
        importedCipherKey,
        dataToEncryptBytes
    );
    log.push(`Encryption complete. Ciphertext size: ${ciphertextBuffer.byteLength} bytes.`);

    // 10. Combine IV + Ciphertext for Encoding
    const ivAndCiphertextBytes = new Uint8Array(iv.length + ciphertextBuffer.byteLength);
    ivAndCiphertextBytes.set(iv, 0);
    ivAndCiphertextBytes.set(new Uint8Array(ciphertextBuffer), iv.length);
    log.push(`Combined IV + Ciphertext: ${ivAndCiphertextBytes.length} bytes.`);

    // 11. BaseN Encode the Combined Bytes
    log.push(`Encoding bytes to Base${baseN} emojis...`);
    const emojiOutputBaseN = encodeBytesToBaseNEmoji(
        ivAndCiphertextBytes,
        baseN,
        emojiLibrary,
        emojiSeedRealIndices
    );
    log.push(`BaseN encoding complete. Output length: ${emojiOutputBaseN.length} emojis.`);

    // 12. Append Salt
    const emojiOutputWithSalt = emojiOutputBaseN + saltPBKDF2String;
    log.push(`Appended salt. Current length: ${emojiOutputWithSalt.length} emojis.`);

    // 13. Calculate and Insert Dummy Emojis
    if (dummyPercentage > 0 && finalEmojiSeedDummyIndices.length > 0) {
        const baseLength = Array.from(emojiOutputWithSalt).length; // Use Array.from for correct length
        // Formula derived from: finalLength = baseLength + numDummies; dummyPercentage = (numDummies / finalLength) * 100
        const numDummies = Math.floor(baseLength * dummyPercentage / (100 - dummyPercentage));
        log.push(`Calculated dummy emojis needed: ${numDummies} (for ${dummyPercentage}%)`);
        
        if (numDummies > 0) {
             // Ensure we don't try to pick more dummies than available
             const numAvailableDummies = finalEmojiSeedDummyIndices.length;
             const actualNumDummies = Math.min(numDummies, numAvailableDummies);
             if (actualNumDummies < numDummies) {
                 log.push(`Warning: Only ${actualNumDummies} unique dummy emojis available, requested ${numDummies}.`);
             }
             
             const dummyIndicesToInsert = finalEmojiSeedDummyIndices.slice(0, actualNumDummies);
             const dummyEmojisToInsert = dummyIndicesToInsert.map(i => emojiLibrary[i]);
             log.push(`Selected ${actualNumDummies} dummy emojis to insert.`);
             
             const finalOutputString = insertDummyEmojis(emojiOutputWithSalt, dummyEmojisToInsert);
             log.push(`Dummy emojis inserted. Final output length: ${Array.from(finalOutputString).length} emojis.`);
             const endTime = performance.now();
             log.push(`Encryption finished in ${(endTime - startTime).toFixed(2)} ms.`);
             console.log("--- Encryption Log ---");
             console.log(log.join("\n"));
             console.log("----------------------");
             return finalOutputString;
         } else {
             log.push("Calculated 0 dummy emojis to insert.");
         }
    }
     else {
         log.push("Dummy percentage is 0 or no dummy emojis available. Skipping insertion.");
     }

    // Return string without dummies if percentage was 0 or none were inserted
    const finalOutputString = emojiOutputWithSalt;
    const endTime = performance.now();
    log.push(`Encryption finished in ${(endTime - startTime).toFixed(2)} ms.`);
    console.log("--- Encryption Log ---");
    console.log(log.join("\n"));
    console.log("----------------------");
    return finalOutputString;

  } catch (error) {
    const endTime = performance.now();
    log.push(`ERROR during encryption: ${error.message}`);
    log.push(`Encryption failed after ${(endTime - startTime).toFixed(2)} ms.`);
    console.error("Encryption process failed:", error);
    console.log("--- Encryption Log (Error) ---");
    console.log(log.join("\n"));
    console.log("----------------------------");
    throw error; // Re-throw for handling in index.js
  }
}

// ... rest of the file (example usage, exports) ...
