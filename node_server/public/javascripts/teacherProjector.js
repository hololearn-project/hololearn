/* eslint-disable no-unused-vars */
isTeacher = false;
table = -4;
selectedPosition = -5;
removedBackgroundStream = '';
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
  document.getElementById('webcam').style.display = 'none';


  document.getElementById('logInButton').style.display = 'none';
  startConnecting(false, 'teacherProjector');
}

// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line require-jsdoc
function utf8ArrayToStr(array) {
  let out; let i; let len; let c;
  let char2; let char3;

  out = '';
  // eslint-disable-next-line prefer-const
  len = array.length;
  i = 0;
  while (i < len) {
    c = array[i++];
    switch (c >> 4) {
      case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
      // 0xxxxxxx
        out += String.fromCharCode(c);
        break;
      case 12: case 13:
        // 110x xxxx   10xx xxxx
        char2 = array[i++];
        out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
        break;
      case 14:
        // 1110 xxxx  10xx xxxx  10xx xxxx
        char2 = array[i++];
        char3 = array[i++];
        out += String.fromCharCode(((c & 0x0F) << 12) |
                     ((char2 & 0x3F) << 6) |
                     ((char3 & 0x3F) << 0));
        break;
    }
  }

  return out;
}
