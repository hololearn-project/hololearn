/* eslint-disable no-unused-vars */
table = -4;
selectedPosition = -6;
// eslint-disable-next-line no-unused-vars
const UNIQUE_USER_ID = Math.random().toString(36).substring(7);
isTeacher = false;
userClassroomId = 'defaultClassroom';

const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
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
  smoothSegmentation: false,
  minDetectionConfidence: 0.95,
  minTrackingConfidence: 0.95,
});
pose.onResults(onResults);

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await pose.send({image: videoElement});
  },
  // width: 1280,
  // height: 720,
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
