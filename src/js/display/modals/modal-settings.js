const settingsModal = document.getElementById('settingsModal');
const settingsBtn = document.getElementById('settingsBtn');
const hintToggleCheckbox = document.getElementById('hintToggle');

function openSettingsModal() {
    settingsModal.style.display = 'block';
    document.body.classList.add('modal-open');
    hintToggleCheckbox.checked = showHints;
    document.getElementById('showPathsToggle').checked = showPaths;
    document.getElementById('dynamicParityToggle').checked = useDynamicParity;
    document.getElementById('priorityLearningToggle').checked = enablePriorityLearning;
}

function closeSettingsModal() {
    settingsModal.style.display = 'none';
    document.body.classList.remove('modal-open');
}

function toggleHints(isChecked) {
    showHints = isChecked;
    localStorage.setItem('showHints', showHints);
    applyHintVisibility();
}

function applyHintVisibility() {
     if (showHints) {
        document.body.classList.remove('hide-hints');
    } else {
        document.body.classList.add('hide-hints');
    }
}

function toggleShowPaths(isChecked) {
    showPaths = isChecked;
    saveState();
    // No need to re-render cards, only affects modals
}

function toggleDynamicParity(isChecked) {
    useDynamicParity = isChecked;
    saveState();
    render(); // Re-render all cards with new parity labels
}

function togglePriorityLearning(isChecked) {
    enablePriorityLearning = isChecked;
    const priorityOption = document.getElementById('sortPriority');
    if (priorityOption) {
        priorityOption.style.display = isChecked ? 'block' : 'none';
    }
    // If disabling and currently on priority sort, switch to probability
    if (!isChecked && sortSelect.value === 'priority') {
        sortSelect.value = 'probability';
        filterAndSort();
    }
    saveState();
    render();
}

settingsBtn.onclick = openSettingsModal;


// Apply initial hint visibility state on load
applyHintVisibility();
