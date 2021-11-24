/**
 * @param {[number]} array - Array containing all points of the face mesh.
 */
function sendFaceMesh(array) {
  socket.emit('faceMeshArray', array);
}
