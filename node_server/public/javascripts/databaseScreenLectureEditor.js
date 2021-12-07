/* eslint-disable no-unused-vars */
let lectureToRemove = undefined;
let loaded = false;

socket.on('allScreenLectures', (lectures) => {
  if (!loaded) {
    lectures.forEach((lecture) => {
      addCell(lecture);
      loaded = true;
    });
  }
});

socket.on('editCompleted', () => {
  location.reload();
});

socket.emit('getScreenLectures');

// eslint-disable-next-line valid-jsdoc
/**
 * Adds a lecture to the overview of lectures.
 * @param {lecture object} lecture the lceture to be added.
 */
function addCell(lecture) {
  const newCell = document.getElementById('exampleCell').cloneNode(true);
  newCell.innerHTML += lecture.name;
  newCell.style.display = 'block';
  newCell.childNodes[0].onclick = function() {
    lectureToEdit = lecture;
    document.getElementById('editBox').style.display = 'block';
  };
  newCell.childNodes[1].onclick = function() {
    lectureToRemove = lecture;
    document.getElementById('alertBox').style.display = 'block';
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
 *  Removes lecture from database.
 */
function removeLectureFromDatabase() {
  socket.emit('removeScreenLecture', lectureToRemove);
  document.getElementById('alertBox').style.display = 'none';
  location.reload();
}

/**
 *  Removes lecture from database.
 */
function editLectureFromDatabase() {
  socket.on('allScreenLectures', (lectures) => {
    let unique = true;
    lectures.forEach((onlineLecture) => {
      if (document.getElementById('nameEditInput').value == onlineLecture.name) {
        unique = false;
      }
    });
    if (unique) {
      socket.emit('editScreenLecture', lectureToEdit, document.getElementById('nameEditInput').value);
      document.getElementById('editBox').style.display = 'none';
    } else {
      alert('this lecture name already exists. Try something else.');
    }
  });
  socket.emit('getScreenLectures');
}

/**
 * Hides the alertBox
 */
function hideAlertBox() {
  document.getElementById('alertBox').style.display = 'none';
}

/**
 * Hides the editBox
 */
function hideEditBox() {
  document.getElementById('editBox').style.display = 'none';
}

