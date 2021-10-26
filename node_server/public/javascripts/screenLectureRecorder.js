/* eslint-disable prefer-const */
/* eslint-disable no-unused-vars */
let readyToRecord = false;

// eslint-disable-next-line prefer-const
let teacherStream = undefined;
// eslint-disable-next-line prefer-const
let screenShareStream = undefined;

let mediaRecorderTeacherStream = undefined;
let mediaRecorderScreenShareStream = undefined;

let base64TeacherStream = undefined;
let base64ScreenShareStream = undefined;


const recordedChunksTeacherStream = [];
const recordedChunksScreenShareStream = [];

const urls = [];
const blobs = [];

/**
 * Starts the 3D recording if all components are ready and record is clicked.
 */
function start3DRecording() {
  if (readyToRecord && teacherStream != undefined) {
    const options = {mimeType: 'video/webm'};

    mediaRecorderTeacherStream = new MediaRecorder(teacherStream, options);
    mediaRecorderTeacherStream.ondataavailable = function(e) {
      handleDataAvailable3DRecorder(e, {chunks: recordedChunksTeacherStream, name: 'teacher'});
    };
    mediaRecorderTeacherStream.start();

    if (screenShareStream != undefined) {
      mediaRecorderScreenShareStream = new MediaRecorder(screenShareStream, options);
      mediaRecorderScreenShareStream.ondataavailable = function(e) {
        handleDataAvailable3DRecorder(e, {chunks: recordedChunksScreenShareStream, name: 'screen'});
      };
      mediaRecorderScreenShareStream.start();
    }
  }
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
  if (recordedChunksMethod.name == 'teacher') {
    const downloadBlob = {blob: blob, name: 'teacherStream'};
    blobs.push(downloadBlob);

    const link = document.createElement('a');
    link.download = 'testDownload';
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    delete link;
  }

  if (recordedChunksMethod.name == 'screen') {
    // const downloadUrl3 = {url: url, name: 'screenShareStream'};
    // urls.push(downloadUrl3);
    const downloadBlob3 = {blob: blob, name: 'screenShareStream'};
    blobs.push(downloadBlob3);
  }

  if (blobs.length >= 2 || (blobs.length == 1 && mediaRecorderScreenShareStream == undefined)) {
    document.getElementById('recordingNameInputDiv').style.display = 'block';
  }
}

/**
 * uploads the lecture to the online database.
 */
async function uploadLecture() {
  blobs.forEach((blobObject) => {
    if (blobObject.name == 'teacherStream') {
      teacherBlob = blobObject.blob;
    }
    if (blobObject.name == 'screenShareStream') {
      screenShareBlob = blobObject.blob;
    }
  });
  const lectureName = document.getElementById('recordingNameInput').value;
  socket.on('allScreenLectures', (lectures) => {
    let unique = true;
    lectures.forEach((onlineLecture) => {
      if (lectureName == onlineLecture.name) {
        unique = false;
      }
    });
    if (unique) {
      const reader = new FileReader();
      reader.readAsDataURL(teacherBlob);
      reader.onloadend = function() {
        const base64data = reader.result;
        base64TeacherStream = base64data;
        if (base64ScreenShareStream != undefined || mediaRecorderScreenShareStream == undefined) {
          socket.emit('uploadScreenLecture', lectureName, base64TeacherStream, base64ScreenShareStream);
          document.getElementById('recordingNameInputDiv').style.display = 'none';
          console.log('lecture uploaded!');
        }
      };
      const reader2 = new FileReader();
      reader2.readAsDataURL(screenShareBlob);
      reader2.onloadend = function() {
        const base64data = reader2.result;
        base64ScreenShareStream = base64data;
        if (base64TeacherStream != undefined) {
          socket.emit('uploadScreenLecture', lectureName, base64TeacherStream, base64ScreenShareStream);
          document.getElementById('recordingNameInputDiv').style.display = 'none';
          console.log('lecture uploaded!');
        }
      };
    } else {
      alert('this lecture name already exists. Try something else.');
    }
  });
  socket.emit('getScreenLectures');
  console.log('lectures asked');
}

/**
 * Records if all streams are available or stops recording if it is recording.
 */
function record3DClicked() {
  if (readyToRecord) {
    recording3D = false;
    if (mediaRecorderTeacherStream != undefined) {
      mediaRecorderTeacherStream.stop();
    }
    if (mediaRecorderScreenShareStream != undefined) {
      mediaRecorderScreenShareStream.stop();
    }
    document.getElementById('3DRecordIcon').style.display = 'block';
    document.getElementById('3DStopRecordIcon').style.display = 'none';
    readyToRecord = false;
  } else {
    readyToRecord = true;
    document.getElementById('3DRecordIcon').style.display = 'none';
    document.getElementById('3DStopRecordIcon').style.display = 'block';
    start3DRecording();
    recording3D = true;
  }
}

socket.on('testBack', (stream) => {
  console.log(stream);
});
