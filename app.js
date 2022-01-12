//jshint esversion:6
require('dotenv').config() // used to keep our secret keys and api keys. have in all apps.
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require('passport-local-mongoose');
//we also installed passport local, however, we don't need to declare it here. passport-local-moongoose depend on it.
mongoose.connect('mongodb://localhost:27017/userDB');
//const _ = require("lodash")
const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({ //is is important that this is at this position. under all the app.set and use but above everythingelse
  secret: 'my name is rotimi babalola',
  resave: false,
  saveUninitialized: true
}))

app.use(passport.initialize()); // this mean initialize passport
app.use(passport.session()); // start a session.

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

userSchema.plugin(passportLocalMongoose) // positioning is important after the user schema and before the user model
// it will help hash and salt user password, and save users into the mongoDB database.
const User = new mongoose.model("user", userSchema)

passport.use(User.createStrategy()); //means create a local login strategy
passport.serializeUser(User.serializeUser()); // this help create a cookie with an identity for users
passport.deserializeUser(User.deserializeUser());// this helps open up the cookie to authenticate the user.

app.get ('/', (req, res) => {
  res.render('home')
})

app.get ('/login', (req, res) => {
  res.render('login')
})
app.post('/login', (req, res) => {
const user = new User({
  username: req.body.username,
  password: req.body.password
});
req.login(user, (err) => { //this method is from passport.
  if (err) {
    console.log(err);
  }else{
    passport.authenticate("local")(req, res, () =>{
      res.redirect("/secrets")
    });
  }
})
});


app.get ('/register', (req, res) => {

  res.render('register')
})
app.get("/secrets", (req, res) => {
  if (req.isAuthenticated()){
    res.render("secrets");
  } else{
    res.redirect("/login")
  }
});
app.get("/logout", (req, res) => {
  req.logout(); // passport method
  res.redirect("/")
});

app.post('/register', (req, res) => {
User.register({username: req.body.username}, req.body.password, (err, user) =>{
  if (err) {
    console.log(err);
    res.redirect("/register");
  } else{
    passport.authenticate("local")(req, res, () => {
      res.redirect("/secrets");
    })
  }
})
});

app.listen(3000, ()=> {console.log("App is listening at port 3000")})
