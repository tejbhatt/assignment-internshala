require('rootpath')();
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
var userRoutes = require('routes/userRoutes.js');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.use('/', userRoutes);

// start server
var port = process.env.PORT || 8080;
const server = app.listen(port, function () {
    console.log('Server listening on port ' + port);
});


module.exports = app