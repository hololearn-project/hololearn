/* eslint-disable no-unused-vars */
isTeacher = false;
table = -4;
selectedPosition = -7;
const UNIQUE_USER_ID = Math.random().toString(36).substring(7);
userClassroomId = 'defaultClassroom';
document.getElementById('buttonGroup').style.width = '60px';
document.getElementById('buttonGroup').style.marginLeft = 'calc((100% - 60px) / 2)';

// eslint-disable-next-line require-jsdoc
function startSharing() {
  document.getElementById('screenShareOption').style.display = 'none';
  document.getElementById('screenSharePlayer').style.display = 'block';
  startConnecting(false, 'slidePlayer');
}

/**
 * Rotates the video of the teacher.
 */
function rotateTeacher() {
  const teacherview = document.getElementById('outputCanvas');
  const currentClass = teacherview.classList[0];
  teacherview.classList.remove(currentClass);
  switch (currentClass) {
    case 'rotateRight':
      teacherview.classList.add('rotateDown');
      break;
    case 'rotateDown':
      teacherview.classList.add('rotateLeft');
      break;
    case 'rotateLeft':
      teacherview.classList.add('rotateUp');
      break;
    case 'rotateUp':
      teacherview.classList.add('rotateRight');
      break;
  }
}

// eslint-disable-next-line require-jsdoc
function closeWindow() {
  close();
}
