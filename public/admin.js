// Get the "Generate Invite Link" button and the element to display the link
const generateLinkButton = document.getElementById('generate-link');
const inviteLinkElement = document.getElementById('invite-link');

// Define characters to use in the random link
const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

// Define the length of the random link
const linkLength = 10;

// Function to generate a random link
function generateRandomLink() {
  let randomLink = '';
  for (let i = 0; i < linkLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomLink += characters.charAt(randomIndex);
  }
  let link='https://static-game.onrender.com/'+randomLink;
  return link;
}

// Add a click event listener to the button
generateLinkButton.addEventListener('click', function () {
  const randomInviteLink = generateRandomLink();
  inviteLinkElement.textContent = randomInviteLink;
});

// Initial text for the invite link
inviteLinkElement.textContent = 'Your Invite Link Will Appear Here';

let start=document.getElementById('start-game-button');
start.addEventListener("click", function () {
    window.location.href = "game.html";
  });

