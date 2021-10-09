/* eslint-disable no-unused-vars */
const select = document.getElementById('select');
const selectMic = document.getElementById('selectMic');
let mediaDevices = '';
// eslint-disable-next-line no-unused-vars
let lastScreenShare = undefined;
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
          lastScreenShare = localMediaStream.getVideoTracks()[0];
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
 * @param {mediaDevice []} mediaDevicesNew the mediadevices available.
 * @param {boolean} inLecture if the user is in the lecture.
 */
function gotDevicesCamera(mediaDevicesNew, inLecture) {
  mediaDevices = mediaDevicesNew;
  const selectCamInLecture = document.getElementById('selectCamInLecture');
  if (inLecture) {
    selectCamInLecture.style.display = 'block';
    document.getElementById('selectMicInLecture').style.display = 'none';
  } else {
    select.style.display = 'block';
  }
  let count = 1;
  mediaDevices.forEach((mediaDevice) => {
    if (mediaDevice.kind === 'videoinput') {
      if (inLecture) {
        const option = document.createElement('VIDEO');
        option.setAttribute('id', mediaDevice.deviceId);
        option.className = 'optionInLecture';
        option.width = 300;
        option.style.margin = '5px';
        option.setAttribute('onClick', 'cameraChosen(true, this)' );
        const videoConstraints = {};
        videoConstraints.deviceId = {exact: mediaDevice.deviceId};
        navigator.mediaDevices.
            getUserMedia({audio: false, video: videoConstraints})
            .then((stream) => {
              option.srcObject = stream;
              option.play();
            });
        selectCamInLecture.appendChild(option);
      } else {
        const option = document.createElement('option');
        option.value = mediaDevice.deviceId;
        const label = mediaDevice.label || `Camera ${count++}`;
        const textNode = document.createTextNode(label);
        option.appendChild(textNode);
        select.appendChild(option);
      }
    }
  });
}

/**
 * Sets the options in the select tag for mics.
 * @param {mediaDevice []} mediaDevicesNew the mediadevices available.
 * @param {boolean} inLecture if the user is in the lecture.
 */
function gotDevicesMic(mediaDevicesNew, inLecture) {
  mediaDevices = mediaDevicesNew;
  if (inLecture) {
    document.getElementById('selectMicInLecture').style.display = 'block';
    document.getElementById('selectCamInLecture').style.display = 'none';
  } else {
    selectMic.style.display = 'block';
  }
  let count = 1;
  mediaDevices.forEach((mediaDevice) => {
    if (mediaDevice.kind === 'audioinput') {
      if (inLecture) {
        const option = document.createElement('DIV');
        option.setAttribute('id', mediaDevice.deviceId);
        option.width = 300;
        option.style.padding = '5px';
        option.className = 'optionInLecture';
        option.setAttribute('onClick', 'micChosen(true, this)' );

        const text = document.createElement('H3');
        const t = document.createTextNode(mediaDevice.label ||
           `Mic ${count++}`);
        text.appendChild(t);
        option.appendChild(text);

        document.getElementById('micDisplay').appendChild(option);
      } else {
        const option = document.createElement('option');
        option.value = mediaDevice.deviceId;
        const label = mediaDevice.label || `Mic ${count++}`;
        const textNode = document.createTextNode(label);
        option.appendChild(textNode);
        selectMic.appendChild(option);
      }
    }
  });
}

/**
 * Sets the chosen camera.
 * @param {boolean} inLecture if the user is in a lecture or not.
 * @param {string} deviceId id of the chosen device.
 */
function cameraChosen(inLecture, deviceId) {
  if (!inLecture) {
    webcam.style.display = 'block';
  }
  const videoConstraints = {};
  stopMediaTrackVideo(webcam.srcObject);
  if (inLecture) {
    videoConstraints.deviceId = {exact: deviceId.id};
  } else {
    videoConstraints.deviceId = {exact: select.value,
    };
  }
  navigator.mediaDevices.getUserMedia({audio: false, video: videoConstraints})
      .then((stream) => {
        if (webcam.srcObject == null || webcam.srcObject == undefined) {
          webcam.srcObject = stream;
          localMediaStreamWebcam = stream;
        } else {
          stopMediaTrackVideo(localMediaStreamWebcam);
          webcam.srcObject.addTrack(stream.getVideoTracks()[0]);
          localMediaStreamWebcam.addTrack(stream.getVideoTracks()[0]);
        }
      });
  if (inLecture) {
    document.getElementById('selectCamInLecture').style.display = 'none';
  }
}

/**
 * Sets the chosen mic.
 * @param {boolean} inLecture if the user is in a lecture or not.
 * @param {string} id id of the chosen device.
 */
function micChosen(inLecture, id) { // eslint-disable-line no-unused-vars
  if (!isTeacher && !inLecture) {
    webcam.style.display = 'block';
  }
  const audioConstraints = {};
  if (inLecture) {
    audioConstraints.deviceId = {exact: id.id};
  } else {
    audioConstraints.deviceId = {exact: selectMic.value};
  }
  navigator.mediaDevices.getUserMedia({audio: audioConstraints})
      .then((stream) => {
        if (!inLecture) {
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
          if (isTeacher) {
            lastTrackAudio = localMediaStream.getAudioTracks()[0];
          } else {
            lastTrackAudio = localMediaStreamWebcam.getAudioTracks()[0];
          }
        } else {
          if (isTeacher) {
            stopMediaTrackAudio(localMediaStream);
            localMediaStream.addTrack(stream.getAudioTracks()[0]);
            if (muted) {
              localMediaStream.getAudioTracks()[0].enabled = false;
              localMediaStream.getAudioTracks()[0].muted = true;
            }
            teacherPeer.removeTrack(lastTrackAudio, localMediaStream);
            teacherPeer.addTrack(stream.getAudioTracks()[0], localMediaStream);
            lastTrackAudio = stream.getAudioTracks()[0];
            stopMediaTrackAudio(localMediaStream);
            // localMediaStream.addTrack(stream.getAudioTracks()[0]);
            socket.emit('micChange');
          } else {
            stopMediaTrackAudio(localMediaStreamWebcam);
            localMediaStreamWebcam.addTrack(stream.getAudioTracks()[0]);
            if (muted) {
              localMediaStreamWebcam.getAudioTracks()[0].enabled = false;
              localMediaStreamWebcam.getAudioTracks()[0].muted = true;
            }
          }
          activeconnections.forEach((connection) => {
            connection.peerObject.removeTrack(lastTrackAudio, outputStream);
          });
          activeconnections.forEach((connection) => {
            connection.peerObject.addTrack(localMediaStreamWebcam.
                getAudioTracks()[0], outputStream);
            lastTrackAudio = localMediaStreamWebcam.getAudioTracks()[0];
          });
          const select = document.getElementById('selectMicInLecture');
          select.style.display = 'none';
          if (positionalHearing) {
            activeconnections.forEach((connection) => {
              if (unmutedSeats.includes(connection.seat)) {
                connection.peerObject.send(String('unmute ' + selectedPosition));
              }
            });
            const mutedPositions = [1, 2, 3, 4, 5];
            unmutedSeats.forEach((seat) => {
              const index = mutedPositions.indexOf(seat);
              if (index > -1) {
                mutedPositions.splice(index, 1);
              }
            });
            activeconnections.forEach((connection) => {
              if (mutedPositions.includes(connection.seat)) {
                connection.peerObject.send(String('mute ' + selectedPosition));
              }
            });
            setPositionalHearing(rotationNow);
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
  const soundIcon = document.getElementById('soundIcon');
  const speakIcon = document.getElementById('speakIcon');
  if (speakIcon.style.display != 'none') {
    socket.emit('request to speak');
    speakIcon.style.display = 'none';
    soundIcon.style.display = 'block';
  } else {
    socket.emit('done speaking');
    speakIcon.style.display = 'block';
    soundIcon.style.display = 'none';
    activeconnections.get(teacherSocket).peerObject.destroy();
    activeconnections.delete(teacherSocket);
  }
  // TODO - do backend for this
}

/**
 * Changes the color of the mute button & mutes or unmutes the user accordingly.
 */
function muteClicked() { // eslint-disable-line no-unused-vars
  const mic = document.getElementById('micIcon');
  const micSlash = document.getElementById('micIconSlash');
  if (muted) {
    micSlash.style.display = 'none';
    mic.style.display = 'block';
  } else {
    micSlash.style.display = 'block';
    mic.style.display = 'none';
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
    stream.getAudioTracks()[0].muted = true;
    muted = true;
  } else {
    stream.getAudioTracks()[0].enabled = true;
    stream.getAudioTracks()[0].muted = false;
    muted = false;
  }
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
    mediaRecorder = new MediaRecorder(streamToRecord, options);

    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.start();
  }
}
