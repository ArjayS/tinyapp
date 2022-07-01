const express = require("express");
const app = express();
const PORT = 8080; //defauls port 8080
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));

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

//ADDING_ROUTES
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL, //This is from the input of the :shortURL
    longURL: urlDatabase[req.params.shortURL], // We are trying to access the object of urlDatabase within this file.
  };
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

//CREATING ROUTES
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  console.log(urlDatabase); // Log the POST request body to the console
  // res.send("Ok"); // Respond with 'Ok' (we will replace this)
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

console.log(generateRandomString());
