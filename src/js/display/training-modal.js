// Training modal variables
let currentTrainingCase = null;
let trainingScrambles = [];
let currentScrambleIndex = 0;
let timerRunning = false;
let timerStartTime = 0;
let timerInterval = null;
let timerElapsed = 0;
let isHolding = false;
let preGeneratedScrambles = [];
let currentScrambleText = '';
let trainingModalElement = null;
let scrambleHistory = [];
let currentHistoryIndex = -1;

// Create the training modal dynamically
function createTrainingModal() {
    if (trainingModalElement) return;
    
    const modal = document.createElement('div');
    modal.id = 'trainingModal';
    modal.className = 'training-modal';
    modal.innerHTML = `
        <div class="training-modal-header">
            <button class="training-modal-title" id="trainingCaseName" style="background: none; border: none; cursor: pointer; padding: 0; font: inherit; text-align: left;" title="Click to select shape indices">Training: Case Name</button>
            <div style="display: flex; gap: 10px; align-items: center;">
                <button class="training-modal-refresh" id="trainingPrevBtn" title="Previous scramble">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </button>
                <button class="training-modal-refresh" id="trainingRefreshBtn" title="Regenerate scramble">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                    </svg>
                </button>
                <button class="training-modal-close" id="trainingCloseBtn" title="Close training">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
        </div>
        <div class="training-modal-scramble" id="trainingScramble" title="Click to analyze parity">Loading...</div>
        <div class="training-modal-timer-zone" id="trainingTimerZone">
            <div class="training-modal-image-container">
                <div class="training-modal-image" id="trainingScrambleImage"></div>
            </div>
            <div class="training-modal-timer" id="trainingTimer">0.000</div>
        </div>
    `;
    
    document.body.appendChild(modal);
    trainingModalElement = modal;
    
    // Add event listeners
    document.getElementById('trainingRefreshBtn').addEventListener('click', (e) => {
        e.stopPropagation();
        nextScrambleManual();
    });
    
    document.getElementById('trainingPrevBtn').addEventListener('click', (e) => {
        e.stopPropagation();
        previousScramble();
    });
    
    document.getElementById('trainingCloseBtn').addEventListener('click', (e) => {
        e.stopPropagation();
        closeTrainingModal();
    });
    
    document.getElementById('trainingScramble').addEventListener('click', (e) => {
        e.stopPropagation();
        openParityAnalysisFromTraining();
    });
    
    document.getElementById('trainingCaseName').addEventListener('click', (e) => {
        e.stopPropagation();
        openShapeIndexSelector();
    });
    
    const timerZone = document.getElementById('trainingTimerZone');
    
    // Mouse events for timer zone
    timerZone.addEventListener('mousedown', handleTimerMouseDown);
    timerZone.addEventListener('mouseup', handleTimerMouseUp);
    timerZone.addEventListener('mouseleave', handleTimerMouseLeave);
    
    // Touch events for timer zone
    timerZone.addEventListener('touchstart', handleTimerTouchStart);
    timerZone.addEventListener('touchend', handleTimerTouchEnd);
}

function openTrainingModal(caseName) {
    createTrainingModal();
    
    const modal = document.getElementById('trainingModal');
    const titleEl = document.getElementById('trainingCaseName');
    
    currentTrainingCase = caseName;
    
    pushModalState('trainingModal', closeTrainingModal);
    
    // Find the original data item to get the canonical name
    const dataItem = data.find(d => d.name === caseName);
    if (!dataItem) {
        alert('Case not found.');
        return;
    }
    
    // Use the canonical name from the data item to look up in shapeIndex
    const shapeIndexItem = shapeIndex.find(s => s.name === dataItem.name);
    if (!shapeIndexItem) {
        alert('Case not found in shape index.');
        return;
    }
    
    // Get all available scrambles (org + mir)
    const allScrambles = [...(shapeIndexItem.org || []), ...(shapeIndexItem.mir || [])];
    
    // Use selected indices if they exist in memory, otherwise use all
    const selectedKey = `training_selected_${caseName}`;
    if (window.trainingSelections && window.trainingSelections[selectedKey]) {
        trainingScrambles = window.trainingSelections[selectedKey];
    } else {
        trainingScrambles = allScrambles;
        // Initialize selection storage
        if (!window.trainingSelections) window.trainingSelections = {};
        window.trainingSelections[selectedKey] = allScrambles;
    }
    
    if (trainingScrambles.length === 0) {
        alert('No training scrambles available for this case.');
        return;
    }
    
    titleEl.textContent = `Training: ${getDisplayName(caseName)}`;
    currentScrambleIndex = 0;
    preGeneratedScrambles = [];
    timerElapsed = 0;
    scrambleHistory = [];
    currentHistoryIndex = -1;
    
    // Pre-generate 3 scrambles
    for (let i = 0; i < 3; i++) {
        preGeneratedScrambles.push(generateNextScrambleData());
    }
    
    displayNextScramble();
    
    modal.classList.add('active');
    document.body.classList.add('modal-open');
}

function closeTrainingModal() {
    const modal = document.getElementById('trainingModal');
    if (!modal) return;
    
    modal.classList.remove('active');
    document.body.classList.remove('modal-open');
    
    // Stop timer if running
    if (timerRunning) {
        stopTimerOnly();
    }
    preGeneratedScrambles = [];
    timerElapsed = 0;
}

function generateNextScrambleData() {
    if (trainingScrambles.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * trainingScrambles.length);
    const scramble = trainingScrambles[randomIndex];
    const hexCode = generateHexFromShapeIndex(scramble);
    
    let scrambleText = hexCode;
    try {
        const state = parseHexFormat(hexCode);
        scrambleText = window.sq1Tools.scrambleFromState(state) || hexCode;
        
        // Apply scramble styling
        if (typeof SQ1ColorizerLib !== 'undefined' && SQ1ColorizerLib.processScramble) {
            const processed = SQ1ColorizerLib.processScramble(scrambleText);
            scrambleText = processed.html || scrambleText;
        }
    } catch (error) {
        console.error('Error generating scramble:', error);
    }
    
    let scrambleImage = '<div style="color: #999;">Image unavailable</div>';
    try {
        // Use new library with custom color scheme
        if (typeof visualizeFromScrambleNotationPlease !== 'undefined') {
            const scrambleNotation = hexCode; // You might need to convert this
            try {
                const state = parseHexFormat(hexCode);
                const notation = window.sq1Tools.scrambleFromState(state) || hexCode;
                scrambleImage = visualizeFromScrambleNotationPlease(notation, scrambleImageSize, colorScheme);
            } catch (e) {
                console.error('Error with new visualizer:', e);
                scrambleImage = generateScrambleSVGFromHex(hexCode);
            }
        } else {
            scrambleImage = generateScrambleSVGFromHex(hexCode);
        }
    } catch (error) {
        console.error('Error generating scramble image:', error);
    }
    
    return { text: scrambleText, image: scrambleImage };
}

function displayNextScramble() {
    if (preGeneratedScrambles.length === 0) return;
    
    // Get the next pre-generated scramble
    const scrambleData = preGeneratedScrambles.shift();
    
    if (scrambleData) {
        currentScrambleText = scrambleData.text.replace(/<[^>]*>/g, ''); // Strip HTML for clipboard
        document.getElementById('trainingScramble').innerHTML = scrambleData.text;
        document.getElementById('trainingScrambleImage').innerHTML = scrambleData.image;
        
        // Add to history
        scrambleHistory.push(scrambleData);
        currentHistoryIndex = scrambleHistory.length - 1;
        
        // Limit history to 50 scrambles
        if (scrambleHistory.length > 50) {
            scrambleHistory.shift();
            currentHistoryIndex--;
        }
    }
    
    // Generate a new scramble to keep the queue full (async, won't block)
    setTimeout(() => {
        preGeneratedScrambles.push(generateNextScrambleData());
    }, 0);
}

function previousScramble() {
    if (currentHistoryIndex <= 0) return; // No previous scramble
    
    stopTimerOnly();
    currentHistoryIndex--;
    
    const scrambleData = scrambleHistory[currentHistoryIndex];
    currentScrambleText = scrambleData.text.replace(/<[^>]*>/g, '');
    document.getElementById('trainingScramble').innerHTML = scrambleData.text;
    document.getElementById('trainingScrambleImage').innerHTML = scrambleData.image;
}

function nextScrambleManual() {
    stopTimerOnly();
    displayNextScramble();
}

function copyScrambleToClipboard() {
    navigator.clipboard.writeText(currentScrambleText).catch(err => {
        console.error('Failed to copy scramble:', err);
    });
}

function openParityAnalysisFromTraining() {
    // Strip HTML tags to get clean scramble text
    const cleanScramble = currentScrambleText.replace(/<[^>]*>/g, '').trim();
    
    if (typeof window.ParityTracerLibrary === 'undefined') {
        alert('Parity Tracer library not loaded');
        return;
    }
    
    window.ParityTracerLibrary.createModal({
        backgroundColor: '#ffffff',
        topColor: colorScheme.topColor,
        topColorName: getColorName(colorScheme.topColor),
        topColorShort: getColorName(colorScheme.topColor).charAt(0),
        bottomColor: colorScheme.bottomColor,
        bottomColorName: getColorName(colorScheme.bottomColor),
        bottomColorShort: getColorName(colorScheme.bottomColor).charAt(0),
        frontColor: colorScheme.frontColor,
        rightColor: colorScheme.rightColor,
        backColor: colorScheme.backColor,
        leftColor: colorScheme.leftColor,
        scrambleText: cleanScramble,
        generateImage: true,
        imageSize: scrambleImageSize || 200
    });
}

// Mouse handlers for timer zone
function handleTimerMouseDown() {
    if (timerRunning) return;
    isHolding = true;
    document.getElementById('trainingTimer').style.color = '#ffc107';
}

function handleTimerMouseUp() {
    if (timerRunning) {
        // Stop timer and show next scramble immediately
        displayNextScramble();
        stopTimerOnly();
    } else if (isHolding) {
        isHolding = false;
        document.getElementById('trainingTimer').style.color = '#2d3748';
        startTimer();
    }
}

function handleTimerMouseLeave() {
    if (isHolding && !timerRunning) {
        isHolding = false;
        document.getElementById('trainingTimer').style.color = '#2d3748';
    }
}

// Touch handlers for timer zone
function handleTimerTouchStart(e) {
    e.preventDefault();
    if (timerRunning) return;
    isHolding = true;
    document.getElementById('trainingTimer').style.color = '#ffc107';
}

function handleTimerTouchEnd(e) {
    e.preventDefault();
    if (timerRunning) {
        displayNextScramble();
        stopTimerOnly();
    } else if (isHolding) {
        isHolding = false;
        document.getElementById('trainingTimer').style.color = '#2d3748';
        startTimer();
    }
}

function startTimer() {
    if (timerRunning) return;
    
    // Reset timer to 0 when starting a new solve
    timerElapsed = 0;
    timerRunning = true;
    timerStartTime = Date.now();
    
    const timerEl = document.getElementById('trainingTimer');
    timerEl.style.color = '#2d3748';
    
    timerInterval = setInterval(() => {
        timerElapsed = Date.now() - timerStartTime;
        updateTimerDisplay();
    }, 10);
}

function stopTimerOnly() {
    if (!timerRunning) return;
    
    timerRunning = false;
    clearInterval(timerInterval);
    
    const timerEl = document.getElementById('trainingTimer');
    timerEl.style.color = '#2d3748';
}

function updateTimerDisplay() {
    const seconds = (timerElapsed / 1000).toFixed(3);
    document.getElementById('trainingTimer').textContent = seconds;
}

// Shape Index Selector Functions
function openShapeIndexSelector() {
    const shapeIndexItem = shapeIndex.find(s => s.name === currentTrainingCase);
    if (!shapeIndexItem) return;
    
    pushModalState('shapeIndexSelectorModal', closeShapeIndexSelector);
    
    // Create or get existing modal
    let selectorModal = document.getElementById('shapeIndexSelectorModal');
    if (!selectorModal) {
        selectorModal = document.createElement('div');
        selectorModal.id = 'shapeIndexSelectorModal';
        selectorModal.className = 'shape-index-selector-modal';
        selectorModal.innerHTML = `
            <div class="shape-index-selector-content">
                <div class="shape-index-selector-header">
                    <span class="shape-index-selector-title">Select Shape Indices</span>
                    <button class="shape-index-selector-close" onclick="closeShapeIndexSelector()">&times;</button>
                </div>
                <div class="shape-index-selector-body" id="shapeIndexSelectorBody"></div>
            </div>
        `;
        document.body.appendChild(selectorModal);
    }
    
    const selectedKey = `training_selected_${currentTrainingCase}`;
    const currentSelection = window.trainingSelections?.[selectedKey] || [];
    
    const body = document.getElementById('shapeIndexSelectorBody');
    body.innerHTML = `
        <div class="shape-index-section">
            <div class="shape-index-section-header">
                <span style="font-weight: 600;">Original Orientation</span>
                <div>
                    <button onclick="selectAllIndices('org')" style="padding: 3px 10px; margin-right: 5px; background: #f8f9fa; color: #495057; border: 1px solid #ced4da; border-radius: 3px; cursor: pointer; font-size: 0.8rem;">Select All</button>
                    <button onclick="deselectAllIndices('org')" style="padding: 3px 10px; background: #f8f9fa; color: #495057; border: 1px solid #ced4da; border-radius: 3px; cursor: pointer; font-size: 0.8rem;">Deselect All</button>
                </div>
            </div>
            <div class="shape-index-toggles" id="orgToggles">
                ${(shapeIndexItem.org || []).map(idx => `
                    <button class="shape-index-toggle ${currentSelection.includes(idx) ? 'active' : ''}" 
                            data-index="${idx}" 
                            data-type="org" 
                            onclick="toggleShapeIndex(${idx})">
                        ${idx}
                    </button>
                `).join('')}
            </div>
        </div>
        <div class="shape-index-section" style="margin-top: 20px;">
            <div class="shape-index-section-header">
                <span style="font-weight: 600;">Mirror Orientation</span>
                <div>
                    <button onclick="selectAllIndices('mir')" style="padding: 3px 10px; margin-right: 5px; background: #f8f9fa; color: #495057; border: 1px solid #ced4da; border-radius: 3px; cursor: pointer; font-size: 0.8rem;">Select All</button>
                    <button onclick="deselectAllIndices('mir')" style="padding: 3px 10px; background: #f8f9fa; color: #495057; border: 1px solid #ced4da; border-radius: 3px; cursor: pointer; font-size: 0.8rem;">Deselect All</button>
                </div>
            </div>
            <div class="shape-index-toggles" id="mirToggles">
                ${(shapeIndexItem.mir || []).map(idx => `
                    <button class="shape-index-toggle ${currentSelection.includes(idx) ? 'active' : ''}" 
                            data-index="${idx}" 
                            data-type="mir" 
                            onclick="toggleShapeIndex(${idx})">
                        ${idx}
                    </button>
                `).join('')}
            </div>
        </div>
    `;
    
    selectorModal.classList.add('active');
}

function closeShapeIndexSelector() {
    const modal = document.getElementById('shapeIndexSelectorModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function toggleShapeIndex(index) {
    const selectedKey = `training_selected_${currentTrainingCase}`;
    if (!window.trainingSelections) window.trainingSelections = {};
    if (!window.trainingSelections[selectedKey]) {
        const shapeIndexItem = shapeIndex.find(s => s.name === currentTrainingCase);
        window.trainingSelections[selectedKey] = [...(shapeIndexItem.org || []), ...(shapeIndexItem.mir || [])];
    }
    
    const currentSelection = window.trainingSelections[selectedKey];
    const indexPos = currentSelection.indexOf(index);
    
    if (indexPos > -1) {
        currentSelection.splice(indexPos, 1);
    } else {
        currentSelection.push(index);
    }
    
    // Update button appearance
    const button = document.querySelector(`button.shape-index-toggle[data-index="${index}"]`);
    if (button) {
        button.classList.toggle('active');
    }
    
    // Update training scrambles
    trainingScrambles = currentSelection;
    
    // If no indices selected, show warning but don't prevent
    if (currentSelection.length === 0) {
        console.warn('No shape indices selected');
    }
}

function selectAllIndices(type) {
    const shapeIndexItem = shapeIndex.find(s => s.name === currentTrainingCase);
    if (!shapeIndexItem) return;
    
    const selectedKey = `training_selected_${currentTrainingCase}`;
    if (!window.trainingSelections) window.trainingSelections = {};
    
    const indices = type === 'org' ? (shapeIndexItem.org || []) : (shapeIndexItem.mir || []);
    
    // Add all indices of this type to selection
    indices.forEach(idx => {
        if (!window.trainingSelections[selectedKey].includes(idx)) {
            window.trainingSelections[selectedKey].push(idx);
        }
    });
    
    // Update button appearances
    const buttons = document.querySelectorAll(`button.shape-index-toggle[data-type="${type}"]`);
    buttons.forEach(btn => btn.classList.add('active'));
    
    trainingScrambles = window.trainingSelections[selectedKey];
}

function deselectAllIndices(type) {
    const shapeIndexItem = shapeIndex.find(s => s.name === currentTrainingCase);
    if (!shapeIndexItem) return;
    
    const selectedKey = `training_selected_${currentTrainingCase}`;
    if (!window.trainingSelections) window.trainingSelections = {};
    
    const indices = type === 'org' ? (shapeIndexItem.org || []) : (shapeIndexItem.mir || []);
    
    // Remove all indices of this type from selection
    window.trainingSelections[selectedKey] = window.trainingSelections[selectedKey].filter(idx => !indices.includes(idx));
    
    // Update button appearances
    const buttons = document.querySelectorAll(`button.shape-index-toggle[data-type="${type}"]`);
    buttons.forEach(btn => btn.classList.remove('active'));
    
    trainingScrambles = window.trainingSelections[selectedKey];
}

// Keyboard events for timer
let spacePressed = false;
document.addEventListener('keydown', (e) => {
    const modal = document.getElementById('trainingModal');
    if (!modal || !modal.classList.contains('active')) return;
    
    if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        if (!spacePressed) {
            spacePressed = true;
            const timerEl = document.getElementById('trainingTimer');
            timerEl.style.color = '#ffc107'; // Yellow when holding
            if (!timerRunning) {
                isHolding = true;
            }
        }
    } else if (e.code === 'Escape') {
        e.preventDefault();
        closeTrainingModal();
    }
});

document.addEventListener('keyup', (e) => {
    const modal = document.getElementById('trainingModal');
    if (!modal || !modal.classList.contains('active')) return;
    
    if (e.code === 'Space') {
        e.preventDefault();
        if (spacePressed) {
            spacePressed = false;
            const timerEl = document.getElementById('trainingTimer');
            
            if (timerRunning) {
                // Show next scramble FIRST, then stop timer
                displayNextScramble();
                stopTimerOnly();
            } else if (isHolding) {
                isHolding = false;
                timerEl.style.color = '#2d3748';
                startTimer();
            }
        }
    }
});