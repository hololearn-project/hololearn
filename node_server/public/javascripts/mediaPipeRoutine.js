/*eslint-disable*/

let facialLandmarks;

const videoElement = document.getElementById('webcamVid');
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');

function onResultsFace(results) {
    if (results.multiFaceLandmarks) {
        facialLandmarksClient = results.multiFaceLandmarks;
    }

}

function onResultsPose(results) {
    if (results.poseLandmarks) {
        landmarks = results.poseLandmarks;
    }
  }

const faceMesh = new FaceMesh({locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
}});
faceMesh.setOptions({
    maxNumFaces: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
    });
    faceMesh.onResults(onResultsFace);

const pose = new Pose({locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
  }});

pose.setOptions({
modelComplexity: 1,
smoothLandmarks: true,
minDetectionConfidence: 0.5,
minTrackingConfidence: 0.5
});
pose.onResults(onResultsPose);

const camera = new Camera(videoElement, {
    onFrame: async () => {
      if (faceMeshFlag) {
        await faceMesh.send({image: videoElement});
      } else if (bodyTrackFlag) {
        await pose.send({image: videoElement});
      }
    },
    width: 1280,
    height: 720
  });
  camera.start();