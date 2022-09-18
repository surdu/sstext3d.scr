import * as THREE from "three";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

let scene;
let camera;
let cameraTarget;
let renderer;
let textMesh;

init();
animate();

function init() {
	const container = document.createElement("div");
	document.body.appendChild(container);

	camera = new THREE.PerspectiveCamera(
		30,
		window.innerWidth / window.innerHeight,
		1,
		1500
	);
	camera.position.set(0, 0, 70);
	cameraTarget = new THREE.Vector3(0, 0, 0);

	scene = new THREE.Scene();
	scene.background = new THREE.Color(0x000000);

	const dirLight = new THREE.DirectionalLight(0xffffff, 1);
	dirLight.position.set(0, 40, 70).normalize();
	scene.add(dirLight);

	const textureLoader = new THREE.CubeTextureLoader();
	textureLoader.setPath("textures/");
	const textureCube = textureLoader.load([
		"posx.png",
		"negx.png",
		"posy.png",
		"negy.png",
		"posz.png",
		"negz.png",
	]);
	textureCube.encoding = THREE.sRGBEncoding;

	// scene.background = textureCube;

	const loader = new FontLoader();
	loader.load("fonts/helvetiker_regular.typeface.json", function (font) {
		const textGeo = new TextGeometry("This is a test", {
			font: font,
			size: 10,
			height: 10,
		});

		// center the rotation point in the center of the geometry
		textGeo.computeBoundingBox();
		const textWidth = textGeo.boundingBox.max.x - textGeo.boundingBox.min.x;
		const textHeight = textGeo.boundingBox.max.y - textGeo.boundingBox.min.y;
		const textDepth = textGeo.boundingBox.max.z - textGeo.boundingBox.min.z;
		textGeo.translate(textWidth / -2, textHeight / -2, textDepth / -2);

		textMesh = new THREE.Mesh(
			textGeo,
			new THREE.MeshPhysicalMaterial({
				envMap: textureCube,
				metalness: 0.7,
				roughness: 0,
				color: new THREE.Color(0xffffff),
			})
		);

		textMesh.position.set(0, 0, 0);
		scene.add(textMesh);
	});

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	container.appendChild(renderer.domElement);

	const controls = new OrbitControls(camera, renderer.domElement);
	controls.target.set(0, 0, 0);
	controls.update();

	window.addEventListener("resize", () => {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize(window.innerWidth, window.innerHeight);
	});
}

function animate() {
	requestAnimationFrame(animate);
	render();
}

function render() {
	if (textMesh) {
		// textMesh.rotation.y += 0.02;
	}

	camera.lookAt(cameraTarget);

	renderer.clear();
	renderer.render(scene, camera);
}
