// Initialize priority option visibility
const priorityOption = document.getElementById('sortPriority');
if (priorityOption) {
    priorityOption.style.display = enablePriorityLearning ? 'block' : 'none';
}

// Loading tips object
const loadingTips = {
    firstLoad: [
        "Reading the 'How to Use' instructions can help you discover hidden features of the app.",
    ],
    general: [
        "Did you know, For 4 edge 4 corner cases, it doesn't matter whether you start tracing from top or bottom?",
        "Did you know, You can use this app to make your own personalized csp algorithm sheet with hints with a bit of help of Claude Sonnet AI?",
        "If you are a beginner, you can verify if your tracing was correct using this app's built in parity tracer",
        "No tip for you this time",
        "For the symmetric cases when top/bottom gets swapped, it feels like you are doing the opposite algorithm!",
        "69 420",
        "Did you know, you can write down hints for each case in this app so that you can instantly remember a case just by looking at the hint?",
        "You can change a case's state from unlearned -> learning -> learned",
        "The safety percentage deducts what percentage of solves you are gonna be safe from the Parity Monster!",
        "noobmaster69",
        "Many of the cases' odd/even algorithms are same algorithm from either right/left. You can just decide a side to be good and then tag a case if it is good or bad... one word parity rmember hack.",
        "Did you know, you can use your custom names for a case? You just have to change it from the settings",
        "Did you know you can trace parity from a different angle and still find the app relevant? Just toggle Dynamic parity deduction from settings and then set your own orientation inside the parity orientation settings.",
        "May the cubing god grant you the patience to learn all 180 algorithms.",
        "You can train a case directly from inside this app",
        "67",
        "Inside the scramble, the colored text mean that's where the cubeshape starts to change. Red means if you wanna start from there you need to do a (1,1) beforehand.",
        "Hope your day is as good as an even square/square"
    ]
};

// Select and display a random tip
const tipElement = document.createElement('p');
tipElement.style.cssText = 'font-size: 0.95rem; color: #555; margin-top: 20px; max-width: 500px; text-align: center; line-height: 1.5;';
const tips = isFirstLoad ? loadingTips.firstLoad : loadingTips.general;
const randomTip = tips[Math.floor(Math.random() * tips.length)];
tipElement.textContent = randomTip;
document.getElementById('loadingScreen').appendChild(tipElement);

// Loading screen progress simulation
let loadProgress = 0;
const progressBar = document.getElementById('loadingProgress');
const loadingInterval = setInterval(() => {
    loadProgress += Math.random() * 30;
    if (loadProgress > 90) loadProgress = 90;
    progressBar.style.width = loadProgress + '%';
}, 100);

updateProgress();
filterAndSort();

// Complete loading and show content
window.addEventListener('load', async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    clearInterval(loadingInterval);
    progressBar.style.width = '100%';
    
    await new Promise(resolve => setTimeout(resolve, 200));
    
    document.getElementById('loadingScreen').style.opacity = '0';
    document.querySelector('.container').style.opacity = '1';
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    document.getElementById('loadingScreen').style.display = 'none';
    
    // Show how to use modal on first load - wait 1.5 seconds after everything is rendered
    if (isFirstLoad) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        openHowToUseModal();
    }
});