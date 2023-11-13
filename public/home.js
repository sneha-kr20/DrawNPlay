// Define instructions for 1v1 and multiplayer
const instructions1v1 = [
    "Instruction 1 for 1v1",
    "Instruction 2 for 1v1",
    "Instruction 3 for 1v1",
    "Instruction 4 for 1v1",
    "Instruction 5 for 1v1",
    "Instruction 6 for 1v1",
];

const instructionsMultiplayer = [
    "Instruction 1 for multiplayer",
    "Instruction 2 for multiplayer",
    "Instruction 3 for multiplayer",
    "Instruction 4 for multiplayer",
    "Instruction 5 for multiplayer",
    "Instruction 6 for multiplayer",
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
