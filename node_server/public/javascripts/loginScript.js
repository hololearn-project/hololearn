// Javascript that handles the login page of the 3D environment.

/* eslint-disable no-unused-vars */

let table = 1;

// Gets all users for information about how filled rooms are.
socket.emit('getUsers');

// When receiving all the users it fills in information of how many users are in every room.
socket.on('users', (users) => {
  const options = document.getElementsByName('room');
  const roomsFilled = [];
  for (let i = 0; i < options.length; i++) {
    roomsFilled.push(0);
  }
  users.forEach((user) => {
    if (user.seat != 0) {
      roomsFilled[user.table - 1]++;
    }
  });
  options.forEach((option) => {
    const text = option.value + ':   ' +
        roomsFilled[option.value - 1] + '/' + (positions.length - 1);
    option.innerHTML = text;
  });
});

// Sets the name of taken seats
socket.on('userSeats', (seats) => {
  for (let i = 0; i < seats.length; i++) {
    if (!seats[i].seat <= 0) {
      const elemId = 'Seat' + seats[i].seat;
      document.getElementById(elemId).style.border = 'solid rgb(255, 0, 0)';
      const tag = document.createElement('p');
      let name = seats[i].name.substring(0, 5);
      if (seats[i].name.length > 5) {
        // If the name is to long, it is cut.
        name = name + '...';
        tag.style.fontSize = '15px';
      }
      const text = document.createTextNode(name);
      tag.appendChild(text);
      const element = document.getElementById(elemId);
      element.innerHTML = '';
      element.appendChild(tag);
    }
  }
});

// When you connect but the seat is taken, an alert is shown and the page is reloaded after.
// This resets the login process since it failed.
socket.on('seat taken', () => {
  alert('seat already taken');
  location.reload();
});


/**
 * Updates the seats once a new table is selected
 */
function tableChosen() {
  const tables = document.getElementById('tables');
  table = tables.value;
  selectedPosition = '';
  const checkboxes = document.getElementsByName('position');
  // Set all boxes for the seats to unchecked
  checkboxes.forEach((item) => {
    item.style.border = 'solid #000000';
    item.checked = false;
    const tag = document.createElement('p');
    const text = document.createTextNode(item.id.substring(4, 5));
    tag.appendChild(text);
    item.innerHTML = '';
    item.appendChild(tag);
  });

  // Get the seats that are taken from the selected table so chosen seats are unable to be selected.
  socket.emit('getSeats', table);
}

/**
 * ticks the seat-box that was clicked and unticks the rest.
 * @param {checkbox} checkbox - the box that was clicked
 */
const positionClicked = function(checkbox) {
  // If the seats checkbox is red it is already in use and cannot be selected.
  if (checkbox.style.border != 'solid rgb(255, 0, 0)') {
    const checkboxes = document.getElementsByName('position');
    checkboxes.forEach((item) => {
      // Set all not used or selected seats to the default box.
      if (item !== checkbox && item.style.border != 'solid rgb(255, 0, 0)') {
        item.style.border = 'solid #000000';
        item.checked = false;
      }
    });
    checkbox.style.border = 'solid green';
    selectedPosition = checkbox.textContent.trim();
  }
};

/**
 * reveals the possible positions and unticks the teacher box.
 * @param {checkbox} checkbox - the box clicked
 */
const studentClicked = function(checkbox) {
  // Gets all the seats so the number of students in a table and the selected seats can be shown.
  socket.emit('getSeats', table);
  // Container is the container that holds all possible seats in a room.
  const container = document.getElementById('container');
  if (container.style.display == 'block') {
    container.style.display = 'none';
  } else {
    container.style.display = 'block';
  }
  const checkboxes = document.getElementsByName('choice');
  checkboxes.forEach((item) => {
    if (item !== checkbox) item.checked = false;
  });
  const nameInput = document.getElementById('nameInput');
  nameInput.style.display = 'block';
  const tableInput = document.getElementById('tableInput');
  tableInput.style.display = 'block';
};

/**
 * hides the possible positions for students and unticks the student box.
 * This function is also used for the record and replay user types.
 * @param {checkbox} checkbox - the box that is clicked
 */
const teacherClicked = function(checkbox) {
  // Container is the container that holds all possible seats in a room.
  const container = document.getElementById('container');
  if (container.style.display == 'block') {
    container.style.display = 'none';
  }
  const checkboxes = document.getElementsByName('choice');
  checkboxes.forEach((item) => {
    if (item !== checkbox) item.checked = false;
  });
  if (checkbox.value == 'recorder' || checkbox.value == '3DRecorder' || checkbox.value == '3DReplay') {
    // For all the record related types there is no name needed.
    const nameInput = document.getElementById('nameInput');
    nameInput.style.display = 'none';
    const tableInput = document.getElementById('tableInput');
    tableInput.style.display = 'none';
  } else {
    // The user is a teacher
    const nameInput = document.getElementById('nameInput');
    nameInput.style.display = 'block';
    const tableInput = document.getElementById('tableInput');
    tableInput.style.display = 'block';
  }
};

/**
 * Starts the 3D environment with the chosen seat or as a teacher.
 */
const submitAnswer = async function() {
  const radios = document.getElementsByName('choice');
  let val= '';
  nameUser = document.getElementById('name').value;
  // Checks the type of the user
  for (let i = 0, length = radios.length; i < length; i++) {
    if (radios[i].checked) {
      val = radios[i].value;
      break;
    }
  }
  if (val == 'teacher') {
    if (nameUser == '') {
      alert('Please fill in your name');
      return;
    }
    const div = document.getElementById('studentTeacher');
    div.parentNode.removeChild(div);
    // a, b and c are the position of the teacher.
    // b is the height, a and c the x and z value in the environment.
    a = 0;
    b = 8;
    c = 28;
    isTeacher = true;
    await checkMedia(true);
    return;
  }
  if (val == 'student') {
    if (nameUser == '') {
      alert('Please fill in your name');
      return;
    }
    const div = document.getElementById('studentTeacher');
    div.parentNode.removeChild(div);
    switch (selectedPosition) {
      // a, b and c are the position of the student.
      // b is the height, a and c the x and z value in the environment.
      case '1':
        a = -5;
        b = 7;
        c = 5;
        await checkMedia(false);
        return;
      case '2':
        a = 0;
        b = 7;
        c = 6;
        await checkMedia(false);
        return;
      case '3':
        a = 5;
        b = 7;
        c = 5;
        await checkMedia(false);
        return;

      case '4':
        a = -16;
        b = 7;
        c = 14;
        await checkMedia(false);
        return;

      case '5':
        a = 16;
        b = 7;
        c = 14;
        await checkMedia(false);
        return;
    }
  }
  if (val == 'recorder') {
    const div = document.getElementById('studentTeacher');
    div.parentNode.removeChild(div);
    // a, b and c are the position of the recorder.
    // b is the height, a and c the x and z value in the environment.
    a = 0;
    b = 7;
    c = 6;
    isTeacher = false;
    // Table -1 makes sure the recorder is not in a room with students.
    table = -1;
    load3DEnvironment();
    return;
  }
  if (val == '3DRecorder') {
    const div = document.getElementById('studentTeacher');
    div.parentNode.removeChild(div);
    // a, b and c are the position of the recorder.
    // b is the height, a and c the x and z value in the environment.
    a = 0;
    b = 7;
    c = 6;
    isTeacher = false;
    // Table -2 makes sure the recorder is not in a room with students.
    table = -2;
    load3DEnvironment();
    return;
  }
  if (val == '3DReplay') {
    const div = document.getElementById('studentTeacher');
    div.parentNode.removeChild(div);
    // a, b and c are the position of the user.
    // b is the height, a and c the x and z value in the environment.
    a = 0;
    b = 7;
    c = 6;
    isTeacher = false;
    // Table -3 makes sure the recorder is not in a room with students.
    table = -3;
    load3DEnvironment();
    return;
  }
  // Alert for when the user did not pick one of the user types.
  alert('Pick a valid option!');
};
