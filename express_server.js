const express = require("express");
const app = express();
const PORT = 8080; //defauls port 8080

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.send("Hello!");
});

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xk": "http://www.googlt.com",
};

//ADDING_ROUTES
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

//STOPPED_AT_TINYAPP:_OVERVIEW_&_SETUP_,_ADDING_ROUTES
