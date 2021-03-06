/* eslint-disable no-unused-vars */
let recFlag = false;
let recording3D = false;

// eslint-disable-next-line prefer-const
let depthStream = undefined;
// eslint-disable-next-line prefer-const
let imageStream = undefined;
// eslint-disable-next-line prefer-const

let mediaRecorderDepthStream = undefined;
let mediaRecorderImageStream = undefined;


const recordedChunksDepthStream = [];
const recordedChunksImageStream = [];

const urls = [];
const blobs = [];

let countTemp = 0;

/**
 * Starts the 3D recording if all components are ready and record is clicked.
 */
function start3DRecording() {
  if (recFlag && depthStream != undefined && imageStream != undefined) {
    const options = {mimeType: 'video/webm'};
    mediaRecorderDepthStream = new MediaRecorder(depthStream, options);
    mediaRecorderDepthStream.ondataavailable = function(e) {
      handleDataAvailable3DRecorder(e, {chunks: recordedChunksDepthStream, name: 'depth'});
    };

    mediaRecorderImageStream = new MediaRecorder(imageStream, options);
    mediaRecorderImageStream.ondataavailable = function(e) {
      handleDataAvailable3DRecorder(e, {chunks: recordedChunksImageStream, name: 'image'});
    };
    mediaRecorderImageStream.start();
    mediaRecorderDepthStream.start();
  }
}
/**
 * Downloads multiple files
 * @param {[string]} urls urls of files to be downloaded.
 */
function downloadMultipleFiles(urls) {
  const zip = new JSZip();
  let count = 0;

  let today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const yyyy = today.getFullYear();

  today = mm + '/' + dd + '/' + yyyy;
  const zipFilename = 'HoloLearnLecture' + today + '.zip';

  urls.forEach(function(url) {
    countTemp = countTemp + 1;
    const filename = url.name + '.webm';
    // loading a file and add it in a zip file
    JSZipUtils.getBinaryContent(url.url, function(err, data) {
      if (err) {
        throw err; // or handle the error
      }
      zip.file(filename, data, {binary: true});
      count++;
      if (count == urls.length) {
        zip.generateAsync({type: 'blob'}).then(function(content) {
          saveAs(content, zipFilename);
        });
      }
    });
  });
}

/**
 * Pushes, then downloads the data.
 * @param {Event} event - the event that occured
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
 * Downloads a zipfile when all streams have url in urls.
 * @param {[MediaStream]} recordedChunksMethod the recording in an array.
 */
function download3DRecorder(recordedChunksMethod) {
  const blob = new Blob(recordedChunksMethod.chunks, {
    type: 'video/webm',
  });
  const url = URL.createObjectURL(blob);
  if (recordedChunksMethod.name == 'depth') {
    // const downloadUrl = {url: url, name: 'depthStream'};
    // urls.push(downloadUrl);
    const downloadBlob = {blob: blob, name: 'depthStream'};
    blobs.push(downloadBlob);
  }

  if (recordedChunksMethod.name == 'image') {
    // const downloadUrl2 = {url: url, name: 'imageStream'};
    // urls.push(downloadUrl2);
    const downloadBlob2 = {blob: blob, name: 'imageStream'};
    blobs.push(downloadBlob2);
  }
  if (blobs.length >= 2) {
    document.getElementById('recordingNameInputDiv').style.display = 'block';
  }
}

/**
 * uploads the lecture to the online database.
 */
function uploadLecture() {
  let depthBlob = undefined;
  // downloadMultipleFiles(urls);
  blobs.forEach((blobObject) => {
    if (blobObject.name == 'depthStream') {
      depthBlob = blobObject.blob;
    }
    if (blobObject.name == 'imageStream') {
      imageBlob = blobObject.blob;
    }
  });
  const lectureName = document.getElementById('recordingNameInput').value;
  socket.on('allLectures', (lectures) => {
    let unique = true;
    lectures.forEach((onlineLecture) => {
      if (lectureName == onlineLecture.name) {
        unique = false;
      }
    });
    if (unique) {
      socket.emit('uploadLecture', lectureName, depthBlob, imageBlob);
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
  if (recFlag) {
    recording3D = false;
    if (mediaRecorderDepthStream != undefined && mediaRecorderImageStream != undefined) {
      mediaRecorderImageStream.stop();
      mediaRecorderDepthStream.stop();
    }
    document.getElementById('3DRecordIcon').style.display = 'block';
    document.getElementById('3DStopRecordIcon').style.display = 'none';
    recFlag = false;
  } else {
    recFlag = true;
    document.getElementById('3DRecordIcon').style.display = 'none';
    document.getElementById('3DStopRecordIcon').style.display = 'block';
    start3DRecording();
    recording3D = true;
  }
}

/**
 * Appears the file selecting tag.
 */
function rewatchLecture() {
  // document.getElementById('inputDiv').style.display = 'block';
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
