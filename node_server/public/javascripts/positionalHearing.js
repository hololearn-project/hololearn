let positionalHearing = true;
const allDirections =
[
  [[0, 0], [1.2211, 2.0729], [1.0982, 1.8671], [-1.4373, -0.434], [0.8838, 1.5069]],
  [],
  [],
  [],
  [],
];

let unmutedSeats = [];

/* eslint-disable require-jsdoc */
function setPositionalHearing(rotation) {
  if (!positionalHearing) {
    return;
  }

  let maxDirections = undefined;
  switch (selectedPosition) {
    case 1:
      maxDirections = allDirections[0];
    case 2:
      maxDirections = allDirections[1];
    case 3:
      maxDirections = allDirections[2];
    case 4:
      maxDirections = allDirections[3];
    case 5:
      maxDirections = allDirections[4];
  }
  for (let i = 0; i != maxDirections.length; i++) {
    let newUnmutedSeats = [];
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
    }
  }
  // If a seat that was unmuted should now be muted, mute
  for (let i = 0; i != unmutedSeats.length; i++) {
    if (!newUnmutedSeats.includes(unmutedSeats[i])) {
      // Mute seat
    }
  }

  unmutedSeats = newUnmutedSeats;
}
