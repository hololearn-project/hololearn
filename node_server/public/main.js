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

// vars useful for receiving teacher streams
let teacherIncomingMediaStream = null;
let teacherTracks = [];

const servRtcStrms = new Map();
const servRtcStrmsLidars = ['videostream', 'depthstream'];
const servRtcStrmsScrnsh = ['screensharestream', 'webcamstream'];
const UNIQUE_USER_ID = Math.random().toString(36).substring(7);
const N_RECONNECT_TO_PEER_ATTEMPTS = 5;
const FACE_MESH_LANDMARK_COUNT = 468;
const mapping = [173,
  155,
  133,
  246,
  33,
  7,
  382,
  398,
  362,
  263,
  466,
  249,
  308,
  415,
  324,
  78,
  95,
  191,
  356,
  389,
  264,
  127,
  34,
  162,
  368,
  139,
  267,
  0,
  302,
  37,
  72,
  11,
  349,
  451,
  350,
  120,
  121,
  231,
  452,
  232,
  269,
  39,
  303,
  73,
  357,
  343,
  128,
  114,
  277,
  47,
  453,
  233,
  299,
  333,
  297,
  69,
  67,
  104,
  332,
  103,
  175,
  152,
  396,
  171,
  377,
  148,
  381,
  384,
  154,
  157,
  280,
  347,
  330,
  50,
  101,
  118,
  348,
  119,
  270,
  40,
  304,
  74,
  9,
  336,
  151,
  107,
  337,
  108,
  344,
  278,
  360,
  115,
  131,
  48,
  279,
  49,
  262,
  431,
  418,
  32,
  194,
  211,
  424,
  204,
  408,
  184,
  409,
  185,
  272,
  310,
  407,
  42,
  183,
  80,
  322,
  410,
  92,
  186,
  449,
  229,
  450,
  230,
  434,
  432,
  430,
  214,
  210,
  212,
  422,
  202,
  313,
  314,
  18,
  83,
  84,
  17,
  307,
  375,
  306,
  77,
  76,
  146,
  291,
  61,
  259,
  387,
  260,
  29,
  30,
  160,
  388,
  161,
  286,
  414,
  56,
  190,
  406,
  182,
  335,
  106,
  367,
  416,
  364,
  138,
  135,
  192,
  391,
  423,
  327,
  165,
  98,
  203,
  358,
  129,
  298,
  301,
  284,
  68,
  54,
  71,
  251,
  21,
  4,
  275,
  5,
  45,
  281,
  51,
  254,
  373,
  253,
  24,
  23,
  144,
  374,
  145,
  320,
  321,
  90,
  91,
  425,
  411,
  187,
  205,
  427,
  207,
  421,
  200,
  201,
  405,
  181,
  404,
  180,
  16,
  315,
  85,
  266,
  426,
  206,
  36,
  369,
  400,
  140,
  176,
  417,
  465,
  413,
  193,
  189,
  245,
  464,
  244,
  257,
  258,
  386,
  27,
  159,
  28,
  385,
  158,
  467,
  247,
  248,
  456,
  419,
  3,
  196,
  236,
  399,
  174,
  285,
  8,
  55,
  168,
  340,
  261,
  346,
  111,
  117,
  31,
  448,
  228,
  441,
  221,
  460,
  326,
  97,
  240,
  328,
  99,
  355,
  329,
  100,
  126,
  371,
  142,
  309,
  392,
  438,
  79,
  218,
  166,
  439,
  219,
  256,
  26,
  341,
  112,
  420,
  198,
  429,
  209,
  365,
  379,
  136,
  150,
  394,
  169,
  437,
  217,
  443,
  444,
  282,
  223,
  52,
  224,
  283,
  53,
  363,
  134,
  440,
  220,
  395,
  170,
  338,
  109,
  273,
  43,
  359,
  342,
  113,
  130,
  446,
  226,
  334,
  105,
  293,
  63,
  250,
  458,
  462,
  20,
  242,
  238,
  461,
  241,
  276,
  353,
  300,
  46,
  70,
  124,
  383,
  156,
  325,
  292,
  96,
  62,
  447,
  345,
  227,
  116,
  372,
  143,
  352,
  123,
  1,
  19,
  274,
  44,
  354,
  125,
  436,
  216,
  380,
  252,
  153,
  22,
  393,
  167,
  199,
  428,
  208,
  287,
  57,
  290,
  60,
  265,
  35,
  445,
  225,
  366,
  137,
  268,
  38,
  271,
  41,
  294,
  64,
  455,
  235,
  331,
  102,
  378,
  149,
  296,
  66,
  351,
  122,
  6,
  376,
  147,
  319,
  89,
  295,
  65,
  403,
  179,
  323,
  454,
  93,
  234,
  15,
  316,
  86,
  14,
  317,
  87,
  402,
  318,
  178,
  88,
  197,
  397,
  172,
  288,
  435,
  58,
  215,
  311,
  81,
  195,
  312,
  82,
  339,
  110,
  390,
  163,
  10,
  442,
  222,
  94,
  370,
  141,
  255,
  25,
  457,
  237,
  412,
  188,
  164,
  2,
  12,
  13,
  463,
  243,
  459,
  239,
  401,
  177,
  361,
  132,
  433,
  213,
  289,
  59,
  305,
  75];

let vertexMarker = 0;

servRtcStrms.set('videostream', 'lidarVideoStream1');
servRtcStrms.set('depthstream', 'lidarVideoStream2');

let renderer = new THREE.WebGLRenderer();

let scene = new THREE.Scene();
let teacherModel = new THREE.BufferGeometry();
let userClassroomId = 'defaultClassroom';

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
 * Loads the steve.obj model
 */

/**
 * Loads the 3D environment
 */
async function load3DEnvironment() {
  if (isTeacher) {
    mapScreen = new THREE.VideoTexture(localMediaStream);
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
  document.body.appendChild( renderer.domElement );

  const camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );

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
    scene.add( new THREE.AmbientLight( 0x0f0f0f ) );

    let light = new THREE.AmbientLight( 0xffffff);
    light.position.set( 0, 0, 20 );

    scene.add(light);

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

    await drawSkeleton();

    // sets the target of the camera
    if (true) {
      controls.target.set(0, 8, 27);
      controls.update();
    } // else {
    //   controls.target.set(a - (a - 0) * 0.01,
    //       b - (b - 8) * 0.01, c - (c - 27) * 0.01 );
    //   controls.update();
    // }

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

  function updateFaceMesh() {
    if (!teacherWebcamOn) {
      return;
    }
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

  /**
   * Updates the environment and gets an image from it.
   */
  function animate() {
    requestAnimationFrame( animate );

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

    updateFaceMesh();

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
      }
    }
    document.title = 'Recording HoloLearn';
  }

  animate();
  // simpleVerticies()
}
