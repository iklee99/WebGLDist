import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';
import { initStats, initRenderer, initCamera, initDefaultLighting, initDefaultDirectionalLighting } from './util.js';

const scene = new THREE.Scene();
const stats = initStats();
const renderer = initRenderer();
const camera = initCamera();
const clock = new THREE.Clock();

initDefaultLighting(scene);  
initDefaultDirectionalLighting(scene);

// First Person Controls
// W/A/S/D key로 앞/뒤/좌/우 이동 (move around)
// 마우스 움직임으로 camera 시야 회전 (look around), horizontal/vertical
const fpControls = new FirstPersonControls(camera, renderer.domElement);
fpControls.lookSpeed = 0.05;           // look around speed, default = 0.005
fpControls.lookVertical = true;        // vertical mouse look 활성화, default = true
fpControls.movementSpeed = 20;         // move around speed, default = 1
fpControls.constrainVertical = true;   // vertical mouse look을 
                                       //[.verticalMin, .verticalMax] 범위로 제한, default = false
fpControls.verticalMin = 0;   // vertical mouse look을 제한할 최소 각도, default = 0
fpControls.verticalMax = 2.0; // vertical mouse look을 제한할 최대 각도, default = Math.PI

// .obj 파일 loader
const loader = new OBJLoader();
loader.load("./assets/models/city/city.obj", function (object) { // load된 object에 대해 아래를 실행

    // 랜덤 색상 설정 function: loader 내에 local function으로 정의 
    function setRandomColors(object) {
        object.traverse(function(child) { // object의 모든 children에 대해 아래를 실행
            if (child instanceof THREE.Mesh) { // child가 Mesh인 경우에만 실행
                // HSL color space (hue (색상), saturation (채도), lightness (명도))를 사용
                // color control을 더 용이하게 함
                // ex) 같은 color로 lightness만 다르게 설정하기 쉬움
                const hue = Math.random();  // 색상 (0 ~ 1)
                const saturation = 0.7 + Math.random() * 0.3;  // 채도 (0.7 ~ 1)
                const lightness = 0.5 + Math.random() * 0.3;   // 명도 (0.5 ~ 0.8)

                const color = new THREE.Color().setHSL(hue, saturation, lightness);
                
                child.material = new THREE.MeshPhongMaterial({
                    color: color
                });
            }
        });
    }

    setRandomColors(object);
    const mesh = object;
    scene.add(mesh);
});

render();

function render() {
  stats.update();
  fpControls.update(clock.getDelta());  // FPS controls 는 매 frame update 필요
  requestAnimationFrame(render);
  renderer.render(scene, camera)
}
