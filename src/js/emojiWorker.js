// Worker script for handling intensive cryptographic operations
// This includes BaseN encoding, PBKDF2 key derivation, and other CPU-intensive tasks

// Convert a Uint8Array to a string using TextDecoder
function uint8ArrayToString(uint8Array) {
  return new TextDecoder().decode(uint8Array);
}

// Convert a string to a Uint8Array using TextEncoder
function stringToUint8Array(str) {
  return new TextEncoder().encode(str);
}

/**
 * 使用GZIP压缩数据
 * @param {Uint8Array} data 要压缩的数据
 * @returns {Promise<Uint8Array>} 压缩后的数据
 */
async function compressWithGzip(data) {
  try {
    const cs = new CompressionStream('gzip');
    const writer = cs.writable.getWriter();
    writer.write(data);
    writer.close();
    
    const output = [];
    const reader = cs.readable.getReader();
    
    let totalLength = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      output.push(value);
      totalLength += value.length;
    }
    
    // 合并所有块
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of output) {
      result.set(chunk, offset);
      offset += chunk.length;
    }
    
    return result;
  } catch (error) {
    console.error('GZIP压缩失败:', error);
    throw error;
  }
}

/**
 * 使用Deflate压缩数据
 * @param {Uint8Array} data 要压缩的数据
 * @returns {Promise<Uint8Array>} 压缩后的数据
 */
async function compressWithDeflate(data) {
  try {
    const cs = new CompressionStream('deflate');
    const writer = cs.writable.getWriter();
    writer.write(data);
    writer.close();
    
    const output = [];
    const reader = cs.readable.getReader();
    
    let totalLength = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      output.push(value);
      totalLength += value.length;
    }
    
    // 合并所有块
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of output) {
      result.set(chunk, offset);
      offset += chunk.length;
    }
    
    return result;
  } catch (error) {
    console.error('Deflate压缩失败:', error);
    throw error;
  }
}

/**
 * 自动选择最佳压缩算法并压缩数据
 * @param {Uint8Array} data 要压缩的数据
 * @returns {Promise<{compressedData: Uint8Array, algorithm: string, compressionRatio: number}>} 压缩结果
 */
async function compressData(data) {
  try {
    self.postMessage({ type: 'progress', task: 'compress', progress: 0, subtask: 'starting' });
    
    // 报告原始大小
    const originalSize = data.length;
    self.postMessage({ 
      type: 'progress', 
      task: 'compress', 
      progress: 5, 
      subtask: 'preparing',
      compressionInfo: {
        originalSize: originalSize,
        message: `Preparing to compress ${originalSize} bytes of data`
      }
    });
    
    // 并行执行两种压缩方法
    self.postMessage({ type: 'progress', task: 'compress', progress: 10, subtask: 'comparing' });
    const [gzipData, deflateData] = await Promise.all([
      compressWithGzip(data),
      compressWithDeflate(data)
    ]);
    
    self.postMessage({ type: 'progress', task: 'compress', progress: 70, subtask: 'selecting' });
    
    // 计算压缩率
    const gzipSize = gzipData.length;
    const deflateSize = deflateData.length;
    
    const gzipRatio = (1 - gzipSize / originalSize) * 100;
    const deflateRatio = (1 - deflateSize / originalSize) * 100;
    
    // 报告两种算法的比较结果
    self.postMessage({ 
      type: 'progress', 
      task: 'compress', 
      progress: 80, 
      subtask: 'comparing_results',
      compressionInfo: {
        gzip: {
          size: gzipSize,
          ratio: gzipRatio.toFixed(2)
        },
        deflate: {
          size: deflateSize,
          ratio: deflateRatio.toFixed(2)
        }
      }
    });
    
    let result;
    let algorithm;
    let compressionRatio;
    
    // 选择压缩效果更好的算法
    if (gzipSize <= deflateSize) {
      result = gzipData;
      algorithm = 'gzip';
      compressionRatio = gzipRatio;
    } else {
      result = deflateData;
      algorithm = 'deflate';
      compressionRatio = deflateRatio;
    }
    
    // 最终报告选择的算法和压缩率
    self.postMessage({ 
      type: 'progress', 
      task: 'compress', 
      progress: 100, 
      subtask: 'complete',
      compressionInfo: {
        algorithm: algorithm,
        originalSize: originalSize,
        compressedSize: result.length,
        compressionRatio: compressionRatio.toFixed(2),
        message: `Compression complete: ${algorithm} reduced data by ${compressionRatio.toFixed(2)}% (${originalSize} → ${result.length} bytes)`
      }
    });
    
    return {
      compressedData: result,
      algorithm,
      compressionRatio
    };
  } catch (error) {
    console.error('压缩失败:', error);
    // 如果压缩失败，返回原始数据
    return {
      compressedData: data,
      algorithm: 'none',
      compressionRatio: 0
    };
  }
}

/**
 * BaseN encode function - Converts bytes to emoji string using selected base
 * @param {Uint8Array} bytes Input bytes to encode
 * @param {number} base Base to use (64, 128, 256, 512, etc.)
 * @param {string[]} alphabet Array of emoji characters to use as the encoding alphabet
 * @returns {string} The encoded emoji string
 */
function baseNEncode(bytes, base, alphabet) {
  if (!bytes || !bytes.length) {
    return '';
  }

  if (!alphabet || alphabet.length < base) {
    throw new Error(`Alphabet must contain at least ${base} unique emojis for Base${base} encoding`);
  }

  // 计算每个字符需要的位数
  const bitsPerChar = Math.log2(base);
  if (!Number.isInteger(bitsPerChar)) {
    throw new Error(`Base ${base} is not a power of 2. All bases must be powers of 2.`);
  }

  // 不同基数有不同的处理效率
  // 这里我们展示理论上的效率：
  // Base64: 每3字节 → 4字符 (6位/字符)
  // Base128: 每7字节 → 8字符 (7位/字符)
  // Base256: 每8字节 → 8字符 (8位/字符) - 1:1
  // Base512: 每9字节 → 8字符 (9位/字符)
  // Base1024: 每10字节 → 8字符 (10位/字符)
  // Base2048: 每11字节 → 8字符 (11位/字符)
  // Base4096: 每12字节 → 8字符 (12位/字符)
  // Base8192: 每13字节 → 8字符 (13位/字符)

  const CHUNK_SIZE = 1024; // 每次处理1KB
  const totalChunks = Math.ceil(bytes.length / CHUNK_SIZE);
  let result = '';
  
  // 位级别的处理
  let bitBuffer = 0;   // 存储当前的位
  let bitCount = 0;    // 当前缓冲区中的位数
  
  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
    // 报告进度
    const progress = Math.floor((chunkIndex / totalChunks) * 100);
    self.postMessage({ type: 'progress', task: 'baseN', progress });
    
    const chunkStart = chunkIndex * CHUNK_SIZE;
    const chunkEnd = Math.min(chunkStart + CHUNK_SIZE, bytes.length);
    
    // 一次性处理所有字节在这个块中
    for (let i = chunkStart; i < chunkEnd; i++) {
      const byte = bytes[i];
      
      // 将每个字节添加到位缓冲区
      bitBuffer = (bitBuffer << 8) | byte;
      bitCount += 8;
      
      // 当我们有足够的位生成一个或多个字符时
      while (bitCount >= bitsPerChar) {
        // 提取最高的bitsPerChar位
        const bits = bitCount - bitsPerChar;
        const index = (bitBuffer >> bits) & ((1 << bitsPerChar) - 1);
        result += alphabet[index];
        
        // 移除已使用的位
        bitBuffer = bitBuffer & ((1 << bits) - 1);
        bitCount = bits;
      }
    }
  }
  
  // 处理剩余的位（如果有）
  if (bitCount > 0) {
    // 左移以对齐
    const padding = bitsPerChar - bitCount;
    const index = (bitBuffer << padding) & ((1 << bitsPerChar) - 1);
    result += alphabet[index];
  }
  
  // 最终的进度更新
  self.postMessage({ type: 'progress', task: 'baseN', progress: 100 });
  return result;
}

/**
 * Derives a key using PBKDF2 with progress reporting
 * @param {string} password The password string
 * @param {string} saltString The salt string
 * @param {number} iterations The number of iterations
 * @returns {Promise<ArrayBuffer>} The derived key material
 */
async function deriveKeyPBKDF2(password, saltString, iterations) {
  const passwordBuffer = stringToUint8Array(password);
  const saltBuffer = stringToUint8Array(saltString);
  
  try {
    // Import the password as a key
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );
    
    // 模拟进度更新，但实际上PBKDF2无法分块执行
    // 发送25%, 50%, 75%的进度指示
    self.postMessage({ type: 'progress', task: 'pbkdf2', progress: 25 });
    setTimeout(() => {
      self.postMessage({ type: 'progress', task: 'pbkdf2', progress: 50 });
    }, 100);
    setTimeout(() => {
      self.postMessage({ type: 'progress', task: 'pbkdf2', progress: 75 });
    }, 200);
    
    // 正确执行单一的PBKDF2操作，一次性完成所有迭代
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: saltBuffer,
        iterations: iterations,
        hash: 'SHA-256'
      },
      keyMaterial,
      256 // 256 bits
    );
    
    // Final progress update
    self.postMessage({ type: 'progress', task: 'pbkdf2', progress: 100 });
    return derivedBits;
  } catch (error) {
    throw new Error(`PBKDF2 key derivation failed: ${error.message}`);
  }
}

/**
 * HKDF-Expand function for key derivation
 * @param {ArrayBuffer} ikm Input key material
 * @param {string} info Context info
 * @param {number} length Desired output length in bytes
 * @returns {Promise<ArrayBuffer>} The derived key
 */
async function hkdfExpand(ikm, info, length) {
  const infoBuffer = stringToUint8Array(info);
  const hashLen = 32; // SHA-256 output length
  const iterations = Math.ceil(length / hashLen);
  
  if (iterations > 255) {
    throw new Error("HKDF length too long, requires too many iterations.");
  }

  const okm = new Uint8Array(iterations * hashLen);
  let t = new Uint8Array(0);
  
  const hmacKey = await crypto.subtle.importKey(
    'raw',
    ikm,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  for (let i = 1; i <= iterations; i++) {
    const T_prev = t;
    const cBuffer = new Uint8Array([i]);

    const inputBuffer = new Uint8Array(T_prev.length + infoBuffer.length + cBuffer.length);
    inputBuffer.set(T_prev, 0);
    inputBuffer.set(infoBuffer, T_prev.length);
    inputBuffer.set(cBuffer, T_prev.length + infoBuffer.length);

    t = new Uint8Array(await crypto.subtle.sign('HMAC', hmacKey, inputBuffer));
    okm.set(t, (i - 1) * hashLen);
    
    // Report progress
    const progress = Math.floor((i / iterations) * 100);
    self.postMessage({ type: 'progress', task: 'hkdf', progress });
  }

  return okm.buffer.slice(0, length);
}

/**
 * Generates pseudo-random bytes
 * @param {ArrayBuffer} seed The seed material
 * @param {number} numBytes Bytes to generate
 * @returns {Promise<Uint8Array>} Generated random bytes
 */
async function generatePseudoRandomBytes(seed, numBytes) {
  const hmacKey = await crypto.subtle.importKey(
    'raw', 
    seed, 
    { name: 'HMAC', hash: 'SHA-256' }, 
    false, 
    ['sign']
  );
  
  const hashLen = 32;
  const numBlocks = Math.ceil(numBytes / hashLen);
  const output = new Uint8Array(numBlocks * hashLen);
  let currentData = new Uint8Array(0);

  for (let i = 0; i < numBlocks; i++) {
    const counter = new Uint8Array(4);
    new DataView(counter.buffer).setUint32(0, i, false);
    
    const input = new Uint8Array(currentData.length + counter.length);
    input.set(currentData, 0);
    input.set(counter, currentData.length);

    currentData = new Uint8Array(await crypto.subtle.sign('HMAC', hmacKey, input));
    output.set(currentData, i * hashLen);
    
    // Report progress
    const progress = Math.floor((i / numBlocks) * 100);
    self.postMessage({ type: 'progress', task: 'prng', progress });
  }

  return output.slice(0, numBytes);
}

/**
 * Deterministic array shuffle
 * @param {ArrayBuffer} seed The seed for randomness
 * @param {number[]} indices Array to shuffle
 * @returns {Promise<number[]>} Shuffled array
 */
async function seededShuffleIndices(seed, indices) {
  const n = indices.length;
  if (n <= 1) return indices.slice();

  const shuffledIndices = indices.slice();
  const bytesNeeded = (n - 1) * 4;
  const randomBytes = await generatePseudoRandomBytes(seed, bytesNeeded);
  const randomDataView = new DataView(randomBytes.buffer);

  for (let i = n - 1; i > 0; i--) {
    const randomUint32 = randomDataView.getUint32((n - 1 - i) * 4, false);
    const j = Math.floor((randomUint32 / (0xFFFFFFFF + 1)) * (i + 1));
    [shuffledIndices[i], shuffledIndices[j]] = [shuffledIndices[j], shuffledIndices[i]];
    
    // Report progress every 5% of operations
    if (i % Math.max(1, Math.floor(n * 0.05)) === 0) {
      const progress = Math.floor(((n - i) / n) * 100);
      self.postMessage({ type: 'progress', task: 'shuffle', progress });
    }
  }
  
  self.postMessage({ type: 'progress', task: 'shuffle', progress: 100 });
  return shuffledIndices;
}

/**
 * Encrypts data using Web Crypto
 * @param {Uint8Array} plaintext Data to encrypt
 * @param {ArrayBuffer} key Encryption key
 * @param {string} algorithmName Algorithm to use
 * @returns {Promise<{iv: Uint8Array, ciphertext: ArrayBuffer}>} Encrypted data
 */
async function encryptData(plaintext, key, algorithmName) {
  let ivLength;
  let cryptoAlgorithm;

  if (algorithmName === 'AES-256-GCM') {
    ivLength = 12;
    cryptoAlgorithm = { name: 'AES-GCM' };
  } else if (algorithmName === 'ChaCha20-Poly1305') {
    ivLength = 12;
    cryptoAlgorithm = { name: 'ChaCha20-Poly1305' };
  } else {
    throw new Error(`Unsupported encryption algorithm: ${algorithmName}`);
  }

  const iv = crypto.getRandomValues(new Uint8Array(ivLength));
  
  try {
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      key,
      cryptoAlgorithm.name,
      false,
      ['encrypt']
    );
    
    // For large plaintexts, report progress as we process
    self.postMessage({ type: 'progress', task: 'encrypt', progress: 50 });
    
    const ciphertext = await crypto.subtle.encrypt(
      { name: cryptoAlgorithm.name, iv: iv },
      cryptoKey,
      plaintext
    );
    
    self.postMessage({ type: 'progress', task: 'encrypt', progress: 100 });
    return { iv, ciphertext };
  } catch (error) {
    throw new Error(`Encryption failed: ${error.message}`);
  }
}

/**
 * 在基本字符串中以分块方式插入虚拟表情符号
 * 使用分块处理以避免阻塞
 * @param {string} baseString 基本字符串
 * @param {number} dummyPercentage 虚拟表情符号比例 (0-100%)
 * @param {string[]} emojiLibrary 表情符号库
 * @param {number[]} dummyIndices 虚拟表情符号索引
 * @returns {string} 插入虚拟表情符号后的字符串
 */
function insertDummiesInChunks(baseString, dummyPercentage, emojiLibrary, dummyIndices) {
  // 1. 准备分块处理 - 将字符串分成片段
  const CHUNK_SIZE = 1000; // 每次处理1000个表情符号
  let graphemeClusters = [];
  
  // 使用更高效的方式处理字符串分割
  try {
    // 报告开始分析表情符号
    self.postMessage({ type: 'progress', task: 'dummies', progress: 5, subtask: 'segmenting' });
    
    // 使用分块方式构建graphemes数组，避免一次性处理过大的字符串
    let currentIndex = 0;
    const stringLength = baseString.length;
    const totalChunks = Math.ceil(stringLength / CHUNK_SIZE);
    
    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      // 计算当前块的范围
      const chunkStart = chunkIndex * CHUNK_SIZE;
      const chunkEnd = Math.min(chunkStart + CHUNK_SIZE, stringLength);
      const currentChunk = baseString.substring(chunkStart, chunkEnd);
      
      // 对当前块使用Segmenter处理
      const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
      const segmentsIterator = segmenter.segment(currentChunk);
      const segments = Array.from(segmentsIterator).map(s => s.segment);
      
      // 将处理结果添加到总数组
      graphemeClusters = graphemeClusters.concat(segments);
      
      // 报告分析进度
      const progress = Math.floor(((chunkIndex + 1) / totalChunks) * 25) + 5;
      self.postMessage({ type: 'progress', task: 'dummies', progress, subtask: 'segmenting' });
    }
  } catch (e) {
    // 回退到简单的分割方法
    self.postMessage({ type: 'progress', task: 'dummies', progress: 10, subtask: 'fallback' });
    console.warn("Worker: Intl.Segmenter failed, using fallback split method:", e);
    
    // 按字符分割，分块处理
    const totalLength = baseString.length;
    for (let i = 0; i < totalLength; i += CHUNK_SIZE) {
      const chunk = baseString.substring(i, Math.min(i + CHUNK_SIZE, totalLength));
      const segments = Array.from(chunk);
      graphemeClusters = graphemeClusters.concat(segments);
      
      // 报告进度
      const progress = Math.floor((i / totalLength) * 25) + 5;
      self.postMessage({ type: 'progress', task: 'dummies', progress, subtask: 'fallback' });
    }
  }
  
  // 报告分割完成
  self.postMessage({ type: 'progress', task: 'dummies', progress: 30, subtask: 'preparing' });
  
  // 2. 计算需要插入的虚拟表情符号数量
  const baseLen = graphemeClusters.length;
  const numDummies = Math.floor(baseLen * (dummyPercentage / 100));
  
  if (numDummies === 0 || !dummyIndices || dummyIndices.length === 0) {
    // 没有虚拟表情符号需要插入
    self.postMessage({ type: 'progress', task: 'dummies', progress: 100 });
    return baseString;
  }
  
  // 3. 准备虚拟表情符号字母表
  // 筛选出有效的虚拟表情符号
  const dummyAlphabet = dummyIndices
    .map(index => index >= 0 && index < emojiLibrary.length ? emojiLibrary[index] : null)
    .filter(emoji => emoji !== null && emoji !== undefined);
  
  if (dummyAlphabet.length === 0) {
    // 没有有效的虚拟表情符号
    self.postMessage({ type: 'progress', task: 'dummies', progress: 100 });
    return baseString;
  }
  
  // 4. 选择要插入的虚拟表情符号
  self.postMessage({ type: 'progress', task: 'dummies', progress: 40, subtask: 'selecting' });
  
  const dummiesToInsert = [];
  for (let i = 0; i < numDummies; i++) {
    const randomDummyIndex = Math.floor(Math.random() * dummyAlphabet.length);
    dummiesToInsert.push(dummyAlphabet[randomDummyIndex]);
    
    // 定期报告进度
    if (i % Math.max(1, Math.floor(numDummies / 20)) === 0) {
      const progress = Math.floor((i / numDummies) * 20) + 40;
      self.postMessage({ type: 'progress', task: 'dummies', progress, subtask: 'selecting' });
    }
  }
  
  // 5. 分块进行插入操作
  self.postMessage({ type: 'progress', task: 'dummies', progress: 60, subtask: 'inserting' });
  
  // 将虚拟表情符号分成多个批次以分块处理
  const INSERTION_BATCH_SIZE = Math.max(1, Math.ceil(numDummies / 10));
  const insertionBatches = [];
  
  for (let i = 0; i < numDummies; i += INSERTION_BATCH_SIZE) {
    const batchEnd = Math.min(i + INSERTION_BATCH_SIZE, numDummies);
    insertionBatches.push(dummiesToInsert.slice(i, batchEnd));
  }
  
  // 分批插入虚拟表情符号
  for (let batchIndex = 0; batchIndex < insertionBatches.length; batchIndex++) {
    const currentBatch = insertionBatches[batchIndex];
    
    for (const dummy of currentBatch) {
      // 为每个虚拟表情符号选择随机插入位置
      const insertPos = Math.floor(Math.random() * (graphemeClusters.length + 1));
      graphemeClusters.splice(insertPos, 0, dummy);
    }
    
    // 报告插入进度
    const progress = Math.floor((batchIndex / insertionBatches.length) * 30) + 60;
    self.postMessage({ type: 'progress', task: 'dummies', progress, subtask: 'inserting' });
  }
  
  // 6. 高效地连接结果
  self.postMessage({ type: 'progress', task: 'dummies', progress: 90, subtask: 'joining' });
  
  // 分块拼接最终字符串，避免一次性操作过大字符串
  let finalString = '';
  const totalGraphemes = graphemeClusters.length;
  const joinChunks = Math.ceil(totalGraphemes / CHUNK_SIZE);
  
  for (let i = 0; i < joinChunks; i++) {
    const startIdx = i * CHUNK_SIZE;
    const endIdx = Math.min(startIdx + CHUNK_SIZE, totalGraphemes);
    finalString += graphemeClusters.slice(startIdx, endIdx).join('');
    
    // 报告连接进度
    const progress = 90 + Math.floor((i / joinChunks) * 10);
    self.postMessage({ type: 'progress', task: 'dummies', progress, subtask: 'joining' });
  }
  
  self.postMessage({ type: 'progress', task: 'dummies', progress: 100 });
  return finalString;
}

/**
 * 处理表情符号字符串的最终组装
 * 包括插入虚拟表情符号和添加salt
 * @param {string} baseNString BaseN编码后的表情符号字符串
 * @param {number} dummyPercentage 虚拟表情符号百分比
 * @param {string[]} emojiLibrary 表情符号库
 * @param {number[]} dummyIndices 虚拟表情符号索引
 * @param {string} saltPBKDF2 加密用的salt
 * @returns {string} 最终的加密表情符号字符串
 */
async function finalizeEmojiString(baseNString, dummyPercentage, emojiLibrary, dummyIndices, saltPBKDF2) {
  // 1. 插入虚拟表情符号
  self.postMessage({ type: 'progress', task: 'dummies', progress: 0, subtask: 'start' });
  const withDummies = insertDummiesInChunks(baseNString, dummyPercentage, emojiLibrary, dummyIndices);
  
  // 2. 添加salt
  self.postMessage({ type: 'progress', task: 'finalize', progress: 0 });
  const finalString = withDummies + saltPBKDF2;
  
  // 报告完成
  self.postMessage({ type: 'progress', task: 'finalize', progress: 100 });
  return finalString;
}

/**
 * Process messages from the main thread
 */
self.onmessage = async function(e) {
  try {
    const data = e.data;
    
    // Handle BaseN encoding task
    if (data.task === 'baseN') {
      // Get data from the message
      const bytes = new Uint8Array(data.dataUint8ArrayBuffer);
      const baseN = data.baseN;
      const emojiLibrary = data.emojiLibrary;
      const emojiIndices = data.emojiSeedRealIndices;
      
      // Select the emoji alphabet based on indices
      const emojiAlphabet = emojiIndices.map(index => emojiLibrary[index]);
      
      // Perform the encoding
      const result = baseNEncode(bytes, baseN, emojiAlphabet);
      
      // Return the result to the main thread
      self.postMessage({ success: true, result, type: 'result', task: 'baseN' });
    }
    
    // Handle PBKDF2 key derivation task
    else if (data.task === 'pbkdf2') {
      const { password, saltString, iterations } = data;
      
      self.postMessage({ type: 'progress', task: 'pbkdf2', progress: 0 });
      const keyMaterial = await deriveKeyPBKDF2(password, saltString, iterations);
      
      self.postMessage({ 
        success: true, 
        result: keyMaterial, 
        type: 'result', 
        task: 'pbkdf2' 
      }, [keyMaterial]);
    }
    
    // Handle encryption task
    else if (data.task === 'encrypt') {
      const { jsonString, key, algorithmName } = data;
      
      self.postMessage({ type: 'progress', task: 'encrypt', progress: 0 });
      
      // 1. 在Worker内部将JSON字符串转换为Uint8Array
      self.postMessage({ type: 'progress', task: 'encrypt', progress: 10, subtask: 'converting' });
      const plaintextUint8Array = stringToUint8Array(jsonString);
      
      // 2. 压缩数据
      self.postMessage({ type: 'progress', task: 'encrypt', progress: 20, subtask: 'compressing' });
      const compressionResult = await compressData(plaintextUint8Array);
      
      // 记录压缩信息
      const compressionInfo = {
        algorithm: compressionResult.algorithm,
        originalSize: plaintextUint8Array.length,
        compressedSize: compressionResult.compressedData.length,
        compressionRatio: compressionResult.compressionRatio.toFixed(2)
      };
      
      // 详细的压缩总结
      self.postMessage({ 
        type: 'progress', 
        task: 'encrypt', 
        progress: 40, 
        subtask: 'compression_summary',
        compressionInfo: {
          algorithm: compressionInfo.algorithm,
          originalSize: compressionInfo.originalSize,
          compressedSize: compressionInfo.compressedSize,
          compressionRatio: compressionInfo.compressionRatio,
          message: `Compression summary: ${compressionInfo.algorithm} compression reduced data by ${compressionInfo.compressionRatio}% (${compressionInfo.originalSize} → ${compressionInfo.compressedSize} bytes)`
        }
      });
      
      // 3. 对压缩后的数据进行加密
      self.postMessage({ 
        type: 'progress', 
        task: 'encrypt', 
        progress: 50, 
        subtask: 'encrypting',
        compressionInfo: compressionInfo
      });
      
      const result = await encryptData(
        compressionResult.compressedData, 
        key, 
        algorithmName
      );
      
      // 4. 向主线程返回结果，包括压缩信息
      self.postMessage({ 
        success: true, 
        result: {
          iv: result.iv.buffer,
          ciphertext: result.ciphertext,
          compressionInfo: compressionInfo
        }, 
        type: 'result', 
        task: 'encrypt' 
      }, [result.iv.buffer, result.ciphertext]);
    }
    
    // Handle key derivation and seeds task
    else if (data.task === 'deriveKeysAndSeeds') {
      const { 
        keyMaterial, 
        info,
        allIndices,
        uniqueSaltIndices
      } = data;
      
      // HKDF for cipher key
      self.postMessage({ type: 'progress', task: 'hkdf', progress: 0, subtask: 'cipher' });
      const cipherKey = await hkdfExpand(keyMaterial, "cipherKey", 32);
      
      // HKDF for real emoji key
      self.postMessage({ type: 'progress', task: 'hkdf', progress: 0, subtask: 'real' });
      const emojiKeyReal = await hkdfExpand(keyMaterial, "emojiKeyReal", 32);
      
      // HKDF for dummy emoji key
      self.postMessage({ type: 'progress', task: 'hkdf', progress: 0, subtask: 'dummy' });
      const emojiKeyDummy = await hkdfExpand(keyMaterial, "emojiKeyDummy", 32);
      
      // HKDF for auth key
      self.postMessage({ type: 'progress', task: 'hkdf', progress: 0, subtask: 'auth' });
      const authKey = await hkdfExpand(keyMaterial, "authKey", 32);
      
      // Shuffle indices for real emojis
      self.postMessage({ type: 'progress', task: 'shuffle', progress: 0, subtask: 'real' });
      const shuffledRealIndices = await seededShuffleIndices(emojiKeyReal, allIndices);
      
      // Shuffle indices for dummy emojis
      self.postMessage({ type: 'progress', task: 'shuffle', progress: 0, subtask: 'dummy' });
      const realIndicesSet = new Set(shuffledRealIndices.slice(0, data.baseN));
      const saltIndicesSet = new Set(uniqueSaltIndices);
      
      const availableDummyIndices = allIndices.filter(index => 
        !realIndicesSet.has(index) && 
        !saltIndicesSet.has(index)
      );
      
      const shuffledDummyIndices = await seededShuffleIndices(emojiKeyDummy, availableDummyIndices);
      
      // Return all results
      self.postMessage({
        success: true,
        type: 'result',
        task: 'deriveKeysAndSeeds',
        result: {
          cipherKey: cipherKey,
          authKey: authKey,
          emojiSeedRealIndices: shuffledRealIndices.slice(0, data.baseN),
          emojiSeedDummyIndices: shuffledDummyIndices
        }
      }, [cipherKey, authKey]);
    }
    
    // Handle virtual emoji insertion and final assembly task
    else if (data.task === 'insertDummiesAndFinalize') {
      const {
        baseNString,
        dummyPercentage,
        emojiLibrary,
        emojiSeedDummyIndices,
        saltPBKDF2
      } = data;
      
      const finalString = await finalizeEmojiString(
        baseNString,
        dummyPercentage,
        emojiLibrary,
        emojiSeedDummyIndices,
        saltPBKDF2
      );
      
      self.postMessage({
        success: true,
        type: 'result',
        task: 'insertDummiesAndFinalize',
        result: finalString
      });
    }
    
    // Handle unknown task
    else {
      throw new Error(`Unknown task type: ${data.task}`);
    }
  } catch (error) {
    self.postMessage({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
}; 