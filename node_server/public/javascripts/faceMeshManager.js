/* eslint-disable */

function updateFaceMesh() {
    let k;

    if (typeof faceGeometry == 'undefined') return;

    facePositions = faceGeometry.attributes.position.array;

    let z_bar = -(facialLandmarks[0][0].z*MULT + Z_OFFSET);

    for (k = 0; k < FACE_MESH_LANDMARK_COUNT; k++) {
      facePositions[(3*k)] = facialLandmarks[0][mapping[k]].x*MULT + X_OFFSET;
      facePositions[(3*k)+1] = -facialLandmarks[0][mapping[k]].y*MULT + Y_OFFSET;
      facePositions[(3*k)+2] = -(facialLandmarks[0][mapping[k]].z*MULT + (Z_OFFSET + Z_CORRECTION) + z_bar);
    }

    faceGeometry.attributes.position.needsUpdate = true;
  }