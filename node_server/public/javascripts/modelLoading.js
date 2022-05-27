/* eslint-disable no-unused-vars */
const humanModels = new Array(positions.length + 1);
const MODEL_LOCATION_SEAT_1 = '/assets/models/jess.gltf';
const MODEL_LOCATION_SEAT_3 = '/assets/models/manInShirt.gltf';
const MODEL_LOCATION_SEAT_4 = '/assets/models/manModel.gltf';
const MODEL_LOCATION_SEAT_5 = '/assets/models/manInSuit.gltf';

/**
 * Adds in the correct model for seat 1
 */
function loadModel1() {
  loader.load(
      // resource URL
      MODEL_LOCATION_SEAT_1,
      // called when the resource is loaded
      function( gltf ) {
        gltf.scene.name = 'humanModel1';
        addVR( gltf.scene );
        gltf.scene.scale.set(0.18, 0.18, 0.18);
        // gltf.scene.position.x = -18.8;
        // gltf.scene.position.y = 0.8;
        // gltf.scene.position.z = 13.7;
        gltf.scene.position.set(-7, -4, 6);
        gltf.scene.rotation.y = 0.0;


        gltf.animations; // Array<THREE.AnimationClip>
        gltf.scene; // THREE.Group
        gltf.scenes; // Array<THREE.Group>
        gltf.cameras; // Array<THREE.Camera>
        gltf.asset; // Object
        humanModels[1] = (gltf.scene);
      },
      // called while loading is progressing
      function( xhr ) {
      },
      // called when loading has errors
  );
}


/**
 * Adds in the correct model for seat 3
 */
function loadModel3() {
  loader.load(
      // resource URL
      MODEL_LOCATION_SEAT_3,
      // called when the resource is loaded
      function( gltf ) {
        gltf.scene.name = 'humanModel3';
        addVR( gltf.scene );
        gltf.scene.scale.set(0.18, 0.18, 0.18);
        // gltf.scene.position.x = -18.8;
        // gltf.scene.position.y = 0.8;
        // gltf.scene.position.z = 13.7;
        gltf.scene.position.set(7, -4, 6);
        gltf.scene.rotation.y = 0.0;


        gltf.animations; // Array<THREE.AnimationClip>
        gltf.scene; // THREE.Group
        gltf.scenes; // Array<THREE.Group>
        gltf.cameras; // Array<THREE.Camera>
        gltf.asset; // Object
        humanModels[3] = (gltf.scene);
      },
      // called while loading is progressing
      function( xhr ) {
      },
      // called when loading has errors
  );
}

/**
 * Adds in the correct model for seat 4
 */
function loadModel4() {
  loader.load(
      // resource URL
      MODEL_LOCATION_SEAT_4,
      // called when the resource is loaded
      function( gltf ) {
        gltf.scene.name = 'humanModel4';
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

/**
 * Adds in the correct model for seat 5
 */
function loadModel5() {
  loader.load(
      // resource URL
      MODEL_LOCATION_SEAT_5,
      // called when the resource is loaded
      function( gltf ) {
        gltf.scene.name = 'humanModel5';
        addVR( gltf.scene );
        gltf.scene.scale.set(5.5, 5.5, 5.5);
        // gltf.scene.position.x = -18.8;
        // gltf.scene.position.y = 0.8;
        // gltf.scene.position.z = 13.7;
        gltf.scene.position.set(18.7, -1.5, 12);
        gltf.scene.rotation.y = -0.75;


        gltf.animations; // Array<THREE.AnimationClip>
        gltf.scene; // THREE.Group
        gltf.scenes; // Array<THREE.Group>
        gltf.cameras; // Array<THREE.Camera>
        gltf.asset; // Object
        humanModels[5] = (gltf.scene);
      },
      // called while loading is progressing
      function( xhr ) {
      },
      // called when loading has errors
  );
}

