function openModal(name) {
    const item = data.find(d => d.name === name);
    if (!item) return;
    
    const prob = (item.probability / 3678 * 100).toFixed(3);
    const isSwapped = swappedCases.get(item.name) || false;
    const comment = comments.get(item.name) || '';
    
    const oddAlgos = isSwapped ? item.even : item.odd;
    const oddPars = isSwapped ? item.evenPar : item.oddPar;
    const evenAlgos = isSwapped ? item.odd : item.even;
    const evenPars = isSwapped ? item.oddPar : item.evenPar;
    
    const oddSetup = invertScramble(oddAlgos[0]);
    const evenSetup = invertScramble(evenAlgos[0]);
    
    // Determine parity labels dynamically if enabled
    let oddLabel = 'Odd';
    let evenLabel = 'Even';
    
    if (useDynamicParity) {
        if (oddAlgos[0] && oddAlgos[0] !== 'Done!') {
            const oddParity = analyzeParity(oddSetup);
            if (oddParity) {
                oddLabel = oddParity.isOdd ? 'Odd' : 'Even';
            }
        }
        
        if (evenAlgos[0] && evenAlgos[0] !== 'Done!') {
            const evenParity = analyzeParity(evenSetup);
            if (evenParity) {
                evenLabel = evenParity.isOdd ? 'Odd' : 'Even';
            }
        }
    }
    
    const displayName = getDisplayName(item.name); // Get customized name

    const modalHTML = `
        <div class="modal active" id="caseModal" onclick="if(event.target.id==='caseModal') closeModal()">
            <div class="modal-content">
                <div class="modal-header">
                    <div class="modal-title">${displayName}</div>
                    <button class="close-btn" onclick="closeModal()">&times;</button>
                </div>
                <div class="modal-body">
<div class="modal-images card-svg-container">
    <div style="width: 200px; height: 200px;">${item.top}</div>
    <div style="width: 200px; height: 200px;">${item.bottom}</div>
</div>
                    <div style="text-align: center; margin-bottom: 20px;">
                        <div class="probability" style="font-size: 1.2rem;">${prob}%</div>
                        <div style="margin-top: 10px; text-align: center;">
                            <button onclick="swapAlgorithms('${item.name.replace(/'/g, "\\'")}');" style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Swap Odd/Even</button>
                        </div>
                    </div>
                    <div class="modal-algo-section">
                        <span class="modal-algo-label">${oddLabel}:</span>
                        <div class="modal-subsection">
                            <span class="modal-subsection-label">Setup:</span>
                            <div class="modal-algo-line" style="cursor: pointer; background: #e8f5e9; padding: 8px; border-radius: 4px;" onclick="openParityAnalysisModal('${oddSetup.replace(/'/g, "\\'")}', 'odd')" title="Click to analyze parity">${oddSetup}</div>
                        </div>
                        <div class="modal-subsection">
                            <span class="modal-subsection-label">Solution:</span>
                            ${oddAlgos.map((algo, idx) => {
                                const parCount = oddPars[idx];
                                let algoHTML = '';
                                if (parCount > 0) {
                                    const highlightEnd = countSlashes(algo, parCount);
                                    algoHTML = `<div class="modal-algo-line"><mark>${algo.substring(0, highlightEnd)}</mark>${algo.substring(highlightEnd)}</div>`;
                                } else {
                                    algoHTML = `<div class="modal-algo-line">${algo}</div>`;
                                }
                                
                                // Add path if enabled
                                if (showPaths && algo !== 'Done!') {
                                    const path = getShapePath(algo);
                                    if (path) {
                                        algoHTML += renderShapePath(path);
                                    }
                                }
                                
                                return algoHTML;
                            }).join('')}
                        </div>
                    </div>
                    <div class="modal-algo-section">
                        <span class="modal-algo-label">${evenLabel}:</span>
                        <div class="modal-subsection">
                            <span class="modal-subsection-label">Setup:</span>
                            <div class="modal-algo-line" style="cursor: pointer; background: #fff3e0; padding: 8px; border-radius: 4px;" onclick="openParityAnalysisModal('${evenSetup.replace(/'/g, "\\'")}', 'even')" title="Click to analyze parity">${evenSetup}</div>
                        </div>
                        <div class="modal-subsection">
                            <span class="modal-subsection-label">Solution:</span>
                            ${evenAlgos.map((algo, idx) => {
                                const parCount = evenPars[idx];
                                let algoHTML = '';
                                if (parCount > 0) {
                                    const highlightEnd = countSlashes(algo, parCount);
                                    algoHTML = `<div class="modal-algo-line"><mark>${algo.substring(0, highlightEnd)}</mark>${algo.substring(highlightEnd)}</div>`;
                                } else {
                                    algoHTML = `<div class="modal-algo-line">${algo}</div>`;
                                }
                                
                                // Add path if enabled
                                if (showPaths && algo !== 'Done!') {
                                    const path = getShapePath(algo);
                                    if (path) {
                                        algoHTML += renderShapePath(path);
                                    }
                                }
                                
                                return algoHTML;
                            }).join('')}
                        </div>
                    </div>
                    <div style="margin-top: 30px; text-align: center;">
                        <button onclick="event.stopPropagation(); closeModal(); openTrainingModal('${item.name.replace(/'/g, "\\'")}');" style="padding: 12px 30px; background: #17a2b8; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 1.1rem; font-weight: 600;">🔍 Train This Case</button>
                    </div>
                    <div style="margin-top: 20px;">
                        <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #333;">Notes:</label>
                        <textarea id="commentBox" style="width: 100%; min-height: 80px; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-family: inherit; resize: vertical;">${comment}</textarea>
                        <div style="text-align: center;">
                            <button onclick="saveModalData('${item.name.replace(/'/g, "\\'")}');" style="margin-top: 10px; padding: 8px 20px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">Save</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.body.classList.add('modal-open');
}

function closeModal() {
    const modal = document.getElementById('caseModal');
    if (modal) {
        modal.remove();
        document.body.classList.remove('modal-open');
    }
}


function swapAlgorithms(name) {
    const currentSwap = swappedCases.get(name) || false;
    swappedCases.set(name, !currentSwap);
    closeModal();
    openModal(name);
}

function toggleCaseSwapLR(name) {
    const currentSwap = perCaseSwapLR.get(name) || false;
    perCaseSwapLR.set(name, !currentSwap);
    saveState();
    closeModal();
    openModal(name);
}

function saveModalData(name) {
    const commentBox = document.getElementById('commentBox');
    if (commentBox) {
        const commentText = commentBox.value.trim();
        if (commentText) {
            comments.set(name, commentText);
        } else {
            comments.delete(name);
        }
    }
    saveState();
    render();
    closeModal();
}
