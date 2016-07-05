// Main starting point of application (first thing to execute)
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const morgan = require('morgan'); // morgan is a logging framework - it logs incoming requests (good for debugging).
const app = express();
const router = require('./router.js');
const mongoose = require('mongoose');
const cors = require('cors');
// DB setup
// Internally, this creates a database internally called "auth"
mongoose.connect('mongodb://localhost:auth/auth')
// App setup (getting express setup how we want it)
// Middleware: any incoming request is passed into this first.
app.use(morgan('combined'));
app.use(cors());
app.use(bodyParser.json({ type: '*/*'}));
// bodyParser will attempt to parse the incoming request into a certain type. In this case, json.
router(app);
// Server setup (getting express to speak with the outside world)
const port = process.env.PORT || 3090;

// http is a native node library (low-level) that knows how to handle requests.
// This just says to forward http requests to our express app.
const server = http.createServer(app);
server.listen(port);
console.log('Server listening on port:', port);
