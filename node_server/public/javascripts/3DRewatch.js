/* eslint-disable valid-jsdoc */
/* eslint-disable no-unused-vars */
let depthStreamDataBase = undefined;
let imageStreamDataBase = undefined;
let screenShareStreamDataBase = undefined;
let lecturesLoaded = false;

/**
 * Displays all lectures that can be watched.
 */
function displayLectures() {
  document.getElementById('selectLectureRewatch3D').style.display = 'block';
  socket.emit('getLectures');
  // Gets all lectures from the server and displays them in selectLectureRewatch3D.
  socket.on('allLectures', (lectures) => {
    if (!lecturesLoaded) {
      lecturesLoaded = true;
      lectures.forEach((lecture) => {
        const option = document.createElement('DIV');
        option.setAttribute('id', lecture.name);
        option.width = 300;
        option.style.padding = '5px';
        option.className = 'lectureRewatch';
        const lectureStreams =
        '{' + 'depthStreamId: ' + lecture.depthStreamId +
        ', ' + 'imageStreamId: ' + lecture.imageStreamId +
        ', ' + 'screenShareStreamId: ' + lecture.screenShareStreamId +
        '}';
        // When this lecture is selected it will get the lecture from the server and display it.
        option.setAttribute('onClick', 'getLecture(' + lectureStreams +')');

        const text = document.createElement('H3');
        const t = document.createTextNode(lecture.name);
        text.appendChild(t);
        option.appendChild(text);

        document.getElementById('selectLectureRewatch3D').appendChild(option);
      });
    }
  });
}

/**
 * Gets the streams of the given lecture from the server to display in the environment.
 * @param {lecture object} lecture The lecture to be retrieved.
 */
function getLecture(lecture) {
  document.getElementById('selectLectureRewatch3D').style.display = 'none';

  socket.on('depthStream', (depthStream) => {
    depthStreamDataBase = depthStream[0].stream;
    // Checks if all streams are present if so it will start the lecture.
    // Otherwise it will do nothing and when the last stream arrives it will play the lecture.
    if (depthStreamDataBase != undefined & imageStreamDataBase != undefined & screenShareStreamDataBase != undefined) {
      startRewatch();
    }
  });
  // Checks if all streams are present if so it will start the lecture.
  // Otherwise it will do nothing and when the last stream arrives it will play the lecture.
  socket.on('imageStream', (imageStream) => {
    imageStreamDataBase = imageStream[0].stream;
    if (depthStreamDataBase != undefined & imageStreamDataBase != undefined & screenShareStreamDataBase != undefined) {
      startRewatch();
    }
  });
  // Checks if all streams are present if so it will start the lecture.
  // Otherwise it will do nothing and when the last stream arrives it will play the lecture.
  socket.on('screenShareStream', (screenShareStream) => {
    screenShareStreamDataBase = screenShareStream[0].stream;
    if (depthStreamDataBase != undefined & imageStreamDataBase != undefined & screenShareStreamDataBase != undefined) {
      startRewatch();
    }
  });

  // Gets all the streams from the server.
  socket.emit('getDepthStream', lecture.depthStreamId);
  socket.emit('getImageStream', lecture.imageStreamId);
  socket.emit('getScreenShareStream', lecture.screenShareStreamId);
}

/**
 * starts the rewatching of the lecture retrieved from the database.
 */
function startRewatch() {
  document.getElementById('lidarVideoStream1').src = URL.createObjectURL(new Blob([imageStreamDataBase]));
  document.getElementById('lidarVideoStream1').play();

  document.getElementById('lidarVideoStream2').src = URL.createObjectURL(new Blob([depthStreamDataBase]));
  document.getElementById('lidarVideoStream2').play();

  addScreenShare(URL.createObjectURL(new Blob([screenShareStreamDataBase])), true);
}
