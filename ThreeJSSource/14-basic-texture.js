import * as THREE from 'three';  
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { initRenderer, initCamera, initStats, initOrbitControls, 
         initDefaultLighting, addLargeGroundPlane, addGeometry } from './util.js';

const scene = new THREE.Scene();
const renderer = initRenderer();
const camera = initCamera(new THREE.Vector3(0, 20, 40));

const orbitControls = initOrbitControls(camera, renderer);
const stats = initStats();

const groundPlane = addLargeGroundPlane(scene)
groundPlane.position.y = -10;
groundPlane.receiveShadow = true;
initDefaultLighting(scene);
scene.add(new THREE.AmbientLight(0x444444));

const textureLoader = new THREE.TextureLoader();

// Icosahedron: 정 20면체, 8은 radius, 0은 detail level 
// detail level: 0은 default, 1은 더 많은 면, 2는 더 많은 면 (삼각형을 4개로 계속 나누어 감)
const polyhedron = new THREE.IcosahedronGeometry(8, 0); 
// texture 적용, addGeometry 함수는 util.js에 정의되어 있음
const polyhedronMesh = addGeometry(scene, polyhedron, 
                        textureLoader.load('./assets/textures/metal-rust.jpg'));
polyhedronMesh.position.x = 20;
polyhedronMesh.castShadow = true;

// Sphere: 반지름 5, 20은 가로 세로 분할 수
const sphere = new THREE.SphereGeometry(5, 20, 20)
const sphereMesh = addGeometry(scene, sphere,
                        textureLoader.load('./assets/textures/floor-wood.jpg'));
sphereMesh.castShadow = true;

// Cube: 가로, 세로, 높이 10
const cube = new THREE.BoxGeometry(10, 10, 10)
const cubeMesh = addGeometry(scene, cube,
                        textureLoader.load('./assets/textures/brick-wall.jpg'));
cubeMesh.position.x = -20;
cubeMesh.castShadow = true;

render();

function render() {
  stats.update();
  orbitControls.update();
  requestAnimationFrame(render);
  renderer.render(scene, camera);
  polyhedronMesh.rotation.x += 0.01;
  sphereMesh.rotation.y += 0.01;
  cubeMesh.rotation.z += 0.01;
}

