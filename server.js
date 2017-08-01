// Get dependencies
const express = require('express');
const path = require('path');
const http = require('http');
const bodyParser = require('body-parser');
// Get our API routes
const api = require('./server/routes/api');
const app = express();

//Need Below code to check on production server
//app.use(function (req, res, next) { //allow cross origin requests
//    res.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
//    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
//    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//    res.header("Access-Control-Allow-Credentials", true);
//    next();
//});

// Parsers for POST data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.use('/scripts', express.static(__dirname + '/node_modules/'));
// Point static path to dist
app.use(express.static(path.join(__dirname, 'dist')));

// Set our api routes
app.use('/api', api);

// Catch all other routes and return the index file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});



/**
 * Get port from environment and store in Express.
 */
const port = process.env.PORT || '3000';
app.listen(port);
console.log(`API running on localhost:${port}`);

module.exports = app;
