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
const passwordForm = document.getElementById('passwordForm');
const cipherSubtitle = document.getElementById('cipherSubtitle');
const cipherMenu = document.getElementById('cipherMenu');
const defaultBtn = document.getElementById('defaultBtn');
const customBtn = document.getElementById('customBtn');
const title = document.querySelector('.title');
const container = document.querySelector('.container'); // Get container element

// New Option Groups
const optionCipherContainer = document.getElementById('optionCipher');
const optionBaseContainer = document.getElementById('optionBase');

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
    if (window.languageDropdown) window.languageDropdown.classList.remove('show'); // Call global language dropdown if exists
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
    cipherSubtitle.textContent = `${currentEncrypt} & ${currentEncode}`;
}

// Initialize menu state
function initializeMenuState() {
    // Set Default as active
    defaultBtn.classList.add("active");
    customBtn.classList.remove("active");
    isDefaultMode = true;
    
    // Set AES-256-GCM and Base64 as active by default in HTML
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
    // Always switch to default mode and set AES-256-GCM and Base64
    currentEncrypt = "AES-256-GCM";
    currentEncode = "Base64";
    switchCipherMode("default");
    
    // Visual state is handled by switchCipherMode and setActiveOption
    
    // updateSubtitle(); // Called within switchCipherMode now
});

customBtn.addEventListener("click", () => {
    // Set the desired defaults for Custom mode FIRST
    currentEncrypt = 'AES-256-GCM';
    currentEncode = 'Base1024';
    
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
        currentEncode = 'Base64';
        
        // Select the default options visually in the custom sections
        setActiveOption(optionCipherContainer, 'AES-256-GCM');
        setActiveOption(optionBaseContainer, 'Base64');
    } else {
        // When switching to custom, ensure the current selections are visually active
        setActiveOption(optionCipherContainer, currentEncrypt);
        setActiveOption(optionBaseContainer, currentEncode);
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
        if (currentEncrypt === 'AES-256-GCM' && currentEncode === 'Base64') {
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

// --- Event Listeners ---

// Event listeners for new option groups
setupOptionGroup(optionCipherContainer, (value) => {
    currentEncrypt = value;
    // If custom mode isn't active, switch to it
    if (isDefaultMode) switchCipherMode('custom'); 
});

setupOptionGroup(optionBaseContainer, (value) => {
    currentEncode = value;
    // If custom mode isn't active, switch to it
    if (isDefaultMode) switchCipherMode('custom');
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

// Helper function to collapse any expanded textareas
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
}

// --- 新增：触发密码保存提示函数 ---
function triggerPasswordSavePrompt() {
    if (password && password.value && passwordForm) {
        // 创建一个临时的 submit 事件监听器
        const submitHandler = (event) => {
            event.preventDefault(); // 阻止实际的表单提交（页面刷新）
            console.log('Form submission prevented, triggering password save prompt.');
            // 移除监听器，避免内存泄漏
            passwordForm.removeEventListener('submit', submitHandler);
        };
        // 添加监听器
        passwordForm.addEventListener('submit', submitHandler);
        // 触发提交事件，这通常会提示浏览器保存密码
        passwordForm.requestSubmit(); 
        // 注意：如果 requestSubmit 不可用，可以回退到 passwordForm.submit()，
        // 但需要确保 submitHandler 能及时执行 preventDefault。
        // requestSubmit() 是更现代和推荐的方式。
    }
}

// Event listeners for mode switching
encryptBtn.addEventListener('click', () => {
    if (isEncryptMode) {
        collapseAllTextareas();
        // --- 触发密码保存 ---
        if (password.value) {
            triggerPasswordSavePrompt();
        }
        // --------------------
        if (!inputText.value.trim()) {
            alert(window.getTranslation('alertNoInput')); // Use global translation
            return;
        }
        // 这里可以保留原有的占位逻辑或移除，取决于是否需要在不切换模式时有其他行为
        // outputText.value = inputText.value; // Placeholder logic
    } else {
        switchMode('encrypt');
    }
});

decryptBtn.addEventListener('click', () => {
    if (!isEncryptMode) {
        collapseAllTextareas();
        // --- 触发密码保存 ---
        if (password.value) {
            triggerPasswordSavePrompt();
        }
        // --------------------
        if (!inputText.value.trim()) {
            alert(window.getTranslation('alertNoInput')); // Use global translation
            return;
        }
        // 这里可以保留原有的占位逻辑或移除
        // outputText.value = inputText.value; // Placeholder logic
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
    closeDropdowns(); // Close dropdowns when expanding/collapsing
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

outputButtons.copy.addEventListener('click', async () => {
    await copyToClipboard(outputText, outputButtons.copy);
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
    // Update the Paste/Copy button state whenever input changes
    updateInputButtonState(); 
    // Original logic for resetting other buttons (if any) can remain
    // inputButtons.paste.classList.remove('is-success'); // This line is now handled by updateInputButtonState
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
downloadFileArea.addEventListener('click', () => {
    if (!outputText.value) {
        alert(window.getTranslation('alertNoContentToDownload'));
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
actionBtn.addEventListener('click', async () => { // Make async for await
    collapseAllTextareas();
    const currentInput = inputText.value;
    const currentPassword = password.value;

    if (!currentInput.trim()) {
        alert(window.getTranslation('alertNoInput'));
        return;
    }

    // --- 触发密码保存 ---
    if (currentPassword) {
        triggerPasswordSavePrompt();
    }
    // --------------------

    actionBtn.disabled = true; // 禁用按钮防止重复点击
    actionBtn.classList.add('is-loading'); // 添加加载状态

    try {
        let result = '';
        if (isEncryptMode) {
            // 调用加密函数
            result = await Cipher.encrypt(currentInput, currentPassword, currentEncrypt, currentEncode);
        } else {
            // 调用解密函数
            result = await Cipher.decrypt(currentInput, currentPassword, currentEncrypt, currentEncode);
        }
        outputText.value = result;
        updateOutputButtonState(); // 更新输出按钮状态
    } catch (error) {
        console.error("Action failed:", error);
        // 根据错误类型显示不同提示
        if (isEncryptMode) {
            alert(`Encryption failed: ${error.message}`); 
        } else {
             // 解密失败通常是密码错误或数据损坏
            alert(`Decryption failed. Check password or input data. Details: ${error.message}`);
        }
        outputText.value = ''; // 清空输出
        updateOutputButtonState();
    } finally {
        actionBtn.disabled = false; // 重新启用按钮
        actionBtn.classList.remove('is-loading'); // 移除加载状态
    }
});

// Initialize on page load - MODIFIED
document.addEventListener('DOMContentLoaded', () => {
    initializeMenuState();
    updateSubtitle();
    updateInputButtonState(); 
    updatePasswordButtonState(); 
    updatePasswordVisibilityState(); 

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

function handleMobileInputFocus(event) {
    if (!isMobileDevice()) {
        return; // 非移动设备则跳过
    }

    const focusedElement = event.target;
    const visualViewport = window.visualViewport;

    if (!visualViewport) return;

    // 监听 visualViewport 的 resize 事件 (键盘弹出/收起会触发)
    const viewportResizeHandler = () => {
        // 清除之前的延时滚动，以处理快速的resize事件
        clearTimeout(scrollTimeoutId);

        // 设置一个短暂的延时，确保键盘动画完成且视口稳定
        scrollTimeoutId = setTimeout(() => {
            // 再次检查当前焦点元素是否还是之前的元素
            if (document.activeElement === focusedElement) {
                 // 检查键盘是否真的弹出了 (视口高度显著减小)
                 // 可以根据需要调整阈值
                if (window.innerHeight > visualViewport.height + 50) { 
                    scrollCursorLineToCenter(focusedElement);
                }
            }
            // 监听器已通过 { once: true } 自动移除，无需手动移除
        }, 150); // 150ms 延时，可以根据测试效果调整
    };

    // 添加一次性的 resize 监听器
    visualViewport.addEventListener('resize', viewportResizeHandler, { once: true, passive: true });

    // --- 备用逻辑：如果键盘已弹出时切换焦点 --- 
    // 如果视口高度已经小于窗口高度 (说明键盘可能已弹出), 立即尝试滚动
    if (window.innerHeight > visualViewport.height + 50) {
        // 使用一个稍长的延时，以防 resize 事件还未触发
        clearTimeout(scrollTimeoutId); // 清除可能存在的 resize 触发的延时
        scrollTimeoutId = setTimeout(() => {
            if (document.activeElement === focusedElement) {
                 // 再次检查键盘是否弹出
                 if (window.innerHeight > visualViewport.height + 50) {
                     scrollCursorLineToCenter(focusedElement);
                 }
            }
        }, 200); // 200ms 延时
    }
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