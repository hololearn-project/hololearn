/* eslint-disable require-jsdoc */
// const audioContext = window.AudioContext = window.AudioContext || window.webkitAudioContext;
const aContext = new AudioContext();
const panner = aContext.createPanner();

async function start3DAudioTeacher(seat, stream) {
  panner.panningModel = 'HRTF';
  panner.distanceModel = 'inverse';
  panner.refDistance = 10;
  panner.maxDistance = 10000;
  panner.rolloffFactor = 0;
  panner.coneInnerAngle = 360;
  panner.coneOuterAngle = 0;
  panner.coneOuterGain = 0;

  let x = -1 * (positions[seat].a - a);
  const y = -1 * (positions[seat].b - b);
  let z = -1 * (positions[seat].c - c);

  const soundVec = rotate2DVec({x: x, y: y}, rotationNow);

  panner.positionX.value = soundVec.x;
  panner.positionY.value = -1 * (positions[seat].b - b);
  panner.positionZ.value = soundVec.y;

  const source = aContext.createMediaStreamSource(stream);
  const destination = aContext.createMediaStreamDestination();
  source.connect(panner);
  panner.connect(destination);

  const recvAudio = new Audio();
  recvAudio.srcObject = destination.stream;
  recvAudio.autoplay = true;
}

function rotate2DVec(vec, ang) {
  return {
    x: vec.x * Math.cos(ang) - vec.y * Math.sin(ang),
    y: vec.x * Math.sin(ang) + vec.y * Math.cos(ang),
  };
}
