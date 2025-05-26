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
            repeatCount
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
        
        if (sequenceMode) {
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
            if (sequenceMode) {
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
    
    // Initialize the app
    initFromLocalStorage();
});