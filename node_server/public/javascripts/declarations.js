/* eslint-disable */
let a = 0;
let b = 0;
let c = 0;

let count = 0;
let countReceivedElement = 1;
let bodyTrackFlag = false;
let faceMeshFlag = false;
let height = window.innerHeight;
let isTeacher = false;
let lastTime = Date.now();
let mapScreen = '';
let mapScreenWebcam = '';
let nameUser = '';
let net = '';
let objects = [];
let positions = [];
let renderer = new THREE.WebGLRenderer();
let scene = new THREE.Scene();
let selectedPosition = 0;
let student_canvas = null;
let teacherWebcamOn = false;
let teacherIncomingMediaStream = null;
let teacherTracks = [];
let teacherModel = new THREE.BufferGeometry();
let userClassroomId = 'defaultClassroom';
let width = window.innerWidth;

const camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
const servRtcStrms = new Map();
const servRtcStrmsLidars = ['videostream', 'depthstream'];
const servRtcStrmsScrnsh = ['screensharestream', 'webcamstream'];

const UNIQUE_USER_ID = Math.random().toString(36).substring(7);
const N_RECONNECT_TO_PEER_ATTEMPTS = 5;
const FACE_MESH_LANDMARK_COUNT = 468;
const URL_VIDEOFEED_PYTHON = 'http://localhost:5000/video_feed';
const URL_DEPTHFEED_PYTHON = 'http://localhost:5000/depth_feed';
const CLASSROOM_SCENE_LOCATION = '/assets/scene.gltf';
const SOCKET_ADDRESS = 'http://localhost:8080';
const CLASSROOM_BLACKBOARD_IMAGE = '/assets/fourier.png';
const WEBCAM_FRAMES_PER_SECOND = 20;
const DEBUG = true;

