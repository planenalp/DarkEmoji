// Worker script for handling intensive cryptographic operations
// This includes BaseN encoding, PBKDF2 key derivation, and other CPU-intensive tasks

// 用于存储预加载的表情符号库的全局变量
let cachedEmojiLibraries = {};
let currentEmojiLibrary = null;

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
 * BaseN decode function - Converts emoji string back to bytes
 * @param {string} emojiString Input emoji string to decode
 * @param {number} base Base to use (64, 128, 256, 512, etc.)
 * @param {string[]} alphabet Array of emoji characters used as the encoding alphabet
 * @returns {Uint8Array} The decoded bytes
 */
function baseNDecode(emojiString, base, alphabet) {
  if (!emojiString || !emojiString.length) {
    return new Uint8Array(0);
  }

  if (!alphabet || alphabet.length < base) {
    throw new Error(`Alphabet must contain at least ${base} unique emojis for Base${base} decoding`);
  }

  // 计算每个字符需要的位数
  const bitsPerChar = Math.log2(base);
  if (!Number.isInteger(bitsPerChar)) {
    throw new Error(`Base ${base} is not a power of 2. All bases must be powers of 2.`);
  }

  // 创建索引映射以优化查找（从表情符号到索引值）
  const indexMap = new Map();
  for (let i = 0; i < alphabet.length; i++) {
    indexMap.set(alphabet[i], i);
  }

  // 记录字母表前几个表情符号用于调试
  console.log(`字母表前5个表情符号:`, alphabet.slice(0, 5));

  // 分块处理以优化性能，并使用Segmenter确保正确处理图形簇
  const CHUNK_SIZE = 1024; // 每次处理1KB文本
  const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
  const segments = Array.from(segmenter.segment(emojiString));
  const emojis = segments.map(s => s.segment);
  
  console.log(`使用BaseN解码，输入${emojis.length}个表情符号，使用基数${base}`);
  
  // 只保留有效的表情符号（即那些在字母表中找到的）
  const validEmojis = [];
  const invalidEmojis = [];
  for (const emoji of emojis) {
    if (indexMap.has(emoji)) {
      validEmojis.push(emoji);
    } else {
      invalidEmojis.push(emoji);
    }
  }
  
  if (invalidEmojis.length > 0) {
    console.warn(`在解码过程中发现${invalidEmojis.length}个无效表情符号，这些将被忽略。示例:`, invalidEmojis.slice(0, 5));
  }
  
  console.log(`过滤后剩余${validEmojis.length}个有效表情符号`);
  
  const totalChunks = Math.ceil(validEmojis.length / CHUNK_SIZE);
  
  // 估算输出大小
  // 我们知道每个字符编码 bitsPerChar 位数据
  // 对于 Base64, 每 4 个字符产生 3 个字节 (4 * 6 = 24 bits = 3 bytes)
  const estimatedOutputSize = Math.ceil((validEmojis.length * bitsPerChar) / 8);
  const result = new Uint8Array(estimatedOutputSize);
  
  let bitBuffer = 0;
  let bitCount = 0;
  let byteIndex = 0;
  
  // 分块处理每个表情符号
  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
    // 报告进度
    const progress = Math.floor((chunkIndex / totalChunks) * 100);
    self.postMessage({ type: 'progress', task: 'baseNDecode', progress });
    
    const chunkStart = chunkIndex * CHUNK_SIZE;
    const chunkEnd = Math.min(chunkStart + CHUNK_SIZE, validEmojis.length);
    
    for (let i = chunkStart; i < chunkEnd; i++) {
      const emoji = validEmojis[i];
      const value = indexMap.get(emoji);
      
      // 这个检查现在理论上是多余的，因为我们已经过滤了无效表情符号
      if (value === undefined) {
        console.error(`意外错误: 找不到表情符号"${emoji}"的索引，这不应该发生`);
        continue; // 跳过这个无效表情符号，继续处理其他的
      }
      
      // 将字符值添加到位缓冲区
      bitBuffer = (bitBuffer << bitsPerChar) | value;
      bitCount += bitsPerChar;
      
      // 当我们有足够的位提取一个或多个字节时
      while (bitCount >= 8) {
        const bits = bitCount - 8;
        const byteValue = (bitBuffer >> bits) & 0xFF;
        
        if (byteIndex < result.length) {
          result[byteIndex++] = byteValue;
        }
        
        // 移除已使用的位
        bitBuffer = bitBuffer & ((1 << bits) - 1);
        bitCount = bits;
      }
    }
  }
  
  // 我们可能已经分配了比实际需要更多的内存
  // 如果实际使用的字节数少于预先分配的，创建一个新的缓冲区
  
  // --- 修正开始 ---
  // 目标：修正当编码器添加的填充位恰好形成一个或多个额外完整字节时，解码器多输出字节的问题。
  // 这个问题在 Base2048 (11位/字符) 对 76字节 (608位) 数据编码时出现：
  // 编码产生 56 个字符，代表 56 * 11 = 616 位。
  // 解码器目前会输出 616 / 8 = 77 字节。而原始数据是 76 字节。
  // 这额外的 1 字节 (0x00) 来自于编码器添加的 8 个填充0位。
  const totalBitsFromEmojis = validEmojis.length * bitsPerChar;
  
  // 只有当每个字符的位数不是8的公因数，并且解码后的总位数是8的整数倍时，才可能发生此问题
  if (bitsPerChar % 8 !== 0 && totalBitsFromEmojis % 8 === 0 && byteIndex > 0) {
    // 计算不包含最后一个emoji字符时，数据最少需要多少字节
    // (validEmojis.length - 1) 个 emoji 至少贡献 (validEmojis.length - 1) * bitsPerChar 比特
    // 最后一个 emoji 至少贡献 1 个有效数据比特 (其余可能是填充)
    // 所以，原始数据至少有 (validEmojis.length - 1) * bitsPerChar + 1 比特
    const minimumOriginalBits = (validEmojis.length > 0) ? ((validEmojis.length - 1) * bitsPerChar) + 1 : 0;
    const expectedOriginalBytes = Math.ceil(minimumOriginalBits / 8);

    if (byteIndex > expectedOriginalBytes) {
      // 如果当前解码出的字节数 byteIndex (即 floor(totalBitsFromEmojis / 8))
      // 大于基于"除最后一个emoji外的所有emoji + 最后一个emoji至少1个有效位"计算出的期望原始字节数
      // 并且 totalBitsFromEmojis 恰好是 byteIndex * 8 (即没有不完整的尾部字节)
      // 这表明 byteIndex 可能因为包含了纯填充字节而过大。
      // 我们将 byteIndex 减少到 expectedOriginalBytes，这更可能是真实的数据长度。
      console.warn(`BaseN解码器修正：byteIndex 从 ${byteIndex} 修正为 ${expectedOriginalBytes} 以尝试移除纯填充字节。 Base=${base}, Emojis=${validEmojis.length}`);
      byteIndex = expectedOriginalBytes;
    }
  }
  // --- 修正结束 ---
  
  if (byteIndex < result.length) {
    const finalResult = new Uint8Array(byteIndex);
    finalResult.set(result.subarray(0, byteIndex));
    return finalResult;
  }
  
  // 最终的进度更新
  self.postMessage({ type: 'progress', task: 'baseNDecode', progress: 100 });
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
 * 根据输入字符串大小计算最佳块大小
 * @param {number} inputLength 输入字符串的长度
 * @returns {{chunkSize: number, joinChunkSize: number}} 最佳处理块大小和拼接块大小
 */
function calculateOptimalChunkSizes(inputLength) {
  // 基础大小值（小文件使用的最小值）
  const BASE_CHUNK_SIZE = 5000;
  const BASE_JOIN_CHUNK_SIZE = 10000;
  
  // 大文件的最大块大小
  const MAX_CHUNK_SIZE = 50000;
  const MAX_JOIN_CHUNK_SIZE = 100000;
  
  // 根据输入大小动态计算（使用对数增长来平滑过渡）
  // 小于100KB使用基础大小
  // 大于2MB使用最大大小
  // 中间值则平滑过渡
  
  if (inputLength <= 100000) {  // 100KB
    return {
      chunkSize: BASE_CHUNK_SIZE,
      joinChunkSize: BASE_JOIN_CHUNK_SIZE
    };
  } 
  else if (inputLength >= 2000000) {  // 2MB
    return {
      chunkSize: MAX_CHUNK_SIZE,
      joinChunkSize: MAX_JOIN_CHUNK_SIZE
    };
  }
  else {
    // 在基础大小和最大大小之间平滑过渡
    // 计算完成度：0表示100KB，1表示2MB
    const progressFactor = (inputLength - 100000) / (2000000 - 100000);
    
    // 使用平方根函数使过渡更加平滑（先快后慢）
    const scaleFactor = Math.sqrt(progressFactor);
    
    // 计算动态块大小
    const chunkSize = Math.floor(BASE_CHUNK_SIZE + scaleFactor * (MAX_CHUNK_SIZE - BASE_CHUNK_SIZE));
    const joinChunkSize = Math.floor(BASE_JOIN_CHUNK_SIZE + scaleFactor * (MAX_JOIN_CHUNK_SIZE - BASE_JOIN_CHUNK_SIZE));
    
    return { chunkSize, joinChunkSize };
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
  // 立即检查dummyPercentage，如果为0则提前返回原字符串
  if (dummyPercentage === 0) {
    console.log("DummyEmoji百分比为0，直接返回原字符串");
    return baseString;
  }
  
  // 根据输入大小动态计算最佳块大小
  const { chunkSize, joinChunkSize } = calculateOptimalChunkSizes(baseString.length);
  
  // 记录使用的块大小（用于调试）
  console.log(`Dynamic chunk sizes: processing=${chunkSize}, joining=${joinChunkSize} for input length ${baseString.length}`);
  
  // 1. 准备分块处理 - 将字符串分成片段
  const CHUNK_SIZE = chunkSize; // 动态处理块大小
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
      
      // 恢复每次都报告进度
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
      
      // 恢复每次都报告进度
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
    
    // 恢复更频繁的进度报告
    if (i % Math.max(1, Math.floor(numDummies / 20)) === 0) {
      const progress = Math.floor((i / numDummies) * 20) + 40;
      self.postMessage({ type: 'progress', task: 'dummies', progress, subtask: 'selecting' });
    }
  }
  
  // 5. 分块进行插入操作
  self.postMessage({ type: 'progress', task: 'dummies', progress: 60, subtask: 'inserting' });
  
  // 优化：不再使用splice()直接插入，而是先生成所有插入位置，然后一次性构建新数组
  // 这样可以避免频繁的数组重组操作，大幅提高性能
  
  // 1. 先生成所有虚拟表情的插入位置
  const insertPositions = [];
  for (let i = 0; i < dummiesToInsert.length; i++) {
    // 为每个虚拟表情符号选择随机插入位置
    // 注意：每次插入后实际位置会变化，这里暂时不考虑，后面会调整
    const insertPos = Math.floor(Math.random() * (graphemeClusters.length + 1));
    insertPositions.push({
      position: insertPos,
      emoji: dummiesToInsert[i]
    });
  }
  
  // 报告生成插入位置的进度
  self.postMessage({ type: 'progress', task: 'dummies', progress: 65, subtask: 'positions_generated' });
  
  // 2. 对插入位置按位置升序排序，以便一次遍历即可构建结果
  insertPositions.sort((a, b) => a.position - b.position);
  
  self.postMessage({ type: 'progress', task: 'dummies', progress: 70, subtask: 'positions_sorted' });
  
  // 3. 构建包含虚拟表情符号的新数组，一次遍历完成所有插入
  const resultWithDummies = [];
  let positionIndex = 0; // 当前处理的插入位置索引
  let insertedCount = 0; // 已插入的虚拟表情符号数量
  
  // 分段处理以保持UI响应
  const SEGMENT_SIZE = 100000; // 每次处理10万个元素
  const totalElements = graphemeClusters.length;
  const segments = Math.ceil(totalElements / SEGMENT_SIZE);
  
  for (let s = 0; s < segments; s++) {
    const startIdx = s * SEGMENT_SIZE;
    const endIdx = Math.min((s + 1) * SEGMENT_SIZE, totalElements);
    
    // 处理当前段
    for (let i = startIdx; i < endIdx; i++) {
      // 插入当前位置之前的所有虚拟表情
      while (positionIndex < insertPositions.length && insertPositions[positionIndex].position <= i) {
        resultWithDummies.push(insertPositions[positionIndex].emoji);
        positionIndex++;
        insertedCount++;
      }
      
      // 添加原始表情
      resultWithDummies.push(graphemeClusters[i]);
    }
    
    // 报告进度
    const segmentProgress = Math.floor((s + 1) / segments * 20) + 70;
    self.postMessage({ 
      type: 'progress', 
      task: 'dummies', 
      progress: segmentProgress, 
      subtask: 'constructing_array' 
    });
  }
  
  // 处理剩余的待插入虚拟表情（位置在数组最后）
  while (positionIndex < insertPositions.length) {
    resultWithDummies.push(insertPositions[positionIndex].emoji);
    positionIndex++;
    insertedCount++;
  }
  
  // 验证是否所有虚拟表情都已插入
  if (insertedCount !== dummiesToInsert.length) {
    console.warn(`虚拟表情符号插入数量不匹配：期望${dummiesToInsert.length}，实际${insertedCount}`);
  }
  
  // 使用优化后的数组替换原数组
  graphemeClusters = resultWithDummies;
  
  self.postMessage({ type: 'progress', task: 'dummies', progress: 90, subtask: 'array_constructed' });
  
  // 6. 高效地连接结果
  self.postMessage({ type: 'progress', task: 'dummies', progress: 90, subtask: 'joining' });
  
  // 使用动态计算的拼接块大小
  const JOIN_CHUNK_SIZE = joinChunkSize;
  let finalString = '';
  const totalGraphemes = graphemeClusters.length;
  const joinChunks = Math.ceil(totalGraphemes / JOIN_CHUNK_SIZE);
  
  for (let i = 0; i < joinChunks; i++) {
    const startIdx = i * JOIN_CHUNK_SIZE;
    const endIdx = Math.min(startIdx + JOIN_CHUNK_SIZE, totalGraphemes);
    finalString += graphemeClusters.slice(startIdx, endIdx).join('');
    
    // 每块都报告进度
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
  let withDummies;
  
  // 检查DummyEmoji百分比是否为0，如果是则完全跳过虚拟表情符号处理
  if (dummyPercentage === 0) {
    // 直接使用原始字符串，不插入虚拟表情符号
    self.postMessage({ type: 'progress', task: 'dummies', progress: 0, subtask: 'skipping' });
    self.postMessage({ type: 'progress', task: 'dummies', progress: 100, subtask: 'skipped' });
    console.log("DummyEmoji百分比为0，跳过虚拟表情符号处理");
    withDummies = baseNString;
  } else {
    // 正常处理：插入虚拟表情符号
    self.postMessage({ type: 'progress', task: 'dummies', progress: 0, subtask: 'start' });
    withDummies = insertDummiesInChunks(baseNString, dummyPercentage, emojiLibrary, dummyIndices);
  }
  
  // 2. 添加salt
  self.postMessage({ type: 'progress', task: 'finalize', progress: 0 });
  const finalString = withDummies + saltPBKDF2;
  
  // 报告完成
  self.postMessage({ type: 'progress', task: 'finalize', progress: 100 });
  return finalString;
}

/**
 * 将BaseN编码和虚拟表情符号插入合并在一起处理
 * 避免大型字符串在主线程和Worker之间传输
 * @param {Uint8Array} bytes 需要编码的字节数据
 * @param {number} baseN 基数
 * @param {string[]} emojiLibrary 完整表情符号库
 * @param {number[]} realIndices BaseN编码使用的表情符号索引
 * @param {number} dummyPercentage 虚拟表情符号比例
 * @param {number[]} dummyIndices 虚拟表情符号索引
 * @param {string} saltPBKDF2 加密用的salt
 * @returns {string} 最终的加密表情符号字符串
 */
async function combineBaseNAndDummies(bytes, baseN, emojiLibrary, realIndices, dummyPercentage, dummyIndices, saltPBKDF2) {
  try {
    // 1. 首先进行BaseN编码
    self.postMessage({ type: 'progress', task: 'baseN', progress: 0 });
    
    // 选择表情符号字母表
    const emojiAlphabet = realIndices.map(index => emojiLibrary[index]);
    
    // 执行BaseN编码
    const baseNString = baseNEncode(bytes, baseN, emojiAlphabet);
    
    self.postMessage({ type: 'progress', task: 'baseN', progress: 100 });
    self.postMessage({ 
      type: 'progress', 
      task: 'dummies', 
      progress: 0, 
      subtask: 'starting',
      info: { baseNLength: baseNString.length }
    });
    
    // 2. 处理虚拟表情符号插入
    // 如果虚拟表情符号百分比为0，跳过处理
    let withDummies;
    if (dummyPercentage === 0) {
      console.log("DummyEmoji百分比为0，跳过虚拟表情符号处理");
      self.postMessage({ type: 'progress', task: 'dummies', progress: 0, subtask: 'skipping' });
      self.postMessage({ type: 'progress', task: 'dummies', progress: 100, subtask: 'skipped' });
      withDummies = baseNString;
    } else {
      // 正常处理虚拟表情符号插入
      withDummies = insertDummiesInChunks(baseNString, dummyPercentage, emojiLibrary, dummyIndices);
    }
    
    // 3. 添加salt
    self.postMessage({ type: 'progress', task: 'finalize', progress: 0 });
    const finalString = withDummies + saltPBKDF2;
    
    // 进度完成
    self.postMessage({ type: 'progress', task: 'finalize', progress: 100 });
    
    return finalString;
  } catch (error) {
    console.error("合并处理BaseN和DummyEmoji失败:", error);
    throw error;
  }
}

/**
 * 合并分段加密结果
 * @param {string[]} segments 多个加密段的结果数组
 * @param {string} separator 分段分隔符
 * @returns {string} 合并后的结果
 */
async function mergeCombinedResults(segments, separator) {
  // 每次合并20个段就报告一次进度
  const reportInterval = Math.max(1, Math.floor(segments.length / 20));
  
  // 采用分批合并的方法，避免一次性处理过大字符串
  let result = '';
  const batchSize = 10; // 每批10个段
  
  // 计算总段数以便报告进度
  const totalSegments = segments.length;
  
  for (let i = 0; i < segments.length; i += batchSize) {
    // 获取当前批次
    const currentBatch = segments.slice(i, Math.min(i + batchSize, segments.length));
    
    // 当前批次内直接使用分隔符连接
    const batchResult = currentBatch.join(separator);
    
    // 将当前批次结果添加到最终结果
    if (result === '') {
      result = batchResult;
    } else {
      result += separator + batchResult;
    }
    
    // 报告进度
    if (i % reportInterval === 0 || i + batchSize >= segments.length) {
      const progress = Math.min(100, Math.floor((i + batchSize) / totalSegments * 100));
      self.postMessage({ 
        type: 'progress', 
        task: 'merge', 
        progress,
        subtask: 'combining'
      });
      
      // 让UI有机会更新，避免worker阻塞
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }
  
  self.postMessage({ type: 'progress', task: 'merge', progress: 100 });
  return result;
}

/**
 * 直接合并分段加密结果，不使用分隔符
 * @param {string[]} segments 多个加密段的结果数组
 * @returns {string} 合并后的结果
 */
async function mergeSegmentsDirectly(segments) {
  // 每次合并20个段就报告一次进度
  const reportInterval = Math.max(1, Math.floor(segments.length / 20));
  
  // 采用分批合并的方法，避免一次性处理过大字符串
  let result = '';
  const batchSize = 10; // 每批10个段
  
  // 计算总段数以便报告进度
  const totalSegments = segments.length;
  
  for (let i = 0; i < segments.length; i += batchSize) {
    // 获取当前批次
    const currentBatch = segments.slice(i, Math.min(i + batchSize, segments.length));
    
    // 直接连接当前批次，不使用分隔符
    const batchResult = currentBatch.join('');
    
    // 将当前批次结果添加到最终结果
    result += batchResult;
    
    // 报告进度
    if (i % reportInterval === 0 || i + batchSize >= segments.length) {
      const progress = Math.min(100, Math.floor((i + batchSize) / totalSegments * 100));
      self.postMessage({ 
        type: 'progress', 
        task: 'merge', 
        progress,
        subtask: 'combining'
      });
      
      // 让UI有机会更新，避免worker阻塞
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }
  
  self.postMessage({ type: 'progress', task: 'merge', progress: 100 });
  return result;
}

/**
 * 解压缩数据
 * @param {Uint8Array} compressedData 要解压缩的数据
 * @param {string} algorithm 压缩算法，'gzip'或'deflate'
 * @returns {Promise<Uint8Array>} 解压缩后的数据
 */
async function decompressData(compressedData, algorithm) {
  try {
    self.postMessage({ type: 'progress', task: 'decompress', progress: 0, subtask: 'starting' });
    
    // 报告压缩数据大小
    const compressedSize = compressedData.length;
    self.postMessage({ 
      type: 'progress', 
      task: 'decompress', 
      progress: 10, 
      subtask: 'starting',
      compressionInfo: {
        compressedSize: compressedSize,
        message: `Preparing to decompress ${compressedSize} bytes of data with ${algorithm}`
      }
    });
    
    if (algorithm !== 'gzip' && algorithm !== 'deflate') {
      throw new Error(`Unsupported compression algorithm: ${algorithm}`);
    }
    
    // 创建解压缩流
    const ds = new DecompressionStream(algorithm);
    const writer = ds.writable.getWriter();
    writer.write(compressedData);
    writer.close();
    
    self.postMessage({ type: 'progress', task: 'decompress', progress: 30, subtask: 'processing' });
    
    // 读取解压缩输出
    const output = [];
    const reader = ds.readable.getReader();
    
    let totalLength = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      output.push(value);
      totalLength += value.length;
      
      // 更新进度（仅作估计，因为我们不知道最终大小）
      self.postMessage({ 
        type: 'progress', 
        task: 'decompress', 
        progress: 30 + Math.min(60, totalLength / (compressedSize * 2) * 60), 
        subtask: 'reading'
      });
    }
    
    // 合并所有块
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of output) {
      result.set(chunk, offset);
      offset += chunk.length;
    }
    
    // 最终报告解压缩结果
    self.postMessage({ 
      type: 'progress', 
      task: 'decompress', 
      progress: 100, 
      subtask: 'complete',
      compressionInfo: {
        algorithm: algorithm,
        compressedSize: compressedSize,
        decompressedSize: result.length,
        ratio: ((result.length / compressedSize) * 100).toFixed(2),
        message: `Decompression complete: ${algorithm} expanded data by ${((result.length / compressedSize) * 100).toFixed(2)}% (${compressedSize} → ${result.length} bytes)`
      }
    });
    
    return result;
  } catch (error) {
    console.error('解压缩失败:', error);
    throw error;
  }
}

/**
 * Decrypts data using Web Crypto
 * @param {ArrayBuffer} ciphertext Data to decrypt
 * @param {ArrayBuffer} key Decryption key
 * @param {Uint8Array} iv Initialization vector
 * @param {string} algorithmName Algorithm to use
 * @returns {Promise<ArrayBuffer>} Decrypted data
 */
async function decryptData(ciphertext, key, iv, algorithmName) {
  let cryptoAlgorithm;

  if (algorithmName === 'AES-256-GCM') {
    cryptoAlgorithm = { name: 'AES-GCM' };
  } else if (algorithmName === 'ChaCha20-Poly1305') {
    cryptoAlgorithm = { name: 'ChaCha20-Poly1305' };
  } else {
    throw new Error(`Unsupported decryption algorithm: ${algorithmName}`);
  }

  try {
    console.log("开始解密数据:", {
      algorithm: algorithmName,
      ivLength: iv.length,
      ciphertextLength: ciphertext.byteLength,
      keyLength: key.byteLength
    });
    
    // 记录IV和密文的前几个字节（对调试有帮助）
    console.log("IV前8字节:", Array.from(iv.slice(0, 8)).map(b => b.toString(16).padStart(2, '0')).join(' '));
    console.log("密文前8字节:", Array.from(new Uint8Array(ciphertext.slice(0, 8))).map(b => b.toString(16).padStart(2, '0')).join(' '));
    
    // 导入密钥
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      key,
      cryptoAlgorithm.name,
      false,
      ['decrypt']
    );
    
    console.log("密钥导入成功");
    
    // 开始解密
    self.postMessage({ type: 'progress', task: 'decrypt', progress: 50 });
    
    let plaintext;
    try {
      // 添加额外的try-catch，以便捕获具体的解密错误
      plaintext = await crypto.subtle.decrypt(
        { name: cryptoAlgorithm.name, iv: iv },
        cryptoKey,
        ciphertext
      );
      console.log("解密操作成功完成");
    } catch (specificError) {
      console.error("Web Crypto解密操作失败:", specificError);
      // 记录更多信息，帮助诊断
      throw new Error(`Web Crypto解密失败: ${specificError.name}: ${specificError.message}`);
    }
    
    // 记录解密结果
    console.log("解密数据成功，解密后数据大小:", plaintext.byteLength, "字节");
    if (plaintext.byteLength > 0) {
      const firstBytes = new Uint8Array(plaintext.slice(0, 8));
      console.log("解密后数据前8字节:", Array.from(firstBytes).map(b => b.toString(16).padStart(2, '0')).join(' '));
    }
    
    self.postMessage({ type: 'progress', task: 'decrypt', progress: 100 });
    return plaintext;
  } catch (error) {
    console.error("解密函数失败:", error.message, error.stack);
    throw new Error(`Decryption failed: ${error.message}`);
  }
}

/**
 * 移除虚拟表情符号并返回有效的加密字符串
 * @param {string} inputEmojiString 包含虚拟表情符号的完整表情符号字符串
 * @param {number[]} realIndices 真实表情符号索引
 * @param {string[]} emojiLibrary 表情符号库
 * @param {string} saltPBKDF2 盐值（在解密流程中不需要使用这个参数，因为调用前已移除）
 * @returns {string} 去除虚拟表情符号后的字符串
 */
function removeDummyEmojis(inputEmojiString, realIndices, emojiLibrary, saltPBKDF2) {
  // 调试日志
  console.log("removeDummyEmojis 参数:", {
    inputLength: inputEmojiString.length,
    realIndicesLength: realIndices.length,
    saltPBKDF2Length: saltPBKDF2 ? saltPBKDF2.length : 0
  });

  // 确保我们正确使用Segmenter处理表情符号
  const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
  const segments = Array.from(segmenter.segment(inputEmojiString));
  const emojis = segments.map(s => s.segment);
  console.log("输入字符串包含表情符号数量:", emojis.length, "前5个:", emojis.slice(0, 5));

  // 创建真实表情符号集合
  const realEmojiSet = new Set(realIndices.map(index => emojiLibrary[index]));
  console.log("真实表情符号集合大小:", realEmojiSet.size);

  // 收集一些实际的真实表情符号作为示例，用于调试
  const realEmojiSamples = realIndices.slice(0, 10).map(idx => emojiLibrary[idx]);
  console.log("真实表情符号样例:", realEmojiSamples);
  
  // 使用严格模式过滤，只保留确定属于实际编码字母表的表情符号
  const realEmojis = [];
  const skippedEmojis = [];
  for (const emoji of emojis) {
    if (realEmojiSet.has(emoji)) {
      realEmojis.push(emoji);
    } else {
      skippedEmojis.push(emoji);
    }
  }
  
  if (skippedEmojis.length > 0) {
    console.log(`跳过了${skippedEmojis.length}个非编码表情符号，前5个:`, skippedEmojis.slice(0, 5));
  }
  
  console.log("过滤后的真实表情符号数量:", realEmojis.length);
  
  // 将过滤后的真实表情符号重新组合为一个字符串
  const result = realEmojis.join('');
  console.log("最终返回的表情符号字符串长度:", result.length);
  return result;
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
    
    // Handle encrypt task
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
      
      // 3. 加密数据
      self.postMessage({ 
        type: 'progress', 
        task: 'encrypt', 
        progress: 40, 
        subtask: 'encrypting',
        compressionInfo: compressionInfo
      });
      const { iv, ciphertext } = await encryptData(compressionResult.compressedData, key, algorithmName);
      
      // 4. 完成
      self.postMessage({ type: 'progress', task: 'encrypt', progress: 100 });
      
      // 返回结果
      self.postMessage({ 
        success: true,
        type: 'result',
        task: 'encrypt', 
        result: {
          iv: iv.buffer,
          ciphertext: ciphertext,
        compressionInfo: compressionInfo
        }
      }, [iv.buffer, ciphertext]);
    }
    
    // Handle decrypt task
    else if (data.task === 'decrypt') {
      const { 
        encryptedEmojiString, 
        key, 
        algorithm, 
        baseN, 
        emojiLibrary, 
        realIndices,
        saltPBKDF2 
      } = data;
      
      self.postMessage({ type: 'progress', task: 'decrypt', progress: 0 });
      
      try {
        console.log("开始解密过程，收到的参数:", {
          encryptedStringLength: encryptedEmojiString.length,
          saltPBKDF2,
          saltPBKDF2Length: saltPBKDF2.length,
          baseN,
          realIndicesLength: realIndices.length,
          keyLength: key.byteLength
        });
        
        // 验证关键参数
        if (!encryptedEmojiString || encryptedEmojiString.length < 10) {
          throw new Error("加密字符串太短或为空");
        }
        
        if (key.byteLength !== 32) { // AES-256需要32字节密钥
          throw new Error(`密钥长度不正确: ${key.byteLength}字节, 期望32字节`);
        }
        
        // 1. 提取盐值并移除虚拟表情符号
        self.postMessage({ type: 'progress', task: 'decrypt', progress: 10, subtask: 'removing_dummies' });
        
        // 使用Segmenter正确处理表情符号字符串
        const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
        const inputSegments = Array.from(segmenter.segment(encryptedEmojiString));
        const inputEmojis = inputSegments.map(s => s.segment);
        
        // 提取盐值
        const saltSegments = Array.from(segmenter.segment(saltPBKDF2));
        const saltEmojis = saltSegments.map(s => s.segment);
        console.log("盐值表情符号个数:", saltEmojis.length);
        
        // 确认输入字符串的末尾是否包含盐值
        const lastNEmojis = inputEmojis.slice(-saltEmojis.length);
        console.log("对比盐值:", {
          expected: saltEmojis,
          actual: lastNEmojis,
          matches: JSON.stringify(saltEmojis) === JSON.stringify(lastNEmojis)
        });
        
        // 移除盐值
        const emojiStringWithoutSalt = inputEmojis.slice(0, -saltEmojis.length).join('');
        console.log("移除盐值后的字符串长度:", emojiStringWithoutSalt.length);
        
        // 过滤虚拟表情符号，只保留真实表情符号
        console.log("实际编码使用的表情符号样例:", 
          realIndices.slice(0, 5).map(idx => emojiLibrary[idx]));
        
        // 使用公共函数移除虚拟表情符号
        const realEmojiString = removeDummyEmojis(emojiStringWithoutSalt, realIndices, emojiLibrary, "");
        
        // 2. 使用BaseN解码恢复二进制数据
        self.postMessage({ type: 'progress', task: 'decrypt', progress: 20, subtask: 'decoding' });
        
        // 创建实际使用的表情符号字母表
        const emojiAlphabet = realIndices.map(index => emojiLibrary[index]);
        
        // 记录字母表的一些信息
        console.log("字母表大小:", emojiAlphabet.length, "其中不重复的有:", new Set(emojiAlphabet).size);
        if (emojiAlphabet.length !== new Set(emojiAlphabet).size) {
          console.warn("警告: 字母表中有重复表情符号!");
        }
        
        // 确保表情符号字母表中没有undefined
        if (emojiAlphabet.includes(undefined)) {
          console.error("错误: 表情符号字母表包含undefined值!");
          // 找出哪些索引导致了undefined
          const badIndices = realIndices.filter(idx => emojiLibrary[idx] === undefined);
          console.error("导致undefined的索引:", badIndices);
        }
        
        // 执行BaseN解码
        const combinedData = baseNDecode(realEmojiString, baseN, emojiAlphabet);
        
        // 3. 分离IV和密文
        self.postMessage({ type: 'progress', task: 'decrypt', progress: 30, subtask: 'separating' });
        const ivLength = (algorithm === 'AES-256-GCM' || algorithm === 'ChaCha20-Poly1305') ? 12 : 0;
        
        if (combinedData.length < ivLength) {
          throw new Error(`解码后数据太短(${combinedData.length}字节)，无法提取${ivLength}字节IV`);
        }
        
        const iv = combinedData.slice(0, ivLength);
        const ciphertext = combinedData.slice(ivLength);
        
        if (ciphertext.length === 0) {
          throw new Error("提取的密文为空");
        }
        
        console.log("分离后的数据: IV长度=", iv.length, "密文长度=", ciphertext.length);
        
        // 4. 解密数据
        self.postMessage({ type: 'progress', task: 'decrypt', progress: 40, subtask: 'decrypting' });
        const decryptedCompressedData = await decryptData(ciphertext, key, iv, algorithm);
        
        // 5. 检测压缩算法并解压缩
        self.postMessage({ type: 'progress', task: 'decrypt', progress: 60, subtask: 'checking_compression' });
        
        // 解压之前检查数据的前几个字节来确定压缩算法
        const compressedData = new Uint8Array(decryptedCompressedData);
        
        // 检测Gzip (标准头部为 0x1F 0x8B)
        const isGzip = compressedData[0] === 0x1F && compressedData[1] === 0x8B;
        // 检测Deflate (没有标准头部，但通常前字节会包含特定位模式)
        const isDeflate = !isGzip; // 如果不是gzip，我们就假设是deflate
        
        // 使用检测到的算法解压缩
        let compressionAlgorithm = isGzip ? 'gzip' : 'deflate';
        self.postMessage({ type: 'progress', task: 'decrypt', progress: 70, subtask: 'decompressing' });
        
        console.log("使用", compressionAlgorithm, "解压缩数据，压缩数据大小:", compressedData.length, "字节");
        const decompressedData = await decompressData(compressedData, compressionAlgorithm);
        
        // 6. 转换为字符串
        self.postMessage({ type: 'progress', task: 'decrypt', progress: 90, subtask: 'converting' });
        const jsonString = uint8ArrayToString(decompressedData);
        
        // 7. 完成
        self.postMessage({ type: 'progress', task: 'decrypt', progress: 100, subtask: 'complete' });
        
        // 返回结果
      self.postMessage({ 
        success: true, 
        type: 'result', 
          task: 'decrypt',
          result: jsonString
        });
      } catch (error) {
        console.error("解密过程失败:", error.message, "\n堆栈:", error.stack);
        self.postMessage({
          success: false,
          type: 'result',
          task: 'decrypt',
          error: error.message || '解密失败'
        });
      }
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
      
      // 修改为仅排除emojiSeedReal和saltPBKDF2
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
    
    // 处理合并的BaseN编码和虚拟表情符号插入任务
    else if (data.task === 'combineBaseNAndDummies') {
      const {
        dataUint8ArrayBuffer,  // 原始二进制数据
        baseN,                 // 基数
        emojiLibrary,          // 表情符号库
        emojiSeedRealIndices,  // BaseN使用的表情符号索引
        dummyPercentage,       // 虚拟表情符号比例
        emojiSeedDummyIndices, // 虚拟表情符号索引
        saltPBKDF2             // 加密salt
      } = data;
      
      // 从ArrayBuffer创建Uint8Array
      const bytes = new Uint8Array(dataUint8ArrayBuffer);
      
      // 调用合并处理函数
      const finalString = await combineBaseNAndDummies(
        bytes,
        baseN,
        emojiLibrary,
        emojiSeedRealIndices,
        dummyPercentage,
        emojiSeedDummyIndices,
        saltPBKDF2
      );
      
      // 返回最终结果
      self.postMessage({
        success: true,
        type: 'result',
        task: 'combineBaseNAndDummies',
        result: finalString
      });
    }
    
    // Handle preloadLibrary task
    else if (data.task === 'preloadLibrary') {
      handlePreloadLibrary(data);
    }
    
    // Handle mergeSegmentsDirectly task
    else if (data.task === 'mergeSegmentsDirectly') {
      const result = await mergeSegmentsDirectly(data.segments);
      self.postMessage({
        success: true,
        result,
        type: 'result',
        task: 'mergeSegmentsDirectly'
      });
    }
    
    // Handle mergeCombinedResults task
    else if (data.task === 'mergeCombinedResults') {
      const result = await mergeCombinedResults(data.segments, data.separator);
      self.postMessage({
        success: true,
        result,
        type: 'result',
        task: 'mergeCombinedResults'
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

/**
 * Handles preloading and caching emoji libraries in the worker
 * @param {Object} data Task data containing library information
 */
function handlePreloadLibrary(data) {
  // Extract data
  const { emojiLibrary, libraryKey } = data;
  
  // Store in cache using the key
  if (emojiLibrary && emojiLibrary.length > 0 && libraryKey) {
    cachedEmojiLibraries[libraryKey] = emojiLibrary;
    currentEmojiLibrary = emojiLibrary;
    
    console.log(`Worker: Emoji library ${libraryKey} cached (${emojiLibrary.length} emojis)`);
    
    // Report success
    self.postMessage({
      type: 'result',
      success: true,
      task: 'preloadLibrary',
      result: {
        libraryKey,
        emojiCount: emojiLibrary.length
      }
    });
  } else {
    throw new Error('Invalid emoji library data for preloading');
  }
} 