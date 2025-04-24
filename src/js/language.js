// Language DOM Elements
const languageLink = document.getElementById('languageLink');
const languageDropdown = document.getElementById('languageDropdown');
const languageOptions = languageDropdown?.querySelectorAll('.language-option'); // Add null check for safety

// Language State
let currentLanguage = localStorage.getItem('language') || 'en'; // Default to English

// Translations
const translations = {
    en: {
        mainTitle: 'DarkEmoji',
        defaultBtnText: 'Default',
        customBtnText: 'Custom',
        inputPlaceholderEncrypt: 'Input',
        inputPlaceholderDecrypt: 'Encrypted Input',
        expandBtnText: 'Expand',
        collapseBtnText: 'Collapse',
        pasteBtnText: 'Paste',
        copyBtnText: 'Copy',
        pastedBtnText: 'Pasted',
        copiedBtnText: 'Copied',
        clearBtnText: 'Clear',
        clearedBtnText: 'Cleared',
        emptyBtnText: 'Empty',
        selectOrDropText: 'Select or Drop',
        passwordPlaceholder: 'Password (optional)',
        showBtnText: 'Show',
        hideBtnText: 'Hide',
        generateBtnText: 'Generate',
        generatedBtnText: 'Generated',
        outputPlaceholderEncrypt: 'Output',
        outputPlaceholderDecrypt: 'Decrypted Output',
        downloadText: 'Download',
        aboutLinkText: 'About',
        githubLinkText: 'GitHub',
        alertNoInput: 'No text or files were entered.',
        alertNoContentToDownload: 'No content to download.',
        alertCopyTextFailed: 'Failed to copy text.',
        alertPasteTextFailed: 'Failed to paste text.',
        alertCopyPasswordFailed: 'Failed to copy password.',
        alertPastePasswordFailed: 'Failed to paste password.'
    },
    'zh-Hans': {
        mainTitle: '暗表情',
        defaultBtnText: '默认',
        customBtnText: '自定义',
        inputPlaceholderEncrypt: '输入',
        inputPlaceholderDecrypt: '加密输入',
        expandBtnText: '展开',
        collapseBtnText: '折叠',
        pasteBtnText: '粘贴',
        copyBtnText: '复制',
        pastedBtnText: '已粘贴',
        copiedBtnText: '已复制',
        clearBtnText: '清除',
        clearedBtnText: '已清除',
        emptyBtnText: '空',
        selectOrDropText: '选择或拖放',
        passwordPlaceholder: '密码（可选）',
        showBtnText: '显示',
        hideBtnText: '隐藏',
        generateBtnText: '生成',
        generatedBtnText: '已生成',
        outputPlaceholderEncrypt: '输出',
        outputPlaceholderDecrypt: '解密输出',
        downloadText: '下载',
        aboutLinkText: '关于',
        githubLinkText: 'GitHub',
        alertNoInput: '未输入任何文本或文件。',
        alertNoContentToDownload: '没有可下载的内容。',
        alertCopyTextFailed: '复制文本失败。',
        alertPasteTextFailed: '粘贴文本失败。',
        alertCopyPasswordFailed: '复制密码失败。',
        alertPastePasswordFailed: '粘贴密码失败。'
    },
    'zh-Hant': {
        mainTitle: '暗表情',
        defaultBtnText: '預設',
        customBtnText: '自訂',
        inputPlaceholderEncrypt: '輸入',
        inputPlaceholderDecrypt: '加密輸入',
        expandBtnText: '展開',
        collapseBtnText: '折疊',
        pasteBtnText: '貼上',
        copyBtnText: '複製',
        pastedBtnText: '已貼上',
        copiedBtnText: '已複製',
        clearBtnText: '清除',
        clearedBtnText: '已清除',
        emptyBtnText: '空',
        selectOrDropText: '選取或拖放',
        passwordPlaceholder: '密碼（可選）',
        showBtnText: '顯示',
        hideBtnText: '隱藏',
        generateBtnText: '產生',
        generatedBtnText: '已產生',
        outputPlaceholderEncrypt: '輸出',
        outputPlaceholderDecrypt: '解密輸出',
        downloadText: '下載',
        aboutLinkText: '關於',
        githubLinkText: 'GitHub',
        alertNoInput: '未輸入任何文字或檔案。',
        alertNoContentToDownload: '沒有可下載的內容。',
        alertCopyTextFailed: '複製文字失敗。',
        alertPasteTextFailed: '貼上文字失敗。',
        alertCopyPasswordFailed: '複製密碼失敗。',
        alertPastePasswordFailed: '貼上密碼失敗。'
    },
    ja: {
        mainTitle: 'ダーク絵文字',
        defaultBtnText: 'デフォルト',
        customBtnText: 'カスタム',
        inputPlaceholderEncrypt: '入力',
        inputPlaceholderDecrypt: '暗号化された入力',
        expandBtnText: '展開',
        collapseBtnText: '折りたたむ',
        pasteBtnText: '貼り付け',
        copyBtnText: 'コピー',
        pastedBtnText: '貼り付けました',
        copiedBtnText: 'コピーしました',
        clearBtnText: 'クリア',
        clearedBtnText: 'クリアしました',
        emptyBtnText: '空',
        selectOrDropText: '選択またはドロップ',
        passwordPlaceholder: 'パスワード（任意）',
        showBtnText: '表示',
        hideBtnText: '非表示',
        generateBtnText: '生成',
        generatedBtnText: '生成されました',
        outputPlaceholderEncrypt: '出力',
        outputPlaceholderDecrypt: '復号された出力',
        downloadText: 'ダウンロード',
        aboutLinkText: '情報',
        githubLinkText: 'GitHub',
        alertNoInput: 'テキストまたはファイルが入力されていません。',
        alertNoContentToDownload: 'ダウンロードする内容がありません。',
        alertCopyTextFailed: 'テキストのコピーに失敗しました。',
        alertPasteTextFailed: 'テキストの貼り付けに失敗しました。',
        alertCopyPasswordFailed: 'パスワードのコピーに失敗しました。',
        alertPastePasswordFailed: 'パスワードの貼り付けに失敗しました。'
    },
    ko: {
        mainTitle: '다크이모지',
        defaultBtnText: '기본값',
        customBtnText: '사용자 정의',
        inputPlaceholderEncrypt: '입력',
        inputPlaceholderDecrypt: '암호화된 입력',
        expandBtnText: '펼치기',
        collapseBtnText: '접기',
        pasteBtnText: '붙여넣기',
        copyBtnText: '복사',
        pastedBtnText: '붙여넣기 완료',
        copiedBtnText: '복사됨',
        clearBtnText: '지우기',
        clearedBtnText: '지워졌습니다',
        emptyBtnText: '비어 있음',
        selectOrDropText: '선택 또는 드롭',
        passwordPlaceholder: '비밀번호 (선택 사항)',
        showBtnText: '표시',
        hideBtnText: '숨기기',
        generateBtnText: '생성',
        generatedBtnText: '생성됨',
        outputPlaceholderEncrypt: '출력',
        outputPlaceholderDecrypt: '복호화된 출력',
        downloadText: '다운로드',
        aboutLinkText: '정보',
        githubLinkText: 'GitHub',
        alertNoInput: '텍스트나 파일이 입력되지 않았습니다.',
        alertNoContentToDownload: '다운로드할 내용이 없습니다.',
        alertCopyTextFailed: '텍스트 복사에 실패했습니다.',
        alertPasteTextFailed: '텍스트 붙여넣기에 실패했습니다.',
        alertCopyPasswordFailed: '비밀번호 복사에 실패했습니다.',
        alertPastePasswordFailed: '비밀번호 붙여넣기에 실패했습니다.'
    },
    ru: {
        mainTitle: 'Тёмные эмодзи',
        defaultBtnText: 'По умолчанию',
        customBtnText: 'Пользовательский',
        inputPlaceholderEncrypt: 'Ввод',
        inputPlaceholderDecrypt: 'Зашифрованный ввод',
        expandBtnText: 'Развернуть',
        collapseBtnText: 'Свернуть',
        pasteBtnText: 'Вставить',
        copyBtnText: 'Копировать',
        pastedBtnText: 'Вставлено',
        copiedBtnText: 'Скопировано',
        clearBtnText: 'Очистить',
        clearedBtnText: 'Очищено',
        emptyBtnText: 'Пусто',
        selectOrDropText: 'Выберите или перетащите',
        passwordPlaceholder: 'Пароль (необязательно)',
        showBtnText: 'Показать',
        hideBtnText: 'Скрыть',
        generateBtnText: 'Сгенерировать',
        generatedBtnText: 'Сгенерировано',
        outputPlaceholderEncrypt: 'Вывод',
        outputPlaceholderDecrypt: 'Расшифрованный вывод',
        downloadText: 'Скачать',
        aboutLinkText: 'О программе',
        githubLinkText: 'GitHub',
        alertNoInput: 'Текст или файлы не были введены.',
        alertNoContentToDownload: 'Нет содержимого для скачивания.',
        alertCopyTextFailed: 'Не удалось скопировать текст.',
        alertPasteTextFailed: 'Не удалось вставить текст.',
        alertCopyPasswordFailed: 'Не удалось скопировать пароль.',
        alertPastePasswordFailed: 'Не удалось вставить пароль.'
    }
};

// Helper function to get translation with fallback
function getTranslation(key, lang = currentLanguage) {
    return translations[lang]?.[key] || translations['en']?.[key] || key; // Fallback to English then the key itself
}

// Function to set the language
function setLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);

    if (!languageLink || !languageDropdown || !languageOptions) {
        console.error("Language elements not found for setting language.");
        return;
    }

    document.documentElement.lang = lang; // Update html lang attribute
    const selectedOption = languageDropdown.querySelector(`[data-lang="${lang}"]`);
    if (selectedOption) {
        languageLink.textContent = selectedOption.textContent;
    }

    // Update active state for language buttons
    languageOptions.forEach(option => {
        option.classList.toggle('active', option.dataset.lang === lang);
    });

    // Update elements with data-translate-key attribute
    document.querySelectorAll('[data-translate-key]').forEach(element => {
        const key = element.dataset.translateKey;
        // Check if it's a placeholder
        if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
            // Handle specific placeholders directly
            if (key === 'inputPlaceholderEncrypt' || key === 'outputPlaceholderEncrypt' || key === 'passwordPlaceholder') {
                 element.placeholder = getTranslation(key, lang);
            }
            // Input/Output placeholders related to mode are handled in switchMode (in index.js)
        } else {
            // Update textContent for other elements
             // Ensure the element to update actually exists
             if (element) {
                 element.textContent = getTranslation(key, lang);
             }
        }
    });

    // Restore the correct encryption/decryption mode placeholder AFTER updating general text
    if (window.switchMode && typeof window.switchMode === 'function') {
        const currentMode = window.isEncryptMode ? 'encrypt' : 'decrypt';
        window.switchMode(currentMode, false); // Call switchMode without saving state to update placeholders
    }

    // Equalize button widths after text updates
    if (window.equalizeRowButtonWidths && typeof window.equalizeRowButtonWidths === 'function') {
        window.equalizeRowButtonWidths('#optionAlgorithm');
        window.equalizeRowButtonWidths('#optionIterations');
        window.equalizeRowButtonWidths('#optionBase');
        window.equalizeRowButtonWidths('#optionEmoji');
    }
}

// Function to toggle language dropdown
function toggleLanguageDropdown(e) {
    e.preventDefault(); // Prevent adding # to URL
    e.stopPropagation();
    if (languageDropdown) {
        languageDropdown.classList.toggle('show');
        // Close cipher menu if open (assuming cipherMenu is globally accessible or passed)
        if (window.cipherMenu && window.cipherMenu.classList.contains('show')) {
            window.cipherMenu.classList.remove('show');
        }
    }
}

// Helper function to close dropdowns (now defined globally in index.js or here)
// We define it here to keep language logic together, assuming cipherMenu is global
function closeDropdowns() {
    if (window.cipherMenu) window.cipherMenu.classList.remove('show');
    if (languageDropdown) languageDropdown.classList.remove('show');
}


// --- Initial Setup and Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    // Ensure elements exist before proceeding
    if (!languageLink || !languageDropdown || !languageOptions) {
        console.error("Language UI elements not found on DOMContentLoaded.");
        return;
    }

    // Apply initial language setting
    setLanguage(currentLanguage);

    // Language Selector Logic
    languageLink.addEventListener('click', toggleLanguageDropdown);
    languageOptions.forEach(option => {
        option.addEventListener('click', () => {
            setLanguage(option.dataset.lang);
        });
    });
});

// Close language dropdown when clicking outside
document.addEventListener('click', (e) => {
    // Check if elements exist before accessing contains method
    if (languageDropdown && languageLink && !languageDropdown.contains(e.target) && !languageLink.contains(e.target)) {
        languageDropdown.classList.remove('show');
    }
});

// Make necessary functions/variables globally accessible if needed by index.js
// Be cautious with global scope; consider modules for larger projects.
window.getTranslation = getTranslation;
window.currentLanguage = currentLanguage; // index.js might need this for alerts if not passed
window.setLanguage = setLanguage;
window.toggleLanguageDropdown = toggleLanguageDropdown;
window.closeDropdowns = closeDropdowns; // Make closeDropdowns available globally
window.languageDropdown = languageDropdown; // Make dropdown accessible for closeDropdowns called from index.js 