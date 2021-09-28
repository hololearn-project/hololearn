// const e = require("cors");
// eslint-disable-next-line no-unused-vars
let teacherSocket = '';
let teacherPeer = null;
const activeconnections = new Map();

let lastRotation = 0;
// eslint-disable-next-line prefer-const
let rotationNow = 0;
let socket = null;
let newUser = true;
let lastNoti = '';

socket = io.connect(window.location.origin);

socket.emit('getUsers');

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


socket.on('users', (users) => {
  const options = document.getElementsByName('room');
  const roomsFilled = [];
  for (let i = 0; i < options.length; i++) {
    roomsFilled.push(0);
  }
  users.forEach((user) => {
    if (user.seat != 0) {
      roomsFilled[user.table - 1]++;
    }
  });
  options.forEach((option) => {
    const text = option.value + ':   ' +
        roomsFilled[option.value - 1] + '/' + (positions.length - 1);
    option.innerHTML = text;
  });
});

socket.on('userSeats', (seats) => {
  for (let i = 0; i < seats.length; i++) {
    if (!seats[i].seat <= 0) {
      const elemId = 'Seat' + seats[i].seat;
      document.getElementById(elemId).style.border = 'solid rgb(255, 0, 0)';
      const tag = document.createElement('p');
      let name = seats[i].name.substring(0, 5);
      if (seats[i].name.length > 5) {
        name = name + '...';
        tag.style.fontSize = '15px';
      }
      const text = document.createTextNode(name);
      tag.appendChild(text);
      const element = document.getElementById(elemId);
      element.innerHTML = '';
      element.appendChild(tag);
    }
  }
});

socket.on('seat taken', () => {
  alert('seat already taken');
  location.reload();
});

/**
 * Start the connection to the server.
 *
 * @param {Object} teacher the teacher to connect to
 * @param {String} name the name of the user
 */
// eslint-disable-next-line no-unused-vars, require-jsdoc
function startConnecting(teacher, name) {
  // const peerConfig = {iceServers: [
  //   {urls: ["stun:stun.l.google.com:19302"]}]};

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

    if (isTeacher) {
      stream.getAudioTracks()[0].enabled = false;
    }

    a = positions[seat].a;
    b = positions[seat].b;
    c = positions[seat].c;
    // Add canvas element to display student on.
    const student = document.createElement('CANVAS');
    student.setAttribute('id', 'Student' + seat);
    student.style.display = 'none';
    student.width = 500;
    student.height = 500;
    const studentsDiv = document.querySelector('#students');
    studentsDiv.appendChild(student);

    const studentStream = document.createElement('VIDEO');
    studentStream.srcObject = stream;
    studentStream.setAttribute('id', 'StudentStream' + seat);
    studentStream.style.display = 'none';
    studentStream.width = 500;
    studentStream.height = 500;
    studentsDiv.appendChild(studentStream);

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
   * creates a new connection with a user
   *
   * @param {string} id - id of the new user
   * @param {number} seat - seat of the new user
   * @return {Object} the peer created
   */
  function createNewpeer(id, seat) {
    // let newPeer = new SimplePeer({ initiator: true, config: peerConfig });
    let newPeer;
    if (seat > selectedPosition || seat == -1) {
      newPeer = new SimplePeer({initiator: true});
    } else {
      newPeer = new SimplePeer();
    }
    newPeer.on('signal', (data) => {
      socket.emit('signal', id, data);
    });
    newPeer.on('stream', (stream) => {
      // peer is projector
      if (seat == -5) {
        document.getElementsByClassName('input_video')[0].srcObject = stream;
      } else {
        if (seat == -6) {
          // peer is the projector
          console.log(stream);
          document.getElementById('projectorInput').srcObject = stream;
          document.getElementById('projectorInput').style.display = 'block';
          document.getElementById('projectorInput').onresize = function() {
            const videoWidth = document.getElementById('projectorInput').width;
            document.getElementById('projectorInput').style.left = 'calc((100% - ' + videoWidth + '%) / 2)';
          };
        } else {
          addVideoElement(id, stream, seat);
        }
      }
      // make async broadcast call
    });
    newPeer.on('connect', () => {
      console.log('Connected!');
    });
    newPeer.on('error', (err) => {
      console.log('error with teacherPeer: ', err);
    });
    newPeer.on('close', () => {
      newPeer.destroy();
      // if(errorCounter < N_RECONNECT_TO_PEER_ATTEMPTS) {
      //     createNewpeer(id, seat);
      // }
      // errorCounter = errorCounter + 1;
    });
    // if table is -4 it is the projector or teacher
    if (table == -4 && (typeof localMediaStreamWebcam) !== 'undefined') {
      console.log('adding stream');
      newPeer.addStream(localMediaStreamWebcam);
    }
    if ((!isTeacher) && !(seat < 0) && table != -4) {
      outputStream.addTrack(localMediaStreamWebcam.getAudioTracks()[0]);
      newPeer.addStream(outputStream);
    }
    if (seat == -1) {
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
    connlist.forEach((id) => { // create new connections
      if (!activeconnections.has(id.id) && id.id != socket.id) {
        console.log('creating new peer: ' + id.id + ', on seat: ' + id.seat);
        p = {connected: false, peerObject: null,
          idConnectedTo: id.id, seat: id.seat};
        activeconnections.set(id.id, p);
        const p2 = createNewpeer(id.id, id.seat);
        activeconnections.get(id.id).peerObject = p2;
      };
    });
    if (newUser) {
      newUser = false;
    }
    Array.from(activeconnections.keys()).forEach((id) => {
      if (!(connlistIncludes(connlist, id)) &&
          activeconnections.get(id).seat >= 0) {
        console.log('Peer destroyed'); // remove ones who aren't there anymore
        removeVideoElement(activeconnections.get(id).seat);
        activeconnections.get(id).peerObject.destroy();
        activeconnections.delete(id);
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
  // /**
  //  * Tells the server we are still here
  //  */
  // function ping() {
  //     socket.emit("ping");
  // };

  socket.on('attendanceList', (list) => {
    list.forEach((user) => {
      addStudentToList(user.name, user.table, user.seat);
    });
  });

  // Sends the rotation if the user has rotated.
  setInterval(function() {
    if (rotationNow != lastRotation && socket.connected) {
      socket.emit('rotated', selectedPosition, rotationNow);
      lastRotation = rotationNow;
    }
  }, 1000/10);

  socket.on('speaker done', (id) => {
    if (isTeacher) {
      activeconnections.get(id).peerObject.destroy();
      activeconnections.delete(id);
    }
  });

  socket.on('speaker', (id, name) => {
    lastNoti = Date.now();
    document.getElementById('notiText').innerHTML = name + ' is speaking!';
    document.getElementById('notification').style.display='block';
    setTimeout(function() {
      if (Date.now() - lastNoti > 4500) {
        document.getElementById('notification').style.display='none';
      }
    }, 5000);
    if (isTeacher) {
      p = {connected: false, peerObject: createNewpeer(id, -2),
        idConnectedTo: id, seat: -2};
      activeconnections.set(id, p);
    }
  });

  socket.on('connect to teacher', (id) => {
    teacherSocket = id;
    p = {connected: false, peerObject: createNewpeer(id, -1),
      idConnectedTo: id, seat: -1};
    activeconnections.set(id, p);
  });

  socket.on('request accepted', () => {
    document.getElementById('notiText').innerHTML =
      'You are connected.';
    document.getElementById('notification').style.display = 'block';
    setTimeout(function() {
      document.getElementById('notification').style.display = 'none';
    }, 5000);
  });

  socket.on('request denied', () => {
    document.getElementById('notiText').innerHTML =
      'Request rejected! Teacher is probably not found.';
    document.getElementById('notification').style.display = 'block';
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
    // broadcasttoall();
  });

  /**
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
    // Perform seat rotation.
    if (tableRotate == table) {
      rotations[seat] = rotation;
    }
  });

  socket.on('update-connections', () => {
    // Send back list of connected people.
    socket.emit('query-connections');
  });
  socket.on('new message', (msg, name) => {
    if (nameUser != name) {
      appendMessage(name, userImage, 'left', msg);
      messageAlert();
    }
  });

  socket.on('teacher-stream-emitter-signal', (data) => {
    // Receive the video streams from a teacher
    teacherPeer.signal(data);
  });

  // Keep track of the tracks received.
  socket.on('teacher-presence', () => {
    socket.emit('teacher-stream-consumer-connect');

    // Establish new Peer connection with the server.
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
        const videoToAdd = document.getElementById(servRtcStrms.get(sid));
        videoToAdd.srcObject = stream;
        videoToAdd.play();
        if (table == -2) {
          start3DRecording();
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

        if (table == -2) {
          start3DRecording();
        }
      }
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
  // video.srcObject = stream
  // sources[0] = video
  // ctxStreams[0] = ctx2
  // canvasWebcams[0] = canvas
  const screenshareScreen = document.getElementById('screenshare');
  if (table != -1) {
    screenshareScreen.muted = false;
  }
  if (replay) {
    screenshareScreen.src = stream;
  } else {
    screenshareScreen.srcObject = stream;
  }


  mapScreen = new THREE.VideoTexture(screenshareScreen);


  const geometry2 = new THREE.PlaneGeometry(48, 24);
  const me2 = new THREE.Mesh( geometry2, new THREE.MeshPhongMaterial( {
    color: 'white',
    map: mapScreen,
    alphaTest: 0.5,
    transparent: true,
    side: THREE.DoubleSide,
  }));
  me2.position.set( 0, 16, 32);
  me2.rotation.y = Math.PI;
  scene.add( me2 );
  objects.push( me2 );
}
