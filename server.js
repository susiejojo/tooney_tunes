var express = require('express');
var app = express();
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
require("dotenv").config();
var request = require('request');

app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser());
var port = 5000; 
var redirect_uri = 'http://localhost:5000/callback';

var generateRandomString = function(length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
    for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };
  
var stateKey = 'spotify_auth_state';
  

app.get("/authenticate",function(req,res){
    var state = generateRandomString(16);
    res.cookie(stateKey, state);
    var scope = 'user-read-private user-read-email';
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
        response_type: 'code',
        client_id: process.env.clientId,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state
        }));
});

app.get('/callback', function(req, res) {
  
    var code = req.query.code || null;
    var state = req.query.state || null;
    var storedState = req.cookies ? req.cookies[stateKey] : null;
  
    if (state === null || state !== storedState) {
      res.redirect('/#' +
        querystring.stringify({
          error: 'state_mismatch'
        }));
    } else {
      res.clearCookie(stateKey);
      var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
          code: code,
          redirect_uri: redirect_uri,
          grant_type: 'authorization_code'
        },
        headers: {
          'Authorization': 'Basic ' + (new Buffer(process.env.clientId + ':' + process.env.clientSecret).toString('base64'))
        },
        json: true
      };
      console.log(authOptions);
      request.post(authOptions, function(error, response, body) {
        if (!error && response.statusCode === 200) {
  
        var access_token = body.access_token,
            refresh_token = body.refresh_token;

        var options = {
        url: 'https://api.spotify.com/v1/me',
        headers: { 'Authorization': 'Bearer ' + access_token },
        json: true
        };
        console.log(access_token);
        console.log(refresh_token);
        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
        console.log(body);
        });

        var fetchOptions = {
            url: 'https://api.spotify.com/v1/tracks/11dFghVXANMlKmJXsNCbNl',
            headers: {
              'Authorization': 'Bearer ' +access_token
            },
            json: true
          };
        request.get(fetchOptions, function(error,response,body){
            console.log(body);
        });
    } else {
        console.log(error);
        res.redirect('/#' +
        querystring.stringify({
            error: 'invalid_token'
        }));
        }
      });
    }
  });

app.listen(port);
console.log('server on ' + port);


