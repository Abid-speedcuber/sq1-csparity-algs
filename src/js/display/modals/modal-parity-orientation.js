// Temporary storage for parity orientation changes before saving
let tempParityOrientations = new Map();


// --- Parity Orientation Modal Functions ---
function openParityOrientationModal() {
    const modal = document.getElementById('parityOrientationModal');
    modal.style.display = 'block';
    document.body.classList.add('modal-open');
    populateParityOrientationSettings();
}

function closeParityOrientationModal() {
    const modal = document.getElementById('parityOrientationModal');
    modal.style.display = 'none';
    document.body.classList.remove('modal-open');
}

function populateParityOrientationSettings() {
    const container = document.getElementById('parityOrientationContainer');
    container.innerHTML = '';
    
    // Reset temp storage to current saved values
    tempParityOrientations = new Map(parityOrientations);
    
    // Define all shape patterns with their names (matching your app's shapes)
    const allShapePatterns = [
        { pattern: 'ECECECEC', name: 'Square' },
        { pattern: 'EECECCEC', name: 'Kite' },
        { pattern: 'EECCEECC', name: 'Barrel' },
        { pattern: 'EECCECEC', name: 'Left Fist' },
        { pattern: 'EECECECC', name: 'Right Fist' },
        { pattern: 'EECEECCC', name: 'Shield' },
        { pattern: 'EEECCECC', name: 'Muffin' },
        { pattern: 'EEECECCC', name: 'Left Pawn' },
        { pattern: 'ECEEECCC', name: 'Right Pawn' },
        { pattern: 'EEEECCCC', name: 'Scallop' },
        { pattern: 'EECCCCC', name: 'Paired Edges' },
        { pattern: 'ECECCCC', name: 'Perpendicular Edges' },
        { pattern: 'ECCCECC', name: 'Parallel Edges' },
        { pattern: 'EEEEEECCC', name: '6' },
        { pattern: 'ECEEEEECC', name: 'Right 5-1' },
        { pattern: 'EEEEECECC', name: 'Left 5-1' },
        { pattern: 'EECEEEECC', name: 'Right 4-2' },
        { pattern: 'EEEECEECC', name: 'Left 4-2' },
        { pattern: 'EEEECECEC', name: '4-1-1' },
        { pattern: 'EEECEEECC', name: '3-3' },
        { pattern: 'ECEECEEEC', name: '3-1-2' },
        { pattern: 'ECEEECEEC', name: '3-2-1' },
        { pattern: 'EECEECEEC', name: '2-2-2' },
        { pattern: 'EEEEEEEECC', name: '8' },
        { pattern: 'EEEEEECEEC', name: '6-2' },
        { pattern: 'EEEECEEEEC', name: '4-4' },
        { pattern: 'EEEEEEECEC', name: '7-1' },
        { pattern: 'EEEEECEEEC', name: '5-3' },
        { pattern: 'CCCCCC', name: 'Star' }
    ];
    
    // Create cards for each shape
    allShapePatterns.forEach(({ pattern, name }) => {
        const rotation = tempParityOrientations.get(pattern) || 0;
        const shapeViz = generateParityOrientationViz(pattern, 120, rotation);
        
        const card = document.createElement('div');
        card.style.cssText = 'border: 2px solid #e2e8f0; padding: 15px; border-radius: 8px; background: #fcfcfc; text-align: center;';
        card.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 10px; color: #2d3748;">${name}</div>
            <div id="parity-shape-${pattern.replace(/[^A-Z]/g, '')}" style="display: flex; justify-content: center; margin-bottom: 10px;">
                ${shapeViz}
            </div>
            <div style="font-size: 0.85rem; color: #718096;">Click piece to set start position</div>
        `;
        container.appendChild(card);
    });
}

function generateParityOrientationViz(pattern, size, rotation) {
    const cx = size / 2;
    const cy = size / 2;
    
    const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
    const unit10vh = vh * 0.10;
    const r_inner = 0;
    const r_outer = Math.round(unit10vh * 0.7);
    const r_outer_apex = Math.round(r_outer * (Math.cos(Math.PI / 6) + Math.sin(Math.PI / 6)));
    
    const maxRadius = Math.max(r_outer, r_outer_apex);
    const scale = (size * 0.4) / maxRadius;
    const scaled_r_outer = r_outer * scale;
    const scaled_r_outer_apex = r_outer_apex * scale;
    
    function p2c(cx, cy, radius, angleDeg) {
        const a = angleDeg * Math.PI / 180;
        return { x: cx + radius * Math.cos(a), y: cy - radius * Math.sin(a) };
    }
    
    function ptsToStr(pts) {
        return pts.map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
    }
    
    let svgContent = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="display: inline-block;">
    <style>
        .parity-piece { cursor: pointer; transition: all 0.15s ease; }
        .parity-piece:hover { stroke-width: 3; opacity: 0.8; }
    </style>`;
    
    const pieces = pattern.split('');
    const letterAngles = [];
    let currentAngle = 90;
    
    pieces.forEach(piece => {
        if (piece === 'E') {
            letterAngles.push(currentAngle);
            currentAngle -= 30;
        } else {
            letterAngles.push(currentAngle);
            letterAngles.push(currentAngle - 30);
            currentAngle -= 60;
        }
    });
    
    let angleIndex = 0;
    pieces.forEach((piece, index) => {
        const isEdge = piece === 'E';
        const adjustedIndex = (index - rotation + pieces.length) % pieces.length;
        const isFirst = adjustedIndex === 0;
        const fillColor = isFirst ? '#add8e6' : '#ffffff';
        
        if (isEdge) {
            const centerAngle = letterAngles[angleIndex];
            const half = 15;
            
            const pInner = p2c(cx, cy, r_inner, centerAngle);
            const pA = p2c(cx, cy, scaled_r_outer, centerAngle - half);
            const pB = p2c(cx, cy, scaled_r_outer, centerAngle + half);
            
            svgContent += `<polygon 
                class="parity-piece" 
                data-pattern="${pattern}"
                data-index="${index}"
                onclick="setParityOrientation('${pattern}', ${index})"
                points="${ptsToStr([pInner, pA, pB])}" 
                fill="${fillColor}" 
                stroke="#000" 
                stroke-width="2" 
            />`;
            
            angleIndex += 1;
        } else {
            const angle1 = letterAngles[angleIndex];
            const angle2 = letterAngles[angleIndex + 1];
            const centerAngle = (angle1 + angle2) / 2;
            const half = 30;
            
            const pInner = p2c(cx, cy, r_inner, centerAngle);
            const pOuterR = p2c(cx, cy, scaled_r_outer, centerAngle - half);
            const pApex = p2c(cx, cy, scaled_r_outer_apex, centerAngle);
            const pOuterL = p2c(cx, cy, scaled_r_outer, centerAngle + half);
            
            svgContent += `<polygon 
                class="parity-piece" 
                data-pattern="${pattern}"
                data-index="${index}"
                onclick="setParityOrientation('${pattern}', ${index})"
                points="${ptsToStr([pInner, pOuterR, pApex, pOuterL])}" 
                fill="${fillColor}" 
                stroke="#000" 
                stroke-width="2" 
            />`;
            
            angleIndex += 2;
        }
    });
    
    svgContent += `<circle cx="${cx}" cy="${cy}" r="2" fill="#666"/>`;
    svgContent += `</svg>`;
    
    return svgContent;
}

function setParityOrientation(pattern, clickedIndex) {
    tempParityOrientations.set(pattern, clickedIndex);
    
    // Refresh the display for this shape
    const cleanPattern = pattern.replace(/[^A-Z]/g, '');
    const container = document.getElementById(`parity-shape-${cleanPattern}`);
    if (container) {
        container.innerHTML = generateParityOrientationViz(pattern, 120, clickedIndex);
    }
}

function saveParityOrientations() {
    parityOrientations = new Map(tempParityOrientations);
    saveState();
    closeParityOrientationModal();
    alert('Parity orientation settings saved!');
}

function resetAllParityOrientations() {
    if (confirm('Reset all parity orientations to default (first piece)? This cannot be undone.')) {
        parityOrientations.clear();
        tempParityOrientations.clear();
        saveState();
        populateParityOrientationSettings();
        alert('All parity orientations reset to default!');
    }
}

function getPatternFromSVG(svgString) {
    // Extract pattern from SVG variable name or content
    // This is a helper to identify which pattern a shape uses
    const varMatch = svgString.match(/svg_(\w+)/);
    if (varMatch) {
        // Try to find corresponding pattern based on variable name
        const varName = varMatch[1];
        // Map common variable names to their patterns
        const patternMap = {
            '8': 'EEEEEEEECC',
            '6_2': 'EEEEEECEEC',
            '4_4': 'EEEECEEEEC',
            '7_1': 'EEEEEEECEC',
            '5_3': 'EEEEECEEEC',
            '2_2_2': 'EECEECEEC',
            '6': 'EEEEEECCC',
            '5_1': 'ECEEEEECC',
            '4_2': 'EECEEEECC',
            '3_3': 'EEECEEECC',
            '4_1_1': 'EEEECECEC',
            '3_1_2': 'ECEECEEEC',
            '3_2_1': 'ECEEECEEC'
        };
        if (patternMap[varName]) return patternMap[varName];
        
        // Try left/right variants
        if (varName.startsWith('Left_')) {
            const base = varName.substring(5);
            if (patternMap[base]) return patternMap[base];
        }
        if (varName.startsWith('Right_')) {
            const base = varName.substring(6);
            if (patternMap[base]) return patternMap[base];
        }
    }
    
    // Common shape patterns
    const commonPatterns = {
        'Square': 'ECECECEC',
        'Kite': 'EECECCEC',
        'Barrel': 'EECCEECC',
        'Fist': 'EECCECEC',
        'Shield': 'EECEECCC',
        'Muffin': 'EEECCECC',
        'Mushroom': 'EEECCECC',
        'Pawn': 'EEECECCC',
        'Scallop': 'EEEECCCC',
        'Star': 'CCCCCC',
        'Perpendicular': 'EECCCCC',
        'Parallel': 'ECCCECC',
        'Paired': 'EECCCCC'
    };
    
    for (const [name, pattern] of Object.entries(commonPatterns)) {
        if (svgString.includes(name) || svgString.includes(name.toLowerCase())) {
            return pattern;
        }
    }
    
    return null;
}

// Update analyzeParity function to use custom orientations
const originalAnalyzeParity = analyzeParity;
analyzeParity = function(setupScramble) {
    try {
        const state = applyScramble(setupScramble);
        
        const topRaw = buildUnits(state, 0);
        const botRaw = buildUnits(state, 12);
        
        // Find which canonical pattern this matches and how much to rotate
        const topPattern = topRaw.types;
        const botPattern = botRaw.types;
        
        // Find canonical pattern and calculate rotation
        const topCanonical = findCanonicalPattern(topPattern);
        const botCanonical = findCanonicalPattern(botPattern);
        
        // Get user's custom rotation for this canonical pattern (default 0)
        const topUserRotation = parityOrientations.get(topCanonical.canonical) || 0;
        const botUserRotation = parityOrientations.get(botCanonical.canonical) || 0;
        
        // Total rotation = rotation to match canonical + user's custom rotation
        const topRotation = (topCanonical.rotation + topUserRotation) % topRaw.units.length;
        const botRotation = (botCanonical.rotation + botUserRotation) % botRaw.units.length;
        
        const topUnits = rotArr(topRaw.units, topRotation);
        const botUnits = rotArr(botRaw.units, botRotation);
        
        const topCounts = countsLabel(topUnits);
        const botCounts = countsLabel(botUnits);
        
        const shouldSwapForParity = (topCounts.label === '2E5C' && botCounts.label === '6E3C');
        
        let parityEdgesOrder = [];
        let parityCornersOrder = [];
        
        const blocks = shouldSwapForParity 
            ? [{ units: botUnits }, { units: topUnits }]
            : [{ units: topUnits }, { units: botUnits }];
        
        for (const b of blocks) {
            for (const u of b.units) {
                if (u.type === 'E') {
                    parityEdgesOrder.push(u.edge);
                } else {
                    parityCornersOrder.push(u.pair);
                }
            }
        }
        
        const sixStepParity = calculateSixStepParity(parityEdgesOrder, parityCornersOrder);
        
        return sixStepParity;
    } catch (err) {
        console.error('Parity analysis error:', err);
        return null;
    }
};