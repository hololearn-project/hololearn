/* eslint-disable */
var obj3D, gui, skeletonHelper, bones, skinnedMesh, skeleton, geometry, face, faceGeometry;
var material = new THREE.MeshPhongMaterial( {
  skinning : true,
  color: 0x055289,
  emissive: 0x162534,
  side: THREE.DoubleSide,
  flatShading: true,
  vertexColors: true
} );

const textureLoader = new THREE.TextureLoader();

let MULT = 40;
let X_OFFSET = -22;
let Y_OFFSET = 20;
let Z_OFFSET = 22;
let Z_CORRECTION = 20;

function changeXoffset(diff) {
  X_OFFSET += diff
}

function changeYoffset(diff) {
  Y_OFFSET += diff
}

function changeZoffset(diff) {
  Z_OFFSET += diff
  console.log(X_OFFSET, Y_OFFSET, Z_OFFSET);
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

        // console.log(gltf)

        face = gltf.scene

        mesh = face.children[0].children[0]

        mesh.material.wireframe = true;

        // mesh.material = material;

        scene.add(face);

        face.rotation.y += Math.PI

        face.position.y += 15;
        face.position.z -= 15;

        // face.scale.set(100, 100, 100)

        faceGeometry = mesh.geometry

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

        scene.add(face);

        face.rotation.y += Math.PI

        face.position.y += 50;
       
        mesh = face.children[2];
        geometry = mesh.geometry;

        // console.log(mesh);

        // const toonMaterial = new THREE.MeshToonMaterial( { 
        //   color: 0x055289,
        //   gradientMap: gradientMaps.threeTone,
        //   alphaMap: alphaMaps.fibers,
        //   side: THREE.DoubleSide,
        //   flatShading: true,
        //   vertexColors: true } );

        // mesh.material = toonMaterial;

        // console.log(mesh);
        // facePositions = faceGeometry.attributes.position.array;

      },
      function( xhr ) {
        //console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
      },
      function( err ) {
        //console.error( 'An error happened' );
      });

}

function loadMaleModel() {

  const loader = new THREE.GLTFLoader();

  loader.load(
      './assets/models/male.glb',
      function( gltf ) {

        obj3D = gltf.scene.children[0]
        assets = obj3D.children

        scene.add(obj3D);

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
        scene.add(skeletonHelper);

        // initGui();

      },
      function( xhr ) {
        //console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
      },
      function( err ) {
        //console.error( 'An error happened' );
      });

}

function updateSkeleton() {

}

async function drawSkeleton() {
    loadMaleModel();
    loadCanonicalFaceModel();
}








