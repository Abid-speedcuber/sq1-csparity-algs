function updateProgress() {
    const totalCases = data.length;
    const learnedCount = learnedCases.size;

    progressText.textContent = `${learnedCount} / ${totalCases}`;

    const totalProbability = data.reduce((sum, item) => sum + item.probability, 0);
    const learnedProbability = data
        .filter(item => learnedCases.has(item.name))
        .reduce((sum, item) => sum + item.probability, 0);

    const p = Math.round((learnedProbability / totalProbability) * 100 * 2) / 2;
    const x = learnedCount;

    // Calculate consistency level using sigmoid function
    const exp = Math.exp;
    const numerator = 1 / (1 + exp(-12 * ((x - 1) / 89 - 0.4170435672))) - 1 / (1 + exp(-12 * (0 - 0.4170435672)));
    const denominator = 1 / (1 + exp(-12 * (1 - 0.4170435672))) - 1 / (1 + exp(-12 * (0 - 0.4170435672)));
    const c = 80 + 14 * (numerator / denominator);

    // Calculate safety
    const safety = p * c / 100 + 0.5 * (100 - p);

    document.getElementById('known-parity-text').textContent = p.toFixed(1) + '%';
    safetyText.textContent = (Math.round(safety * 2) / 2).toFixed(1) + '%';
    
    // Update mobile stats
    const mobileProgress = document.getElementById('progress-text-mobile');
    const mobileKnown = document.getElementById('known-parity-text-mobile');
    const mobileSafety = document.getElementById('safety-text-mobile');
    
    if (mobileProgress) mobileProgress.textContent = `${learnedCount}/${totalCases}`;
    if (mobileKnown) mobileKnown.textContent = p.toFixed(1) + '%';
    if (mobileSafety) mobileSafety.textContent = (Math.round(safety * 2) / 2).toFixed(1) + '%';
}

function toggleLearned(name, event = null) {
    const isRightClick = event && event.button === 2;
    
    if (isRightClick) {
        event.preventDefault();
        // Right click: learned -> learning -> planned
        if (learnedCases.has(name)) {
            learnedCases.delete(name);
            learningCases.add(name);
            plannedCases.delete(name);
        } else if (learningCases.has(name)) {
            learningCases.delete(name);
            plannedCases.add(name);
            if (!plannedLevels.has(name)) plannedLevels.set(name, 4);
        } else {
            learnedCases.add(name);
            learningCases.delete(name);
            plannedCases.delete(name);
        }
    } else {
        // Left click: planned -> learning -> learned
        if (learnedCases.has(name)) {
            learnedCases.delete(name);
            learningCases.delete(name);
            plannedCases.add(name);
            if (!plannedLevels.has(name)) plannedLevels.set(name, 4);
        } else if (learningCases.has(name)) {
            learningCases.delete(name);
            learnedCases.add(name);
            plannedCases.delete(name);
        } else {
            learningCases.add(name);
            plannedCases.delete(name);
        }
    }
    saveState();
    updateProgress();
    render();
}

function adjustPriority(name, delta) {
    // Ensure case is in planned state
    if (!plannedCases.has(name)) {
        plannedCases.add(name);
        learnedCases.delete(name);
        learningCases.delete(name);
    }
    
    const currentLevel = plannedLevels.get(name) || 4;
    let newLevel = currentLevel + delta;
    
    // Clamp between 1 (Top) and 7 (Meh)
    if (newLevel < 1) newLevel = 1;
    if (newLevel > 7) newLevel = 7;
    
    plannedLevels.set(name, newLevel);
    saveState();
    updateProgress();
    render();
}

function togglePlanned(name, level = 1, event = null) {
    if (event && event.button === 2) { // Right click
        event.preventDefault();
        // Cycle behavior
        const currentLevel = plannedLevels.get(name) || 4;
        const nextLevel = currentLevel % 7 + 1;
        plannedLevels.set(name, nextLevel);
        saveState();
        render();
    } else if (event && event.button === 0) { // Left click
        event.preventDefault();
        showPriorityMenu(name, event);
    }
}

function showPriorityMenu(name, event) {
    // Remove any existing menu
    const existingMenu = document.getElementById('priorityMenu');
    if (existingMenu) existingMenu.remove();
    
    const currentLevel = plannedLevels.get(name) || 4;
    const priorityNames = ['Top', 'Most', 'More', 'Normal', 'Less', 'Least', 'Meh'];
    
    const menu = document.createElement('div');
    menu.id = 'priorityMenu';
    menu.style.cssText = `
        position: fixed;
        background: white;
        border: 2px solid #007bff;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        padding: 8px;
        min-width: 120px;
    `;
    
    priorityNames.forEach((pName, idx) => {
        const level = idx + 1;
        const option = document.createElement('div');
        option.textContent = pName;
        option.style.cssText = `
            padding: 8px 12px;
            cursor: pointer;
            border-radius: 4px;
            font-weight: ${level === currentLevel ? '700' : '500'};
            background: ${level === currentLevel ? '#e3f2fd' : 'transparent'};
            color: ${level === currentLevel ? '#007bff' : '#333'};
        `;
        option.onmouseover = () => {
            if (level !== currentLevel) option.style.background = '#f5f5f5';
        };
        option.onmouseout = () => {
            if (level !== currentLevel) option.style.background = 'transparent';
        };
        option.onclick = () => {
            plannedLevels.set(name, level);
            saveState();
            render();
            menu.remove();
        };
        menu.appendChild(option);
    });
    
    document.body.appendChild(menu);
    
    // Position the menu
    const rect = event.target.closest('.icon-btn').getBoundingClientRect();
    let top = rect.bottom + 5;
    let left = rect.left;
    
    // Adjust if menu goes off screen
    setTimeout(() => {
        const menuRect = menu.getBoundingClientRect();
        if (menuRect.bottom > window.innerHeight) {
            top = rect.top - menuRect.height - 5;
        }
        if (menuRect.right > window.innerWidth) {
            left = window.innerWidth - menuRect.width - 10;
        }
        if (left < 10) left = 10;
        if (top < 10) top = 10;
        
        menu.style.top = top + 'px';
        menu.style.left = left + 'px';
    }, 0);
    
    // Close menu when clicking outside (after a small delay to prevent immediate closure)
    setTimeout(() => {
        const closeMenu = (e) => {
            if (!menu.contains(e.target) && e.target !== event.target) {
                menu.remove();
                document.removeEventListener('mousedown', closeMenu);
            }
        };
        document.addEventListener('mousedown', closeMenu);
    }, 100);
}
