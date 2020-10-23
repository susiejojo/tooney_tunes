var express = require('express');
var app = express();
app.use(express.static(__dirname + '/public')); 
var port = 8080; 

var routes = require('/api/routes/spotify_routes'); 
routes(app); 

app.listen(port);
console.log('server on' + port);