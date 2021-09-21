let positionalHearing = true;
const allDirections =
[
  [[0, 0], [1.2211, 2.0729], [1.0982, 1.8671], [-1.4373, -0.434], [0.8838, 1.5069]],
  [[-2.0781, -1.5522], [0, 0], [1.13635, 2.4898], [-1.5036, -0.064], [0.6289, 1.4007]],
  [[-1.9358, -1.1439], [-2.0558, -1.1125], [0, 0], [-1.4756, -0.7866], [0.5512, 1.234]],
  [[1.8175, 2.5522], [1.8661, 2.4692], [1.6917, 2.2522], [0, 0], [1.1314, 1.829]],
  [[-2.292, -1.7403], [-2.395, -1.8232], [-2.6294, -1.9261], [-1.8175, -1.1429], [0, 0]],
];

let unmutedSeats = [];

// eslint-disable-next-line require-jsdoc
function togglePositionalHearing() {
  if (positionalHearing &! isTeacher) {
    positionalHearing = false;
    activeconnections.forEach((connection) => {
      connection.peerObject.send(String('unmute ' + selectedPosition));
    });
    unmutedSeats = [1, 2, 3, 4, 5];
  } else {
    positionalHearing = true;
    setPositionalHearing(rotationNow);
  }
}

/* eslint-disable require-jsdoc */
function setPositionalHearing(rotation) {
  if (!positionalHearing || isTeacher) {
    return;
  }

  const maxDirections = allDirections[selectedPosition - 1];
  const newUnmutedSeats = [];
  for (let i = 0; i != maxDirections.length; i++) {
    // No calculations for the seat the student is sitting on himself.
    if (i != selectedPosition - 1) {
      // If student is looking towards a seat add them to the
      if (rotation >= maxDirections[i][0] && rotation <= maxDirections[i][1]) {
        newUnmutedSeats.push(i + 1);
      }
    }
  }
  // If a seat that was muted should now be unmuted, unmute
  for (let i = 0; i != newUnmutedSeats.length; i++) {
    if (!unmutedSeats.includes(newUnmutedSeats[i])) {
      // Unmute seat
      activeconnections.forEach((connection) => {
        if (connection.seat == newUnmutedSeats[i] && connection.seat != 0) {
          // connection.peerObject.send(['unmute', selectedPosition]);
          connection.peerObject.send(String('unmute ' + selectedPosition));
        }
      });
    }
  }
  // If a seat that was unmuted should now be muted, mute
  for (let i = 0; i != unmutedSeats.length; i++) {
    if (!newUnmutedSeats.includes(unmutedSeats[i])) {
      // Mute seat
      activeconnections.forEach((connection) => {
        if (connection.seat == unmutedSeats[i] && connection.seat != 0 &! isTeacher) {
          // connection.peerObject.send(['mute', selectedPosition]);
          connection.peerObject.send(String('mute ' + selectedPosition));
        }
      });
    }
  }

  unmutedSeats = newUnmutedSeats;
}

// eslint-disable-next-line no-unused-vars
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
