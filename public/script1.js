const canvas = document.querySelector("canvas"),
  toolBtns = document.querySelectorAll(".tool"),
  fillColor = document.querySelector("#fill-color"),
  sizeSlider = document.querySelector("#size-slider"),
  colorBtns = document.querySelectorAll(".colors .option"),
  colorPicker = document.querySelector("#color-picker"),
  clearCanvas = document.querySelector(".clear-canvas"),
  saveImg = document.querySelector(".save-img"),
  ctx = canvas.getContext("2d");

  let prevMouseX, prevMouseY, snapshot,
  isDrawing = false,
  selectedTool = "brush",
  brushWidth = 5,
  selectedColor = "#000";

const setCanvasBackground = () => {
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = selectedColor;
};

window.addEventListener("load", () => {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  setCanvasBackground();
});

const drawRect = (e) => {
  if (!fillColor.checked) {
    return ctx.strokeRect(e.offsetX, e.offsetY, prevMouseX - e.offsetX, prevMouseY - e.offsetY);
  }
  ctx.fillRect(e.offsetX, e.offsetY, prevMouseX - e.offsetX, prevMouseY - e.offsetY);
};

const drawCircle = (e) => {
  ctx.beginPath();
  let radius = Math.sqrt(Math.pow((prevMouseX - e.offsetX), 2) + Math.pow((prevMouseY - e.offsetY), 2));
  ctx.arc(prevMouseX, prevMouseY, radius, 0, 2 * Math.PI);
  fillColor.checked ? ctx.fill() : ctx.stroke();
};

const drawTriangle = (e) => {
  ctx.beginPath();
  ctx.moveTo(prevMouseX, prevMouseY);
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.lineTo(prevMouseX * 2 - e.offsetX, e.offsetY);
  ctx.closePath();
  fillColor.checked ? ctx.fill() : ctx.stroke();
};

const startDraw = (e) => {
  isDrawing = true;
  prevMouseX = e.offsetX;
  prevMouseY = e.offsetY;
  ctx.beginPath();
  ctx.lineWidth = brushWidth;
  ctx.strokeStyle = selectedColor;
  ctx.fillStyle = selectedColor;
  snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
};

const drawing = (e) => {
  if (!isDrawing) return;
  ctx.putImageData(snapshot, 0, 0);

  if (selectedTool === "brush" || selectedTool === "eraser") {
    ctx.strokeStyle = selectedTool === "eraser" ? "#fff" : selectedColor;
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
  } else if (selectedTool === "rectangle") {
    drawRect(e);
  } else if (selectedTool === "circle") {
    drawCircle(e);
  } else {
    drawTriangle(e);
  }
};

toolBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelector(".options .active").classList.remove("active");
    btn.classList.add("active");
    selectedTool = btn.id;
  });
});

sizeSlider.addEventListener("change", () => brushWidth = sizeSlider.value);

colorBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelector(".options .selected").classList.remove("selected");
    btn.classList.add("selected");
    selectedColor = window.getComputedStyle(btn).getPropertyValue("background-color");
  });
});

colorPicker.addEventListener("change", () => {
  colorPicker.parentElement.style.background = colorPicker.value;
  colorPicker.parentElement.click();
});

clearCanvas.addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  setCanvasBackground();
});

saveImg.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = `${Date.now()}.jpg`;
  link.href = canvas.toDataURL();
  link.click();
});


canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mousemove", drawing);
canvas.addEventListener("mouseup", () => isDrawing = false);

document.addEventListener("DOMContentLoaded", function () {
    const toggleButton = document.querySelector(".toggle-button");
    const toolBoard = document.querySelector(".tools-board");

    toggleButton.addEventListener("click", function () {
        if (toolBoard.style.display === "none") {
            toolBoard.style.display = "block";
        } else {
            toolBoard.style.display = "none";
        }
    });
});


document.addEventListener("DOMContentLoaded", function () {
//   const socket = io('http://localhost:3000');
  const socket = io('https://drawnplay.onrender.com');
  const form = document.getElementById('send-container');
  const messageInput = document.getElementById('message-input');
  const messageContainer = document.querySelector(".chat-messages");
  let hasJoined = false; // Flag to check if the user has already joined
  let drawingPermission = false;

  const appendMessage = (message, position) => {
      const messageElement = document.createElement('div');
      messageElement.innerText = message;
      messageElement.classList.add('message');
      messageElement.classList.add(position);
      messageContainer.append(messageElement);
  }

  const appendNotification = (message, position) => {
      const notificationElement = document.createElement('div');
      notificationElement.innerText = message;
      notificationElement.classList.add('message');
      notificationElement.classList.add(position);
      messageContainer.append(notificationElement);
  }

  // Assuming you have a function to fetch data from an API
  const gameID = window.location.pathname.split('/').pop();
  async function getUsername() {
      try {
          const response = await fetch('/get-username');
          const data = await response.json();

          if (data.username && !hasJoined) {
              const username = data.username;
              socket.emit('new-user-joined', { name: username, gameID: gameID });
              hasJoined = true; // Set the flag to true after joining
          }
      } catch (error) {
          console.error('Error fetching username:', error);
      }
  }

  // Call this function when you need to get the username
  getUsername();


  socket.on('start-drawing', async ({ wordToDraw }) => {
    document.getElementById('drawer-name-value').textContent = wordToDraw;
    socket.emit('pause-timer', { gameID });
    const response = await fetch('/get-username');
    const data = await response.json();
    const username = data.username;
  
    if (username === wordToDraw) {
      const word = await new Promise((resolve) => {
        resolve(prompt('Enter the word to draw:'));
      });
      socket.emit('word-submitted', { word, gameID });
      drawingPermission = true;
      setTimeout(() => {
        socket.emit('resume-timer', { gameID });
      }, 0);
    } else {
      drawingPermission = false;
    }
  });
  

  socket.on('user-joined', ({ name, gameID }) => {
      if (!hasJoined) {
          // Display the "joined" message only if the user is joining for the first time
          appendNotification(`${name} joined the chat`, 'center');
          hasJoined = true;
      }
  });

    socket.on('receive', ({ message, name }) => {
      if (name === getUsername()) {
          appendNotification(`You: ${message}`, 'center');
      }else {
          appendMessage(`${name}: ${message}`, 'left');
      }
  });
  
  // Function to update player table on the client side
  const updatePlayerTable = (players) => {
    const playerListBody = document.getElementById('playerListBody');

    // Clear existing rows
    playerListBody.innerHTML = '';

    // Update the table with the current player list
    players.forEach(player => {
        const row = playerListBody.insertRow();
        const nameCell = row.insertCell(0);
        const pointsCell = row.insertCell(1);
        const rankCell = row.insertCell(2);

        nameCell.textContent = player.username;
        pointsCell.textContent = player.points;
        rankCell.textContent = player.rank;
    });
  };

  socket.on('user-joined', ({ name, gameID }) => {
    if (!playerList.some(player => player.username === name)) {
        // Add the new player to the player list with default values
        playerList.push({ name, points: 10, rank: playerList.length + 1 });
        updatePlayerTable(playerList);
        appendNotification(`${name} joined the chat`, 'center');
    }
  });

  socket.on('update-players', players => {
    // Update the player list and table when player information changes
    playerList = players;
    updatePlayerTable(playerList);
  });

    socket.on('left', ({ name, gameID }) => {
        // appendNotification(`${name} left the chat`, 'center');
        updatePlayerTable(players);
    });
    form.addEventListener('submit', (e) => {
        e.preventDefault();
           

        async function getUsername() {
          try {
              const response = await fetch('/get-username');
              const data = await response.json();
    
              if (data.username) {
                  const name = data.username;
                  const message = messageInput.value;
                  appendMessage(`You: ${message}`, 'right');
                  socket.emit('send', { message, gameID: gameID,name:name });
                  messageInput.value = '';
              } else {
                const message = messageInput.value;
                appendMessage(`You: ${message}`, 'right');
                let name="xys";
                socket.emit('send', { message, gameID: gameID,name:name });
                messageInput.value = '';
              }
          } catch (error) {
              console.error('Error fetching username:', error);
          }
        }   
        getUsername();// Call this function when you need to get the username
      });
      
      
      const canvas = document.querySelector("canvas");
      const ctx = canvas.getContext("2d");
      ctx.willReadFrequently = true;
      let isDrawing = false;
      let drawingData = [];
      
      canvas.addEventListener("mousedown", (e) => {
        if (!drawingPermission) return;
        // snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
          isDrawing = true;
          const { offsetX, offsetY } = e;
          drawingData.push({
            type: "start",
            x: offsetX,
            y: offsetY
          });
      });
      
      canvas.addEventListener("mousemove", (e) => {
        if (!isDrawing || !drawingPermission) return;
          if (!isDrawing) return;
          
          const { offsetX, offsetY } = e;
          drawingData.push({
              type: "draw",
              x: offsetX,
              y: offsetY
          });
          draw();
      });

      canvas.addEventListener("mouseup", (e) => {
        if (!drawingPermission) return;
          isDrawing = false;
          const { offsetX, offsetY } = e;
          // ctx.putImageData(snapshot, 0, 0);
          drawingData.push({
              type: "end",
              color: selectedColor,
              size: brushWidth,
              shape: selectedTool,
              x: offsetX,
              y: offsetY,
              ischecked: fillColor.checked
          });
          socket.emit("drawing", {drawingData,gameID});
          drawingData = [];// Reset the drawing data
      });
      
      function draw() {
        const current = drawingData[drawingData.length - 1];
      
        if (current.shape === "brush" || current.shape === "eraser" || selectedTool === "brush" || selectedTool === "eraser") {
          ctx.strokeStyle = current.shape === "eraser" || selectedTool === "eraser" ? "#fff" : current.color || selectedColor;
          ctx.lineWidth = current.size || brushWidth;
      
          for (let i = 1; i < drawingData.length; i++) {
            const { type, x, y } = drawingData[i];
      
            if (type === "draw") {
              const prevPoint = drawingData[i - 1];
      
              if (prevPoint && prevPoint.type === "draw") {
                ctx.beginPath();
                ctx.moveTo(prevPoint.x, prevPoint.y);
                ctx.lineTo(x, y);
                ctx.stroke();
                ctx.closePath();
              }
            } else if (type === "start") {
              ctx.beginPath();
              ctx.moveTo(x, y);
            } else if (type === "end") {
              // Optionally close the path for the brush stroke
              // ctx.closePath();
            }
          }
        } else if (current.shape === "rectangle") {
          // Draw a rectangle based on the start and end points
          const startX = drawingData[0].x;
          const startY = drawingData[0].y;
          const width = current.x - startX;
          const height = current.y - startY;
          fillColor.checked ? ctx.fillRect(startX, startY, width, height) : ctx.strokeRect(startX, startY, width, height);
        } else if (current.shape === "circle") {
          // Draw a circle based on the start and end points
          const startX = drawingData[0].x;
          const startY = drawingData[0].y;
          const radius = Math.sqrt(Math.pow((current.x - startX), 2) + Math.pow((current.y - startY), 2));
          ctx.beginPath();
          ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
          fillColor.checked ? ctx.fill() : ctx.stroke();
          ctx.closePath();
        } else if (current.shape === "triangle") {
          // Draw a triangle based on the start and end points
          const startX = drawingData[0].x;
          const startY = drawingData[0].y;
          const endX = current.x;
          const endY = current.y;
          const midX = startX + (endX - startX) / 2;
          ctx.moveTo(midX, startY);
          ctx.lineTo(startX, endY);
          ctx.lineTo(endX, endY);
          ctx.closePath();
          fillColor.checked ? ctx.fill() : ctx.stroke();
        }
      
        ctx.closePath();
      }
      
      

      // Event listener for receiving drawing data from other users
      socket.on("drawing", (data) => {
        drawingData = data;

        // Get the last item from the drawing data
        const lastItem = drawingData[drawingData.length - 1];

        // Update selected color, tool, and size
        selectedColor = lastItem.color;
        brushWidth = lastItem.size;
        selectedTool = lastItem.shape;
        fillColor.checked=lastItem.ischecked

        console.log(lastItem);
        // drawing(lastItem.event);
        draw();
      });


      const getInitialGameData = async () => {
        try {
          const response = await fetch(`/api/getInitialGameData?gameID=${gameID}`);
          const data = await response.json();
    
          if (data.players) {
            playerList = data.players;
            updatePlayerTable(playerList);
          }
        } catch (error) {
          console.error('Error fetching initial game data:', error);
        }
      };
        getInitialGameData();

      socket.on('update-timer', (timerValue) => {
          document.getElementById('timer-value').textContent = timerValue;
      });

      socket.on('start-drawing', ({ wordToDraw }) => {
        console.log(`Start drawing! Word to draw: ${wordToDraw}`);
      });

      socket.on('start-guessing', ({ wordToGuess }) => {
        console.log(`Start guessing! Word to guess: ${wordToGuess}`);
      });
      socket.on('end-drawing', () => {
          console.log('End drawing!');
        });
        socket.on('end-guessing', () => {
            console.log('End guessing!');
        });
        
        // Add touch event listeners
        canvas.addEventListener("touchstart", handleTouchStart);
        canvas.addEventListener("touchmove", handleTouchMove);
        canvas.addEventListener("touchend", handleTouchEnd);
        
        function handleTouchStart(event) {
          if (!drawingPermission) return;
          const touch = event.touches[0];
          isDrawing = true;
          const { offsetX, offsetY } = getTouchOffset(touch);
          drawingData.push({
            type: "start",
            x: offsetX,
            y: offsetY
          });
        }
        
        function handleTouchMove(event) {
          if (!isDrawing || !drawingPermission) return;
          const touch = event.touches[0];
          const { offsetX, offsetY } = getTouchOffset(touch);
          drawingData.push({
            type: "draw",
            x: offsetX,
            y: offsetY
          });
          console.log(drawingData);
          draw();
        }
        
        function handleTouchEnd(event) {
            
          if (!drawingPermission) return;
          isDrawing = false;
          const touch = event.changedTouches[0];
          const { offsetX, offsetY } = getTouchOffset(touch);
          drawingData.push({
            type: "end",
            color: selectedColor,
            size: brushWidth,
            shape: selectedTool,
            x: offsetX,
            y: offsetY,
            ischecked: fillColor.checked
          });
          socket.emit("drawing", { drawingData, gameID });
          drawingData = []; // Reset the drawing data
        }
        
        function getTouchOffset(touch) {
          const rect = canvas.getBoundingClientRect();
          return {
            offsetX: touch.clientX - rect.left,
            offsetY: touch.clientY - rect.top
          };
        }

});




