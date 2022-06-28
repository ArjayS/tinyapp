const express = require("express");
const app = express();
const PORT = 8080; //defauls port 8080

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xk": "http://www.googlt.com",
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

//ADDING_ROUTES
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

//STOPPED_AT_TINYAPP:_OVERVIEW_&_SETUP_,_ADDING_ROUTES
