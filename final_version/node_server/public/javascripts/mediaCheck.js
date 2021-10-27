const select = document.getElementById('select');
const selectMic = document.getElementById('selectMic');
let mediaDevices = '';
// eslint-disable-next-line prefer-const
let recordedChunks = [];
// eslint-disable-next-line prefer-const
let teacherSound = undefined;
let recording = false;
let streamToRecord = undefined;
let muted = false;

/**
 * Starts the selecting of mics and cameras.
 * @param {boolean} teacher - if the user is a teacher or not
 */
async function checkMedia(teacher) { // eslint-disable-line no-unused-vars
  const micText = document.getElementById('micText');
  const camText = document.getElementById('camText');
  if (!isTeacher) {
    camText.style.display = 'block';
  } else {
    micText.style.marginTop = '100px';
  }
  micText.style.display = 'block';
  const connectButton = document.getElementById('connectButton');
  connectButton.style.display = 'block';
  webcam.muted = false;
  if (teacher) {
    const displayMediaOptions = {
      video: {
        cursor: 'always',
      },
      audio: false,
    };
    // get screen share
    await navigator.mediaDevices.getDisplayMedia(displayMediaOptions)
        .then(function(stream) {
          video.srcObject = stream;
          video.style.display = 'block';
          video.muted = true;
          localMediaStream = stream;
        });
    getCamerasAndMics();
  } else {
    webcam.muted = false;
    getCamerasAndMics();
  }
}

/**
 * gets the available mics and cameras
 */
function getCamerasAndMics() {
  navigator.mediaDevices.enumerateDevices().then((devices) => {
    if (!isTeacher) {
      gotDevicesCamera(devices);
    }
    gotDevicesMic(devices);
  });
}


/**
 * Sets the options in the select tag for cameras.
 * @param {mediaDevice []} mediaDevicesNew
 */
function gotDevicesCamera(mediaDevicesNew) {
  mediaDevices = mediaDevicesNew;
  select.style.display = 'block';
  // select.innerHTML = '';
  let count = 1;
  mediaDevices.forEach((mediaDevice) => {
    if (mediaDevice.kind === 'videoinput') {
      const option = document.createElement('option');
      option.value = mediaDevice.deviceId;
      const label = mediaDevice.label || `Camera ${count++}`;
      const textNode = document.createTextNode(label);
      option.appendChild(textNode);
      select.appendChild(option);
    }
  });
}

/**
 * Sets the options in the select tag for mics.
 * @param {mediaDevice []} mediaDevicesNew
 */
function gotDevicesMic(mediaDevicesNew) {
  mediaDevices = mediaDevicesNew;
  selectMic.style.display = 'block';
  // selectMic.innerHTML = '';
  let count = 1;
  mediaDevices.forEach((mediaDevice) => {
    if (mediaDevice.kind === 'audioinput') {
      const option = document.createElement('option');
      option.value = mediaDevice.deviceId;
      const label = mediaDevice.label || `Mic ${count++}`;
      const textNode = document.createTextNode(label);
      option.appendChild(textNode);
      selectMic.appendChild(option);
    }
  });
}

/**
 * Sets the video to the chosen camera.
 */
function cameraChosen() { // eslint-disable-line no-unused-vars
  webcam.style.display = 'block';
  const videoConstraints = {};
  videoConstraints.deviceId = {exact: select.value};
  stopMediaTrackVideo(webcam.srcObject);
  navigator.mediaDevices.getUserMedia({audio: false, video: videoConstraints})
      .then((stream) => {
        if (webcam.srcObject == null || webcam.srcObject == undefined) {
          webcam.srcObject = stream;
          localMediaStreamWebcam = stream;
        } else {
          webcam.srcObject.addTrack(stream.getVideoTracks()[0]);
          localMediaStreamWebcam.addTrack(stream.getVideoTracks()[0]);
        }
      });
}

/**
 * Sets the video to the chosen mic.
 */
function micChosen() { // eslint-disable-line no-unused-vars
  if (!isTeacher) {
    webcam.style.display = 'block';
  }
  const audioConstraints = {};
  audioConstraints.deviceId = {exact: selectMic.value};
  navigator.mediaDevices.getUserMedia({audio: audioConstraints})
      .then((stream) => {
        if (webcam.srcObject == null || webcam.srcObject == undefined) {
          webcam.srcObject = stream;
          if (isTeacher) {
            stopMediaTrackAudio(localMediaStream);
            localMediaStream.addTrack(stream.getAudioTracks()[0]);
          } else {
            localMediaStreamWebcam = stream;
          }
        } else {
          stopMediaTrackAudio(webcam.srcObject);
          webcam.srcObject.addTrack(stream.getAudioTracks()[0]);
          if (isTeacher) {
            stopMediaTrackAudio(localMediaStream);
            localMediaStream.addTrack(stream.getAudioTracks()[0]);
          } else {
            localMediaStreamWebcam.addTrack(stream.getAudioTracks()[0]);
          }
        }
      });
}

/**
 * Remove the video in the current stream if there is one. Otherwise do nothing.
 * @param {mediaStream} stream
 */
function stopMediaTrackVideo(stream) {
  if (stream != null && stream != undefined &&
    stream.getVideoTracks().length > 0) {
    stream.removeTrack(stream.getVideoTracks()[0]);
  }
}

/**
 * Remove the audio in the current stream if there is one. Otherwise do nothing.
 * @param {mediaStream} stream
 */
function stopMediaTrackAudio(stream) {
  if (stream != null && stream != undefined &&
     stream.getAudioTracks().length > 0) {
    stream.removeTrack(stream.getAudioTracks()[0]);
  }
}

/**
 * Changes the color of the speak button.
 */
function speakClicked() { // eslint-disable-line no-unused-vars
  const element = document.getElementById('speak');
  const icon = document.getElementById('speakIcon');
  if ((element.style.background == 'red' | element.style.background == '') &&
   icon.style.color != 'rgb(0, 196, 65)') {
    // element.style.background = "rgb(0, 196, 65)"
    icon.style.color = 'rgb(0, 196, 65)';
    socket.emit('request to speak');
  } else {
    console.log('disconnecting speaking...');
    socket.emit('done speaking');
    activeconnections.get(teacherSocket).peerObject.destroy();
    activeconnections.delete(teacherSocket);
  }
  // TODO - do backend for this
}

/**
 * Changes the color of the mute button & mutes or unmutes the user accordingly.
 */
function muteClicked() { // eslint-disable-line no-unused-vars
  const element = document.getElementById('mic');
  if (muted) {
    element.style.background = 'rgb(0, 196, 65)';
  } else {
    element.style.background = 'red';
  }
  if (isTeacher) {
    muteUnmuteStream(localMediaStream);
  } else {
    muteUnmuteStream(localMediaStreamWebcam);
  }
}

/**
 * Mutes the stream if it is unmute and vice versa.
 * @param {MediaStream} stream - the stream that needs to be changed
 */
function muteUnmuteStream(stream) {
  if (!muted) {
    stream.getAudioTracks()[0].enabled = false;
    muted = true;
  } else {
    stream.getAudioTracks()[0].enabled = true;
    muted = false;
  }
  console.log(stream);
}

/**
 * Start the recording.
 */
async function startRecording() {
  const displayMediaOptions2 = {
    video: true,
    audio: false,
  };
  await navigator.mediaDevices.getDisplayMedia(displayMediaOptions2)
      .then(function(stream) {
        streamToRecord = stream;
      });
}
/**
 * Pushes, then downloads the data.
 * @param {Event} event - the event that occured
 */
function handleDataAvailable(event) {
  console.log(event.data.size);
  if (event.data.size > 0) {
    recordedChunks.push(event.data);
    download();
  }
}

/**
 * Downloads the recorded video.
 */
function download() {
  const blob = new Blob(recordedChunks, {
    type: 'video/webm',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  document.body.appendChild(a);
  a.style = 'display: none';
  a.href = url;
  a.download = 'HoloLearnLecture.webm';
  a.click();
  window.URL.revokeObjectURL(url);
}

/**
 * Activates when record button is clicked.
 * Either stops or starts the recording.
 */
async function recordClicked() { // eslint-disable-line no-unused-vars
  if (recording) {
    mediaRecorder.stop();
    document.getElementById('recordButton')
        .style.background = 'red';
    recording = false;
  } else {
    await startRecording();
    startMediaRecorder();
    document.getElementById('recordButton')
        .style.background = 'rgb(0, 196, 65)';
    recording = true;
  }
}
/**
 * Starts recording media.
 */
function startMediaRecorder() {
  if (teacherSound != undefined && streamToRecord != undefined) {
    streamToRecord.addTrack(teacherSound);
    const options = {mimeType: 'video/webm'};
    console.log(streamToRecord.getAudioTracks());
    console.log(streamToRecord.getVideoTracks());
    mediaRecorder = new MediaRecorder(streamToRecord, options);

    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.start();
  }
}
