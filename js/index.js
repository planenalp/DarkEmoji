function scrollCursorLineToCenter(element) {
    if (!element || typeof element.getBoundingClientRect !== 'function') return;

    const visualViewport = window.visualViewport;
    if (!visualViewport) return; // 需要 visualViewport API

    const elementRect = element.getBoundingClientRect();
    const cursorOffsetInTextarea = getCursorVerticalOffset(element);
    const textareaScrollTop = element.scrollTop; // 获取 textarea 的内部滚动位置

    // 计算光标相对于 textarea 可视区域顶部的偏移
    const cursorOffsetRelativeToVisibleTop = cursorOffsetInTextarea - textareaScrollTop;

    // 光标相对于文档顶部的绝对位置 (基于可视区域)
    const cursorAbsoluteTop = window.scrollY + elementRect.top + cursorOffsetRelativeToVisibleTop;

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