const passport = require('passport');
const User = require('../models/user');
const config = require('../config');
const JwtStrategy = require('passport-jwt').Strategy;
const LocalStrategy = require('passport-local');
const ExtractJwt = require('passport-jwt').ExtractJwt;

// In Passport.js, the "Strategy" is a method for authenticating a user.
// In this case, we've included a strategy for authenticating users using a JSON Web Token & Username/Email.
// Check the Passport API, though - there are strategies for nearly everything (FB, Google, Twitter, etc...)

// Setup options for Local strategy.
// By default, local strategy expects a username & password on the request, but we're giving it an e-mail instead.
// Now it will know where on the request to look:
const localOptions = {
    usernameField: 'email',
};

// Create Local strategy. This assumes it's going to be passed an email & password. We need to tell it where to look:
const localLogin = new LocalStrategy(localOptions, function(email, password, done) {
    // Verify this email and password. If correct email & pass, call done with this user.
    // Otherwise, call done with false.
    User.findOne({ email }, function(err, user){
        if(err) { return done(err) }
        if(!user) { return done(null, false); }

        // Compare passwords: is password === user.password? Remember: user.password is salted, so we need to desalt it.
        user.comparePassword(password, function(err, isMatch) {
            if(err) { return done(err); }
            if(!isMatch) { return done(null, false); }

            // Passport very kindly assigns our "user" callback argument to "req.user".
            return done(null, user);
        });
    });
});


// Setup options for JWT strategy.
// Whenever a request comes in and we want passport to handle it, look at the header, specifically at "authorization" to find the token.
// Also, let passport know the secret to decoding the JWT token. In this case, it's in our config.secret file.
const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
    secretOrKey: config.secret
};

// Create JWT strategy. 1st argument is options, 2nd is a function that will be called whenever someone authenticates with JWT.
// "payload": The decoded JWT token (in our case, the "sub" and "iat" properties).
// "done": a callback function we need to call depending on whether or not we can authenticate the user.
const jwtLogin = new JwtStrategy(jwtOptions, function(payload, done) {

    // See if the user id in the payload exists in our database.
    // If it does, call done() with the user, otherwise call done() without a user.

    User.findById(payload.sub, function(err, user) {

        // If the search fails to occur, return the error
        if(err){ return done(err, false); }

        // If a user exists, call done with no errors and the user.
        if(user){
            done(null, user);
        // Otherwise, call done with no error, but no user either.
        } else {
            done(null, false);
        }
    });
});
// Tell passport to use this strategy.
passport.use(jwtLogin);
passport.use(localLogin);
