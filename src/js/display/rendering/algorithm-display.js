function countSlashes(str, count) {
    if (count === 0) return 0;
    const parts = str.split('/');
    return parts.slice(0, count).join('/').length + 1;
}


function invertScramble(s) {
    if (!s) return s;
    let str = String(s).trim();

    // Split by / to get individual moves and turn notations
    const parts = str.split('/');

    // Reverse the order
    const reversed = parts.slice().reverse();

    // Invert each part
    const inverted = reversed.map(part => {
        part = part.trim();

        // Handle turn notation like (0,3) or (-1,1)
        const turnMatch = part.match(/\(([^)]+)\)/);
        if (turnMatch) {
            const values = turnMatch[1].split(',').map(v => v.trim());
            const invertedValues = values.map(v => {
                const num = parseInt(v);
                if (isNaN(num)) return v;
                return String(-num);
            });
            return '(' + invertedValues.join(',') + ')';
        }

        // Handle move notation like 3,0 or -2,0
        if (part.includes(',')) {
            const values = part.split(',').map(v => v.trim());
            const invertedValues = values.map(v => {
                const num = parseInt(v);
                if (isNaN(num)) return v;
                return String(-num);
            });
            return invertedValues.join(',');
        }

        return part;
    });

    return inverted.join('/');
}

function getShapePath(scramble) {
    if (!scramble || scramble.trim() === '' || scramble === 'Done!') {
        return null;
    }
    
    try {
        let inversed = invertScramble(scramble);
        
        // Handle algorithms that start with / (which end with / before inversion)
        // Treat starting / as (0,0)/ but we'll skip adding the initial state twice
        const startsWithSlash = inversed.trim().startsWith('/');
        if (startsWithSlash) {
            inversed = '(0,0)' + inversed;
        }
        
        const moves = inversed.split('/').filter(m => m.trim() !== '');
        const path = [];
        
        // Get initial state (solved square) - only add if doesn't start with slash
        if (!startsWithSlash) {
            let currentState = solved();
            const initialTop = buildUnits(currentState, 0);
            const initialBot = buildUnits(currentState, 12);
            const initialTopCanonical = findCanonicalPattern(initialTop.types);
            const initialBotCanonical = findCanonicalPattern(initialBot.types);
            
            path.push({
                top: getShortDisplayName(initialTopCanonical.name),
                bottom: getShortDisplayName(initialBotCanonical.name)
            });
        }
        
        // Apply each move and track shape changes
        let moveStr = '';
        for (let i = 0; i < moves.length; i++) {
            moveStr += (moveStr ? '/' : '') + moves[i];
            let currentState = applyScramble(moveStr);
            
            const topRaw = buildUnits(currentState, 0);
            const botRaw = buildUnits(currentState, 12);
            const topCanonical = findCanonicalPattern(topRaw.types);
            const botCanonical = findCanonicalPattern(botRaw.types);
            
            path.push({
                top: getShortDisplayName(topCanonical.name),
                bottom: getShortDisplayName(botCanonical.name)
            });
        }
        
        // Reverse the path since we inverted the scramble
        return path.reverse();
    } catch (err) {
        console.error('Error generating shape path:', err);
        return null;
    }
}

function renderShapePath(path) {
    if (!path || path.length === 0) return '';
    
    const pathSteps = path.map((step, idx) => {
        const arrow = idx < path.length - 1 ? ' <span style="color: #007bff; font-weight: bold;">→</span> ' : '';
        return `<span style="background: #f0f9ff; padding: 2px 6px; border-radius: 3px; white-space: nowrap;">${step.top}/${step.bottom}</span>${arrow}`;
    }).join('');
    
    return `
        <div style="margin-top: 10px; padding: 10px; background: #f8f9fa; border-radius: 4px; border-left: 3px solid #007bff;">
            <div style="font-size: 0.85rem; color: #666; margin-bottom: 5px; font-weight: 600;">Shape Path:</div>
            <div style="font-size: 0.9rem; line-height: 1.8; overflow-x: auto; white-space: nowrap;">
                ${pathSteps}
            </div>
        </div>
    `;
}

function renderAlgorithm(algoArray, parArray) {
    return algoArray.map((algo, idx) => {
        const parCount = parArray[idx];
        if (parCount > 0) {
            const highlightEnd = countSlashes(algo, parCount);
            return `<div class="algo-line"><mark>${algo.substring(0, highlightEnd)}</mark>${algo.substring(highlightEnd)}</div>`;
        }
        return `<div class="algo-line">${algo}</div>`;
    }).join('');
}
