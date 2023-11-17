// 1v1 Drawing and Guessing Game Instructions
const instructions1v1 = [
    "1. Welcome to the 1v1 Drawing and Guessing Game!",
    "2. Admin Privileges: As the game creator (admin), design both public and private games.",
    "3. Public vs. Private: Public games are open to anyone; private games require a specific link.",
    "4. Your Turn to Draw: Illustrate the given word or phrase as the drawer.",
    "5. Switch Roles: Alternate roles with your opponent after each round.",
    "6. Communication is Key: Use the in-game chat to communicate.",
    "7. Strive for Excellence: Showcase your artistic skills for victory!",
    "8. Enjoy the Challenge: Embrace the drawing and guessing experience.",
    "9. Chat Interaction: Engage in friendly banter during the game.",
    "10. Have Fun: Enjoy the 1v1 drawing game experience!",
];

// Multiplayer Drawing Game Instructions
const instructionsMultiplayer = [
    "1. Welcome to the Multiplayer Drawing Game!",
    "2. Game Selection: Browse ongoing public games on the platform.",
    "3. Join Existing Games: Choose a game and join the drawing excitement.",
    "4. Interact with Players: Engage with participants through the in-game chat.",
    "5. Make New Friends: Connect with players and share your love for drawing.",
    "6. Collaborative Drawing: Experience the joy of collaborative drawing.",
    "7. Express Creativity: Unleash your creativity on the digital canvas.",
    "8. Unique Challenges: Encounter drawing challenges set by game hosts.",
    "9. Global Participation: Join games with participants worldwide.",
    "10. Enjoy the Experience: Immerse yourself, have fun, and create lasting memories.",
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
