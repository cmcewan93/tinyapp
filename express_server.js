const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser');
app.use(cookieParser())

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  let templateVars = { 
    urls: urlDatabase,
    username: req.cookies.username
  };
  res.render("urls_index", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
})

app.post("/logout", (req, res) => {
  res.clearCookie("username", {path: '/'})
  res.redirect("/urls");
})

app.post("/urls", (req, res) => {
  let tinyUrl = generateRandomString(); // Log the POST request body to the console
  urlDatabase[tinyUrl] = req.body.longURL;
  res.redirect(`/urls/${tinyUrl}`);         // Respond with 'Ok' (we will replace this)
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies.username
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies.username
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
})

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect(`/urls`)
})

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  if (longURL) {
    res.redirect(longURL);
  }
  res.send(404)
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  let result = '';
  let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charLength = chars.length;

  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * charLength));
  }
  return result;
}