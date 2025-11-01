// --- Naming Helper Functions ---

/**
 * Gets the display name for a single part (e.g., "Left Pawn")
 * based on user settings.
 */
function getDisplayPart(part, caseName = null) {
    let prefix = '';
    let base = part;

    if (part.startsWith('Left ')) {
        prefix = 'Left ';
        base = part.substring(5);
    } else if (part.startsWith('Right ')) {
        prefix = 'Right ';
        base = part.substring(6);
    }

    // Apply shape-level L/R swap if toggled for this base shape
    const shouldSwap = swapShapeLR.get(base) || false;
    if (shouldSwap && prefix) {
        if (prefix === 'Left ') prefix = 'Right ';
        else if (prefix === 'Right ') prefix = 'Left ';
    }

    // Apply short notation if enabled
    if (useShortLR && prefix) {
        if (prefix === 'Left ') prefix = 'L. ';
        else if (prefix === 'Right ') prefix = 'R. ';
    }

    // Get the user's chosen name for the base shape
    const baseSetting = caseNameSettings.get(base) || base; // Default to canonical
    let finalBaseName;

    if (baseSetting === 'Custom') {
        finalBaseName = customCaseNames.get(base) || base; // Fallback to base
    } else {
        finalBaseName = baseSetting;
    }

    // Apply position setting (front or back)
    if (lrPosition === 'back' && prefix) {
        return finalBaseName + ' ' + prefix.trim();
    }

    return prefix + finalBaseName;
}

/**
 * Gets the full display name for a case (e.g., "Muffin/Square")
 * based on user settings.
 */
function getDisplayName(originalName) {
    const parts = originalName.split('/');
    if (parts.length === 2) {
        const [top, bottom] = parts;
        return `${getDisplayPart(top, originalName)}/${getDisplayPart(bottom, originalName)}`;
    }
    return originalName; // Fallback
}

/**
 * Gets all possible aliases for a single part for searching.
 * Includes L/R swapped versions.
 */
function getAliases(part) {
    let base = part;
    let prefixes = ['']; // Default for non-prefixed shapes

    if (part.startsWith('Left ')) {
        base = part.substring(5);
        prefixes = ['left ', 'right ']; // Search for both
    } else if (part.startsWith('Right ')) {
        base = part.substring(6);
        prefixes = ['left ', 'right ']; // Search for both
    }

    const config = shapeAliases[base];
    if (!config) return [part.toLowerCase()]; // Fallback

    const baseAliases = config.aliases;
    let results = [];

    for (const p of prefixes) {
        for (const alias of baseAliases) {
            results.push((p + alias).trim()); // .trim() for the '' prefix case
        }
    }
    return results;
}

// --- End New Naming Helper Functions ---

function getShortDisplayName(canonicalName) {
    // Get the full display name first (respects user settings)
    const fullName = getDisplayPart(canonicalName);
    
    // Apply short name rules
    let shortName = fullName;
    
    // Handle Left/Right prefixes
    if (shortName.startsWith('Left ')) {
        shortName = 'L. ' + shortName.substring(5);
    } else if (shortName.startsWith('Right ')) {
        shortName = 'R. ' + shortName.substring(6);
    }
    
    // Apply specific replacements (case-insensitive matching)
    const replacements = {
        'Paired Edges': 'Pair',
        'Pair': 'Pair', // In case user renamed it
        'Perpendicular Edges': 'L',
        'L-Shape': 'L',
        'Arrow': 'L',
        'Parallel Edges': 'Line',
        'Crown': 'Line',
        'Square': 'Sq',
        'Muffin': 'Muff',
        'Mushroom': 'Muff',
        'Barrel': 'Barr',
        'Scallop': 'Scal'
    };
    
    // Check each replacement
    for (const [pattern, replacement] of Object.entries(replacements)) {
        const regex = new RegExp(pattern, 'gi');
        shortName = shortName.replace(regex, replacement);
    }
    
    // Remove hyphens from numbers (e.g., 3-2-1 → 321, 4-4 → 44)
    shortName = shortName.replace(/(\d)-(\d)/g, '$1$2');
    
    return shortName;
}
