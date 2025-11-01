function openParityAnalysisModal(setupScramble = '', label = '') {
    const modal = document.getElementById('parityAnalysisModal');
    const input = document.getElementById('parityScrambleInput');
    
    input.value = setupScramble;
    modal.style.display = 'block';
    document.body.classList.add('modal-open');
    
    if (setupScramble) {
        analyzeCustomScramble();
    }
}

function closeParityAnalysisModal() {
    const modal = document.getElementById('parityAnalysisModal');
    modal.style.display = 'none';
    document.body.classList.remove('modal-open');
    document.getElementById('parityAnalysisContent').innerHTML = '';
}

function analyzeCustomScramble() {
    const input = document.getElementById('parityScrambleInput');
    const setupScramble = input.value.trim();
    
    if (!setupScramble) {
        document.getElementById('parityAnalysisContent').innerHTML = '<div style="color: #e53e3e; padding: 10px;">Please enter a scramble</div>';
        return;
    }
    
    const parityResult = analyzeParity(setupScramble);
    const displayDiv = document.getElementById('parityAnalysisContent');
    
    if (!parityResult) {
        displayDiv.innerHTML = '<div style="color: #e53e3e; padding: 10px;">Error analyzing parity - invalid scramble</div>';
        return;
    }
    
    function createColorSquares(codenames) {
        if (codenames === '-') return '';
        const colorMap = {
            'O': '<span class="color-dot" style="background: #FF8C00; display: inline-block; width: 16px; height: 16px; border-radius: 3px; margin: 0 2px; vertical-align: middle; box-shadow: 0 1px 3px rgba(0,0,0,0.2);"></span>',
            'G': '<span class="color-dot" style="background: #00AA00; display: inline-block; width: 16px; height: 16px; border-radius: 3px; margin: 0 2px; vertical-align: middle; box-shadow: 0 1px 3px rgba(0,0,0,0.2);"></span>',
            'R': '<span class="color-dot" style="background: #CC0000; display: inline-block; width: 16px; height: 16px; border-radius: 3px; margin: 0 2px; vertical-align: middle; box-shadow: 0 1px 3px rgba(0,0,0,0.2);"></span>',
            'B': '<span class="color-dot" style="background: #0066CC; display: inline-block; width: 16px; height: 16px; border-radius: 3px; margin: 0 2px; vertical-align: middle; box-shadow: 0 1px 3px rgba(0,0,0,0.2);"></span>'
        };
        return codenames.split(' ').slice(0, 3).map(c => colorMap[c] || '').join('');
    }
    
    function createPositionIndicators(pieces) {
        return pieces.split(' ').map(p => {
            const isBlack = ['L', 'C', 'F', 'I', 'AB', 'DE', 'GH', 'JK'].includes(p);
            const letter = isBlack ? 'B' : 'W';
            const bgColor = isBlack ? '#000000' : '#FFFFFF';
            const textColor = isBlack ? '#FFFFFF' : '#000000';
            return `<span style="display: inline-block; width: 18px; height: 18px; border-radius: 3px; margin: 0 1px; background: ${bgColor}; color: ${textColor}; text-align: center; line-height: 18px; font-size: 11px; font-weight: bold; box-shadow: 0 1px 3px rgba(0,0,0,0.2);">${letter}</span>`;
        }).join('');
    }
    
    let html = `
        <div style="background: #f8f9fa; border-radius: 8px; padding: 15px; border: 2px solid ${parityResult.isOdd ? '#fc8181' : '#68d391'};">
            <div style="margin-bottom: 15px;">
                <h3 style="font-size: 1.1rem; color: #2d3748; margin: 0 0 10px 0;">Analysis Result</h3>
                <div style="font-family: Consolas, monospace; background: white; padding: 8px; border-radius: 4px; border: 1px solid #ddd; word-break: break-all;">${setupScramble}</div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
    `;
    
    parityResult.steps.forEach((step, idx) => {
        let displayContent = '';
        const lineName = step.name.split(':')[1].trim();
        
        if (idx < 2 || (idx >= 3 && idx < 5)) {
            displayContent = `${lineName}: ${createColorSquares(step.codenames)} = <strong>${step.result}</strong>`;
        } else {
            displayContent = `${lineName}: ${createPositionIndicators(step.pieces)} = <strong>${step.result}</strong>`;
        }
        
        html += `
            <div style="background: white; padding: 8px; border-radius: 6px; border-left: 3px solid ${step.result === 1 ? '#fc8181' : '#68d391'};">
                <div style="font-weight: 600; font-size: 0.85rem; color: #2d3748;">
                    ${displayContent}
                </div>
            </div>
        `;
    });
    
    html += `
            </div>
            <div style="background: ${parityResult.isOdd ? '#fff5f5' : '#f0fff4'}; padding: 10px; border-radius: 6px; border-left: 3px solid ${parityResult.isOdd ? '#fc8181' : '#68d391'};">
                <div style="font-weight: 600; font-size: 0.95rem; color: #2d3748;">
                    Total: ${parityResult.total} → <strong style="color: ${parityResult.isOdd ? '#c53030' : '#2f855a'};">${parityResult.isOdd ? 'ODD' : 'EVEN'} Parity</strong>
                </div>
            </div>
        </div>
    `;
    
    displayDiv.innerHTML = html;
}
