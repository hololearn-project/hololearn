/**
 * Adds a user to the attendance list.
 * @param {String} studentName name of the student
 * @param {number} studentTable table that the student joined
 * @param {number} studentSeat seat at which the student sat
 */
function addStudentToList(studentName, // eslint-disable-line no-unused-vars
    studentTable, studentSeat) {
  const item = document.getElementById('exampleLi').cloneNode(true);
  const itemId = 'Student' + document.getElementById('attendanceList')
      .getElementsByTagName('li').length;
  item.id = itemId;
  document.getElementById('attendanceList').appendChild(item);
  document.getElementsByName('infoHolder')[1]
      .childNodes[1].innerHTML = studentName;
  document.getElementsByName('infoHolder')[1]
      .childNodes[1].style.setProperty('font-size', '24px', 'important');
  document.getElementsByName('infoHolder')[1]
      .childNodes[4].innerHTML += studentTable;
  document.getElementsByName('infoHolder')[1]
      .childNodes[7].innerHTML += studentSeat;
  document.getElementsByName('infoHolder')[1]
      .setAttribute('name', 'infoHolder' +
      (document.getElementById('attendanceList')
          .getElementsByTagName('li').length - 1));
  item.style.display = 'block';
}

/**
 * Opens the attendance list when it is closed and vice versa.
 */
function openOrCloseAttendance() { // eslint-disable-line no-unused-vars
  const list = document.getElementById('attendanceList');
  if (list.style.display == 'block') {
    list.style.display = 'none';
    if (list) {
      const example = document.getElementById('exampleLi');
      while (list.firstChild) {
        list.removeChild(list.firstChild);
      }
      list.appendChild(example);
    }
  } else {
    socket.emit('attendance');
    list.style.display = 'block';
  }
}
