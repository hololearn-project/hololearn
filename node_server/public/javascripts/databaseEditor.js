// eslint-disable-next-line valid-jsdoc
/**
 * Adds a lecture to the overview of lectures.
 * @param {,ecture object} lecture the lceture to be added.
 */
function addCell(lecture) {
  const newCell = document.getElementById('exampleCell');
  newCell.innerHTML += lecture.name;
}

