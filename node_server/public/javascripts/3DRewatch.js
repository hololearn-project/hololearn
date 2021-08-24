let depthStreamDataBase = undefined;
let imageStreamDataBase = undefined;
let screenShareStreamDataBase = undefined;
let lecturesLoaded = false;

/**
 * Displays all lectures that can be watched.
 */
function displayLectures() {
  document.getElementById('selectLectureRewatch').style.display = 'block';
  socket.emit('getLectures');
  socket.on('allLectures', (lectures) => {
    if (!lecturesLoaded) {
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
        option.setAttribute('onClick', 'getLecture(' + lectureStreams +')');

        const text = document.createElement('H3');
        const t = document.createTextNode(lecture.name);
        text.appendChild(t);
        option.appendChild(text);

        document.getElementById('selectLectureRewatch').appendChild(option);
      });
    }
  });
}

// eslint-disable-next-line valid-jsdoc
/**
 * Gets the streams of the given lectures.
 * @param {lecture object} lecture The lecture to be retrieved.
 */
function getLecture(lecture) {
  document.getElementById('selectLectureRewatch').style.display = 'none';
  socket.emit('getDepthStream', lecture.depthStreamId);
  socket.emit('getImageStream', lecture.imageStreamId);
  socket.emit('getScreenShareStream', lecture.screenShareStreamId);

  socket.on('depthStream', (depthStream) => {
    depthStreamDataBase = depthStream[0].stream;
    if (depthStreamDataBase != undefined & imageStreamDataBase != undefined & screenShareStreamDataBase != undefined) {
      startRewatch();
    }
  });
  socket.on('imageStream', (imageStream) => {
    imageStreamDataBase = imageStream[0].stream;
    if (depthStreamDataBase != undefined & imageStreamDataBase != undefined & screenShareStreamDataBase != undefined) {
      startRewatch();
    }
  });
  socket.on('screenShareStream', (screenShareStream) => {
    screenShareStreamDataBase = screenShareStream[0].stream;
    if (depthStreamDataBase != undefined & imageStreamDataBase != undefined & screenShareStreamDataBase != undefined) {
      startRewatch();
    }
  });
}

/**
 * starts the rewatching of the lecture retrieved from the database.
 */
function startRewatch() {
  console.log(imageStreamDataBase);
  document.getElementById('lidarVideoStream1').src = URL.createObjectURL(new Blob([imageStreamDataBase]));
  document.getElementById('lidarVideoStream1').play();

  document.getElementById('lidarVideoStream2').src = URL.createObjectURL(new Blob([depthStreamDataBase]));
  document.getElementById('lidarVideoStream2').play();

  addScreenShare(URL.createObjectURL(new Blob([screenShareStreamDataBase])), true);
}
