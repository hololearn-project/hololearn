/* eslint-disable no-unused-vars */
isTeacher = false;
table = -4;
selectedPosition = -5;
removedBackgroundStream = '';
// eslint-disable-next-line no-unused-vars
const UNIQUE_USER_ID = Math.random().toString(36).substring(7);
userClassroomId = 'defaultClassroom';
let rotate = 'right';
getMics();
document.getElementById('micText').style.display = 'block';
document.getElementById('selectMic').style.display = 'block';
document.getElementById('buttonGroup').style.width = '60px';
document.getElementById('buttonGroup').style.marginLeft = 'calc((100% - 60px) / 2)';

let teacherProjectorScreenShare = undefined;

/**
 * starts sending the vid.
 */
function startProjecting() {
  document.getElementById('input_video').srcObject = localMediaStreamWebcam;
  webcam.muted = true;
  document.getElementById('selectMic').style.display = 'none';
  document.getElementById('micText').style.display = 'none';
  document.getElementById('webcam').style.display = 'none';
  document.getElementById('buttonGroup').style.display = 'block';

  document.getElementById('logInButton').style.display = 'none';
  teacherStream = document.getElementById('output_canvas').captureStream(25);
  teacherStream.addTrack(webcam.srcObject.getAudioTracks()[0]);
  document.getElementById('selfView').srcObject = teacherStream;

  // eslint-disable-next-line max-len
  if (document.getElementById('selfView').classList[0] == 'rotateLeft' || document.getElementById('selfView').classList[0] == 'rotateRight') {
    const ratio = 1280 / 720;
    document.getElementById('selfView').style.right = 10 - (ratio * 300 - 300) / 2;
    document.getElementById('selfView').style.bottom = 10 + (ratio * 300 - 300) / 2;
  } else {
    document.getElementById('selfView').style.right = 10;
    document.getElementById('selfView').style.bottom = 10;
  }

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

  // eslint-disable-next-line max-len
  if (document.getElementById('selfView').classList[0] == 'rotateLeft' || document.getElementById('selfView').classList[0] == 'rotateRight') {
    const ratio = 1280 / 720;
    document.getElementById('selfView').style.right = 10 - (ratio * 300 - 300) / 2;
    document.getElementById('selfView').style.bottom = 10 + (ratio * 300 - 300) / 2;
  } else {
    document.getElementById('selfView').style.right = 10;
    document.getElementById('selfView').style.bottom = 10;
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
  const videoConstraints = {
    width: {ideal: 1080},
    height: {ideal: 720},
  };
  stopMediaTrackVideo(webcam.srcObject);
  if (inLecture) {
    videoConstraints.deviceId = {exact: deviceId.id,
    };
  } else {
    videoConstraints.deviceId = {exact: select.value,
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
        document.getElementById('webcam').addEventListener('playing', () => {
          // eslint-disable-next-line max-len
          document.getElementById('seperationDiv').style.height = document.getElementById('webcam').videoWidth - document.getElementById('webcam').videoHeight;
        });
      });
  if (inLecture) {
    document.getElementById('selectCamInLecture').style.display = 'none';
  }
}

// eslint-disable-next-line require-jsdoc
async function startScreenShare() {
  const displayMediaOptions = {
    video: {
      width: {ideal: 3840},
      height: {ideal: 2160},
      cursor: 'always',
    },
    audio: false,
  };
  await navigator.mediaDevices.getDisplayMedia(displayMediaOptions)
      .then(function(stream) {
        if (teacherProjectorScreenShare != undefined) {
          teacherProjectorScreenShare.getTracks().forEach(function(track) {
            track.stop();
          });
        }
        teacherProjectorScreenShare = stream;
      });
  document.getElementById('screenShareOption').innerHTML = 'Update ScreenShare';
  activeconnections.forEach((connection) => {
    if (connection.seat == -7) {
      connection.peerObject.addStream(teacherProjectorScreenShare);
    }
  });
  screenShareStream = teacherProjectorScreenShare;
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

const rangeSlider = document.getElementById('rs-range-line');
const rangeBullet = document.getElementById('rs-bullet');

rangeSlider.addEventListener('input', showSliderValue, false);

/**
 * shows slider value on the screen
 */
function showSliderValue() {
  rangeBullet.innerHTML = rangeSlider.value + '%';
  const bulletPosition = (rangeSlider.value /rangeSlider.max);
  rangeBullet.style.left = (bulletPosition * 578) + 'px';
}

document.getElementById('container').style.display = 'block';

/**
 * Changes the cut out distance on python side.
 */
function pointChange() {
  console.log('pointChange');
  newPoint = document.getElementById('rs-range-line').value;
  socket.emit('pointChange', newPoint);
}

