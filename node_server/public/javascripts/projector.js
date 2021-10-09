/* eslint-disable no-unused-vars */
table = -4;
selectedPosition = -6;
const teacherStreamRemovedBackground = document.getElementById('outputCanvas').captureStream();
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

const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementById('outputCanvas');
const canvasCtx = canvasElement.getContext('2d');
const landmarkContainer = document.getElementsByClassName('landmark-grid-container')[0];
// const grid = new LandmarkGrid(landmarkContainer);

/**
 * Gets the results
 * @param {Object} results the results
 */
function onResults(results) {
  if (!results.poseLandmarks) {
    // grid.updateLandmarks([]);
    return;
  }

  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(results.segmentationMask, 0, 0,
      canvasElement.width, canvasElement.height);

  // Only overwrite existing pixels.
  canvasCtx.globalCompositeOperation = 'source-out';
  canvasCtx.fillStyle = '#000000';
  canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);

  // Only overwrite missing pixels.
  canvasCtx.globalCompositeOperation = 'destination-atop';
  canvasCtx.drawImage(
      results.image, 0, 0, canvasElement.width, canvasElement.height);

  // canvasCtx.globalCompositeOperation = 'source-over';
  // drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS,
  //     {color: '#00FF00', lineWidth: 4});
  // drawLandmarks(canvasCtx, results.poseLandmarks,
  //     {color: '#FF0000', lineWidth: 2});
  // canvasCtx.restore();

  // grid.updateLandmarks(results.poseWorldLandmarks);
}

const pose = new Pose({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
}});
pose.setOptions({
  modelComplexity: 0, // complexity of the model. 0,1,2, the higher the number the more accurate but also more latency.
  smoothLandmarks: true,
  enableSegmentation: true,
  smoothSegmentation: true,
  minDetectionConfidence: 0.95,
  minTrackingConfidence: 0.95,
});
pose.onResults(onResults);

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await pose.send({image: videoElement});
  },
  width: {ideal: 4096},
  height: {ideal: 2160},
});
camera.start();

getCamerasAndMics();
document.getElementById('camText').style.display = 'block';
document.getElementById('micText').style.display = 'block';
document.getElementById('selectMic').style.display = 'block';
document.getElementById('select').style.display = 'block';

/**
 * starts sending the vid.
 */
function startProjecting() {
  document.getElementById('selectMic').style.display = 'none';
  document.getElementById('select').style.display = 'none';
  document.getElementById('camText').style.display = 'none';
  document.getElementById('micText').style.display = 'none';
  document.getElementById('webcam').style.display = 'none';
  document.getElementById('webcam').muted = true;
  document.getElementById('logInButton').style.display = 'none';
  document.getElementById('outputCanvas').style.display = 'block';

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
  const output = document.getElementById('outputCanvas');
  const currentClass = output.classList[0];
  output.classList.remove(currentClass);
  switch (currentClass) {
    case 'rotateRight':
      output.classList.add('rotateDown');
      break;
    case 'rotateDown':
      output.classList.add('rotateLeft');
      break;
    case 'rotateLeft':
      output.classList.add('rotateUp');
      break;
    case 'rotateUp':
      output.classList.add('rotateRight');
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
