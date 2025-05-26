import * as THREE from 'three';  
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { initRenderer, initCamera, initStats, initOrbitControls, 
         initDefaultLighting, addLargeGroundPlane, addGeometryWithMaterial } from './util.js';

const scene = new THREE.Scene();
const renderer = initRenderer();
const camera = initCamera(new THREE.Vector3(0, 20, 40));
const stats = initStats();
const orbitControls = initOrbitControls(camera, renderer);

const textureLoader = new THREE.TextureLoader();
const groundPlane = addLargeGroundPlane(scene, true)
groundPlane.position.y = -8;

initDefaultLighting(scene);
scene.add(new THREE.AmbientLight(0x444444));

const pointLight = new THREE.PointLight("#ff5808");
scene.add(pointLight);
const sphereLight = new THREE.SphereGeometry(0.2);
const sphereLightMaterial = new THREE.MeshStandardMaterial({color: 0xff5808});
const sphereLightMesh = new THREE.Mesh(sphereLight, sphereLightMaterial);
scene.add(sphereLightMesh);

const gui = new GUI();
const controls = {
  normalScaleX: 1,
  normalScaleY: 1
};

const cube = new THREE.BoxGeometry(16, 16, 16)
const cubeMaterial = new THREE.MeshStandardMaterial({
    map: textureLoader.load("./assets/textures/plaster.jpg"),
    metalness: 0.2,
    roughness: 0.07
});

// normal map: 3D model surface에 높낮이 detail을 추가하여 더 현실적인 효과
// normal map image는 RGB로 표현되며, R은 X축, G는 Y축, B는 Z축의 높낮이를 나타냄
// normal map은 bump map과 달리 높낮이 detail을 더 정확하게 표현할 수 있음
const cubeMaterialWithNormalMap = cubeMaterial.clone();
cubeMaterialWithNormalMap.normalMap = textureLoader.load("./assets/textures/plaster-normal.jpg")

const cube1 = addGeometryWithMaterial(scene, cube, 'cube-1', gui, controls, cubeMaterial);
cube1.position.x = -17;
cube1.rotation.y = 1/3*Math.PI;

const cube2 = addGeometryWithMaterial(scene, cube, 'cube-2', gui, controls, cubeMaterialWithNormalMap);
cube2.position.x = 17;
cube2.rotation.y = -1/3*Math.PI;

gui.add(controls, "normalScaleX", -3, 3, 0.001).onChange(
  function(e) {cubeMaterialWithNormalMap.normalScale.set(controls.normalScaleX, controls.normalScaleY)});
gui.add(controls, "normalScaleY", -3, 3, 0.001).onChange(
  function(e) {cubeMaterialWithNormalMap.normalScale.set(controls.normalScaleX, controls.normalScaleY)});

render();

function render() {

  stats.update();
  orbitControls.update();

  requestAnimationFrame(render);
  renderer.render(scene, camera);

}
