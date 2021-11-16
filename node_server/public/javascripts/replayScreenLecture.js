/* eslint-disable new-cap */
socket.on('onlyTeacherLecture', () => {
  teacherBase64 = '';
  socket.emit('getNextChunkTeacher', 0);
  socket.on('nextTeacherChunk', (chunk, nextStart) => {
    teacherBase64 += chunk;
    socket.emit('getNextChunkTeacher', nextStart);
  });
});

socket.on('screenShareIncludedLecture', () => {
  teacherBase64 = '';
  screenShareBase64 = '';
  socket.emit('getNextChunkTeacher', 0);
  socket.emit('getNextChunkScreenShare', 0);
  socket.on('nextTeacherChunk', (chunk, nextStart) => {
    teacherBase64 += chunk;
    socket.emit('getNextChunkTeacher', nextStart);
  });
  socket.on('nextScreenShareChunk', (chunk, nextStart) => {
    screenShareBase64 += chunk;
    socket.emit('getNextChunkScreenShare', nextStart);
  });
  socket.on('playLecture', () => {
    playIt(teacherBase64, screenShareBase64);
  });
});

// eslint-disable-next-line require-jsdoc
async function playIt(teacherBase64, screenShareBase64) {
  // eslint-disable-next-line max-len
  const teacherBlob = Base64ToBlob(teacherBase64.substring(teacherBase64.indexOf(',')+1, teacherBase64.length));
  document.getElementById('teacher').src = URL.createObjectURL(teacherBlob);

  // eslint-disable-next-line max-len
  const screenShareBlob = Base64ToBlob(screenShareBase64.substring(screenShareBase64.indexOf(',')+1, screenShareBase64.length));
  window.open(URL.createObjectURL(screenShareBlob), '_blank').focus();
  document.getElementById('body').style.background = 'black';
}

/**
 * gets lecture from server and plays it on the page.
 * @param {String} lectureName the name of the lecture
 */
function getLecture(lectureName) {
  socket.emit('getScreenLecture', lectureName);
}

// eslint-disable-next-line require-jsdoc
function Base64ToBlob(b64Data, contentType = '', sliceSize = 512) {
  const byteCharacters = atob(b64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers = new Array(slice.length);

    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, {type: 'video/webm'});
  return blob;
}

/**
 * Gets lectures for replay from server and shows them to the user.
 */
function getLecturesForReplay() {
  document.getElementById('selectLectureRewatch').style.display = 'block';
  socket.on('allScreenLectures', (lectures) => {
    lectures.forEach((lecture) => {
      const name = lecture.name;
      const option = document.createElement('DIV');
      option.setAttribute('id', lecture.name);
      option.width = 300;
      option.style.padding = '5px';
      option.className = 'lectureRewatch';
      option.setAttribute('onClick', 'replay(\'' + name + '\');');

      const text = document.createElement('H3');
      const t = document.createTextNode(lecture.name);
      text.appendChild(t);
      option.appendChild(text);

      document.getElementById('selectLectureRewatch').appendChild(option);
    });
  });
  socket.emit('getScreenLectures');
}

/**
 * plays the lecture chosen by the user.
 * @param {String} lectureName name of the chosen lecture.
 */
function replay(lectureName) {
  document.getElementById('selectMic').style.display = 'none';
  document.getElementById('select').style.display = 'none';
  document.getElementById('camText').style.display = 'none';
  document.getElementById('micText').style.display = 'none';
  document.getElementById('webcam').style.display = 'none';
  document.getElementById('webcam').muted = true;
  document.getElementById('logInButton').style.display = 'none';
  document.getElementById('selectLectureRewatch').style.display = 'none';
  document.getElementById('replayButton').style.display = 'none';

  socket.emit('getScreenLecture', lectureName);
}
