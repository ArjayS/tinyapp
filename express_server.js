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
  findEmailById,
  generateRandomString,
  urlsForUser,
  getUserByEmail,
} = require("./helpers");
const { database1, database2 } = require("./database.js");

//Database
const urlDatabase = database1;
const users = database2;

//GETTING ROUTES

//Homepage
app.get("/", (req, res) => {
  if (req.session.userId) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/urls", (req, res) => {
  if (req.session.userId) {
    const urlUser = urlsForUser(req.session.userId, urlDatabase);
    const user = findEmailById(req.session.userId, users);
    const templateVars = { urls: urlUser, user: user };
    res.render("urls_index", templateVars);
  } else {
    res.status(400).send("<h1> Not permitted to enter! </h1>");
  }
});

//This route creates a new url
app.get("/urls/new", (req, res) => {
  const user = findEmailById(req.session.userId, users);
  const templateVars = { user: user };
  if (!user) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});

//Edit page
app.get("/urls/:shortURL", (req, res) => {
  const user = findEmailById(req.session.userId, users);
  if (!urlDatabase[req.params.shortURL]) {
    res.status(400).send("<h1> This shortURL does not exist! </h1>");
  } else if (urlDatabase[req.params.shortURL].userID === req.session.userId) {
    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      user: user,
    };
    res.render("urls_show", templateVars);
  } else {
    res.status(400).send("<h1> Not permitted to edit! </h1>");
  }
});

//redirecting users to long URL using the shortened URL version
app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.status(400).send("<h1> This shortURL does not exist! </h1>");
  } else if (urlDatabase[req.params.shortURL].longURL) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  } else {
    res.status(400).send("<h1> No associated link with that shortURL! </h1>");
  }
});

//Allows visitor to register
app.get("/register", (req, res) => {
  const templateVars = { user: false };
  res.render("register", templateVars);
});

//Allows visitor to login
app.get("/login", (req, res) => {
  const templateVars = { user: false };
  res.render("login", templateVars);
});

//CREATING ROUTES

//For registering a new account
app.post("/register", (req, res) => {
  const id = generateRandomString();
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .send("<h1> Please Provide your login information </h1>");
  }

  const foundUser = getUserByEmail(email, users);

  if (foundUser) {
    return res
      .status(400)
      .send("<h1> A user with that email already exists </h1>");
  }

  const salt = bcrypt.genSaltSync();
  users[id] = {
    id,
    email,
    password: bcrypt.hashSync(password, salt),
  };

  req.session.userId = id;

  res.redirect("/urls");
});

//For logging In
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const foundUser = getUserByEmail(email, users);

  if (!foundUser) {
    return res.status(403).send("<h1> No user with that email found </h1>");
  }

  if (!bcrypt.compareSync(password, foundUser.password)) {
    return res.status(403).send("<h1> Incorrect Password </h1>");
  }

  req.session.userId = foundUser.id;

  res.redirect("/urls");
});

//For the main urls page
app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const userID = req.session.userId;
  const shortURL = generateRandomString();
  if (!req.session.userId) {
    return res.status(403).send("<h1> Error! </h1>");
  }
  urlDatabase[shortURL] = { longURL, userID };
  res.redirect(`/urls/${shortURL}`);
});

// For the delete Feature
app.post("/urls/:shortURL/delete", (req, res) => {
  if (urlDatabase[req.params.shortURL].userID === req.session.userId) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.status(403).send("<h1> Not permitted to delete! </h1>");
  }
});

// For the EDIT / update Feature
app.post("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL].userID === req.session.userId) {
    let shortURL = req.params.shortURL;
    urlDatabase[shortURL].longURL = req.body.longURL;
    res.redirect(`/urls`);
  } else {
    res.status(403).send("<h1> Not permitted </h1>");
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
