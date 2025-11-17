// Fuzzy match helper - allows 1 edit distance (insertion, deletion, substitution)
function fuzzyMatch(str, pattern) {
    if (str === pattern) return true;
    if (pattern.length === 0) return str.length <= 1;
    if (str.length === 0) return pattern.length <= 1;
    
    // Allow exact substring match
    if (str.includes(pattern)) return true;
    
    const m = str.length;
    const n = pattern.length;
    
    // Only compute edit distance if lengths are close
    if (Math.abs(m - n) > 1) {
        return str.includes(pattern) || pattern.includes(str);
    }
    
    // Simplified edit distance check for 1 edit
    if (m === n) {
        // Check substitution
        let diffs = 0;
        for (let i = 0; i < m; i++) {
            if (str[i] !== pattern[i]) diffs++;
            if (diffs > 1) return false;
        }
        return true;
    } else if (m === n + 1) {
        // Check deletion from str
        let i = 0, j = 0, skipped = false;
        while (i < m && j < n) {
            if (str[i] === pattern[j]) {
                i++; j++;
            } else if (!skipped) {
                skipped = true;
                i++;
            } else {
                return false;
            }
        }
        return true;
    } else if (m === n - 1) {
        // Check insertion to str
        let i = 0, j = 0, skipped = false;
        while (i < m && j < n) {
            if (str[i] === pattern[j]) {
                i++; j++;
            } else if (!skipped) {
                skipped = true;
                j++;
            } else {
                return false;
            }
        }
        return true;
    }
    
    return false;
}

function filterAndSort() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const sortType = sortSelect.value;
    const learnFilter = learnFilterSelect.value;

    filteredData = data.filter(item => {
        let matchesLearnFilter = true;
        if (learnFilter === 'learned') {
            matchesLearnFilter = learnedCases.has(item.name);
        } else if (learnFilter === 'unlearned') {
            matchesLearnFilter = !learnedCases.has(item.name);
        }

        if (!matchesLearnFilter) return false;
        if (!searchTerm) return true;

        const displayName = getDisplayName(item.name).toLowerCase();
        const canonicalName = item.name.toLowerCase();
        
        // Check if search contains '/' for flipped search
        if (searchTerm.includes('/')) {
            const searchParts = searchTerm.split('/').map(p => p.trim());
            const nameParts = item.name.split('/');
            
            if (searchParts.length === 2 && nameParts.length === 2) {
                const [searchTop, searchBot] = searchParts;
                const [nameTop, nameBot] = nameParts;
                
                // Helper to match a search term against a name part with all aliases
                const matchesPart = (searchPart, namePart) => {
                    if (!searchPart) return true; // Empty search part matches anything
                    
                    const displayPart = getDisplayPart(namePart, item.name).toLowerCase();
                    const canonicalPart = namePart.toLowerCase();
                    
                    // Exact matches first
                    if (displayPart.includes(searchPart) || canonicalPart.includes(searchPart)) {
                        return true;
                    }
                    
                    // Fuzzy match current display name
                    if (fuzzyMatch(displayPart, searchPart)) {
                        return true;
                    }
                    
                    // Check all aliases with fuzzy matching
                    const aliases = getAliases(namePart);
                    for (const alias of aliases) {
                        if (alias.includes(searchPart) || fuzzyMatch(alias, searchPart)) {
                            return true;
                        }
                    }
                    
                    return false;
                };
                
                // Normal order: top/bottom
                const normalMatch = matchesPart(searchTop, nameTop) && matchesPart(searchBot, nameBot);
                
                // Flipped order: bottom/top (mirror search)
                const flippedMatch = matchesPart(searchTop, nameBot) && matchesPart(searchBot, nameTop);
                
                if (normalMatch || flippedMatch) {
                    item._searchScore = normalMatch ? 100 : 50; // Prioritize normal over flipped
                    return true;
                }
            }
        }
        
        // Single term search (no '/')
        // Priority scoring: 0 = exact current name, 1 = fuzzy current, 2 = exact alias, 3 = fuzzy alias
        let bestScore = Infinity;
        
        // Check full display name
        if (displayName.includes(searchTerm)) {
            bestScore = Math.min(bestScore, 0);
        } else if (fuzzyMatch(displayName, searchTerm)) {
            bestScore = Math.min(bestScore, 1);
        }
        
        // Check canonical name
        if (canonicalName.includes(searchTerm)) {
            bestScore = Math.min(bestScore, 0);
        } else if (fuzzyMatch(canonicalName, searchTerm)) {
            bestScore = Math.min(bestScore, 1);
        }
        
        // Check individual parts and all aliases
        const parts = item.name.split('/');
        for (const part of parts) {
            const displayPart = getDisplayPart(part, item.name).toLowerCase();
            const canonicalPart = part.toLowerCase();
            
            if (displayPart.includes(searchTerm)) {
                bestScore = Math.min(bestScore, 0);
            } else if (fuzzyMatch(displayPart, searchTerm)) {
                bestScore = Math.min(bestScore, 1);
            }
            
            if (canonicalPart.includes(searchTerm)) {
                bestScore = Math.min(bestScore, 0);
            } else if (fuzzyMatch(canonicalPart, searchTerm)) {
                bestScore = Math.min(bestScore, 1);
            }
            
            const aliases = getAliases(part);
            for (const alias of aliases) {
                if (alias.includes(searchTerm)) {
                    bestScore = Math.min(bestScore, 2);
                } else if (fuzzyMatch(alias, searchTerm)) {
                    bestScore = Math.min(bestScore, 3);
                }
            }
        }
        
        // Check all possible alias combinations
        if (parts.length === 2) {
            const [top, bottom] = parts;
            const topAliases = getAliases(top);
            const bottomAliases = getAliases(bottom);

            for (const tAlias of topAliases) {
                for (const bAlias of bottomAliases) {
                    const combined = `${tAlias}/${bAlias}`;
                    if (combined.includes(searchTerm)) {
                        bestScore = Math.min(bestScore, 2);
                    } else if (fuzzyMatch(combined, searchTerm)) {
                        bestScore = Math.min(bestScore, 3);
                    }
                }
            }
        }
        
        if (bestScore < Infinity) {
            item._searchScore = bestScore;
            return true;
        }
        
        return false;
    });

    // Sort by search relevance if searching
    if (searchTerm) {
        filteredData.sort((a, b) => {
            const scoreA = a._searchScore ?? Infinity;
            const scoreB = b._searchScore ?? Infinity;
            if (scoreA !== scoreB) return scoreA - scoreB;
            // If same score, sort by probability
            return b.probability - a.probability;
        });
    }

// Apply secondary sort if not searching or if user explicitly selected a sort
    if (!searchTerm || sortType !== 'probability') {
        if (sortType === 'priority') {
            // First sort by probability (highest first)
            filteredData.sort((a, b) => b.probability - a.probability);
            
            // Then sort by state and priority
            filteredData.sort((a, b) => {
                const aIsLearning = learningCases.has(a.name);
                const bIsLearning = learningCases.has(b.name);
                const aIsPlanned = plannedCases.has(a.name);
                const bIsPlanned = plannedCases.has(b.name);
                const aIsLearned = learnedCases.has(a.name);
                const bIsLearned = learnedCases.has(b.name);
                
                // Learning comes first
                if (aIsLearning && !bIsLearning) return -1;
                if (!aIsLearning && bIsLearning) return 1;
                
                // Then planned (by priority level, 1=top to 7=meh)
                if (aIsPlanned && !bIsPlanned && !bIsLearning && !bIsLearned) return -1;
                if (!aIsPlanned && bIsPlanned && !aIsLearning && !aIsLearned) return 1;
                if (aIsPlanned && bIsPlanned) {
                    const aPriority = plannedLevels.get(a.name) || 4;
                    const bPriority = plannedLevels.get(b.name) || 4;
                    return aPriority - bPriority;
                }
                
                // Then learned comes last
                if (aIsLearned && !bIsLearned) return 1;
                if (!aIsLearned && bIsLearned) return -1;
                
                return 0;
            });
        } else {
            const sortMap = {
                probability: 'probability',
                good: 'good',
                bad: 'bad',
                antiProbability: 'probability',
                antiGood: 'good',
                antiBad: 'bad'
            };

            const field = sortMap[sortType];
            filteredData.sort((a, b) => b[field] - a[field]);

            if (sortType.startsWith('anti') && sortType !== 'antiProbability') {
                filteredData.reverse();
            }
            if (sortType === 'antiProbability') {
                filteredData.reverse();
            }
        }
    }

    render();
}

// Responsive select labels
function updateSelectLabels() {
    const width = window.innerWidth;
    const selects = document.querySelectorAll('select');
    
    selects.forEach(select => {
        const options = select.querySelectorAll('option');
        options.forEach(option => {
            const fullText = option.getAttribute('data-full') || option.textContent;
            if (!option.getAttribute('data-full')) {
                option.setAttribute('data-full', fullText);
            }
            
            const shortText = option.getAttribute('data-short');
            const xsText = option.getAttribute('data-xs');
            
            if (width <= 400 && xsText) {
                option.textContent = xsText;
            } else if (width <= 570 && shortText) {
                option.textContent = shortText;
            } else {
                option.textContent = fullText;
            }
        });
    });
}

searchInput.addEventListener('input', filterAndSort);
sortSelect.addEventListener('change', filterAndSort);
learnFilterSelect.addEventListener('change', filterAndSort);

// Search toggle functionality
const searchToggle = document.getElementById('searchToggle');
const controls = document.querySelector('.controls');

searchToggle.addEventListener('click', () => {
    controls.classList.toggle('search-expanded');
    if (controls.classList.contains('search-expanded')) {
        searchInput.focus();
    }
});

// Close search when clicking outside
document.addEventListener('click', (e) => {
    if (!controls.contains(e.target) && controls.classList.contains('search-expanded')) {
        if (searchInput.value === '') {
            controls.classList.remove('search-expanded');
        }
    }
});

// Keep expanded if there's text
searchInput.addEventListener('input', () => {
    if (searchInput.value !== '') {
        controls.classList.add('search-expanded');
    }
});

// Responsive select labels
function updateSelectLabels() {
    const width = window.innerWidth;
    const selects = document.querySelectorAll('select');
    
    selects.forEach(select => {
        const options = select.querySelectorAll('option');
        options.forEach(option => {
            const fullText = option.getAttribute('data-full') || option.textContent;
            if (!option.getAttribute('data-full')) {
                option.setAttribute('data-full', fullText);
            }
            
            const shortText = option.getAttribute('data-short');
            const xsText = option.getAttribute('data-xs');
            
            if (width <= 400 && xsText) {
                option.textContent = xsText;
            } else if (width <= 570 && shortText) {
                option.textContent = shortText;
            } else {
                option.textContent = fullText;
            }
        });
    });
}

// Update labels on load and resize
updateSelectLabels();
window.addEventListener('resize', updateSelectLabels);