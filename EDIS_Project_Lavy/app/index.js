// file:app/index.js
const express = require('express')  
const passport = require('passport')  
const session = require('express-session')  
const mysql = require('mysql')(session)

const app = express()  
app.use(session({  
  store: new mysql({
    url: config.mysql.url
  }),
  secret: config.mysql.secret,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())  
app.use(passport.session())  