var User = require('../models/user');
var passport = require('passport');
var localstratrgy = require('passport-local').Strategy;
var validator = require('express-validator');


passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

// signup alidation 
passport.use('local-signup', new localstratrgy({

    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
},

    function (req, email, password, done) {

        req.checkBody('email', 'inavalid email').notEmpty().isEmail();
        req.checkBody('password', 'password should be atleast 5 digit').notEmpty().isLength({ min: 5 });
        var errors = req.validationErrors();

        if (errors) {
            var errorbox = [];
            errors.forEach(function (error) {
                errorbox.push(error.msg);
            });
            return done(null, false, req.flash('error', errorbox));
        }

        User.findOne({ 'email': email }, function (err, user) {
            if (err) {
                return done(err);
            }
            if (user) {
                return done(null, false, { message: 'User is already exits..' });
            }


            var newuser = new User();
            newuser.email = email,
                newuser.password = password,

                newuser.save(function (err, result) {
                    if (err) {
                        return done(err);
                    }
                    return done(null, newuser);
                })
        });
    }
));


// login validation 

passport.use('local-login', new localstratrgy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function (req, email, password, done) {

    User.findOne({ 'email': email }, function (err, user) {
        if (err) {
            return done(err);
        }
        if (!user) {
            return done(null, false, { message: 'Inavlid User' });
        }
        if (!user.validPassword(password)) {
            return done(null, false, { message: 'Invalid Password' });
        }
        return done(null,user);
    })
}

));





