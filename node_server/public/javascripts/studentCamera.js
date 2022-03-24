// Javascript that handles the camera  and incoming video streams off students.

/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */


// Arrays that store the video streams and elements needed for removing the background other students.
const students = new Array(positions.length + 1);
const sources = new Array(positions.length + 1);
const textures = new Array(positions.length + 1);
const ctxs = new Array(positions.length + 1);
const rotations = new Array(positions.length + 1);
const ctxStreams = new Array(positions.length + 1);
const canvasWebcams = new Array(positions.length + 1);

let imageData = '';

const output = document.querySelector('#output');
const ctxOutput = output.getContext('2d');

const canvasWebcam = document.querySelector('#canvasWebcam');
const ctxWebcam = canvasWebcam.getContext('2d');

let outputStream = output.captureStream(); // used in this file

let localMediaStreamWebcam = null;

const video = document.querySelector('#videoElement');

const canvas = document.querySelector('#canvasElement');
const ctx2 = canvas.getContext('2d');


/**
 * Makes screenshot of the webcam and removes the background.
 * Puts this on the output canvas.
 *
 * @param {THREE.camera} camera - Camera that user watches through
 * @param {mediaStream} localMediaStreamWebcam webcam stream
 * @param {CanvasRenderingContext2D} ctxWebcam to draw webcam imgs on the canvas
 * @param {CanvasRenderingContext2D} ctxOutput to draw final image to be sent
 * @param {DOMString} canvasWebcam - canvas to display the webcam on
 * @param {boolean} teacher - if the user is a teacher or not
 * @return {null}
 */
async function sendSnapshotWebcam(camera, localMediaStreamWebcam,
    ctxWebcam, ctxOutput, canvasWebcam, teacher) {
  if (!localMediaStreamWebcam) {
    return;
  }
  // updates the cameraDirection
  cameraDirection = new THREE.Vector3(0, 0, -1);
  cameraDirection = camera.getWorldDirection(cameraDirection);
  // Takes screenshot of the webcam
  ctxWebcam.drawImage(webcam, 0, 0, 250, 250);
  // gets the image data from the screenshot that was just made
  imageData = ctxWebcam.getImageData(0, 0, 250, 250);
  // removes the background from this imagedata
  imageData = await removeBackground(imageData, canvasWebcam);
  ctxOutput.putImageData(imageData, 0, 0);
}

/**
 * Removes all magenta pixels in a picture and makes them transparent.
 * @param {imageData} imageData - image data to remove background from
 * @return {imageData} the new image data with black pixels removed.
 */
function removeBlackBackground(imageData) {
  for (let i = 0; i < imageData.data.length; i = i + 4) {
    // Megenta is used instead of black since less users will be wearing black.
    if (imageData.data[i] > 140 &
        imageData.data[i + 1] < 90 & imageData.data[i + 2] > 140 ) {
      imageData.data[i + 3] = 0;
    }
  }
  return imageData;
}

/**
 * Removes the background using of tensorflow.js.
 * Instead of removing the background we make it magenta.
 * This video will be sent to others users who then remove the magenta.
 *
 * @param {imageData} imageData - Image data of picture
 * @param {DOMString} canvasWebcam2 - canvas that displays the webcam
 * @return {imageData} the new image data with the background set to transparent
 */
async function removeBackground(imageData, canvasWebcam2) {
  const personSegmentation = await net.segmentPerson(canvasWebcam2);
  for (let i = 0; i < personSegmentation.data.length; i++) {
    if (personSegmentation.data[i] == 0 || cameraOff) {
      // Every pixel has 4 values: red, blue, green and transparity.
      // imageData.data[i * 4 + 3] = 0;
      imageData.data[i * 4] = 255;
      imageData.data[i * 4 + 1] = 0;
      imageData.data[i * 4 + 2] = 255;
    }
  }
  return imageData;
}

/**
 * Gets the angle of two 2d vectors.
 * @param {number} ax - x coordinate of first vector
 * @param {number} ay - y coordinate of first vector
 * @param {number} bx - x coordinate of second vector
 * @param {number} by - y coordinate of second vector
 * @return {number} angle between the two vectors in radians.
 */
function getAngle(ax, ay, bx, by) {
  const dot = dotProduct([ax, ay], [bx, by]);
  return Math.acos(dot / (getLength([ax, ay]) * getLength([bx, by])));
}

/**
 * gets the length of a vector of any real dimension.
 *
 * @param {vector} vector1 - the vector to get the lengths of
 * @return {number} the length.
 */
function getLength(vector1) {
  let result = 0;
  for (let i = 0; i < vector1.length; i++) {
    result += vector1[i] * vector1[i];
  }
  return Math.sqrt(result);
}

/**
 * returns the dot product between two vectors of any real dimension.
 *
 * @param {vector} vector1 - first vector
 * @param {vector} vector2 - second vector
 * @return {number} the dot product of both vectors.
 */
function dotProduct(vector1, vector2) {
  let result = 0;
  for (let i = 0; i < vector1.length; i++) {
    result += vector1[i] * vector2[i];
  }
  return result;
}

/**
 * Updates the webcams and screen share.
 * @param {boolean} teacher - if the user is a teacher or not
 * @param {THREE.camera} camera - the camera the user is looking through
 */
function updateScreenAndWebcams(teacher, camera) {
  if (!isTeacher) {
    // If user is a student, update its webcam.
    sendSnapshotWebcam(camera, localMediaStreamWebcam, ctxWebcam,
        ctxOutput, canvasWebcam, teacher);
  }
  // For every other student, update the webcam by taking a screenshot from its webcam video
  // Then remove the magenta pixels and putting it on the canvas of the student.
  for (let i = 1; i < ctxs.length; i++) {
    if (ctxStreams[i] != undefined) {
      ctxStreams[i].drawImage(sources[i], 0, 0, 500, 500);
      let newData = ctxStreams[i].getImageData(0, 0, 500, 500);
      newData = removeBlackBackground(newData);
      ctxs[i].putImageData(newData, 0, 0);
    }
  }
}
