import * as THREE from "three";
import * as TWEEN from "@tweenjs/tween.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { FontLoader, Font } from "three/examples/jsm/loaders/FontLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { degreesToRadians, random } from "./utils";
import addStyles from "./styles";

export enum Animation {
	SPIN = "spin",
	SEESAW = "seesaw",
	WOBBLE = "wobble",
	TUMBLE = "tumble",
}

interface Options {
	text: string | (() => string);
	font: string;
	animation: Animation;
	debug?: boolean;
}

const defaultOptions: Options = {
	text: "OpenGL",
	font: "helvetiker_regular",
	animation: Animation.SPIN,
};

export default class ScreenSaver3DText {
	text: string;
	speed = 1;
	direction: THREE.Vector3;
	changingDirection = false;
	camera: THREE.PerspectiveCamera;
	scene: THREE.Scene;
	textMesh?: THREE.Mesh;
	textGroup: THREE.Group;
	boundingBox?: THREE.Box3;
	renderer: THREE.WebGLRenderer;
	options: Options;
	envMap: THREE.CubeTexture;
	font?: Font;
	textMaterial: THREE.MeshPhysicalMaterial;
	running = false;

	boxHelper?: THREE.BoxHelper;

	constructor(userOptions?: Partial<Options>) {
		this.options = {
			...defaultOptions,
			...userOptions,
		};

		this.text = this.getText();

		this.direction = new THREE.Vector3();

		this.camera = new THREE.PerspectiveCamera(
			50,
			window.innerWidth / window.innerHeight,
			1,
			1500
		);

		this.camera.position.set(0, 0, 200);
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
		this.envMap = textureLoader.load([
			"posx.png",
			"negx.png",
			"posy.png",
			"negy.png",
			"posz.png",
			"negz.png",
		]);
		this.envMap.encoding = THREE.sRGBEncoding;

		this.textMaterial = new THREE.MeshPhysicalMaterial({
			envMap: this.envMap,
			metalness: 0.7,
			roughness: 0,
			color: new THREE.Color(0xffffff),
		});

		// this.scene.background = textureCube;

		this.textGroup = new THREE.Group();
		this.textGroup.position.set(0, 0, 0);
		this.scene.add(this.textGroup);

		const loader = new FontLoader();
		loader.load(`fonts/${this.options.font}.typeface.json`, (font) => {
			this.font = font;
			this.createTextMesh();

			this.boxHelper = new THREE.BoxHelper(this.textGroup, 0xffffff);
			if (this.options.debug) {
				this.scene.add(this.boxHelper);
			}
		});

		this.renderer = new THREE.WebGLRenderer({ antialias: true });
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(window.innerWidth, window.innerHeight);

		if (this.options.debug) {
			const controls = new OrbitControls(this.camera, this.renderer.domElement);
			controls.target.set(0, 0, 0);
			controls.update();
		}

		window.addEventListener("resize", () => {
			this.camera.aspect = window.innerWidth / window.innerHeight;
			this.camera.updateProjectionMatrix();

			this.renderer.setSize(window.innerWidth, window.innerHeight);
		});

		addStyles();
	}

	start() {
		const container = document.createElement("div");
		container.setAttribute("id", "ss3dtext-wrapper");
		container.appendChild(this.renderer.domElement);
		container.addEventListener("mousemove", this.stop.bind(this));
		document.body.appendChild(container);
		document.body.classList.add("SS3dTextActive");

		this.running = true;

		this.textGroup.position.set(0, 0, 0);
		this.textGroup.rotation.set(0, 0, 0);
		this.direction = this.generateRandomDirection();

		switch (this.options.animation) {
			case Animation.SPIN:
				this.spinAnimation();
				break;
			case Animation.SEESAW:
				this.seesawAnimation();
				break;
			case Animation.WOBBLE:
				this.wobbleAnimation();
				break;
			case Animation.TUMBLE:
				this.tumbleAnimation();
				break;
		}

		requestAnimationFrame(this.render.bind(this));
	}

	stop() {
		this.running = false;
		document.body.classList.remove("SS3dTextActive");

		TWEEN.removeAll();

		const container = document.getElementById("ss3dtext-wrapper");
		if (container) {
			document.body.removeChild(container);
		}
	}

	generateRandomDirection() {
		return new THREE.Vector3(random(-1, 1), random(-1, 1), 0)
			.normalize()
			.multiplyScalar(this.speed);
	}

	createTextMesh() {
		const sizeFactor = this.text.length / 20;
		const textGeo = new TextGeometry(this.text, {
			font: this.font!,
			size: 20 - 10 * sizeFactor,
			height: 20 - 10 * sizeFactor,
		});

		// center the rotation point in the center of the geometry
		textGeo.computeBoundingBox();
		const textWidth = textGeo.boundingBox!.max.x - textGeo.boundingBox!.min.x;
		const textHeight = textGeo.boundingBox!.max.y - textGeo.boundingBox!.min.y;
		const textDepth = textGeo.boundingBox!.max.z - textGeo.boundingBox!.min.z;
		textGeo.translate(textWidth / -2, textHeight / -2, textDepth / -2);

		this.textMesh = new THREE.Mesh(textGeo, this.textMaterial);

		this.textGroup.add(this.textMesh);

		this.boundingBox = new THREE.Box3();
		this.boundingBox.setFromObject(this.textGroup);
	}

	getText() {
		let text: string | undefined;

		if (typeof this.options.text === "string") {
			text = this.options.text;
		} else if (typeof this.options.text === "function") {
			text = this.options.text();
		}

		if (!text) {
			throw new Error("Text can;t be empty");
		}

		if (text.length > 20) {
			throw new Error("Text must be under 20 characters");
		}

		return text;
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

	moveAnimation() {
		if (!this.boxHelper || !this.boundingBox) {
			return;
		}

		this.boxHelper?.setFromObject(this.textGroup);
		this.boundingBox?.setFromObject(this.textGroup);

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

		this.textGroup.position.add(this.direction);
	}

	spinAnimation() {
		new TWEEN.Tween({ y: 0 })
			.to({ y: degreesToRadians(360) }, 7500)
			.onUpdate((rotation) => {
				this.textGroup.rotation.y = rotation.y;
			})
			.repeat(Infinity)
			.start();
	}

	seesawAnimation() {
		new TWEEN.Tween({ y: degreesToRadians(45) })
			.to({ y: degreesToRadians(-45) }, 3000)
			.easing(TWEEN.Easing.Sinusoidal.InOut)
			.onUpdate((rotation) => {
				this.textGroup.rotation.y = rotation.y;
			})
			.repeat(Infinity)
			.yoyo(true)
			.start();
	}

	wobbleAnimation() {
		const animationDuration = 2000;

		new TWEEN.Tween({
			y: degreesToRadians(45),
		})
			.to({ y: degreesToRadians(-45) }, animationDuration)
			.easing((amount) => {
				return amount * (2 - amount);
			})
			.chain(
				new TWEEN.Tween({ z: degreesToRadians(30) })
					.to({ z: degreesToRadians(-30) }, animationDuration)
					.easing((amount) => {
						return amount * amount;
					})
					.onUpdate((rotation) => {
						this.textGroup.rotation.z = rotation.z;
					})
					.repeat(Infinity)
					.yoyo(true)
					.start()
			)
			.onUpdate((rotation) => {
				this.textGroup.rotation.y = rotation.y;
			})
			.repeat(Infinity)
			.yoyo(true)
			.start();
	}

	tumbleAnimation() {
		const animationDuration = 5000;

		new TWEEN.Tween({
			y: 0,
		})
			.to({ y: degreesToRadians(360) }, animationDuration)
			.onStart(() => {
				new TWEEN.Tween({ x: 0 })
					.to({ x: degreesToRadians(360) }, animationDuration * 1.2)
					.onUpdate((rotation) => {
						this.textGroup.rotation.x = rotation.x;
					})
					.repeat(Infinity)
					.start();

				new TWEEN.Tween({ z: 0 })
					.to({ z: degreesToRadians(360) }, animationDuration * 1.5)
					.onUpdate((rotation) => {
						this.textGroup.rotation.z = rotation.z;
					})
					.repeat(Infinity)
					.start();
			})
			.onUpdate((rotation) => {
				this.textGroup.rotation.y = rotation.y;
			})
			.repeat(Infinity)
			.yoyo(true)
			.start();
	}

	animate() {
		this.moveAnimation();
		TWEEN.update();

		const newText = this.getText();
		if (newText !== this.text) {
			this.text = newText;
			this.textGroup.remove(this.textMesh!);
			this.createTextMesh();
		}
	}

	render() {
		this.animate();

		this.renderer.clear();
		this.renderer.render(this.scene, this.camera);

		if (this.running) {
			requestAnimationFrame(this.render.bind(this));
		}
	}
}

export { timeText } from "./utils";
