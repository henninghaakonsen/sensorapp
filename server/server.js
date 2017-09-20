var express = require('express');
var app = express();
const bodyParser     = require('body-parser');

var path = require('path');
var public = __dirname + "/public/";

app.use(bodyParser.urlencoded({ extended: true }));
app.get('/', function(req, res) {
    res.sendFile(path.join(public + "index.html"));
});

const port = process.env.PORT || 8080
app.use(express.static(__dirname + '/'));
app.listen(port, () => {
    console.log("We are live on " + port)
});