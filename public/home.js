// 1v1 Drawing and Guessing Game Instructions
const instructions1v1 = [
    "- Decide who will be part of your DrawNPlay.",
    "- Share the game link with your friends whom you want to play with.",
    "- Game Setup:",
    "1) Choose your game pool, i.e. Public or Private game room.",
    "2) Generate a game link and share it with whosoever you want!",
    "3) Story your art: Choose a word and create a story through drawings and captions.",
    "4) Guess the drawing: Guess the word behind each others drawings.",
    "5) Feel free to save any drawing you like.",
    "- Drawing Tools: Familiarize yourself with the drawing tools available. These include brush, colors, shapes and an eraser.",
    "- Interaction: Use the chat to communicate with other participants. Share thoughts about drawings, make guesses, or simply chat while playing.",
    "- Enjoy the Experience: Most importantly, have fun! Whether you're playing with friends, family, or colleagues, your personalized DrawNPlay Game is designed for enjoyment and creativity.",
];

// Multiplayer Drawing Game Instructions
const instructionsMultiplayer = [
    "- No friend online? Don't worry DrawNPlay got you.",
    "- Join a random party and showcase your art and guesing skills.",
    "- Game Setup:",
    "1) Choose one of the many games currently live.",
    "2) Draw and guess based on prompts.",
    "3) Story your art: Create a story through drawings and captions.",
    "4) Guess the drawing: Participants guess the meaning behind each others drawings.",
    "5) Feel free to save any drawing you like.",
    "- Drawing Tools: Familiarize yourself with the drawing tools available. These may include various brushes, colors, and an eraser. Get creative!",
    "- Interaction: Use the chat or comment features to communicate with other participants. Share thoughts about drawings, make guesses, or simply chat while playing.",
    "- Enjoy the Experience: Most importantly, have fun! Whether you're playing with friends, family, or colleagues, your personalized Scribble Game is designed for enjoyment and creativity.",
    "- Maintain decency and avoid the use of foul language or hate symbols.",
];


// Function to open modal with dynamic content
document.querySelectorAll('.learn-button').forEach((learnButton) => {
    learnButton.addEventListener('click', function (event) {
        const modal = document.getElementById('instructionsModal');
        const modalContent = document.getElementById('modal-content');
        const instructionsList = document.getElementById('instructionsList');

        if (event.target.id === 'learn1v1') {
            modalContent.querySelector('h2').textContent = "1vs1 Game Instructions";
            instructionsList.innerHTML = ""; // Clear previous instructions
            instructions1v1.forEach(instruction => {
                const li = document.createElement('li');
                li.textContent = instruction;
                instructionsList.appendChild(li);
            });
        } else if (event.target.id === 'learnMultiplayer') {
            modalContent.querySelector('h2').textContent = "Multiplayer Game Instructions";
            instructionsList.innerHTML = ""; // Clear previous instructions
            instructionsMultiplayer.forEach(instruction => {
                const li = document.createElement('li');
                li.textContent = instruction;
                instructionsList.appendChild(li);
            });
        }

        modal.style.display = "block";
    });
});

// Function to close modal
document.getElementById('closeModal').addEventListener('click', function () {
    document.getElementById('instructionsModal').style.display = "none";
});
