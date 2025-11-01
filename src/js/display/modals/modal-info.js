// How to Use Modal Functions
function openHowToUseModal() {
    const modal = document.getElementById('howToUseModal');
    modal.style.display = 'block';
    document.body.classList.add('modal-open');
}

function closeHowToUseModal() {
    const modal = document.getElementById('howToUseModal');
    modal.style.display = 'none';
    document.body.classList.remove('modal-open');
}

// Suggest Modal Functions
function openSuggestModal() {
    const modal = document.getElementById('suggestModal');
    modal.style.display = 'block';
    document.body.classList.add('modal-open');
}

function closeSuggestModal() {
    const modal = document.getElementById('suggestModal');
    modal.style.display = 'none';
    document.body.classList.remove('modal-open');
}

// Confession Modal Functions
function openConfessionModal() {
    const modal = document.getElementById('confessionModal');
    modal.style.display = 'block';
    document.body.classList.add('modal-open');
}

function closeConfessionModal() {
    const modal = document.getElementById('confessionModal');
    modal.style.display = 'none';
    document.body.classList.remove('modal-open');
}
