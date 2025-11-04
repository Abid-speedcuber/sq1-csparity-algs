function generateScrambleSVGFromHex(scramble, equator) {
    // Parse scramble to determine shape and piece positions
    if (scramble.length !== 25) {
        throw new Error('Invalid scramble format');
    }

    // Extract the equator character (position 12)
    const actualEquator = scramble[12];

    // Determine shape based on piece types in scramble
    const shapeArray = new Array(24);
    let scrambleIndex = 0;

    // Process positions 0-11 (top layer)
    for (let i = 0; i < 12; i++) {
        if (scrambleIndex === 12) scrambleIndex++; // Skip equator
        const piece = scramble[scrambleIndex];

        // Determine if this is a corner (odd hex) or edge (even hex)
        const isCornerPiece = ['1', '3', '5', '7', '9', 'b', 'd', 'f'].includes(piece.toLowerCase());
        shapeArray[i] = isCornerPiece ? 1 : 0;
        scrambleIndex++;
    }

    // Process positions 12-23 (bottom layer)
    scrambleIndex = 13; // Skip equator at position 12
    for (let i = 12; i < 24; i++) {
        const piece = scramble[scrambleIndex];

        // Determine if this is a corner (odd hex) or edge (even hex)
        const isCornerPiece = ['1', '3', '5', '7', '9', 'b', 'd', 'f'].includes(piece.toLowerCase());
        shapeArray[i] = isCornerPiece ? 1 : 0;
        scrambleIndex++;
    }

    // Build clusters from the determined shape
    const scrambleSlots = buildClustersFromShape(shapeArray);

    // Parse scramble to get piece assignments
    const pieceAssignments = parseScrambleAssignmentsFromHex(scramble, scrambleSlots);

    // Generate SVG using the existing function
    return createScrambleSVGElementsFromHex(scrambleSlots, pieceAssignments, actualEquator);
}

function parseScrambleAssignmentsFromHex(scramble, slots) {
    const assignments = {};
    for (let i = 0; i < slots.length; i++) {
        const slot = slots[i];
        const startLetter = slot.startLetter; // 0..23

        // map letter index to scramble string index (skip the equator at 12)
        const scrambleIndex = (startLetter < 12)
            ? startLetter
            : 13 + (startLetter - 12);

        // corners are duplicated in the scramble string (two identical chars),
        // but we only need the first instance stored in assignments.
        assignments[slot.label] = scramble[scrambleIndex];
    }

    return assignments;
}

function buildClustersFromShape(shapeArray) {
  const slots = [];
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWX'.split('');
  
  function processLayer(start, end) {
    let i = start;
    while (i < end) {
      const isCorner = shapeArray[i] === 1;
      
      if (isCorner) {
        // Check if next position is also a corner (full corner)
        const nextIdx = (i - start + 1) % 12 + start;
        if (nextIdx < end && shapeArray[nextIdx] === 1) {
          slots.push({
            type: 'corner',
            startLetter: i,
            lettersCount: 2,
            label: letters[i] + letters[nextIdx]
          });
          i += 2;
        } else {
          // Half corner
          slots.push({
            type: 'half-corner',
            startLetter: i,
            lettersCount: 1,
            label: letters[i]
          });
          i += 1;
        }
      } else {
        // Edge
        slots.push({
          type: 'edge',
          startLetter: i,
          lettersCount: 1,
          label: letters[i]
        });
        i += 1;
      }
    }
  }
  
  processLayer(0, 12);  // Top layer
  processLayer(12, 24); // Bottom layer
  
  return slots;
}

function createScrambleSVGElementsFromHex(slots, assignments, equator) {
    const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
    const unit10vh = vh * 0.10;
    const svgSize = Math.round(vh * 0.25); // Smaller for scramble display
    const cx = svgSize / 2, cy = svgSize / 2;

    const r_inner = 0;
    const r_outer = Math.round(unit10vh * 0.7);
    const r_outer_apex = Math.round(r_outer * (Math.cos(Math.PI / 6) + Math.sin(Math.PI / 6)));
    const ringR = r_outer + Math.round(unit10vh * 0.4);

    function p2c_hex(cx, cy, radius, angleDeg) {
        const a = angleDeg * Math.PI / 180;
        return { x: cx + radius * Math.cos(a), y: cy - radius * Math.sin(a) };
    }

    function ptsToStr_hex(pts) { return pts.map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' '); }

    // Create SVG container
    let svgHTML = `<div style="display: flex; gap: 5px; align-items: center;">`;

    // Left SVG (top layer)
    svgHTML += `<svg width="${svgSize}" height="${svgSize}" viewBox="0 0 ${svgSize} ${svgSize}">`;

    // Base ring and line for left
    svgHTML += `<circle cx="${cx}" cy="${cy}" r="${ringR}" class="cluster-ring" fill="none" stroke="rgba(0,0,0,0.08)" stroke-width="1"/>`;
    const p1L = p2c_hex(cx, cy, ringR + 6, 75);
    const p2L = p2c_hex(cx, cy, ringR + 6, 255);
    svgHTML += `<line x1="${p1L.x}" y1="${p1L.y}" x2="${p2L.x}" y2="${p2L.y}" stroke="#7a0000" stroke-width="2"/>`;

    // Add center dot
    svgHTML += `<circle cx="${cx}" cy="${cy}" r="${Math.max(2, Math.round(unit10vh * 0.05))}" fill="rgba(0,0,0,0.06)"/>`;

    // Left circle pieces (A-L)
    const leftLetterCenter = Array.from({ length: 12 }, (_, j) => 90 + j * 30);

    slots.forEach(slot => {
        if (slot.startLetter < 12) { // Left circle
            const piece = assignments[slot.label];
            const centerAngle = computeSlotAngleFromHex(slot, leftLetterCenter);
            svgHTML += createPieceSVGFromHex(slot, piece, cx, cy, centerAngle, r_inner, r_outer, r_outer_apex, unit10vh, false);
        }
    });

    svgHTML += `</svg>`;

    // Right SVG (bottom layer)  
    svgHTML += `<svg width="${svgSize}" height="${svgSize}" viewBox="0 0 ${svgSize} ${svgSize}">`;

    // Base ring and line for right
    svgHTML += `<circle cx="${cx}" cy="${cy}" r="${ringR}" class="cluster-ring" fill="none" stroke="rgba(0,0,0,0.08)" stroke-width="1"/>`;
    const p1R = p2c_hex(cx, cy, ringR + 6, 105);
    const p2R = p2c_hex(cx, cy, ringR + 6, 285);
    svgHTML += `<line x1="${p1R.x}" y1="${p1R.y}" x2="${p2R.x}" y2="${p2R.y}" stroke="#7a0000" stroke-width="2"/>`;

    // Add center dot
    svgHTML += `<circle cx="${cx}" cy="${cy}" r="${Math.max(2, Math.round(unit10vh * 0.05))}" fill="rgba(0,0,0,0.06)"/>`;

    // Right circle pieces (M-X)
    const rightLetterCenter = Array.from({ length: 12 }, (_, j) => 300 + j * 30);

    slots.forEach(slot => {
        if (slot.startLetter >= 12) { // Right circle
            const piece = assignments[slot.label];
            const centerAngle = computeSlotAngleFromHex(slot, rightLetterCenter);
            svgHTML += createPieceSVGFromHex(slot, piece, cx, cy, centerAngle, r_inner, r_outer, r_outer_apex, unit10vh, true);
        }
    });

    svgHTML += `</svg>`;
    svgHTML += `</div>`;

    return svgHTML;
}

function computeSlotAngleFromHex(slot, letterAngles) {
    const angles = [];
    for (let k = 0; k < slot.lettersCount; k++) {
        const globalIdx = slot.startLetter + k;
        const localIdx = globalIdx >= 12 ? globalIdx - 12 : globalIdx;
        angles.push(letterAngles[localIdx]);
    }
    const sum = angles.reduce((a, b) => a + b, 0);
    return sum / angles.length;
}

function createPieceSVGFromHex(slot, piece, cx, cy, centerAngle, r_inner, r_outer, r_outer_apex, unit10vh, isBottom = false) {
    // Normalize the source-of-truth: determine top vs bottom from the slot's startLetter.
    isBottom = !!(slot && typeof slot.startLetter === 'number' && slot.startLetter >= 12);

    let svgContent = '';
    const half = slot.type === 'corner' ? 30 : 15;

    // simple point lerp helper (used for the inner small kite)
    function lerpPoint(a, b, t) { return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }; }

    function p2c_piece(cx, cy, radius, angleDeg) {
        const a = angleDeg * Math.PI / 180;
        return { x: cx + radius * Math.cos(a), y: cy - radius * Math.sin(a) };
    }

    function ptsToStr_piece(pts) {
        return pts.map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
    }

    if (slot.type === 'edge') {
        // Edge piece - two-colored triangle (unchanged)
        const pInner = p2c_piece(cx, cy, r_inner, centerAngle);
        const pA = p2c_piece(cx, cy, r_outer, centerAngle - half);
        const pB = p2c_piece(cx, cy, r_outer, centerAngle + half);

        const midRadius = r_inner + (r_outer - r_inner) * 0.8;
        const pMidA = p2c_piece(cx, cy, midRadius, centerAngle - half);
        const pMidB = p2c_piece(cx, cy, midRadius, centerAngle + half);

        const edgeColors = getEdgeColorsFromHex(piece);

        svgContent += `<polygon points="${ptsToStr_piece([pMidA, pA, pB, pMidB])}" fill="${edgeColors.outer}" stroke="#333" stroke-width="1"/>`;
        svgContent += `<polygon points="${ptsToStr_piece([pInner, pMidA, pMidB])}" fill="${edgeColors.inner}" stroke="#333" stroke-width="0.8"/>`;

    } else if (slot.type === 'corner') {
        // Corner piece — build a 3-part kite (left outer, right outer, inner small kite)
        const pInner = p2c_piece(cx, cy, r_inner, centerAngle);
        const pOuterR = p2c_piece(cx, cy, r_outer, centerAngle - half);
        const pApex = p2c_piece(cx, cy, r_outer_apex, centerAngle);
        const pOuterL = p2c_piece(cx, cy, r_outer, centerAngle + half);

        const scale = 0.80;
        const pSmallL = lerpPoint(pInner, pOuterL, scale);
        const pSmallR = lerpPoint(pInner, pOuterR, scale);
        const pSmallBottom = lerpPoint(pInner, pApex, scale);
        // get colors (top/left/right) and flip left/right when rendering bottom layer
        const colors = getCornerColorsFromHex(piece, isBottom);

        // left outer (between big kite and small kite)
        svgContent += `<polygon points="${ptsToStr_piece([pInner, pOuterL, pApex, pSmallBottom, pSmallL])}" fill="${colors.left}" stroke="#333" stroke-width="1"/>`;

        // right outer
        svgContent += `<polygon points="${ptsToStr_piece([pInner, pSmallR, pSmallBottom, pApex, pOuterR])}" fill="${colors.right}" stroke="#333" stroke-width="1"/>`;

        // inner small kite (top color)
        svgContent += `<polygon points="${ptsToStr_piece([pInner, pSmallL, pSmallBottom, pSmallR])}" fill="${colors.top}" stroke="#333" stroke-width="0.8"/>`;

        // crisp outline + splitter line for visual separation
        svgContent += `<polygon points="${ptsToStr_piece([pInner, pOuterL, pApex, pOuterR])}" fill="none" stroke="#333" stroke-width="1"/>`;
        svgContent += `<line x1="${pApex.x.toFixed(2)}" y1="${pApex.y.toFixed(2)}" x2="${pSmallBottom.x.toFixed(2)}" y2="${pSmallBottom.y.toFixed(2)}" stroke="#333" stroke-width="1" stroke-linecap="round"/>`;

    } else if (slot.type === 'half-corner') {
        // Half corner (preserve previous behavior)
        const halfInner = 15;
        const pInner = p2c_piece(cx, cy, r_inner, centerAngle);
        const pOuterR = p2c_piece(cx, cy, r_outer, centerAngle - halfInner);
        const pApex = p2c_piece(cx, cy, r_outer_apex, centerAngle);
        const pOuterL = p2c_piece(cx, cy, r_outer, centerAngle + halfInner);

        const halfCornerColor = getHalfCornerSVGContentFromHex(piece);
        svgContent += `<polygon points="${ptsToStr_piece([pInner, pOuterR, pApex, pOuterL])}" ${halfCornerColor} stroke="#333" stroke-width="0.6"/>`;
    }

    // Add text label (unchanged)
    const textRadius = slot.type === 'edge' ? r_inner + (r_outer - r_inner) * 0.4 : r_inner + (r_outer_apex - r_inner) * 0.5;
    const mid = p2c_piece(cx, cy, textRadius, centerAngle);
    const textColor = (slot.type === 'corner' || slot.type === 'half-corner') ? '#fff' : '#012';
    svgContent += svgContent;

    return svgContent;
}

function getEdgeColorsFromHex(piece) {
    switch (piece.toLowerCase()) {
        case '0': return { inner: '#000000', outer: '#FF8C00' };
        case '2': return { inner: '#000000', outer: '#0066CC' };
        case '4': return { inner: '#000000', outer: '#CC0000' };
        case '6': return { inner: '#000000', outer: '#00AA00' };
        case '8': return { inner: '#FFFFFF', outer: '#00AA00' };
        case 'a': return { inner: '#FFFFFF', outer: '#CC0000' };
        case 'c': return { inner: '#FFFFFF', outer: '#0066CC' };
        case 'e': return { inner: '#FFFFFF', outer: '#FF8C00' };
        case 'E': return { inner: '#888888', outer: '#888888' }; // Edge placeholder
        case 'R': return { inner: 'transparent', outer: 'transparent' }; // Universal placeholder
        default: return { inner: '#4ecdc4', outer: '#4ecdc4' };
    }
}

// piece -> color-triplet mapping (top, left, right) using your exact order
function getCornerTripletFromHex(piece) {
    switch ((piece || '').toLowerCase()) {
        case '1': return { top: 'y', left: 'b', right: 'o' };
        case '3': return { top: 'y', left: 'r', right: 'b' };
        case '5': return { top: 'y', left: 'g', right: 'r' };
        case '7': return { top: 'y', left: 'o', right: 'g' };
        case '9': return { top: 'w', left: 'g', right: 'o' };
        case 'b': return { top: 'w', left: 'r', right: 'g' };
        case 'd': return { top: 'w', left: 'b', right: 'r' };
        case 'f': return { top: 'w', left: 'o', right: 'b' };
        case 'C': return { top: '#888888', left: '#888888', right: '#888888' }; // Corner placeholder
        default: return { top: '#4ecdc4', left: '#4ecdc4', right: '#4ecdc4' }; // fallback
    }
}

function letterToHexFromHex(letter) {
    if (!letter) return '#cccccc';
    switch (letter.toLowerCase()) {
        case 'y': return '#000000'; // yellow
        case 'w': return '#FFFFFF'; // white
        case 'o': return '#FF8C00'; // orange
        case 'b': return '#0066CC'; // blue
        case 'r': return '#CC0000'; // red
        case 'g': return '#00AA00'; // green
        default: return '#cccccc';
    }
}

// returns { top, left, right } hex colors. If isBottom is true, left/right are swapped (mirrored)
function getCornerColorsFromHex(piece, isBottom) {
    const trip = getCornerTripletFromHex(piece);
    let left = letterToHexFromHex(trip.left);
    let right = letterToHexFromHex(trip.right);
    const top = letterToHexFromHex(trip.top);

    if (isBottom) {
        [left, right] = [left, right];
    }
    return { top, left, right };
}

function getHalfCornerSVGContentFromHex(piece) {
    switch (piece) {
        case '1': return 'fill="#ff9999"';
        case '3': return 'fill="#ff9999"';
        case '5': return 'fill="#ff9999"';
        case '7': return 'fill="#ff9999"';
        case '9': return 'fill="#ff9999"';
        case 'b': return 'fill="#ff9999"';
        case 'd': return 'fill="#ff9999"';
        case 'f': return 'fill="#ff9999"';
        default: return 'fill="#ff9999"';
    }
}