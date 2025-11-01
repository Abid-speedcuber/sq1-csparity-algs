const caseNameModal = document.getElementById('caseNameModal');

function openCaseNameModal() {
    caseNameModal.style.display = 'block';
    document.body.classList.add('modal-open');
    document.getElementById('shortLRToggle').checked = useShortLR;
    document.getElementById('lrPositionFront').checked = (lrPosition === 'front');
    document.getElementById('lrPositionBack').checked = (lrPosition === 'back');
    populateCaseNameSettings();
}

function closeCaseNameModal() {
    caseNameModal.style.display = 'none';
    document.body.classList.remove('modal-open');
}

function populateCaseNameSettings() {
    const container = document.getElementById('caseNameSettingsContainer');
    container.innerHTML = '';

    for (const shape of baseShapes) {
        const config = shapeAliases[shape];
        if (!config) continue;

        let defaultSetting = shape;
        if (shape === "Paired Edges") defaultSetting = "Pair";
        else if (shape === "Perpendicular Edges") defaultSetting = "L-Shape";
        else if (shape === "Parallel Edges") defaultSetting = "Line";
        const currentSetting = caseNameSettings.get(shape) || defaultSetting;
        const currentCustom = customCaseNames.get(shape) || '';
        const hasLR = shapesWithLR.includes(shape);
        const isSwapped = swapShapeLR.get(shape) || false;

        let radiosHTML = '';
        for (const option of config.options) {
            const id = `name-${shape}-${option}`.replace(/\s/g, '-');
            const checked = (currentSetting === option) ? 'checked' : '';
            radiosHTML += `
                <div style="display: flex; align-items: center; gap: 5px;">
                    <input type="radio" id="${id}" name="name-${shape}" value="${option}" ${checked} onclick="updateCaseNameSetting('${shape}', '${option}')">
                    <label for="${id}" style="cursor: pointer;">${option}</label>
                </div>
            `;
        }

        // Add the "Custom" radio
        const customId = `name-${shape}-Custom`;
        const customChecked = (currentSetting === 'Custom') ? 'checked' : '';
        const customInputId = `custom-name-${shape}`;
        radiosHTML += `
            <div style="display: flex; align-items: center; gap: 5px; flex-wrap: wrap;">
                <input type="radio" id="${customId}" name="name-${shape}" value="Custom" ${customChecked} onclick="updateCaseNameSetting('${shape}', 'Custom')">
                <label for="${customId}" style="cursor: pointer;">Custom:</label>
                <input type="text" id="${customInputId}" value="${currentCustom}" oninput="updateCustomCaseName('${shape}', this.value)" style="width: 100px; padding: 3px 5px; font-size: 0.9rem; border: 1px solid #ccc; border-radius: 3px;">
            </div>
        `;

        // Add L/R swap toggle if applicable
        let swapHTML = '';
        if (hasLR) {
            swapHTML = `
                <div style="display: flex; align-items: center; gap: 5px; margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee;">
                    <input type="checkbox" id="swap-${shape}" ${isSwapped ? 'checked' : ''} onchange="toggleShapeSwapLR('${shape}', this.checked)" style="transform: scale(1.2); cursor: pointer;">
                    <label for="swap-${shape}" style="cursor: pointer; font-size: 0.9rem;">Swap Left/Right</label>
                </div>
            `;
        }

        const settingHTML = `
            <div style="border: 1px solid #eee; padding: 10px; border-radius: 5px; background: #fcfcfc;">
                <strong style="color: #007bff; margin-bottom: 8px; display: block; border-bottom: 1px solid #eee; padding-bottom: 5px;">${shape}</strong>
                <div style="display: flex; flex-direction: column; gap: 5px;">
                    ${radiosHTML}
                    ${swapHTML}
                </div>
            </div>
        `;
        container.innerHTML += settingHTML;
    }
}

function updateCaseNameSetting(shape, value) {
    caseNameSettings.set(shape, value);
    saveState();
    render(); // Re-render cards with new names
}

function updateCustomCaseName(shape, value) {
    customCaseNames.set(shape, value.trim());
    // Also ensure the 'Custom' radio is selected if they type
    caseNameSettings.set(shape, 'Custom');
    const customRadio = document.getElementById(`name-${shape}-Custom`);
    if (customRadio) customRadio.checked = true;
    saveState();
    render(); // Re-render cards with new names
}

function toggleShapeSwapLR(shape, isChecked) {
    if (isChecked) {
        swapShapeLR.set(shape, true);
    } else {
        swapShapeLR.delete(shape);
    }
    saveState();
    render(); // Re-render cards with new names
}

function toggleShortLR(isChecked) {
    useShortLR = isChecked;
    saveState();
    render();
}

function setLRPosition(position) {
    lrPosition = position;
    saveState();
    render();
}
