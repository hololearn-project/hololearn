/* eslint-disable max-len */
let cameraOff = false;
/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
let lastTrackAudio = undefined;
let lastTrackVideo = undefined;


/**
 * Loads the mic picking in lecture.
 * @param {Event} event the onclick event. Stops the onclick for the parent element.
 */
function changeMic(event) {
  event.stopPropagation();
  const select = document.getElementById('selectMicInLecture');
  document.getElementById('micDisplay').innerHTML = '';

  if (select.style.display == 'block') {
    select.style.display = 'none';
  } else {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      gotDevicesMic(devices, true);
    });
  }
}

/**
 * Loads the mic picking in lecture.
 * @param {Event} event the onclick event. Stops the onclick for the parent element.
 */
function changeCam(event) {
  event.stopPropagation();
  const select = document.getElementById('selectCamInLecture');
  select.innerHTML = '';
  // const length = select.options.length;
  // for (i = length-1; i >= 1; i--) {
  //     select.options[i] = null;
  // }
  if (select.style.display == 'block') {
    select.style.display = 'none';
  } else {
    select.style.display = 'block';
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
        teacherPeer.removeTrack(lastScreenShare, localMediaStream);
        teacherPeer.addTrack(stream.getVideoTracks()[0], localMediaStream);
        lastScreenShare = stream.getVideoTracks()[0];
        stopMediaTrackVideo(localMediaStream);
        localMediaStream.addTrack(stream.getVideoTracks()[0]);
        socket.emit('screenShareChange');
      });
}
