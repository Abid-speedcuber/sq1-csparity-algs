const LABELS = {
  A:"YOG", B:"YOG", C:"YG", D:"YGR", E:"YGR", F:"YR",
  G:"YRB", H:"YRB", I:"YB", J:"YBO", K:"YBO", L:"YO",
  M:"WR", N:"WRG", O:"WRG", P:"WG", Q:"WGO", R:"WGO", S:"WO",
  T:"WOB", U:"WOB", V:"WB", W:"WBR", X:"WBR"
};

const EDGES = new Set(['C','F','I','L','M','P','S','V']);
const PARTNER = {A:'B',B:'A',D:'E',E:'D',G:'H',H:'G',J:'K',K:'J',N:'O',O:'N',Q:'R',R:'Q',T:'U',U:'T',W:'X',X:'W'};
const CORNER_ID = {A:'AB',B:'AB',D:'DE',E:'DE',G:'GH',H:'GH',J:'JK',K:'JK',N:'NO',O:'NO',Q:'QR',R:'QR',T:'TU',U:'TU',W:'WX',X:'WX'};

function solved() {
  return 'ABCDEFGHIJKLMNOPQRSTUVWX'.split('');
}

function rotSection(arr, start, len, k) {
  const n = ((k % len) + len) % len;
  if (n === 0) return;
  const seg = arr.slice(start, start + len);
  const out = [];
  for (let i = 0; i < len; i++) {
    out[(i + n) % len] = seg[i];
  }
  for (let i = 0; i < len; i++) {
    arr[start + i] = out[i];
  }
}

function sliceSwap(arr) {
  for (let i = 0; i < 6; i++) {
    [arr[i], arr[12 + i]] = [arr[12 + i], arr[i]];
  }
}

function* tokens(s) {
  let i = 0;
  const L = s.length;
  const ws = /\s/;
  const int = /^([+-]?\d+)/;
  
  const skip = () => {
    while (i < L && ws.test(s[i])) i++;
  };
  
  while (true) {
    skip();
    if (i >= L) return;
    
    const ch = s[i];
    if (ch === '(') {
      i++;
      skip();
      let m = s.slice(i).match(int);
      if (!m) { i++; continue; }
      const t = +m[1];
      i += m[1].length;
      skip();
      if (s[i] === ',') i++;
      skip();
      m = s.slice(i).match(int);
      if (!m) { i++; continue; }
      const b = +m[1];
      i += m[1].length;
      skip();
      if (s[i] === ')') i++;
      skip();
      const hadSlash = (s[i] === '/');
      if (hadSlash) i++;
      yield { k: 'tb', t, b, slash: hadSlash };
      continue;
    }
    if (ch === '/') {
      i++;
      yield { k: '/' };
      continue;
    }
    i++;
  }
}

function applyScramble(scr) {
  const a = solved();
  for (const tok of tokens(scr)) {
    if (tok.k === 'tb') {
      rotSection(a, 0, 12, tok.t);
      rotSection(a, 12, 12, tok.b);
      if (tok.slash) sliceSwap(a);
    } else {
      sliceSwap(a);
    }
  }
  return a;
}

const rotArr = (a, k) => {
  const n = a.length;
  k = ((k % n) + n) % n;
  return a.slice(k).concat(a.slice(0, k));
};

const rotStr = (s, k) => {
  const n = s.length;
  k = ((k % n) + n) % n;
  return s.slice(k) + s.slice(0, k);
};

// Define canonical shape patterns (these are the DEFAULT_SHAPES)
const CANONICAL_PATTERNS = {
    'ECECECEC': 'Square',
    'EECECCEC': 'Kite',
    'EECCEECC': 'Barrel',
    'EECCECEC': 'Left Fist',
    'EECECECC': 'Right Fist',
    'EECEECCC': 'Shield',
    'EEECCECC': 'Muffin',
    'EEECECCC': 'Left Pawn',
    'ECEEECCC': 'Right Pawn',
    'EEEECCCC': 'Scallop',
    'EECCCCC': 'Paired Edges',
    'ECECCCC': 'Perpendicular Edges',
    'ECCCECC': 'Parallel Edges',
    'EEEEEECCC': '6',
    'ECEEEEECC': 'Right 5-1',
    'EEEEECECC': 'Left 5-1',
    'EECEEEECC': 'Right 4-2',
    'EEEECEECC': 'Left 4-2',
    'EEEECECEC': '4-1-1',
    'EEECEEECC': '3-3',
    'ECEECEEEC': '3-1-2',
    'ECEEECEEC': '3-2-1',
    'EECEECEEC': '2-2-2',
    'EEEEEEEECC': '8',
    'EEEEEECEEC': '6-2',
    'EEEECEEEEC': '4-4',
    'EEEEEEECEC': '7-1',
    'EEEEECEEEC': '5-3',
    'CCCCCC': 'Star'
};

function findCanonicalPattern(pattern) {
    // Try to find which canonical pattern this matches by rotation
    for (const [canonical, name] of Object.entries(CANONICAL_PATTERNS)) {
        if (canonical.length !== pattern.length) continue;
        
        for (let k = 0; k < pattern.length; k++) {
            if (rotStr(pattern, k) === canonical) {
                return { canonical, name, rotation: k };
            }
        }
    }
    
    // If no match found, return the pattern as-is with no rotation
    return { canonical: pattern, name: 'Unknown', rotation: 0 };
}

function buildUnits(state, start) {
  const units = [];
  let i = 0;
  while (i < 12) {
    const ch = state[start + i];
    if (EDGES.has(ch)) {
      units.push({ type: 'E', edge: ch });
      i += 1;
      continue;
    }
    const nextCh = state[start + ((i + 1) % 12)];
    if (PARTNER[ch] === nextCh) {
      units.push({ type: 'C', pair: CORNER_ID[ch], rep: ch });
      i += 2;
    } else {
      units.push({ type: 'C', pair: CORNER_ID[ch] || '??', rep: ch });
      i += 1;
    }
  }
  const types = units.map(u => u.type).join('');
  return { types, units };
}

function countsLabel(units) {
  const e = units.filter(u => u.type === 'E').length;
  const c = units.length - e;
  return { e, c, label: `${e}E${c}C` };
}

function calculateSixStepParity(edgesOrderLetters, cornersOrderIDs) {
  const steps = [];
  
  function getEdgeCodename(letter) {
    const colorMap = {
      'L': 'O', 'C': 'G', 'F': 'R', 'I': 'B',
      'M': 'R', 'P': 'G', 'S': 'O', 'V': 'B'
    };
    return colorMap[letter] || '?';
  }
  
  function getCornerCodename(id) {
    const colorMap = {
      'AB': 'O', 'DE': 'G', 'GH': 'R', 'JK': 'B',
      'NO': 'R', 'QR': 'G', 'TU': 'O', 'WX': 'B'
    };
    return colorMap[id] || '?';
  }
  
  function isBlackEdge(letter) {
    return ['L', 'C', 'F', 'I'].includes(letter);
  }
  
  function isBlackCorner(id) {
    return ['AB', 'DE', 'GH', 'JK'].includes(id);
  }
  
  function calculateTrioParity(codenames) {
    if (codenames.length < 3) return { result: 0, detail: 'Not enough pieces' };
    
    const trio = codenames.slice(0, 3);
    const opposites = { 'R': 'O', 'O': 'R', 'B': 'G', 'G': 'B' };
    
    let aloneIdx = -1;
    for (let i = 0; i < 3; i++) {
      const current = trio[i];
      const opp = opposites[current];
      const hasOpposite = trio.some((c, idx) => idx !== i && c === opp);
      if (!hasOpposite) {
        aloneIdx = i;
        break;
      }
    }
    
    if (aloneIdx === -1) {
      return { result: 0, detail: `Trio ${trio.join('')}: No alone element found` };
    }
    
    let pair = '';
    let pairValue = 0;
    
    if (aloneIdx === 0) {
      pair = trio[0] + trio[1];
    } else if (aloneIdx === 2) {
      pair = trio[0] + trio[2];
    } else {
      pair = trio[1] + trio[2];
    }
    
    if (pair === 'RG' || pair === 'GR' || pair === 'OB' || pair === 'BO') {
      pairValue = 1;
    } else if (pair === 'RB' || pair === 'BR' || pair === 'OG' || pair === 'GO') {
      pairValue = 0;
    }
    
    return { 
      result: pairValue, 
      detail: `Trio ${trio.join('')}: Alone at pos ${aloneIdx + 1}, pair ${pair} = ${pairValue}`
    };
  }
  
  function calculateAlternatingParity(pieces, isEdge) {
    const positions = [0, 2, 4, 6];
    const selected = positions.map(i => pieces[i]).filter(p => p !== undefined);
    
    let BlackCount = 0;
    if (isEdge) {
      BlackCount = selected.filter(p => isBlackEdge(p)).length;
    } else {
      BlackCount = selected.filter(p => isBlackCorner(p)).length;
    }
    
    const result = (BlackCount === 1 || BlackCount === 3) ? 1 : 0;
    const selectedStr = selected.join(' ');
    
    return {
      result,
      detail: `Positions 1,3,5,7: [${selectedStr}], ${BlackCount} Black = ${result}`
    };
  }
  
  const BlackEdges = edgesOrderLetters.filter(e => isBlackEdge(e));
  const BlackEdgesCodes = BlackEdges.map(e => getEdgeCodename(e));
  const line1 = calculateTrioParity(BlackEdgesCodes);
  steps.push({
    name: 'Line 1: Black Edges',
    pieces: BlackEdges.join(' '),
    codenames: BlackEdgesCodes.join(' '),
    detail: line1.detail,
    result: line1.result
  });
  
  const whiteEdges = edgesOrderLetters.filter(e => !isBlackEdge(e));
  const whiteEdgesCodes = whiteEdges.map(e => getEdgeCodename(e));
  const line2 = calculateTrioParity(whiteEdgesCodes);
  steps.push({
    name: 'Line 2: White Edges',
    pieces: whiteEdges.join(' '),
    codenames: whiteEdgesCodes.join(' '),
    detail: line2.detail,
    result: line2.result
  });
  
  const line3 = calculateAlternatingParity(edgesOrderLetters, true);
  steps.push({
    name: 'Line 3: Edges at 1,3,5,7',
    pieces: line3.detail.split(': [')[1].split(']')[0],
    codenames: '-',
    detail: line3.detail,
    result: line3.result
  });
  
  const BlackCorners = cornersOrderIDs.filter(c => isBlackCorner(c));
  const BlackCornersCodes = BlackCorners.map(c => getCornerCodename(c));
  const line4 = calculateTrioParity(BlackCornersCodes);
  steps.push({
    name: 'Line 4: Black Corners',
    pieces: BlackCorners.join(' '),
    codenames: BlackCornersCodes.join(' '),
    detail: line4.detail,
    result: line4.result
  });
  
  const whiteCorners = cornersOrderIDs.filter(c => !isBlackCorner(c));
  const whiteCornersCodes = whiteCorners.map(c => getCornerCodename(c));
  const line5 = calculateTrioParity(whiteCornersCodes);
  steps.push({
    name: 'Line 5: White Corners',
    pieces: whiteCorners.join(' '),
    codenames: whiteCornersCodes.join(' '),
    detail: line5.detail,
    result: line5.result
  });
  
  const line6 = calculateAlternatingParity(cornersOrderIDs, false);
  steps.push({
    name: 'Line 6: Corners at 1,3,5,7',
    pieces: line6.detail.split(': [')[1].split(']')[0],
    codenames: '-',
    detail: line6.detail,
    result: line6.result
  });
  
  const total = steps.reduce((sum, step) => sum + step.result, 0);
  const isOdd = (total % 2) === 1;
  
  return { steps, total, isOdd };
}

function analyzeParity(setupScramble) {
  try {
    const state = applyScramble(setupScramble);
    
    const topRaw = buildUnits(state, 0);
    const botRaw = buildUnits(state, 12);
    const topUnits = topRaw.units;
    const botUnits = botRaw.units;
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
}