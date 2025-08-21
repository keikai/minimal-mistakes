/**
 * Code Copy Functionality
 * Adds copy buttons to code blocks with clipboard functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    initializeCodeCopy();
});

function initializeCodeCopy() {
    const codeBlocks = findAllCodeBlocks();
    codeBlocks.forEach(attachCopyButtonToCodeBlock);
}

function findAllCodeBlocks() {
    return document.querySelectorAll('figure.highlight, div.highlighter-rouge');
}

function attachCopyButtonToCodeBlock(block) {
    if (copyButtonAlreadyExists(block)) {
        return;
    }

    const copyButton = createCopyButton();
    setupCopyButtonEventListener(copyButton, block);
    positionCopyButtonInCodeBlock(copyButton, block);
}

function copyButtonAlreadyExists(block) {
    return block.querySelector('.code-copy-btn') !== null;
}

function createCopyButton() {
    const template = document.createElement('template');
    template.innerHTML = `<button class="code-copy-btn" title="Copy code" aria-label="Copy code to clipboard">
        <i class="fas fa-copy"></i>
    </button>`;
    return template.content.firstElementChild;
}

function setupCopyButtonEventListener(copyButton, codeBlock) {
    copyButton.addEventListener('click', function() {
        copyCodeToClipboard(codeBlock, copyButton);
    });
}

function positionCopyButtonInCodeBlock(copyButton, codeBlock) {
    codeBlock.style.position = 'relative';
    codeBlock.appendChild(copyButton);
}

function copyCodeToClipboard(codeBlock, button) {
    const codeText = extractCodeTextFromBlock(codeBlock);

    if (!codeText) {
        displayCopyErrorMessage(button, 'No code found');
        return;
    }

    attemptClipboardCopy(codeText, button);
}

function extractCodeTextFromBlock(codeBlock) {
    const rougeTable = codeBlock.querySelector('.rouge-table');

    if (rougeTable) {
        return extractTextFromRougeTable(rougeTable);
    } else {
        return extractTextFromSimpleCodeBlock(codeBlock);
    }
}

function extractTextFromRougeTable(rougeTable) {
    const codeCell = rougeTable.querySelector('td.code pre');
    return codeCell ? extractTextContent(codeCell) : '';
}

function extractTextFromSimpleCodeBlock(codeBlock) {
    const codeElement = codeBlock.querySelector('pre code, pre');
    return codeElement ? extractTextContent(codeElement) : '';
}

function attemptClipboardCopy(codeText, button) {
    if (supportsModernClipboardAPI()) {
        copyUsingClipboardAPI(codeText, button);
    } else {
        copyUsingFallbackMethod(codeText, button);
    }
}

function supportsModernClipboardAPI() {
    return navigator.clipboard && window.isSecureContext;
}

function copyUsingClipboardAPI(codeText, button) {
    navigator.clipboard.writeText(codeText).then(function() {
        displayCopySuccessMessage(button);
    }).catch(function() {
        copyUsingFallbackMethod(codeText, button);
    });
}

/* consider to remove this if most browsers support clipboard API*/
function copyUsingFallbackMethod(codeText, button) {
    fallbackCopyText(codeText, button);
}

function extractTextContent(element) {
    const clone = cloneElementWithoutLineNumbers(element);
    return cleanupExtractedText(clone);
}

function cloneElementWithoutLineNumbers(element) {
    const clone = element.cloneNode(true);
    removeLineNumberElements(clone);
    return clone;
}

function removeLineNumberElements(clone) {
    const lineNumbers = clone.querySelectorAll('.lineno, .line-number');
    lineNumbers.forEach(el => el.remove());
}

function cleanupExtractedText(clone) {
    let text = clone.textContent || clone.innerText || '';
    return normalizeTextLineBreaks(text);
}

function normalizeTextLineBreaks(text) {
    text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    text = text.replace(/^\n+|\n+$/g, '');
    return text;
}

function fallbackCopyText(text, button) {
    const textArea = createTemporaryTextArea(text);
    const success = executeDocumentCopyCommand(textArea);
    removeTemporaryTextArea(textArea);

    if (success) {
        displayCopySuccessMessage(button);
    } else {
        displayCopyErrorMessage(button, 'Copy failed');
    }
}

function createTemporaryTextArea(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    hideElementOffScreen(textArea);
    document.body.appendChild(textArea);
    return textArea;
}

function hideElementOffScreen(element) {
    element.style.position = 'fixed';
    element.style.left = '-999999px';
    element.style.top = '-999999px';
}

function executeDocumentCopyCommand(textArea) {
    try {
        textArea.focus();
        textArea.select();
        return document.execCommand('copy');
    } catch (err) {
        return false;
    }
}

function removeTemporaryTextArea(textArea) {
    document.body.removeChild(textArea);
}

function displayCopySuccessMessage(button) {
    createAndShowMessage(button, 'Copied!', 'success');
}

function displayCopyErrorMessage(button, message) {
    createAndShowMessage(button, message, 'error');
}

function createAndShowMessage(button, message, type) {
    const messageEl = createMessageElement(message, type);
    initializeMessageElementOpacity(messageEl);
    showMessageWithAnimation(messageEl, button);
}

function createMessageElement(message, type) {
    const template = document.createElement('template');
    template.innerHTML = `<span class="copy-message copy-message-${type}">${message}</span>`;
    return template.content.firstElementChild;
}

function initializeMessageElementOpacity(messageEl) {
    messageEl.style.opacity = '0';
}

function showMessageWithAnimation(messageEl, button) {
    button.parentNode.appendChild(messageEl);
    messageEl.style.opacity = '1';

    setTimeout(function() {
        hideAndRemoveMessage(messageEl);
    }, 1000);
}

function hideAndRemoveMessage(messageEl) {
    if (messageEl.parentNode) {
        messageEl.parentNode.removeChild(messageEl);
    }
}