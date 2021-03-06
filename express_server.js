const express = require("express");
const bcrypt = require('bcrypt');
const helpers = require('./helpers');
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['id']
}));



const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "test"
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
    urls: urlDatabase[req.session.userID],
    user: users[req.session.user_id]
  };

  if (users[req.session.user_id]) {
    templateVars.urls = urlsForUser(req.session.user_id);
    res.render("urls_index", templateVars);
  } else {
    templateVars.urls = {};
    res.render("urls_index", templateVars);
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/login", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id],
  };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  let uID = helpers.getUserByEmail(req.body.email, users);
  if (uID === undefined) {
    res.status(403).send('Cannot find that email in our system!');
  } else if (!bcrypt.compareSync(req.body.password, uID.password)) {
    res.status(403).send('Password is incorrect!');
  } else {
    req.session.user_id = uID.id;
    res.redirect("/urls");
  }

});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id],
  };
  if(req.session.user_id) {
    res.redirect("/urls")
  } else {
  res.render("urls_register", templateVars);
  }
});

app.post("/register", (req, res) => {
  let uId  = helpers.generateRandomString();
  let emailId = helpers.getUserByEmail(req.body.email, users);

  if (req.body.email === '' || req.body.password === '') {
    res.status(400).send('Empty username and password');
  } else if (emailId) {
    res.status(400).send('Email already exists');
  } else {
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    
    users[uId] = {
      id: `${uId}`,
      email: req.body.email,
      password: hashedPassword
    };
    req.session.user_id = uId;
    res.redirect("/urls");
  }
});

app.post("/urls", (req, res) => {
  let tinyUrl = helpers.generateRandomString();
  urlDatabase[tinyUrl] = {
    longURL : req.body.longURL,
    userID : req.session.user_id
  };
  res.redirect(`/urls/${tinyUrl}`);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id]
  };
  if (users[req.session.user_id]) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
  
});

app.get("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL] === undefined) {
    res.send(403, 'Not found');
  } else {
    let templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      owner: urlDatabase[req.params.shortURL].userID,
      user: users[req.session.user_id]
    };
    res.render("urls_show", templateVars);
  }
  
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.send(403);
  }
});

app.post("/urls/:shortURL", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    urlDatabase[req.params.shortURL] = {
      longURL: req.body.longURL,
      userID: req.session.user_id
    };
    res.redirect(`/urls`);
  } else {
    res.send(403);
  }
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.send(404, 'Page does not exist');
  }
});

app.listen(PORT, () => {
  console.log(`Tiny app listening on port ${PORT}!`);
});

function urlsForUser(id) {
  let filteredUrls = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      filteredUrls[url] = urlDatabase[url];
    }
  }
  return filteredUrls;
}



