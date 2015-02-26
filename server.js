var express = require('express');
var bodyParser = require('body-parser');
var http = require('http');
var https = require('https');

var app = express();
var port = process.env.PORT || 3000;

var config = require('./config');

var user_hash = {};

app.use(bodyParser.urlencoded({ extended: true }));

// test route
app.get('/', function (req, res) {
  var response = "Ping? Pong!";
  res.status(200).send(response);
});

// Slack slash command route
app.post('/slack', function (req, res) {
  console.log(req.body);
  
  var resp;
  switch(req.body.text) {
    case 'start':
      resp = pomo_start(req.body.user_name);
      break;
    case 'reset':
      resp = pomo_start(req.body.user_name);
      break;
    case 'status':
      resp = pomo_status(req.body.user_name);
      break;
    case 'info':
      resp = pomo_info(req.body.user_name);
      break;
    default:
      resp = "Sorry, but that was an invalid command. Please try again." +
        "\nValid options are start|stop|reset|status|info";
  }
  
  res.status(200).send(resp);
});
 
function pomo_start(user_name) {
  start_pomo_timer(user_name);
  return "Pomodoro timer has been started. 25 minutes remain.";
}

function start_pomo_timer(user_name) {
  if(user_hash[user_name] == undefined) {
    user_hash[user_name] = {};
  }
  
  var u = user_hash[user_name];
  
  u.time_start = new Date();
  
  if(u.type == "work") {
    u.type = "break";
    u.timer = 5 * 60 * 1000;
    
    // TODO DEBUG
    u.timer = 10;
  }
  else {
    u.type = "work";
    u.timer = 25 * 60 * 1000;
    
    // TODO DEBUG
    u.timer = 10;
  }
  
  setTimeout(pomo_done(user_name), u.timer);
}

function pomo_status(user_name) {
  return JSON.stringify(user_hash[user_name]);
}

function pomo_info() {
  return "Pomodoro timer https://github.com/myrridin/slack-pomo-iojs";
}

function pomo_done(user_name) {
  var channel = "%40" + user_name;
  var api_path = config.slackbot.path + "&channel=" + channel;
  
  var post_data = "Pomo timer complete! That ends the *" + 
    user_hash[user_name].type + 
    "* phase. Type `/pomo start` to start the next phase.";
    
  var post_options = {
      host: config.slackbot.host_name,
      port: '443',
      path: api_path,
      method: 'POST',
      headers: {
          //'Content-Type': 'raw',
          'Content-Length': Buffer.byteLength(post_data)
      }
  };

  var post_req = https.request(post_options, function(res) { });
  console.log(post_options);
  
  post_req.on('error', function(e) {
    console.log(e);
  });
  
  post_req.write(post_data);
  post_req.end();
  
}

// error handler
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(400).send(err.message);
});
 
app.listen(port, function () {
  console.log('Slack bot listening on port ' + port);
});