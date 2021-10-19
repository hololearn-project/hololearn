/* eslint-disable camelcase */
/* eslint-disable prefer-const */
/* eslint-disable no-unused-vars */
// three.js init variables
positions = [];
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
const servRtcStrms = new Map();
const servRtcStrmsLidars = ['videostream', 'depthstream'];
const servRtcStrmsScrnsh = ['screensharestream'];
servRtcStrms.set('videostream', 'lidarVideoStream1');
servRtcStrms.set('depthstream', 'lidarVideoStream2');
const N_RECONNECT_TO_PEER_ATTEMPTS = 5;

const UNIQUE_USER_ID = Math.random().toString(36).substring(7);
let a = 0;
let b = 0;
let c = 0;

let scene = new THREE.Scene();
let teacherModel = new THREE.BufferGeometry();
let objects = [];
let userClassroomId = 'defaultClassroom';


// vars useful for receiving teacher streams
let teacherIncomingMediaStream = null;
let teacherTracks = [];

// Adds the possible positions
positions.push(undefined);
positions.push({a: -5, b: 7, c: 5});
positions.push({a: 0, b: 7, c: 6});
positions.push({a: 5, b: 7, c: 5});
positions.push({a: -16, b: 7, c: 14});
positions.push({a: 16, b: 7, c: 14});

console.warn = () => { };

// these are video settings
const URL_VIDEOFEED_PYTHON = 'http://localhost:5000/video_feed';
const URL_DEPTHFEED_PYTHON = 'http://localhost:5000/depth_feed';
const CLASSROOM_SCENE_LOCATION = '/assets/scene.gltf';
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
 * Loads the 3D environment
 */
async function load3DEnvironment() {
  if (isTeacher) {
    mapScreen = new THREE.VideoTexture(localMediaStream);
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
  const camera = new THREE.PerspectiveCamera( 70,
      window.innerWidth / window.innerHeight, 1, 10000 );
  const objects = [];

  updateSubSample();

  initModel();

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize( width, height - 1);

  //VR
  renderer.xr.enabled = true;
  
  document.body.appendChild( renderer.domElement );

  //VR      
  //import {VRButton } from "./javascripts/threejs-scripts/VRButton.js";
  document.body.appendChild( VRButton.createButton( renderer ) );
  

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
   * Initializes the whole system, including the 3D environment
   */
  async function init() {
    scene.add( new THREE.AmbientLight( 0x0f0f0f ) );

    let light = new THREE.AmbientLight( 0xffffff);
    light.position.set( 0, 0, 20 );

    scene.add(light);

    loader.load(
        // resource URL
        CLASSROOM_SCENE_LOCATION,
        // called when the resource is loaded
        function( gltf ) {
          scene.add( gltf.scene );
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

    // createLightWeightPointCloudModel()
    let controls = new THREE.OrbitControls(camera, renderer.domElement);

    // if (playback) {
    //   setRecordedPictureSource();
    //   setRecordedDepthSource();
    // }

    // sets the target of the camera
    if (isTeacher) {
      controls.target.set(0, 8, 27);
      controls.update();
    } else {
      controls.target.set(a - (a - 0) * 0.01,
          b - (b - 8) * 0.01, c - (c - 27) * 0.01 );
      controls.update();
    }
    // controls.addEventListener( 'dragstart', dragStartCallback );
    // controls.addEventListener( 'dragend', dragendCallback );
    
    //set the scale for VR
    if(renderer.xr.isPresenting()){
      scene.scale.set(0.2,0.2,0.2);  
    }
    else{
      scene.scale.set(1,1,1);
    }

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
  function animate() {
    //VR requires the .setAnimationLoop instead of .requestAnimationFrame
    renderer.setAnimationLoop(animate);
    //requestAnimationFrame( animate );

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
