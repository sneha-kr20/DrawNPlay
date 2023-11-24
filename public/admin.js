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
  // let link = 'http://localhost:3000/game/' + randomLink;
  let link = 'https://drawnplay.onrender.com/game/' + randomLink;
  return link;
}

// Add a click event listener to the button
generateLinkButton.addEventListener('click', function () {
  const randomInviteLink = generateRandomLink();
  inviteLinkElement.textContent = randomInviteLink;

  // Emit a Socket.IO event to notify all connected clients about the new game session
  socket.emit('new-game-session', { inviteLink: randomInviteLink });
});

// Initial text for the invite link
inviteLinkElement.textContent = 'Your Invite Link Will Appear Here';

let startGameButton = document.getElementById('start-game-button');
startGameButton.addEventListener('click', async function () {
  const inviteLink = inviteLinkElement.textContent;
  const gameType = document.getElementById('game-type').value;

  // Check if the invite link is generated
  if (inviteLink === 'Your Invite Link Will Appear Here') {
    alert('Please generate an invite link first!');
  } else {
    try {
      const parts = inviteLink.split('/');
      const id = parts[parts.length - 1];

      const response = await fetch('/game/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          gameID: id,
          gameType
        })
      });
      
      if (response.ok) {
        // If the response is successful, handle accordingly (e.g., redirect to game)
        window.location.href = `/game/${id}`;
        // window.location.href = `/game`;
      } else {
        // Handle errors or server-side issues
        alert('Please login first!');
      }
    } catch (error) {
      console.error(error);
    }
  }
});

async function searchUsers() {
  try {
    const searchInput = document.getElementById('search-input');
    const searchTerm = searchInput.value;

    const response = await fetch(`/search?term=${searchTerm}`);
    const data = await response.json();

    const onlinePlayersDiv = document.getElementById('online-players');
    onlinePlayersDiv.innerHTML = '';

    const onlinePlayers = data.users;

    if (onlinePlayers.length === 0) {
      const noUsersMessage = document.createElement('div');
      noUsersMessage.textContent = 'No users found.';
      onlinePlayersDiv.appendChild(noUsersMessage);
      onlinePlayersDiv.style.display = 'block';
    } else {
      onlinePlayers.forEach(player => {
        const playerDiv = document.createElement('div');
        playerDiv.textContent = player.username;
        onlinePlayersDiv.appendChild(playerDiv);
        onlinePlayersDiv.style.display = 'block';
      });
    }
  } catch (error) {
    console.error('Error searching users:', error);
  }
}

  // Call the searchUsers function when the search button is clicked
  document.addEventListener('DOMContentLoaded', () => {
    const searchButton = document.getElementById('search-button');
    searchButton.addEventListener('click', searchUsers);
  });

