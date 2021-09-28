/* eslint-disable no-unused-vars */
isTeacher = false;
table = -4;
selectedPosition = -5;
// eslint-disable-next-line no-unused-vars
const UNIQUE_USER_ID = Math.random().toString(36).substring(7);
userClassroomId = 'defaultClassroom';
getCamerasAndMics();
document.getElementById('camText').style.display = 'block';
document.getElementById('micText').style.display = 'block';
document.getElementById('selectMic').style.display = 'block';
document.getElementById('select').style.display = 'block';

/**
 * starts sending the vid.
 */
function startProjecting() {
  document.getElementById('selectMic').style.display = 'none';
  document.getElementById('select').style.display = 'none';
  document.getElementById('camText').style.display = 'none';
  document.getElementById('micText').style.display = 'none';
  const webcam = document.getElementById('webcam');
  // document.getElementById('webcam').style.display = 'none';
  webcam.muted = true;
  webcam.style.bottom = '120px';
  webcam.style.right = '75px';
  webcam.style.position = 'absolute';

  document.getElementById('logInButton').style.display = 'none';
  startConnecting(false, 'teacherProjector');
}
