/* eslint-disable no-unused-vars */
// Javascript file for the attendance list which shows which student is in which room,
// and allows for the teacher to watch a specific room.
// The attendance list can be viewed by clicking the second button from the right as a teacher in the environment.
// Note: The word table and room are both used to describe a seperate group of students that watch the lecture together.

let currentTableView = undefined;

socket.on('attendanceList', (list) => {
  list.forEach((user) => {
    // Adds student to the attendance list.
    addStudentToList(user.name, user.table, user.seat);
  });
});

/**
 * Adds a user to the attendance list.
 * @param {String} studentName name of the student
 * @param {number} studentTable table/room that the student joined
 * @param {number} studentSeat seat at which the student sat
 */
function addStudentToList(studentName,
    studentTable, studentSeat) {
  // Makes a copy of the example of a list item and edits it to the current student.
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
  if (document.getElementById('attendanceListWrapper').
      style.display == 'block') {
    document.getElementById('attendanceListWrapper').style.display = 'none';
    if (list) {
      const example = document.getElementById('exampleLi');
      // Empties the attendance list so older lists are not on the new list.
      while (list.firstChild) {
        list.removeChild(list.firstChild);
      }
      list.appendChild(example);
    }
  } else {
    if (currentTableView == undefined) {
      currentTableView = table;
    }
    document.getElementById('roomDisplay').innerHTML = 'Room ' +
     currentTableView;
    socket.emit('attendance', currentTableView);
    document.getElementById('attendanceListWrapper').style.display = 'block';
  }
}

/**
 * Gets the users in the room that the teacher is looking at.
 */
function getAttendanceoverView() {
  if (currentTableView == undefined) {
    currentTableView = table;
  }
  const list = document.getElementById('attendanceList');
  document.getElementById('roomDisplay').innerHTML = 'Room ' + currentTableView;
  const example = document.getElementById('exampleLi');
  // Empties the attendance list so older lists are not on the new list.
  while (list.firstChild) {
    list.removeChild(list.firstChild);
  }
  list.appendChild(example);
  socket.emit('attendance', currentTableView);
}

/**
 * Retreives the information of all the rooms and then goes to the next room in the view where students are in.
 * Meaning if the teacher is watching room 1 and room 2 is empty, the teacher will go to room 3,
 * assuming there are students in room 3.
 */
function nextTable() {
  socket.emit('getUsersTablesNext');
}

/**
 * Retreives the information of all the rooms and then goes to the previous room in the view, where students are in.
 * Meaning if the teacher is watching room 3 and room 2 is empty, the teacher will go to room 1,
 * assuming there are students in room 1.
 */
function previousTable() {
  socket.emit('getUsersTablesPrevious');
}

socket.on('userTablesNext', (users) => {
  const filledTables = [];
  users.forEach((user) => {
    // If the room is not already in the list of rooms then add it.
    if ((!filledTables.includes(user.table))) {
      filledTables.push(user.table);
    }
  });
  // Sort the rooms
  filledTables.sort(function(a, b) {
    return a - b;
  });
  // If the current room is not in the list currently then start from the first room
  if (!filledTables.includes(currentTableView) && filledTables.length != 0) {
    currentTableView = filledTables[0];
  }
  for (let i = 0; i != filledTables.length; i++) {
    if (filledTables[i] == currentTableView) {
      if (i + 1 >= filledTables.length) {
        // If we are in the last room then the next room is the first room.
        currentTableView = filledTables[0];
        break;
      } else {
        // The room we are going to watch is the room after the current room.
        currentTableView = filledTables[i + 1];
        break;
      }
    }
  }
  getAttendanceoverView();
});

socket.on('userTablesPrevious', (users) => {
  const filledTables = [];
  users.forEach((user) => {
    // If the room is not already in the list of rooms then add it.
    if ((!filledTables.includes(user.table))) {
      filledTables.push(user.table);
    }
  });
  filledTables.sort(function(a, b) {
    return a - b;
  });
  // If the current room is not in the list currently then start from the first room
  if (!filledTables.includes(currentTableView) && filledTables.length != 0) {
    currentTableView = filledTables[0];
  }
  for (let i = 0; i != filledTables.length; i++) {
    if (filledTables[i] == currentTableView) {
      if (i - 1 < 0) {
        // If we are in the first room then the previous room is the last room.
        currentTableView = filledTables[filledTables.length - 1];
        break;
      } else {
        // The room we are going to watch is the room before the current room.
        currentTableView = filledTables[i - 1];
        break;
      }
    }
  }
  getAttendanceoverView();
});

