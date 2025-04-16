// Add passive touch listeners for potential performance improvement
document.addEventListener('touchstart', function() {}, { passive: true });
document.addEventListener('touchend', function() {}, { passive: true });
document.addEventListener('touchcancel', function() {}, { passive: true });

// DOM Elements
const encryptBtn = document.getElementById('encryptBtn');
const decryptBtn = document.getElementById('decryptBtn');
const inputText = document.getElementById('inputText');
const outputText = document.getElementById('outputText');
const actionBtn = document.getElementById('actionBtn');
const fileDropArea = document.getElementById('fileDropArea');
const fileInput = document.getElementById('fileInput');
const saveFileArea = document.getElementById('saveFileArea');
const password = document.getElementById('password');
const cipherSubtitle = document.getElementById('cipherSubtitle');
const cipherMenu = document.getElementById('cipherMenu');
const defaultBtn = document.getElementById('defaultBtn');
const customBtn = document.getElementById('customBtn');
const title = document.querySelector('.title');
const container = document.querySelector('.container'); // Get container element

// Button groups
const inputButtons = {
    expand: document.getElementById('inputExpand'),
    paste: document.getElementById('inputPaste'),
    clear: document.getElementById('inputClear')
};

const outputButtons = {
    expand: document.getElementById('outputExpand'),
    copy: document.getElementById('outputCopy'),
    clear: document.getElementById('outputClear')
};

const passwordButtons = {
    copy: document.getElementById('passwordCopy'),
    paste: document.getElementById('passwordPaste'),
    clear: document.getElementById('passwordClear'),
    generate: document.getElementById('passwordGenerate')
};

// Mode state
let isEncryptMode = true;
let isDefaultMode = true;
let isCopying = false; // Flag to prevent expansion during copy

// Cipher state
let currentEncrypt = 'AES-256-GCM';
let currentEncode = 'Base64';

// Theme state
let isDarkTheme = localStorage.getItem('theme') !== 'light'; // Default to dark unless explicitly light

// State for preserving content across modes
const encryptState = { input: '', output: '', password: '' };
const decryptState = { input: '', output: '', password: '' };

// Update subtitle text
function updateSubtitle() {
    cipherSubtitle.textContent = `${currentEncrypt} & ${currentEncode}`;
}

// Initialize menu state
function initializeMenuState() {
    // Set Default as active
    defaultBtn.classList.add('active');
    customBtn.classList.remove('active');
    isDefaultMode = true;
    
    // Set AES-256-GCM and Base64 as active
    document.querySelector('.menu-item[data-encrypt="AES-256-GCM"]').classList.add('active');
    document.querySelector('.menu-item[data-encode="Base64"]').classList.add('active');
}

// Toggle dropdown menu
cipherSubtitle.addEventListener('click', (e) => {
    e.stopPropagation();
    cipherMenu.classList.toggle('show');
});

// Mode switching for Default/Custom
defaultBtn.addEventListener('click', () => {
    // Always switch to default mode and set AES-256-GCM and Base64
    currentEncrypt = 'AES-256-GCM';
    currentEncode = 'Base64';
    switchCipherMode('default');
    
    // Update menu items
    document.querySelectorAll('.menu-item[data-encrypt]').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.encrypt === 'AES-256-GCM') {
            item.classList.add('active');
        }
    });
    
    document.querySelectorAll('.menu-item[data-encode]').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.encode === 'Base64') {
            item.classList.add('active');
        }
    });
        
    updateSubtitle();
});

customBtn.addEventListener('click', () => {
    // Always switch to custom mode and set AES-256-GCM and Base1024
    currentEncrypt = 'AES-256-GCM';
    currentEncode = 'Base1024';
    switchCipherMode('custom');
    
    // Update menu items
    document.querySelectorAll('.menu-item[data-encrypt]').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.encrypt === 'AES-256-GCM') {
            item.classList.add('active');
        }
    });
    
    document.querySelectorAll('.menu-item[data-encode]').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.encode === 'Base1024') {
            item.classList.add('active');
        }
    });
    
    updateSubtitle();
});

function switchCipherMode(mode) {
    isDefaultMode = mode === 'default';
    
    // Update button states
    defaultBtn.classList.toggle('active', isDefaultMode);
    customBtn.classList.toggle('active', !isDefaultMode);
    
    if (isDefaultMode) {
        // Reset to default values
        currentEncrypt = 'AES-256-GCM';
        currentEncode = 'Base64';
        
        // Update menu items to reflect default
        document.querySelectorAll('.menu-item[data-encrypt]').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.encrypt === currentEncrypt) {
                item.classList.add('active');
            }
        });
        
        document.querySelectorAll('.menu-item[data-encode]').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.encode === currentEncode) {
                item.classList.add('active');
            }
        });
    }
    
    updateSubtitle();
}

// Handle menu item clicks
cipherMenu.addEventListener('click', (e) => {
    const menuItem = e.target.closest('.menu-item');
    if (!menuItem) return;

    e.stopPropagation();

    if (menuItem.dataset.encrypt) {
        // Encrypt option clicked
        handleEncryptOptionClick(menuItem);
    } else if (menuItem.dataset.encode) {
        // Encode option clicked
        handleEncodeOptionClick(menuItem);
    }

    updateSubtitle();
});

function handleEncryptOptionClick(menuItem) {
    // Remove active class from all encryption items
    document.querySelectorAll('.menu-item[data-encrypt]').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to clicked item
    menuItem.classList.add('active');
    
    // Update encryption state
    currentEncrypt = menuItem.dataset.encrypt;
    
    // Check if we should switch modes
    updateCipherMode();
}

function handleEncodeOptionClick(menuItem) {
    // Remove active class from all encoding items
    document.querySelectorAll('.menu-item[data-encode]').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to clicked item
    menuItem.classList.add('active');
    
    // Update encoding state
    currentEncode = menuItem.dataset.encode;
    
    // Check if we should switch modes
    updateCipherMode();
}

function updateCipherMode() {
    const defaultEncrypt = defaultBtn.dataset.encrypt;
    const defaultEncode = defaultBtn.dataset.encode;
    
    if (currentEncrypt === defaultEncrypt && currentEncode === defaultEncode) {
        // If current selections match Default, activate Default mode
        switchCipherMode('default');
    } else {
        // Otherwise, activate Custom mode
        switchCipherMode('custom');
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    const target = e.target;
    
    // 只保留关闭下拉菜单的逻辑，不添加自动折叠文本框的逻辑
    if (!target.closest('.subtitle-container')) {
        cipherMenu.classList.remove('show');
    }
});

// Mode switch functionality
function switchMode(mode) {
    const previousMode = isEncryptMode ? 'encrypt' : 'decrypt';
    
    // 保存当前模式的内容 (包括密码)
    if (previousMode === 'encrypt') {
        encryptState.input = inputText.value;
        encryptState.output = outputText.value;
        encryptState.password = password.value;
    } else {
        decryptState.input = inputText.value;
        decryptState.output = outputText.value;
        decryptState.password = password.value;
    }
    
    isEncryptMode = mode === 'encrypt';
    
    // Update button states
    encryptBtn.classList.toggle('active', isEncryptMode);
    decryptBtn.classList.toggle('active', !isEncryptMode);
    
    // Update action button text with emoji
    actionBtn.innerHTML = isEncryptMode ? '<span>🔒</span>' : '<span>🔓</span>';
    
    // Update placeholders
    inputText.placeholder = isEncryptMode ? 'Input' : 'Encrypted Input';
    outputText.placeholder = isEncryptMode ? 'Output' : 'Decrypted Output';

    // 恢复新模式的内容 (包括密码)
    if (isEncryptMode) {
        inputText.value = encryptState.input;
        outputText.value = encryptState.output;
        password.value = encryptState.password;
    } else {
        inputText.value = decryptState.input;
        outputText.value = decryptState.output;
        password.value = decryptState.password;
    }
    
    // 重置所有按钮状态 (除了密码框内容)
    inputButtons.paste.classList.remove('is-success');
    outputButtons.copy.classList.remove('is-success');
    passwordButtons.copy.classList.remove('is-success');
    passwordButtons.paste.classList.remove('is-success');
    passwordButtons.generate.classList.remove('is-success');
}

// Event listeners for mode switching
encryptBtn.addEventListener('click', () => {
    if (isEncryptMode) {
        // If already in encrypt mode, perform the same action as action button
        if (!inputText.value.trim()) {
            alert('Please enter some text in the input field.');
            return;
        }
        
        // TODO: Add encryption logic here
        outputText.value = inputText.value;
    } else {
        // Switch to encrypt mode
        switchMode('encrypt');
    }
});

decryptBtn.addEventListener('click', () => {
    if (!isEncryptMode) {
        // If already in decrypt mode, perform the same action as action button
        if (!inputText.value.trim()) {
            alert('Please enter some text in the input field.');
            return;
        }
        
        // TODO: Add decryption logic here
        outputText.value = inputText.value;
    } else {
        // Switch to decrypt mode
        switchMode('decrypt');
    }
});

// Copy text to clipboard
function copyToClipboard(textarea) {
    if (!textarea.value) return; // Do nothing if textarea is empty

    navigator.clipboard.writeText(textarea.value).then(() => {
        // Add success class
        outputButtons.copy.classList.add('is-success');
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        alert('Failed to copy text.');
    });
}

// Paste text from clipboard
async function pasteFromClipboard(textarea) {
    try {
        const text = await navigator.clipboard.readText();
        textarea.value = text;
        // Add success class
        inputButtons.paste.classList.add('is-success');
        // Trigger input event manually to reset button state if user doesn't type
        // inputText.dispatchEvent(new Event('input')); 
    } catch (err) {
        console.error('Failed to paste text: ', err);
        alert('Failed to paste text. Browser permissions might be needed.');
    }
}

// Clear textarea
function clearTextarea(textarea) {
    const wasEmpty = textarea.value.trim() === '';
    
    // Clear the textarea regardless
    textarea.value = '';
    
    // Reset button states based on which textarea is being cleared
    if (textarea === outputText) {
        // Reset copy button state for output
        outputButtons.copy.classList.remove('is-success');
    } else if (textarea === inputText) {
        // Reset paste button state for input
        inputButtons.paste.classList.remove('is-success');
    }
    
    if (wasEmpty) {
        // If it was already empty, show the query text
        if (textarea === inputText) {
            inputButtons.clear.classList.add('is-query');
            setTimeout(() => {
                inputButtons.clear.classList.remove('is-query');
            }, 500); // Remove after 0.5s
        } else if (textarea === outputText) {
            outputButtons.clear.classList.add('is-query');
            setTimeout(() => {
                outputButtons.clear.classList.remove('is-query');
            }, 500); // Remove after 0.5s
        }
    } else {
        // If it had content, show the success text
        if (textarea === inputText) {
            inputButtons.clear.classList.add('is-success');
            setTimeout(() => {
                inputButtons.clear.classList.remove('is-success');
            }, 500); // Remove after 0.5s
        } else if (textarea === outputText) {
            outputButtons.clear.classList.add('is-success');
            setTimeout(() => {
                outputButtons.clear.classList.remove('is-success');
            }, 500); // Remove after 0.5s
        }
    }
}

// Input button event listeners
inputButtons.expand.addEventListener('click', (e) => {
    e.stopPropagation();
    const isExpanding = !inputText.classList.contains('expanded');

    // If output is expanded, collapse it first
    if (outputText.classList.contains('expanded')) {
        outputText.classList.remove('expanded');
        outputButtons.expand.classList.remove('is-success');
        container.classList.remove('output-expanded');
    }

    // Toggle input expansion
    inputText.classList.toggle('expanded');
    inputButtons.expand.classList.toggle('is-success');
    container.classList.toggle('input-expanded', isExpanding);

    if (isExpanding) {
        // inputText.focus(); // Removed focus call
    } else {
        inputText.blur();
    }
});

inputButtons.paste.addEventListener('click', async () => {
    await pasteFromClipboard(inputText);
    
    // 自动设置焦点到输入框
    // inputText.focus(); // Removed focus call
});

inputButtons.clear.addEventListener('click', () => {
    // If input is expanded, collapse it when clearing
    if (inputText.classList.contains('expanded')) {
        inputText.classList.remove('expanded');
        inputButtons.expand.classList.remove('is-success');
        container.classList.remove('input-expanded');
    }
    clearTextarea(inputText);
    inputText.blur();
});

// Output button event listeners
outputButtons.expand.addEventListener('click', (e) => {
    e.stopPropagation();
    const isExpanding = !outputText.classList.contains('expanded');

    // If input is expanded, collapse it first
    if (inputText.classList.contains('expanded')) {
        inputText.classList.remove('expanded');
        inputButtons.expand.classList.remove('is-success');
        container.classList.remove('input-expanded');
    }

    // Toggle output expansion
    outputText.classList.toggle('expanded');
    outputButtons.expand.classList.toggle('is-success');
    container.classList.toggle('output-expanded', isExpanding);

    if (isExpanding) {
        // outputText.focus(); // Removed focus call
    } else {
        outputText.blur();
    }
});

outputButtons.copy.addEventListener('click', () => {
    copyToClipboard(outputText);
    
    // 自动设置焦点到输出框
    // outputText.focus(); // Removed focus call
});

outputButtons.clear.addEventListener('click', () => {
    // If output is expanded, collapse it when clearing
    if (outputText.classList.contains('expanded')) {
        outputText.classList.remove('expanded');
        outputButtons.expand.classList.remove('is-success');
        container.classList.remove('output-expanded');
    }
    clearTextarea(outputText);
    outputText.blur();
});

// Add input listeners to reset button state
inputText.addEventListener('input', () => {
    inputButtons.paste.classList.remove('is-success');
});

outputText.addEventListener('input', () => {
    outputButtons.copy.classList.remove('is-success');
});

// Ensure all button clicks prevent default behavior and focus loss
const allActionButtons = [
    inputButtons.expand, inputButtons.paste, inputButtons.clear, // Re-add expand
    outputButtons.expand, outputButtons.copy, outputButtons.clear, // Re-add expand
    passwordButtons.copy, passwordButtons.paste, passwordButtons.clear, passwordButtons.generate
];

allActionButtons.forEach(button => {
    button.addEventListener('mousedown', (e) => {
        // Prevent click causing blur 
        e.preventDefault();
    });
});

// Simplified focus handling (keep existing)
inputText.addEventListener('focus', () => {
    // 文本框获得焦点时，添加高亮
    inputText.closest('.input-section').classList.add('focused');
});

inputText.addEventListener('blur', () => {
    // 文本框失去焦点时，立即移除高亮
    inputText.closest('.input-section').classList.remove('focused');
});

outputText.addEventListener('focus', () => {
    // 文本框获得焦点时，添加高亮
    outputText.closest('.output-section').classList.add('focused');
});

outputText.addEventListener('blur', () => {
    // 文本框失去焦点时，立即移除高亮
    outputText.closest('.output-section').classList.remove('focused');
});

// 为密码框添加焦点事件处理（与输入/输出框保持一致）
password.addEventListener('focus', () => {
    // 密码框获得焦点时，添加高亮
    password.closest('.password-section').classList.add('focused');
});

password.addEventListener('blur', () => {
    // 密码框失去焦点时，立即移除高亮
    password.closest('.password-section').classList.remove('focused');
});

password.addEventListener('input', () => {
    // 当密码框内容改变时，重置相关按钮状态并保存密码
    passwordButtons.copy.classList.remove('is-success');
    passwordButtons.paste.classList.remove('is-success');
    passwordButtons.generate.classList.remove('is-success');
    // 保存密码到当前模式状态
    if (isEncryptMode) {
        encryptState.password = password.value;
    } else {
        decryptState.password = password.value;
    }
});

// File drop functionality
fileDropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    fileDropArea.classList.add('highlight');
});

fileDropArea.addEventListener('dragleave', () => {
    fileDropArea.classList.remove('highlight');
});

fileDropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    fileDropArea.classList.remove('highlight');
    
    const file = e.dataTransfer.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            inputText.value = e.target.result;
            // 自动设置焦点到输入框
            // inputText.focus(); // Removed focus call
        };
        reader.readAsText(file);
    }
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            inputText.value = e.target.result;
            // 自动设置焦点到输入框
            // inputText.focus(); // Removed focus call
            // 清空 fileInput 的值，确保下次选择相同文件时也能触发 change 事件
            fileInput.value = '';
        };
        reader.readAsText(file);
    }
});

// 添加点击事件给文件选择区域，设置焦点到输入框
fileDropArea.addEventListener('click', () => {
    // 清空 fileInput 的值，确保选择相同文件时也能触发 change 事件
    fileInput.value = '';
    // 自动设置焦点到输入框
    // inputText.focus(); // Removed focus call
});

// Save file functionality
saveFileArea.addEventListener('click', () => {
    if (!outputText.value) {
        alert('No content to save.');
        return;
    }

    const blob = new Blob([outputText.value], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'output.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // 自动设置焦点到输出框
    // outputText.focus(); // Removed focus call
});

// Action button click handler
actionBtn.addEventListener('click', () => {
    if (!inputText.value.trim()) {
        alert('Please enter some text in the input field.');
        return;
    }
    
    // TODO: Add encryption/decryption logic here
    if (isEncryptMode) {
        // Hide logic
        setOutputText(inputText.value);
    } else {
        // Show logic
        setOutputText(inputText.value);
    }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeMenuState();
    updateSubtitle();
});

// Initialize mode
switchMode('encrypt');

// Theme switching
title.addEventListener('click', () => {
    isDarkTheme = !isDarkTheme;
    localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', isDarkTheme ? 'dark' : 'light');
});

// Initialize theme
document.documentElement.setAttribute('data-theme', isDarkTheme ? 'dark' : 'light');

// 密码按钮功能实现
// Copy 密码
passwordButtons.copy.addEventListener('click', () => {
    // 如果密码框为空，不执行操作
    if (!password.value) return;

    navigator.clipboard.writeText(password.value).then(() => {
        // 添加 success 类显示 Copied
        passwordButtons.copy.classList.add('is-success');
        
        // 自动设置焦点到密码框
        // password.focus(); // Removed focus call
    }).catch(err => {
        console.error('复制密码失败: ', err);
        alert('复制密码失败');
    });
});

// Paste 粘贴密码
passwordButtons.paste.addEventListener('click', async () => {
    try {
        const text = await navigator.clipboard.readText();
        password.value = text;
        
        // 添加 success 类显示 Pasted
        passwordButtons.paste.classList.add('is-success');
        
        // 重置 Generate 按钮状态
        passwordButtons.generate.classList.remove('is-success');
        
        // 保存密码到当前模式状态
        if (isEncryptMode) {
            encryptState.password = password.value;
        } else {
            decryptState.password = password.value;
        }
        
        // 自动设置焦点到密码框
        // password.focus(); // Removed focus call
    } catch (err) {
        console.error('粘贴密码失败: ', err);
        alert('粘贴密码失败。可能需要浏览器权限。');
    }
});

// Clear 清除密码
passwordButtons.clear.addEventListener('click', () => {
    // 检查密码框是否为空
    const wasEmpty = password.value.trim() === '';
    
    // 无论是否为空，都清空密码框
    password.value = '';
    // 清空当前模式状态中的密码
    if (isEncryptMode) {
        encryptState.password = '';
    } else {
        decryptState.password = '';
    }
    
    if (wasEmpty) {
        // 如果原来就是空的，显示 ?????
        passwordButtons.clear.classList.add('is-query');
        setTimeout(() => {
            passwordButtons.clear.classList.remove('is-query');
        }, 500); // 0.5秒后移除
    } else {
        // 如果有内容，显示 Cleared
        passwordButtons.clear.classList.add('is-success');
        setTimeout(() => {
            passwordButtons.clear.classList.remove('is-success');
        }, 500); // 0.5秒后移除
    }
    
    // 重置 Copy, Paste 和 Generate 按钮状态
    passwordButtons.copy.classList.remove('is-success');
    passwordButtons.paste.classList.remove('is-success');
    passwordButtons.generate.classList.remove('is-success');
    
    // 取消密码框焦点
    password.blur();
});

// Generate 生成随机密码
passwordButtons.generate.addEventListener('click', () => {
    // 生成16位强随机密码，包含大小写字母、数字和特殊字符
    const length = 16;
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}|;:,.<>?';
    let generatedPassword = '';
    
    // 使用加密安全的随机数生成器
    const randomValues = new Uint32Array(length);
    window.crypto.getRandomValues(randomValues);
    
    for (let i = 0; i < length; i++) {
        generatedPassword += charset[randomValues[i] % charset.length];
    }
    
    // 设置密码值
    password.value = generatedPassword;
    // 保存密码到当前模式状态
    if (isEncryptMode) {
        encryptState.password = password.value;
    } else {
        decryptState.password = password.value;
    }
    
    // 添加 success 类显示 Generated
    passwordButtons.generate.classList.add('is-success');
    
    // 重置 Copy 和 Paste 按钮状态
    passwordButtons.copy.classList.remove('is-success');
    passwordButtons.paste.classList.remove('is-success');
    
    // 自动设置焦点到密码框
    // password.focus(); // Removed focus call
});

// 用于设置输出框内容的辅助函数，确保重置复制状态并保存到状态对象
function setOutputText(text) {
    outputText.value = text;
    // 更新当前模式的状态
    if (isEncryptMode) {
        encryptState.output = text;
    } else {
        decryptState.output = text;
    }
    // 重置复制按钮状态
    outputButtons.copy.classList.remove('is-success');
}

// --- 新增：移动设备输入框自动滚动 --- //

function isMobileDevice() {
    // 主要基于触摸支持判断
    return ('ontouchstart' in window || navigator.maxTouchPoints > 0);
}

// 新函数：滚动元素至可视区域中央
function scrollToCenterInViewport(element) {
    if (!element || typeof element.getBoundingClientRect !== 'function') return;

    const visualViewport = window.visualViewport;
    if (!visualViewport) return; // 需要 visualViewport API

    const elementRect = element.getBoundingClientRect();

    // 计算元素中心点相对于文档顶部的距离
    const elementCenterDocY = window.scrollY + elementRect.top + element.offsetHeight / 2;

    // 计算可视区域中心点相对于文档顶部的距离
    const viewportCenterDocY = window.scrollY + visualViewport.offsetTop + visualViewport.height / 2;

    // 计算需要滚动的目标位置
    const scrollTargetY = elementCenterDocY - viewportCenterDocY + window.scrollY;

    // 确保滚动位置在有效范围内
    const maxScrollY = document.documentElement.scrollHeight - visualViewport.height;
    const finalScrollY = Math.max(0, Math.min(scrollTargetY, maxScrollY));

    // 平滑滚动到目标位置
    window.scrollTo({
        top: finalScrollY,
        behavior: 'smooth'
    });
}

let scrollTimeoutId = null;

function handleMobileInputFocus(event) {
    if (!isMobileDevice()) {
        return; // 非移动设备则跳过
    }

    const focusedElement = event.target;
    const visualViewport = window.visualViewport;

    if (!visualViewport) return;

    // 移除立即滚动
    // if (window.innerWidth > window.innerHeight) {
    //     smoothScrollToTop(focusedElement);
    // } else {
    //     smoothScrollToCenter(focusedElement);
    // }

    // 监听键盘弹出/收起导致的 viewport resize 事件
    const viewportResizeHandler = () => {
        // 清除之前的延时滚动，以防快速触发
        clearTimeout(scrollTimeoutId);

        // 设置一个短暂延时，等待键盘动画和 viewport 尺寸稳定
        scrollTimeoutId = setTimeout(() => {
            // 再次检查焦点，确保用户没有切换
            if (document.activeElement === focusedElement) {
                // 调用新的滚动函数，将元素居中于当前可视区域
                scrollToCenterInViewport(focusedElement);
            }
            // 注意：监听器因 {once: true} 会自动移除，无需手动移除
        }, 150); // 150ms 延时，可以根据效果微调
    };

    // 添加一次性的 resize 监听器
    visualViewport.addEventListener('resize', viewportResizeHandler, { once: true });

    // 可选：如果键盘已经弹出（例如切换输入框），也触发一次滚动检查
    // （这部分逻辑可以根据实际测试效果决定是否需要）
    // clearTimeout(scrollTimeoutId);
    // scrollTimeoutId = setTimeout(() => {
    //     if (document.activeElement === focusedElement) {
    //         scrollToCenterInViewport(focusedElement);
    //     }
    // }, 200);
}

// 为需要处理的文本输入框添加 focus 事件监听器
inputText.addEventListener('focus', handleMobileInputFocus);
outputText.addEventListener('focus', handleMobileInputFocus);
// 密码框保持默认行为
// password.addEventListener('focus', handleMobileInputFocus);

// --- 结束：移动设备输入框自动滚动 --- 