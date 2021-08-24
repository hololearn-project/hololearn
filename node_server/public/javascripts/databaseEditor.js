socket.on('allLectures', (lectures) => {
  lectures.forEach((lecture) => {
    addCell(lecture);
  });
});

socket.emit('getLectures');

// eslint-disable-next-line valid-jsdoc
/**
 * Adds a lecture to the overview of lectures.
 * @param {lecture object} lecture the lceture to be added.
 */
function addCell(lecture) {
  const newCell = document.getElementById('exampleCell').cloneNode(true);
  newCell.innerHTML += lecture.name;
  newCell.style.display = 'block';
  newCell.childNodes[1].onclick = function() {
    removeLectureFromDatabase(lecture);
  };

  const newDiv = document.createElement('div');
  newDiv.appendChild(newCell);
  newDiv.className = 'lectureDiv';
  if (document.getElementById('listEditor').childNodes.length > 3) {
    document.getElementById('listEditor').appendChild(document.createElement('br'));
  }
  document.getElementById('listEditor').appendChild(newDiv);
}

// eslint-disable-next-line valid-jsdoc
/**
 *
 * @param {lecture object} lecture the lecture to be removed
 */
function removeLectureFromDatabase(lecture) {
  socket.emit('removeLecture', lecture);
}


