// Javascript that does the editing of the lectures of the screen hologram that are stored on the server.

/* eslint-disable valid-jsdoc */
/* eslint-disable no-unused-vars */
let lectureToRemove = undefined;
let loaded = false;

// Adds all lectures to the overview on the page.
socket.on('allScreenLectures', (lectures) => {
  if (!loaded) {
    lectures.forEach((lecture) => {
      addCell(lecture);
      loaded = true;
    });
  }
});

// When the server responds that the database has been edited,
// reload the webpage to see the new content.
socket.on('editCompleted', () => {
  location.reload();
});

// Gets all lecture right when the user loads the webpage.
socket.emit('getScreenLectures');

/**
 * Adds a lecture to the overview of lectures.
 * @param {lecture object} lecture the lceture to be added.
 */
function addCell(lecture) {
  // Copies the example cell and then edits the copy and adds it to the list of all lectures.
  const newCell = document.getElementById('exampleCell').cloneNode(true);
  newCell.innerHTML += lecture.name;
  newCell.style.display = 'block';
  newCell.childNodes[0].onclick = function() {
    lectureToEdit = lecture;
    document.getElementById('editBox').style.display = 'block';
  };
  newCell.childNodes[1].onclick = function() {
    lectureToRemove = lecture;
    // Before a lecture gets removed, an alert is shown to make sure it was not an accident.
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

/**
 *  Removes the lecture from the server.
 */
function removeLectureFromDatabase() {
  socket.emit('removeScreenLecture', lectureToRemove);
  document.getElementById('alertBox').style.display = 'none';
  location.reload();
}

/**
 *  Edits a lecture from the server. Only the name can be changed.
 */
function editLectureFromDatabase() {
  socket.on('allScreenLectures', (lectures) => {
    let unique = true;
    // Checks if the new lecture name is unique otherwise the user has to pick a different name.
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

