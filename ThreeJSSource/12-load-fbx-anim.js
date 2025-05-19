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
const KEY_1 = 49, KEY_2 = 50, KEY_3 = 51, KEY_4 = 52;  // number keys' keycodes

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
dirLight.position.set(-10, 50, 20);
dirLight.castShadow = true;
scene.add(dirLight);

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
loader.setPath(assetPath);

let actionIndex = 0;

// FBX 파일을 로드하는 Promise를 반환하는 함수
function loadFBX(filename) {
    return new Promise((resolve, reject) => {
        loader.load(filename, 
            (object) => resolve(object),  // 성공 시
            undefined,                    // 진행 상황
            (error) => reject(error)      // 실패 시
        );
    });
}

// 순차적으로 파일들을 로드
async function loadAnimations() {
    try {
        // 첫 번째 파일 로드 (모델 + 애니메이션)
        const firstObject = await loadFBX('Idle+Skin.fbx');
        mixer = new THREE.AnimationMixer(firstObject);
        const firstAction = mixer.clipAction(firstObject.animations[0]);
        firstAction.play();
        actions.push(firstAction);
        actionIndex = 0;

        // 모델 설정
        firstObject.traverse(child => {
            if (child.isMesh) {
                child.material.transparent = false;
                child.castShadow = true;
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
        actionIndex = event.keyCode - KEY_1; 
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