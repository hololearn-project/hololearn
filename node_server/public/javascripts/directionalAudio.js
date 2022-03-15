// Javascript for directional audio in the 3D environment. Audio contexts are placed in the environment,
// where the other user is seated and sound will come from that direction.
// This can be turned off and on in the mic section in the buttongroup. It is on by default.

/* eslint-disable prefer-const */
/* eslint-disable no-unused-vars */
/* eslint-disable require-jsdoc */

panners = new Array(positions.length + 1);
let threeDAudio = true;

/**
 * Makes the audiocontext and places it on the right spot.
 * @param {int} seat seat that the other user is in.
 * @param {MediaStream} stream the audio stream of the user.
 */
async function start3DAudioUser(seat, stream) {
  const aContext = new AudioContext();
  // The panner allows to move the audio context
  const panner = aContext.createPanner();
  panner.panningModel = 'HRTF';
  panner.distanceModel = 'linear';
  panner.refDistance = 1;
  panner.maxDistance = 10000;
  panner.rolloffFactor = 0;
  panner.coneInnerAngle = 360;
  panner.coneOuterAngle = 0;
  panner.coneOuterGain = 0;

  // x, y and z are the positions of the other student measured from the users position.
  let x = -1 * (positions[seat].a - positions[selectedPosition].a);
  const y = -1 * (positions[seat].b - positions[selectedPosition].b);
  let z = -1 * (positions[seat].c - positions[selectedPosition].c);

  // Users are always on the same height so the y value is never used.
  const toUserVector = Math.atan2(x, z);
  // lookVector is the direction the user itself is looking towards.
  const lookVector = rotationNow;

  // soundRotation is the angle between where the user is looking and where the other student is seated.
  const soundRotation = lookVector - toUserVector;

  // soundVec is a unit vector in the direction of where the other student is seated,
  // based on the direction the user is looking.
  const soundVec = rotate2DVec({x: 0, y: 1}, soundRotation);

  if (threeDAudio) {
    panner.positionX.value = soundVec.x;
    panner.positionY.value = -1 * (positions[seat].b - b);
    panner.positionZ.value = soundVec.y;
  } else {
    // If 3D audio is off, the audiocontext is placed right in front of the user,
    // so the sound comes from the front.
    panner.positionX.value = 0.1;
    panner.positionY.value = 0;
    panner.positionZ.value = 0;
  }

  const source = aContext.createMediaStreamSource(stream);
  const destination = aContext.createMediaStreamDestination();
  source.connect(panner);
  panner.connect(destination);

  const recvAudio = new Audio();
  recvAudio.srcObject = destination.stream;
  recvAudio.autoplay = true;

  panners[seat] = panner;
}

/**
 * Updates the position of the audiocontext. This can happen when the user rotates or when 3D audio is turned off or on.
 */
function update3DAudioPosition() {
  if (threeDAudio) {
    activeconnections.forEach((connection) => {
      const seat = connection.seat;
      lastRotation = rotationNow;

      // x, y and z are the positions of the other student measured from the users position.
      let x = -1 * (positions[seat].a - positions[selectedPosition].a);
      const y = -1 * (positions[seat].b - positions[selectedPosition].b);
      let z = -1 * (positions[seat].c - positions[selectedPosition].c);

      // Users are always on the same height so the y value is never used.
      const toUserVector = Math.atan2(x, z);
      // lookVector is the direction the user itself is looking towards.
      const lookVector = rotationNow;

      // soundRotation is the angle between where the user is looking and where the other student is seated.
      const soundRotation = lookVector - toUserVector;

      // soundVec is a unit vector in the direction of where the other student is seated,
      // based on the direction the user is looking.
      const soundVec = rotate2DVec({x: 0, y: 1}, soundRotation);

      if (panners[seat] != undefined) {
        panners[seat].positionX.value = soundVec.x;
        panners[seat].positionY.value = -1 * (positions[seat].b - b);
        panners[seat].positionZ.value = soundVec.y;
      }
    });
  } else {
    activeconnections.forEach((connection) => {
      if (panners[connection.seat] != undefined) {
        // If 3D audio is off, the audiocontext is placed right in front of the user,
        // so the sound comes from the front.
        panners[connection.seat].positionX.value = 0;
        panners[connection.seat].positionY.value = 0.1;
        panners[connection.seat].positionZ.value = 0;
      }
    });
  }
}

/**
 * Toggles on or off the 3D audio. Also updates the audio contexts.
 */
function toggleThreeDAudio() {
  if (threeDAudio) {
    threeDAudio = false;
    update3DAudioPosition();
  } else {
    threeDAudio = true;
    update3DAudioPosition();
  }
}

/**
 * Rotates a 2D vector by the given angle.
 * @param {{x, y}} vec - Vector to be rotated.
 * @param {float} ang - Angle of the rotation.
 * @return {{x, y}} The rotated vector.
 */
function rotate2DVec(vec, ang) {
  return {
    x: vec.x * Math.cos(ang) - vec.y * Math.sin(ang),
    y: vec.x * Math.sin(ang) + vec.y * Math.cos(ang),
  };
}
