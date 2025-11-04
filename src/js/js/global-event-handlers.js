document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// Drag and drop support
document.body.addEventListener('dragover', (e) => {
    e.preventDefault();
});

document.body.addEventListener('drop', (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].name.endsWith('.json')) {
        handleFileImport(files[0]);
    }
});

// Close modals when clicking outside
window.onclick = function(event) {
    const settingsModal = document.getElementById('settingsModal');
    const caseNameModal = document.getElementById('caseNameModal');
    const parityModal = document.getElementById('parityOrientationModal');
    const parityAnalysisModal = document.getElementById('parityAnalysisModal');
    const howToUseModal = document.getElementById('howToUseModal');
    const suggestModal = document.getElementById('suggestModal');
    const confessionModal = document.getElementById('confessionModal');
    const colorSchemeModal = document.getElementById('colorSchemeModal');
    const trainingModal = document.getElementById('trainingModal');
    
    if (event.target == settingsModal) {
        closeSettingsModal();
    }
    if (event.target == caseNameModal) {
        closeCaseNameModal();
    }
    if (event.target == parityModal) {
        closeParityOrientationModal();
    }
    if (event.target == parityAnalysisModal) {
        closeParityAnalysisModal();
    }
    if (event.target == colorSchemeModal) {
        closeColorSchemeModal();
    }
    if (trainingModal && event.target == trainingModal) {
        closeTrainingModal();
    }
    if (event.target == howToUseModal) {
        closeHowToUseModal();
    }
    if (event.target == suggestModal) {
        closeSuggestModal();
    }
    if (event.target == confessionModal) {
        closeConfessionModal();
    }
}

// Close modal if clicking outside the content
window.onclick = function(event) {
    if (event.target == settingsModal) {
        closeSettingsModal();
    }
    if (event.target == caseNameModal) {
        closeCaseNameModal();
    }
}