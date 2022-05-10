/* eslint-disable require-jsdoc */
// const audioContext = window.AudioContext = window.AudioContext || window.webkitAudioContext;
panners = new Array(positions.length + 1);
let threeDAudio = false;

async function start3DAudioUser(seat, stream) {
  const aContext = new AudioContext();
  const panner = aContext.createPanner();
  panner.panningModel = 'HRTF';
  panner.distanceModel = 'linear';
  panner.refDistance = 1;
  panner.maxDistance = 10000;
  panner.rolloffFactor = 0;
  panner.coneInnerAngle = 360;
  panner.coneOuterAngle = 0;
  panner.coneOuterGain = 0;

  let x = -1 * (positions[seat].a - positions[selectedPosition].a);
  const y = -1 * (positions[seat].b - positions[selectedPosition].b);
  let z = -1 * (positions[seat].c - positions[selectedPosition].c);

  const toUserVector = Math.atan2(x, z);
  const lookVector = rotationNow;

  const soundRotation = lookVector - toUserVector;

  const soundVec = rotate2DVec({x: 0, y: 1}, soundRotation);

  if (threeDAudio) {
    panner.positionX.value = soundVec.x;
    panner.positionY.value = -1 * (positions[seat].b - b);
    panner.positionZ.value = soundVec.y;
  } else {
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

function update3DAudioPosition() {
  if (threeDAudio) {
    activeconnections.forEach((connection) => {
      const seat = connection.seat;
      lastRotation = rotationNow;

      let x = -1 * (positions[seat].a - positions[selectedPosition].a);
      const y = -1 * (positions[seat].b - positions[selectedPosition].b);
      let z = -1 * (positions[seat].c - positions[selectedPosition].c);

      const toUserVector = Math.atan2(x, z);
      const lookVector = rotationNow;

      const soundRotation = lookVector - toUserVector;

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
        panners[connection.seat].positionX.value = 0;
        panners[connection.seat].positionY.value = 0.1;
        panners[connection.seat].positionZ.value = 0;
      }
    });
  }
}

function toggleThreeDAudio() {
  if (threeDAudio) {
    threeDAudio = false;
    update3DAudioPosition();
  } else {
    threeDAudio = true;
    update3DAudioPosition();
  }
}

function rotate2DVec(vec, ang) {
  return {
    x: vec.x * Math.cos(ang) - vec.y * Math.sin(ang),
    y: vec.x * Math.sin(ang) + vec.y * Math.cos(ang),
  };
}
