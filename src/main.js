import * as THREE from "three";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const defaultOptions = {
	text: "OpenGL",
	font: "helvetiker_regular",
};

class ScreenSaver3DText {
	constructor(userOptions) {
		this.lastTime = 0;
		this.direction = -1;

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

		this.frustum = new THREE.Frustum();
		this.frustum.setFromProjectionMatrix(
			new THREE.Matrix4().multiplyMatrices(
				this.camera.projectionMatrix,
				this.camera.matrixWorldInverse
			)
		);

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
			const textGeo = new TextGeometry(options.text, {
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
			this.scene.add(this.boxHelper);

			this.boundingBox = new THREE.Box3();
			this.boundingBox.setFromObject(this.textMesh);
		});

		this.renderer = new THREE.WebGLRenderer({ antialias: true });
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		container.appendChild(this.renderer.domElement);

		const controls = new OrbitControls(this.camera, this.renderer.domElement);
		controls.target.set(0, 0, 0);
		controls.update();

		window.addEventListener("resize", () => {
			this.camera.aspect = window.innerWidth / window.innerHeight;
			this.camera.updateProjectionMatrix();

			this.frustum.setFromProjectionMatrix(
				new THREE.Matrix4().multiplyMatrices(
					this.camera.projectionMatrix,
					this.camera.matrixWorldInverse
				)
			);

			this.renderer.setSize(window.innerWidth, window.innerHeight);
		});

		requestAnimationFrame(this.render.bind(this));
	}

	animate(delta) {
		if (!this.textMesh) {
			return;
		}

		this.textMesh.rotation.y += delta;
		this.textMesh.position.x += delta * 20 * this.direction;

		this.boxHelper.setFromObject(this.textMesh);
		this.boundingBox.setFromObject(this.textMesh);

		if (
			!this.frustum.containsPoint(this.boundingBox.min) ||
			!this.frustum.containsPoint(this.boundingBox.max)
		) {
			this.direction *= -1;
		}
	}

	render(time) {
		time *= 0.001;
		const delta = this.lastTime - time;
		this.lastTime = time;

		this.animate(delta);

		this.renderer.clear();
		this.renderer.render(this.scene, this.camera);

		requestAnimationFrame(this.render.bind(this));
	}
}

new ScreenSaver3DText({
	text: "Test",
});
