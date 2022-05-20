/* eslint-disable no-unused-vars */
const humanModels = new Array(positions.length + 1);

/**
 * Adds in the correct model for seat 4
 */
function loadModel4() {
  loader.load(
      // resource URL
      MODEL_LOCATION,
      // called when the resource is loaded
      function( gltf ) {
        gltf.scene.name = 'humanModel4';
        console.log('model loaded for seat 4');
        addVR( gltf.scene );
        gltf.scene.scale.set(0.07, 0.07, 0.07);
        // gltf.scene.position.x = -18.8;
        // gltf.scene.position.y = 0.8;
        // gltf.scene.position.z = 13.7;
        gltf.scene.position.set(-18.7, -3.5, 12);
        gltf.scene.rotation.y = 0.75;


        gltf.animations; // Array<THREE.AnimationClip>
        gltf.scene; // THREE.Group
        gltf.scenes; // Array<THREE.Group>
        gltf.cameras; // Array<THREE.Camera>
        gltf.asset; // Object
        humanModels[4] = (gltf.scene);
      },
      // called while loading is progressing
      function( xhr ) {
      },
      // called when loading has errors
  );
}

