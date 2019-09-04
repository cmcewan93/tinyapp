const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser');
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user: users[req.cookies.user_id]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/login", (req, res) => {
  let templateVars = {
    user: users[req.cookies.user_id],
  };
  res.render("urls_login", templateVars);
})

app.post("/login", (req, res) => {
  let uID = emailLookup(req.body.email, users);

  if(uID.length <= 0) {
    res.status(403).send('Cannot find that email in our system!');
  } else if (req.body.password !== users[uID].password) {
    res.status(403).send('Password is incorrect!');
  } else {
    console.log('logged in');
    res.cookie("user_id", uID);
  }
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id", {path: '/'});
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  let templateVars = {
    user: users[req.cookies.user_id],
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  let uId  = generateRandomString();
  let emailId = emailLookup(req.body.email, users);

  if (req.body.email === '' || req.body.password === '') {
    res.status(400).send('Empty username and password');
  } else if (emailId.length > 0) {
    res.status(400).send('Email already exists');
  } else {
    users[uId] = {
      id: `${uId}`,
      email: req.body.email,
      password: req.body.password
    };
    res.cookie("user_id", uId);
  }
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  let tinyUrl = generateRandomString();
  urlDatabase[tinyUrl] = req.body.longURL;
  res.redirect(`/urls/${tinyUrl}`);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: users[req.cookies.user_id]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies.user_id]
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect(`/urls`);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  if (longURL) {
    res.redirect(longURL);
  }
  res.send(404);
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

function emailLookup(email, users) {
  for(user in users) {
    if(users[user].email === email) {
      return users[user].id;
    } 
  }
  return '';
}