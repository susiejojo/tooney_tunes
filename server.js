var express = require('express');
var app = express();
const path = require('path');
const fs = require('fs');
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

var generateRandomString = function (length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';
var acc_token = process.env.acctoken;

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/public/landing.html'))
});

app.get('/game.html', (req, res) => {
  res.render('/public/game.html');
});

app.get("/authenticate", function (req, res) {
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

app.get('/callback', function (req, res) {

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
    request.post(authOptions, function (error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
          refresh_token = body.refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: {
            'Authorization': 'Bearer ' + access_token
          },
          json: true
        };

        request.get(options, function (error, response, body) {
          console.log(body);
          acc_token = access_token;
          console.log(access_token);
          var fetchOptions = {
            url: 'https://api.spotify.com/v1/audio-analysis/11dFghVXANMlKmJXsNCbNl',
            headers: {
              'Authorization': 'Bearer ' + access_token
            },
            json: true
          }
          request.get(fetchOptions, function (error, response, body) {
            var beat_times = [];
            for (var i = 0; i < body["beats"].length; i++) {
              // console.log(body["beats"][i]["start"]);
              beat_times.push(body["beats"][i]["start"]);
            }
            tempo = parseFloat(body["track"]["tempo"]);
            // music.setAudio(body["external_urls"]["spotify"]);
            write_data = {
              "tempo": body["track"]["tempo"],
              "beats": beat_times
            }
            fs.writeFile('public/assets/info.json', JSON.stringify(write_data), (err) => {
              if (err) throw err;
            })
            res.redirect('/game.html');
          });
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

app.get('/fetch', (req, res) => {
  var fetchOptions = {
    url: 'https://api.spotify.com/v1/audio-analysis/11dFghVXANMlKmJXsNCbNl',
    headers: {
      'Authorization': acc_token
    },
    json: true
  }
  request.get(fetchOptions, function (error, response, body) {
    console.log(body["track"]["tempo"]);
    tempo = parseFloat(body["track"]["tempo"]);
    res.status(200).json(body["track"]["tempo"]);
  });
});

app.listen(port);
console.log('server on ' + port);