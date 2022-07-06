/* eslint-disable prefer-const */
/* eslint-disable require-jsdoc */
/* eslint-disable no-unused-vars */
/* eslint-disable valid-jsdoc */

/* Imports used for running tests on modelling,
These imports should be commented out unless running tests
*/
// import * as THREE from 'three';
// const scene = new THREE.Scene();
// let teacherModel = new THREE.BufferGeometry();

/* Determines the resolution of the 3D model by changing the
interval at which data points are sampled. A greater subSample
means larger intervals and less data sampling thus lower
resolution. */
let subSample = 2;

/* Determines the size of the points used
specifically in the point cloud model. */
let pointSize = 0.1;

/* Used to filter out stray points when creating
the 3D model. */
const thresh = 40;

/* Specifies the dimensions of the canvases that are used to store the
incoming video data. */
const imgWidth = 400;
const imgLength = 540;
const demo = false;
/* Specifies the number of sampling points per row and column
respectively. These variables depend on the value of subSample as it
determines the frequency of sampling on both axes. */
let perWidth = Math.floor(imgWidth / subSample) + 1;
let perLength = Math.floor(imgLength / subSample) + 1;

/* Video element for the picture feed */
let pictureVideo;

/* Video element for the depth feed */
let depthVideo;

/* Canvas used for flat model */
let flatCanvas;

/* The array storing the entire list of (x,y,z) triplets of
co-ordinates in the depth image */
let points;

/* The array used to store vertex triplets that each represent a
triangle made from adjacent points in the depth image */
let baseIndices;

/* Flag inidicating wether or not a 3D model is currently in
the scene. */
let modelPresent = false;

/* Specificies which method to use when constructing the 3D model
[mesh, point cloud, point cloud with shaders, hidden] */
let modelType = 'M2';

/* X position of the model. */
let teacherX = -6;
let teacherY = 2;
let teacherZ = 23;


/* Flag for toggling the visibility of the advanced options menu
on the webpage. */
let advOpts = false;

/* Flag for toggling between playback and live mode */
const playback = true;

/* Flag to indicate wether or not the next frame should be rendered */
let goAndRender = true;

const staticModels = ['M4', 'M5', 'M6'];

const dynamicModels = ['M1', 'M2'];

const blueMan = true;
/*
M1 = mesh
M2 = index
M3 = point cloud
M4 = flat (background removed with TensorFlow)
M5 = point cloud with shaders
M6 = hidden
M7 = flat (background removed with depth)
*/

/**
 * calls several other initialization methods,
 * necessary for the creating of the teacher model
 */
function initModel() {
  initUV();
  initIndex();
  initPoints();

  pictureVideo = getPictureVideo();
  depthVideo = getDepthVideo();
  pictureVideo.play();
  depthVideo.play();
}

/**
 *  creates a template array for the positions attribute of the teacher model.
 */
function initPoints() {
  const ret = [];
  let x;
  let y;
  for (y = 0; y < imgLength; y+= subSample) {
    for (x = 0; x < imgWidth; x+= subSample) {
      ret.push(x);
      ret.push(imgLength - y);
      ret.push(0);

      if (x == 0) x -= 1;
    }
    if (y == 0) y -=1;
  }
  teacherModel.setAttribute('position',
      new THREE.BufferAttribute(new Float32Array(ret), 3));
}

/**
 *  creates an array mapping each pixel position to a normalised UV
 *  coordinate.
 * @return {Float32Array} a UV array used for texture mapping
 */
function initUV() {
  let x;
  let y;
  const UVs = [];

  for (y = 0; y < imgLength; y+= subSample) {
    for (x = 0; x < imgWidth; x+= subSample) {
      UVs.push(getUVx(x), getUVy(y));
      if (x == 0) x -= 1;
    }
    if (y == 0) y -=1;
  }

  teacherModel.setAttribute('uv',
      new THREE.BufferAttribute(new Float32Array(UVs), 2));

  return teacherModel;
}

/**
 * Initializes the vertices list of the index buffer.
 */
function initIndex() {
  let topLeft;
  let topRight;
  let botLeft;
  let botRight;
  const indices = [];

  for (topLeft = 0; topLeft < perWidth * (perLength - 1); topLeft += 1) {
    if ((topLeft + 1) % perWidth == 0) continue;

    topRight = topLeft + 1;
    botLeft = topLeft + perWidth;
    botRight = botLeft + 1;

    indices.push(topRight, botRight, topLeft);
    indices.push(botRight, botLeft, topLeft);
  }

  baseIndices = new Uint32Array(indices);
}

const getUVx = (x) => x / imgWidth;

const getUVy = (y) => (imgLength - y) / imgLength;

/**
 * Calculates the 1-dimensional index of a depth pixel.
 * @param  {number} x The x coordinate
 * @param  {number} y The y coordinate
 * @return {number} The depth value of that pixel
 */
const getLoc = (x, y) => (x + (y * imgWidth)) * 4;


/**
 * Iterates through the initialised index array, and creates a new array
 * which omitts triangles which have points of depth 0.
 * @param  {number[]} vertices  A list of vertices, in which
 * each vertex corresponds to a pixel of the depth image,
 * and each vertex consists of three numbers
 * @return {number[]} An indices array which does not reference
 * any triangles with depth of 0
 */
function filterIndices(vertices) {
  const newIndices = [];
  let k;
  for (k = 0; k < baseIndices.length - 2; k += 3) {
    const i1 = baseIndices[k];
    const i2 = baseIndices[k + 1];
    const i3 = baseIndices[k + 2];

    const z1 = vertices[(i1 * 3) + 2];
    const z2 = vertices[(i2 * 3) + 2];
    const z3 = vertices[(i3 * 3) + 2];
    if ((z1 < 255 - thresh && z2 < 255 - thresh && z3 < 255 - thresh)) {
      newIndices.push(i1, i2, i3);
    }
    if (blueMan) {
    } else {
      if ((z1 < 255 - thresh && z2 < 255 - thresh && z3 < 255 - thresh)) {
        newIndices.push(i1, i2, i3);
      }
    }
  }

  return new Uint32Array(newIndices);
}

/**
 * Updates the THREE.BufferGeometry model of the presenter using
 * the triangles in the NON-IDEXED construction and applies
 * the supplied texture.
 * @param  {number[][]} vertices The list containing both the
 * vertex coordinates and corresponding uv-coordinates.
 */
function createMeshModel(vertices) {
  const texture = new THREE.VideoTexture(pictureVideo);
  teacherModel.setAttribute('position',
      new THREE.BufferAttribute(vertices[0], 3));
  teacherModel.setAttribute('uv',
      new THREE.BufferAttribute(vertices[1], 2));
  teacherModel.scale(0.03, 0.03, 0.05);
  teacherModel.translate(teacherX, teacherY, teacherZ);
  const material = new THREE.MeshBasicMaterial({map: texture});
  const mesh = new THREE.Mesh(teacherModel, material);

  modelPresent = true;
  mesh.name = 'model';

  addVR(mesh);
}

/**
 * Updates the THREE.BufferGeometry model of the presenter using
 * the triangles in the INDEXED construction and applies
 * the supplied texture.
 * @param  {number[]} indicies  The list containing the indicies
 * (in sets of 3) for the verticies for each triangle.
 */
function createIndexedModel(indices) {
  teacherModel.setIndex(new THREE.BufferAttribute(indices, 1));
  teacherModel.setAttribute('position', new THREE.BufferAttribute(points, 3));

  const texture = new THREE.VideoTexture(pictureVideo);
  teacherModel.scale(0.03, 0.03, 0.05);
  teacherModel.translate(teacherX, teacherY, teacherZ);

  const material = new THREE.MeshBasicMaterial({map: texture});
  const mesh = new THREE.Mesh(teacherModel, material);

  modelPresent = true;
  mesh.name = 'model';
  addVR(mesh);
}

/**
 * Updates the THREE.Points model of the presenter using
 * the triangles in the NON-IDEXED construction.
 * @param {number[][]} vertices The list containing both
 * the vertex coordinates and
 * corresponding uv-coordinates
 */
function createPointCloudModel() {
  teacherModel.scale(0.03, 0.03, 0.06);
  teacherModel.translate(teacherX, teacherY, teacherZ);
  const material = new THREE.PointsMaterial(
      {vertexColors: true, size: pointSize});
  const mesh = new THREE.Points(teacherModel, material);

  modelPresent = true;
  mesh.name = 'model';
  addVR(mesh);
}

/**
 * Uses pre-defined shaders (vs and fs) for both vertex and
 * texture mapping (look in index.hmtl to see these) thus
 * does not require any inputs. All data is pulled directly
 * from the video feeds.
 */
function createLightWeightPointCloudModel() {
  const teacherTex = new THREE.VideoTexture(pictureVideo);
  const teacherDepth = new THREE.VideoTexture(depthVideo);

  teacherTex.minFilter = THREE.NearestFilter;

  const teacherWidth = 540; const teacherHeight = 400;
  const nearClipping = 850; const farClipping = 4000;

  const teacherGeometry = new THREE.BufferGeometry();

  // Vertices for the teacher model
  const vertices = new Float32Array(teacherWidth * teacherHeight * 3);

  for (let i = 0, j = 0, l = vertices.length; i < l; i += 3, j++) {
    vertices[i] = j % teacherWidth;
    vertices[i + 1] = Math.floor(j / teacherWidth);
  }

  teacherGeometry.setAttribute('position',
      new THREE.BufferAttribute(vertices, 3));

  teacherMaterial = new THREE.ShaderMaterial({
    uniforms: {

      'texmap': {value: teacherTex},
      'depthmap': {value: teacherDepth},
      'width': {value: teacherWidth},
      'height': {value: teacherHeight},
      'nearClipping': {value: nearClipping},
      'farClipping': {value: farClipping},

      'pointSize': {value: 4},
      'zOffset': {value: 0},
    },
    vertexShader: document.getElementById('vs').textContent,
    fragmentShader: document.getElementById('fs').textContent,
    blending: THREE.NormalBlending,
    depthTest: true, depthWrite: true,
    transparent: false,

  });
  const pointsModel = new THREE.Points(teacherGeometry, teacherMaterial);
  pointsModel.scale.x = 0.008;
  pointsModel.scale.y = 0.008;
  pointsModel.scale.z = 0.0075;
  pointsModel.position.y = 10;
  pointsModel.position.z = 35 + 5;
  pointsModel.position.x = teacherX;

  pointsModel.name = 'model';
  modelPresent = true;
  addVR(pointsModel);

  goAndRender = false;

  depthVideo.play();
}

/**
 * Takes a typed array of vertex positions, and updates them according to the
 * depth data gained form the given context.
 * @param  {HTMLCanvasReference} dctx The HTML context that contains the
 * depth image.
 * @return {Float32Array} An array of three numbers for each pixel in the
 * depth image,
 * each triple consists of an x, y and z value,
 * making a vertex
 */
function updatePoints(dctx) {
  const points = teacherModel.getAttribute('position').array;
  const depthData = dctx.getImageData(0, 0, imgWidth, imgLength).data;
  let x;
  let y;
  let z;
  let i = 0;

  for (y = 0; y < imgLength; y+= subSample) {
    for (x = 0; x < imgWidth; x+= subSample) {
      z = (depthData[getLoc(x, y)] +
      depthData[getLoc(x, y) + 1] +
      depthData[getLoc(x, y) + 2])/3;
      if (blueMan) {
        z = 255 - z;
      }
      points[i] = x;
      points[i + 1] = imgLength - y;
      points[i + 2] = z;

      i += 3;

      if (x == 0) x -= 1;
    }
    if (y == 0) y -= 1;
  }

  return points;
}

/**
 * Sets the 'position' attribute of the model using the new the
 * depth values, as well.
 * as setting the 'color' attribute by extracting the RGB values
 * for each corresponding point.
 * @param {HTMLCanvasReference} dctx  The HTML context that contains
 * the depth image.
 * @param {HTMLCanvasReference} ctx The HTML context that contains
 * the visual image.
 */
function updatePointsAndColors(dctx, ctx) {
  const points = teacherModel.getAttribute('position').array;
  const colors = [];
  const color = new THREE.Color();
  const depthData = dctx.getImageData(0, 0, imgWidth, imgLength).data;
  const colorData = ctx.getImageData(0, 0, imgWidth, imgLength).data;

  let x;
  let y;
  let z;
  let i = 0;

  for (y = 0; y < imgLength; y += subSample) {
    for (x = 0; x < imgWidth; x += subSample) {
      z = (depthData[getLoc(x, y)] +
      depthData[getLoc(x, y) + 1] +
      depthData[getLoc(x, y) + 2]) / 3;
      if (blueMan) z = 255 - z;
      points[i] = x;
      points[i + 1] = imgLength - y;
      points[i + 2] = z;

      const r = colorData[getLoc(x, y)] / 255;
      const g = colorData[getLoc(x, y) + 1] / 255;
      const b = colorData[getLoc(x, y) + 2] / 255;

      color.setRGB(r, g, b);

      colors.push(color.r, color.g, color.b);

      i += 3;

      if (x == 0) x -= 1;
    }
    if (y == 0) y -= 1;
  }

  teacherModel.setAttribute('position',
      new THREE.Float32BufferAttribute(points, 3));
  teacherModel.setAttribute('color',
      new THREE.Float32BufferAttribute(colors, 3));
}

/**
 * iterates through the depth data provided in main, and forms
 * triangles of adjacent points, where the z value of each vertex
 * is the depth value, encoded as the red value, of the depth map.
 * @param  {HTMLCanvasReference} dctx The HTML context that contains
 * the depth image
 * @return {Float32Array} A list of three numbers for each triangle
 * created from the pixels in the depth image, each triangle consists
 * of three vertices
 */
function initTriangles(dctx) {
  const depthData = dctx.getImageData(0, 0, imgWidth, imgLength).data;

  let x;
  let y;
  const UVs = [];
  const verts = [];

  for (x = 0; x < imgWidth - subSample; x+= subSample) {
    for (y = 0; y < imgLength - subSample - 1; y+= subSample) {
      const tl = (depthData[getLoc(x, y)] +
      depthData[getLoc(x, y) + 1] +
      depthData[getLoc(x, y) + 2])/3;

      const tr = (depthData[getLoc(x + subSample, y)] +
      depthData[getLoc(x + subSample, y) + 1] +
      depthData[getLoc(x + subSample, y) + 2])/3;

      const bl = (depthData[getLoc(x, y + subSample)] +
      depthData[getLoc(x, y + subSample) + 1] +
      depthData[getLoc(x, y + subSample) + 2])/3;

      const br = (depthData[getLoc(x + subSample, y + subSample)] +
      depthData[getLoc(x + subSample, y + subSample) + 1] +
      depthData[getLoc(x + subSample, y + subSample) + 2])/3;

      if (blueMan) {
        if (tl > 255 - thresh || tr > 255 - thresh || br > 255 - thresh) continue;
      } else {
        if (tl < thresh || tr < thresh || br < thresh) continue;
      }

      verts.push(x + subSample);
      verts.push(imgLength - y);
      verts.push(tr);

      UVs.push(getUVx(x + subSample));
      UVs.push(getUVy(y));

      verts.push(x + subSample);
      verts.push(imgLength - y - subSample);
      verts.push(br);

      UVs.push(getUVx(x + subSample));
      UVs.push(getUVy(y + subSample));

      verts.push(x);
      verts.push(imgLength - y);
      verts.push(tl);

      UVs.push(getUVx(x));
      UVs.push(getUVy(y));
      if (blueMan) {
        if (bl > 255 - thresh) continue;
      } else {
        if (bl < thresh) continue;
      }

      verts.push(x + subSample);
      verts.push(imgLength - y - subSample);
      verts.push(br);
      UVs.push(getUVx(x + subSample));
      UVs.push(getUVy(y + subSample));

      verts.push(x);
      verts.push(imgLength - y - subSample);
      verts.push(bl);
      UVs.push(getUVx(x));
      UVs.push(getUVy(y + subSample));

      verts.push(x);
      verts.push(imgLength - y);
      verts.push(tl);
      UVs.push(getUVx(x));
      UVs.push(getUVy(y));
    }
  }

  const ret = [];
  ret.push(new Float32Array(verts));
  ret.push(new Float32Array(UVs));

  return ret;
}

/**
 * calls createPointCloud using the array of points
 * returned by initPointCloud to create a
 * geometry object, which is then added to the scene.
 * @param  {HTMLCanvasReference} dctx The HTML context
 * that contains the depth image.
 * @param  {CanvasTexure} texture The texture to be mapped
 * onto the model.
 */
function modelFromPoints(dctx, ctx) {
  updatePointsAndColors(dctx, ctx);
  createPointCloudModel();
}

/**
 * calls createMeshModel using the array of points returned
 * by initTriangles to create a geometry object, which is
 * then added to the scene.
 * @param  {HTMLCanvasReference} dctx The HTML context that
 * contains the depth image
 * @param  {CanvasTexure} texture The texture to be mapped
 * onto the model
 */
function modelFromTriangles(dctx) {
  createMeshModel(initTriangles(dctx));
}

/**
 * calls createIndexedModel using the array of points returned
 * by initPointCloud to create an
 * indexed geometry object, which is then added to the scene.
 * @param  {HTMLCanvasReference} dctx The HTML context that
 * contains the depth image
 */
function modelFromIndexes(dctx) {
  points = updatePoints(dctx);
  const indices = filterIndices(points);
  createIndexedModel(indices);
}

/**
 * Creates a 2D model when no depth data is available,
 * performs backgorund removal with sensor flow.
 * @param {HTMLCanvasElement} ctx The canvas containing the picture image
 */
function model2DNoDepth(ctx) {
  const flatCanvas = document.getElementById('flatCanvas');

  flatCanvas.imageData = removeBackground(getPictureData(ctx), ctx);

  const texture = new THREE.Texture(flatCanvas);
  const plane = new THREE.PlaneGeometry(5, 5);
  const mesh = new THREE.Mesh(plane, new THREE.MeshPhongMaterial( {
    color: 'white',
    map: texture,
    alphaTest: 0.5,
    transparent: true,
    side: THREE.FrontSide,
  }));

  mesh.name = 'model';
  modelPresent = true;

  addVR(mesh);
}

/**
 * Creates a 2D model, performing background removal with
 * the depth data.
 * @param {HTMLCanvasElement} ctx The HTML context that contains
 * the picture image.
 * @param {HTMLCanvasElement} dctx The HTML context that contains
 * the depth image.
 */
function model2DWithDepth(ctx, dctx) {
  const depthData = getDepthData(dctx);
  const pictureData = getPictureData(ctx);
  const maxDist = 255;

  for (let x = 0; x < imgWidth; x ++) {
    for (let y = 0; y < imgLength; y ++) {
      const start = getLoc(x, y);

      const z = (depthData[start] +
      depthData[start + 1] +
      depthData[start + 2]) / 3;

      if (z >= maxDist) pictureData[start + 3] = 255;
    }
  }

  ctx.imageData = pictureData;

  const texture = new THREE.Texture(ctx);
  const plane = new THREE.PlaneGeometry(5, 5);
  const mesh = new THREE.Mesh(plane, new THREE.MeshPhongMaterial( {
    color: 'white',
    map: texture,
    alphaTest: 0.5,
    transparent: true,
    side: THREE.FrontSide,
  }));

  mesh.name = 'model';
  modelPresent = true;

  addVR(mesh);
}

/**
 * creates a geometry object and adds it to the scene using
 * one of many methods, depending on the content of the type argument.
 * @param  {HTMLCanvasReference} dctx The HTML context that contains
 * the depth image.
 * @param  {HTMLCanvasReference} ctx  The HTML context that contains
 * the picture image.
 * @param  {HTMLCanvasElement}  depthCanvas The canvas element onto
 * which the depth image will be drawn.
 * @param  {HTMLCanvasElement}  imageCanvas The canvas element onto
 * which the picture image will be drawn.
 */
function createDynamicModel(dctx, ctx, depthCanvas, imageCanvas) {
  ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
  dctx.clearRect(0, 0, depthCanvas.width, depthCanvas.height);

  dctx.drawImage(depthVideo, 0, 0, imgWidth, imgLength);


  switch (modelType) {
    case 'M1': // index
      modelFromIndexes(dctx);
      break;
    case 'M2': // point cloud
      ctx.drawImage(pictureVideo, 0, 0, imgWidth, imgLength);
      modelFromPoints(dctx, ctx);
      break;
  }

  goAndRender = true;
}
/**
 * Will add jdoc later
 */
function createStaticModel() {
  switch (modelType) {
    // case 'M5': // point cloud with shaders
    //   createLightWeightPointCloudModel();
    //   break;
    case 'M6': // hidden
      hideModel();
      break;
  }
}

/**
 * Removes the model from the scene and does not
 * render a new model until the type is set to a
 * visible type
 */
function hideModel() {
  removeModel();
  goAndRender = false;
}

/**
 * Checks if a model is present. If it is, removes it,
 * else does nothing
 */
function removeModel() {
  if (modelPresent) {
    const model = scene.getObjectByName('model');
    scene.remove(model);
    modelPresent = false;
  }
}


/**
 * Retrieves the html video element containing the picture image.
 * @return the element with id=lidarVideoStream1
 */
function getPictureVideo() {
  return document.getElementById('lidarVideoStream1');
}

/**
 * Retrieves the html video element containing the depth image.
 * @return the element with id=lidarVideoStream2
 */
function getDepthVideo() {
  return document.getElementById('lidarVideoStream2');
}

/**
 * Retrieves the html video element containing the depth image.
 * @return the element with id=recordedPictureStream
 */
function getRecordedPictureVideo() {
  return document.getElementById('kinectVideo');
}

/**
 * Retrieves the html video element containing the depth image.
 * @return the element with id=recordedDepthStream
 */
function getRecordedDepthVideo() {
  return document.getElementById('kinectVideo');
}

/**
 * Retrieves the imageData from the picture video frame.
 * @param {HTMLCanvasElement} ctx The canvas on whihc the picture
 * is drawn.
 * @returns The imageData
 */
function getPictureData(ctx) {
  return ctx.getImageData(0, 0, imgWidth, imgLength).data;
}

/**
 * Retrieves the imageData from the picture video frame.
 * @param {HTMLCanvasElement} dctx The canvas on whihc the picture
 * is drawn.
 * @returns The imageData
 */
function getDepthData(dctx) {
  return dctx.getImageData(0, 0, imgWidth, imgLength).data;
}

/**
 * Checks wether the picture and depth videos are present,
 * in order to determine what can be displayed.
 * @returns 0 if the picture video is not present, meaning
 * that neither a model or video of the teacher can be created
 * 1 if the picture is present but not the depth video,
 * meaning that a video can be created, but not a model
 * 2 if the picture and depth video are present, meaning that
 * both a video and a model can created.
 */
function okToModel() {
  if (getPictureVideo().duration > 0) {
    if (getDepthVideo().duration > 0) {
      return 2;
    } else {
      return 1;
    }
  } else {
    return 0;
  }
}

/**
 * Confirms that it is possible to create a model and exactly which model
 * to create based on the response from okToModel()
 * @param  {HTMLCanvasReference} dctx The HTML context that contains
 * the depth image.
 * @param  {HTMLCanvasReference} ctx  The HTML context that contains
 * the picture image.
 * @param  {HTMLCanvasElement}  depthCanvas The canvas element onto
 * which the depth image will be drawn.
 * @param  {HTMLCanvasElement}  imageCanvas The canvas element onto
 * which the picture image will be drawn.
 */
function animateTeacher(dctx, ctx, depthCanvas, imageCanvas) {
  if (goAndRender) { // Add okToModel() == 2 back when you're done
    removeModel();
    if (dynamicModels.includes(modelType)) {
      createDynamicModel(dctx, ctx, depthCanvas, imageCanvas);
    } else if (staticModels.includes(modelType)) {
      createStaticModel();
    }
  }
}

/**
 * Dynamically alters the type of model being created by
 * retrieving the selected option from the webpage.
 */
function updateType() {
  const newType = document.getElementById('modelType').value;

  switch (newType) {
    case 'M3':
      console.log('Changed to face tracking');
      faceMeshFlag = true;
      face.visible = true;
      bodyTrackFlag = false;
      bodyGroup.visible = false;
      break;
    case 'M4':
      console.log('Changed to body tracking');
      faceMeshFlag = false;
      face.visible = false;
      bodyGroup.visible = true;
      bodyTrackFlag = true;
      break;
    case 'M5':
      console.log('Changed to hidden');
      faceMeshFlag = false;
      face.visible = false;
      bodyGroup.visible = false;
      bodyTrackFlag = false;
      break;
    default:
      console.log('Changed to 3d modelling');
      faceMeshFlag = false;
      face.visible = false;
      bodyTrackFlag = false;
      bodyGroup.visible = false;
      teacherModel = new THREE.BufferGeometry();
      initModel();
      goAndRender = true;
  }

  modelType = newType;
  removeModel();
}

/**
 * Dynamically updates the model resolution by changing the sampling
 * frequency (subSample) as selected on the webpage.
 */
function updateSubSample() {
  const newSub = document.getElementById('subSampleRange').value;
  subSample = parseInt(newSub);

  pointSize = subSample / 20;

  perWidth = Math.floor(imgWidth / subSample) + 1;
  perLength = Math.floor(imgLength / subSample) + 1;

  const value = document.getElementById('subSampleVal');

  value.innerHTML = newSub;

  initModel();
}

/**
 * Dynamically updates the x position of the model as selected
 * on the webpage.
 */
function updateModelPos() {
  const newX = parseInt(document.getElementById('modelPosRange').value);

  const diff = newX - teacherX;
  teacherX = -newX;

  const model = scene.getObjectByName('model');
  model.translate(diff, 0);
}

/**
 * Changes the display style of the menu containing the user configurable
 * modelling settings to either be extended or collapsed. Additionally,
 * changes the label on the toggle button on the web page to match the
 * current status.
 */
function toggleAdvancedOptions() {
  if (!advOpts) {
    document.getElementById('advancedOptionsDiv').style.display = 'block';
    document.getElementById('advOptBtn').innerHTML = 'Hide Advanced Options';
    advOpts = true;
  } else {
    document.getElementById('advancedOptionsDiv').style.display = 'none';
    advOpts = false;
    document.getElementById('advOptBtn').innerHTML = 'Show Advanced Options';
  }
}

/**
 * getter for baseIndices
 * @return {number[]} baseIndices
 */
function getBaseIndices() {
  return baseIndices;
}

/**
 * getter for teacherModel
 * @return {THREE.BufferGeometry} teacherModel
 */
function getTeacherModel() {
  return teacherModel;
}

/**
 * getter for scene
 * @return {THREE.Scene} scene
 */
function getScene() {
  return scene;
}

/**
 * getter for modelType
 * @return {string} modelType
 */
function getModelType() {
  return modelType;
}

/**
 * getter for teacherX
 * @return {number} teacherX
 */
function getTeacherX() {
  return teacherX;
}

/**
 * getter for advOpts
 * @return {boolean} advOpts
 */
function getAdvOpts() {
  return advOpts;
}

/**
 * setter for advOpts
 * @param {boolean} res new input for advOpts
 */
function setAdvOpts(res) {
  advOpts = res;
}

/**
 * setter for teacherX
 * @param {boolean} res new input for teacherX
 */
function setTeacherX(newX) {
  teacherX = newX;
}

/**
 * setter for teacherModel
 * @param {boolean} res new input for teacherModel
 */
function setTeacherModel(model) {
  teacherModel = model;
}

/**
 * setter for modelType
 * @param {boolean} res new input for modelType
 */
function setModelType(type) {
  modelType = type;
}


// The following code is to be commented out when testing this file,
// otherwise it should not be included

/*
export default {
 subSample, pointSize, thresh, imgWidth,
 imgLength, perWidth, perLength, baseIndices,
 points, modelPresent, modelType, teacherX, advOpts,
 initModel, initPoints, initUV, initIndex,
 toggleAdvancedOptions, updateSubSample, updateModelPos,
 updateType, animateTeacher, getBaseIndices,
 getUVx, getUVy, getLoc, filterIndices, createMeshModel,
 createIndexedModel, updatePoints, updatePointsAndColors,
 initTriangles, createDynamicModel, getDepthVideo,
 getScene, createPointCloudModel, modelFromTriangles, modelFromIndexes,
 getPictureVideo, setModelType, getTeacherModel,
 setTeacherModel, okToModel, getModelType, getTeacherX,
 setTeacherX, getAdvOpts, setAdvOpts,
 toggleAdvancedOptions,
}
*/
