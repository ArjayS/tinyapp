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

/* 
urlDatabase.b2xVn2 = "http://www.lighthouselabs.ca"
urlDatabase[key] = error
urlDatabase.b6UTxQ.longURL = "https://www.tsn.ca"
*/

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

const getUserByEmail = (id) => {
  for (const user in users) {
    if (user === id) {
      return users[user].email;
    }
  }
  return null;
};

const urlsForUser = (id) => {
  const urls = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      urls[shortURL] = urlDatabase[shortURL];
    }
  }
  return urls;
};

//ADDING_ROUTES
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const urlUser = urlsForUser(req.cookies.userId);
  const user = getUserByEmail(req.cookies.userId);
  const templateVars = { urls: urlUser, user: user };
  res.render("urls_index", templateVars);
});

//This route creates a new url
app.get("/urls/new", (req, res) => {
  const user = getUserByEmail(req.cookies.userId);
  const templateVars = { user: user };
  if (!user) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});

//Edit page
app.get("/urls/:shortURL", (req, res) => {
  const user = getUserByEmail(req.cookies.userId);
  if (urlDatabase[req.params.shortURL].userID === req.cookies.userId) {
    const templateVars = {
      shortURL: req.params.shortURL, //This is from the input of the :shortURL
      longURL: urlDatabase[req.params.shortURL].longURL, // We are trying to access the object of urlDatabase within this file.
      user: user,
    };
    res.render("urls_show", templateVars);
  } else {
    res.status(400).send("Not permitted to edit!");
  }
  // console.log(urlDatabase);// TO view any updates regarding the database
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

//Sending HTML
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello<b>World</b></body></html>\n");
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

//For registering a new account
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

  if (foundUser.password !== password) {
    return res.status(403).send("Incorrect Password");
  }

  res.cookie("userId", foundUser.id);
  console.log(foundUser.id);

  res.redirect("/urls");
});

//For the main urls page
app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const userID = req.cookies.userId;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL, userID };
  if (!req.cookies.userId) {
    return res.status(403).send("Error");
  }
  res.redirect(`/urls/${shortURL}`);
});

// For the delete Feature
app.post("/urls/:shortURL/delete", (req, res) => {
  if (urlDatabase[req.params.shortURL].userID === req.cookies.userId) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.status(403).send("Not permitted to delete!");
  }
});

// For the EDIT / update Feature
app.post("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL].userID === req.cookies.userId) {
    shortURL = req.params.shortURL;
    urlDatabase[shortURL].longURL = req.body.longURL; // LN204, urlDatabase[shortURL].longURL = LN 92, urlDatabase[req.params.shortURL].longURL,
    res.redirect(`/urls`);
  } else {
    res.status(403).send("Not permitted");
  }
});

//For logging out
app.post("/logout", (req, res) => {
  res.clearCookie("userId");
  res.redirect("/login");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

// console.log(generateRandomString()); //Check to see if the generateRandomString is generating a random string
