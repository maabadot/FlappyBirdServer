const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const config = require('./config/database');

mongoose.connect(config.database, {useUnifiedTopology: true, useNewUrlParser: true});

let db = mongoose.connection;

// Check connection
db.once('open', function () {
   console.log('Connected to MongoDB on ' + config.database + '...');
});

// Check DB
db.on('error', function (err) {
    console.log(err);
});

let User = require('./models/user');

// Init App
const app = express();

// Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Set public folder
app.use(express.static(path.join(__dirname, 'public')));

// Express Session Middleware
app.use(session({
    secret: 'mysecret',
    resave: true,
    saveUninitialized: true
}));

// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

// Passport Config
require('./config/passport')(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function (req, res, next) {
    res.locals.user = req.user || null;
    next();
});

// Home Route
app.get('/', function (req, res) {
    res.render('index');
});

// AJAX Post Score Route
app.post('/', function (req, res) {
    if (req.user) {
        let query = {username: req.user.username};
        let score = 0;
        //console.log(req.user.username, req.body.score);
       // console.log(query);
        User.findOne(query, function (err, user) {
           if (err) { console.log(err); }
           if (user) {
               if (req.body.score > user.maxScore) {
                   User.updateOne(query, {maxScore: req.body.score}, function (err) {
                       if (err) { console.log(err); }
                   });
               }
           }
        });
    }
});

app.get('/getscore', function (req, res) {
    //console.log('hmm...');
    if (req.user) {
        let query = {username: req.user.username};
        User.findOne(query, function (err, user) {
            if (err) { console.log(err); }
            if (user) {
                res.send({score: user.maxScore});
            }
        });
    } else {
        res.send({score: 0});
    }
});

// Leaderboard Route
app.get('/leaderboard', function (req, res) {
    User.find({}, {username: 1, maxScore: 1, _id: 0}, function (err, users) {
        if (err) {
            throw err;
        } else {
            res.render('leaderboard', {
                users: users
            });
            //console.log(users);
        }
    }).sort({maxScore: -1});
});

let users = require('./routes/users');
app.use('/users', users);

// Error 404 Handler
app.use(function(req, res, next) {
    res.status(404).render('404');
});

app.listen(3000, function () {
   console.log('Server started on port 3000...');
});
