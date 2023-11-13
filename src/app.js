const express = require("express");
const path = require("path");
const app = express();
const hbs = require("hbs");
require("./db/conn");

const User = require("./models/usermessage");
const User1 = require("./models/userlogin");
const games= require("./models/games");

const port = process.env.PORT || 3000;

const static_path = path.join(__dirname, "../public");
const templates_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");

const session = require("express-session");
app.use(
  session({
    secret: "your secret key",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(express.json());

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
  
  app.get("/admin", (req, res) => {
    res.render("admin");
  });
  app.get("/game", (req, res) => {
    res.render("game");
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




app.get("/contact", (req, res) => {
  res.render("contact");
});
app.get("/payment", (req, res) => {
  res.render("payment1");
});
app.get("/404", (req, res) => {
  res.render("404");
});


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
      res.status(201).render("index");
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

      // Add this code to set a flag in the session indicating that the user is logged in
      req.session.loggedIn = true;
      req.session.usern = user.username;
      res.status(201).render("index");
    } else {
      res.redirect("/login?message=Incorrect%20password");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

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
  

app.listen(port, () => {
  console.log(`server is running at port no ${port}`);
});
