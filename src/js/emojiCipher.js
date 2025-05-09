const optionAlgorithmEmojiMap = {
  'AES-256-GCM': ['😄', '😆', '😅', '😂', '😍', '😝', '😵', '😭', '😩', '😫'],
  'ChaCha20-Poly1305': ['🙂', '😉', '😘', '😗', '🤔', '🙃', '🤐', '😐', '😶', '😕']
};

const optionIterationsEmojiMap = {
  'Iterations-100k': ['🌑', '🌒', '🌓'],
  'Iterations-500k': ['🌔', '🌕', '🌖'],
  'Iterations-1M': ['🌗', '🌘', '🌙'],
  'Iterations-5M': ['🌚', '🌛', '🌜'],
  'Iterations-10M': ['☀️', '🌝', '🌞'],
  'Iterations-50M': ['⭐', '🌟', '🌠']
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

const optionDummyEmojiEmojiMap = {
  'DummyEmoji-0%': ['🕛', '🕧'],
  'DummyEmoji-5%': ['🕚', '🕦'],
  'DummyEmoji-10%': ['🕐', '🕜'],
  'DummyEmoji-20%': ['🕑', '🕝'],
  'DummyEmoji-30%': ['🕒', '🕞'],
  'DummyEmoji-40%': ['🕓', '🕟'],
  'DummyEmoji-50%': ['🕔', '🕠'],
  'DummyEmoji-60%': ['🕕', '🕡'],
  'DummyEmoji-70%': ['🕖', '🕢'],
  'DummyEmoji-80%': ['🕗', '🕣'],
  'DummyEmoji-90%': ['🕘', '🕤'],
  'DummyEmoji-100%': ['🕙', '🕥']
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

// Persistent worker instance
let persistentWorker = null;
let workerReady = false;
let pendingRequests = [];
let activeLibraryKey = null;

/**
 * Initialize persistent Web Worker for emoji operations
 * @returns {Worker} The initialized worker instance
 */
function initializePersistentWorker() {
  if (persistentWorker) {
    return persistentWorker;
  }
  
  try {
    persistentWorker = new Worker('./js/emojiWorker.js');
    
    // Set up message handling
    persistentWorker.onmessage = function(e) {
      const data = e.data;
      
      // Handle progress updates
      if (data.type === 'progress') {
        // Forward progress events to main thread
        if (window.updateProgress) {
          window.updateProgress(data.task, data.progress, data.subtask, data.compressionInfo);
        }
        return;
      }
      
      // Handle completed task results
      if (data.type === 'result') {
        // Find and resolve the pending request for this task
        const index = pendingRequests.findIndex(req => req.task === data.task);
        if (index !== -1) {
          const request = pendingRequests[index];
          pendingRequests.splice(index, 1);
          
          if (data.success) {
            request.resolve(data.result);
          } else {
            request.reject(new Error(data.error || 'Unknown worker error'));
          }
        }
        return;
      }
      
      // Handle worker errors
      if (!data.success) {
        console.error('Worker error:', data.error);
        // Reject all pending requests when a critical error occurs
        pendingRequests.forEach(req => {
          req.reject(new Error(data.error || 'Worker failed'));
        });
        pendingRequests = [];
      }
    };
    
    // Handle worker errors
    persistentWorker.onerror = function(error) {
      console.error('Worker error:', error);
      workerReady = false;
      
      // Reject all pending requests
      pendingRequests.forEach(req => {
        req.reject(new Error('Worker error: ' + error.message));
      });
      pendingRequests = [];
      
      // Clean up and try to restart
      persistentWorker = null;
    };
    
    workerReady = true;
    console.log('Persistent emoji worker initialized');
    return persistentWorker;
  } catch (error) {
    console.error('Failed to initialize persistent worker:', error);
    workerReady = false;
    return null;
  }
}

/**
 * Preload emoji library in the worker to avoid repeated transfers
 * @param {string[]} emojiLibrary The emoji library to preload
 * @param {string} libraryKey A unique key to identify this library
 * @returns {Promise<Object>} Result of the preload operation
 */
async function preloadEmojiLibrary(emojiLibrary, libraryKey) {
  // Initialize worker if not already done
  if (!persistentWorker) {
    initializePersistentWorker();
  }
  
  if (!persistentWorker || !workerReady) {
    throw new Error('Cannot preload library: Worker not available');
  }
  
  // If this library is already loaded, just return
  if (activeLibraryKey === libraryKey) {
    return { libraryKey, emojiCount: emojiLibrary.length, status: 'already_loaded' };
  }
  
  // Create a new promise for this task
  return new Promise((resolve, reject) => {
    // Add this request to pending list
    pendingRequests.push({
      task: 'preloadLibrary',
      resolve,
      reject
    });
    
    // Send the library to the worker
    persistentWorker.postMessage({
      task: 'preloadLibrary',
      emojiLibrary,
      libraryKey
    });
    
    // Update active library key
    activeLibraryKey = libraryKey;
  });
}

/**
 * Send task to the persistent worker and get response
 * @param {Object} taskData Data to send to the worker
 * @param {Array} transferables Transferable objects to pass to the worker
 * @returns {Promise<any>} Response from the worker
 */
async function callPersistentWorker(taskData, transferables = []) {
  // Initialize worker if needed
  if (!persistentWorker) {
    initializePersistentWorker();
  }
  
  if (!persistentWorker || !workerReady) {
    throw new Error('Worker not available');
  }
  
  // Create a promise for this task
  return new Promise((resolve, reject) => {
    // Store this request
    pendingRequests.push({
      task: taskData.task,
      resolve,
      reject
    });
    
    // Send the task to the worker
    persistentWorker.postMessage(taskData, transferables);
  });
}

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
  const emojiDummySymbols = optionDummyEmojiEmojiMap[selectedDummyEmoji];
  const emojiIterationsSymbols = optionIterationsEmojiMap[selectedIterations];
  
  if (!emojiAlgorithmSymbols || !emojiBaseSymbols || !emojiVersionSymbols || !emojiDummySymbols || !emojiIterationsSymbols) {
       throw new Error(`Could not find symbol lists for Algorithm: ${selectedAlgorithm}, Base: ${selectedBase}, Version: ${emojiVersionKey}, DummyEmoji: ${selectedDummyEmoji}, or Iterations: ${selectedIterations}`);
  }

  const emojiAlgorithmKeySymbol = getRandomElement(emojiAlgorithmSymbols);
  const emojiBaseKeySymbol = getRandomElement(emojiBaseSymbols);
  const emojiVersionKeySymbol = getRandomElement(emojiVersionSymbols);
  const emojiDummyKeySymbol = getRandomElement(emojiDummySymbols);
  const emojiIterationsKeySymbol = getRandomElement(emojiIterationsSymbols);
  
  // Select two DIFFERENT emojis from the main loaded library for the password key part
  const [emojiPass1, emojiPass2] = getTwoDifferentRandomElements(emojiLibrary);

  // Validate that all key emojis were successfully selected
  if (!emojiAlgorithmKeySymbol || !emojiBaseKeySymbol || !emojiVersionKeySymbol || !emojiDummyKeySymbol || !emojiIterationsKeySymbol || !emojiPass1 || !emojiPass2) {
      console.error("Failed to select one or more key emojis:", {emojiAlgorithmKeySymbol, emojiBaseKeySymbol, emojiVersionKeySymbol, emojiDummyKeySymbol, emojiIterationsKeySymbol, emojiPass1, emojiPass2});
      throw new Error("Failed to randomly select all necessary key component emojis.");
  }


  // 4. Construct PBKDF2 Salt (ensure correct order and reversed password key)
  // 这里保持Pass2和Pass1的位置顺序，确保解密时可以正确提取
  const saltPBKDF2 = `${emojiAlgorithmKeySymbol}${emojiIterationsKeySymbol}${emojiBaseKeySymbol}${emojiDummyKeySymbol}${emojiVersionKeySymbol}${emojiPass2}${emojiPass1}`;

  console.log("Derived Encryption Parameters:"); // Debug log
  console.log(`  Algorithm: ${algorithm}`);
  console.log(`  Iterations: ${iterations}`);
  console.log(`  Base N: ${baseN}`);
  console.log(`  Dummy %: ${dummyPercentage}`);
  console.log(`  Emoji Version: ${emojiVersionKey} (using ${emojiLibrary.length} emojis)`);
  console.log(`  Salt (PBKDF2): ${saltPBKDF2}`);
  console.log(`    Salt Components: Algo=${emojiAlgorithmKeySymbol}, Iterations=${emojiIterationsKeySymbol}, Base=${emojiBaseKeySymbol}, Dummy=${emojiDummyKeySymbol}, Ver=${emojiVersionKeySymbol}, Pass2=${emojiPass2}, Pass1=${emojiPass1}`);


  // 5. Return all derived parameters needed for subsequent steps
  return {
    algorithm,          // e.g., 'AES-256-GCM'
    iterations,         // e.g., 100000
    baseN,              // e.g., 64
    dummyPercentage,    // e.g., 0
    emojiLibrary,       // The actual array of emojis loaded, e.g., ['#️⃣', '*️⃣', ...]
    saltPBKDF2,         // The constructed 7-emoji salt string
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
 * Finds the first index of each emoji from a list within a larger library.
 * @param {string[]} emojisToFind An array of emoji strings to find.
 * @param {string[]} emojiLibrary The library to search within.
 * @returns {number[]} An array of indices corresponding to the found emojis. Returns -1 if not found.
 */
function findEmojiIndices(emojisToFind, emojiLibrary) {
    return emojisToFind.map(emoji => emojiLibrary.indexOf(emoji));
}

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
    // 注意：此函数保留，但不再直接使用，而是通过Worker来调用
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

/**
 * Calls the Web Worker to perform intensive cryptographic operations.
 * @param {string} taskName The task to execute ('pbkdf2', 'encrypt', etc.)
 * @param {object} taskData The data needed for the task
 * @param {function(string, number)} onProgress Progress callback (task, progress)
 * @returns {Promise<any>} Promise resolving with the task result
 */
function callWorker(taskName, taskData, onProgress = () => {}) {
  return new Promise((resolve, reject) => {
    if (!window.Worker) {
      reject(new Error('Web Workers are not supported in this browser.'));
      return;
    }

    console.log(`Creating Worker for ${taskName} task...`);
    const worker = new Worker('./src/js/emojiWorker.js');

    worker.onmessage = (event) => {
      const data = event.data;
      
      // Handle progress updates
      if (data.type === 'progress') {
        // Pass any extra info such as compressionInfo to the progress handler
        onProgress(data.task, data.progress, data.subtask, data);
        return;
      }
      
      // Handle task result
      if (data.type === 'result' && data.success) {
        console.log(`Worker ${taskName} task completed successfully.`);
        resolve(data.result);
      } else if (!data.success) {
        console.error(`Worker ${taskName} task failed:`, data.error);
        reject(new Error(data.error || `Worker task ${taskName} failed`));
      }
      
      worker.terminate();
    };

    worker.onerror = (error) => {
      console.error(`Error from ${taskName} worker:`, error);
      reject(new Error(`Worker error: ${error.message}`));
      worker.terminate();
    };

    console.log(`Posting ${taskName} task to worker...`);
    
    // Prepare the message with task name and data
    const messageData = {
      task: taskName,
      ...taskData
    };
    
    // Identify transferable objects to avoid copying large buffers
    const transferables = [];
    if (taskData.dataUint8ArrayBuffer) {
      transferables.push(taskData.dataUint8ArrayBuffer);
    }
    if (taskData.plaintext) {
      transferables.push(taskData.plaintext);
    }
    if (taskData.keyMaterial) {
      transferables.push(taskData.keyMaterial);
    }
    
    // Post the message with transferables
    worker.postMessage(messageData, transferables);
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
    
    // Track overall progress across all steps
    let overallProgress = 0;
    const updateProgress = (task, progress, subtask, extraInfo) => {
        // Weight each task according to its computational cost
        const weights = {
            'setup': 5,
            'pbkdf2': 40,
            'hkdf': 10,
            'shuffle': 10,
            'encrypt': 15,
            'baseN': 10,
            'dummies': 15,  // 增加dummies任务的权重，从5%到15%
            'finalize': 5
        };
        
        // 特殊处理finalize任务，只有在真正完成时才报告100%
        if (task === 'finalize' && progress === 100) {
            // 标记整个过程完成
            overallProgress = 99; // 先设为99%，最后的返回前再设为100%
            onProgress(overallProgress);
            log.push(`[${new Date().toISOString()}] 最终处理中: ${progress}%, 整体: ${overallProgress}%`);
            return;
        }
        
        // 计算加权进度的原始逻辑
        if (task in weights) {
            // The total progress contribution of this task
            const taskWeight = weights[task];
            // The current progress of this specific task (0-100%)
            const taskCompletion = progress / 100;
            // This task's contribution to overall progress
            const taskContribution = taskWeight * taskCompletion;
            
            // Determine starting offset based on prior tasks
            let offset = 0;
            for (const [t, w] of Object.entries(weights)) {
                if (t === task) break;
                offset += w;
            }
            
            // Calculate new overall progress
            // Ensure progress doesn't exceed 99%, reserving 100% for the very end
            const newOverallProgress = Math.min(99, Math.floor(offset + taskContribution)); 
            
            // Only update if progress increased (avoid going backwards)
            if (newOverallProgress > overallProgress && overallProgress < 99) {
                overallProgress = newOverallProgress;
                onProgress(overallProgress);
                
                // Add to log if progress is significant
                if (progress % 25 === 0 || progress === 100 || newOverallProgress === 99) {
                    const subtaskInfo = subtask ? ` (${subtask})` : '';
                    log.push(`[${new Date().toISOString()}] ${task}${subtaskInfo}: ${progress}%, 整体: ${overallProgress}%`);
                }
                
                // Log compression info at various stages
                if (extraInfo && extraInfo.compressionInfo) {
                    // For the specific compression summary message from the worker
                    if (task === 'encrypt' && subtask === 'compression_summary') {
                        const info = extraInfo.compressionInfo;
                        log.push(`[${new Date().toISOString()}] ${info.message}`);
                    } 
                }
            }
        }
    };
    
    try {
        log.push(`[${new Date().toISOString()}] Input JSON string length: ${jsonStringInput.length}`);
        
        // 1. 记录输入数据大小(字节数估计)
        log.push(`[${new Date().toISOString()}] Input data approximate size: ~${jsonStringInput.length} characters.`);
        updateProgress('setup', 20);

        // 2. Setup initial parameters (load emoji lib, etc.)
        log.push(`[${new Date().toISOString()}] Setting up encryption parameters...`);
        const encryptionParams = await setupEncryption(options);
        log.push(`[${new Date().toISOString()}] Parameters set: Algorithm=${encryptionParams.algorithm}, Iterations=${encryptionParams.iterations}, BaseN=${encryptionParams.baseN}, Dummy=${encryptionParams.dummyPercentage}%, EmojiLibSize=${encryptionParams.emojiLibrary.length}, Salt=${encryptionParams.saltPBKDF2}`);
        updateProgress('setup', 100);
        
        // 3. Derive key material using PBKDF2 (in Worker)
        log.push(`[${new Date().toISOString()}] Deriving key material with PBKDF2 (iterations: ${encryptionParams.iterations})...`);
        
        // Determine password to use
        let pbkdfPassword;
        if (password && password.length > 0) {
            pbkdfPassword = password;
            log.push(`[${new Date().toISOString()}] Using user-provided password.`);
        } else {
            // 使用Pass1+Pass2作为默认密码，与解密时的密码处理保持一致
            pbkdfPassword = encryptionParams.emojiPass1 + encryptionParams.emojiPass2;
            log.push(`[${new Date().toISOString()}] Using auto-generated password: ${encryptionParams.emojiPass1}${encryptionParams.emojiPass2}`);
        }
        
        // Call worker for PBKDF2
        const keyMaterial = await callWorker('pbkdf2', {
            password: pbkdfPassword,
            saltString: encryptionParams.saltPBKDF2,
            iterations: encryptionParams.iterations
        }, updateProgress);
        
        log.push(`[${new Date().toISOString()}] PBKDF2 key derivation complete.`);
        
        // --- 调试日志：检查 keyMaterial 和 salt 是否变化 ---
        console.log("DEBUG: Salt used:", encryptionParams.saltPBKDF2);
        try {
            const keyMaterialSlice = new Uint8Array(keyMaterial.slice(0, 8)); // 获取前8字节
            const keyMaterialHex = Array.from(keyMaterialSlice).map(b => b.toString(16).padStart(2, '0')).join('');
            console.log("DEBUG: Key Material (first 8 bytes hex):", keyMaterialHex);
        } catch(e) {
            console.error("DEBUG: Error logging keyMaterial:", e);
        }
        // --- 调试日志结束 ---
        
        // 4. Derive keys and seeds (in Worker)
        log.push(`[${new Date().toISOString()}] Deriving final keys and seeds...`);
        
        // Prepare indices
        const allIndices = encryptionParams.emojiLibrary.map((_, index) => index);
        
        // Extract salt emojis and find their indices
        const saltEmojis = Array.from(encryptionParams.saltPBKDF2);
        const saltEmojiIndices = findEmojiIndices(saltEmojis, encryptionParams.emojiLibrary);
        const uniqueSaltIndices = [...new Set(saltEmojiIndices.filter(idx => idx !== -1))];
        
        // Call worker for key derivation and seed generation
        const derivedKeysAndSeeds = await callWorker('deriveKeysAndSeeds', {
            keyMaterial: keyMaterial,
            baseN: encryptionParams.baseN,
            allIndices: allIndices,
            uniqueSaltIndices: uniqueSaltIndices
        }, updateProgress);
        
        log.push(`[${new Date().toISOString()}] Keys derived. Real indices count: ${derivedKeysAndSeeds.emojiSeedRealIndices.length}, Dummy indices count: ${derivedKeysAndSeeds.emojiSeedDummyIndices.length}`);
        // --- 调试日志：查看生成的表情符号索引 --- 
        console.log("DEBUG: Derived Real Emoji Indices (first 10):", derivedKeysAndSeeds.emojiSeedRealIndices.slice(0, 10));
        // --- 调试日志结束 ---
        
        // 5. Encrypt Data (in Worker)
        log.push(`[${new Date().toISOString()}] Encrypting data...`);
        
        // Call worker for encryption
        const encryptResult = await callWorker('encrypt', {
            jsonString: jsonStringInput,
            key: derivedKeysAndSeeds.cipherKey,
            algorithmName: encryptionParams.algorithm
        }, updateProgress);
        
        // Reconstruct result from worker transferred buffers
        const iv = new Uint8Array(encryptResult.iv);
        const ciphertext = encryptResult.ciphertext;
        
        log.push(`[${new Date().toISOString()}] Encryption complete. IV: ${iv.length} bytes, Ciphertext: ${ciphertext.byteLength} bytes.`);

        // 6. Combine IV and Ciphertext
        const combinedData = new Uint8Array(iv.length + ciphertext.byteLength);
        combinedData.set(iv, 0);
        combinedData.set(new Uint8Array(ciphertext), iv.length);
        log.push(`[${new Date().toISOString()}] Combined IV + Ciphertext: ${combinedData.length} bytes.`);

        // 7-8. 使用合并的Worker调用同时处理BaseN编码和虚拟表情符号插入
        log.push(`[${new Date().toISOString()}] 将BaseN编码和虚拟表情符号处理委托给Worker处理...`);
        
        // 调用worker同时处理BaseN编码、虚拟表情符号插入和最终串接
        const finalResultWithSalt = await callWorker('combineBaseNAndDummies', {
            dataUint8ArrayBuffer: combinedData.buffer,  // 原始二进制数据
            baseN: encryptionParams.baseN,
            emojiLibrary: encryptionParams.emojiLibrary,
            emojiSeedRealIndices: derivedKeysAndSeeds.emojiSeedRealIndices,
            dummyPercentage: encryptionParams.dummyPercentage,
            emojiSeedDummyIndices: derivedKeysAndSeeds.emojiSeedDummyIndices,
            saltPBKDF2: encryptionParams.saltPBKDF2
        }, updateProgress);
        
        log.push(`[${new Date().toISOString()}] Worker完成了所有处理. 最终长度: ${finalResultWithSalt.length}`);
        
        // 准备返回结果
        const result = finalResultWithSalt;
        
        // 10. 完成 - 在真正完成时设置100%进度
        log.push(`[${new Date().toISOString()}] --- 加密过程成功完成 ---`);
        console.log(log.join('\n')); // 输出日志到控制台
        
        // 设置真正的100%完成进度（仅设置一次）
        onProgress(100);
        
        return result;

    } catch (error) {
        console.error("--- Encryption Process Failed ---", error);
        log.push(`[${new Date().toISOString()}] --- ERROR: ${error.message} ---`);
        log.push(`Stack: ${error.stack}`);
        console.log(log.join('\n')); // Print log even on error
        onProgress(100); // Indicate completion even if failed
        throw error; // Re-throw the error to be handled by the caller (e.g., UI)
    }
}

/**
 * 自动分段处理大文件
 * @param {string} inputText 要加密的内容
 * @param {number} segmentSize 每段大小(bytes)，默认5MB
 * @returns {Array} 分段数组
 */
function segmentLargeInput(inputText, segmentSize = 5 * 1024 * 1024) {
  // 检查输入大小
  const inputBytes = new TextEncoder().encode(inputText).length;
  const segments = [];
  
  // 如果小于阈值，不分段
  if (inputBytes <= segmentSize) {
    return [inputText];
  }
  
  // 为超大文件调整分段大小
  let adjustedSegmentSize = segmentSize;
  
  if (inputBytes > 80 * 1024 * 1024) {
    // 对于超大文件，使用较小的固定分段大小，确保每段不会太大
    adjustedSegmentSize = 2 * 1024 * 1024; // 固定为2MB
    console.log(`超大文件检测 (${(inputBytes/1024/1024).toFixed(2)}MB)，调整为2MB固定分段大小`);
  }
  
  // 计算分段数量
  const segmentCount = Math.ceil(inputBytes / adjustedSegmentSize);
  console.log(`输入文件大小: ${(inputBytes/1024/1024).toFixed(2)}MB，分为${segmentCount}段处理`);
  
  // 直接根据字符串长度分段，更精确和均匀
  const totalChars = inputText.length;
  const charsPerSegment = Math.ceil(totalChars / segmentCount);
  
  try {
    // 分段处理
    for (let i = 0; i < segmentCount; i++) {
      const startIndex = i * charsPerSegment;
      const endIndex = Math.min((i + 1) * charsPerSegment, totalChars);
      
      // 验证索引范围有效性
      if (startIndex >= totalChars || startIndex < 0 || endIndex > totalChars || endIndex <= startIndex) {
        throw new Error(`无效的分段索引范围: ${startIndex}-${endIndex}, 总长度: ${totalChars}`);
      }
      
      const segment = inputText.substring(startIndex, endIndex);
      segments.push(segment);
      
      console.log(`创建分段 ${i+1}/${segmentCount}, 字符范围: ${startIndex}-${endIndex}, 长度: ${segment.length}`);
    }
    
    return segments;
  } catch (error) {
    console.error(`分段处理出错:`, error);
    
    // 超大文件应急处理方案：使用固定大小切片
    if (error.message.includes("Invalid string length") || segments.length === 0) {
      console.warn("使用应急分段方案...");
      segments.length = 0; // 清空之前的分段
      
      // 使用更小的固定段大小
      const emergencyChunkSize = 1000000; // 约1MB字符长度
      for (let pos = 0; pos < totalChars; pos += emergencyChunkSize) {
        const endPos = Math.min(pos + emergencyChunkSize, totalChars);
        segments.push(inputText.substring(pos, endPos));
      }
      
      console.log(`应急分段完成，共${segments.length}段`);
    } else {
      throw error; // 其他错误重新抛出
    }
    
    return segments;
  }
}

/**
 * 加密处理（带自动分段）
 * @param {string} jsonStringInput 要加密的JSON字符串
 * @param {string} password 密码
 * @param {object} options 加密选项
 * @param {function} onProgress 进度回调
 * @returns {string} 加密后的emoji字符串
 */
async function encryptWithSegmentation(jsonStringInput, password, options, onProgress = () => {}) {
  // 1. 分段
  const segments = segmentLargeInput(jsonStringInput);
  
  // 如果只有一个段，直接加密
  if (segments.length === 1) {
    return await encrypt(jsonStringInput, password, options, onProgress);
  }
  
  // 2. 首先进行一次加密参数设置，让所有分段共享相同参数
  console.log("设置共享加密参数...");
  
  // 创建一个简化版的加密函数，它只进行实际的加密步骤而不重新生成参数
  const encryptSegmentWithSharedParams = async (segment, encryptionParams, derivedKeysAndSeeds, segmentCallback) => {
    try {
      const log = ["分段加密日志:"];
      
      // 直接使用传入的加密参数，跳过参数生成步骤
      log.push(`使用共享加密参数进行分段加密, Salt: ${encryptionParams.saltPBKDF2}`);
      
      // 5. 加密数据 (in Worker)
      log.push(`开始加密分段数据...`);
      segmentCallback(50); // 更新进度
      
      // 调用worker进行加密
      const encryptResult = await callWorker('encrypt', {
        jsonString: segment,
        key: derivedKeysAndSeeds.cipherKey,
        algorithmName: encryptionParams.algorithm
      }, (task, progress) => {
        // 映射进度到50%-80%范围
        const mappedProgress = 50 + Math.floor(progress * 0.3);
        segmentCallback(mappedProgress);
      });
      
      // 从worker传输缓冲区重构结果
      const iv = new Uint8Array(encryptResult.iv);
      const ciphertext = encryptResult.ciphertext;
      
      log.push(`分段加密完成. IV: ${iv.length} bytes, Ciphertext: ${ciphertext.byteLength} bytes.`);
      
      // 6. 合并IV和密文
      const combinedData = new Uint8Array(iv.length + ciphertext.byteLength);
      combinedData.set(iv, 0);
      combinedData.set(new Uint8Array(ciphertext), iv.length);
      log.push(`合并IV + 密文: ${combinedData.length} bytes.`);
      
      segmentCallback(80);
      
      // 7-8. 使用合并的Worker调用同时处理BaseN编码和虚拟表情符号插入
      log.push(`处理BaseN编码和虚拟表情符号插入...`);
      
      // 重要：这里传入相同的盐值，但不附加到结果中！最后一个参数设为空字符串
      const finalResultRaw = await callWorker('combineBaseNAndDummies', {
        dataUint8ArrayBuffer: combinedData.buffer,
        baseN: encryptionParams.baseN,
        emojiLibrary: encryptionParams.emojiLibrary,
        emojiSeedRealIndices: derivedKeysAndSeeds.emojiSeedRealIndices,
        dummyPercentage: encryptionParams.dummyPercentage,
        emojiSeedDummyIndices: derivedKeysAndSeeds.emojiSeedDummyIndices,
        saltPBKDF2: '' // 不附加盐值！非最后一段不需要盐值
      }, (task, progress) => {
        // 映射进度到80%-100%范围
        const mappedProgress = 80 + Math.floor(progress * 0.2);
        segmentCallback(mappedProgress);
      });
      
      log.push(`分段处理完成. 输出长度: ${finalResultRaw.length}`);
      segmentCallback(100);
      
      return finalResultRaw;
    } catch (error) {
      console.error("分段加密失败:", error);
      throw error;
    }
  };
  
  // 3. 进行一次性的参数设置
  try {
    // 更新进度到5%
    onProgress(5);
    console.log("设置全局加密参数...");
    
    // 使用第一次encrypt的开始部分逻辑来生成共享参数
    const encryptionParams = await setupEncryption(options);
    console.log("全局加密参数已设置, Salt:", encryptionParams.saltPBKDF2);
    
    // 更新进度到15%
    onProgress(15);
    
    // 确定要使用的密码
    const pbkdfPassword = (password && password.length > 0) ? 
      password : (encryptionParams.emojiPass2 + encryptionParams.emojiPass1);
    
    // 调用worker进行PBKDF2密钥派生
    const keyMaterial = await callWorker('pbkdf2', {
      password: pbkdfPassword,
      saltString: encryptionParams.saltPBKDF2,
      iterations: encryptionParams.iterations
    }, (task, progress) => {
      // 映射进度到15%-25%范围
      const mappedProgress = 15 + Math.floor(progress * 0.1);
      onProgress(mappedProgress);
    });
    
    console.log("密钥材料生成完成");
    
    // 准备索引
    const allIndices = encryptionParams.emojiLibrary.map((_, index) => index);
    
    // 提取盐值表情符号并查找它们的索引
    const saltEmojis = Array.from(encryptionParams.saltPBKDF2);
    const saltEmojiIndices = findEmojiIndices(saltEmojis, encryptionParams.emojiLibrary);
    const uniqueSaltIndices = [...new Set(saltEmojiIndices.filter(idx => idx !== -1))];
    
    // 调用worker进行密钥派生和种子生成
    const derivedKeysAndSeeds = await callWorker('deriveKeysAndSeeds', {
      keyMaterial: keyMaterial,
      baseN: encryptionParams.baseN,
      allIndices: allIndices,
      uniqueSaltIndices: uniqueSaltIndices
    }, (task, progress) => {
      // 映射进度到25%-35%范围
      const mappedProgress = 25 + Math.floor(progress * 0.1);
      onProgress(mappedProgress);
    });
    
    console.log("密钥派生和种子生成完成");
    
    // 4. 设置增量合并逻辑
    let combinedResult = '';
    
    // 分配每段的进度比例 - 分配60%给所有段(35%-95%)
    const totalSegmentsWeight = 60; // 表示总的进度比例
    let completedWeight = 0; // 已完成的进度比例
    
    // 追踪全局最高进度，避免后退
    let highestProgress = 35;
    
    // 5. 逐段加密并立即合并 - 关键改进在这里
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      // 基于段大小计算权重
      const segmentWeight = (segment.length / jsonStringInput.length) * totalSegmentsWeight;
      
      // 更新UI显示当前正在处理的段
      if (window.updateSubtitle) {
        window.updateSubtitle(`处理分段 ${i+1}/${segments.length}`);
      }
      
      console.log(`正在处理分段 ${i+1}/${segments.length}, 长度: ${segment.length}, 权重: ${segmentWeight.toFixed(2)}%`);
      
      // 创建段进度回调，将段内进度映射到总进度
      const segmentProgressCallback = (segmentProgress) => {
        // 计算当前段对总进度的贡献
        const segmentContribution = segmentWeight * (segmentProgress / 100);
        
        // 计算总进度：基础35% + 已完成段进度 + 当前段贡献
        const newProgress = Math.floor(35 + completedWeight + segmentContribution);
        
        // 只有当新进度高于之前的最高进度时才更新
        if (newProgress > highestProgress) {
          highestProgress = newProgress;
          onProgress(highestProgress);
        }
      };
      
      // 使用共享参数加密当前段
      const isLastSegment = i === segments.length - 1;
      let encryptedSegment;
      
      // 始终先不附加盐值处理段
      encryptedSegment = await encryptSegmentWithSharedParams(
        segment, encryptionParams, derivedKeysAndSeeds, segmentProgressCallback
      );
      
      // 只在最后一段上附加盐值
      if (isLastSegment) {
        // 在最后一段加密结果上手动附加盐值
        encryptedSegment += encryptionParams.saltPBKDF2;
        console.log(`最后一段处理完成，已附加盐值: ${encryptionParams.saltPBKDF2}`);
      }
      
      // 关键改进：立即将段合并到结果中，而不是存储在数组里等待最后合并
      combinedResult += encryptedSegment;
      
      // 段完成后更新已完成权重
      completedWeight += segmentWeight;
      
      // 确保段完成后进度至少达到理论值
      const theoreticalProgress = Math.floor(35 + completedWeight);
      if (theoreticalProgress > highestProgress) {
        highestProgress = theoreticalProgress;
        onProgress(highestProgress);
      }
      
      console.log(`分段 ${i+1}/${segments.length} 处理并合并完成，当前结果长度: ${combinedResult.length}`);
      
      // 如果不是最后一段，在段之间让UI有机会更新并释放一些内存
      if (!isLastSegment) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }
    
    // 6. 所有段都已处理并合并，无需额外合并步骤
    console.log(`所有分段处理完成并已合并，最终长度: ${combinedResult.length}`);
    
    // 设置完成进度(95%-100%)
    for (let p = 95; p <= 100; p++) {
      if (p > highestProgress) {
        highestProgress = p;
        onProgress(p);
        // 短暂延迟让UI有机会显示进度
        await new Promise(resolve => setTimeout(resolve, p === 100 ? 50 : 10));
      }
    }
    
    // 显示完成状态
    if (window.updateSubtitle) {
      window.updateSubtitle(`加密完成`);
    }
    
    // 返回已完成的组合结果
    return combinedResult;
    
  } catch (error) {
    console.error("分段处理失败:", error);
    throw error;
  }
}

// --- Decryption Logic (Placeholder) ---
// TODO: Implement decryption counterpart
async function decrypt(finalEmojiString, password, options, onProgress = () => {}) {
    console.log("--- Starting Decryption Process ---");
    onProgress(0);
    let log = ["Decryption Process Log:"];
    
    try {
        log.push(`[${new Date().toISOString()}] Input emoji string length: ${Array.from(finalEmojiString).length}`);
        
        // 1. 识别并提取盐值（最后7个表情符号）
        // 使用Intl.Segmenter正确处理复杂表情符号
        const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
        const segments = Array.from(segmenter.segment(finalEmojiString));
        const graphemes = segments.map(s => s.segment);
        
        console.log("输入文本中的图形簇总数:", graphemes.length);
        
        if (graphemes.length < 7) {
            throw new Error("Invalid emoji string: too short to contain salt");
        }
        
        // 提取最后7个表情符号
        const saltEmojis = graphemes.slice(-7);
        const saltPBKDF2 = saltEmojis.join('');
        console.log("提取的7个盐值表情符号:", saltEmojis);
        console.log("完整的盐值字符串:", saltPBKDF2, "长度:", saltPBKDF2.length);
        
        log.push(`[${new Date().toISOString()}] Extracted Salt: ${saltPBKDF2}`);
        // 设置10%的进度
        onProgress(10);
        
        // 2. 确定密码
        let pbkdfPassword;
        if (password && password.length > 0) {
            log.push(`[${new Date().toISOString()}] Using user-provided password.`);
            pbkdfPassword = password;
        } else {
            // 注意密码表情符号的顺序在解密时需要互换回来
            // 密钥顺序：盐值中倒数第二(Pass2)和倒数第一(Pass1)表情符号组合
            // 但是需要按照Pass1+Pass2的顺序，而不是Pass2+Pass1
            const pass1 = saltEmojis[6]; // 最后一个
            const pass2 = saltEmojis[5]; // 倒数第二个
            log.push(`[${new Date().toISOString()}] Using password from salt emojis. 从盐值中提取密码: ${pass1} + ${pass2}`);
            pbkdfPassword = pass1 + pass2; // 按照Pass1+Pass2的顺序
            console.log("解密使用的密码：", pbkdfPassword, "Pass1:", pass1, "Pass2:", pass2);
        }
        
        // 3. 加载必要的emoji库
        log.push(`[${new Date().toISOString()}] Loading emoji library for ${options.selectedEmojiVersion}...`);
        const emojiLibrary = await loadEmojiLibrary(options.selectedEmojiVersion);
        if (!emojiLibrary || emojiLibrary.length === 0) {
            throw new Error(`Failed to load emoji library for ${options.selectedEmojiVersion}`);
        }
        log.push(`[${new Date().toISOString()}] Emoji library loaded with ${emojiLibrary.length} emojis.`);
        onProgress(20);
        
        // 4. 派生密钥材料（PBKDF2）- 使用从输入提取的盐值
        const iterations = optionIterationsCountMap[options.selectedIterations];
        log.push(`[${new Date().toISOString()}] Deriving key material with PBKDF2 (iterations: ${iterations})...`);
        const keyMaterial = await callWorker('pbkdf2', {
            password: pbkdfPassword,
            saltString: saltPBKDF2, // 使用从输入提取的盐值
            iterations: iterations
        }, (task, progress) => {
            // 映射进度为整体进度的20%-30%
            const mappedProgress = 20 + Math.floor(progress * 0.1);
            onProgress(mappedProgress);
        });
        
        log.push(`[${new Date().toISOString()}] PBKDF2 key derivation complete.`);
        
        // 5. 派生密钥和种子
        log.push(`[${new Date().toISOString()}] Deriving final keys and seeds...`);
        
        // 准备索引
        const allIndices = emojiLibrary.map((_, index) => index);
        
        // 提取盐值表情符号并查找它们的索引
        const saltEmojiIndices = findEmojiIndices(saltEmojis, emojiLibrary);
        const uniqueSaltIndices = [...new Set(saltEmojiIndices.filter(idx => idx !== -1))];
        
        // 获取baseN值
        const baseN = optionBaseValueMap[options.selectedBase];
        
        // 调用worker进行密钥派生和种子生成
        const derivedKeysAndSeeds = await callWorker('deriveKeysAndSeeds', {
            keyMaterial: keyMaterial,
            baseN: baseN,
            allIndices: allIndices,
            uniqueSaltIndices: uniqueSaltIndices
        }, (task, progress) => {
            // 映射进度为整体进度的30%-40%
            const mappedProgress = 30 + Math.floor(progress * 0.1);
            onProgress(mappedProgress);
        });
        
        log.push(`[${new Date().toISOString()}] Keys derived. Real indices count: ${derivedKeysAndSeeds.emojiSeedRealIndices.length}, Dummy indices count: ${derivedKeysAndSeeds.emojiSeedDummyIndices.length}`);
        onProgress(40);
        
        // 6. 使用Worker执行实际解密过程
        log.push(`[${new Date().toISOString()}] Starting actual decryption process in worker...`);
        
        const algorithm = optionAlgorithmSelectionMap[options.selectedAlgorithm];
        
        // 解密调试日志
        console.log("解密参数详情：", {
            algorithm,
            baseN,
            realIndicesCount: derivedKeysAndSeeds.emojiSeedRealIndices.length,
            realIndicesSample: derivedKeysAndSeeds.emojiSeedRealIndices.slice(0, 5),
            emojiAlphabetSample: derivedKeysAndSeeds.emojiSeedRealIndices.slice(0, 5).map(idx => emojiLibrary[idx]),
            saltPBKDF2,
            saltLength: saltPBKDF2.length,
            saltEmojisSlice: saltEmojis.slice(0, 3), // 检查前三个表情符号
            password: pbkdfPassword
        });
        
        const decryptedJson = await callWorker('decrypt', {
            encryptedEmojiString: finalEmojiString,
            key: derivedKeysAndSeeds.cipherKey,
            algorithm: algorithm,
            baseN: baseN,
            emojiLibrary: emojiLibrary,
            realIndices: derivedKeysAndSeeds.emojiSeedRealIndices,
            saltPBKDF2: saltPBKDF2  // 确保传递正确提取的盐值
        }, (task, progress, subtask, extraInfo) => {
            // 映射进度为整体进度的40%-95%
            const mappedProgress = 40 + Math.floor(progress * 0.55);
            onProgress(mappedProgress, subtask, extraInfo);
            
            // 记录进度日志
            if (progress % 20 === 0 || subtask) {
                log.push(`[${new Date().toISOString()}] ${task} progress: ${progress}% ${subtask ? '(' + subtask + ')' : ''}`);
            }
        });
        
        log.push(`[${new Date().toISOString()}] Decryption worker process complete.`);
        onProgress(95);
        
        // 7. 解析JSON结果
        let resultObject;
        try {
            resultObject = JSON.parse(decryptedJson);
            log.push(`[${new Date().toISOString()}] Successfully parsed JSON result.`);
            console.log("解析成功的JSON结构:", Object.keys(resultObject));
        } catch (error) {
            log.push(`[${new Date().toISOString()}] ERROR: Failed to parse JSON result: ${error.message}`);
            console.error("JSON解析错误:", error, "原始JSON字符串:", decryptedJson.substring(0, 100) + "...");
            throw new Error(`Failed to parse decrypted data as JSON: ${error.message}`);
        }
        
        // 8. 转换回原始内容
        const originalContent = base64ToUnicode(resultObject.data);
        log.push(`[${new Date().toISOString()}] Converted Base64 to original Unicode text. Length: ${originalContent.length}.`);
        
        // 9. 完成解密过程
        log.push(`[${new Date().toISOString()}] --- Decryption Process Successful ---`);
        console.log(log.join('\n'));
        onProgress(100);

        // 返回一个包含原始内容和文件名的结果对象
        return {
            content: originalContent,
            filename: resultObject.filename || "decrypted.txt"
        };
    } catch (error) {
        console.error("--- Decryption Process Failed ---", error);
        log.push(`[${new Date().toISOString()}] --- ERROR: ${error.message} ---`);
        log.push(`Stack: ${error.stack}`);
        console.log(log.join('\n'));
        onProgress(100);
        throw error;
    }
}
