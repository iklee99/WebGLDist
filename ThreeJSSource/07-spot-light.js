// 07-spot-light.js
// - SpotLightHelper
// - SpotLight's CameraHelper
// - Spotlight penumbra
// - spotlight target

import * as THREE from 'three';  
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { initStats, initRenderer, initCamera, initOrbitControls, addDefaultCubeAndSphere, addGroundPlane } from './util.js';

const scene = new THREE.Scene();

const renderer = initRenderer();
const camera = initCamera();
const stats = initStats();
const orbitControls = initOrbitControls(camera, renderer);

// default cubbe, sphere, plane: see util.js
const cubeAndSphere = addDefaultCubeAndSphere(scene);
const cube = cubeAndSphere.cube;
const sphere = cubeAndSphere.sphere;
const plane = addGroundPlane(scene);

// add subtle ambient lighting
const ambiColor = "#1c1c1c";
const ambientLight = new THREE.AmbientLight(ambiColor);
scene.add(ambientLight);

// add directional light
const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
dirLight.position.set(100, 200, 200);
scene.add(dirLight);

// add spotlight: color, intensity=1, distance=0, angle=PI/2, penumbra=0.1, decay=2 
const spotLight = new THREE.SpotLight(0xffffff, 150, 0, Math.PI / 5, 0.1, 1);
spotLight.position.set(-40, 60, -10);
spotLight.castShadow = true;
spotLight.shadow.camera.near = 1;
spotLight.shadow.camera.far = 100;
spotLight.target = plane; // 초기 target
spotLight.shadow.camera.fov = 120;
scene.add(spotLight);
// debug camera: shadow 커버 범위를 보여줌 (on/off는 GUI에서)
const debugCamera = new THREE.CameraHelper(spotLight.shadow.camera);
const pp = new THREE.SpotLightHelper(spotLight);
scene.add(pp);

// spotLight 표시를 위한 작은 sphere
const sphereLight = new THREE.SphereGeometry(0.2);
const sphereLightMaterial = new THREE.MeshBasicMaterial({color: 0xac6c25});
const sphereLightMesh = new THREE.Mesh(sphereLight, sphereLightMaterial);
sphereLightMesh.castShadow = true;
sphereLightMesh.position.set(3, 20, 3);
scene.add(sphereLightMesh);

// for controlling the rendering
let step = 0;
let invert = 1;
let phase = 0;

const controls = setupControls();
render();

function render() {
  stats.update();
  orbitControls.update();
  // rotate the cube around its axes
  cube.rotation.x += controls.rotationSpeed;
  cube.rotation.y += controls.rotationSpeed;
  cube.rotation.z += controls.rotationSpeed;

  // bounce the sphere up and down
  step += controls.bouncingSpeed;
  sphere.position.x = 20 + (10 * (Math.cos(step)));
  sphere.position.y = 2 + (10 * Math.abs(Math.sin(step)));

  // move the light simulation
  if (!controls.stopMovingLight) {
    if (phase > 2 * Math.PI) {
      invert = invert * -1;
      phase -= 2 * Math.PI;
    } else {
      phase += controls.rotationSpeed;
    }
    sphereLightMesh.position.z = +(7 * (Math.sin(phase)));
    sphereLightMesh.position.x = +(14 * (Math.cos(phase)));
    sphereLightMesh.position.y = 15;

    if (invert < 0) {
      const pivot = 14;
      sphereLightMesh.position.x = (invert * (sphereLightMesh.position.x - pivot)) + pivot;
    }
    // sphereLightMesh의 position을 spotLight의 position으로 설정
    spotLight.position.copy(sphereLightMesh.position);
  }

  pp.update();
  // render using requestAnimationFrame
  requestAnimationFrame(render);
  renderer.render(scene, camera);
}

function setupControls() {
  const controls = new function () {
    this.rotationSpeed = 0.03;
    this.bouncingSpeed = 0.03;
    this.ambientColor = ambiColor;
    this.pointColor = spotLight.color.getStyle();
    this.intensity = 100;
    this.distance = 0;
    this.angle = 0.1;
    this.shadowDebug = false;
    this.castShadow = true;
    this.target = "Plane";
    this.stopMovingLight = false;
    this.penumbra = 0.1;
  };

  const gui = new GUI();
  // color picker GUI
  gui.addColor(controls, 'ambientColor').onChange(function (e) {
    ambientLight.color = new THREE.Color(e);
  });

  gui.addColor(controls, 'pointColor').onChange(function (e) {
    spotLight.color = new THREE.Color(e);
  });

  gui.add(controls, 'angle', 0, Math.PI * 2).onChange(function (e) {
    spotLight.angle = e;
  });

  gui.add(controls, 'intensity', 0, 200).onChange(function (e) {
    spotLight.intensity = e;
  });

  gui.add(controls, 'penumbra', 0, 1).onChange(function (e) {
    spotLight.penumbra = e;
  });

  gui.add(controls, 'distance', 0, 200).onChange(function (e) {
    spotLight.distance = e;
  });

  gui.add(controls, 'shadowDebug').onChange(function (e) {
    if (e) {
      scene.add(debugCamera);
    } else {
      scene.remove(debugCamera);
    }
  });

  gui.add(controls, 'castShadow').onChange(function (e) {
    spotLight.castShadow = e;
  });

  gui.add(controls, 'target', ['Plane', 'Sphere', 'Cube']).onChange(function (e) {
    switch (e) {
      case "Plane":
        spotLight.target = plane;
        break;
      case "Sphere":
        spotLight.target = sphere;
        break;
      case "Cube":
        spotLight.target = cube;
        break;
    }

  });

  gui.add(controls, 'stopMovingLight').onChange(function (e) {
    stopMovingLight = e;
  });

  return controls;
}
