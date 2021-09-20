//jshint esversion:6
require('dotenv').config() // used to keep our secret keys and api keys. have in all apps.
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require('mongoose-encryption');
mongoose.connect('mongodb://localhost:27017/userDB');
//const _ = require("lodash")
const app = express();

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});
console.log(process.env.API_KEY)
// for this project, we use the convenience method of defining a string in the mongoose encryption documentation.

userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ['password']}); // if you don't put the encrypted field option, it will encrypt the entire database.
// you can also encrypt multiple field, by adding the field name in the encryptedFields array above.
const User = new mongoose.model("user", userSchema)


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));


app.get ('/', (req, res) => {
  res.render('home')
})

app.get ('/login', (req, res) => {
  res.render('login')
})
app.post('/login', (req, res) => {
  const username = req.body.username
  const password = req.body.password
  User.findOne({email: username}, (err, foundUser) => {
    if (err){
      res.send(err);
    } else{
      if (foundUser){
        if(foundUser.password === password){
          res.render('secrets')
        }
      }
    }
  });
});

app.get ('/register', (req, res) => {
  res.render('register')
})

app.post('/register', (req, res) => {
  const newUser = new User({
    email: req.body.username,
    password: req.body.password
  })

  newUser.save((err) => {
    if (err){
      res.send(err);
    } else{
      res.render("secrets")
    }
  });
});

app.listen(3000, ()=> {console.log("App is listening at port 3000")})
