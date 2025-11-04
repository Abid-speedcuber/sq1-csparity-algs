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

// Color Scheme Modal Functions
function openColorSchemeModal() {
    const modal = document.getElementById('colorSchemeModal');
    modal.style.display = 'block';
    
    // Set image size slider value
    const slider = document.getElementById('imageSizeSlider');
    if (slider) {
        slider.value = scrambleImageSize;
        document.getElementById('sizeValue').textContent = scrambleImageSize;
    }
    
    // Highlight currently selected colors
    document.querySelectorAll('.color-btn').forEach(btn => {
        const face = btn.getAttribute('data-face');
        const color = btn.getAttribute('data-color');
        const currentColor = colorScheme[face + 'Color'];
        
        if (color === currentColor) {
            btn.style.border = '3px solid #007bff';
            btn.style.fontWeight = 'bold';
        } else {
            btn.style.border = '2px solid #ddd';
            btn.style.fontWeight = 'normal';
        }
    });
}

function closeColorSchemeModal() {
    const modal = document.getElementById('colorSchemeModal');
    modal.style.display = 'none';
}

// Add click handlers for color buttons
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const face = this.getAttribute('data-face');
            const color = this.getAttribute('data-color');
            
            // Update color scheme
            colorScheme[face + 'Color'] = color;
            
            // Update button styles in the same group
            const sameFaceButtons = document.querySelectorAll(`.color-btn[data-face="${face}"]`);
            sameFaceButtons.forEach(b => {
                if (b === this) {
                    b.style.border = '3px solid #007bff';
                    b.style.fontWeight = 'bold';
                } else {
                    b.style.border = '2px solid #ddd';
                    b.style.fontWeight = 'normal';
                }
            });
        });
    });
});

function updateImageSizePreview(value) {
    document.getElementById('sizeValue').textContent = value;
    scrambleImageSize = parseInt(value);
}

function saveColorScheme() {
    saveState();
    closeColorSchemeModal();
    alert('Color scheme and image size saved! It will be applied to future training scrambles.');
}

function resetColorScheme() {
    colorScheme = {
        topColor: '#000000',
        bottomColor: '#FFFFFF',
        frontColor: '#CC0000',
        rightColor: '#00AA00',
        backColor: '#FF8C00',
        leftColor: '#0066CC',
        dividerColor: '#7a0000',
        circleColor: 'transparent'
    };
    scrambleImageSize = 200;
    saveState();
    openColorSchemeModal(); // Refresh the modal to show updated selection
    alert('Color scheme and image size reset to default!');
}

// Apply initial hint visibility state on load
applyHintVisibility();
