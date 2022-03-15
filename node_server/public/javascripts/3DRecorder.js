/* eslint-disable prefer-const */
/* eslint-disable no-unused-vars */
let readyToRecord = false;
let recording3D = false;

let depthStream = undefined;
let imageStream = undefined;
let screenShareStream = undefined;

let mediaRecorderDepthStream = undefined;
let mediaRecorderImageStream = undefined;
let mediaRecorderScreenShareStream = undefined;


const recordedChunksDepthStream = [];
const recordedChunksImageStream = [];
const recordedChunksScreenShareStream = [];

const urls = [];
const blobs = [];

let countTemp = 0;

/**
 * Starts the 3D recording if all components are ready and record is clicked.
 */
function start3DRecording() {
  // Check if record button is clicked and all streams are defined, otherwise nothing happens.
  if (readyToRecord && depthStream != undefined && imageStream != undefined && screenShareStream != undefined) {
    const options = {mimeType: 'video/webm'};

    // Create a new recorder for the depthStream
    mediaRecorderDepthStream = new MediaRecorder(depthStream, options);
    mediaRecorderDepthStream.ondataavailable = function(e) {
      handleDataAvailable3DRecorder(e, {chunks: recordedChunksDepthStream, name: 'depth'});
    };
    mediaRecorderDepthStream.start();

    // Create a new recorder for the imageStream
    mediaRecorderImageStream = new MediaRecorder(imageStream, options);
    mediaRecorderImageStream.ondataavailable = function(e) {
      handleDataAvailable3DRecorder(e, {chunks: recordedChunksImageStream, name: 'image'});
    };
    mediaRecorderImageStream.start();

    // Create a new recorder for the screenShareStream
    const screenshareScreen = document.getElementById('screenshare');
    mediaRecorderScreenShareStream = new MediaRecorder(screenshareScreen.srcObject, options);
    mediaRecorderScreenShareStream.ondataavailable = function(e) {
      handleDataAvailable3DRecorder(e, {chunks: recordedChunksScreenShareStream, name: 'screen'});
    };
    mediaRecorderScreenShareStream.start();
  }
}

/**
 * downloads the data.
 * @param {Event} event - Event that holds the data
 * @param {[]} recordedChunksMethod - empty array to push the recorded chunks in.
 */
function handleDataAvailable3DRecorder(event, recordedChunksMethod) {
  if (event.data.size > 0) {
    recordedChunksMethod.chunks.push(event.data);
    if (!recording3D) {
      download3DRecorder(recordedChunksMethod);
    }
  }
}

/**
 * Stores the recorded video's and when all video's are stored it will show a div on the screen,
 * where the user can give the record a name and upload to the server.
 * @param {[MediaStream]} recordedChunksMethod the recording in an array.
 */
function download3DRecorder(recordedChunksMethod) {
  const blob = new Blob(recordedChunksMethod.chunks, {
    type: 'video/webm',
  });
  const url = URL.createObjectURL(blob);
  if (recordedChunksMethod.name == 'depth') {
    // Every blob gets a name so every recording is stored correctly on the server.
    const downloadBlob = {blob: blob, name: 'depthStream'};
    blobs.push(downloadBlob);
  }

  if (recordedChunksMethod.name == 'image') {
    // Every blob gets a name so every recording is stored correctly on the server.
    const downloadBlob2 = {blob: blob, name: 'imageStream'};
    blobs.push(downloadBlob2);
  }

  if (recordedChunksMethod.name == 'screen') {
    // Every blob gets a name so every recording is stored correctly on the server.
    const downloadBlob3 = {blob: blob, name: 'screenShareStream'};
    blobs.push(downloadBlob3);
  }

  // Only make the user able to upload the data to the server when all 3 blobs are stored.
  if (blobs.length >= 3) {
    document.getElementById('recordingNameInputDiv').style.display = 'block';
  }
}

/**
 * uploads the lecture to the database on the server.
 */
function uploadLecture() {
  let depthBlob = undefined;
  blobs.forEach((blobObject) => {
    if (blobObject.name == 'depthStream') {
      depthBlob = blobObject.blob;
    }
    if (blobObject.name == 'imageStream') {
      imageBlob = blobObject.blob;
    }
    if (blobObject.name == 'screenShareStream') {
      screenShareBlob = blobObject.blob;
    }
  });
  // Gets the name of the lecture that was inputted by the teacher on the page.
  const lectureName = document.getElementById('recordingNameInput').value;
  // When receiving all the lectures it will check if the inputted name is an unique name
  // if not it will throw an alert saying that the name is not unique.
  socket.on('allLectures', (lectures) => {
    let unique = true;
    lectures.forEach((onlineLecture) => {
      if (lectureName == onlineLecture.name) {
        unique = false;
      }
    });
    if (unique) {
      // The name of the lecture is unique so the lecture is uploaded to the server.
      socket.emit('uploadLecture', lectureName, depthBlob, imageBlob, screenShareBlob);
      // Removes the div where the lecture can be uploaded from the screen since it has been uploaded now.
      document.getElementById('recordingNameInputDiv').style.display = 'none';
      console.log('lecture uploaded!');
    } else {
      alert('this lecture name already exists. Try something else.');
    }
  });
  socket.emit('getLectures');
}

/**
 * Records if all streams are available or stops recording if it is recording.
 */
function record3DClicked() {
  // Checks if it is already recording
  if (readyToRecord) {
    // if it is it stops the recording.
    recording3D = false;
    if (mediaRecorderDepthStream != undefined) {
      mediaRecorderDepthStream.stop();
    }
    if (mediaRecorderImageStream != undefined) {
      mediaRecorderImageStream.stop();
    }
    if (mediaRecorderScreenShareStream != undefined) {
      mediaRecorderScreenShareStream.stop();
    }
    // The button on the screen is changed to the correct button icon.
    document.getElementById('3DRecordIcon').style.display = 'block';
    document.getElementById('3DStopRecordIcon').style.display = 'none';
    readyToRecord = false;
  } else {
    // If it is not recording it will try and start the recording.
    // If not all streams are present it will still show to the user that the recording mode is on
    // It will start the recording when the needed streams are present.
    readyToRecord = true;
    document.getElementById('3DRecordIcon').style.display = 'none';
    document.getElementById('3DStopRecordIcon').style.display = 'block';
    start3DRecording();
    recording3D = true;
  }
}

/**
 * Appears the file selecting div.
 */
function rewatchLecture() {
  displayLectures();
}

/**
 * starts the replay of a lecture.
 */
function startReplay() {
  try {
    const fileList = document.getElementById('input').files;
    JSZip.loadAsync(fileList[0]).then(function(zip) {
      zip.files['imageStream.webm'].async('blob').then(function(fileData) {
        document.getElementById('lidarVideoStream1').src = URL.createObjectURL(fileData);
        document.getElementById('lidarVideoStream1').play();
      });
      zip.files['depthStream.webm'].async('blob').then(function(fileData) {
        document.getElementById('lidarVideoStream2').src = URL.createObjectURL(fileData);
        document.getElementById('lidarVideoStream2').play();
      });
      zip.files['screenShareStream.webm'].async('blob').then(function(fileData) {
        addScreenShare(URL.createObjectURL(fileData), true);
      });
    }).catch((err) => {
      lastNoti = Date.now();
      document.getElementById('notiText').innerHTML =
      'Your input was not in the right format. Make sure you add the zip file received.';
      document.getElementById('notification').style.display='block';
      setTimeout(function() {
        if (Date.now() - lastNoti > 4500) {
          document.getElementById('notification').style.display='none';
        }
      }, 5000);
    });
    document.getElementById('inputDiv').style.display = 'none';
  } catch (err) {
    lastNoti = Date.now();
    document.getElementById('notiText').innerHTML =
    'Your input was not in the right format. Make sure you add the zip file received.';
    document.getElementById('notification').style.display='block';
    setTimeout(function() {
      if (Date.now() - lastNoti > 4500) {
        document.getElementById('notification').style.display='none';
      }
    }, 5000);
  }
}
