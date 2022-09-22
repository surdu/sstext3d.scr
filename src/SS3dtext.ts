import * as THREE from "three";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { random } from "./utils";

interface Options {
	text?: string;
	font?: string;
	debug?: boolean;
}

const defaultOptions: Options = {
	text: "OpenGL",
	font: "helvetiker_regular",
};

export default class ScreenSaver3DText {
	lastTime = 0;
	direction: THREE.Vector3;
	changingDirection = false;
	camera: THREE.PerspectiveCamera;
	scene: THREE.Scene;
	textMesh?: THREE.Mesh;
	boundingBox?: THREE.Box3;
	renderer: THREE.WebGLRenderer;

	boxHelper?: THREE.BoxHelper;

	constructor(userOptions: Options) {
		this.direction = new THREE.Vector3(
			random(-1, 1),
			random(-1, 1),
			0
		).normalize();

		const options = {
			...defaultOptions,
			...userOptions,
		};

		const container = document.createElement("div");
		document.body.appendChild(container);

		this.camera = new THREE.PerspectiveCamera(
			50,
			window.innerWidth / window.innerHeight,
			1,
			1500
		);

		this.camera.position.set(0, 0, 100);
		const cameraTarget = new THREE.Vector3(0, 0, 0);
		this.camera.lookAt(cameraTarget);
		this.camera.updateMatrix();
		this.camera.updateMatrixWorld();

		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color(0x000000);

		const dirLight = new THREE.DirectionalLight(0xffffff, 1);
		dirLight.position.set(0, 40, 70).normalize();
		this.scene.add(dirLight);

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

		// this.scene.background = textureCube;

		const loader = new FontLoader();
		loader.load(`fonts/${options.font}.typeface.json`, (font) => {
			const textGeo = new TextGeometry(options.text!, {
				font: font,
				size: 10,
				height: 10,
			});

			// center the rotation point in the center of the geometry
			textGeo.computeBoundingBox();
			const textWidth = textGeo.boundingBox!.max.x - textGeo.boundingBox!.min.x;
			const textHeight =
				textGeo.boundingBox!.max.y - textGeo.boundingBox!.min.y;
			const textDepth = textGeo.boundingBox!.max.z - textGeo.boundingBox!.min.z;
			textGeo.translate(textWidth / -2, textHeight / -2, textDepth / -2);

			this.textMesh = new THREE.Mesh(
				textGeo,
				new THREE.MeshPhysicalMaterial({
					envMap: textureCube,
					metalness: 0.7,
					roughness: 0,
					color: new THREE.Color(0xffffff),
				})
			);

			this.textMesh.position.set(0, 0, 0);
			this.scene.add(this.textMesh);

			this.boxHelper = new THREE.BoxHelper(this.textMesh, 0xffffff);
			if (options.debug) {
				this.scene.add(this.boxHelper);
			}

			this.boundingBox = new THREE.Box3();
			this.boundingBox.setFromObject(this.textMesh);
		});

		this.renderer = new THREE.WebGLRenderer({ antialias: true });
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		container.appendChild(this.renderer.domElement);

		if (options.debug) {
			const controls = new OrbitControls(this.camera, this.renderer.domElement);
			controls.target.set(0, 0, 0);
			controls.update();
		}

		window.addEventListener("resize", () => {
			this.camera.aspect = window.innerWidth / window.innerHeight;
			this.camera.updateProjectionMatrix();

			this.renderer.setSize(window.innerWidth, window.innerHeight);
		});

		requestAnimationFrame(this.render.bind(this));
	}

	getScreenCoordinates(worldCoords: THREE.Vector3) {
		const widthHalf = window.innerWidth / 2;
		const heightHalf = window.innerHeight / 2;

		const result = worldCoords.clone();
		result.project(this.camera);
		result.x = result.x * widthHalf + widthHalf;
		result.y = -(result.y * heightHalf) + heightHalf;

		return result;
	}

	animate(delta: number) {
		if (!this.textMesh || !this.boxHelper || !this.boundingBox) {
			return;
		}

		this.boxHelper?.setFromObject(this.textMesh);
		this.boundingBox?.setFromObject(this.textMesh);

		const frontPoint = new THREE.Vector3().copy(this.boundingBox.min);
		frontPoint.z = this.boundingBox.max.z;

		const leftTopCornerPos = this.getScreenCoordinates(frontPoint);
		const rightBottomCornerPos = this.getScreenCoordinates(
			this.boundingBox.max
		);
		const centerPos = this.getScreenCoordinates(
			this.boundingBox.getCenter(new THREE.Vector3())
		);

		const widthExceeded =
			leftTopCornerPos.x <= 0 || rightBottomCornerPos.x >= window.innerWidth;
		const heightExceeded =
			rightBottomCornerPos.y <= 0 || leftTopCornerPos.y >= window.innerHeight;

		const centerExceededWidth =
			centerPos.x <= 0 || centerPos.x >= window.innerWidth;
		const centerExceededHeight =
			centerPos.y <= 0 || centerPos.y >= window.innerHeight;

		if (widthExceeded || heightExceeded) {
			if (!this.changingDirection) {
				const edgeNormal = widthExceeded
					? new THREE.Vector3(1, 0, 0)
					: new THREE.Vector3(0, 1, 0);
				this.direction.copy(this.direction.reflect(edgeNormal));
				this.changingDirection = true;
			}
		} else {
			this.changingDirection = false;
		}

		// in case we hit a corner and the above condition let the text go outside bounds,
		// we take care of the direction
		if (centerExceededWidth || centerExceededHeight) {
			const edgeNormal = centerExceededWidth
				? new THREE.Vector3(1, 0, 0)
				: new THREE.Vector3(0, 1, 0);
			this.direction.copy(this.direction.reflect(edgeNormal));
		}

		this.textMesh.rotation.y += delta;
		this.textMesh.position.add(this.direction);
	}

	render(time: number) {
		time *= 0.001;
		const delta = this.lastTime - time;
		this.lastTime = time;

		this.animate(delta);

		this.renderer.clear();
		this.renderer.render(this.scene, this.camera);

		requestAnimationFrame(this.render.bind(this));
	}
}
