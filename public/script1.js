const canvas = document.querySelector("canvas");
const toolBtns = document.querySelectorAll(".tool");
const fillColor = document.querySelector("#fill-color");
const sizeSlider = document.querySelector("#size-slider");
const colorBtns = document.querySelectorAll(".colors .option");
const colorPicker = document.querySelector("#color-picker");
const clearCanvas = document.querySelector(".clear-canvas");
const saveImg = document.querySelector(".save-img");
const ctx = canvas.getContext("2d");

let prevMouseX, prevMouseY, snapshot;
let isDrawing = false;
let selectedTool = "brush";
let brushWidth = 5;
let selectedColor = "#000";

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
    ctx.strokeRect(e.offsetX, e.offsetY, prevMouseX - e.offsetX, prevMouseY - e.offsetY);
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

document.addEventListener("DOMContentLoaded", () => {
  const toggleButton = document.querySelector(".toggle-button");
  const toolBoard = document.querySelector(".tools-board");

  toggleButton.addEventListener("click", () => {
    toolBoard.style.display = toolBoard.style.display === "none" ? "block" : "none";
  });
});

document.addEventListener("DOMContentLoaded", () => {
  // const socket = io('https://drawnplay.onrender.com');
  const socket = io('http://localhost:3000/');
  const form = document.getElementById('send-container');
  const messageInput = document.getElementById('message-input');
  const messageContainer = document.querySelector(".chat-messages");
  let hasJoined = false;
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

  const gameID = window.location.pathname.split('/').pop();
  
  async function getUsername() {
    try {
      const response = await fetch('/get-username');
      const data = await response.json();

      if (data.username && !hasJoined) {
        const username = data.username;
        socket.emit('new-user-joined', { name: username, gameID: gameID });
        hasJoined = true;
      }
    } catch (error) {
      console.error('Error fetching username:', error);
    }
  }

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
    if (!playerList.some(player => player.username === name)) {
      playerList.push({ name, points: 10, rank: playerList.length + 1 });
      updatePlayerTable(playerList);
      appendNotification(`${name} joined the chat`, 'center');
    }
  });

  socket.on('update-players', players => {
    playerList = players;
    updatePlayerTable(playerList);
  });

  socket.on('left', ({ name, gameID }) => {
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
          socket.emit('send', { message, gameID: gameID, name: name });
          messageInput.value = '';
        } else {
          const message = messageInput.value;
          appendMessage(`You: ${message}`, 'right');
          let name = "xys";
          socket.emit('send', { message, gameID: gameID, name: name });
          messageInput.value = '';
        }
      } catch (error) {
        console.error('Error fetching username:', error);
      }
    }

    getUsername();
  });

  const canvas = document.querySelector("canvas");
  const ctx = canvas.getContext("2d");
  ctx.willReadFrequently = true;
  let isDrawing = false;
  let drawingData = [];

  canvas.addEventListener("mousedown", (e) => {
    if (!drawingPermission) return;
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

  canvas.addEventListener("mouseup", () => {
    if (!drawingPermission) return;
    isDrawing = false;
    drawingData.push({
      type: "end"
    });
    socket.emit("drawing", { drawingData, gameID });
    drawingData = [];
  });

  function draw() {
    ctx.beginPath();
    ctx.moveTo(drawingData[0].x, drawingData[0].y);

    for (let i = 1; i < drawingData.length; i++) {
      if (drawingData[i].type === "draw") {
        ctx.lineTo(drawingData[i].x, drawingData[i].y);
        ctx.stroke();
      } else if (drawingData[i].type === "start") {
        ctx.moveTo(drawingData[i].x, drawingData[i].y);
      } else if (drawingData[i].type === "end") {
        ctx.closePath();
      }
    }
  }

  socket.on("drawing", (data) => {
    drawingData = data;
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
});
