import * as THREE from 'three';
import { initStats, initRenderer, initCamera, initOrbitControls, 
         initDefaultLighting, addGroundPlane } from './util.js';

const scene = new THREE.Scene();
const renderer = initRenderer();  // util.js
const camera = initCamera(); // util.js
const stats = initStats(); // util.js
const orbitControls = initOrbitControls(camera, renderer); // util.js

// mouse down event handler 설정
document.addEventListener('mousedown', onDocumentMouseDown, false);  

initDefaultLighting(scene); // util.js

const groundPlane = addGroundPlane(scene)  // util.js
groundPlane.position.y = 0;

// create a cube
const cubeGeometry = new THREE.BoxGeometry(4, 4, 4);
const cubeMaterial = new THREE.MeshStandardMaterial({color: 0xff0000});
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
cube.name = 'cube';
cube.castShadow = true;

// position the cube
cube.position.x = -10;
cube.position.y = 2;
cube.position.z = 0;

// add the cube to the scene
scene.add(cube);

const sphereGeometry = new THREE.SphereGeometry(4, 20, 20);
const sphereMaterial = new THREE.MeshStandardMaterial({color: 0x7777ff});
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphere.name = 'sphere';
// position the sphere
sphere.position.x = 20;
sphere.position.y = 4;
sphere.position.z = 2;
sphere.castShadow = true;
// add the sphere to the scene
scene.add(sphere);

const cylinderGeometry = new THREE.CylinderGeometry(2, 2, 5);
const cylinderMaterial = new THREE.MeshStandardMaterial({color: 0x77ff77});
const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
cylinder.name = 'cylinder';
cylinder.castShadow = true;
cylinder.position.set(0, 2.5, 1);
scene.add(cylinder);

// position and point the camera to the center of the scene
camera.position.x = -30;
camera.position.y = 40;
camera.position.z = 30;
camera.lookAt(scene.position);

// add subtle ambient lighting
const ambienLight = new THREE.AmbientLight(0x353535);
scene.add(ambienLight);

render();

function render() {
    stats.update();
    orbitControls.update();
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}

function onDocumentMouseDown(event) {

    let vector = new THREE.Vector3((event.clientX / window.innerWidth) * 2 - 1, 
                                    -(event.clientY / window.innerHeight) * 2 + 1, 0.5);
    vector = vector.unproject(camera); // 현재 click된 point를 3D 좌표로 변환 (world 좌표계)

    // Raycaster: origin, direction
    // origin: 카메라의 위치, direction: 카메라의 위치에서 클릭된 위치로 향하는 벡터 (vector.sub(camera.position))
    const raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
    const intersects = raycaster.intersectObjects([sphere, cylinder, cube]);

    if (intersects.length > 0) { // 하나 이상의 intersection이 발생하면, 가장 가까운 object를 선택
        console.log(intersects[0]);
        intersects[0].object.material.transparent = true; // select된 object를 투명 가능하게 하는 option
        intersects[0].object.material.opacity = 0.1;      // 투명도는 0.1로 설정
        // material update flag를 true로 해 주어야만 three.js가 렌더링 시 
        // 재계산을 하게 된다. material을 투명하게 만들었음. 
        intersects[0].object.material.needsUpdate = true;
        render();
    }
}
