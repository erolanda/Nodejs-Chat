var express = require('express');
var router = express.Router();
var User = require('../models/user.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  //Redirect to login
  res.redirect('/login');
});

/* GET login page. */
router.get('/login', function(req, res, next) {
  res.render('login', {title: 'Login'});
});

/* GET chat page. */
router.get('/chat', function(req, res, next) {
  // user must be logged to proceed to chat page
  if (req.session.username)
    res.render('chat', { title: 'Chat', user:req.session.username});
  else
    res.redirect('/login');
});

// Register a new user
router.post('/signup', function(req,res,next){
  // create a new user
  var testUser = new User({
    username: req.body.username,
    password: req.body.password
  });
  // save user to database
  testUser.save(function(err) {
    if (err)
      console.log(err);
    res.redirect('/login');
  });
});

// Sign in
router.post('/signin', function(req,res,next){
  User.findOne({ username: req.body.username }, function(err, user) {
    if (err) throw err;
    // check password
    if (user)
      user.comparePassword(req.body.password, function(err, isMatch) {
        if (err) throw err;
        if (isMatch){
          req.session.username = user.username;
          res.redirect('/chat');
        }
        else res.redirect('/login');
      });
    else res.redirect('/login');
  });
});

module.exports = router;
