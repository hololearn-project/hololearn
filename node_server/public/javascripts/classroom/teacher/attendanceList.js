let currentTableView = undefined;

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
  if (document.getElementById('attendanceListWrapper').
      style.display == 'block') {
    document.getElementById('attendanceListWrapper').style.display = 'none';
    if (list) {
      const example = document.getElementById('exampleLi');
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
  while (list.firstChild) {
    list.removeChild(list.firstChild);
  }
  list.appendChild(example);
  socket.emit('attendance', currentTableView);
}

/* eslint-disable no-unused-vars */
/**
 * Retreives the information of the next table.
 */
function nextTable() {
  socket.emit('getUsersTablesNext');
}

socket.on('userTablesNext', (users) => {
  const filledTables = [];
  users.forEach((user) => {
    if ((!filledTables.includes(user.table))) {
      filledTables.push(user.table);
    }
  });
  filledTables.sort(function(a, b) {
    return a - b;
  });
  if (!filledTables.includes(currentTableView) && filledTables.length != 0) {
    currentTableView = filledTables[0];
  }
  for (let i = 0; i != filledTables.length; i++) {
    if (filledTables[i] == currentTableView) {
      if (i + 1 >= filledTables.length) {
        currentTableView = filledTables[0];
        break;
      } else {
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
    if ((!filledTables.includes(user.table))) {
      filledTables.push(user.table);
    }
  });
  filledTables.sort(function(a, b) {
    return a - b;
  });
  if (!filledTables.includes(currentTableView) && filledTables.length != 0) {
    currentTableView = filledTables[0];
  }
  for (let i = 0; i != filledTables.length; i++) {
    if (filledTables[i] == currentTableView) {
      if (i - 1 < 0) {
        currentTableView = filledTables[filledTables.length - 1];
        break;
      } else {
        currentTableView = filledTables[i - 1];
        break;
      }
    }
  }
  getAttendanceoverView();
});

/**
 * Gets the information of the previous table.
 */
function previousTable() {
  socket.emit('getUsersTablesPrevious');
}
