var express = require('express'),
    app = express(),
    five = require("johnny-five"),
    socket = require('socket.io').listen(app.listen(3000)),
    board = new five.Board(),
    ledStatus = false,

    led,
    pmeter,
    pmeterScew,
    pmeterValue = 0, // adjusts image rotation or scew. see index.html line 21
    pmeterScewValue = 0; // adjusts image scew


board.on("ready", function() {
  // Setup hardware
  led = new five.Led({
    pin: 13
  });

  pmeter = new five.Sensor({ // used for image rotation or scew
    pin: 'A3',
    freq: 250
  });

  pmeterScew = new five.Sensor({
    pin: 'A4',
    freq: 250
  });

  // add potentiometer support
  board.repl.inject({
    pot: pmeter
  });

  // get potentiometer data
  pmeter.on('data', function() {
    pmeterValue = (360 * this.value)/1023;
  });

  pmeterScew.on('data', function() {
    pmeterScewValue = (360 * this.value)/1023;
  });

  // set LED.
  this.loop(300, function() {
    if (ledStatus) {
      led.on();
    } else {
      led.off();
    }


  });
});

/*
Server routes
*/

app.get('*', function(req, res, next) {
    console.log('req.url:', req.url);
    next();
});

app.get('/', function(req, res){
  res.sendfile('./index.html');
});

app.get('/img.jpg', function(req, res){
  res.sendfile('./img.jpg');
});

app.get('/socket.io/socket.io.js', function(req, res){
  res.sendfile('./node_modules/socket.io/lib/socket.io.js');
});

app.get('/require.js', function(req, res){
  res.sendfile('./require.js');
});

app.get('/on', function(req, res){
  if (req.url === '/on') {
    ledStatus = true;
    console.log('turning led on');
  }
  res.redirect('/');
});

app.get('/off', function(req, res){
  if (req.url === '/off') {
    ledStatus = false;
    console.log('turning led off');
  }
  res.redirect('/');
});


/*
Socket.io
*/

var interval;
socket.sockets.on('connection', function (io) {
  interval = setInterval(function() {
    io.emit('value', {'pmeterValue':pmeterValue,  'pmeterScewValue': pmeterScewValue});
  }, 50);

});
