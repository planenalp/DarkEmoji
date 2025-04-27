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
            'encrypt': 15, // Adjusted weight to include compression
            // 'compress': 10, // Removed separate weight, handled within encrypt
            'baseN': 10,
            'dummies': 5,  // Adjusted weight
            'finalize': 5
        };
        
        // Calculate weighted progress
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
            // Ensure progress doesn't exceed 100%, accounting for potential rounding issues
            const newOverallProgress = Math.min(100, Math.floor(offset + taskContribution)); 
            
            // Only update if progress increased (avoid going backwards)
            // Also ensure we don't log beyond 100%
            if (newOverallProgress > overallProgress && overallProgress < 100) {
                overallProgress = newOverallProgress;
                onProgress(overallProgress);
                
                // Add to log if progress is significant
                if (progress % 25 === 0 || progress === 100 || newOverallProgress === 100) {
                    const subtaskInfo = subtask ? ` (${subtask})` : '';
                    log.push(`[${new Date().toISOString()}] ${task}${subtaskInfo}: ${progress}%, Overall: ${overallProgress}%`);
                }
                
                // Log compression info at various stages
                if (extraInfo && extraInfo.compressionInfo) {
                    // For the specific compression summary message from the worker
                    if (task === 'encrypt' && subtask === 'compression_summary') {
                        const info = extraInfo.compressionInfo;
                        log.push(`[${new Date().toISOString()}] ${info.message}`);
                    } 
                    // We don't need the other 'compress' specific logs here anymore, 
                    // as they are implicitly part of the 'encrypt' task progress.
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
        const pbkdfPassword = (password && password.length > 0) ? password : (encryptionParams.emojiPass1 + encryptionParams.emojiPass2);
        
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

        // 7. BaseN Encode (Using Web Worker)
        log.push(`[${new Date().toISOString()}] Sending data to Base${encryptionParams.baseN} encoding worker...`);
        
        // Call worker for BaseN encoding
        const emojiOutputBaseN = await callWorker('baseN', {
            dataUint8ArrayBuffer: combinedData.buffer,
            baseN: encryptionParams.baseN,
            emojiLibrary: encryptionParams.emojiLibrary,
            emojiSeedRealIndices: derivedKeysAndSeeds.emojiSeedRealIndices
        }, updateProgress);
        
        log.push(`[${new Date().toISOString()}] Received BaseN encoded result from worker. Length: ${emojiOutputBaseN.length} emojis.`);

        // 8. 移动到Worker中: 插入虚拟表情符号
        log.push(`[${new Date().toISOString()}] 将虚拟表情符号插入委托给Worker处理 (${encryptionParams.dummyPercentage}%)...`);
        
        // 调用worker处理虚拟表情符号插入和最终串接
        const finalResultWithSalt = await callWorker('insertDummiesAndFinalize', {
            baseNString: emojiOutputBaseN,
            dummyPercentage: encryptionParams.dummyPercentage,
            emojiLibrary: encryptionParams.emojiLibrary,
            emojiSeedDummyIndices: derivedKeysAndSeeds.emojiSeedDummyIndices,
            saltPBKDF2: encryptionParams.saltPBKDF2
        }, updateProgress);
        
        log.push(`[${new Date().toISOString()}] Worker完成了虚拟表情符号插入和最终拼接. 最终长度: ${finalResultWithSalt.length}`);
        
        // 确保报告100%完成
        updateProgress('finalize', 100);

        // 10. 完成
        log.push(`[${new Date().toISOString()}] --- 加密过程成功完成 ---`);
        console.log(log.join('\n')); // 输出日志到控制台
        
        return finalResultWithSalt;

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
