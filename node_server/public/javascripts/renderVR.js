/* eslint-disable no-unused-vars */
/**
 * Iterates through every object in the scene and transforms it to accomodate the
 * perspective of the VR user
 */
function moveSceneToVR() {
  for (let i = 0; i < scene.children.length; i++) {
    moveObjectToVR(scene.children[i]);
  }
  inVR = true;
}

/**
 * Iterates through every object in the scene and transforms it to accomodate the
 * perspective of the VR user
 */
function moveSceneFromVR() {
  for (let i = 0; i < scene.children.length; i++) {
    moveObjectFromVR(scene.children[i]);
  }
  inVR = false;
}

/**
 * dssdfsdf
 * @param {float} num 
 * @returns {boolean} boolean
 */
function isBasically(num, comp) {
  return (num > comp-0.01 && num < comp+0.01);
}

/**
 * Moves and rotates an object in relation to the seat of the user.
 * For when the users moves into VR.
* @param {THREE.object} object - the object to move.
 */
function moveObjectToVR(object) {
  if (isBasically(object.position.x, 0) && isBasically(object.position.y, 3) && isBasically(object.position.z, 0)) {
    return;
  }

  object.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), Math.PI);

  object.position.x = object.position.x + a;
  object.position.y = object.position.y - b + 5;
  object.position.z = object.position.z + c;

  object.rotation.y += rotationNow;

  // object.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), -rotationNow);
}

/**
 * Moves and rotates an object in relation to the seat of the user
 * For when the users moves out of VR
 * @param {THREE.object} object - the object to move.
 */
function moveObjectFromVR(object) {
  if (isBasically(object.position.x, 0) && isBasically(object.position.y, 3) && isBasically(object.position.z, 0)) {
    return;
  }
  object.position.x = object.position.x - a;
  object.position.y = object.position.y + b - 1.6;
  object.position.z = object.position.z - c;

  object.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), -Math.PI);
}

/**
 * checks wether the user is in VR mode and if so, moves the object in relation to the
 * seat of the user. It then adds the object to the scene
 * @param {THREE.object} object - the object to move.
*/
function addVR(object) {
  scene.add(object);
  if (inVR) {
    moveObjectToVR(object);
  }
}
