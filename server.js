var express = require('express');
var bodyParser = require('body-parser');

var app = express();
var port = process.env.PORT || 3000;

var user_hash = {};

// body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));

// test route
app.get('/', function (req, res) {
  var response = "Hello, pomo slack.";
  res.status(200).send(response);
});

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
  user_hash[user_name] = Date.now();
  return "Pomodoro timer has been started. 25 minutes remain.";
}

function pomo_status(user_name) {
  return new String(user_hash[user_name]);
}

function pomo_info() {
  return "Pomodoro timer https://github.com/myrridin/slack-pomo-iojs"
}

// error handler
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(400).send(err.message);
});
 
app.listen(port, function () {
  console.log('Slack bot listening on port ' + port);
});