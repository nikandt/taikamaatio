// This file is intentionally blank
// Use this file to add JavaScript to your project

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

let camera, renderer, mixer, clock, composer;

const params = {
	threshold: 0,
	strength: 1,
	radius: 0,
	exposure: 1
};

init();

async function init() {
	const container = document.getElementById('container');

	clock = new THREE.Clock();

	const scene = new THREE.Scene();
	scene.background = new THREE.Color(0x000000);

	camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 100);
	camera.position.set(-5, 2.5, -3.5);
	scene.add(camera);

	scene.add(new THREE.AmbientLight(0xcccccc));

	const pointLight = new THREE.PointLight(0xffffff, 100);
	camera.add(pointLight);

	const loader = new GLTFLoader();
	const gltf = await loader.loadAsync('PrimaryIonDrive.glb');

	const model = gltf.scene;
	scene.add(model);

	// Replace all mesh materials with red MeshStandardMaterial
	//model.traverse((node) => {
	//    if (node.isMesh) {
	//      node.material = new THREE.MeshStandardMaterial({ color: 0x0000ff });
	//    }
	//});

	mixer = new THREE.AnimationMixer(model);
	const clip = gltf.animations[0];
	mixer.clipAction(clip.optimize()).play();

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setAnimationLoop(animate);
	renderer.toneMapping = THREE.ReinhardToneMapping;
	container.appendChild(renderer.domElement);

	const renderScene = new RenderPass(scene, camera);

	const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
	bloomPass.threshold = params.threshold;
	bloomPass.strength = params.strength;
	bloomPass.radius = params.radius;

	const outputPass = new OutputPass();

	composer = new EffectComposer(renderer);
	composer.addPass(renderScene);
	composer.addPass(bloomPass);
	composer.addPass(outputPass);

	const controls = new OrbitControls(camera, renderer.domElement);
	controls.maxPolarAngle = Math.PI * 0.5;
	controls.minDistance = 3;
	controls.maxDistance = 8;

	window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
	const width = window.innerWidth;
	const height = window.innerHeight;

	camera.aspect = width / height;
	camera.updateProjectionMatrix();

	renderer.setSize(width, height);
	composer.setSize(width, height);
}

function animate() {
	const delta = clock.getDelta();

	mixer.update(delta);

	composer.render();
}
