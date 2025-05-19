import * as THREE from 'three';  
// FBXLoader는 FBX 파일을 로드하는 데 사용되며, addon에 포함
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';  
import { initStats, initCamera, initRenderer, initOrbitControls, 
    initDefaultDirectionalLighting } from './util.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color( 0xa0a0a0 );

const renderer = initRenderer();

const camera = initCamera();
camera.position.set( 200, 200, 500 );
scene.add(camera);

initDefaultDirectionalLighting(scene);

// ground
const mesh = new THREE.Mesh( new THREE.PlaneGeometry( 1000, 1000 ), 
                             new THREE.MeshPhongMaterial( 
                                { color: 0xcccccc, depthWrite: false } ) );
mesh.rotation.x = -0.5 * Math.PI;
mesh.receiveShadow = true;
scene.add( mesh );

const gridHelper = new THREE.GridHelper( 1200, 20, 0x000000, 0x000000 );
gridHelper.material.opacity = 0.2;
gridHelper.material.transparent = true;
scene.add( gridHelper );

// axisHelper
const axesHelper = new THREE.AxesHelper(300); 
scene.add(axesHelper); 

const orbitControls = initOrbitControls(camera, renderer);
orbitControls.target.set(0, 0, 0); 
orbitControls.update();

const stats = initStats();
document.body.appendChild(stats.dom);

// model
const loader = new FBXLoader();
let carRoot;

// Blender에서 export된, 또는 web에서 다운로드한 FBX 모델을 사용
loader.load( './assets/models/cartoonCar/Cartoon_Car_Simple.fbx', function ( object ) {
    object.traverse( function ( child ) {
        //console.log(child.name); 
        if (child.name == 'Car') {
            carRoot = child; 
        }
        if ( child.isMesh ) {
            child.castShadow = true;
        }
    } );
    scene.add( object );
} );


window.addEventListener( 'resize', onWindowResize, false );

const startTime = Date.now(); 
animate();

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
    requestAnimationFrame( animate );
    let currentTime = Date.now(); 
    let time = (currentTime - startTime) / 1000;  // in seconds
    const zSize = 200; 
    // -zSize ~ zSize 사이를 자동차가 왔다 갔다 함
    carRoot.position.z = Math.sin(time) * zSize;  
    renderer.render( scene, camera );
    stats.update();
    orbitControls.update();
}