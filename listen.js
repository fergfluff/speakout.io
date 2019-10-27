let speakerId;

// set to null just in case
let socket = null;

// We'll use a global variable to hold our id that the server's PeerJS gives this client.
// I'd like to rename this to listener_id
let peer_id = null;

// Is peer this client, or other clients that connect to this client?
// I'd like to rename this to speaker_id
let peer = null;

// Not sending listener's streams
// var my_stream = null;

// Constraints - what do we want?
// let constraints = {
// 	audio: true,
// 	video: false
// }

// Upon loading the window
window.addEventListener('load', function() {
  console.log("window loading");
  // Run this function to make a peerjs call
  connectPeer();
});


function connectPeer() {

  // Update this info
  peer = new Peer({
    host: 'liveweb-new.itp.io',
    port: 9000,
    path: '/'
  });

  // Get an ID from the PeerJS server for this client
  // And if listener presses button, make a call with their ID
  // so that the server can send it to the speaker
  // and the speaker can make a call back with their audio
  peer.on('open', function(id) {
    console.log('My peer ID is: ' + id);

    peer_id = id;

    //Update this
    socket = io.connect('https://ejf372.itp.io:8092');

    // Send this client's ID to the server
    // Is this what this really does?
    socket.on('connect', function() {
      console.log("connect");
    });

    // Receive a message with # of listeners and Speaker's ID
    socket.on('info', function(info) {
      console.log(info);
      console.log("info.speakerID is: " + info.speakerId);
      document.getElementById("numberlisteners").innerHTML = info.numListeners;
      // document.getElementById("idSpeaker").innerHTML = info.speakerId;
      speakerId = info.speakerId;

      // If they pressed the button
      document.getElementById("joinBroadcastButton").addEventListener("click", function() {
        console.log("button was pressed to receive audio");
        socket.emit('peerid', peer_id);

        console.log("speakerId is: " + speakerId);

      });
    });
  });

  peer.on('call', function(incoming_call) {
    incoming_call.answer();

    incoming_call.on('stream', function(remoteStream) {
      console.log("Received Speaker's remote stream");

      // And attach it to an HTML audio object
      var speakerAudioElement = document.createElement('audio');
      speakerAudioElement.id = "speakerAudioId";
      speakerAudioElement.srcObject = remoteStream;

      speakerAudioElement.setAttribute("autoplay", "true");
      speakerAudioElement.volume = 0.9;
      speakerAudioElement.onloadedmetadata = function(e) {

        speakerAudioElement.play();
      }
      document.body.appendChild(speakerAudioElement);
      console.log("Audio should be appended to HTML and playing now");
    });
  })

  peer.on('error', function(err) {
    console.log(err);
  });

}
