const Authentication = require('./controllers/authentication');
const passportService = require('./services/passport');
const passport = require('passport');

// This is the code for the actual passport middleware/interceptor.
// The first line states that rather than starting a session for an authenticated user (thereby sending back a cookie), use JWT.
const requireAuth = passport.authenticate('jwt', { session: false });
const requireSignin = passport.authenticate('local', { session: false });

module.exports = function(app) {
    // Anytime someone visits this route (root), first send them through requireAuth, then if they pass that, send them through the request handler.
    app.get('/', requireAuth, function(req, res){
        res.send('Hi there!');
    })

    // If we ever want to add more protected routes, we can add another app.get, supplying the route, "requireAuth", and the desired route using res.send.
    
    // get maps directly to the type of http request we want to handle.
    // app.get, app.post, etc...
    // req is the request, res is the response.
    app.post('/signup', Authentication.signup);
    app.post('/signin', requireSignin, Authentication.signin);
};
