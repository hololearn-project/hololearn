/* eslint-disable */
var obj3D, gui, skeletonHelper, bones, skinnedMesh, skeleton, geometry, face, faceGeometry, vertMarker, meshes, bodyGroup;
var material = new THREE.MeshPhongMaterial( {
  skinning : true,
  color: 0x055289,
  emissive: 0x162534,
  side: THREE.DoubleSide,
  flatShading: true,
  vertexColors: true
} );

var vertGeometry = new THREE.BoxGeometry(5, 5, 5);
var basicMaterial = new THREE.MeshBasicMaterial({
  color: 0x0000ff,
  transparent: false
});

const textureLoader = new THREE.TextureLoader();

function changeXoffset(diff) {
  X_OFFSET += diff
}

function changeYoffset(diff) {
  Y_OFFSET += diff
}

function changeZoffset(diff) {
  Z_OFFSET += diff
  console.log("new offset:\n", X_OFFSET, Y_OFFSET, Z_OFFSET);
}

function updateMult(){
  MULT = parseInt(document.getElementById('multRange').value);
}

const gradientMaps = ( function () {

  const threeTone = textureLoader.load( './assets/gradientMaps/threeTone.jpg' );
  threeTone.minFilter = THREE.NearestFilter;
  threeTone.magFilter = THREE.NearestFilter;

  const fiveTone = textureLoader.load( './assets/gradientMaps/fiveTone.jpg' );
  fiveTone.minFilter = THREE.NearestFilter;
  fiveTone.magFilter = THREE.NearestFilter;

  return {
    none: null,
    threeTone: threeTone,
    fiveTone: fiveTone
  };

} )();

const alphaMaps = ( function () {

  const fibers = textureLoader.load( './assets/textures/alphaMap.jpg' );
  fibers.wrapT = THREE.RepeatWrapping;
  fibers.wrapS = THREE.RepeatWrapping;
  fibers.repeat.set( 9, 1 );

  return {
    none: null,
    fibers: fibers
  };

} )();

function loadCanonicalFaceModel() {

  const loader = new THREE.GLTFLoader();

  loader.load(
      './assets/models/canonical_face_model.glb',
      function( gltf ) {

        face = gltf.scene

        mesh = face.children[0].children[0]

        mesh.material.wireframe = true;

        faceGeometry = mesh.geometry

        faceGeometry.setAttribute('uv',
          new THREE.BufferAttribute(new Float32Array(genUVs()), 2));

        const canonTexture = textureLoader.load('./assets/textures/clown.png');

        const canonMaterial = new THREE.MeshBasicMaterial({ 
          map: canonTexture,
          side: THREE.DoubleSide});
        
        mesh.material = canonMaterial;

        // or

        // mesh.material.map = canonTexture;

        scene.addVR(face);

        face.visible = false;

        face.rotation.y += Math.PI;

        face.position.y += 15;
        face.position.z -= 15;

        // face.scale.set(100, 100, 100)

        console.log("face geometry loaded"); //faceGeometry
        

        facePositions = faceGeometry.attributes.position.array;

      },
      function( xhr ) {
        //console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
      },
      function( err ) {
        //console.error( 'An error happened' );
      });

}

function loadCanonicalFaceModelWithTexture() {

  const loader = new THREE.GLTFLoader();

  loader.load(
      './assets/models/canonical_face_with_texture.glb',
      function( gltf ) {


        face = gltf.scene

        scene.addVR(face);

        // face.rotation.y += Math.PI

        face.position.y += 50;
        
        vertMarker = new THREE.Mesh(vertGeometry, vertMaterial);
        vertMarker.scale.set(10, 10, 10);
        scene.addVR(vertMarker)
       
        mesh = face.children[2];
        mesh.material.wireframe = true;

        faceGeometry = mesh.geometry

        faceGeometry = mesh.geometry;

      },
      function( xhr ) {
      },
      function( err ) {
        //console.error( 'An error happened' );
      });

}

function loadMaleModel() {

  const loader = new THREE.GLTFLoader();

  bodyGroup = new THREE.Group();

  loader.load(
      './assets/models/male.glb',
      function( gltf ) {

        obj3D = gltf.scene.children[0]
        assets = obj3D.children

        bodyGroup.add(obj3D);

        skinnedMesh = assets[3]

        skeleton = skinnedMesh.skeleton

        bones = skeleton.bones

        skinnedMesh.material = material

        obj3D.rotation.y += Math.PI

        obj3D.scale.set(2, 2, 2)

        obj3D.position.z = 18;
        obj3D.position.x = 11;

        skeletonHelper = new THREE.SkeletonHelper(obj3D);
        skeletonHelper.material.linewidth = 10;
        bodyGroup.add(skeletonHelper);

        bodyGroup.visible = false;

        scene.addVR(bodyGroup);

        // initGui();

      },
      function( xhr ) {
        //console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
      },
      function( err ) {
        //console.error( 'An error happened' );
      });

}

function updateVertexMarker() {
  if (typeof faceGeometry == 'undefined') return;

  facePositions = faceGeometry.attributes.position.array;

  vertMarker.position.x = facePositions[(3*vertexMarker)];
  vertMarker.position.y = facePositions[(3*vertexMarker)+1] + 50;
  vertMarker.position.z = facePositions[(3*vertexMarker)+2];

  vertexMarker++;
}

function drawSphere() {

  const circle = new THREE.SphereGeometry( 15, 32, 16 );

  const canonTexture = textureLoader.load('./assets/textures/canonical-face-texture-photoshop.jpg');
  
  const canonMaterial = new THREE.MeshBasicMaterial({ 
    map: canonTexture,
    side: THREE.DoubleSide});

  const sphere = new THREE.Mesh( circle, canonMaterial );

  scene.addVR( sphere );
}

function genUVs() {

  const uvs = []

  let k;

  for(k = 0; k < 468; k++) {
    uvs.push(x_uv[mapping[k]]);
    uvs.push(y_uv[mapping[k]]);
  }

  return uvs;

}

function createLooseBody() {

  meshes = []

  let t;

  const canonTexture = textureLoader.load('./assets/textures/clown.png');

  let offset = 0;

  const canonMaterial = new THREE.MeshBasicMaterial({ 
    map: canonTexture,
    side: THREE.DoubleSide});

  for(t = 0; t < 33; t++) {
    const geo = new THREE.SphereGeometry(0.4);
    const tracker = new THREE.Mesh(geo, canonMaterial);
    bodyGroup.add(tracker);
    meshes.push(tracker);
  }

  scene.addVR(bodyGroup);

}

async function loadAssets() {
    loadMaleModel();
    // createLooseBody();
    loadCanonicalFaceModel();
}
