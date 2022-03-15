// Javascript that handles changes in the camera and mic changes.

/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */

let cameraOff = false;
let lastTrackAudio = undefined;
let lastTrackVideo = undefined;


/**
 * Loads the mic picking in lecture.
 * @param {Event} event the onclick event. Stops the onclick for the parent element.
 */
function changeMic(event) {
  // stopPropagation() stops the onclick event from triggering for elements beneath the element.
  event.stopPropagation();
  const select = document.getElementById('selectMicInLecture');
  document.getElementById('micDisplay').innerHTML = '';

  if (select.style.display == 'block') {
    select.style.display = 'none';
  } else {
    // Gets all possible mic devices that can be used.
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      gotDevicesMic(devices, true);
    });
  }
}

/**
 * Loads the cam picking in lecture. This shows a list with small boxes for all camera's.
 * @param {Event} event the onclick event. Stops the onclick for the parent element.
 */
function changeCam(event) {
  // stopPropagation() stops the onclick event from triggering for elements beneath the element.
  event.stopPropagation();
  const select = document.getElementById('selectCamInLecture');
  select.innerHTML = '';
  if (select.style.display == 'block') {
    select.style.display = 'none';
  } else {
    select.style.display = 'block';
    // Gets all possible camera devices.
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      gotDevicesCamera(devices, true);
    });
  }
}

/**
 * Turns the camera on when off and vice versa
 */
function cameraOnOrOff() {
  if (cameraOff) {
    cameraOff = false;
    document.getElementById('videoIconSlash').style.display = 'none';
    document.getElementById('videoIcon').style.display = 'block';
  } else {
    cameraOff = true;
    document.getElementById('videoIconSlash').style.display = 'block';
    document.getElementById('videoIcon').style.display = 'none';
  }
}

/**
 * changes the shared screen for the teacher.
 */
function screenShareChange() {
  const displayMediaOptions = {
    video: {
      cursor: 'always',
    },
    audio: false,
  };
  navigator.mediaDevices.getDisplayMedia(displayMediaOptions)
      .then(function(stream) {
        // First removes the old screen share.
        teacherPeer.removeTrack(lastScreenShare, localMediaStream);
        // Adds the new screen share
        teacherPeer.addTrack(stream.getVideoTracks()[0], localMediaStream);
        lastScreenShare = stream.getVideoTracks()[0];
        stopMediaTrackVideo(localMediaStream);
        localMediaStream.addTrack(stream.getVideoTracks()[0]);
        // Lets the server now the screen share has changed.
        socket.emit('screenShareChange');
      });
}
