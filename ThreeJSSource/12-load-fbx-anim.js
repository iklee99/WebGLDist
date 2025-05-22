// 12-load-fbx-anim.js
// Load FBX model and animation using three.js
// https://threejs.org/docs/#examples/en/loaders/FBXLoader
// Character와 animation은 "Mixamo"에서 다운로드 된 것임
// https://www.mixamo.com/#/
// Keyboard UI:
//   1: Idle
//   2: JoyfulJump
//   3: RumbaDancing

import * as THREE from 'three';  
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { initStats, initCamera, initRenderer, initOrbitControls, 
    initDefaultDirectionalLighting } from './util.js';

// global variables
let mixer; 
// number keys' keycodes
// Reference: JavaScript KeyboardEvent.keyCode
// https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode
const KEY_1 = 49, KEY_2 = 50, KEY_3 = 51, KEY_4 = 52;  

// scene, renderer,camera, orbit controls, stats
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xaaaaaa);

const renderer = initRenderer();1

const camera = initCamera(); 
camera.position.set(-1, 50, 250);
scene.add(camera);

const clock = new THREE.Clock();

const orbitControls = initOrbitControls(camera, renderer);
orbitControls.target.set(1, 70, 0); 
orbitControls.enableKeys = false;   // disable orbit control's keyboard control 
orbitControls.update();

const stats = initStats();

// lighting 
initDefaultDirectionalLighting(scene);
const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
dirLight.position.set(-10, 20, 20);
dirLight.castShadow = true;
scene.add(dirLight);

// ambient light
const ambientLight = new THREE.AmbientLight(0x444444, 1.0);
ambientLight.position.set(0, 0, 0);
scene.add(ambientLight);

// point light
const dirLight2 = new THREE.DirectionalLight(0xffffff, 1);
dirLight2.position.set(0, -10, -10);
scene.add(dirLight2);

// ground
const ground = new THREE.Mesh( new THREE.PlaneGeometry( 400, 400 ), 
               new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: false } ) );
ground.rotation.x = - Math.PI / 2;
ground.receiveShadow = true;
scene.add( ground );

// grid helper
const gridHelper = new THREE.GridHelper( 400, 40, 0x000000, 0x000000 );
gridHelper.material.opacity = 0.2;
gridHelper.material.transparent = true;
scene.add( gridHelper );

const actions = [];

const loader = new FBXLoader();
const assetPath = './assets/models/Jakie/';
loader.setPath(assetPath); // FBX file이 위치한 folder

let actionIndex = 0;

// FBX 파일을 로드하는 Promise를 return하는 함수
// 시간이 걸리는 비동기 (asynchronous) 작업을 처리하기 위해 Promise를 사용
// FBXLoader는 비동기적으로 파일을 로드하므로, Promise를 사용하여 로드 완료 후 작업을 수행
// Promise는 성공(resolve), 또는 실패(reject) 중 하나의 상태를 가짐
function loadFBX(filename) {
    return new Promise((resolve, reject) => {
        loader.load(filename, 
            (object) => resolve(object),  // 성공 시
            undefined,                    // 진행 상황
            (error) => reject(error)      // 실패 시
        );
    });
}

// Idle, JoyfulJump, RumbaDancing 애니메이션을 포함한 FBX 파일을 load
// Mixamo에서 download할 때, "With Skin" 옵션을 선택하면 Mesh + Animation을 포함
// "Without Skin" 옵션을 선택하면 Animation만 포함하는 FBX를 다운로드
async function loadAnimations() {
    try {
        // 첫 번째 파일 로드 (Model + Animation)
        const firstObject = await loadFBX('Idle+Skin.fbx');
        mixer = new THREE.AnimationMixer(firstObject);
        // 한 개의 animation만 포함된 경우, animations[0]에 들어 있음
        const firstAction = mixer.clipAction(firstObject.animations[0]);
        firstAction.play();
        actions.push(firstAction);
        actionIndex = 0;

        // 모델 설정
        firstObject.traverse(child => {
            if (child.isMesh) {
                child.material.transparent = false;  // 모든 mesh의 material을 불투명하게 
                child.castShadow = true; // 모든 mesh part가 그림자를 만들도록 설정
            }
        });
        scene.add(firstObject);

        // 두 번째 파일 로드 (애니메이션)
        const secondObject = await loadFBX('JoyfulJump.fbx');
        const secondAction = mixer.clipAction(secondObject.animations[0]);
        actions.push(secondAction);

        // 세 번째 파일 로드 (애니메이션)
        const thirdObject = await loadFBX('RumbaDancing.fbx');
        const thirdAction = mixer.clipAction(thirdObject.animations[0]);
        actions.push(thirdAction);

        // 모든 로드가 완료된 후 애니메이션 시작
        animate();

    } catch (error) {
        console.error('Error loading animations:', error);
    }
}

// 애니메이션 로드 시작
loadAnimations();

window.addEventListener( 'resize', onWindowResize, false );
document.addEventListener('keydown', keyCodeOn, false);

animate();

function keyCodeOn(event) {
    if (KEY_1 <= event.keyCode && event.keyCode <= KEY_3) {
        const action = actions[event.keyCode - KEY_1]; 
        actions[actionIndex].stop(); 
        action.fadeIn(0.2);  // 새 action이 crossfade 되는 시간을 0.2초로 설정
        action.play();
        actionIndex = event.keyCode - KEY_1; // 새로운 action의 index를 저장
    }	
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
    requestAnimationFrame( animate );
    renderer.render( scene, camera );
    const dt = clock.getDelta();
    if (mixer) mixer.update(dt); 
    stats.update();
    orbitControls.update();
}