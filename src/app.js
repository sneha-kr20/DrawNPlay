// Required packages 
const express = require("express");
const path = require("path");

const app = express();
const http = require("http");
const hbs = require("hbs");
const server = http.createServer(app);
const io = require('socket.io')(server);
require("./db/conn");

const User = require("./models/usermessage");
const User1 = require("./models/userlogin");
const GameSession= require("./models/games");

// Creating port ID

const port = process.env.PORT || 3000;

const static_path = path.join(__dirname, "../public");
const templates_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");


// Starting a new session
const session = require("express-session");
app.use(
  session({
    secret: "your secret key",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(express.json());

app.use(express.static(path.join(__dirname, '../public')));

const cors = require('cors');
app.use(cors());




// console.log(path.join(__dirname," ../public"));

app.use(express.urlencoded({ extended: false }));
app.use(
  "/css",
  express.static(path.join(__dirname, "../node_modules/bootstrap/dist/css"))
);

app.use(function (req, res, next) {
  res.locals.loggedIn = req.session.loggedIn;
  res.locals.usern = req.session.usern;
  res.locals.emailn = req.session.emailn;
  next();
});

app.use(express.static(static_path));
app.use(express.json());
app.set("view engine", "hbs");
app.set("views", templates_path);
hbs.registerPartials(partials_path);

app.get("/", (req, res) => {
  res.render("index");
});
app.get("/index", (req, res) => {
    res.render("index");
  });
  app.get("/login", (req, res) => {
    res.render("login");
  });
  
app.get("/admin", async(req, res) => {
    try {
      const allUsers = await User1.find({}); // Fetch all users
  
      if (!allUsers || allUsers.length === 0) {
        return res.status(404).send("No users found");
      }
  
      // Sort users by points in descending order
      allUsers.sort((a, b) => b.points - a.points);
  
      res.render("admin", { users: allUsers });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal server error");
    }
  });
  app.get("/game", (req, res) => {
    res.render("game");
  });


  app.get("/admin", async(req, res) => {
    try {
      const allUsers = await User1.find({}); // Fetch all users
  
      if (!allUsers || allUsers.length === 0) {
        return res.status(404).send("No users found");
      }
  
      // Sort users by points in descending order
      allUsers.sort((a, b) => b.points - a.points);
  
      res.render("admin", { users: allUsers });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal server error");
    }
  });
  app.get("/game", (req, res) => {
    res.render("game");
  });

  app.get('/search', async (req, res) => {
    try {
      const searchTerm = req.query.term;
  
      if (!searchTerm) {
        return res.status(400).json({ error: 'Search term is required' });
      }
  
      // Use a case-insensitive regular expression to search for usernames containing the searchTerm
      const matchingUsers = await User1.find({ username: { $regex: new RegExp(searchTerm, 'i') } });

      // Sort matching users by points in descending order
      matchingUsers.sort((a, b) => b.points - a.points);
  
      res.json({ users: matchingUsers });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  app.get("/leaderboard", async (req, res) => {
    try {
      const allUsers = await User1.find({}); // Fetch all users
  
      if (!allUsers || allUsers.length === 0) {
        return res.status(404).send("No users found");
      }
  
      // Sort users by points in descending order
      allUsers.sort((a, b) => b.points - a.points);
  
      res.render("leaderboard", { users: allUsers });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal server error");
    }
  });
  
  
  app.get("/dashboard", async (req, res) => {
    try {
      const allUsers = await User1.find({}); // Fetch all users
      
    if (!allUsers || allUsers.length === 0) {
      return res.status(404).send("No users found");
    }

    // Sort users by points in descending order
    allUsers.sort((a, b) => b.points - a.points);

    const user = allUsers.find((u) => u.username === req.session.usern);

    if (!user) {
      return res.status(404).send("User not found");
    }

    const { username, points, gameHistory } = user;

    // Find the index of the user to determine the ranking
    const userIndex = allUsers.findIndex((u) => u.username === username);
    const userRanking = userIndex + 1;

    // Calculate the total games played by the user
    const totalGamesPlayed = gameHistory.length;

    // Get the last 10 games in the game history
    const last10Games = gameHistory.slice(-10).reverse(); // Assuming the most recent games are at the end

    res.render("dashboard", {
      username,
      userRanking,
      points,
      totalGamesPlayed,
      last10Games,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});


// The timer of the game session is set to 60 seconds
const DRAWING_PHASE_DURATION = 60; // Adjust as needed

const GAME_STATE = {
  LOBBY: 'lobby',
  DRAWING: 'drawing',
};

const isTimerPaused = {};
const users = {};
const gameStates = {};
const timerValues = {};
const timerIntervals = {};
const submittedWords={};

function updateTimerDisplay(gameID) {
  io.to(gameID).emit('update-timer', timerValues[gameID]);
}

function startTimer(gameID) {
  timerValues[gameID] = DRAWING_PHASE_DURATION;
  updateTimerDisplay(gameID);

  timerIntervals[gameID] = setInterval(() => {
    if (!isTimerPaused[gameID]) {
      // console.log(isTimerPaused[gameID]);
      // console.log(timerValues[gameID]);
      timerValues[gameID]--;

      if (timerValues[gameID] <= 0) {
        clearInterval(timerIntervals[gameID]);
        timerValues[gameID] = DRAWING_PHASE_DURATION;

        if (gameStates[gameID] === GAME_STATE.DRAWING) {
          io.to(gameID).emit('end-drawing');
          gameStates[gameID] = GAME_STATE.LOBBY;
          startNewRound(gameID);
        }
      }

      updateTimerDisplay(gameID);
    }
  }, 1000);
}


const startNewRound = async (gameID) => {
  const drawingUser = await selectDrawingUser(gameID);
  // console.log(drawingUser);

  if (drawingUser) {
    io.to(gameID).emit('start-drawing', { wordToDraw: drawingUser.username });
    startTimer(gameID);
  }

  gameStates[gameID] = GAME_STATE.DRAWING;

};

const selectDrawingUser = async (gameID) => {
  try {
    const game = await GameSession.findOne({ gameID });

    if (!game) {
      console.error(`Game not found with ID: ${gameID}`);
      return null;
    }

    const players = game.players;

    // Get a random index within the range of the total number of players
    const randomIndex = Math.floor(Math.random() * players.length);

    return players[randomIndex] || {username:"x"} ;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const updatePlayerInfo = async (socket, gameID) => {
  try {
    const game = await GameSession.findOne({ gameID });
    if (!game) {
      console.error(`Game not found with ID: ${gameID}`);
      return;
    }

    const players = game.players;

    players.sort((a, b) => b.points - a.points);

    players.forEach((player, index) => {
      player.rank = index + 1;
    });

    io.to(gameID).emit('update-players', players);
  } catch (error) {
    console.error(error);
  }
};

io.on('connection', (socket) => {
  console.log(`Connection established: ${socket.id}`);

  socket.emit('request-name-and-gameID');

  socket.on('new-user-joined', async ({ name, gameID }) => {
    socket.join(gameID);

    try {
      const game = await GameSession.findOne({ gameID });

      if (!game) {
        console.error(`Game not found with ID: ${gameID}`);
        return;
      }

      const existingPlayer = game.players.find(
        (player) => player.username === name
      );

      if (existingPlayer) {
        existingPlayer.socketID = socket.id;
        await game.save();
      } else {
        game.players.push({
          username: name,
          points: 10,
          rank: 0,
          socketID: socket.id,
        });

        await game.save();

        updatePlayerInfo(socket, gameID);
        users[socket.id] = { name, gameID };

        socket.broadcast.to(gameID).emit('user-joined', { name, gameID });
      }
    } catch (error) {
      console.error(error);
    }
  });

  socket.on('send',async ({ message, gameID, name })=> {
    const submittedWord = submittedWords[gameID];
    // console.log(submittedWord);
    if (submittedWord && message.toLowerCase() === submittedWord.toLowerCase()) {
      await handleCorrectGuess(gameID, name, socket);
      io.to(gameID).emit('correct-guess', { name });
    }
  
    socket.broadcast.to(gameID).emit('receive', { message, name });
  });

  socket.on('disconnect', async () => {
    const { name, gameID } = users[socket.id] || {};
    if (name && gameID) {
      try {
        const game = await GameSession.findOne({ gameID });
  
        if (game) {
          const playerIndex = game.players.findIndex(
            (player) => player.username === name
          );
  
          if (playerIndex !== -1) {
            // Retrieve user information before removing from the array
            const userInGame = game.players[playerIndex];
  
            await updateUserGameHistory(name, gameID, userInGame);
            game.players.splice(playerIndex, 1);
            await game.save();
  
            // Update the user's game history in the User model

            socket.broadcast.to(gameID).emit('left', { name, gameID });
            updatePlayerInfo(socket, gameID);
            io.to(gameID).emit(
              'update-player-count',
              getPlayersCountInGame(gameID)
            );

            if (game.players.length === 0) {
              game.active = false;
              await game.save();
            }

            if (userInGame.drawingPermission && gameStates[gameID] === GAME_STATE.DRAWING && !isTimerPaused[gameID]) {
              io.to(gameID).emit('end-drawing');
              gameStates[gameID] = GAME_STATE.LOBBY;
              startNewRound(gameID);
          } else if (isTimerPaused[gameID]) {
              startTimer(gameID);
          }
          
          }
        }
      } catch (error) {
        console.error(error);
      }
    }
  });

  socket.on('drawing', ({ drawingData, gameID }) => {
    socket.broadcast.to(gameID).emit('drawing', drawingData);
    // console.log(drawingData);
  });
  socket.on('end-drawing', (gameID) => {
    console.log('End drawing!');
    if (gameStates[gameID] === GAME_STATE.DRAWING) {
      io.to(gameID).emit('end-drawing');
      gameStates[gameID] = GAME_STATE.LOBBY;
      startNewRound(gameID);
    }
  });
  socket.on('word-submitted', ({ word, gameID }) => {
    // console.log(word);
    submittedWords[gameID] = word;
    io.to(gameID).emit('word-submitted', { word });
  });

  socket.on('pause-timer', (gameID) => {
    isTimerPaused[gameID] = true;
    // console.log("timer paused "+isTimerPaused[gameID]);
  });
  
  socket.on('resume-timer', (gameID) => {
    timerValues[gameID]=60;
    isTimerPaused[gameID] = false;
    startTimer(gameID);
    // console.log("timer resumed "+isTimerPaused[gameID]);
  });
  
  
});
// If guess is correct, points are incremented
const handleCorrectGuess = async (gameID, playerName, socket) => {
  try {
    // Update points in GameSession model
    const updatedGame = await GameSession.findOneAndUpdate(
      { gameID, 'players.username': playerName },
      { $inc: { 'players.$.points': 1 } },
      { new: true }
    );
    // Update points in User model
    const updatedUser = await User1.findOneAndUpdate(
      { username: playerName },
      {
        $inc: { points: 1 },
      },
      { new: true }
    );
    updatePlayerInfo(socket,gameID);
  } catch (error) {
    console.error('Error handling correct guess:', error);
  }
};


const updateUserGameHistory = async (username, gameID, userInGame) => {
  try {
    // Update points in User model
    const game = await GameSession.findOne({ gameID });
    if (!game) {
      console.error(`Game not found with ID: ${gameID}`);
      return;
    }

    const players = game.players;

    players.sort((a, b) => b.points - a.points);

    userInGame.rank = players.findIndex(player => player.username === username) + 1;

    await User1.findOneAndUpdate(
      { username },
      {
        $inc: { points: 10 },
        $push: {
          gameHistory: {
            gameID,
            date: userInGame.date,
            points: userInGame.points,
            rank: userInGame.rank,
          },
        },
      },
      { new: true }
    );
  } catch (error) {
    console.error('Error updating user game history:', error);
  }
};


const getPlayersCountInGame = async (gameID) => {
  try {
    const game = await GameSession.findOne({ gameID });

    if (game) {
      return game.players.length;
    } else {
      console.error(`Game not found with ID: ${gameID}`);
      return 0;
    }
  } catch (error) {
    console.error(error);
    return 0;
  }
};

app.get('/api/getInitialGameData', async (req, res) => {
  try {
    const { gameID } = req.query;
    const game = await GameSession.findOne({ gameID });
    if (!game) {
      console.error(`Game not found with ID: ${gameID}`);
      return;
    }

    const players = game.players;

    players.sort((a, b) => b.points - a.points);

    players.forEach((player, index) => {
      player.rank = index + 1;
    });
    res.json({ players });
  } catch (error) {
    console.error('Error fetching initial game data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/getExistingGames', async (req, res) => {
  try {
    const publicGames = await GameSession.find({
      active: true,
      gameType: 'public',
    });
    const gameList = publicGames.map((game) => ({
      gameID: game.gameID,
      adminName: game.adminName,
      playersCount: game.players.length,
    }));
    res.json(gameList);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});

app.post('/game/start', async (req, res) => {
  try {
    const { gameID, gameType } = req.body;

    if (req.session.usern) {
      const adminName = req.session.usern;

      const existingGame = await GameSession.findOne({ gameID });
      if (existingGame) {
        return res.status(400).send('Game with this ID already exists');
      }

      const newGame = new GameSession({
        gameID,
        gameType,
        adminName,
        players: [],
      });

      await newGame.save();
      startNewRound(gameID);
      res
        .status(200)
        .send({ gameID, message: 'Game session created successfully' });
    } else {
      res.status(500).send('Login first');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error initiating the game');
  }
});

app.get('/game/:gameID', async (req, res) => {
  try {
    const gameID = req.params.gameID;

    if (req.session.usern) {
      const playerName = req.session.usern;
      const game = await GameSession.findOne({ gameID });

      if (!game) {
        return res.status(404).send('Game not found');
      }
      const adminName = game.adminName;
      res.render('game', { gameID, adminName, players: game.players });
    } else {
      res.redirect('/login');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error joining the game');
  }
});

app.get('/get-username', (req, res) => {
  if (req.session.usern) {
    res.json({ username: req.session.usern });
  } else {
    res.render('login');
  }
});




// Managing Get requests


app.get("/contact", (req, res) => {
  res.render("contact");
});
app.get("/payment", (req, res) => {
  res.render("payment1");
});

app.get("/multiplayer", (req, res) => {
  res.render("multiplayer");
});
app.get("/404", (req, res) => {
  res.render("404");
});

// Post Requests

app.post("/contact", async (req, res) => {
  try {
    // res.send(req.body);
    const userData = new User(req.body);
    await userData.save();
    res.status(201).render("index");
  } catch (error) {
    res.status(500).send(error);
  }
});


app.post("/login", async (req, res) => {
  try {
    const userData = new User1(req.body);
    const user = await User1.findOne({ email: req.body.email });
    if (user) {
        res.redirect("/login?message=Username/Email%20not%20available");
    }
    else{
      await userData.save();
      res.cookie("authToken", "123456789", { maxAge: 3600000, httpOnly: true });
      req.session.loggedIn = true;
      req.session.usern=req.body.username;
      req.session.emailn=req.body.email;
    //   console.log(req.session.loggedIn);
    //   console.log(req.body.username);
    //   console.log(req.session.emailn);
    res.status(201).redirect("/dashboard");
    }
  } catch (error) {
    if (error.code === 11000 && error.keyPattern.email === 1) {
      res.status(409).send("Email already exists");
    } else if (error.code === 11000 && error.keyPattern.username === 1) {
      res.redirect("/login?message=Username%20not Available");
    } else {
      res.status(500).send(error);
    }
  }
});

app.post("/check", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const user = await User1.findOne({ email: email });

    if (user && user.password === password) {
      res.cookie("authToken", "123456789", { maxAge: 3600000, httpOnly: true });

      // Set the session flags
      req.session.loggedIn = true;
      req.session.usern = await user.username;
      req.session.emailn = req.body.email;

      // Pass the username to the dashboard template when rendering
      res.status(201).render("index");
    } else {
      res.redirect("/login?message=Incorrect%20password");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// Log out of pre logged in session
app.get("/logout", function (req, res) {
  // Destroy the user's session to log them out
  req.session.destroy(function (err) {
    if (err) {
      console.error(err);
      res.status(500).send("Server error");
    } else {
      // Redirect the user to the homepage after they have been logged out
      res.redirect("/");
    }
  });
});

// Get game history for a specific user
app.get("/game-history", async (req, res) => {
    try {
      const user = await User1.findOne({ username: req.session.usern });
      if (!user) {
        return res.status(404).send("User not found");
      }
      res.json(user.gameHistory);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal server error");
    }
  });
  
  // Record game data after a game session ends
  app.post("/record-game", async (req, res) => {
    try {
      const { gameID, points, rank } = req.body;
      const user = await User1.findOne({ username: req.session.usern });
      if (!user) {
        return res.status(404).send("User not found");
      }
      const newGame = { gameID, points, rank };
      user.gameHistory.push(newGame);
      await user.save();
      res.status(201).send("Game data recorded successfully");
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal server error");
    }
  });
  

server.listen(port, () => {
  console.log(`server is running at port no ${port}`);
});


