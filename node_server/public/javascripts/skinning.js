/* eslint-disable */
var obj3D, gui, skeletonHelper, bones, skinnedMesh, skeleton, geometry;
var state = {
        animateBones : false
};

const poseParts = ['Left Shoulder', 'Left Elbow', 'Left Wrist', 'Right Shoulder', 'Right Elbow', 'Right Wrist', 'Head', 'Right Hip', 'Right Knee', 'Right Heel', 'Right Foot',  'Left Hip', 'Left Knee', 'Left Heel', 'Left Foot']

function initGui() {

    gui = new dat.GUI();

    const bodyParts = ['Whole body', 'Left Shoulder', 'Left Elbow', 'Left Wrist', 'Right Shoulder', 'Right Elbow', 'Right Wrist', 'Upper Torso', 'Lower Torso', 'Neck', 'Head', 'Right Hip', 'Right Knee', 'Right Heel', 'Right Foot',  'Left Hip', 'Left Knee', 'Left Heel', 'Left Foot']
    const partIndicies = [4, 10, 11, 12, 33, 34, 35, 6, 5, 7, 8, 59, 60, 61, 62, 55, 56, 57, 58]

    var folder;

    for ( var i = 0; i < partIndicies.length; i ++ ) {

        var bone = bones[partIndicies[i]];

        folder = gui.addFolder(bodyParts[i]);

        folder.add( bone.position, 'x', - 10 + bone.position.x, 10 + bone.position.x );
        folder.add( bone.position, 'y', - 10 + bone.position.y, 10 + bone.position.y );
        folder.add( bone.position, 'z', - 10 + bone.position.z, 10 + bone.position.z );

        folder.add( bone.rotation, 'x', - Math.PI * 0.5, Math.PI * 0.5 );
        folder.add( bone.rotation, 'y', - Math.PI * 0.5, Math.PI * 0.5 );
        folder.add( bone.rotation, 'z', - Math.PI * 0.5, Math.PI * 0.5 );

        folder.add( bone.scale, 'x', 0, 2 );
        folder.add( bone.scale, 'y', 0, 2 );
        folder.add( bone.scale, 'z', 0, 2 );

        folder.__controllers[ 0 ].name( "position.x" );
        folder.__controllers[ 1 ].name( "position.y" );
        folder.__controllers[ 2 ].name( "position.z" );

        folder.__controllers[ 3 ].name( "rotation.x" );
        folder.__controllers[ 4 ].name( "rotation.y" );
        folder.__controllers[ 5 ].name( "rotation.z" );

        folder.__controllers[ 6 ].name( "scale.x" );
        folder.__controllers[ 7 ].name( "scale.y" );
        folder.__controllers[ 8 ].name( "scale.z" );

    }
}

function loadMaleModel() {

  const loader = new THREE.GLTFLoader();

  loader.load(
      './assets/models/male.glb',
      function( gltf ) {

        console.log(gltf)

        obj3D = gltf.scene.children[0]
        assets = obj3D.children

        scene.add(obj3D);

        skinnedMesh = assets[3]

        skeleton = skinnedMesh.skeleton

        bones = skeleton.bones

        var material = new THREE.MeshPhongMaterial( {
            skinning : true,
            color: 0x055289,
            emissive: 0x162534,
            side: THREE.DoubleSide,
            flatShading: true,
            vertexColors: true
        } );

        var lineMaterial = new THREE.MeshBasicMaterial({
            skinning : true,
            wireframe: true
        });

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
        console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
      },
      function( err ) {
        console.error( 'An error happened' );
      });

}

function updateSkeleton() {

}

async function drawSkeleton() {
    loadMaleModel();
}








