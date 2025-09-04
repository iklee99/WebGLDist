import * as THREE from 'three';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { initStats, initRenderer, initCamera, initOrbitControls, 
         initDefaultLighting, addGeometryWithMaterial } from './util.js';

const scene = new THREE.Scene();
const renderer = initRenderer();
const camera = initCamera(new THREE.Vector3(0, 20, 40));
const orbitControls = initOrbitControls(camera, renderer);
const stats = initStats();

// create a scene, that will hold all our elements such as objects, cameras and lights.
// and add some simple default lights

initDefaultLighting(scene);

const gui = new GUI();
const controls = {
  refraction: false // refraction: 굴절 효과를 적용할지 여부
};

const textureLoader = new THREE.TextureLoader();

// 순서가 중요. right, left, top, bottom, front, back 순서
const urls = [
    './assets/textures/cubemap/flowers/right.png',
    './assets/textures/cubemap/flowers/left.png',
    './assets/textures/cubemap/flowers/top.png',
    './assets/textures/cubemap/flowers/bottom.png',
    './assets/textures/cubemap/flowers/front.png',
    './assets/textures/cubemap/flowers/back.png'
];

var cubeLoader = new THREE.CubeTextureLoader();
// scene의 background에 CubeTexture를 설정
scene.background = cubeLoader.load(urls);

// CubeTexture는 환경 맵으로 사용될 수 있으며, MeshStandardMaterial의 envMap 속성에 설정할 수 있음
var cubeMaterial = new THREE.MeshStandardMaterial({
    envMap: scene.background,
    color: 0xffffff,
    metalness: 1,        // 금속성 최대
    roughness: 0,        // 거칠기 최소
    transparent: true,   // 투명도 활성화
    opacity: 1,          // 불투명도 = 1 (초기: 완전 불투명)
    refractionRatio: 0   // 굴절률 = 0
});

// sphere의 material도 CubeTexture를 사용하여 환경 맵을 적용
var sphereMaterial = cubeMaterial.clone();
// sphere의 normal map을 설정하여 표면에 세부적인 높낮이 효과를 추가
sphereMaterial.normalMap = textureLoader.load("./assets/textures/engraved/Engraved_Metal_003_NORM.jpg");
sphereMaterial.refractionRatio = 0.6; // sphere는 다른 굴절률을 가짐

const cube = new THREE.BoxGeometry(16, 12, 12)
const cube1 = addGeometryWithMaterial(scene, cube, 'cube', gui, controls, cubeMaterial);
cube1.position.x = -15;
cube1.rotation.y = -1/3*Math.PI;

const sphere = new THREE.SphereGeometry(10, 50, 50)
const sphere1 = addGeometryWithMaterial(scene, sphere, 'sphere', gui, controls, sphereMaterial);
sphere1.position.x = 15;

// GUI initialization
gui.add(controls, "refraction").onChange(function(value) {
  // refraction: 빛이 물체를 통과할 때 굴절되는 효과를 나타냄
  // reflection: 물체의 표면에 반사되는 효과를 나타냄
  if (value) {
    // Refraction 모드: 굴절 효과
    scene.background.mapping = THREE.CubeRefractionMapping;
    cube1.material.envMap.mapping = THREE.CubeRefractionMapping;
    sphere1.material.envMap.mapping = THREE.CubeRefractionMapping;
    
    // 굴절 효과를 더 명확하게 하기 위한 설정
    cube1.material.color.setHex(0x88ccff); // 연한 파란색 (유리 느낌)
    cube1.material.metalness = 1;
    cube1.material.roughness = 0;
    cube1.material.transparent = true;
    cube1.material.opacity = 0.6;
    cube1.material.refractionRatio = 0.6; // 굴절률
    
    sphere1.material.color.setHex(0xccffcc); // 연한 녹색 (유리 느낌)
    sphere1.material.metalness = 1;
    sphere1.material.roughness = 0;
    sphere1.material.transparent = true;
    sphere1.material.opacity = 0.6;
    sphere1.material.refractionRatio = 0.6;
    
  } else {
    // Reflection 모드: 반사 효과 (기본값)
    scene.background.mapping = THREE.CubeReflectionMapping;
    cube1.material.envMap.mapping = THREE.CubeReflectionMapping;
    sphere1.material.envMap.mapping = THREE.CubeReflectionMapping;
    
    // 반사 효과를 위한 설정
    cube1.material.color.setHex(0xffffff); // 흰색 (금속 느낌)
    cube1.material.metalness = 1;
    cube1.material.roughness = 0;
    cube1.material.transparent = true;
    cube1.material.opacity = 1.0;
    cube1.material.refractionRatio = 0;
    
    sphere1.material.color.setHex(0xffffff); // 흰색 (금속 느낌)
    sphere1.material.metalness = 1;
    sphere1.material.roughness = 0;
    sphere1.material.transparent = true;
    sphere1.material.opacity = 1.0;
    sphere1.material.refractionRatio = 0;
  }
  
  // material 업데이트 필요
  cube1.material.needsUpdate = true;
  sphere1.material.needsUpdate = true;
});

render(); 

function render() {
  stats.update();
  orbitControls.update();
  requestAnimationFrame(render);
  renderer.render(scene, camera);
  cube1.rotation.y += 0.005;
  sphere1.rotation.y -= 0.01;
}