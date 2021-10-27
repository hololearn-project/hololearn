let autoRotate = false;
let intervalRotate = '';
let doubleClick = false;

/**
 * Activates when rotate button clicked.
 */
function rotateClassroomClicked() {
  setTimeout(function() {
    if (!doubleClick) {
      socket.emit('rotateClicked');
    }
  }, 1000);
}

/**
 * Activates when rotate button doubleclicked.
 */
function doubleClickClassroom() { // eslint-disable-line no-unused-vars
  doubleClick = true;
  if (autoRotate) {
    autoRotate = false;
    document.getElementById('rotateClassroom')
        .style.background = 'red';
    clearInterval(intervalRotate);
  } else {
    autoRotate = true;
    document.getElementById('rotateClassroom')
        .style.background = 'rgb(0, 196, 65)';
    intervalRotate = setInterval(() => {
      rotateClassroomClicked();
    }, 10000);
  }
  setTimeout(function() {
    doubleClick = false;
  }, 1100);
}

