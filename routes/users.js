const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const passport = require('passport');

let User = require('../models/user');

router.get('/register', function (req, res) {
    res.render('register');
});

router.post('/register', [check('username', 'Username is required').notEmpty(),
    check('email', 'Email is required').notEmpty(),
    check('email', 'Email is not valid').isEmail(),
    check('password', 'Password is required').notEmpty(),
    check('password2').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Password confirmation does not match password');
        }

        // Indicates the success of this synchronous custom validator
        return true;
    })],
    function (req, res) {
        let errors = validationResult(req);
        if(!errors.isEmpty()) {
            //console.log(errors);
            res.render('register', {
                errors: errors
            });
        } else {
            const username = req.body.username;
            const email = req.body.email;
            const password = req.body.password;

            let newUser = User({
                username: username,
                email: email,
                password: password,
                maxScore: 0
            });

            User.findOne({'username': username}, function (err, user) {
                if (user) {
                    errors = {errors: [{msg: 'This user already exists'}]};
                    res.render('register', {
                        errors: errors
                    });
                } else {
                    bcrypt.genSalt(10, function (err, salt) {
                        bcrypt.hash(newUser.password, salt, function (err, hash) {
                            if (err){
                                console.log(err);
                            }
                            newUser.password = hash;
                            newUser.save(function (err) {
                                if (err) {
                                    console.log(err);
                                    return;
                                } else {
                                    req.flash('success', 'You are now registered and can log in');
                                    res.redirect('/users/login')
                                }
                            });
                        });
                    });
                }
            });
        }
});

router.get('/login', function (req, res) {
    res.render('login');
});

router.post('/login', function (req, res, next) {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

// Logout Route
router.get('/logout', function (req, res) {
    req.logout();
    req.flash('success', 'You are logged out');
    res.redirect('/users/login');
});

module.exports = router;