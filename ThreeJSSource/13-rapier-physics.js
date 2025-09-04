// Simple example of using RAPIER physics engine with Three.js
// https://rapier.rs/
// Rapier physics engine: 이 예제 이외의 기능은 rpaier3d site를 볼 것 (https://rapier.rs/)
// Mesh에 해당하는 RigidBody와 Collider를 생성하여 물리 엔진과 연결

import * as THREE from 'three';  
import RAPIER from 'https://cdn.skypack.dev/@dimforge/rapier3d-compat';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

// Global variables
let scene, camera, renderer;
let physicsWorld;    // scene에 대응하는 Rapier의 physics world
const objects = [];  // spheres (또는 cubes) array

// GUI 컨트롤을 위한 파라미터
const params = {
    shape: 'sphere',   // 'sphere' 또는 'cube'
    count: 100,        // 1에서 500개 사이
    createObjects: function() { // button press function
        // 기존 object들 모두 제거
        objects.forEach(obj => {
            scene.remove(obj.mesh); // scene에서 mesh object 제거
            physicsWorld.removeRigidBody(obj.body); // physicsWorld에서 body 제거 
        });
        objects.length = 0;
        
        // 새로운 object들 생성
        scheduleObjects();
    }
};

// Initialization function 
async function init() {
    initThree();
    await initPhysics();  // RAPIER 초기화 완료를 기다린 후
    createGround();       // 기다린 후 여기로 진행 가능
    initGUI();            // GUI 초기화 추가
    scheduleObjects();    // 초기 객체 생성
    animate();
}

// ============================
// 1. Three.js Scene 설정
// ============================
function initThree() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xbfd1e5);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 20, 50);
    camera.lookAt(0, 0, 0);

    // renderer 설정
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;  // 그림자 활성화
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;  // 부드러운 그림자
    document.body.appendChild(renderer.domElement);

    // lights
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;  // 그림자 생성
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    scene.add(directionalLight);

    window.addEventListener("resize", onWindowResize, false);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// ============================
// 2. Rapier: 물리 월드 초기화
// ============================
async function initPhysics() { 
    await RAPIER.init(); 
    // await로 인해 RAPIER.init() 실행 끝난 후 다음으로 진행 
    // 즉, RAPIER.init()이 끝나지 않은 상태에서 아래 RAPIER.world 생성하는 것을
    // 방지하게 해 줌 
    // Gravity = (0, -9.81, 0) 인 physics world 생성
    physicsWorld = new RAPIER.World({ x: 0, y: -9.81, z: 0 });
}

// ============================
// 3. 바닥(ground) 생성
// ============================
function createGround() {
    // Ground Mesh 생성
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x777777 });
    const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.receiveShadow = true;  // 그림자 받기
    scene.add(groundMesh);

    // Ground Mesh에 대응하는 RAPIER Description + Body 생성
    // fixed(): ground는 움직이지 않음
    const groundBodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(0, 0, 0);
    const groundBody = physicsWorld.createRigidBody(groundBodyDesc);

    // Ground Mesh에 대응하는 RAPIER Collider Description 생성
    // Collider: 충돌 계산에 사용되는 simple한 형태의 geometry
    // cuboid(): box 형태의 collider
    // parameter: 위의 PlaneGeometry 크기의 half로 x, z 값 지정, y 값은 0.1로 지정
    // cuboid collider의 크기는 half length로 지정하므로 50으로 함
    // setFriction(2.0): 마찰 계수 설정, Ground 위의 물체의 미끌어짐 정도에 영향을 줌
    const groundColliderDesc = RAPIER.ColliderDesc.cuboid(50, 0.1, 50).setFriction(2.0);

    // Ground Mesh에 대응하는 RAPIER Collider 생성
    physicsWorld.createCollider(groundColliderDesc, groundBody);
}

// ============================
// 4. GUI 설정
// ============================
function initGUI() {
    const gui = new GUI();
    gui.add(params, 'shape', ['sphere', 'cube']).name('Shape');
    gui.add(params, 'count', 1, 500, 1).name('Count');
    gui.add(params, 'createObjects').name('Simulation Start');
}

// ============================
// 5. scheduleObjects
// ============================
function scheduleObjects() {
    for (let i = 0; i < params.count; i++) { // GUI의 object 갯수만큼 생성
        setTimeout(() => {
            createObject();
        }, i * 100); // 100ms 간격으로 object 하나씩 생성
    }
}

// createObject (sphere와 cube 모두 처리)
function createObject() {
    const size = 0.5 + Math.random();  // random size: 0.5 ~ 1.5
    let mesh, colliderDesc;

    // Three.js mesh 생성
    if (params.shape === 'sphere') {
        // SphereGeometry: radius, widthSegments, heightSegments
        const geometry = new THREE.SphereGeometry(size, 32, 32);
        const material = new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff });
        mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;  // 그림자 생성
    } else {
        const geometry = new THREE.BoxGeometry(size * 2, size * 2, size * 2);
        const material = new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff });
        mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;  // 그림자 생성
    }

    // 위치 설정 (x, z): -5 ~ 5, y: 10 ~ 20
    const posX = (Math.random() - 0.5) * 10;
    const posZ = (Math.random() - 0.5) * 10;
    const posY = 10 + Math.random() * 10;
    mesh.position.set(posX, posY, posZ);
    scene.add(mesh);

    // Rapier.js 물리 객체 생성
    // dynamic(): 고정된 물체가 아님
    // setTranslation(posX, posY, posZ): 위의 실제 geometry의 위치와 같게 설정
    const bodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(posX, posY, posZ);
    const body = physicsWorld.createRigidBody(bodyDesc);

    // Colliders: sphere는 ball collider, cube는 cuboid collider
    if (params.shape === 'sphere') {
        colliderDesc = RAPIER.ColliderDesc.ball(size);
    } else {
        colliderDesc = RAPIER.ColliderDesc.cuboid(size, size, size);
    }
    
    // Restitution: 반발계수, 물체가 충돌할 때 반발하는 정도, 크면 튕기는 정도가 강해짐
    // Friction: 마찰계수, 물체가 충돌할 때 마찰력이 작용하는 정도, 크면 미끌어지는 정도가 줄어듦
    colliderDesc.setRestitution(0.8).setFriction(1.0);
    physicsWorld.createCollider(colliderDesc, body);

    objects.push({ mesh, body }); // objects array에 이 pair를 추가 
}

// ============================
// 6. 애니메이션 루프 및 물리 업데이트
// ============================
function animate() {
    requestAnimationFrame(animate);

    // Rapier.js 물리 시뮬레이션을 한 스텝 진행
    physicsWorld.step();

    // 생성된 모든 sphere (또는 cube) 에 대해 물리 엔진에서 계산된 위치와 회전을 three.js Mesh에 반영
    objects.forEach((obj) => {
        const pos = obj.body.translation();
        const rot = obj.body.rotation();
        obj.mesh.position.set(pos.x, pos.y, pos.z);
        obj.mesh.quaternion.set(rot.x, rot.y, rot.z, rot.w);
    });

    renderer.render(scene, camera);
}

// --- 초기화 시작 ---
init().catch(error => {
    console.error("Failed to initialize:", error);
});

// Rigid body와 Collider 이외에 RAPIER에서 제공하는 기능
// 1. Joint: 물체를 연결하는 기능
// 2. Character Controller: 
//      예) "Stop at obstacles", "Slide down slopes", "Climb stairs", "Walk over small obstacles"
// 3. Scene Queries:Ray Casting, Intersection Test, 등 