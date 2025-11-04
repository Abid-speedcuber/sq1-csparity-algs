let filteredData = [...data];
let learnedCases = new Set();
let learningCases = new Set();
let plannedCases = new Set();
let swappedCases = new Map(); // stores {caseName: true/false}
let comments = new Map(); // stores {caseName: "comment text"}
let plannedLevels = new Map(); // stores {caseName: 1-6}
let perCaseSwapLR = new Map(); // stores {caseName: true/false} for per-case L/R swap
let parityOrientations = new Map(); // stores {shapePattern: rotationAmount}

// User's saved preferences
let caseNameSettings = new Map(); // Stores {shape: "SelectedName"}
let customCaseNames = new Map();  // Stores {shape: "CustomText"}
let swapShapeLR = new Map();      // Stores {shape: true/false} for swapping L/R at the base shape level
let useDynamicParity = false;     // Toggle for dynamic parity determination
let showPaths = false;        // Toggle for short Left/Right notation (L. /R. )
let lrPosition = 'front';         // Position of L/R prefix: 'front' or 'back'
let enablePriorityLearning = false; // Toggle for priority-based learning system
// --- End New Case Name Settings ---
let useShortLR = false;
let showHints = localStorage.getItem('showHints') !== null ? localStorage.getItem('showHints') === 'true' : true; // Default to true
let colorScheme = {
    topColor: '#000000',
    bottomColor: '#FFFFFF',
    frontColor: '#CC0000',
    rightColor: '#00AA00',
    backColor: '#FF8C00',
    leftColor: '#0066CC',
    dividerColor: '#7a0000',
    circleColor: 'transparent'
};

// Check if this is first load BEFORE loading state
const isFirstLoad = !localStorage.getItem('sq1-parity-progress');

// Load saved state
try {
    const saved = localStorage.getItem('sq1-parity-progress');
    if (saved) {
        const state = JSON.parse(saved);
        learnedCases = new Set(state.learned || []);
        learningCases = new Set(state.learning || []);
        plannedCases = new Set(state.planned || []);
        swappedCases = new Map(Object.entries(state.swapped || {}));
        comments = new Map(Object.entries(state.comments || {}));
        plannedLevels = new Map(Object.entries(state.plannedLevels || {}));
        perCaseSwapLR = new Map(Object.entries(state.perCaseSwapLR || {}));
        parityOrientations = new Map(Object.entries(state.parityOrientations || {}));
        // Load new name settings
        caseNameSettings = new Map(Object.entries(state.caseNameSettings || {}));
        customCaseNames = new Map(Object.entries(state.customCaseNames || {}));
        swapShapeLR = new Map(Object.entries(state.swapShapeLR || {}));
        useDynamicParity = state.useDynamicParity || false;
        showPaths = state.showPaths || false;
        useShortLR = state.useShortLR !== undefined ? state.useShortLR : true;
        lrPosition = state.lrPosition || 'front';
        enablePriorityLearning = state.enablePriorityLearning || false;
        colorScheme = state.colorScheme || colorScheme;
    }
    
    // Initialize all cases as planned with priority 4 (Normal) if not already set
    data.forEach(item => {
        if (!learnedCases.has(item.name) && !learningCases.has(item.name) && !plannedCases.has(item.name)) {
            plannedCases.add(item.name);
            plannedLevels.set(item.name, 4);
        }
        if (!plannedLevels.has(item.name) && plannedCases.has(item.name)) {
            plannedLevels.set(item.name, 4);
        }
    });
    saveState();
} catch (e) {
    console.error('Error loading saved state:', e);
}


// Set defaults if this is first load
if (isFirstLoad) {
    // Set showHints to true for first load
    showHints = true;
    localStorage.setItem('showHints', 'true');
    // Default case name settings
    caseNameSettings.set('Paired Edges', 'Pair');
    caseNameSettings.set('Perpendicular Edges', 'L-Shape');
    caseNameSettings.set('Parallel Edges', 'Line');
    
    // Default toggles
    useShortLR = true;
    lrPosition = 'front';
    showPaths = true;
    showHints = true;  // Changed to true for tracing guides
    useDynamicParity = false;
    enablePriorityLearning = false;
    
    // Default sort
    sortSelect.value = 'probability';
    
    saveState();
}

// Apply case name defaults if not already set (for existing users too)
if (!caseNameSettings.has('Paired Edges')) {
    caseNameSettings.set('Paired Edges', 'Pair');
}
if (!caseNameSettings.has('Perpendicular Edges')) {
    caseNameSettings.set('Perpendicular Edges', 'L-Shape');
}
if (!caseNameSettings.has('Parallel Edges')) {
    caseNameSettings.set('Parallel Edges', 'Line');
}

function saveState() {
    try {
        localStorage.setItem('sq1-parity-progress', JSON.stringify({
            learned: Array.from(learnedCases),
            learning: Array.from(learningCases),
            planned: Array.from(plannedCases),
            swapped: Object.fromEntries(swappedCases),
            comments: Object.fromEntries(comments),
            plannedLevels: Object.fromEntries(plannedLevels),
            perCaseSwapLR: Object.fromEntries(perCaseSwapLR),
            parityOrientations: Object.fromEntries(parityOrientations),
            // Save new name settings
            caseNameSettings: Object.fromEntries(caseNameSettings),
            customCaseNames: Object.fromEntries(customCaseNames),
            swapShapeLR: Object.fromEntries(swapShapeLR),
            useDynamicParity: useDynamicParity,
            showPaths: showPaths,
            useShortLR: useShortLR,
            lrPosition: lrPosition,
            enablePriorityLearning: enablePriorityLearning,
            colorScheme: colorScheme
        }));
    } catch (e) {
        console.error('Error saving state:', e);
    }
}

function exportData() {
    const state = {
        learned: Array.from(learnedCases),
        learning: Array.from(learningCases),
        planned: Array.from(plannedCases),
        swapped: Object.fromEntries(swappedCases),
        comments: Object.fromEntries(comments),
        plannedLevels: Object.fromEntries(plannedLevels),
        perCaseSwapLR: Object.fromEntries(perCaseSwapLR),
        parityOrientations: Object.fromEntries(parityOrientations),
        caseNameSettings: Object.fromEntries(caseNameSettings),
        customCaseNames: Object.fromEntries(customCaseNames),
        swapShapeLR: Object.fromEntries(swapShapeLR),
        useDynamicParity: useDynamicParity,
        showPaths: showPaths,
        showHints: showHints,
        colorScheme: colorScheme
    };
    const dataStr = JSON.stringify(state, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sq1-parity-progress.json';
    link.click();
    URL.revokeObjectURL(url);
}

function importData(jsonStr) {
    try {
        const state = JSON.parse(jsonStr);
        learnedCases = new Set(state.learned || []);
        learningCases = new Set(state.learning || []);
        plannedCases = new Set(state.planned || []);
        swappedCases = new Map(Object.entries(state.swapped || {}));
        comments = new Map(Object.entries(state.comments || {}));
        plannedLevels = new Map(Object.entries(state.plannedLevels || {}));
        perCaseSwapLR = new Map(Object.entries(state.perCaseSwapLR || {}));
        parityOrientations = new Map(Object.entries(state.parityOrientations || {}));
        caseNameSettings = new Map(Object.entries(state.caseNameSettings || {}));
        customCaseNames = new Map(Object.entries(state.customCaseNames || {}));
        swapShapeLR = new Map(Object.entries(state.swapShapeLR || {}));
        useDynamicParity = state.useDynamicParity || false;
        showPaths = state.showPaths || false;
        colorScheme = state.colorScheme || colorScheme;
        if (state.showHints !== undefined) {
            showHints = state.showHints;
            localStorage.setItem('showHints', showHints);
            applyHintVisibility();
        }
        saveState();
        updateProgress();
        render();
        alert('Data imported successfully!');
    } catch (e) {
        alert('Error importing data: ' + e.message);
    }
}

function handleFileImport(file) {
    const reader = new FileReader();
    reader.onload = (e) => importData(e.target.result);
    reader.readAsText(file);
}

// DOM element references
const searchInput = document.getElementById('search');
const sortSelect = document.getElementById('sort');
const learnFilterSelect = document.getElementById('learnFilter');
const grid = document.getElementById('grid');
const progressText = document.getElementById('progress-text');
const safetyText = document.getElementById('safety-text');