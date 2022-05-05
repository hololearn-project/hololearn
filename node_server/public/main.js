/* eslint-disable prefer-rest-params */
/* eslint-disable require-jsdoc */
/* eslint-disable camelcase */
/* eslint-disable prefer-const */
/* eslint-disable no-unused-vars */
// three.js init variables
let teacherWebcamOn = false;
let positions = [];
let width = window.innerWidth;
let height = window.innerHeight;
let lastTime = Date.now();
let mapScreen = '';
let selectedPosition = 0;
let nameUser = '';
let mapScreenWebcam = '';
let net = '';
let student_canvas = null;
let count = 0;
let isTeacher = false;
let countReceivedElement = 1;
let a = 0;
let b = 0;
let c = 0;
let objects = [];
let faceMeshFlag = false;
let bodyTrackFlag = false;

const UNIQUE_USER_ID = Math.random().toString(36).substring(7);
const N_RECONNECT_TO_PEER_ATTEMPTS = 5;
const FACE_MESH_LANDMARK_COUNT = 468;

let vertexMarker = 0;

let renderer = new THREE.WebGLRenderer();

let scene = new THREE.Scene();
let teacherModel = new THREE.BufferGeometry();
let userClassroomId = 'defaultClassroom';

// Adds the possible positions
// positions.push({a: 0, b: 7, c: 27});
positions.push(undefined);
positions.push({a: -5, b: 7, c: 5});
positions.push({a: 0, b: 7, c: 6});
positions.push({a: 5, b: 7, c: 5});
positions.push({a: -16, b: 7, c: 14});
positions.push({a: 16, b: 7, c: 14});

console.warn = () => { };

console.defaultError = console.error.bind(console);
console.errors = [];
console.error = function() {
  // default &  console.error()
  // eslint-disable-next-line prefer-spread
  console.defaultError.apply(console, arguments);
  // new & array data
  console.errors.push(Array.from(arguments));
};

console.defaultLog = console.log.bind(console);
console.logs = [];
console.log = function() {
  // default &  console.log()
  // eslint-disable-next-line prefer-spread
  console.defaultLog.apply(console, arguments);
  // new & array data
  console.logs.push(Array.from(arguments));
  serverConsole(console.logs[console.logs.length - 1]);
};
window.onerror = function(error, url, line) {
  serverConsole(error);
  serverConsole(url);
  serverConsole(line);
};

// these are video settings
const URL_VIDEOFEED_PYTHON = 'http://localhost:5000/video_feed';
const URL_DEPTHFEED_PYTHON = 'http://localhost:5000/depth_feed';
const CLASSROOM_SCENE_LOCATION = '/assets/scene.gltf';
const MODEL_LOCATION = '/assets/scaledModel.gltf';
const SOCKET_ADDRESS = 'http://localhost:8080';
const CLASSROOM_BLACKBOARD_IMAGE = '/assets/fourier.png';
const WEBCAM_FRAMES_PER_SECOND = 20;
const DEBUG = true;
loadNet();
/**
 * Load neural network from tensorflow. This does the background removal for us.
 */
// async function loadNet() { // old one
// net = await bodyPix.load()
// }

/**
 * Load neural network from tensorflow. This does the background removal for us.
 */
async function loadNet() { // this one is more efficient
  net = await bodyPix.load({
    architecture: 'MobileNetV1',
    outputStride: 16,
    multiplier: 0.50,
    quantBytes: 2,
  });
}

/**
 * Loads the steve.obj model
 */

/**
 * Loads the 3D environment
 */
async function load3DEnvironment() {
  // document.getElementById('connectButton').style.display = 'none';

  if (isTeacher) {
    mapScreen = new THREE.VideoTexture(localMediaStream);
    // console.log(localMediaStreamWebcam);
    if (localMediaStreamWebcam != null) {
      cameraMesh.start();
      teacherWebcamOn = true;
    }
  }

  webcam.muted = true;

  micText.style.display = 'none';
  camText.style.display = 'none';
  select.style.display = 'none';
  selectMic.style.display = 'none';
  connectButton.style.display = 'none';
  video.style.display = 'none';
  webcam.style.display = 'none';

  // var scene = new THREE.Scene();

  scene.background = new THREE.Color( 0xf0f0f0 );
  const objects = [];

  updateSubSample();

  initModel();
  renderer.setSize( width, height - 1);

  renderer.xr.enabled = true;
  document.body.appendChild( renderer.domElement );

  document.body.appendChild(VRButton.createButton(renderer));

  const camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
  camera.near = 0.01;

  camera.position.x = a;
  camera.position.y = b;
  camera.position.z = c;

  let startColor;
  const canvas2d = document.getElementById('2d');
  const ctx = canvas2d.getContext('2d');

  const depth_canvas = document.getElementById('dm');
  const dctx = depth_canvas.getContext('2d');

  const map = new THREE.Texture(canvas2d);
  scene.background = new THREE.Color( 0x87ceeb );

  const loader = new THREE.GLTFLoader();

  /**
   * Window resizer
   */
  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  /**
   * Initializes the whole system, including the 3D environment
   */
  async function init() {
    addVR( new THREE.AmbientLight( 0x0f0f0f ) );

    let light = new THREE.AmbientLight( 0xffffff);
    light.position.set( 0, 0, 20 );

    addVR(light);

    const size = 0.02;
    vertGeometry = new THREE.BoxGeometry(size, size, size);
    vertMaterial = new THREE.MeshBasicMaterial({
      color: 0x0000ff,
      transparent: false,
    });

    loader.load(
        // resource URL
        CLASSROOM_SCENE_LOCATION,
        // called when the resource is loaded
        function( gltf ) {
          addVR( gltf.scene );
          gltf.animations; // Array<THREE.AnimationClip>
          gltf.scene; // THREE.Group
          gltf.scenes; // Array<THREE.Group>
          gltf.cameras; // Array<THREE.Camera>
          gltf.asset; // Object
        },
        // called while loading is progressing
        function( xhr ) {
        },
        // called when loading has errors
        function( error ) {
          console.log( 'An error happened' );
        },
    );
    loader.load(
        // resource URL
        MODEL_LOCATION,
        // called when the resource is loaded
        function( gltf ) {
          gltf.name = 'model';
          addVR( gltf.scene );
          gltf.scene.scale.set(0.2, 0.2, 0.2);
          gltf.scene.position.x = -18.8;
          gltf.scene.position.y = 0.8;
          gltf.scene.position.z = 13.7;
          gltf.scene.rotation.y = 0.7;


          gltf.animations; // Array<THREE.AnimationClip>
          gltf.scene; // THREE.Group
          gltf.scenes; // Array<THREE.Group>
          gltf.cameras; // Array<THREE.Camera>
          gltf.asset; // Object
        },
        // called while loading is progressing
        function( xhr ) {
        },
        // called when loading has errors
    );

    // createLightWeightPointCloudModel()
    let controls = new THREE.OrbitControls(camera, renderer.domElement);

    // if (playback) {
    //   setRecordedPictureSource();
    //   setRecordedDepthSource();
    // }

    await loadAssets();

    // sets the target of the camera
    if (isTeacher) {
      controls.target.set(0, 8, 27);
      controls.update();
    } else {
      controls.target.set(a - (a - 0) * 0.01,
          b - (b - 8) * 0.01, c - (c - 27) * 0.01 );
      controls.update();
    }

    window.onresize = onWindowResize;
    // controls.addEventListener( 'dragstart', dragStartCallback );
    // controls.addEventListener( 'dragend', dragendCallback );

    // Starts the webcam or screen sharing
    await startWebcam(a, b, c, scene, objects, isTeacher, camera);
  }

  /**
   * callback for when the user drags mouse, this is for changing color
   *
   * @param {Event} event
   */
  function dragStartCallback(event) {
    startColor = event.object.material.color.getHex();
    event.object.material.color.setHex(0x000000);
  }

  /**
   * at the end of the drag we change the color
   *
   * @param {Event} event
   */
  function dragendCallback(event) {
    event.object.material.color.setHex(startColor);
  }

  /**
   * Updates the environment and gets an image from it.
   */

  function updateLooseBody() {
    if (typeof landmarks == 'undefined' || typeof meshes == 'undefined' || meshes.length == 0) return;

    let t;

    for (t = 0; t < landmarks.length; t++) {
      let track = meshes[t];
      track.position.x = landmarks[t].x*10 + X_OFFSET;
      track.position.y = - landmarks[t].y*10 + Y_OFFSET;
      track.position.z = landmarks[t].z*10 + Z_OFFSET;
    }
  }

  function animate() {
    // requestAnimationFrame( animate );
    renderer.setAnimationLoop( animate );
    map.needsUpdate = true;
    mapScreen.needsUpdate = true;
    mapScreenWebcam.needsUpdate = true;
    for (let i = 0; i < textures.length; i++) {
      if (textures[i] != undefined) {
        textures[i].needsUpdate = true;
      }
    }
    let lookAtVector = new THREE.Vector3();
    camera.getWorldDirection(lookAtVector);
    rotation = Math.atan2(lookAtVector.x, lookAtVector.z);
    if (!isTeacher) {
      if (student_canvas != null) {
        student_canvas.rotation.y = rotation;
      }
      rotationNow = rotation;
    }
    // Rotates every student accordingly
    for (let i = 0; i < rotations.length; i++) {
      if (students[i] != undefined && rotations[i] != undefined) {
        students[i].rotation.y = rotations[i];
      }
    }

    if (faceMeshFlag) {
      updateFaceMesh();
    } else if (bodyTrackFlag) {
      updateSkeleton();
    }


    updateScreenAndWebcams(isTeacher, camera);

    // if (!isTeacher)
    animateTeacher(dctx, ctx, depth_canvas, canvas2d);
    renderer.render(scene, camera);
  };

  await init();
  // simpleTextureMap();
  if (table != -3) {
    startConnecting(isTeacher, nameUser);
  }
  document.getElementById('toggle').style.display = 'none';
  document.getElementById('menu').style.display = 'none';


  // set UI buttons visable if not a recorder
  if (table >= 0) {
    document.getElementById('buttonGroup').style.display = 'block';
    document.getElementById('advOptBtn').style.display = 'block';


    if (!isTeacher) {
      document.getElementById('speakButton').style.display = 'block';
      document.getElementById('cameraButton').style.display = 'block';
      // document.getElementById('usersButton').style.display = 'none';
    } else {
      document.getElementById('usersButton').style.display = 'block';
      document.getElementById('screenShareButton').style.display = 'block';

      video.muted = true;
      webcam.muted = true;
    }
  } else {
    if (table == -1) {
      document.getElementById('recordButton').style.display = 'block';
    } else {
      document.getElementById('muteButton').style.display = 'none';
      document.getElementById('chatButton').style.display = 'none';
      document.getElementById('buttonGroup').style.display = 'block';
      document.getElementById('buttonGroup').style.width = '120px';
      const left = (window.innerWidth - 120) / 2;
      document.getElementById('buttonGroup').style.marginLeft = left + 'px';
      if (table == -2) {
        document.getElementById('3DRecordButton').style.display = 'block';
      } else {
        document.getElementById('3DReplayButton').style.display = 'block';
        document.getElementById('advOptBtn').style.display = 'block';
      }
    }
    document.title = 'Recording HoloLearn';
  }

  animate();
  // simpleVerticies()
}
