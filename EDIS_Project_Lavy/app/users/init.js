// file:app/user/init.js
const passport = require('passport')

app.get('/profile', passport.authenticationMiddleware(), renderProfile) 