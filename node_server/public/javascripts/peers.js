// Javascript that handles communication between users in the environment.
// To reduce load on the server and improve performance, users make connections between each other.
// These connections can be used to send video, audio and messages.

/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */

let teacherSocket = '';
let teacherPeer = null;
let teacherWebcam = undefined;

// All connections the user has with other users.
const activeconnections = new Map();

positionalHearing = false;
let delayNode = undefined;

let lastRotation = 0;
let rotationNow = 0;
let socket = null;
let lastNoti = undefined;

// Used to check if a stream is a LiDar stream or screen share stream and get the correct location to place it.
const servRtcStrms = new Map();
const servRtcStrmsLidars = ['videostream', 'depthstream'];
const servRtcStrmsScrnsh = ['screensharestream', 'webcamstream'];
servRtcStrms.set('videostream', 'lidarVideoStream1');
servRtcStrms.set('depthstream', 'lidarVideoStream2');

// vars useful for receiving teacher streams
let teacherIncomingMediaStream = null;
let teacherTracks = [];

// Connection to the server.
socket = io.connect(window.location.origin);

// Updates the face mesh of the teacher.
socket.on('faceMeshTeacher', (array) => {
  if (!isTeacher) {
    facialLandmarksClient = array;
    updateFaceMesh();
  }
});
socket.on('teacherStreamChanged', () => {
  if (table == -2 && recording3D) {
    const screenshareScreen = document.getElementById('screenshare');
    const options = {mimeType: 'video/webm'};
    setTimeout(function() {
      mediaRecorderScreenShareStream = new MediaRecorder(screenshareScreen.srcObject, options);
      mediaRecorderScreenShareStream.ondataavailable = function(e) {
        handleDataAvailable3DRecorder(e, {chunks: recordedChunksScreenShareStream, name: 'screen'});
      };
      mediaRecorderScreenShareStream.start();
    }, 3000);
  }
});

/**
 * Start the connection to the server.
 *
 * @param {boolean} teacher if the user is a teacher
 * @param {String} name the name of the user
 */
function startConnecting(teacher, name) {
  /**
   * adds a student to the environment on the right position.
   * @param {string} id - id of the user that will be added
   * @param {MediaStream} stream - stream of the webcam
   * @param {number} seat - seat of the user that will be added
   */
  function addVideoElement(id, stream, seat) {
    // connection to teacher for speaker function
    if (seat == -1) {
      return;
    }
    // connection with the speaker
    if (seat == -2) {
      const studentStream = document.createElement('VIDEO');
      studentStream.srcObject = stream;
      studentStream.setAttribute('id', 'StudentStream' + seat);
      studentStream.style.display = 'none';
      studentStream.width = 500;
      studentStream.height = 500;
      const studentsDiv = document.querySelector('#students');
      studentStream.play();
      studentsDiv.appendChild(studentStream);
      return;
    }

    // Connections to teacher are without sounds unless the speaker function is used.
    if (isTeacher) {
      stream.getAudioTracks()[0].enabled = false;
    }

    if (document.getElementById('Student' + seat) != undefined) {
      removeVideoElement(seat);
    }

    // a, b and c are the position of the other user.
    a = positions[seat].a;
    b = positions[seat].b;
    c = positions[seat].c;

    // Canvas where snapshots of the students will be used
    const student = document.createElement('CANVAS');
    student.setAttribute('id', 'Student' + seat);
    student.style.display = 'none';
    student.width = 500;
    student.height = 500;
    const studentsDiv = document.querySelector('#students');
    studentsDiv.appendChild(student);

    // The source video of the student.
    const studentStream = document.createElement('VIDEO');
    studentStream.srcObject = stream;
    studentStream.setAttribute('id', 'StudentStream' + seat);
    studentStream.style.display = 'none';
    studentStream.width = 500;
    studentStream.height = 500;
    studentStream.muted = true;
    studentsDiv.appendChild(studentStream);

    // Canvas to display the student on without background.
    const studentCtx = document.createElement('CANVAS');
    studentCtx.setAttribute('id', 'StudentCtx' + seat);
    studentCtx.style.display = 'none';
    studentCtx.width = 500;
    studentCtx.height = 500;
    studentsDiv.appendChild(studentCtx);

    ctxStudentStream = studentCtx.getContext('2d');
    studentStream.play();
    ctxStreams[seat] = ctxStudentStream;
    canvasWebcams[seat] = studentCtx;

    // Adds the student with removed background to the environment.
    const textureStudent = new THREE.Texture(student);
    const geometry4 = new THREE.PlaneGeometry(5, 5);
    studentCanvas2 = new THREE.Mesh( geometry4, new THREE.MeshPhongMaterial( {
      color: 'white',
      map: textureStudent,
      alphaTest: 0.5,
      transparent: true,
      side: THREE.FrontSide,
    }));
    studentCanvas2.position.set( a, b, c);
    studentCanvas2.matrixAutoUpdate = true;
    studentCanvas2.name = 'Student' + seat;
    scene.add( studentCanvas2 );
    objects.push( studentCanvas2 );

    students[seat] = studentCanvas2;
    sources[seat] = studentStream;
    textures [seat] = textureStudent;

    ctxStudent = student.getContext('2d');
    ctxs[seat] = ctxStudent;
  }

  /**
   * Removes the video element of a user that is not present anymore.
   * @param {number} seat the seat of the student to be removed
   */
  function removeVideoElement(seat) {
    if (seat == -2 || seat == -1) {
      return;
    }
    if (seat == 0) {
      sources[0] = undefined;
      ctxStreams[0] = undefined;
      canvasWebcams[0] = undefined;
      return;
    }
    try {
      const toBeRemoved = document.getElementById('Student' + seat);
      const toBeRemoved2 = document.getElementById('StudentStream' + seat);
      const toBeRemoved3 = document.getElementById('StudentCtx' + seat);

      toBeRemoved.parentNode.removeChild(toBeRemoved);
      toBeRemoved2.parentNode.removeChild(toBeRemoved2);
      toBeRemoved3.parentNode.removeChild(toBeRemoved3);
    } catch (error) {
      console.error(error);
    }
    try {
      scene.remove(students[seat]);
      students[seat] = undefined;
      sources[seat] = undefined;
      textures[seat] = undefined;
      ctxs[seat] = undefined;
      rotations[seat] = undefined;
      ctxStreams[seat] = undefined;
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Creates a new connection with a user.
   *
   * @param {string} id - id of the new user
   * @param {number} seat - seat of the new user
   * @return {Object} the peer created
   */
  function createNewpeer(id, seat) {
    let newPeer;
    context1.clearRect(0, 0, 500, 500);
    context1.fillText('Someone New', 0, 60);
    // One peer needs to be the initiator, herefor the seat is used
    // since two users can't have the same seat if they connect.
    if (seat > selectedPosition || seat == -1) {
      newPeer = new SimplePeer({initiator: true});
    } else {
      newPeer = new SimplePeer();
    }
    newPeer.on('data', (data) => {
      // got a data channel message
      const string = utf8ArrayToStr(data);
      switch (string) {
        case 'streamId received':
          // Used when 2D video was used for background removal.
          newPeer.addStream(teacherStreamRemovedBackground);
          break;
        case 'screenShareId Received':
          // Peer has received the id of the screenshare video. Now we can send it.
          newPeer.addStream(teacherProjectorScreenShare);
          break;
        default:
          if (string.includes(' ')) {
            splitted = string.split(' ');
            switch (splitted[0]) {
              case 'mute':
                // If the coneInnerAngle is 0 the sound is not send into any direction.
                // This is used for the directional audio.
                panners[splitted[1]].coneInnerAngle = 0;
                break;
              case 'unmute':
                panners[splitted[1]].coneInnerAngle = 360;
                break;
            }
          } else {
            removedBackgroundStream = string;
            newPeer.send('streamId received');
          }
      }
    });
    newPeer.on('signal', (data) => {
      socket.emit('signal', id, data);
    });
    newPeer.on('stream', (stream) => {
      if (seat == -5) {
        // peer is the teacher
        if (selectedPosition == -7) {
          // selectedPosition -7 -> you are the slides player.
          // adding the screen share to the page.
          document.getElementById('screenSharePlayer').srcObject = stream;
          document.getElementById('screenSharePlayer').play();
        } else {
          // You are the projector.
          const video = document.getElementById('lidarVideoStream1');

          video.srcObject = stream;
          video.onloadedmetadata = function(e) {
            video.play();
            video.muted = true;
          };

          // Add delay into audio.
          const audioCtx = new AudioContext();
          const source = audioCtx.createMediaStreamSource(stream);

          delayNode = audioCtx.createDelay();
          delayNode.delayTime.value = 0.5;

          source.connect(delayNode);
          delayNode.connect(audioCtx.destination);
          document.getElementById('buttonGroup').style.display = 'block';
        }
      } else {
        if (seat == -6) {
          // peer is the projector
          switch (stream.id) {
            case removedBackgroundStream:
              document.getElementById('projectorInput').srcObject = stream;
              document.getElementById('lidarVideoStream1').muted = true;
              document.getElementById('lidarVideoStream1').style.position = 'absolute';
              document.getElementById('lidarVideoStream1').style.display = 'block';
              break;
            default:
              document.getElementById('projectorInput').srcObject = stream;
              document.getElementById('projectorInput').style.display = 'block';
              document.getElementById('projectorInput').onresize = function() {
                const videoWidth = document.getElementById('projectorInput').width;
                document.getElementById('projectorInput').style.left = 'calc((100% - ' + videoWidth + '%) / 2)';
              };
              break;
          }
        } else {
          // Peer is an student in the environment.
          addVideoElement(id, stream, seat);
          start3DAudioUser(seat, stream);
        }
      }
    });
    // Just connected to new peer.
    newPeer.on('connect', () => {
      // seat -7 means the peer is the slide player.
      if (seat == -7) {
        if (teacherProjectorScreenShare != undefined && selectedPosition != -6) {
          // You are the teacher
          newPeer.addStream(teacherProjectorScreenShare);
        }
      }
      // selected position == -6 means you are the projector
      if (selectedPosition == -6) {
        if (document.getElementById('webcam').srcObject != undefined) {
          // Send stream of projector side to the teacher.
          newPeer.addStream(document.getElementById('webcam').srcObject);
        }
      }
      console.log('Connected!');
      if (positionalHearing) {
        // Positional hearing makes only people you are turning towards can hear you.
        activeconnections.forEach((connection) => {
          if (unmutedSeats.includes(connection.seat) && connection.seat != 0 &! isTeacher) {
            // send message to people that you are turned towards that they need to unmute you.
            connection.peerObject.send(String('unmute ' + selectedPosition));
          }
        });
        const mutedPositions = [1, 2, 3, 4, 5];
        unmutedSeats.forEach((seat) => {
          const index = mutedPositions.indexOf(seat);
          if (index > -1) {
            // Remove users that are in the unmuted list from the mute list.
            mutedPositions.splice(index, 1);
          }
        });
        activeconnections.forEach((connection) => {
          if (mutedPositions.includes(parseInt(connection.seat)) && connection.seat != 0 &! isTeacher) {
            // Send message to people that are on the mute list that they need to mute you.
            connection.peerObject.send(String('mute ' + selectedPosition));
          }
        });
        setPositionalHearing(rotationNow);
      }
    });

    newPeer.on('error', (err) => {
      console.log('error with teacherPeer: ', err);
    });
    newPeer.on('close', () => {
      newPeer.destroy();
    });

    // if table is -4 it is the projector or teacher
    if (table == -4 && (typeof teacherStream) !== 'undefined') {
      if (seat != -7) {
        // If the peer is not the slide shower then send your audio.
        if (localMediaStreamWebcam.getAudioTracks()[0] != undefined) {
          teacherStream.addTrack(localMediaStreamWebcam.getAudioTracks()[0]);
        }
        newPeer.addStream(teacherStream);
      }
    }
    if ((!isTeacher) && !(seat < 0) && table != -4) {
      // You are a student
      outputStream.addTrack(localMediaStreamWebcam.getAudioTracks()[0]);
      newPeer.addStream(outputStream);
    }
    if (seat == -1) {
      // You are using the speaker function.
      const speakerStream = new MediaStream();
      speakerStream.addTrack(localMediaStreamWebcam.getAudioTracks()[0]);
      newPeer.addStream(speakerStream);
    }
    return newPeer;
  };

  /**
   * Adds connections of new users and removes connections
   * of old users that are not active anymore.
   *
   * @param {*} connlist - List with the active connections
   */
  function updateactiveconnections(connlist) {
    connlist.forEach((id) => {
      // create new connections
      if (!activeconnections.has(id.id) && id.id != socket.id) {
        console.log('creating new peer: ' + id.id + ', on seat: ' + id.seat);
        p = {connected: false, peerObject: null,
          idConnectedTo: id.id, seat: id.seat};
        activeconnections.set(id.id, p);
        const p2 = createNewpeer(id.id, id.seat);
        activeconnections.get(id.id).peerObject = p2;
      };
    });
    Array.from(activeconnections.keys()).forEach((id) => {
      if (!(connlistIncludes(connlist, id)) &&
          activeconnections.get(id).seat >= 0) {
        // remove ones who aren't there anymore
        removeVideoElement(activeconnections.get(id).seat);
        activeconnections.get(id).peerObject.destroy();
        activeconnections.delete(id);
        console.log('Peer destroyed');
      };
    });
  };

  /**
   * Whether or not a connlist includes an ID.
   *
   * @param {*} connlist - list with active connections
   * @param {string} id - id that needs to be checked
   * @return {Boolean} whether or not the list contains the id
   */
  function connlistIncludes(connlist, id) {
    for (let i = 0; i != connlist.length; i++) {
      if (connlist[i].id == id) {
        return true;
      }
    }
    return false;
  }

  // Sends the rotation if the user has rotated.
  setInterval(function() {
    if (rotationNow != lastRotation && socket.connected) {
      socket.emit('rotated', selectedPosition, rotationNow);
      setPositionalHearing(rotationNow);
      lastRotation = rotationNow;

      update3DAudioPosition();
    }
  }, 1000/10);

  socket.on('speaker done', (id) => {
    // Delete the connection the teacher had with the speaker.
    if (isTeacher) {
      activeconnections.get(id).peerObject.destroy();
      activeconnections.delete(id);
    }
  });

  socket.on('speaker', (id, name) => {
    lastNoti = Date.now();
    // Show notification that the speaker is speaking
    document.getElementById('notiText').innerHTML = name + ' is speaking!';
    document.getElementById('notification').style.display='block';
    // If there has been no new notification for 4.5 seconds then the notification div goes away.
    setTimeout(function() {
      if (Date.now() - lastNoti > 4500) {
        document.getElementById('notification').style.display='none';
      }
    }, 5000);
    // If you are the teacher you will create a connection with the speaker.
    if (isTeacher) {
      p = {connected: false, peerObject: createNewpeer(id, -2),
        idConnectedTo: id, seat: -2};
      activeconnections.set(id, p);
    }
  });

  // Connect to the teacher as speaker.
  socket.on('connect to teacher', (id) => {
    teacherSocket = id;
    p = {connected: false, peerObject: createNewpeer(id, -1),
      idConnectedTo: id, seat: -1};
    activeconnections.set(id, p);
  });

  // Notify that the user has been connected to the teacher.
  socket.on('request accepted', () => {
    document.getElementById('notiText').innerHTML =
      'You are connected.';
    document.getElementById('notification').style.display = 'block';
    // If there has been no new notification for 4.5 seconds then the notification div goes away.
    setTimeout(function() {
      document.getElementById('notification').style.display = 'none';
    }, 5000);
  });

  // Notify the user that its request to use the speaker function is denied.
  socket.on('request denied', () => {
    document.getElementById('notiText').innerHTML =
      'Request rejected! Teacher is probably not found.';
    document.getElementById('notification').style.display = 'block';
    // If there has been no new notification for 4.5 seconds then the notification div goes away.
    setTimeout(function() {
      document.getElementById('notification').style.display = 'none';
    }, 5000);

    const soundIcon = document.getElementById('soundIcon');
    const speakIcon = document.getElementById('speakIcon');
    speakIcon.style.display = 'block';
    soundIcon.style.display = 'none';
  });

  socket.on('speaking disconnected', () => {
    const soundIcon = document.getElementById('soundIcon');
    const speakIcon = document.getElementById('speakIcon');
    speakIcon.style.display = 'block';
    soundIcon.style.display = 'none';
  });

  socket.on('connections-list', (connlist) => {
    updateactiveconnections(connlist);
  });

  /**
   * Used to make a connection.
   * keeps the received signal in a promise in case
   * the local peer hasn't had time to initialize yet
   *
   * @param {String} id the id to get signal from
   * @param {*} data the data that was sent
   * @return {null} nothing
   */
  function sendSignal(id, data) {
    return new Promise(function(resolve) {
      let counter = 0;
      const interval = window.setInterval(function() {
        if (activeconnections.has(id)) {
          if (activeconnections.get(id).peerObject != null) {
            activeconnections.get(id).peerObject.signal(data);
            resolve();
            clearInterval(interval);
          }
        }
        counter++;
        if (counter > 10) {
          console.log('Could not make connection');
          resolve();
          clearInterval(interval);
        }
      }, 1000);
    });
  };
  socket.on('signal', (id, data) => {
    sendSignal(id, data);
  });


  socket.on('rotate', (seat, rotation, tableRotate) => {
    // A user has rotated. If the user is in your table it will rotate in the environment.
    if (tableRotate == table) {
      rotations[seat] = rotation;
    }
  });

  socket.on('update-connections', () => {
    // Send back list of connected people.
    socket.emit('query-connections');
  });

  socket.on('teacher-stream-emitter-signal', (data) => {
    // Receive the video streams from a teacher
    teacherPeer.signal(data);
  });

  // Keep track of the tracks received.
  socket.on('teacher-presence', () => {
    socket.emit('teacher-stream-consumer-connect');

    // Establish new Peer connection with the server. This will be used to receive streams from the teacher.
    teacherPeer = new SimplePeer({initiator: true});

    teacherPeer.on('signal', (data) => {
      socket.emit('teacher-stream-consumer-signal', data);
    });

    teacherPeer.on('stream', (stream) => {
      teacherIncomingMediaStream = stream;
      // Set video element to be the stream depending on its ID
      const sid = stream.id;
      if (servRtcStrmsLidars.includes(sid)) {
        if (stream.id == 'depthstream') {
          depthStream = stream;
        } else {
          imageStream = stream;
        }
        // if it's a lidar stream, figure out which one it is and
        // add to the right element

        // selected position == -6 -> user is the projector
        if (selectedPosition == -6) {
          if (stream.id == 'videostream') {
            document.getElementById('teacher').srcObject = stream;
          }
        } else {
          const videoToAdd = document.getElementById(servRtcStrms.get(sid));
          videoToAdd.srcObject = stream;
          videoToAdd.play();
          if (table == -2) {
            // Table == -2 means the user is recording.
            start3DRecording();
          }
        }
      }
      if (servRtcStrmsScrnsh.includes(sid)) {
        screenShareStream = stream;
        if (table == -1) {
          teacherSound = stream.getAudioTracks()[0];
          startMediaRecorder();
        }
        // if it's a screenshare stream, add to the right element
        addScreenShare(stream, false);
        document.getElementById('teacherAudio').src = stream.getAudioTracks()[0];
        document.getElementById('audioElem').play();

        if (table == -2) {
          start3DRecording();
        }
        start3DAudioUser(0, stream);
      }
      // if (table == -4 && document.getElementById('lidarVideoStream1').srcObject !=
      //    undefined && document.getElementById('lidarVideoStream2').srcObject != undefined) {
      //   removeBackgroundWithDepth();

      // }
      // if (sid == 'webcamstream') {
      //   webcamStream = stream;
      //   cameraMesh.start();
      //   document.getElementById('webcamVid').srcObject = stream;
      //   console.log('set it correctly');
      //   teacherWebcamOn = true;
      // }
    });

    teacherPeer.on('track', (track, stream) => {
      teacherTracks.push(track);
    });

    teacherPeer.on('connect', () => {
      // Connection established.
      // if we are the teacher, we send our screenshare to
      // the server, so it can be broadcast to students
      if (teacher && localMediaStream.getAudioTracks()[0] != undefined) {
        // localMediaStream.getAudioTracks()[0].enabled = true;
        teacherPeer.addStream(localMediaStream);
      }
      // Add the webam of the teacher for the face mesh if there is one.
      // console.log(localMediaStreamWebcam);
      // if (teacher && localMediaStreamWebcam != null) {
      //   const faceStream = new MediaStream();
      //   faceStream.addTrack(localMediaStreamWebcam.getVideoTracks()[0]);
      //   teacherPeer.addStream(faceStream);
      // }
    });
    teacherPeer.on('error', (err) => {
      console.log('error with teacherPeer: ', err);
      // console.log('attempting to reconnect to server...');
      // teacherPeer.destroy();
      // socket.emit('browser-ask-to-reconnect-webrtc');
      // teacherPeer = null;
    });
    teacherPeer.on('close', () => {
      teacherPeer.destroy();
      // socket.emit('browser-ask-to-reconnect-webrtc');
      teacherPeer = null;
    });
  });

  // Announce yourself to the serve.
  socket.emit('announce', {
    selectedPosition,
    userId: UNIQUE_USER_ID,
    teacher: isTeacher,
    classroomId: userClassroomId,
    name,
    table,
  });
  socket.emit('query-connections');
}

/**
   * Adds screen sharing to the environment.
   * @param {MediaStream} stream the stream to share.
   * @param {boolean} replay if in a replay or not.
   */
function addScreenShare(stream, replay) {
  const screenshareScreen = document.getElementById('screenshare');
  screenshareScreen.muted = true;
  if (replay) {
    screenshareScreen.src = stream;
  } else {
    screenshareScreen.srcObject = stream;
  }

  // Adds the screenshare in the Environment.
  mapScreen = new THREE.VideoTexture(screenshareScreen);

  const geometry2 = new THREE.PlaneGeometry(48, 24);
  const me2 = new THREE.Mesh( geometry2, new THREE.MeshPhongMaterial( {
    color: 'white',
    map: mapScreen,
    alphaTest: 0.5,
    transparent: true,
    side: THREE.DoubleSide,
  }));
  me2.rotation.y = Math.PI;
  scene.add( me2 );
  objects.push( me2 );
}
