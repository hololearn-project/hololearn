// Javascript that handles getting the permission for the mic and cam of the user.
// Note: This file is used a lot in different settings.
// If you make changes, make sure that this still works for all settings.

/* eslint-disable no-unused-vars */

/**
 * Asks for permission of camera.
 */
async function getCameraPermission() {
  const constraints = {video: true, audio: false};
  try {
    // Gets the default camera stream so the browser will ask for permission but stops all tracks since it is not used.
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
    // Gets the default audio stream so the browser will ask for permission but stops all tracks since it is not used.
    stream = await navigator.mediaDevices.getUserMedia(constraints);
    stream.getTracks().forEach((track) => {
      track.stop();
    });
  } catch (err) {
    alert('This app only works with a mic!');
    console.log(err);
  }
}
