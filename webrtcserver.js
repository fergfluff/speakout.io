// https://www.webrtc-experiment.com/


//QUESTION: Why do I have socket.io version 3.5.2 when there is only 2.2 online?


// TODO: Links
// https://github.com/muaz-khan/RTCMultiConnection/issues/288
// https://stackoverflow.com/questions/23946683/socket-io-bad-request-with-response-code0-messagetransport-unknown
// https://stackoverflow.com/questions/25821389/socket-io-and-node-js-400-bad-request

var fs = require('fs');

// don't forget to use your own keys!
var options = {
    key: fs.readFileSync('privkey.pem'),
    cert: fs.readFileSync('cert.pem')

    //TODO: His keys are still here, tell him?
    // key: fs.readFileSync('/etc/letsencrypt/live/webrtcweb.com/privkey.pem'),
    // cert: fs.readFileSync('/etc/letsencrypt/live/webrtcweb.com/fullchain.pem')
};

// HTTPs server
var app = require('https').createServer(options, function(request, response) {
    response.writeHead(200, {
        'Content-Type': 'text/html'
    });
    // var link = 'https://github.com/muaz-khan/WebRTC-Experiment/tree/master/socketio-over-nodejs';

    response.write('This is part of SpeakOut');
    response.end();
});


// socket.io goes below

var io = require('socket.io').listen(app, {
    log: true,
    origins: '*:*'
});

// io.set('transports', [
//     //'websocket',
//     'xhr-polling',
//     'jsonp-polling'
// ]);

var channels = {};

io.sockets.on('connection', function (socket) {
    var initiatorChannel = '';
    if (!io.isConnected) {
        io.isConnected = true;
    }

    socket.on('new-channel', function (data) {
      console.log('new-channel');
        if (!channels[data.channel]) {
            initiatorChannel = data.channel;
            console.log("really a new channel");
        } else {
          console.log("channel exists")
        }

        channels[data.channel] = data.channel;
        console.log(data.channel);
        onNewNamespace(data.channel, data.sender);
    });

    socket.on('presence', function (channel) {
      console.log('presence')
        var isChannelPresent = !! channels[channel];
        socket.emit('presence', isChannelPresent);
    });

    socket.on('disconnect', function (channel) {
      console.log('disconnect');
        if (initiatorChannel) {
            delete channels[initiatorChannel];
        }
    });
});

function onNewNamespace(channel, sender) {
  console.log('onNewNamespace');
    io.of('/' + channel).on('connection', function (socket) {
        var username;
        if (io.isConnected) {
            io.isConnected = false;
            socket.emit('connect', true);
        }

        socket.on('message', function (data) {
          console.log('message');
          console.log(data);
            // if (data.sender == sender) {
            //     if(!username) username = data.data.sender;

                socket.broadcast.emit('message', data.data);
                console.log(data.data);
            // }
        });

        socket.on('disconnect', function() {
          console.log('disconnect');
            if(username) {
                socket.broadcast.emit('user-left', username);
                username = null;
            }
        });
    });
}

// run app

app.listen(process.env.PORT || 9559);

process.on('unhandledRejection', (reason, promise) => {
  process.exit(1);
});

console.log('Please open SSL URL: https://localhost:'+(process.env.PORT || 9559)+'/');
