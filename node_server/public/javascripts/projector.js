/* eslint-disable no-unused-vars */

table = -4;
selectedPosition = -6;
// eslint-disable-next-line no-unused-vars
const UNIQUE_USER_ID = Math.random().toString(36).substring(7);
isTeacher = false;
userClassroomId = 'defaultClassroom';
// eslint-disable-next-line prefer-const
let teacherProjectorPeer = undefined;
// eslint-disable-next-line prefer-const
let chatConnected = false;
// eslint-disable-next-line prefer-const
let removedBackgroundId = undefined;

document.getElementById('teacher').style.width = window.innerWidth * 0.9;
document.getElementById('teacher').style.marginLeft = window.innerWidth * 0.05;

getCamerasAndMics();
document.getElementById('camText').style.display = 'block';
document.getElementById('micText').style.display = 'block';
// document.getElementById('selectMic').style.display = 'block';
// document.getElementById('select').style.display = 'block';

/**
 * starts sending the vid.
 */
function startProjecting() {
  if (document.getElementById('input') != null) {
    document.getElementById('input').style.display = 'none';
  }
  document.getElementById('select').style.display = 'none';
  document.getElementById('selectMic').style.display = 'none';
  document.getElementById('camText').style.display = 'none';
  document.getElementById('micText').style.display = 'none';

  // document.getElementById('webcam').style.display = 'none';
  document.getElementById('webcam').muted = true;

  // Create self-view
  if (document.getElementById('webcam').srcObject != undefined) {
    const webcamWidth = document.getElementById('webcam').srcObject.getVideoTracks()[0].getSettings().width;
    const webcamHeight = document.getElementById('webcam').srcObject.getVideoTracks()[0].getSettings().height;

    if (webcamWidth > webcamHeight) {
      document.getElementById('webcam').width = 200;
    } else {
      document.getElementById('webcam').height = 200;
    }
  }


  document.getElementById('webcam').style.position = 'absolute';
  document.getElementById('webcam').style.right = '20px';
  document.getElementById('webcam').style.bottom = '20px';


  document.getElementById('logInButton').style.display = 'none';
  document.getElementById('replayButton').style.display = 'none';
  document.getElementById('body').style.background = 'black';

  startConnecting(false, 'projector');
}

/**
 * sends the id of the teachers stream so they can identify.
 */
function sendStreamId() {
  if (teacherProjectorPeer != undefined && chatConnected) {
    teacherProjectorPeer.send(removedBackgroundId);
  }
}

/**
 * rotates the teacher 90 degrees to the right.
 */
function rotateTeacher() {
  const output = document.getElementById('teacher');
  const currentClass = output.classList[0];
  output.classList.remove(currentClass);
  switch (currentClass) {
    case 'rotateRight':
      output.classList.add('rotateDown');
      output.width = window.screen.height*0.9;
      break;
    case 'rotateDown':
      output.classList.add('rotateLeft');
      output.height = window.screen.width*0.9;
      break;
    case 'rotateLeft':
      output.classList.add('rotateUp');
      output.width = window.screen.height*0.9;
      break;
    case 'rotateUp':
      output.classList.add('rotateRight');
      output.height = window.screen.width*0.9;
      break;
  }
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

/**
 * hides the input if not hidden and vice versa.
 */
function hideShowInput() {
  if (document.getElementById('input') == null) return;
  if (document.getElementById('input').style.display == 'none') {
    document.getElementById('input').style.display = 'block';
  } else {
    document.getElementById('input').style.display = 'none';
  }
}

/**
 * Removes the background of the teacher with both lidar streams.
 */
async function removeBackgroundWithDepth() {
  // console.log('In the loop')
  requestAnimationFrame( removeBackgroundWithDepth );
  pictureCtx.drawImage(document.getElementById('lidarVideoStream1'),
      0, 0, 400, 540);
  depthCtx.drawImage(document.getElementById('lidarVideoStream2'),
      0, 0, 400, 540);

  const pictureData = await pictureCtx.getImageData(0,
      0, 400, 540);
  const temp = pictureData;
  const depthData = await depthCtx.getImageData(0,
      0, 400, 540);

  for (let i = 0; i < pictureData.data.length; i = i + 4) {
    if (depthData.data[i+2] > 230) {
      pictureData.data[i + 3] = 0;
    }
  }

  teacherCtx.putImageData(pictureData, 0, 0);
}
