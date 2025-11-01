function renderCard(item) {
    const prob = (item.probability / 3678 * 100).toFixed(3);
    const isLearned = learnedCases.has(item.name);
    const isLearning = learningCases.has(item.name);
    const isPlanned = plannedCases.has(item.name);
    const plannedLevel = plannedLevels.get(item.name) || 4;
    
    let cardClass = '';
    if (isLearned) {
        cardClass = 'learned';
    } else if (isLearning) {
        cardClass = 'learning';
    } else {
        // All unlearned/unlearning cases are planned
        cardClass = `planned priority-${plannedLevel}`;
    }
    
    const isSwapped = swappedCases.get(item.name) || false;
    const comment = comments.get(item.name) || '';
    
    // Determine parity labels dynamically if enabled
    let oddLabel = 'Odd:';
    let evenLabel = 'Even:';
    
    if (useDynamicParity) {
        const oddAlgos = isSwapped ? item.even : item.odd;
        const evenAlgos = isSwapped ? item.odd : item.even;
        
        if (oddAlgos[0] && oddAlgos[0] !== 'Done!') {
            const oddSetup = invertScramble(oddAlgos[0]);
            const oddParity = analyzeParity(oddSetup); // Now uses custom orientations
            if (oddParity) {
                oddLabel = oddParity.isOdd ? 'Odd:' : 'Even:';
            }
        }
        
        if (evenAlgos[0] && evenAlgos[0] !== 'Done!') {
            const evenSetup = invertScramble(evenAlgos[0]);
            const evenParity = analyzeParity(evenSetup); // Now uses custom orientations
            if (evenParity) {
                evenLabel = evenParity.isOdd ? 'Odd:' : 'Even:';
            }
        }
    }
    
    const learnedIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="${isLearned ? '#28a745' : (isLearning ? '#ffc107' : '#ccc')}" stroke-width="2">
        <path d="M20 6L9 17l-5-5"/>
    </svg>`;
    
    const priorityNames = ['Top', 'Most', 'More', 'Normal', 'Less', 'Least', 'Meh'];
    const priorityText = isPlanned ? priorityNames[plannedLevel - 1] : 'Set';
    const priorityColor = isPlanned ? '#007bff' : '#999';
    
    const priorityControls = enablePriorityLearning ? `
        <div style="display: flex; align-items: center; gap: 2px;">
            <span style="font-size: 0.75rem; font-weight: 600; color: ${priorityColor}; min-width: 42px; text-align: center;">${priorityText}</span>
            <div style="display: flex; flex-direction: column; gap: 1px;">
                <button onclick="event.stopPropagation(); adjustPriority('${item.name.replace(/'/g, "\\'")}', -1)" style="width: 16px; height: 12px; padding: 0; border: 1px solid #ccc; background: white; cursor: pointer; border-radius: 2px; display: flex; align-items: center; justify-content: center; font-size: 10px; line-height: 1;">▲</button>
                <button onclick="event.stopPropagation(); adjustPriority('${item.name.replace(/'/g, "\\'")}', 1)" style="width: 16px; height: 12px; padding: 0; border: 1px solid #ccc; background: white; cursor: pointer; border-radius: 2px; display: flex; align-items: center; justify-content: center; font-size: 10px; line-height: 1;">▼</button>
            </div>
        </div>
    ` : '';
    
    const oddAlgos = isSwapped ? item.even : item.odd;
    const oddPars = isSwapped ? item.evenPar : item.oddPar;
    const evenAlgos = isSwapped ? item.odd : item.even;
    const evenPars = isSwapped ? item.oddPar : item.evenPar;
    
const displayName = getDisplayName(item.name); // Get customized name

    return `
        <div class="card ${cardClass}">
            <div class="card-header">
                <div class="card-title" onclick="openModal('${item.name.replace(/'/g, "\\'")}')">
                    ${displayName}
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div class="probability">${prob}%</div>
                    <div class="card-header-actions">
                        <div class="icon-btn" onmousedown="event.stopPropagation(); toggleLearned('${item.name.replace(/'/g, "\\'")}', event)" oncontextmenu="event.preventDefault();">
                            ${learnedIcon}
                        </div>
                        ${priorityControls}
                    </div>
                </div>
            </div>
<div class="card-images card-svg-container">
    <div style="width: 50%; height: auto;">${item.top}</div>
    <div style="width: 50%; height: auto;">${item.bottom}</div>
</div>
            <div class="card-body">
                <div class="algo-section">
                    <span class="algo-label">${oddLabel}</span>
                    ${renderAlgorithm(oddAlgos, oddPars)}
                </div>
                <div class="algo-section">
                    <span class="algo-label">${evenLabel}</span>
                    ${renderAlgorithm(evenAlgos, evenPars)}
                </div>
                ${comment ? `<div style="font-size: 0.65rem; color: #666; margin-top: 8px; font-style: italic;">${comment}</div>` : ''}
            </div>
        </div>
    `;
}

function render() {
    grid.innerHTML = filteredData.map(renderCard).join('');
}