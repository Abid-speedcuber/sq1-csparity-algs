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

function openTrainingModal(caseName) {
    const modal = document.getElementById('trainingModal');
    const titleEl = document.getElementById('trainingCaseName');
    
    currentTrainingCase = caseName;
    
    // Find the original data item to get the canonical name
    const dataItem = data.find(d => d.name === caseName);
    if (!dataItem) {
        alert('Case not found.');
        return;
    }
    
    // Use the canonical name from the data item to look up in shapeIndex
    trainingScrambles = shapeIndex[dataItem.name] || [];
    
    if (trainingScrambles.length === 0) {
        alert('No training scrambles available for this case.');
        return;
    }
    
    titleEl.textContent = `Training: ${getDisplayName(caseName)}`;
    currentScrambleIndex = 0;
    preGeneratedScrambles = [];
    timerElapsed = 0;
    
    // Pre-generate 3 scrambles
    for (let i = 0; i < 3; i++) {
        preGeneratedScrambles.push(generateNextScrambleData());
    }
    
    displayNextScramble();
    
    modal.style.display = 'block';
    document.body.classList.add('modal-open');
}

function closeTrainingModal() {
    const modal = document.getElementById('trainingModal');
    modal.style.display = 'none';
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
        scrambleImage = generateScrambleSVGFromHex(hexCode);
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
    }
    
    // Generate a new scramble to keep the queue full (async, won't block)
    setTimeout(() => {
        preGeneratedScrambles.push(generateNextScrambleData());
    }, 0);
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

// Mouse handlers for timer
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

// Touch handlers for timer
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

// Mouse handlers for image
function handleImageMouseDown() {
    if (timerRunning) return;
    isHolding = true;
    document.getElementById('trainingTimer').style.color = '#ffc107';
    document.getElementById('trainingScrambleImage').style.background = 'rgba(255, 193, 7, 0.1)';
}

function handleImageMouseUp() {
    document.getElementById('trainingScrambleImage').style.background = 'transparent';
    if (timerRunning) {
        displayNextScramble();
        stopTimerOnly();
    } else if (isHolding) {
        isHolding = false;
        document.getElementById('trainingTimer').style.color = '#2d3748';
        startTimer();
    }
}

function handleImageMouseLeave() {
    document.getElementById('trainingScrambleImage').style.background = 'transparent';
    if (isHolding && !timerRunning) {
        isHolding = false;
        document.getElementById('trainingTimer').style.color = '#2d3748';
    }
}

// Touch handlers for image
function handleImageTouchStart(e) {
    e.preventDefault();
    if (timerRunning) return;
    isHolding = true;
    document.getElementById('trainingTimer').style.color = '#ffc107';
    document.getElementById('trainingScrambleImage').style.background = 'rgba(255, 193, 7, 0.1)';
}

function handleImageTouchEnd(e) {
    e.preventDefault();
    document.getElementById('trainingScrambleImage').style.background = 'transparent';
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

// Keyboard events for timer
let spacePressed = false;
document.addEventListener('keydown', (e) => {
    const modal = document.getElementById('trainingModal');
    if (modal.style.display !== 'block') return;
    
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
    }
});

document.addEventListener('keyup', (e) => {
    const modal = document.getElementById('trainingModal');
    if (modal.style.display !== 'block') return;
    
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