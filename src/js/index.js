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
const downloadFileArea = document.getElementById('downloadFileArea');
const password = document.getElementById('password');
const cipherSubtitle = document.getElementById('cipherSubtitle');
const cipherMenu = document.getElementById('cipherMenu');
const defaultBtn = document.getElementById('defaultBtn');
const customBtn = document.getElementById('customBtn');
const title = document.querySelector('.title');
const container = document.querySelector('.container'); // Get container element

// New Option Groups
const optionAlgorithmContainer = document.getElementById('optionAlgorithm');
const optionIterationsContainer = document.getElementById('optionIterations');
const optionBaseContainer = document.getElementById('optionBase');
const optionEmojiContainer = document.getElementById('optionEmoji');
const optionDummyEmojiContainer = document.getElementById('optionDummyEmoji'); // ADDED

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
let currentIterations = 'Iterations-100k'; // ADDED Iterations state
let currentEncode = 'Base64';
let currentEmoji = 'Emoji-v13.1'; // CHANGED DEFAULT
let currentDummyEmoji = 'DummyEmoji-0%'; // ADDED Dummy Emoji state & % suffix

// Theme state
let isDarkTheme = localStorage.getItem('theme') !== 'light'; // Default to dark unless explicitly light

// State for preserving content across modes
const encryptState = { input: '', output: '', password: '', cachedInputData: null, fullEncryptedOutput: null };
const decryptState = { input: '', output: '', password: '', cachedInputData: null, fullEncryptedOutput: null };

// Get references to the new spans in the combined button
const inputPasteBtn = document.getElementById('inputPaste');
const pasteTextSpan = inputPasteBtn.querySelector('.paste-text');
const copyTextSpan = inputPasteBtn.querySelector('.copy-text');
const pastedTextSpan = inputPasteBtn.querySelector('.pasted-text');
const copiedTextSpan = inputPasteBtn.querySelector('.copied-text');

// --- References for Password Combined Button ---
const passwordPasteBtn = document.getElementById('passwordPaste');
const pwdPasteTextSpan = passwordPasteBtn.querySelector('.paste-text');
const pwdCopyTextSpan = passwordPasteBtn.querySelector('.copy-text');
const pwdPastedTextSpan = passwordPasteBtn.querySelector('.pasted-text');
const pwdCopiedTextSpan = passwordPasteBtn.querySelector('.copied-text');

// --- References for Password Visibility Button ---
const passwordCopyBtn = document.getElementById('passwordCopy');
const emptyTextSpan = passwordCopyBtn.querySelector('.empty-text');
const showTextSpan = passwordCopyBtn.querySelector('.show-text');
const hideTextSpan = passwordCopyBtn.querySelector('.hide-text');

// Language Elements - REMOVED (Moved to language.js)
// const languageLink = document.getElementById('languageLink');
// const languageDropdown = document.getElementById('languageDropdown');
// const languageOptions = languageDropdown.querySelectorAll('.language-option');

// Translations - REMOVED (Moved to language.js)
// const translations = { ... };

// Language State - REMOVED (Managed in language.js)
// let currentLanguage = localStorage.getItem('language') || 'en';

// Helper function to get translation - REMOVED (Now global: window.getTranslation)
// function getTranslation(key, lang = currentLanguage) { ... }

// Function to set the language - REMOVED (Now global: window.setLanguage)
// function setLanguage(lang) { ... }

// Function to toggle language dropdown - REMOVED (Now global: window.toggleLanguageDropdown)
// function toggleLanguageDropdown(e) { ... }

// Helper function to close dropdowns - MODIFIED (Language part handled in language.js)
function closeDropdowns() {
    if (cipherMenu) cipherMenu.classList.remove('show');
    if (window.languageDropdown.classList.contains('show')) window.languageDropdown.classList.remove('show'); // Call global language dropdown if exists
}

// Function to update the combined input button state (Paste/Copy)
function updateInputButtonState() {
    const isEmpty = inputText.value.trim() === '';
    
    // Set default state visibility
    pasteTextSpan.style.opacity = isEmpty ? '1' : '0';
    pasteTextSpan.style.pointerEvents = isEmpty ? 'auto' : 'none';
    copyTextSpan.style.opacity = isEmpty ? '0' : '1';
    copyTextSpan.style.pointerEvents = isEmpty ? 'none' : 'auto';

    // Ensure success states are hidden
    pastedTextSpan.style.opacity = '0';
    pastedTextSpan.style.pointerEvents = 'none';
    copiedTextSpan.style.opacity = '0';
    copiedTextSpan.style.pointerEvents = 'none';
    
    // Remove overall success class if present
    inputPasteBtn.classList.remove('is-success'); 
}

// Function to update the combined password button state (Paste/Copy)
function updatePasswordButtonState() {
    const isEmpty = password.value.trim() === '';

    // Set default state visibility
    pwdPasteTextSpan.style.opacity = isEmpty ? '1' : '0';
    pwdPasteTextSpan.style.pointerEvents = isEmpty ? 'auto' : 'none';
    pwdCopyTextSpan.style.opacity = isEmpty ? '0' : '1';
    pwdCopyTextSpan.style.pointerEvents = isEmpty ? 'none' : 'auto';

    // Ensure success states are hidden
    pwdPastedTextSpan.style.opacity = '0';
    pwdPastedTextSpan.style.pointerEvents = 'none';
    pwdCopiedTextSpan.style.opacity = '0';
    pwdCopiedTextSpan.style.pointerEvents = 'none';

    // Remove overall success class if present
    passwordPasteBtn.classList.remove('is-success');
    
    // Also reset the original Copy button (button 1)
    passwordButtons.copy.classList.remove('is-success'); 
}

// Function to update the password visibility button state
function updatePasswordVisibilityState() {
    const isEmpty = password.value.trim() === '';
    const isVisible = password.type === 'text';

    // Reset all states
    emptyTextSpan.style.opacity = '0';
    emptyTextSpan.style.pointerEvents = 'none';
    showTextSpan.style.opacity = '0';
    showTextSpan.style.pointerEvents = 'none';
    hideTextSpan.style.opacity = '0';
    hideTextSpan.style.pointerEvents = 'none';

    if (isEmpty) {
        // Show Empty state
        emptyTextSpan.style.opacity = '1';
        emptyTextSpan.style.pointerEvents = 'auto';
    } else if (isVisible) {
        // Show Hide state
        hideTextSpan.style.opacity = '1';
        hideTextSpan.style.pointerEvents = 'auto';
    } else {
        // Show Show state
        showTextSpan.style.opacity = '1';
        showTextSpan.style.pointerEvents = 'auto';
    }
}

// Update subtitle text
function updateSubtitle() {
    let shortEncrypt = currentEncrypt;
    if (currentEncrypt.startsWith('AES')) {
        shortEncrypt = 'AES';
    } else if (currentEncrypt.startsWith('ChaCha')) {
        shortEncrypt = 'ChaCha';
    }
    // EXTENDED Subtitle to include DummyEmoji
    cipherSubtitle.textContent = `| ${shortEncrypt} | ${currentIterations.replace('Iterations-', '')} | ${currentEncode.replace('Base', '')} | ${currentDummyEmoji.replace('DummyEmoji-', '').replace('%', '')}% | ${currentEmoji.replace('Emoji-', '')} |`; // Keep % in display
}

// Initialize menu state
function initializeMenuState() {
    // Set Default as active
    defaultBtn.classList.add("active");
    customBtn.classList.remove("active");
    isDefaultMode = true;
    
    // Set AES-256-GCM, Base64, and Emoji-v13.1 as active by default in HTML
    // No need for JS to set initial active state for these anymore
    // setActiveOption(optionCipherContainer, "AES-256-GCM");
    // setActiveOption(optionBaseContainer, "Base64");
}

// Toggle dropdown menu
cipherSubtitle.addEventListener("click", (e) => {
    e.stopPropagation();
    cipherMenu.classList.toggle("show");
    // Close language dropdown if open
    if (window.languageDropdown.classList.contains('show')) {
        window.languageDropdown.classList.remove('show');
    }
});

// Mode switching for Default/Custom
defaultBtn.addEventListener("click", () => {
    // Always switch to default mode and set defaults
    currentEncrypt = "AES-256-GCM";
    currentIterations = "Iterations-100k"; // ADDED
    currentEncode = "Base64";
    currentEmoji = "Emoji-v13.1"; // CHANGED DEFAULT
    currentDummyEmoji = 'DummyEmoji-0%'; // ADDED Default with %
    switchCipherMode("default");
    
    // Visual state is handled by switchCipherMode and setActiveOption
    
    // updateSubtitle(); // Called within switchCipherMode now
});

customBtn.addEventListener("click", () => {
    // Set the desired defaults for Custom mode FIRST
    currentEncrypt = 'AES-256-GCM';
    currentIterations = 'Iterations-1M'; // Custom default Iterations
    currentEncode = 'Base2048';
    currentEmoji = 'Emoji-v15.1'; // Keep this custom default or change if needed
    currentDummyEmoji = 'DummyEmoji-5%'; // CHANGED Custom Default to 5%
    
    // Now switch the mode; it will use the values set above
    switchCipherMode("custom");
    
    // Visual state and subtitle update are handled by switchCipherMode

    // updateSubtitle(); // Called within switchCipherMode now
});

function switchCipherMode(mode) {
    isDefaultMode = mode === "default";
    
    // Update button states
    defaultBtn.classList.toggle('active', isDefaultMode);
    customBtn.classList.toggle('active', !isDefaultMode);
    
    // Update custom option visibility based on mode
    // (Add logic here if custom options should be hidden/disabled in default mode)
    // For now, we assume they remain visible/enabled
    
    if (isDefaultMode) {
        // Reset to default values
        currentEncrypt = 'AES-256-GCM';
        currentIterations = 'Iterations-100k'; // ADDED
        currentEncode = 'Base64';
        currentEmoji = 'Emoji-v13.1'; // CHANGED DEFAULT
        currentDummyEmoji = 'DummyEmoji-0%'; // ADDED Default with %
        
        // Select the default options visually in the custom sections
        setActiveOption(optionAlgorithmContainer, 'AES-256-GCM');
        setActiveOption(optionIterationsContainer, 'Iterations-100k'); // ADDED
        setActiveOption(optionBaseContainer, 'Base64');
        setActiveOption(optionEmojiContainer, 'Emoji-v13.1'); // CHANGED DEFAULT
        setActiveOption(optionDummyEmojiContainer, 'DummyEmoji-0%'); // ADDED Default with %
    } else {
        // When switching to custom, ensure the current selections are visually active
        setActiveOption(optionAlgorithmContainer, currentEncrypt);
        setActiveOption(optionIterationsContainer, currentIterations); // ADDED
        setActiveOption(optionBaseContainer, currentEncode);
        setActiveOption(optionEmojiContainer, currentEmoji); // ADDED
        setActiveOption(optionDummyEmojiContainer, currentDummyEmoji); // ADDED
    }
        
    updateSubtitle();
}

// Helper function to set the active button in an option group
function setActiveOption(container, value) {
    if (!container) return;
    const buttons = container.querySelectorAll('.mode-btn-menu');
    buttons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.value === value);
    });
}

// Helper function to set up option group behavior
function setupOptionGroup(container, callback) {
    if (!container) return;
    container.addEventListener('click', (e) => {
        const targetButton = e.target.closest('.mode-btn-menu');
        if (!targetButton) return;

        const value = targetButton.dataset.value;
        if (!value) return;

        // Update active state within the group
        setActiveOption(container, value);

        // Call the callback to update the state variable (currentEncrypt or currentEncode)
        if (callback) {
            callback(value);
        }
        
        // --- NEW LOGIC: Check for Default combination --- 
        if (currentEncrypt === 'AES-256-GCM' && 
            currentIterations === 'Iterations-100k' && // ADDED check
            currentEncode === 'Base64' && 
            currentEmoji === 'Emoji-v13.1' &&
            currentDummyEmoji === 'DummyEmoji-0%') { // CHANGED DEFAULT CHECK with %
            // If the current combination *is* the default, switch to Default mode.
            // switchCipherMode will update buttons and subtitle.
            switchCipherMode('default');
        } else {
            // If the current combination is *not* the default, ensure we are in Custom mode.
            if (isDefaultMode) {
                // If we were previously in Default mode, switch to Custom.
                // switchCipherMode will update buttons and subtitle.
                switchCipherMode('custom');
            } else {
                // If we were already in Custom mode, the mode doesn't change,
                // but the subtitle needs updating to reflect the new selection.
                updateSubtitle();
            }
        }
        // --- END NEW LOGIC ---
    });
}

// Event listeners for new option groups
setupOptionGroup(optionAlgorithmContainer, (value) => {
    currentEncrypt = value;
    updateSubtitle();
});

setupOptionGroup(optionIterationsContainer, (value) => {
    currentIterations = value;
    updateSubtitle();
});

setupOptionGroup(optionBaseContainer, (value) => {
    currentEncode = value;
    updateSubtitle();
});

setupOptionGroup(optionEmojiContainer, (value) => {
    currentEmoji = value;
    updateSubtitle();
});

setupOptionGroup(optionDummyEmojiContainer, (value) => { // ADDED
    currentDummyEmoji = value;
    updateSubtitle();
});

// Close dropdown when clicking outside (Handles BOTH menus now)
document.addEventListener('click', (e) => {
    const target = e.target;

    // Close cipher menu if click is outside subtitle container AND not the subtitle itself
    if (cipherMenu && cipherSubtitle && !target.closest('.subtitle-container') && !target.isEqualNode(cipherSubtitle)) {
        cipherMenu.classList.remove('show');
    }

    // Close language menu if click is outside language selector AND not the language link itself
    // MOVED TO language.js
    // if (window.languageDropdown && window.languageLink && !target.closest('.language-selector') && !target.isEqualNode(window.languageLink)) {
    //     window.languageDropdown.classList.remove('show');
    // }
});

// Mode switch functionality
// IMPORTANT: Make isEncryptMode global so language.js can access it for switchMode call
window.isEncryptMode = isEncryptMode;
// IMPORTANT: Make switchMode global so language.js can call it
window.switchMode = switchMode;
function switchMode(mode, saveState = true) { // Add saveState flag
    if (saveState) {
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
    }
    
    isEncryptMode = mode === 'encrypt';
    window.isEncryptMode = isEncryptMode; // Update global variable
    
    // Update button states - MOVED OUTSIDE if(saveState)
    encryptBtn.classList.toggle('active', isEncryptMode);
    decryptBtn.classList.toggle('active', !isEncryptMode);
    
    // Update action button text with emoji
    actionBtn.innerHTML = isEncryptMode ? '<span>🔒</span>' : '<span>🔓</span>';
    
    // Update placeholders using translations (using global getTranslation)
    // Ensure elements exist before setting placeholder
    if (inputText) inputText.placeholder = window.getTranslation(isEncryptMode ? 'inputPlaceholderEncrypt' : 'inputPlaceholderDecrypt');
    if (outputText) outputText.placeholder = window.getTranslation(isEncryptMode ? 'outputPlaceholderEncrypt' : 'outputPlaceholderDecrypt');

    if (saveState) {
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
    }
    
    if (saveState) {
        // 重置所有按钮状态 (除了密码框内容)
        // Ensure buttons exist before accessing classList
        if (outputButtons.copy) outputButtons.copy.classList.remove('is-success');
        if (passwordButtons.generate) passwordButtons.generate.classList.remove('is-success');
        if (passwordButtons.clear) passwordButtons.clear.classList.remove('is-success', 'is-query');
        if (inputButtons.clear) inputButtons.clear.classList.remove('is-success', 'is-query');

        // Update button visibility states (Ensure functions exist)
        if (typeof updateInputButtonState === 'function') updateInputButtonState();
        if (typeof updatePasswordButtonState === 'function') updatePasswordButtonState();
        if (typeof updatePasswordVisibilityState === 'function') updatePasswordVisibilityState();
    }
}

// 滚动到页面顶部的函数，结合多种方法确保最大兼容性
function scrollToTop() {
    const paddingTop = parseFloat(getComputedStyle(document.body).paddingTop);
  
    // 选择滚动容器：优先 document.documentElement，其次 document.body，最后 window
    const scrollContainer =
      document.documentElement.scrollHeight > document.documentElement.clientHeight
        ? document.documentElement
        : document.body.scrollHeight > document.body.clientHeight
        ? document.body
        : window;
  
    // 执行滚动，抵消 padding-top
    scrollContainer.scrollTo({
      top: -paddingTop,
      behavior: 'smooth'
    });
}

function collapseAllTextareas() {
    if (inputText.classList.contains('expanded')) {
        inputText.classList.remove('expanded');
        inputButtons.expand.classList.remove('is-success');
        container.classList.remove('input-expanded');
        inputText.blur(); // Optional: remove focus
    }
    if (outputText.classList.contains('expanded')) {
        outputText.classList.remove('expanded');
        outputButtons.expand.classList.remove('is-success');
        container.classList.remove('output-expanded');
        outputText.blur(); // Optional: remove focus
    }
    
    // 使用新的滚动函数
    scrollToTop();
}

// Event listeners for mode switching
encryptBtn.addEventListener('click', () => {
    if (isEncryptMode) {
        collapseAllTextareas();
        if (!inputText.value.trim()) {
            alert(window.getTranslation('alertNoInput')); // Use global translation
            return;
        }
        // --- New Cache Handling Logic for Encryption ---
        let dataToOutput;
        if (encryptState.cachedInputData) {
            // Use cached data if available (from file upload)
            dataToOutput = encryptState.cachedInputData;
        } else {
            // Generate cache data for direct input
            try {
                 dataToOutput = {
                    filename: "content.txt",
                    data: unicodeToBase64(inputText.value)
                 };
                 // Optionally update the cache for potential reuse
                 // encryptState.cachedInputData = dataToOutput; 
            } catch (error) {
                 console.error('Error encoding direct input Base64:', error);
                 alert(window.getTranslation('alertEncodeError', error.message || 'Error encoding input content.'));
                 outputText.value = ''; // Clear output on error
                 return;
            }
        }
        
        try {
            // Output the structured data as a JSON string
            outputText.value = JSON.stringify(dataToOutput, null, 2); // Pretty print JSON
        } catch (error) {
             console.error('Error stringifying JSON data:', error);
             alert(window.getTranslation('alertJSONError', 'Error formatting output data.'));
             outputText.value = ''; // Clear output on error
             return;
        }
        // --- End New Logic ---

        // 触发表单提交来激活浏览器密码保存功能
        if (password.value) {
            document.getElementById('passwordForm').requestSubmit();
        }
    } else {
        switchMode('encrypt');
    }
});

decryptBtn.addEventListener('click', () => {
    if (!isEncryptMode) {
        collapseAllTextareas();
        if (!inputText.value.trim()) {
            alert(window.getTranslation('alertNoInput')); // Use global translation
            return;
        }
        // Decrypt mode still uses placeholder logic
        outputText.value = inputText.value; // Placeholder logic

        // 触发表单提交来激活浏览器密码保存功能
        if (password.value) {
            document.getElementById('passwordForm').requestSubmit();
        }
    } else {
        switchMode('decrypt');
    }
});

// Copy text to clipboard (Adapted for Input)
async function copyInputToClipboard() {
    if (!inputText.value) return false; // Indicate failure if empty

    try {
        await navigator.clipboard.writeText(inputText.value);
        return true; // Indicate success
    } catch (err) {
        console.error('Failed to copy input text: ', err);
        alert(window.getTranslation('alertCopyTextFailed'));
        return false; // Indicate failure
    }
}

// Paste text from clipboard (Return success indicator)
async function pasteFromClipboard(textarea) {
    try {
        const text = await navigator.clipboard.readText();
        // Check if text was actually read (clipboard might be empty or denied)
        if (typeof text === 'string') { 
        textarea.value = text;
            // Manually trigger input event AFTER changing value
            textarea.dispatchEvent(new Event('input', { bubbles: true })); 
            return true; // Indicate success
        }
        return false; // Indicate failure (no text read)
    } catch (err) {
        if (textarea === password) {
            console.error('Failed to paste password: ', err);
             // Avoid alert if it's just a lack of text/permission denied gracefully
            if (!err.message.includes('permission')) { 
                alert(window.getTranslation('alertPastePasswordFailed')); 
            }
        } else {
            console.error('Failed to paste text: ', err);
            // Avoid alert if it's just a lack of text/permission denied gracefully
            if (!err.message.includes('permission')) { 
                alert(window.getTranslation('alertPasteTextFailed')); 
            }
        }
        return false; // Indicate failure
    }
}

// --- NEW: Generic Copy to Clipboard Function ---
async function copyToClipboard(textareaElement, buttonElement) {
    const textToCopy = textareaElement.value;
    
    // Get references to the text spans WITHIN the specific button
    const defaultSpan = buttonElement.querySelector('.btn-text.default');
    const successSpan = buttonElement.querySelector('.btn-text.success');
    const querySpan = buttonElement.querySelector('.btn-text.query'); // Assuming .query class exists for empty state

    // Function to reset button to default state
    const resetToDefault = () => {
        if (defaultSpan) defaultSpan.style.opacity = '1';
        if (defaultSpan) defaultSpan.style.pointerEvents = 'auto';
        if (successSpan) successSpan.style.opacity = '0';
        if (successSpan) successSpan.style.pointerEvents = 'none';
        if (querySpan) querySpan.style.opacity = '0';
        if (querySpan) querySpan.style.pointerEvents = 'none';
        buttonElement.classList.remove('is-success', 'is-query');
    };
    
    if (!textToCopy.trim()) { // If empty or only whitespace
        if (querySpan) {
            // Show Empty state
            if (defaultSpan) defaultSpan.style.opacity = '0';
            if (successSpan) successSpan.style.opacity = '0';
            querySpan.style.opacity = '1';
            querySpan.style.pointerEvents = 'auto'; // Allow interaction if needed?
            buttonElement.classList.add('is-query'); // Use is-query class for visual feedback
            
            setTimeout(() => {
                resetToDefault();
            }, 500);
        } else {
            // Fallback if querySpan doesn't exist (should not happen now)
            buttonElement.classList.add('is-query');
            setTimeout(() => buttonElement.classList.remove('is-query'), 500);
        }
        return false; // Indicate failure (nothing to copy)
    }

    try {
        await navigator.clipboard.writeText(textToCopy);
        // Show Success state
        if (defaultSpan) defaultSpan.style.opacity = '0';
        if (successSpan) successSpan.style.opacity = '1';
        if (successSpan) successSpan.style.pointerEvents = 'auto';
        if (querySpan) querySpan.style.opacity = '0'; 
        buttonElement.classList.add('is-success');

        setTimeout(() => {
            resetToDefault();
        }, 500);
        return true; // Indicate success
    } catch (err) {
        console.error('Failed to copy text: ', err);
        alert(window.getTranslation('alertCopyTextFailed'));
        resetToDefault(); // Reset on error too
        // Optionally add an 'is-error' class here if needed
        return false; // Indicate failure
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
        // Reset paste button state for input - NOW handled by updateInputButtonState
        // inputButtons.paste.classList.remove('is-success'); 
        // --- ADDED: Update the combined button state --- 
        updateInputButtonState();
        // --- END ADDED ---
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
    closeDropdowns(); // Close dropdowns when expanding/collapsing
    const isExpanding = !inputText.classList.contains('expanded');
    const inputHadFocus = document.activeElement === inputText; // Check focus BEFORE changing anything

    // If output is expanded, collapse it first
    if (outputText.classList.contains('expanded')) {
        outputText.classList.remove('expanded');
        outputButtons.expand.classList.remove('is-success');
        container.classList.remove('output-expanded');
    }

    // Toggle input expansion
    inputText.classList.toggle('expanded', isExpanding); // Use toggle with force argument
    inputButtons.expand.classList.toggle('is-success', isExpanding);
    container.classList.toggle('input-expanded', isExpanding);

    if (isExpanding) {
        // NEW: If expanding on mobile AND input had focus, trigger resize logic if handler exists
        if (isMobileDevice() && inputHadFocus && elementWithActiveResizeListener === inputText && currentViewportResizeHandler) {
            // Use a short timeout to allow the 'expanded' class CSS transitions/layout to apply first
            setTimeout(currentViewportResizeHandler, 50);
        }
        // inputText.focus(); // Removed focus call
    } else {
        inputText.blur();
        // 折叠时滚动到顶部
        scrollToTop();
        // Ensure styles are reset when collapsing (blur handler also helps, but good to be explicit)
        const sectionElement = inputText.closest('.input-section');
        if (sectionElement) {
            sectionElement.style.maxHeight = '';
            sectionElement.style.overflowY = '';
        }
    }
});

// Combined Input Button (Paste/Copy) click listener
inputPasteBtn.addEventListener('click', async () => {
    const isEmpty = inputText.value.trim() === '';
    let success = false;

    if (isEmpty) {
        // --- PASTE LOGIC ---
        success = await pasteFromClipboard(inputText);
        if (success) {
            // Show 'Pasted' temporarily
            pasteTextSpan.style.opacity = '0';
            copyTextSpan.style.opacity = '0';
            pastedTextSpan.style.opacity = '1';
            copiedTextSpan.style.opacity = '0';
            pastedTextSpan.style.pointerEvents = 'auto';
            
            inputPasteBtn.classList.add('is-success'); // Add success class

            // After 0.5s, revert based on current content
            setTimeout(() => {
                updateInputButtonState(); // This will show Copy if content exists now
            }, 500);
        } else {
           // Handle paste failure? (Optional: show an error state?)
           // For now, just ensure it stays in Paste mode
           updateInputButtonState();
        }
    } else {
        // --- COPY LOGIC ---
        success = await copyInputToClipboard();
        if (success) {
            // Show 'Copied' temporarily
            pasteTextSpan.style.opacity = '0';
            copyTextSpan.style.opacity = '0';
            pastedTextSpan.style.opacity = '0';
            copiedTextSpan.style.opacity = '1';
            copiedTextSpan.style.pointerEvents = 'auto';
            
            inputPasteBtn.classList.add('is-success'); // Add success class

            // After 0.5s, revert to Copy state
            setTimeout(() => {
                 updateInputButtonState();
            }, 500);
        }
    }
});

inputButtons.clear.addEventListener('click', () => {
    // Re-enable input and remove special display class before clearing
    inputText.readOnly = false;
    inputText.classList.remove('filename-display');

    // If input is expanded, collapse it when clearing
    if (inputText.classList.contains('expanded')) {
        inputText.classList.remove('expanded');
        inputButtons.expand.classList.remove('is-success');
        container.classList.remove('input-expanded');
    }
    clearTextarea(inputText);
    inputText.blur();
    
    // 使用新的滚动函数
    scrollToTop();
});

// Output button event listeners
outputButtons.expand.addEventListener('click', (e) => {
    e.stopPropagation();
    closeDropdowns(); // Close dropdowns when expanding/collapsing
    const isExpanding = !outputText.classList.contains('expanded');
    const outputHadFocus = document.activeElement === outputText; // Check focus BEFORE changing anything

    // If input is expanded, collapse it first
    if (inputText.classList.contains('expanded')) {
        inputText.classList.remove('expanded');
        inputButtons.expand.classList.remove('is-success');
        container.classList.remove('input-expanded');
    }

    // Toggle output expansion
    outputText.classList.toggle('expanded', isExpanding); // Use toggle with force argument
    outputButtons.expand.classList.toggle('is-success', isExpanding);
    container.classList.toggle('output-expanded', isExpanding);

    if (isExpanding) {
        // NEW: If expanding on mobile AND output had focus, trigger resize logic if handler exists
        if (isMobileDevice() && outputHadFocus && elementWithActiveResizeListener === outputText && currentViewportResizeHandler) {
             // Use a short timeout to allow the 'expanded' class CSS transitions/layout to apply first
            setTimeout(currentViewportResizeHandler, 50);
        }
        // outputText.focus(); // Removed focus call
    } else {
        outputText.blur();
        // 折叠时滚动到顶部
        scrollToTop();
        // Ensure styles are reset when collapsing (blur handler also helps, but good to be explicit)
        const sectionElement = outputText.closest('.output-section');
        if (sectionElement) {
            sectionElement.style.maxHeight = '';
            sectionElement.style.overflowY = '';
        }
    }
});

outputButtons.copy.addEventListener('click', async () => {
    let textToCopy = outputText.value;
    let success = false;
    
    // 检查是否有缓存的完整加密结果
    if (isEncryptMode && encryptState.fullEncryptedOutput) {
        textToCopy = encryptState.fullEncryptedOutput;
    } else if (!isEncryptMode && decryptState.fullEncryptedOutput) {
        // (未来解密也可能需要截断和缓存)
        textToCopy = decryptState.fullEncryptedOutput;
    }
    
    if (textToCopy) {
        try {
            await navigator.clipboard.writeText(textToCopy);
            success = true;
        } catch (err) {
            console.error('Failed to copy output: ', err);
            alert(window.getTranslation('alertCopyFailed'));
        }
    }

    if (success) {
        outputButtons.copy.classList.add('is-success');
        setTimeout(() => outputButtons.copy.classList.remove('is-success'), 500);
    } else {
        // 如果复制失败或没有内容可复制，可以给用户反馈
        // 例如，短暂显示错误状态或禁用按钮
        if (!textToCopy) {
             outputButtons.copy.disabled = true; // 没有内容可复制时禁用
        }
    }
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
    
    // 使用新的滚动函数
    scrollToTop();
});

// Add input listeners to reset button state
inputText.addEventListener('input', () => {
    // Update the Paste/Copy button state whenever input changes
    updateInputButtonState(); 
    // Original logic for resetting other buttons (if any) can remain
    // inputButtons.paste.classList.remove('is-success'); // This line is now handled by updateInputButtonState
});

// Clear cache if user types directly into input
inputText.addEventListener('input', () => {
    const currentState = isEncryptMode ? encryptState : decryptState;
    currentState.cachedInputData = null;
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
        const fileName = file.name;
        const fileExtension = fileName.split('.').pop().toLowerCase();
        const currentState = isEncryptMode ? encryptState : decryptState;
        currentState.cachedInputData = null; // Clear cache initially

        if (isEncryptMode) {
            // Encrypt Mode: Allow any file, handle .txt specifically
            if (fileExtension === 'txt') {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const content = e.target.result;
                        currentState.cachedInputData = { filename: fileName, data: unicodeToBase64(content) };
                        inputText.value = content;
                        inputText.readOnly = false; // Ensure input is enabled
                        inputText.classList.remove('filename-display'); // Remove centering class
                    } catch (error) {
                        console.error('Error encoding Base64:', error);
                        alert(window.getTranslation('alertEncodeError', error.message || 'Error encoding file content.'));
                        inputText.value = ''; // Clear input on error
                        inputText.readOnly = false;
                        inputText.classList.remove('filename-display');
                        currentState.cachedInputData = null;
                    }
                };
                reader.onerror = () => {
                    alert(window.getTranslation('alertReadFileError', 'Error reading file.'));
                    console.error("Error reading file:", fileName);
                    inputText.value = '';
                    inputText.readOnly = false; // Ensure input is enabled on error
                    inputText.classList.remove('filename-display'); // Remove centering class
                    currentState.cachedInputData = null;
                };
                reader.readAsText(file);
            } else {
                // For non-.txt files in encrypt mode, read as Data URL
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const dataUrl = e.target.result;
                        const base64Data = dataUrl.substring(dataUrl.indexOf(',') + 1);
                        currentState.cachedInputData = { filename: fileName, data: base64Data };
                        inputText.value = `Uploaded [${fileName}]`;
                        inputText.readOnly = true; // Disable input
                        inputText.classList.remove('filename-display'); // 移除居中对齐类
                    } catch (error) {
                         console.error('Error processing Data URL:', error);
                         alert(window.getTranslation('alertReadFileError', error.message || 'Error processing file.'));
                         inputText.value = '';
                         inputText.readOnly = false;
                         inputText.classList.remove('filename-display');
                         currentState.cachedInputData = null;
                    }
                };
                reader.onerror = () => {
                    alert(window.getTranslation('alertReadFileError', 'Error reading file.'));
                    console.error("Error reading file:", fileName);
                    inputText.value = '';
                    inputText.readOnly = false; // Ensure input is enabled on error
                    inputText.classList.remove('filename-display'); // Remove centering class
                    currentState.cachedInputData = null;
                };
                reader.readAsDataURL(file);
            }
        } else {
            // Decrypt Mode: Only allow .txt files
            if (fileExtension === 'txt') {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const content = e.target.result;
                        currentState.cachedInputData = { filename: fileName, data: unicodeToBase64(content) };
                        inputText.value = content;
                        inputText.readOnly = false; // Ensure input is enabled
                        inputText.classList.remove('filename-display'); // Remove centering class
                    } catch (error) {
                        console.error('Error encoding Base64:', error);
                        alert(window.getTranslation('alertEncodeError', error.message || 'Error encoding file content.'));
                        inputText.value = ''; // Clear input on error
                        inputText.readOnly = false;
                        inputText.classList.remove('filename-display');
                        currentState.cachedInputData = null;
                    }
                };
                 reader.onerror = () => {
                    alert(window.getTranslation('alertReadFileError', 'Error reading file.'));
                    console.error("Error reading file:", fileName);
                    inputText.value = '';
                    inputText.readOnly = false; // Ensure input is enabled on error
                    inputText.classList.remove('filename-display'); // Remove centering class
                    currentState.cachedInputData = null;
                };
                reader.readAsText(file);
            } else {
                // Show error for non-.txt files in decrypt mode
                alert(window.getTranslation('alertInvalidFileType', 'Only .txt files are allowed in decrypt mode.'));
                inputText.value = ''; // Clear input
                inputText.readOnly = false; // Ensure input is enabled
                inputText.classList.remove('filename-display'); // Remove centering class
                currentState.cachedInputData = null; // Ensure cache is cleared
            }
        }
        // Clear file input value AFTER processing/error to allow re-selection
        fileInput.value = '';
    }
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const fileName = file.name;
        const fileExtension = fileName.split('.').pop().toLowerCase();
        const currentState = isEncryptMode ? encryptState : decryptState;
        currentState.cachedInputData = null; // Clear cache initially

        if (isEncryptMode) {
            // Encrypt Mode: Allow any file, handle .txt specifically
            if (fileExtension === 'txt') {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const content = e.target.result;
                        currentState.cachedInputData = { filename: fileName, data: unicodeToBase64(content) };
                        inputText.value = content;
                        inputText.readOnly = false; // Ensure input is enabled
                        inputText.classList.remove('filename-display'); // Remove centering class
                    } catch (error) {
                        console.error('Error encoding Base64:', error);
                        alert(window.getTranslation('alertEncodeError', error.message || 'Error encoding file content.'));
                        inputText.value = '';
                        inputText.readOnly = false;
                        inputText.classList.remove('filename-display');
                        currentState.cachedInputData = null;
                    }
                };
                 reader.onerror = () => {
                    alert(window.getTranslation('alertReadFileError', 'Error reading file.'));
                    console.error("Error reading file:", fileName);
                    inputText.value = '';
                    inputText.readOnly = false; // Ensure input is enabled on error
                    inputText.classList.remove('filename-display'); // Remove centering class
                    currentState.cachedInputData = null;
                    // fileInput.value = ''; // Clear input on error - ALREADY CLEARED LATER
                };
                reader.readAsText(file);
            } else {
                // For non-.txt files in encrypt mode, read as Data URL
                const reader = new FileReader();
                reader.onload = (e) => {
                     try {
                        const dataUrl = e.target.result;
                        const base64Data = dataUrl.substring(dataUrl.indexOf(',') + 1);
                        currentState.cachedInputData = { filename: fileName, data: base64Data };
                        inputText.value = `Uploaded [${fileName}]`;
                        inputText.readOnly = true; // Disable input
                        inputText.classList.remove('filename-display'); // 移除居中对齐类
                    } catch (error) {
                         console.error('Error processing Data URL:', error);
                         alert(window.getTranslation('alertReadFileError', error.message || 'Error processing file.'));
                         inputText.value = '';
                         inputText.readOnly = false;
                         inputText.classList.remove('filename-display');
                         currentState.cachedInputData = null;
                    }
                };
                reader.onerror = () => {
                    alert(window.getTranslation('alertReadFileError', 'Error reading file.'));
                    console.error("Error reading file:", fileName);
                    inputText.value = '';
                    inputText.readOnly = false; // Ensure input is enabled on error
                    inputText.classList.remove('filename-display'); // Remove centering class
                    currentState.cachedInputData = null;
                    // fileInput.value = ''; // Clear input on error - ALREADY CLEARED LATER
                };
                reader.readAsDataURL(file);
            }
        } else {
            // Decrypt Mode: Only allow .txt files
            if (fileExtension === 'txt') {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const content = e.target.result;
                        currentState.cachedInputData = { filename: fileName, data: unicodeToBase64(content) };
                        inputText.value = content;
                        inputText.readOnly = false; // Ensure input is enabled
                        inputText.classList.remove('filename-display'); // Remove centering class
                    } catch (error) {
                        console.error('Error encoding Base64:', error);
                        alert(window.getTranslation('alertEncodeError', error.message || 'Error encoding file content.'));
                        inputText.value = ''; // Clear input on error
                        inputText.readOnly = false;
                        inputText.classList.remove('filename-display');
                        currentState.cachedInputData = null;
                    }
                };
                 reader.onerror = () => {
                    alert(window.getTranslation('alertReadFileError', 'Error reading file.'));
                    console.error("Error reading file:", fileName);
                    inputText.value = '';
                    inputText.readOnly = false; // Ensure input is enabled on error
                    inputText.classList.remove('filename-display'); // Remove centering class
                    currentState.cachedInputData = null;
                };
                reader.readAsText(file);
            } else {
                // Show error for non-.txt files in decrypt mode
                alert(window.getTranslation('alertInvalidFileType', 'Only .txt files are allowed in decrypt mode.'));
                inputText.value = ''; // Clear input
                inputText.readOnly = false; // Ensure input is enabled
                inputText.classList.remove('filename-display'); // Remove centering class
                currentState.cachedInputData = null; // Ensure cache is cleared
            }
        }
        // Clear file input value AFTER processing/error to allow re-selection
        fileInput.value = '';
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
downloadFileArea.addEventListener('click', () => {
    // 确定要下载的内容
    let contentToDownload = outputText.value;
    if (isEncryptMode && encryptState.fullEncryptedOutput) {
        // 如果是加密模式且有完整的缓存结果，使用缓存结果
        contentToDownload = encryptState.fullEncryptedOutput;
    } else if (!contentToDownload) {
        // 如果没有缓存且文本框为空，则提示
        alert(window.getTranslation('alertNoContentToDownload'));
        return;
    }

    // 使用确定好的内容创建 Blob
    const blob = new Blob([contentToDownload], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'DarkEmoji.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // 自动设置焦点到输出框
    // outputText.focus(); // Removed focus call
});

// Action button click handler
actionBtn.addEventListener('click', async () => { // Make the handler async
    collapseAllTextareas();
    if (!inputText.value.trim()) {
        alert(window.getTranslation('alertNoInput')); // Use global translation
        return;
    }
    
    // Disable button during operation
    actionBtn.disabled = true;
    actionBtn.classList.add('is-loading'); // Add loading visual state
    outputText.value = ''; // Clear previous output
    let progressElement = null; // Element to show progress text
    
    // Function to update progress in the output textarea
    const updateProgress = (percentage) => {
        console.log(`Progress: ${percentage}%`); // Log progress
        if (!progressElement) {
            // Style for top-center positioning with default font size
            progressElement = document.createElement('div');
            progressElement.style.textAlign = 'center';
            progressElement.style.position = 'absolute';
            progressElement.style.top = '10px'; // Small offset from the top
            progressElement.style.left = '50%';
            progressElement.style.transform = 'translateX(-50%)'; // Only horizontal centering
            progressElement.style.color = 'var(--text-color)'; // Use theme color
            progressElement.style.width = '100px'; // Give it some width to prevent text wrapping issue at 100%
            progressElement.style.pointerEvents = 'none'; // Prevent blocking clicks on textarea
            outputText.parentNode.insertBefore(progressElement, outputText.nextSibling); // Insert after textarea
        }
        // Update text, handle completion
        if (percentage < 100) {
            // Display only the percentage
            progressElement.textContent = `${percentage}%`;
            outputText.style.opacity = '0.5'; // Dim textarea during progress
        } else {
            // Clear progress on completion/error
            if (progressElement) {
                progressElement.textContent = '';
                progressElement.remove(); // Remove the element
                progressElement = null;
            }
            outputText.style.opacity = '1'; // Restore textarea opacity
        }
    };
    
    if (isEncryptMode) {
         // --- New Cache Handling Logic for Encryption ---
        let dataToOutput;
        if (encryptState.cachedInputData) {
            // Use cached data if available (from file upload)
            dataToOutput = encryptState.cachedInputData;
        } else {
            // Generate cache data for direct input
            try {
                 dataToOutput = {
                    filename: "content.txt",
                    data: unicodeToBase64(inputText.value)
                 };
                 // Optionally update the cache for potential reuse
                 // encryptState.cachedInputData = dataToOutput; 
            } catch (error) {
                 console.error('Error encoding direct input Base64:', error);
                 alert(window.getTranslation('alertEncodeError', error.message || 'Error encoding input content.'));
                 outputText.value = ''; // Clear output on error
                 return;
            }
        }
        
        try {
            // 1. Prepare the JSON string from the data object
            jsonStringToEncrypt = JSON.stringify(dataToOutput); // No pretty print needed for encryption
        } catch (error) {
             console.error('Error stringifying JSON data:', error);
             alert(window.getTranslation('alertJSONError', 'Error formatting output data.'));
             outputText.value = ''; // Clear output on error
             actionBtn.disabled = false; // Re-enable button
             actionBtn.classList.remove('is-loading'); // Remove loading state
             updateProgress(100); // Clear progress indicator
             return;
        }
        // --- End New Logic ---
        
        // 2. Gather options and password
        const options = {
            selectedAlgorithm: currentEncrypt,
            selectedIterations: currentIterations,
            selectedBase: currentEncode,
            selectedDummyEmoji: currentDummyEmoji,
            selectedEmojiVersion: currentEmoji
        };
        const passwordValue = password.value;

        // 3. Call the encrypt function
        try {
            updateProgress(0); // Start progress
            const encryptedEmojiString = await encrypt(jsonStringToEncrypt, passwordValue, options, updateProgress);
            
            // 对结果进行处理：如果太长，则截断显示并提供复制按钮
            const MAX_DISPLAY_LENGTH = 1000; // 定义最大显示长度
            if (encryptedEmojiString.length > MAX_DISPLAY_LENGTH) {
                // 将表情字符串分割成数组，确保不会切断表情符号
                const emojiArray = Array.from(encryptedEmojiString);
                const header = `Showing [${MAX_DISPLAY_LENGTH}/${encryptedEmojiString.length}]\n`;
                const displayString = emojiArray.slice(0, MAX_DISPLAY_LENGTH).join('') + ' ...';
                outputText.value = header + displayString;
                
                // 激活或显示复制按钮 (假设outputButtons.copy存在)
                if (outputButtons.copy) {
                    outputButtons.copy.disabled = false;
                    // 移除可能存在的 is-success 状态
                    outputButtons.copy.classList.remove('is-success');
                    // 确保按钮可见（如果之前是隐藏的）
                    // outputButtons.copy.style.display = ''; 
                }
                
                // 将完整结果暂存，以便复制按钮使用
                encryptState.fullEncryptedOutput = encryptedEmojiString;
                decryptState.fullEncryptedOutput = null; // 清除解密缓存
                
            } else { // 结果未截断
                outputText.value = encryptedEmojiString; 
                // 移除禁用逻辑，确保复制按钮始终可用
                if (outputButtons.copy) {
                    outputButtons.copy.disabled = false; // 确保按钮可用
                    outputButtons.copy.classList.remove('is-success'); // 重置状态
                }
                encryptState.fullEncryptedOutput = null; // 清除缓存
                decryptState.fullEncryptedOutput = null;
            }
            
        } catch (error) {
            console.error('Encryption failed:', error);
            // Display a user-friendly error message
            outputText.value = `${window.getTranslation('errorPrefix', 'Error:')} ${error.message}`;
            // Consider showing a specific alert or more detail depending on the error type
            // alert(`${window.getTranslation('alertEncryptionFailed', 'Encryption failed:')} ${error.message}`);
        } finally {
            // 4. Re-enable button and clear progress regardless of success/failure
            actionBtn.disabled = false;
            actionBtn.classList.remove('is-loading');
            updateProgress(100);
        }
    } else {
        // Decrypt mode still uses placeholder logic
        outputText.value = inputText.value; // Placeholder logic
        actionBtn.disabled = false; // Re-enable button (placeholder)
        actionBtn.classList.remove('is-loading'); // Remove loading state (placeholder)
        
        // 对解密结果同样应用长度限制
        const decryptedText = inputText.value;
        const MAX_DISPLAY_LENGTH = 1000; // 定义最大显示长度
        
        if (decryptedText.length > MAX_DISPLAY_LENGTH) {
            // 将字符串分割成数组，确保不会切断表情符号
            const charArray = Array.from(decryptedText);
            const header = `Showing [${MAX_DISPLAY_LENGTH}/${decryptedText.length}]\n`;
            const displayString = charArray.slice(0, MAX_DISPLAY_LENGTH).join('') + ' ...';
            outputText.value = header + displayString;
            
            // 激活或显示复制按钮 (假设outputButtons.copy存在)
            if (outputButtons.copy) {
                outputButtons.copy.disabled = false;
                outputButtons.copy.classList.remove('is-success');
            }
            
            // 将完整结果暂存，以便复制按钮使用
            decryptState.fullEncryptedOutput = decryptedText;
            encryptState.fullEncryptedOutput = null; // 清除加密缓存
        } else {
            outputText.value = decryptedText;
            // 移除禁用逻辑，确保复制按钮始终可用
            if (outputButtons.copy) {
                outputButtons.copy.disabled = false;
                outputButtons.copy.classList.remove('is-success');
            }
            decryptState.fullEncryptedOutput = null;
            encryptState.fullEncryptedOutput = null;
        }
    }

    // 触发表单提交来激活浏览器密码保存功能
    if (password.value) {
        document.getElementById('passwordForm').requestSubmit();
    }
});

// Initialize on page load - MODIFIED
document.addEventListener('DOMContentLoaded', () => {
    initializeMenuState();
    updateSubtitle();
    updateInputButtonState(); 
    updatePasswordButtonState(); 
    updatePasswordVisibilityState(); 

    // Equalize button widths after initial render
    equalizeRowButtonWidths('#optionAlgorithm');
    equalizeRowButtonWidths('#optionIterations');
    equalizeRowButtonWidths('#optionBase');
    equalizeRowButtonWidths('#optionEmoji');

    // Apply initial language setting - REMOVED (Handled in language.js)
    // setLanguage(currentLanguage);

    // Language Selector Logic - REMOVED (Handled in language.js)
    // if (languageLink && languageDropdown && languageOptions.length > 0) { ... }
});

// Initialize mode - Needs to run after language is set
// switchMode('encrypt'); // Now called indirectly by setLanguage in language.js

// Theme switching
title.addEventListener('click', () => {
    isDarkTheme = !isDarkTheme;
    localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', isDarkTheme ? 'dark' : 'light');
});

// Initialize theme
document.documentElement.setAttribute('data-theme', isDarkTheme ? 'dark' : 'light');

// --- New Function: Copy Password ---
async function copyPasswordToClipboard() {
    if (!password.value) return false; // Indicate failure if empty
    try {
        await navigator.clipboard.writeText(password.value);
        return true; // Indicate success
    } catch (err) {
        console.error('Failed to copy password: ', err);
        alert(window.getTranslation('alertCopyPasswordFailed'));
        return false; // Indicate failure
    }
}

// Combined Password Button (Button 2 - Paste/Copy) click listener
passwordPasteBtn.addEventListener('click', async () => {
    const isEmpty = password.value.trim() === '';
    let success = false;

    if (isEmpty) {
        // --- PASTE LOGIC ---
        success = await pasteFromClipboard(password);
        if (success) {
            // Show 'Pasted' temporarily
            pwdPasteTextSpan.style.opacity = '0';
            pwdCopyTextSpan.style.opacity = '0';
            pwdPastedTextSpan.style.opacity = '1';
            pwdCopiedTextSpan.style.opacity = '0';
            pwdPastedTextSpan.style.pointerEvents = 'auto';
            passwordPasteBtn.classList.add('is-success');

            setTimeout(() => {
                updatePasswordButtonState(); // Shows 'Copy' if content exists
            }, 500);
        } else {
            updatePasswordButtonState(); // Stay in 'Paste' on failure
        }
    } else {
        // --- COPY LOGIC ---
        success = await copyPasswordToClipboard(); 
        if (success) {
            // Show 'Copied' temporarily
            pwdPasteTextSpan.style.opacity = '0';
            pwdCopyTextSpan.style.opacity = '0';
            pwdPastedTextSpan.style.opacity = '0';
            pwdCopiedTextSpan.style.opacity = '1';
            pwdCopiedTextSpan.style.pointerEvents = 'auto';
            passwordPasteBtn.classList.add('is-success');
            
            // Also reset the original copy button's success state
            passwordButtons.copy.classList.remove('is-success');

            setTimeout(() => {
                updatePasswordButtonState(); // Revert to 'Copy'
            }, 500);
        }
    }
    // Reset Generate button state if paste/copy occurred
    if (success) {
        passwordButtons.generate.classList.remove('is-success');
        // Save password to current mode state
        if (isEncryptMode) {
            encryptState.password = password.value;
        } else {
            decryptState.password = password.value;
        }
    }
});

// Clear 清除密码
passwordButtons.clear.addEventListener('click', () => {
    const wasEmpty = password.value.trim() === '';
    password.value = '';
    if (isEncryptMode) {
        encryptState.password = '';
    } else {
        decryptState.password = '';
    }
    
    // Update combined button state AFTER clearing
    updatePasswordButtonState(); 
    
    if (wasEmpty) {
        passwordButtons.clear.classList.add('is-query');
        setTimeout(() => passwordButtons.clear.classList.remove('is-query'), 500);
    } else {
        passwordButtons.clear.classList.add('is-success');
        setTimeout(() => passwordButtons.clear.classList.remove('is-success'), 500);
    }
    
    // Reset Generate button state
    passwordButtons.generate.classList.remove('is-success');
    password.blur();
    
    // 使用新的滚动函数
    scrollToTop();
});

// Generate 生成随机密码
passwordButtons.generate.addEventListener('click', () => {
    // 生成16位强随机密码，包含大小写字母、数字和特殊字符
    const length = 16;
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}|;:,.<>?';
    let generatedPassword = '';
    const randomValues = new Uint32Array(length);
    window.crypto.getRandomValues(randomValues);
    for (let i = 0; i < length; i++) {
        generatedPassword += charset[randomValues[i] % charset.length];
    }
    password.value = generatedPassword;
    // 强制设置为密码类型（隐藏）
    password.type = 'password'; 
    
    if (isEncryptMode) {
        encryptState.password = password.value;
    } else {
        decryptState.password = password.value;
    }
    passwordButtons.generate.classList.add('is-success');
    
    // Update combined button state AFTER generating
    updatePasswordButtonState(); 
    // 更新可见性按钮状态
    updatePasswordVisibilityState(); 
    
    // 0.5秒后恢复到Generate状态
    setTimeout(() => {
        passwordButtons.generate.classList.remove('is-success');
    }, 500);
});

// Password input listener
password.addEventListener('input', () => {
    // Update the Paste/Copy button state whenever input changes
    updatePasswordButtonState(); 
    // Reset Generate button state
    passwordButtons.generate.classList.remove('is-success');
    // Save password to current mode state
    if (isEncryptMode) {
        encryptState.password = password.value;
    } else {
        decryptState.password = password.value;
    }
});

// --- 新增：移动设备输入框自动滚动，使光标居中 ---

function isMobileDevice() {
    // 主要基于触摸支持判断
    return ('ontouchstart' in window || navigator.maxTouchPoints > 0);
}

// 估算光标在 textarea 内的垂直偏移 (像素)
function getCursorVerticalOffset(element) {
    if (!element || typeof element.selectionStart === 'undefined') {
        return 0;
    }

    const textBeforeCursor = element.value.substring(0, element.selectionStart);
    const lineCount = (textBeforeCursor.match(/\n/g) || []).length;

    // 尝试获取计算后的行高，如果失败则估算
    let lineHeight = 20; // Default fallback
    try {
        const computedStyle = window.getComputedStyle(element);
        const lineHeightString = computedStyle.lineHeight;
        const fontSizeString = computedStyle.fontSize;
        
        if (lineHeightString && lineHeightString !== 'normal') {
            lineHeight = parseFloat(lineHeightString);
        } else if (fontSizeString) {
            // 如果行高是 normal，根据字体大小估算 (常见比例 1.2 to 1.5)
            lineHeight = parseFloat(fontSizeString) * 1.4;
        }
        // 确保行高是有效数字
        if (isNaN(lineHeight) || lineHeight <= 0) {
            lineHeight = 20; 
        }
    } catch (e) {
        console.error("Error getting computed style for line height:", e);
        lineHeight = 20; // Fallback on error
    }
    
    // 估算偏移量 = 行数 * 行高
    // 添加半行高，使光标行大致居中
    return (lineCount * lineHeight) + (lineHeight / 2);
}

// 将包含光标的行滚动到可视区域中间
function scrollCursorLineToCenter(element) {
    if (!element || typeof element.getBoundingClientRect !== 'function') return;

    const visualViewport = window.visualViewport;
    if (!visualViewport) return; // 需要 visualViewport API

    const elementRect = element.getBoundingClientRect();
    const cursorOffsetInTextarea = getCursorVerticalOffset(element);

    // 光标相对于文档顶部的绝对位置
    const cursorAbsoluteTop = window.scrollY + elementRect.top + cursorOffsetInTextarea;

    // 目标滚动位置：将光标置于可视区域的中间
    const targetScrollY = cursorAbsoluteTop - (visualViewport.height / 2);

    // 确保滚动位置在有效范围内
    const maxScrollY = document.documentElement.scrollHeight - visualViewport.height;
    const finalScrollY = Math.max(0, Math.min(targetScrollY, maxScrollY));

    // 平滑滚动到目标位置
    window.scrollTo({
        top: finalScrollY,
        behavior: 'smooth'
    });
}

let scrollTimeoutId = null;

// Store the resize handler reference for removal
let currentViewportResizeHandler = null;
let elementWithActiveResizeListener = null;

// 新增函数，用于确保光标在文本框内可见居中
function ensureCursorVisibleInTextarea(textarea) {
    if (!textarea || typeof textarea.selectionStart === 'undefined') return;
    
    // 没有文本或光标不在末尾时才需要调整
    if (!textarea.value || textarea.selectionStart === 0) return;
    
    // 检查textarea是否使用了overflow:auto或scroll
    const style = window.getComputedStyle(textarea);
    if (style.overflowY !== 'auto' && style.overflowY !== 'scroll') return;
    
    // 创建一个临时的隐藏span来测量光标前文本的高度
    const tempSpan = document.createElement('span');
    tempSpan.style.position = 'absolute';
    tempSpan.style.visibility = 'hidden';
    tempSpan.style.whiteSpace = 'pre-wrap';
    tempSpan.style.wordWrap = 'break-word';
    tempSpan.style.overflow = 'hidden';
    tempSpan.style.width = `${textarea.clientWidth}px`; // 新方法：使用clientWidth获取内部宽度
    tempSpan.style.font = style.font;
    tempSpan.style.paddingLeft = style.paddingLeft;
    tempSpan.style.paddingRight = style.paddingRight;
    
    // 获取光标位置之前的文本
    const textBeforeCursor = textarea.value.substring(0, textarea.selectionStart);
    tempSpan.textContent = textBeforeCursor;
    
    // 添加到DOM以获取尺寸
    document.body.appendChild(tempSpan);
    
    // 获取光标位置的高度
    const cursorHeight = tempSpan.offsetHeight;
    
    // 移除临时元素
    document.body.removeChild(tempSpan);
    
    // 计算理想的滚动位置：使光标显示在textarea的中间位置
    const textareaHeight = textarea.clientHeight;
    const idealScrollTop = cursorHeight - (textareaHeight / 2);
    
    // 设置滚动位置, 使用平滑滚动
    textarea.scrollTo({
        top: idealScrollTop,
        behavior: 'smooth'
    });
}

function handleMobileInputFocus(event) {
    if (!isMobileDevice()) {
        return; // Non-mobile devices skip
    }

    const focusedElement = event.target;
    const visualViewport = window.visualViewport;

    if (!visualViewport) return;

    // --- Clean up previous listener if focus shifts rapidly ---
    if (elementWithActiveResizeListener && currentViewportResizeHandler) {
        visualViewport.removeEventListener('resize', currentViewportResizeHandler);
        const previousSection = elementWithActiveResizeListener.closest('.input-section') || elementWithActiveResizeListener.closest('.output-section');
        if (previousSection) {
            previousSection.style.maxHeight = '';
            previousSection.style.overflowY = '';
        }
        currentViewportResizeHandler = null;
        elementWithActiveResizeListener = null;
    }
    // --- End cleanup ---

    const sectionElement = focusedElement.closest('.input-section') || focusedElement.closest('.output-section');
    if (!sectionElement) return; // Should not happen, but good practice

    const viewportResizeHandler = () => {
        // Ensure the element still has focus and is expanded
        if (document.activeElement !== focusedElement || !focusedElement.classList.contains('expanded')) {
            // If not, reset styles (might happen if blurred during resize)
            sectionElement.style.maxHeight = '';
            sectionElement.style.overflowY = '';
            return;
        }

        // Check if the keyboard is likely visible
        const keyboardVisible = window.innerHeight > visualViewport.height + 50;

        if (keyboardVisible) {
            const availableHeight = visualViewport.height;
            // Set maxHeight to fit the viewport, leave some small padding if desired (e.g., 10px)
            sectionElement.style.maxHeight = `${availableHeight - 10}px`;
            sectionElement.style.overflowY = 'auto'; // Allow internal scrolling

            // Scroll the focused *element* (textarea) into view
            // Align top of element with top of visual viewport
            focusedElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            
            // 确保文本框滚动到光标位置
            // 使用setTimeout确保先执行scrollIntoView
            setTimeout(() => {
                ensureCursorVisibleInTextarea(focusedElement);
            }, 100);
        } else {
            // Keyboard likely hidden, reset styles
            sectionElement.style.maxHeight = '';
            sectionElement.style.overflowY = '';
        }
    };

    // Store handler and element for potential cleanup
    currentViewportResizeHandler = viewportResizeHandler;
    elementWithActiveResizeListener = focusedElement;

    // Add the resize listener
    visualViewport.addEventListener('resize', viewportResizeHandler);

    // --- Add blur listener for cleanup ---
    const blurHandler = () => {
        visualViewport.removeEventListener('resize', viewportResizeHandler);
        // Reset styles when focus is lost
        sectionElement.style.maxHeight = '';
        sectionElement.style.overflowY = '';
        // Clear stored references
        if (elementWithActiveResizeListener === focusedElement) {
             currentViewportResizeHandler = null;
             elementWithActiveResizeListener = null;
        }
        // Remove this blur listener itself
        focusedElement.removeEventListener('blur', blurHandler);
    };
    focusedElement.addEventListener('blur', blurHandler);

    // --- Initial check in case keyboard is already open ---
    // Use a small timeout to allow layout to settle after focus
    setTimeout(viewportResizeHandler, 100);
}

// 为需要处理的文本输入框添加 focus 事件监听器
inputText.addEventListener('focus', handleMobileInputFocus);
outputText.addEventListener('focus', handleMobileInputFocus); // Output 也可能需要
// 密码框是单行，通常不需要特殊处理
// password.addEventListener('focus', handleMobileInputFocus); 

// --- 结束：移动设备输入框自动滚动 --- 

// Password visibility toggle button click handler
passwordCopyBtn.addEventListener('click', (e) => {
    // 阻止事件传播，避免意外交互
    e.preventDefault();
    e.stopPropagation();
    closeDropdowns(); // Close dropdowns when toggling visibility
    
    const isEmpty = password.value.trim() === '';
    if (isEmpty) return; // Do nothing if empty

    const isVisible = password.type === 'text';
    const cursorPosition = password.selectionStart;
    const scrollPosition = password.scrollLeft;
    
    // 记录当前焦点状态
    const hadFocus = document.activeElement === password;
    
    // 使用 requestAnimationFrame 来确保在下一帧执行
    requestAnimationFrame(() => {
        password.type = isVisible ? 'password' : 'text';
        // 在下一帧恢复光标位置和滚动位置
        requestAnimationFrame(() => {
            // 只有在之前就有焦点的情况下才恢复光标位置
            if (hadFocus) {
                password.setSelectionRange(cursorPosition, cursorPosition);
                password.scrollLeft = scrollPosition;
            } else if (document.activeElement === password) {
                // 如果之前没有焦点但现在获得了焦点，则移除焦点
                password.blur();
            }
        });
    });
    
    // Update button state with transition
    if (isVisible) {
        // Switching to hidden (Show state)
        hideTextSpan.style.opacity = '0';
        hideTextSpan.style.pointerEvents = 'none';
        showTextSpan.style.opacity = '1';
        showTextSpan.style.pointerEvents = 'auto';
    } else {
        // Switching to visible (Hide state)
        showTextSpan.style.opacity = '0';
        showTextSpan.style.pointerEvents = 'none';
        hideTextSpan.style.opacity = '1';
        hideTextSpan.style.pointerEvents = 'auto';
    }
});

// Update password visibility state when password changes
password.addEventListener('input', () => {
    updatePasswordVisibilityState();
    // Also update the Paste/Copy button state
    updatePasswordButtonState();
    // Reset Generate button state
    passwordButtons.generate.classList.remove('is-success');
    // Save password to current mode state
    if (isEncryptMode) {
        encryptState.password = password.value;
    } else {
        decryptState.password = password.value;
    }
});

// Initialize password visibility state
updatePasswordVisibilityState();

// Update password visibility state when mode changes -- REMOVING DUPLICATE FUNCTION
/*
function switchMode(mode) {
    // ... existing code ...
    updatePasswordVisibilityState();
    // ... existing code ...
}
*/

// Update password visibility state when clearing
passwordButtons.clear.addEventListener('click', () => {
    // ... existing code ...
    updatePasswordVisibilityState();
    // ... existing code ...
});

// Update password visibility state when generating
passwordButtons.generate.addEventListener('click', () => {
    // ... existing code ...
    updatePasswordVisibilityState();
    // ... existing code ...
});

// 防止密码表单提交
document.getElementById('passwordForm').addEventListener('submit', function(e) {
    e.preventDefault();
});

// Make cipherMenu globally accessible for language.js toggle/close functions
window.cipherMenu = cipherMenu;

// --- Helper Functions for Unicode Safe Base64 ---
function unicodeToBase64(str) {
    try {
        // 1. Encode string to UTF-8 bytes
        const encoder = new TextEncoder();
        const uint8Array = encoder.encode(str);
        // 2. Convert Uint8Array to a binary string (char codes match byte values)
        let binaryString = '';
        uint8Array.forEach(byte => {
            binaryString += String.fromCharCode(byte);
        });
        // 3. Encode binary string to Base64
        return btoa(binaryString);
    } catch (error) {
        console.error("Error encoding Unicode to Base64:", error);
        // Re-throw to allow caller-specific error handling (e.g., showing an alert)
        throw new Error('Failed to encode content to Base64.'); 
    }
}

function base64ToUnicode(base64) {
    try {
        // 1. Decode Base64 to binary string
        const binaryString = atob(base64);
        const len = binaryString.length;
        // 2. Convert binary string to Uint8Array
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        // 3. Decode UTF-8 bytes to string
        const decoder = new TextDecoder(); // Defaults to 'utf-8'
        return decoder.decode(bytes);
    } catch (error) {
        console.error("Error decoding Base64 to Unicode:", error);
         // Re-throw to allow caller-specific error handling
        throw new Error('Failed to decode Base64 content.');
    }
}

// --- Function to Equalize Button Widths --- 
function equalizeRowButtonWidths(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const buttons = container.querySelectorAll('.mode-btn-menu');
    if (!buttons || buttons.length === 0) return;

    let maxWidth = 0;
    // First pass: find the maximum width
    buttons.forEach(button => {
        // Temporarily remove min-width to measure natural width
        const originalMinWidth = button.style.minWidth;
        button.style.minWidth = '0';
        maxWidth = Math.max(maxWidth, button.scrollWidth);
        // Restore original min-width (or remove if it wasn't set)
        button.style.minWidth = originalMinWidth;
    });

    // Add a small buffer (e.g., 2px) for potential rounding/border issues
    // maxWidth += 2; 

    // Second pass: apply the maximum width as min-width
    buttons.forEach(button => {
        button.style.minWidth = `${maxWidth}px`;
    });
}

// Make the equalize function globally accessible for language.js
window.equalizeRowButtonWidths = equalizeRowButtonWidths;

// 添加更多事件监听，以确保文本输入时光标始终可见
inputText.addEventListener('input', () => {
    // 原有代码保持不变
    // Update the Paste/Copy button state whenever input changes
    updateInputButtonState(); 
    // Original logic for resetting other buttons (if any) can remain
    
    // --- REMOVED: 不再在输入时自动滚动 ---
    /* 
    if (inputText.classList.contains('expanded') && document.activeElement === inputText) {
        requestAnimationFrame(() => {
            ensureCursorVisibleInTextarea(inputText);
        });
    }
    */
});

outputText.addEventListener('input', () => {
    // --- REMOVED: 不再在输入时自动滚动 ---
    /*
    if (outputText.classList.contains('expanded') && document.activeElement === outputText) {
        requestAnimationFrame(() => {
            ensureCursorVisibleInTextarea(outputText);
        });
    }
    */
});

// 添加键盘选择事件监听，确保使用方向键改变光标位置时也能保持可见
inputText.addEventListener('keyup', (e) => {
    // 只监听可能改变光标位置的键：方向键、Home、End、PageUp、PageDown
    const cursorMovementKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown'];
    // --- REMOVED: 不再在键盘移动光标时自动滚动 ---
    /*
    if (cursorMovementKeys.includes(e.key) && inputText.classList.contains('expanded')) {
        ensureCursorVisibleInTextarea(inputText);
    }
    */
});

outputText.addEventListener('keyup', (e) => {
    // 只监听可能改变光标位置的键：方向键、Home、End、PageUp、PageDown
    const cursorMovementKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown'];
    // --- REMOVED: 不再在键盘移动光标时自动滚动 ---
    /*
    if (cursorMovementKeys.includes(e.key) && outputText.classList.contains('expanded')) {
        ensureCursorVisibleInTextarea(outputText);
    }
    */
});

// 点击文本框时也需要保持光标可见
inputText.addEventListener('click', () => {
    // --- REMOVED: 不再在点击时自动滚动 ---
    /*
    if (inputText.classList.contains('expanded')) {
        requestAnimationFrame(() => {
            ensureCursorVisibleInTextarea(inputText);
        });
    }
    */
});

outputText.addEventListener('click', () => {
    // --- REMOVED: 不再在点击时自动滚动 ---
    /*
    if (outputText.classList.contains('expanded')) {
        requestAnimationFrame(() => {
            ensureCursorVisibleInTextarea(outputText);
        });
    }
    */
});