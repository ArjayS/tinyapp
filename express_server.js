const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const PORT = 8080; //defauls port 8080
const bodyParser = require("body-parser");

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: false }));

app.set("view engine", "ejs");

//Function for generating a Random String
function generateRandomString() {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xk": "http://www.googlt.com",
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

const getUserByID = (id) => {
  for (const user in users) {
    if (user === id) {
      return users[user].email;
    }
  }
  return null;
};

//ADDING_ROUTES
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const user = getUserByID(req.cookies.userId);
  const templateVars = { urls: urlDatabase, user: user };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user = getUserByID(req.cookies.userId);
  const templateVars = { user: user };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const user = getUserByID(req.cookies.userId);
  const templateVars = {
    shortURL: req.params.shortURL, //This is from the input of the :shortURL
    longURL: urlDatabase[req.params.shortURL], // We are trying to access the object of urlDatabase within this file.
    user: user,
  };
  // console.log(urlDatabase);// TO view any updates regarding the database
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//Sending HTML
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//Variables
app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});

app.get("fetch", (req, res) => {
  res.send(`a = ${a}`);
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/login", (req, res) => {
  res.render("login");
});

//CREATING ROUTES

app.post("/register", (req, res) => {
  const id = generateRandomString();
  console.log(req.body);
  const { email, password } = req.body;

  let foundUser;
  for (const user in users) {
    if (users[user].email === email) {
      foundUser = users[user];
    }
  }

  const newUser = {
    id,
    email,
    password,
  };
  users[id] = newUser;

  if (newUser.email === "" || newUser.password === "") {
    res.status(400).send("Please Provide your login information");
  } else if (foundUser) {
    return res.status(400).send("A user with that email already exists");
  }

  res.cookie("userId", newUser.id);

  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  let foundUser;
  for (const userId in users) {
    if (users[userId].email === email) {
      foundUser = users[userId];
    }
  }

  if (!foundUser) {
    return res.status(400).send("No user with that email found");
  }

  if (foundUser.password !== password) {
    return res.status(400).send("Incorrect Password");
  }

  res.cookie("userId", foundUser.id);
  // res.cookie("username", username);
  console.log(foundUser.id);

  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  // console.log(urlDatabase); // Log the POST request body to the console
  // res.send("Ok"); // Respond with 'Ok' (we will replace this)
  res.redirect(`/urls/${shortURL}`);
});

// For the Delete Feature
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

// For the Update Feature
app.post("/urls/:shortURL", (req, res) => {
  shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/logout", (req, res) => {
  res.clearCookie("user");
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

// console.log(generateRandomString()); //Check to see if the generateRandomString is generating a random string
