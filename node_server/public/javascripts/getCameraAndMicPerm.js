/* eslint-disable no-unused-vars */

/**
 * Asks for permission of camera.
 */
async function getCameraPermission() {
  const constraints = {video: true, audio: false};
  try {
    stream = await navigator.mediaDevices.getUserMedia(constraints);
    stream.getTracks().forEach((track) => {
      track.stop();
    });
  } catch (err) {
    alert('This app only works with a cam!');
    console.log(err);
  }
}

/**
 * Asks for permission of mic.
 */
async function getMicPermission() {
  const constraints = {video: false, audio: true};
  try {
    stream = await navigator.mediaDevices.getUserMedia(constraints);
    stream.getTracks().forEach((track) => {
      track.stop();
    });
  } catch (err) {
    alert('This app only works with a mic!');
    console.log(err);
  }
}
