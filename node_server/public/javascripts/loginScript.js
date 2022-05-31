let table = 1;

/**
 * Updates the seats once a new table is selected
 */
function tableChosen() { // eslint-disable-line no-unused-vars
  const tables = document.getElementById('tables');
  table = tables.value;
  selectedPosition = '';
  const checkboxes = document.getElementsByName('position');
  checkboxes.forEach((item) => {
    item.style.border = 'solid #000000';
    item.checked = false;
    const tag = document.createElement('p');
    const text = document.createTextNode(item.id.substring(4, 5));
    tag.appendChild(text);
    item.innerHTML = '';
    item.appendChild(tag);
  });

  socket.emit('getSeats', table);
}

/**
 * ticks the seat-box that was clicked and unticks the rest.
 * @param {checkbox} checkbox - the box that was clicked
 */
const positionClicked = function(checkbox) { // eslint-disable-line no-unused-vars, max-len
  if (checkbox.style.border != 'solid rgb(255, 0, 0)') {
    const checkboxes = document.getElementsByName('position');
    checkboxes.forEach((item) => {
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
const studentClicked = function(checkbox) { // eslint-disable-line no-unused-vars, max-len
  socket.emit('getSeats', table);
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
 * @param {checkbox} checkbox - the box that is clicked
 */
const teacherClicked = function(checkbox) { // eslint-disable-line no-unused-vars, max-len
  const container = document.getElementById('container');
  if (container.style.display == 'block') {
    container.style.display = 'none';
  }
  const checkboxes = document.getElementsByName('choice');
  checkboxes.forEach((item) => {
    if (item !== checkbox) item.checked = false;
  });
  if (checkbox.value == 'recorder' || checkbox.value == '3DRecorder' || checkbox.value == '3DReplay') {
    const nameInput = document.getElementById('nameInput');
    nameInput.style.display = 'none';
    const tableInput = document.getElementById('tableInput');
    tableInput.style.display = 'none';
  } else {
    const nameInput = document.getElementById('nameInput');
    nameInput.style.display = 'block';
    const tableInput = document.getElementById('tableInput');
    tableInput.style.display = 'block';
  }
};

/**
 * Starts the 3D environment with the chosen seat or as a teacher.
 */
// eslint-disable-next-line no-unused-vars
const submitAnswer = async function() {
  const radios = document.getElementsByName('choice');
  let val= '';
  nameUser = document.getElementById('name').value;
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
      case '1':
        a = 0;
        b = 7;
        c = 6;
        await checkMedia(false);
        return;
      case '2':
        a = 0;
        b = 7;
        c = 6;
        await checkMedia(false);
        return;
      case '3':
        a = 0;
        b = 7;
        c = 6;
        await checkMedia(false);
        return;

      case '4':
        a = 0;
        b = 7;
        c = 6;
        await checkMedia(false);
        return;

      case '5':
        a = 0;
        b = 7;
        c = 6;
        await checkMedia(false);
        return;
    }
    // return;
  }
  if (val == 'recorder') {
    const div = document.getElementById('studentTeacher');
    div.parentNode.removeChild(div);
    a = 0;
    b = 7;
    c = 6;
    isTeacher = false;
    table = -1;
    load3DEnvironment();
    return;
  }
  if (val == '3DRecorder') {
    const div = document.getElementById('studentTeacher');
    div.parentNode.removeChild(div);
    a = 0;
    b = 7;
    c = 6;
    isTeacher = false;
    table = -2;
    load3DEnvironment();
    return;
  }
  if (val == '3DReplay') {
    const div = document.getElementById('studentTeacher');
    div.parentNode.removeChild(div);
    a = 0;
    b = 7;
    c = 6;
    isTeacher = false;
    table = -3;
    load3DEnvironment();
    return;
  }
  alert('Pick a valid option!');
};
