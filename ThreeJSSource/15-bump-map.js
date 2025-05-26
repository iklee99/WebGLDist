import * as THREE from 'three';  
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { initRenderer, initCamera, initStats, initOrbitControls, 
         initDefaultLighting, addLargeGroundPlane, addGeometryWithMaterial } from './util.js';

const stats = initStats();
const renderer = initRenderer();
const camera = initCamera(new THREE.Vector3(0, 20, 40));
const orbitControls = initOrbitControls(camera, renderer);
const clock = new THREE.Clock();

const scene = new THREE.Scene();
const textureLoader = new THREE.TextureLoader();
const groundPlane = addLargeGroundPlane(scene, true)
groundPlane.position.y = -8;

initDefaultLighting(scene);
scene.add(new THREE.AmbientLight(0x444444));

const gui = new GUI();
const controls = {};

const cube = new THREE.BoxGeometry(16, 16, 16)
// 일반적인 texture를 적용한 material
const cubeMaterial = new THREE.MeshStandardMaterial({
    map: textureLoader.load("./assets/textures/stone.jpg"),
    metalness: 0.2,
    roughness: 0.07
});

// bump map: 3D model surface에 높낮이 detail을 추가하여 더 현실적인 효과
// bump map image의 밝기가 높을 수록 높이가 높아짐
const cubeMaterialWithBumpMap = cubeMaterial.clone();
cubeMaterialWithBumpMap.bumpScale = 2.0; 
cubeMaterialWithBumpMap.bumpMap = textureLoader.load("./assets/textures/stone-bump.jpg")

const cube1 = addGeometryWithMaterial(scene, cube, 'cube-1', gui, controls, cubeMaterial);
cube1.position.x = -17;
cube1.rotation.y = 1/3*Math.PI;

const cube2 = addGeometryWithMaterial(scene, cube, 'cube-2', gui, controls, cubeMaterialWithBumpMap);
cube2.position.x = 17;
cube2.rotation.y = -1/3*Math.PI;

gui.add(cubeMaterialWithBumpMap, "bumpScale", -1, 6, 0.001)

render();
function render() {
  stats.update();
  orbitControls.update();
  requestAnimationFrame(render);
  renderer.render(scene, camera);
}
