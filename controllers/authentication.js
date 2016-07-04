const User = require('../models/user');
const jwt = require('jwt-simple');
const config = require('../config');

// function that takes user's ID and encrypts it using our secret:
function tokenForUser(user) {
    const timestamp = new Date().getTime();
    // using "sub" as a property in a json web token is a standard convention.
    // it's short for "subject", and it identifies who this token belongs to.
    // "iat" is another convention that stands for "in at time", and usually is followed by a timestamp.
    return jwt.encode({ sub: user.id, iat: timestamp }, config.secret);
}

exports.signin = function(req, res, next) {
    // User has had email & pw authorized, we just need to give them a token.
    res.send({ token: tokenForUser(req.user) });
}

exports.signup = function(req, res, next) {

    console.log(req.body); // req.body is the raw data.
    const email = req.body.email;
    const password = req.body.password;

    if(!email || !password) {
        return res.status(422).send({ error: 'You must provide e-mail and password.' });
    }

    // See if a user with the given email exists:
    User.findOne({ email }, function(err, existingUser) {
        if(err){
            return next(err);
        }

        // If a user with email does exist, return an Error
        if(existingUser){
            // res.status allows us to set an HTTP status code. In this case, 422 is unprocessable entity (data was bad)
            return res.status(422).send({ error: 'Email is in use.' });
        }

        // If a user with email does not exist, create and save new user record.
        const newUser = new User({
            email,
            password
        });

        newUser.save(function(err){
            if(err){
                return next(err);
            }

            // Respond to request indicating user was created.
            res.json({ token: tokenForUser(newUser) });
        });


    });

}
