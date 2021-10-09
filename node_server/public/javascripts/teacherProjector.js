/* eslint-disable no-unused-vars */
isTeacher = false;
table = -4;
selectedPosition = -5;
removedBackgroundStream = '';
// eslint-disable-next-line no-unused-vars
const UNIQUE_USER_ID = Math.random().toString(36).substring(7);
userClassroomId = 'defaultClassroom';
let rotate = 'right';
getCamerasAndMics();
document.getElementById('camText').style.display = 'block';
document.getElementById('micText').style.display = 'block';
document.getElementById('selectMic').style.display = 'block';
document.getElementById('select').style.display = 'block';

let teacherProjectorScreenShare = undefined;

/**
 * starts sending the vid.
 */
function startProjecting() {
  document.getElementById('selectMic').style.display = 'none';
  document.getElementById('select').style.display = 'none';
  document.getElementById('camText').style.display = 'none';
  document.getElementById('micText').style.display = 'none';
  document.getElementById('webcam').style.display = 'none';


  document.getElementById('logInButton').style.display = 'none';
  startConnecting(false, 'teacherProjector');
}

/**
 * Rotates the video of the teacher.
 */
function rotateSelfView() {
  const selfView = document.getElementById('selfView');
  const currentClass = selfView.classList[0];
  selfView.classList.remove(currentClass);
  switch (currentClass) {
    case 'rotateRight':
      selfView.classList.add('rotateDown');
      break;
    case 'rotateDown':
      selfView.classList.add('rotateLeft');
      break;
    case 'rotateLeft':
      selfView.classList.add('rotateUp');
      break;
    case 'rotateUp':
      selfView.classList.add('rotateRight');
      break;
  }
}

/**
 * Sets the chosen camera.
 * @param {boolean} inLecture if the user is in a lecture or not.
 * @param {string} deviceId id of the chosen device.
 */
function cameraChosenRotated(inLecture, deviceId) {
  if (!inLecture) {
    webcam.style.display = 'block';
  }
  const videoConstraints = {};
  stopMediaTrackVideo(webcam.srcObject);
  if (inLecture) {
    videoConstraints.deviceId = {exact: deviceId.id,
      width: {ideal: 2048},
      height: {ideal: 1080},
    };
  } else {
    videoConstraints.deviceId = {exact: select.value,
      width: {ideal: 2048},
      height: {ideal: 1080},
    };
  }
  navigator.mediaDevices.getUserMedia({audio: false, video: videoConstraints})
      .then((stream) => {
        if (webcam.srcObject == null || webcam.srcObject == undefined) {
          webcam.srcObject = stream;
          localMediaStreamWebcam = stream;
        } else {
          stopMediaTrackVideo(localMediaStreamWebcam);
          webcam.srcObject.addTrack(stream.getVideoTracks()[0]);
          localMediaStreamWebcam.addTrack(stream.getVideoTracks()[0]);
        }
        document.getElementById('webcam').style.marginTop = 50 + document.getElementById('webcam').width + 'px';
      });
  if (inLecture) {
    document.getElementById('selectCamInLecture').style.display = 'none';
  }
}

// eslint-disable-next-line require-jsdoc
async function startScreenShare() {
  if (teacherProjectorScreenShare != undefined) {
    teacherProjectorScreenShare.getTracks().forEach(function(track) {
      track.stop();
    });
  }
  const displayMediaOptions = {
    video: {
      cursor: 'always',
      width: {ideal: 4096},
      height: {ideal: 2160},
    },
    audio: false,
  };
  await navigator.mediaDevices.getDisplayMedia(displayMediaOptions)
      .then(function(stream) {
        teacherProjectorScreenShare = stream;
      });
  document.getElementById('screenShareOption').innerHTML = 'Update ScreenShare';
  activeconnections.forEach((connection) => {
    if (connection.seat == -7) {
      connection.peerObject.addStream(teacherProjectorScreenShare);
    }
  });
}

// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line require-jsdoc
function utf8ArrayToStr(array) {
  let out; let i; let len; let c;
  let char2; let char3;

  out = '';
  // eslint-disable-next-line prefer-const
  len = array.length;
  i = 0;
  while (i < len) {
    c = array[i++];
    switch (c >> 4) {
      case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
      // 0xxxxxxx
        out += String.fromCharCode(c);
        break;
      case 12: case 13:
        // 110x xxxx   10xx xxxx
        char2 = array[i++];
        out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
        break;
      case 14:
        // 1110 xxxx  10xx xxxx  10xx xxxx
        char2 = array[i++];
        char3 = array[i++];
        out += String.fromCharCode(((c & 0x0F) << 12) |
                     ((char2 & 0x3F) << 6) |
                     ((char3 & 0x3F) << 0));
        break;
    }
  }

  return out;
}
