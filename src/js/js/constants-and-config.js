// Defines all aliases and UI options
const shapeAliases = {
    "Muffin": { aliases: ["muffin", "mushroom"], options: ["Muffin", "Mushroom"] },
    "6": { aliases: ["6", "6-0", "60"], options: ["6", "6-0", "60"] },
    "8": { aliases: ["8", "8-0", "80", "dome"], options: ["8", "8-0", "80", "Dome"] },
    "4-4": { aliases: ["4-4", "44", "eye", "seashell"], options: ["4-4", "44", "Eye", "Seashell"] },
    "7-1": { aliases: ["7-1", "71", "observatory"], options: ["7-1", "71", "Observatory"] },
    "5-3": { aliases: ["5-3", "53"], options: ["5-3", "53"] },
    "2-2-2": { aliases: ["2-2-2", "222", "fan", "trefoil", "radioactive"], options: ["2-2-2", "222", "Fan", "Trefoil", "Radioactive"] },
    "6-2": { aliases: ["6-2", "62"], options: ["6-2", "62"] },
    "Perpendicular Edges": { aliases: ["perpendicular edges", "l-shape", "l shape", "arrow"], options: ["Perpendicular Edges", "L-Shape", "Arrow"] },
    "Parallel Edges": { aliases: ["parallel edges", "line", "crown"], options: ["Parallel Edges", "Line", "Crown"] },
    "Paired Edges": { aliases: ["paired edges", "pair"], options: ["Paired Edges", "Pair"] },
    "5-1": { aliases: ["5-1", "51", "tree"], options: ["5-1", "51", "Tree"] },
    "4-2": { aliases: ["4-2", "42", "knight"], options: ["4-2", "42", "Knight"] },
    "3-3": { aliases: ["3-3", "33", "missile"], options: ["3-3", "33", "Missile"] },
    "4-1-1": { aliases: ["4-1-1", "411", "squid", "jellyfish"], options: ["4-1-1", "411", "Squid", "Jellyfish"] },
    "3-1-2": { aliases: ["3-1-2", "312"], options: ["3-1-2", "312"] },
    "3-2-1": { aliases: ["3-2-1", "321"], options: ["3-2-1", "321"] },
    "Pawn": { aliases: ["pawn", "paw"], options: ["Pawn", "Paw"] },
    "Kite": { aliases: ["kite"], options: ["Kite"] },
    "Square": { aliases: ["square"], options: ["Square"] },
    "Star": { aliases: ["star"], options: ["Star"] },
    "Barrel": { aliases: ["barrel"], options: ["Barrel"] },
    "Scallop": { aliases: ["scallop"], options: ["Scallop"] },
    "Shield": { aliases: ["shield"], options: ["Shield"] },
    "Fist": { aliases: ["fist"], options: ["Fist"] }
};

// Alphabetized list of base shapes for the settings UI
const baseShapes = [
    "2-2-2", "3-1-2", "3-2-1", "3-3", "4-1-1", "4-2", "4-4", "5-1", "5-3", "6", "6-2", "7-1", "8",
    "Barrel", "Fist", "Kite", "Muffin", "Paired Edges", "Parallel Edges", "Pawn",
    "Perpendicular Edges", "Scallop", "Shield", "Square", "Star"
];
// Shapes that can have Left/Right prefix
const shapesWithLR = ["Pawn", "Fist", "4-2", "5-1"];