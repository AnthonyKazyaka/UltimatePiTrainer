document.addEventListener('DOMContentLoaded', function() {
    // App state
    let piDigits = '';
    let correctGroupNumber = '';
    let currentInputNumbers = '';
    let currentGroupIndex = 0;
    let highestGroupIndex = 0;
    let chunkSize = 10;
    let repeatCount = 1;
    let currentRepeat = 0;
    let sequenceMode = false;
    let spacedRepetitionMode = false;
    let spacedRepetitionDeck = [];  // Array of chunks with their spaced repetition data
    
    // DOM Elements
    const startButton = document.getElementById('start-button');
    const chunkSizeInput = document.getElementById('chunk-size');
    const settingsPanel = document.querySelector('.settings-panel');
    const gamePanel = document.querySelector('.game-panel');
    const correctNumbersSpan = document.getElementById('correct-numbers');
    const showCorrectButton = document.getElementById('show-correct-button');
    const numbersInput = document.getElementById('numbers-input');
    const numberButtons = document.querySelectorAll('.number-button');
    const messageWindow = document.getElementById('message-window');
    const messageTitle = document.getElementById('message-title');
    const messageContent = document.getElementById('message-content');
    const messageOkButton = document.getElementById('message-ok-button');
    const highestChunkSpan = document.getElementById('highest-chunk');
    const repeatCountInput = document.getElementById('repeat-count');
    const sequenceModeButton = document.getElementById('sequence-mode-button');
    const spacedRepetitionModeButton = document.getElementById('spaced-repetition-mode-button');
    
    // Messages
    const errorWindowTitle = 'Uh oh! Wrong Number!';
    const errorWindowContent = () => `The correct sequence is: ${correctGroupNumber}`;
    
    const successWindowTitle = 'Congratulations!';
    const successWindowContent = 'Try the next chunk of digits and see how you do!';
    const successRestartGroupsContent = 'Try it from the beginning now!';
    
    const trainingCompletedTitle = 'Awesome! Congratulations!';
    const trainingCompletedMessage = 'You\'ve finished all this app can teach you! Go out there and show off that big brain, Einstein! Starting back at the beginning.';
    
    // Load Pi digits
    fetch('assets/pi.txt')
        .then(response => response.text())
        .then(data => {
            // Remove the decimal point if present and any other non-digit characters
            piDigits = data.replace(/[^0-9]/g, '');
            console.log('Pi digits loaded successfully');
        })
        .catch(error => console.error('Error loading Pi digits:', error));
    
    // Initialize from localStorage if available
    function initFromLocalStorage() {
        if (localStorage.getItem('ultimatePiTrainer')) {
            const savedState = JSON.parse(localStorage.getItem('ultimatePiTrainer'));
            highestGroupIndex = savedState.highestGroupIndex || 0;
            chunkSize = savedState.chunkSize || 10;
            repeatCount = savedState.repeatCount || 1;
            spacedRepetitionDeck = savedState.spacedRepetitionDeck || [];
            
            chunkSizeInput.value = chunkSize;
            repeatCountInput.value = repeatCount;
            highestChunkSpan.textContent = highestGroupIndex;
        }
    }
    
    // Save state to localStorage
    function saveToLocalStorage() {
        const stateToSave = {
            highestGroupIndex,
            chunkSize,
            repeatCount,
            spacedRepetitionDeck
        };
        localStorage.setItem('ultimatePiTrainer', JSON.stringify(stateToSave));
    }
    
    // Start game
    function startGame() {
        chunkSize = parseInt(chunkSizeInput.value, 10) || 10;
        
        if (chunkSize < 5) chunkSize = 5;
        if (chunkSize > 50) chunkSize = 50;
        
        chunkSizeInput.value = chunkSize;
        currentGroupIndex = 0;
        correctGroupNumber = piDigits.substring(0, chunkSize);
        
        settingsPanel.style.display = 'none';
        gamePanel.style.display = 'block';
        
        currentInputNumbers = '';
        numbersInput.value = '';
        correctNumbersSpan.style.visibility = 'hidden';
        
        saveToLocalStorage();
    }
    
    // Handle number button click
    function handleNumberButtonClick(value) {
        currentInputNumbers += value;
        numbersInput.value = currentInputNumbers;
        
        // Validate input
        if (currentInputNumbers === correctGroupNumber) {
            // Correct full sequence
            handleCorrectSequence();
        } else if (currentInputNumbers !== correctGroupNumber.substring(0, currentInputNumbers.length)) {
            // Error at current digit
            handleError();
        }
    }
    
    // Handle correct sequence
    function handleCorrectSequence() {
        messageTitle.textContent = successWindowTitle;
        messageContent.textContent = successWindowContent;
        
        if (spacedRepetitionMode) {
            // In spaced repetition mode, show progress
            const chunk = spacedRepetitionDeck.find(c => c.chunkIndex === currentGroupIndex);
            if (chunk) {
                messageContent.textContent = `Great job! This chunk will move to box ${Math.min(chunk.box + 1, 5)}.`;
            }
        } else if (sequenceMode) {
            // In sequence mode, always advance to next chunk
            messageContent.textContent = 'Moving to next sequence chunk...';
        } else if (currentRepeat < repeatCount - 1) {
            // More repeats to go
            currentRepeat++;
            messageContent.textContent = `Repeat ${currentRepeat + 1} of ${repeatCount}...`;
        } else if (currentGroupIndex === highestGroupIndex) {
            // At highest reached group
            messageContent.textContent = successRestartGroupsContent;
        }
        
        messageWindow.style.display = 'block';
    }
    
    // Handle error
    function handleError() {
        messageTitle.textContent = errorWindowTitle;
        messageContent.textContent = errorWindowContent();
        
        if (spacedRepetitionMode) {
            messageContent.textContent += "\n\nThis chunk will move back to box 1 for more practice.";
        }
        
        messageWindow.style.display = 'block';
        
        // Highlight the error
        const errorIndex = findFirstErrorIndex();
        if (errorIndex !== -1) {
            const errorHighlight = document.createElement('span');
            errorHighlight.classList.add('error');
            errorHighlight.textContent = currentInputNumbers[errorIndex];
            
            const beforeError = currentInputNumbers.substring(0, errorIndex);
            const afterError = currentInputNumbers.substring(errorIndex + 1);
            
            // Apply highlighting to the input field (simplified approach)
            // In a more advanced implementation, you might use a custom display area
            numbersInput.style.color = 'red';
        }
    }
    
    // Find the index of the first error in the input
    function findFirstErrorIndex() {
        for (let i = 0; i < currentInputNumbers.length; i++) {
            if (currentInputNumbers[i] !== correctGroupNumber[i]) {
                return i;
            }
        }
        return -1;
    }
    
    // Message OK button handler
    function handleMessageOk() {
        if (currentInputNumbers === correctGroupNumber) {
            if (spacedRepetitionMode) {
                // Update the spaced repetition deck with success
                updateSpacedRepetitionDeck(true);
                // Load the next chunk due for review
                loadNextSpacedRepetitionChunk();
            } else if (sequenceMode) {
                // In sequence mode, always move to next chunk
                currentGroupIndex++;
                correctGroupNumber = piDigits.substring(currentGroupIndex * chunkSize, (currentGroupIndex + 1) * chunkSize);
                
                // Update highest group if needed
                if (currentGroupIndex > highestGroupIndex) {
                    highestGroupIndex = currentGroupIndex;
                    highestChunkSpan.textContent = highestGroupIndex;
                    saveToLocalStorage();
                }
            } else if (currentRepeat < repeatCount - 1) {
                // More repeats to go
                currentRepeat++;
            } else if (currentGroupIndex === highestGroupIndex) {
                // At highest reached group, increment and reset
                highestGroupIndex++;
                currentGroupIndex = 0;
                correctGroupNumber = piDigits.substring(0, chunkSize);
                highestChunkSpan.textContent = highestGroupIndex;
                saveToLocalStorage();
                currentRepeat = 0;
            } else {
                // Move to next group
                currentGroupIndex++;
                correctGroupNumber = piDigits.substring(currentGroupIndex * chunkSize, (currentGroupIndex + 1) * chunkSize);
                currentRepeat = 0;
            }
        } else if (spacedRepetitionMode) {
            // Failed in spaced repetition mode
            updateSpacedRepetitionDeck(false);
            // Try the same chunk again
        }
        
        messageWindow.style.display = 'none';
        clearInputNumbers();
        numbersInput.style.color = 'black';
    }
    
    // Show/hide correct number
    function toggleCorrectNumber() {
        if (correctNumbersSpan.style.visibility === 'hidden') {
            correctNumbersSpan.textContent = correctGroupNumber;
            correctNumbersSpan.style.visibility = 'visible';
        } else {
            correctNumbersSpan.style.visibility = 'hidden';
        }
    }
    
    // Clear input numbers
    function clearInputNumbers() {
        currentInputNumbers = '';
        numbersInput.value = '';
    }
    
    // Toggle sequence mode
    function toggleSequenceMode() {
        sequenceMode = !sequenceMode;
        sequenceModeButton.textContent = sequenceMode ? 'Exit Sequence Mode' : 'Sequence Mode';
        
        if (sequenceMode) {
            // Reset the current group index to start a sequence
            currentGroupIndex = 0;
            correctGroupNumber = piDigits.substring(0, chunkSize);
            clearInputNumbers();
        }
    }
    
    // Update repeat count
    function updateRepeatCount() {
        repeatCount = parseInt(repeatCountInput.value, 10) || 1;
        if (repeatCount < 1) repeatCount = 1;
        if (repeatCount > 10) repeatCount = 10;
        repeatCountInput.value = repeatCount;
        currentRepeat = 0;
        saveToLocalStorage();
    }
    
    // Spaced Repetition Functions
    
    // Toggle spaced repetition mode
    function toggleSpacedRepetitionMode() {
        spacedRepetitionMode = !spacedRepetitionMode;
        sequenceMode = false; // Disable sequence mode when using spaced repetition
        
        if (spacedRepetitionMode) {
            spacedRepetitionModeButton.textContent = 'Exit Spaced Repetition';
            sequenceModeButton.disabled = true;
            
            // If deck is empty, initialize with current progress
            if (spacedRepetitionDeck.length === 0) {
                initializeSpacedRepetitionDeck();
            }
            
            // Get the next chunk to practice
            loadNextSpacedRepetitionChunk();
        } else {
            spacedRepetitionModeButton.textContent = 'Spaced Repetition';
            sequenceModeButton.disabled = false;
            
            // Return to normal mode
            currentGroupIndex = 0;
            correctGroupNumber = piDigits.substring(0, chunkSize);
        }
        
        clearInputNumbers();
    }
    
    // Initialize the spaced repetition deck with chunks the user already knows
    function initializeSpacedRepetitionDeck() {
        // Clear any existing deck
        spacedRepetitionDeck = [];
        
        // Add all chunks up to the highest known chunk
        for (let i = 0; i <= highestGroupIndex; i++) {
            spacedRepetitionDeck.push({
                chunkIndex: i,
                box: 1, // Start in box 1 (most frequent)
                nextReview: Date.now(), // Review immediately
                content: piDigits.substring(i * chunkSize, (i + 1) * chunkSize)
            });
        }
        
        saveToLocalStorage();
    }
    
    // Load the next chunk due for review in spaced repetition
    function loadNextSpacedRepetitionChunk() {
        const now = Date.now();
        
        // Find chunks due for review
        const dueChunks = spacedRepetitionDeck.filter(chunk => chunk.nextReview <= now);
        
        if (dueChunks.length > 0) {
            // Sort by box (prioritize lower boxes) and then by nextReview date
            dueChunks.sort((a, b) => {
                if (a.box === b.box) {
                    return a.nextReview - b.nextReview;
                }
                return a.box - b.box;
            });
            
            // Take the first chunk
            const nextChunk = dueChunks[0];
            currentGroupIndex = nextChunk.chunkIndex;
            correctGroupNumber = nextChunk.content;
            
            // If there's a previous chunk in the sequence, prepend it to the current chunk
            // This implements the idea of showing both what they already know and what they're learning
            if (currentGroupIndex > 0) {
                const prevChunk = spacedRepetitionDeck.find(chunk => chunk.chunkIndex === currentGroupIndex - 1);
                if (prevChunk && prevChunk.box > 1) { // Only include if they've shown some mastery of it
                    correctGroupNumber = prevChunk.content + correctGroupNumber;
                }
            }
        } else {
            // No chunks due for review, add a new chunk if available
            if (highestGroupIndex + 1 < Math.floor(piDigits.length / chunkSize)) {
                // Add a new chunk
                const newChunkIndex = highestGroupIndex + 1;
                const newChunk = {
                    chunkIndex: newChunkIndex,
                    box: 1,
                    nextReview: now,
                    content: piDigits.substring(newChunkIndex * chunkSize, (newChunkIndex + 1) * chunkSize)
                };
                
                spacedRepetitionDeck.push(newChunk);
                highestGroupIndex = newChunkIndex;
                highestChunkSpan.textContent = highestGroupIndex;
                
                currentGroupIndex = newChunkIndex;
                correctGroupNumber = newChunk.content;
                
                // If there's a previous chunk, prepend it
                if (currentGroupIndex > 0) {
                    const prevChunk = spacedRepetitionDeck.find(chunk => chunk.chunkIndex === currentGroupIndex - 1);
                    if (prevChunk) {
                        correctGroupNumber = prevChunk.content + correctGroupNumber;
                    }
                }
                
                saveToLocalStorage();
            } else {
                // All chunks are learned and not due for review yet
                messageTitle.textContent = trainingCompletedTitle;
                messageContent.textContent = 'All chunks are learned and not due for review yet. Try again later.';
                messageWindow.style.display = 'block';
            }
        }
    }
    
    // Update the spaced repetition deck based on user performance
    function updateSpacedRepetitionDeck(success) {
        if (!spacedRepetitionMode) return;
        
        // Find the current chunk in the deck
        const chunkIndex = spacedRepetitionDeck.findIndex(chunk => chunk.chunkIndex === currentGroupIndex);
        
        if (chunkIndex === -1) return; // Chunk not found
        
        const chunk = spacedRepetitionDeck[chunkIndex];
        
        if (success) {
            // Successful recall - move to next box
            if (chunk.box < 5) {
                chunk.box++;
            }
        } else {
            // Failed recall - back to box 1
            chunk.box = 1;
        }
        
        // Set the next review time based on the box
        const now = Date.now();
        switch (chunk.box) {
            case 1: // Immediate
                chunk.nextReview = now;
                break;
            case 2: // 1 day
                chunk.nextReview = now + 86400000;
                break;
            case 3: // 3 days
                chunk.nextReview = now + 259200000;
                break;
            case 4: // 7 days
                chunk.nextReview = now + 604800000;
                break;
            case 5: // 14 days
                chunk.nextReview = now + 1209600000;
                break;
        }
        
        saveToLocalStorage();
    }
    
    // Event Listeners
    startButton.addEventListener('click', startGame);
    
    numberButtons.forEach(button => {
        button.addEventListener('click', () => {
            handleNumberButtonClick(button.dataset.value);
        });
    });
    
    showCorrectButton.addEventListener('click', toggleCorrectNumber);
    messageOkButton.addEventListener('click', handleMessageOk);
    sequenceModeButton.addEventListener('click', toggleSequenceMode);
    repeatCountInput.addEventListener('change', updateRepeatCount);
    spacedRepetitionModeButton && spacedRepetitionModeButton.addEventListener('click', toggleSpacedRepetitionMode);
    
    // Initialize the app
    initFromLocalStorage();
});