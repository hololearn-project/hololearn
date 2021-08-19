/**
 * Displays all lectures that can be watched.
 */
function displayLectures() {
  document.getElementById('selectLectureRewatch').style.display = 'block';
  socket.emit('getLectures');
  socket.on('allLectures', (lectures) => {
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
  });
}

// eslint-disable-next-line valid-jsdoc
/**
 * Gets the streams of the given lectures.
 * @param {lecture object} lecture The lecture to be retrieved.
 */
function getLecture(lecture) {
  document.getElementById('selectLectureRewatch').style.display = 'none';
  console.log('getLecture: ' + lecture.depthStreamId);
  socket.emit('getDepthStream', lecture.depthStreamId);
  socket.emit('getImageStream', lecture.imageStreamId);
  socket.emit('getScreenShareStream', lecture.screenShareStreamId);
}
