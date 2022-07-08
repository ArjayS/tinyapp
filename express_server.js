const express = require("express");
const app = express();
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const PORT = 8080; //defauls port 8080
const bodyParser = require("body-parser");

app.use(
  cookieSession({
    name: "session",
    keys: ["omegasecretinfo"],
  })
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: false }));

app.set("view engine", "ejs");

const {
  findEmailbyId,
  generateRandomString,
  urlsForUser,
} = require("./helpers");

const urlDatabase = {
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "Pe3Xvn",
  },
  "9sm5xk": {
    longURL: "http://www.googlt.com",
    userID: "Pe3Xvn",
  },
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ481W",
  },
  i3BoGr: {
    longURL: "http://www.google.ca",
    userID: "aJ481W",
  },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

//ADDING ROUTES
app.get("/urls", (req, res) => {
  const urlUser = urlsForUser(req.session.userId, urlDatabase);
  const user = findEmailbyId(req.session.userId, users);
  const templateVars = { urls: urlUser, user: user };
  res.render("urls_index", templateVars);
});

//This route creates a new url
app.get("/urls/new", (req, res) => {
  const user = findEmailbyId(req.session.userId, users);
  const templateVars = { user: user };
  if (!user) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});

//Edit page
app.get("/urls/:shortURL", (req, res) => {
  const user = findEmailbyId(req.session.userId, users);
  if (urlDatabase[req.params.shortURL].userID === req.session.userId) {
    const templateVars = {
      shortURL: req.params.shortURL, //This is from the input of the :shortURL
      longURL: urlDatabase[req.params.shortURL].longURL, // We are trying to access the object of urlDatabase within this file.
      user: user,
    };
    res.render("urls_show", templateVars);
  } else {
    res.status(400).send("Not permitted to edit!");
  }
});

//redirecting users to long URL using the shortened URL version
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL].longURL) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  } else {
    res.status(400).send("No associated link with that shortURL!");
  }
});

//Variables
app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/login", (req, res) => {
  res.render("login");
});

//CREATING ROUTES

//For registering a new account
app.post("/register", (req, res) => {
  const id = generateRandomString();
  const { email, password } = req.body;
  const salt = bcrypt.genSaltSync();

  let foundUser;
  for (const user in users) {
    if (users[user].email === email) {
      foundUser = users[user];
    }
  }

  const newUser = {
    id,
    email,
    password: bcrypt.hashSync(password, salt),
  };

  users[id] = newUser;

  console.log(users);

  if (newUser.email === "" || newUser.password === "") {
    res.status(400).send("Please Provide your login information");
  } else if (foundUser) {
    return res.status(400).send("A user with that email already exists");
  }

  req.session.userId = newUser.id;

  res.redirect("/urls");
});

//For logging In
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  let foundUser;
  for (const userId in users) {
    if (users[userId].email === email) {
      foundUser = users[userId];
    }
  }

  if (!foundUser) {
    return res.status(403).send("No user with that email found");
  }

  if (!bcrypt.compareSync(password, foundUser.password)) {
    return res.status(403).send("Incorrect Password");
  }

  req.session.userId = foundUser.id;

  console.log(foundUser.id);

  res.redirect("/urls");
});

//For the main urls page
app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const userID = req.session.userId;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL, userID };
  if (!req.session.userId) {
    return res.status(403).send("Error");
  }
  res.redirect(`/urls/${shortURL}`);
});

// For the delete Feature
app.post("/urls/:shortURL/delete", (req, res) => {
  if (urlDatabase[req.params.shortURL].userID === req.session.userId) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.status(403).send("Not permitted to delete!");
  }
});

// For the EDIT / update Feature
app.post("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL].userID === req.session.userId) {
    let shortURL = req.params.shortURL;
    urlDatabase[shortURL].longURL = req.body.longURL;
    res.redirect(`/urls`);
  } else {
    res.status(403).send("Not permitted");
  }
});

//For logging out
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
