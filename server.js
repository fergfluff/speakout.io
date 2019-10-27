// to kill a process on a port type  in terminal "ps -ef | grep node"
// and the first number listed is the process idea
// then type in "kill #"


// SET UP SERVER TO SERVE WEBPAGES
let https = require('https'); // Use https library
let fs = require('fs'); // Use socket.io's file system library
let url = require('url'); // Use url library

let options = { // Key and certificate for https, saved in root folder
  key: fs.readFileSync('my-key.pem'),
  cert: fs.readFileSync('my-cert.pem')
};

let httpServer = https.createServer(options, requestHandler); // Create instance of https server
httpServer.listen(8092); // Listen on port
console.log('Server listening on port 8092');

function requestHandler(req, res) { // Direct client visits to pages

  let parsedUrl = url.parse(req.url);
  console.log("The Request is: " + parsedUrl.pathname);

  fs.readFile(__dirname + parsedUrl.pathname, // Read in the file they requested
    // Callback function, called when reading is complete
    function(err, data) {
      // if there is an error
      if (err) {
        res.writeHead(500);
        return res.end('Error loading ' + parsedUrl.pathname);
      }
      // Otherwise, send the data, the contents of the file
      res.writeHead(200);
      res.end(data);
    }
  );
  console.log("Got a request " + req.url);

}


// SET UP AND RUN SOCKET.IO
// Basically, what's happening is:
// Listeners/Clients send their ID when they join
// Server receives it here and saves it into an array
// Server then sends to the Speaker everyone's peer_id to speaker

// Where in here is peer JS used?

// This for loop goes through each client object and finds the peer id of each person
// and sends that out
// Isn't this repetitive? It's happening every time someone joins?

var io = require('socket.io').listen(httpServer);
var speakerId;
var speakerSocket;
var info;
var clients = [];
var numListeners;
var i = 0;

// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
// Whether speaker or client
io.sockets.on('connection',
  // We are given a websocket object in our callback function that has an id in it
  function(socket) {

    console.log("We have a new client: " + socket.id);

    // On receiving a connect message, receive data and console.log their socket.id
    // Is this really running? Don't see it in server.
    socket.on('connect', function(data) {
      console.log("New connection" + socket.id);
      // console.log(data);
    });

    // Receive messages from clients / listeners
    // How is socket.id different from socket.peerid?
    socket.on('peerid', function(data) {
      // Give that client's socket's peer id the contents of data
      socket.peerid = data;
      // Add that socket into the clients array
      // Why is it just "socket" - how does it know?
      clients.push(socket);
      // Use if statement to say if we have a speaker when this new client joins
      // Then have the server send the peerid of the new client to the speaker
      if (speakerSocket != null) {
        speakerSocket.emit('clientPeerId', socket.peerid);
      }


    });

    // Receive a message from the speaker
    socket.on('peerid_fromSpeaker_toServer', function(speakerIdData) {
      // Save the ID
      // Why is it just "socket" - how does it know?
      speakerSocket = socket;
      speakerId = speakerIdData;
      // Grab broadcast name here, too
      console.log("speakerID is: " + speakerId);
      // add console messsage here for broadcast name
      console.log("the socket server received the peer.js produced id");

      info = {
        numListeners: numListeners,
        speakerId: speakerId
        // Add broadcast name here

      }

      // Emit to the speaker  the number of listeners and their own ID
      io.sockets.emit('clientCall', info);
      console.log("io.sockets.emit info to speaker");
      console.log(info);

      // Emit to the speaker the client IDs
      for (let i = 0; i < clients.length; i++) {
        socket.emit('clientPeerId', clients[i].peerid);
      }

      // Double-check that the server is sending the speaker's ID
      console.log("Server's peer id message's data: " + speakerId);
    });

    // Increment the number of listeners
    numListeners = ++i;

    // Again, but this time for the Listeners
    // Store in an object the number of listeners and the speaker ID
    info = {
      numListeners: numListeners,
      speakerId: speakerId
      // Add broadcast name here
    }

    // Do I still need this?
    // Emit to everyone the object above
    // io.sockets.emit('info', info);

    // If the listener joins after the speaker, just send the info object with the
    // Speaker ID to the person who just joined (not everyone)
    socket.emit('info', info);

    // Upon disconnect, deincrement listeners and
    socket.on('disconnect', function() {
      console.log("Client has disconnected " + socket.id);

      // Add a for loop to go through the client array and find the same socket.id object that
      // is requesting the disconnect function
      // then splice it out of the client array
      // something like - when clients.i = socket.id

      numListeners = --i;

      console.log("user disconnected, total # is now: " + info);
      io.sockets.emit('numListeners', info);

    });
  }
);
