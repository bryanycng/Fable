///<reference path='../types/DefinitelyTyped/node/node.d.ts'/>
///<reference path='../types/DefinitelyTyped/express/express.d.ts'/>
var User = require('../models/user');
var express = require('express');
var router = express.Router();
var passport = require('passport');
var multer = require('multer');
var imageDir = __dirname + "/public/images";
var fs = require("fs");
var storage = multer.diskStorage({
  destination: function (request, file, callback) {
    callback(null, './public/images');
  },
  filename: function (request, file, callback) {
    console.log(file);
    callback(null, file.originalname)
  }
});
var upload = multer({storage: storage}).single('upl');
/**
 * Middleware
 */
// route middleware to make sure a user is logged in
var isLoggedIn = function (req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();
    // if they aren't redirect them to the home page
    res.redirect('/');
};
/* GET main page. */
router.get('/', function (req, res, next) {
    res.render('index');
});
router.post('/fileupload', function(request, response) {
  upload(request, response, function(err) {
  if(err) {
    console.log('Error Occured');
    console.log(err);
    return;
  }
  console.log(request.file);
  // STORE FILENAME INTO MONGODO- FILENAME FIELD IS IN request.file.filename
  response.end('Your File Uploaded');
  console.log('Photo Uploaded');
  })
});
router.get("/images/:id", function (request, response) {
    var path = imageDir + request.params.filename;
    console.log("fetching image: ", path);
    response.sendFile(path);
});
/* GET login page. */
router.get('/login', function (req, res) {
    res.render('login', { message: req.flash('loginMessage') });
});
/* GET signup page. */
router.get('/signup', function (req, res) {
    res.render('signup', { message: req.flash('signupMessage') });
});
/* GET home page. */
router.get('/home', isLoggedIn, function (req, res) {
    res.render('home', {
        user: req.user // get the user out of session and pass to template
    });
});
/* GET profile page. */
router.get('/profile', isLoggedIn, function (req, res) {
    res.render('profile', {
        user: req.user // get the user out of session and pass to template
    });
});
/* GET solo comic main page. */
router.get('/solo', isLoggedIn, function (req, res) {
    var soloURL = '/solo/';
    var titleADDON = user.local.comictitle;
    var url = soloURL.concat(titleADDON);
    res.render('solocomicmain', {

        user: req.user // get the user out of session and pass to template
    });
});
/* GET cooperative comic main page. */
router.get('/cooperative', isLoggedIn, function (req, res) {
    res.render('comicmain', {
        user: req.user // get the user out of session and pass to template
    });
});
/* GET comic page. */
router.get('/comic', isLoggedIn, function (req, res) {
    res.render('comic', {
        user: req.user // get the user out of session and pass to template
    });
});
/* GET upload page. */
router.get('/upload', isLoggedIn, function (req, res) {
    res.render('upload', {
        user: req.user // get the user out of session and pass to template
    });
});
/* GET Userlist page. */
router.get('/userlist', function (req, res) {
    var db = req.db;
    var collection = db.get('usercollection');
    collection.find({}, {}, function (e, docs) {
        res.render('userlist', {
            "userlist": docs
        });
    });
});
/**
 * Logout page
 */
router.get('/logout', function (req, res, next) {
    req.logout();
    // req.session.destroy();
    res.redirect('/');
});
/* POST to Authenticate Service */
router.post('/login', passport.authenticate('local-login', {
    successRedirect: '/home',
    failureRedirect: '/login',
    failureFlash: true // allow flash messages
}));
/* POST to Add User Service */
router.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/',
    failureRedirect: '/signup',
    failureFlash: true // allow flash messages
}));
module.exports = router;