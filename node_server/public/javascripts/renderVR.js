/* eslint-disable no-unused-vars */
/**
 * Iterates through every object in the scene and transforms it to accomodate the
 * perspective of the VR user
 */
function moveSceneToVR() {
  for (let i = 0; i < scene.children.length; i++) {
    moveObject(scene.children[i]);
  }
}

/**
 * Iterates through every object in the scene and transforms it to accomodate the
 * perspective of the VR user
 */
function moveSceneFromVR() {
  for (let i = 0; i < scene.children.length; i++) {
    moveObjectFromVR(scene.children[i]);
  }
}

/**
 * Moves and rotates an object in relation to the seat of the user.
 * For when the users moves into VR.
* @param {THREE.object} object - the object to move.
 */
function moveObjectToVR(object) {
  object.position.x = object.position.x - a;
  object.position.y = object.position.y - b + 1.6;
  object.position.z = object.position.z - c;

  object.rotation = object.rotation + Math.PI;
}

/**
 * Moves and rotates an object in relation to the seat of the user
 * For when the users moves out of VR
 * @param {THREE.object} object - the object to move.
 */
function moveObjectFromVR(object) {
  object.position.x = object.position.x + a;
  object.position.y = object.position.y + b - 1.6;
  object.position.z = object.position.z + c;

  object.rotation = object.rotation - Math.PI;
}

/**
 * checks wether the user is in VR mode and if so, moves the object in relation to the
 * seat of the user. It then adds the object to the scene
 * @param {THREE.object} object - the object to move.
*/
function addVR(object) {
  if (InVr) {
    moveObjectToVR(object);
  }
  scene.add(object);
}
