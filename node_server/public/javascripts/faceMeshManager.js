/* eslint-disable */
let k;
let MULT = 40;  // Controls the scale of the mesh 
let X_OFFSET = -22; // Centers the mesh in x
let Y_OFFSET = 20; // Centers the mesh in y
let Z_OFFSET = 22;  // Centers the mesh in z
let Z_CORRECTION = 20;
let facialLandmarksClient;

function updateFaceMesh() {


    if (typeof faceGeometry == 'undefined' || typeof facialLandmarksClient == 'undefined') return;

    facePositions = faceGeometry.attributes.position.array;

    let z_bar = -(facialLandmarksClient[0][0].z*MULT + Z_OFFSET); // Keeps the face at the same realtive depth

    for (k = 0; k < FACE_MESH_LANDMARK_COUNT; k++) {
      facePositions[(3*k)] = facialLandmarksClient[0][mapping[k]].x*MULT + X_OFFSET;
      facePositions[(3*k)+1] = -facialLandmarksClient[0][mapping[k]].y*MULT + Y_OFFSET;
      facePositions[(3*k)+2] = -(facialLandmarksClient[0][mapping[k]].z*MULT + (Z_OFFSET + Z_CORRECTION) + z_bar);
    }

    faceGeometry.attributes.position.needsUpdate = true;
  }