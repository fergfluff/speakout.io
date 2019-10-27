
// Set to null just in case
// Socket will become the speaker's socket
let socket = null;

/* Get User Media */
// Set to null just in case
// my_stream will become the speaker's audio
let my_stream = null;

// To hold our id that the server's PeerJS gives this client.
// Is this the Speaker's ID?
let peer_id = null;

// Is peer this client, or other clients that connect to this client?
// Is this an ID?
let peer = null;

// Constraints - what do we want?
let constraints = {
  audio: true,
  video: false
}

// ACCESS MEDIA FROM INTERNET BROWSER
// AND MAKE A PEERJS CALL WITH IT
// Upon loading the window
window.addEventListener('load', function() {
  console.log("window loading");
  // Prompt the user for permission, and get the stream
  navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {

      // Grab the HTML audio element which is empty until filled
      let audioElement = document.getElementById('myaudio');
      // Fill it with the incoming source object's stream using the srcObject method
      // Why don't you have to define stream before using it here?
      audioElement.srcObject = stream;
      // Set this speaker's audio to be the incoming source object's stream
      my_stream = stream;

      // Wait for the stream to load enough to play
      audioElement.onloadedmetadata = function(e) {

        // Then play or start the audio, but mute it so there is no feedback
        audioElement.volume = 0.0;
        audioElement.play();
        audioElement.muted = true;

        // Now that the Speaker's media stream is available to send
        // Connect to other peer clients.
        connectPeer();

      };
    })
    .catch(function(err) {
      /* Handle the error */
      alert(err);
    });
});

// MAKE A PEERJS CALL FROM WEBSITE
// USE SOCKET.IO TO ALLOW REAL-TIME COMMUNICATION
// AND PEER IDS TO SORT OUT WHO TO CALL AND PLACE CALL
function connectPeer() {
  console.log("connectPeer() function ran");

  // How to replace this?
  // ejf372.itp.io for now
  // later speakout.io
  // port 8092
  peer = new Peer({
    host: 'liveweb-new.itp.io',
    port: 9000,
    path: '/'
  });

  // Get an ID from the PeerJS server for this client
  // Upon the PeerJS library receiving an 'open' message and its incoming data from a connecting client
  peer.on('open', function(id) {
    console.log('My peer ID is: ' + id);
    // Save that id as a unique peer_id
    peer_id = id;

    // Save the ?speakers? spcket as a socket.io connection to the web domain
    socket = io.connect('https://ejf372.itp.io:8092');

    // Send the Speaker's peer ID to the socket.io server (my server.js file)
    // (which is different than PeerJS server)
    // My server is waiting for this message, and will use it to add this ?speakers? client's ID to the client array
    // to send to other clients
    socket.on('connect', function() {
      console.log("send client's ID to the server");
      // How is this sending anything? Is 'connect' a built in method?
    });

    // Get a message called 'clientCall' from the socket.io server.js file
    socket.on('clientCall', function(info) {
      // Grab from the data the Speaker's ID and # of people listening
      console.log("info.speakerID is: " + info.speakerId);
      //Update the HTML to show these two pieces of info
      document.getElementById("numberlisteners").innerHTML = info.numListeners;
      //document.getElementById("idSpeaker").innerHTML = info.speakerId;
    });

    // Get a message called 'clientPeerId' from the socket.io server.js file
    socket.on('clientPeerId', function(clientPeerId) {
      // Make a peer call to the client using the person calling's Id and replying with the speaker's audio
      let call = peer.call(clientPeerId, my_stream);
    })
  });

  peer.on('error', function(err) {
    console.log(err);
  });


  // USER EXPERIENCE FLOW
  let firstSpeakerPage = document.getElementById("firstSpeakerPage");
  let secondSpeakerPage = document.getElementById("secondSpeakerPage");
  let thirdSpeakerPage = document.getElementById("thirdSpeakerPage");

  let nextSpeakerButton = document.getElementById("nextSpeakerButton");
  let goLiveButton = document.getElementById("setup-new-broadcast");
  let leaveBroadcastButton = document.getElementById("leaveBroadcastButton");

  nextSpeakerButton.addEventListener("click", function() {
    firstSpeakerPage.style.display = 'none';
    secondSpeakerPage.style.display = 'block';
  });

  goLiveButton.addEventListener("click", function() {
    secondSpeakerPage.style.display = 'none';
    thirdSpeakerPage.style.display = 'block';
  });

  leaveBroadcastButton.addEventListener("click", function() {});


  //IF SPEAKER PRESSED BUTTON
  document.getElementById("setup-new-broadcast").addEventListener("click", function() {
    console.log("speaker pressed button to send audio");
    // Use socket.io to emit a message with the speaker's ID
    socket.emit('peerid_fromSpeaker_toServer', peer_id);

    //AND GOT A CALL FROM A CLIENT / SOMEONE ELSE
    // What is the difference between this peer.on('call') and the above socket.on('clientPeerId') method?
    // They both seem to send the stream
    peer.on('call', function(incoming_call) {
      console.log("Got a call!");
      console.log(incoming_call);

      //SEND THEM SPEAKER'S AUDIO
      incoming_call.answer(my_stream);

    });
  });
}
