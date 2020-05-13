import { default as THREE, OrthographicCamera, Clock, Scene, WebGLRenderer, Texture, TextureLoader, WebGLRenderTarget, ShaderMaterial, Mesh, PlaneBufferGeometry, Color } from 'three';
import App from './App';

export { THREE };

const fragmentBackdrop = `
varying vec2 vUv;
//uniform float time;
void main() {
	gl_FragColor = vec4( 0.5, 0.5, 0.5, 1.0 );
}`

const fragmentPost = `
// Todo add effect
varying vec2 vUv;
uniform sampler2D tDiffuse;
void main() {
	gl_FragColor = texture2D( tDiffuse, vUv );
}`


const vertexScreen = `
varying vec2 vUv;
void main() {
	vUv = uv;
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`

// 2:1 renderer

export namespace ThreeQuarter {

	export var changes = true;
	export var dpi;
	export var delta = 0;

	export var clock: Clock
	export var scene: Scene
	export var scene2: Scene
	export var camera: OrthographicCamera
	export var target: WebGLRenderTarget
	export var renderer: WebGLRenderer

	export var materialBg: ShaderMaterial
	export var materialPost: ShaderMaterial

	export var quadPost: Mesh

	//export var ambientLight: AmbientLight
	//export var directionalLight: DirectionalLight

	export function update() {

		delta = clock.getDelta();

		//filmic.composer.render();
	}

	export function render() {

		//if (!changes)
		//return;

		renderer.setRenderTarget(target);
		renderer.clear();
		renderer.render(scene, camera);

		renderer.setRenderTarget(null); // Naar scherm
		renderer.clear();
		renderer.render(scene2, camera);

		//changes = false;
	}

	export var w;
	export var h;
	export var wh: zx;
	export var plane;

	export function init() {

		console.log('Two Init');

		clock = new Clock();

		scene = new Scene();
		scene.background = new Color('rgb(53, 74, 55)'); // #444
		scene2 = new Scene();

		dpi = window.devicePixelRatio;

		if (dpi == 2) {
			console.warn('DPI > 1. Egyt will scale by whole factors.');
		}

		target = new WebGLRenderTarget(
			window.innerWidth, window.innerHeight,
			{
				minFilter: THREE.LinearFilter,
				magFilter: THREE.NearestFilter,
				format: THREE.RGBFormat
			});

		renderer = new WebGLRenderer({ antialias: false });
		renderer.setPixelRatio(dpi);
		renderer.setSize(
			window.innerWidth, window.innerHeight);
		renderer.autoClear = true;
		renderer.setClearColor(0xffffff, 0);

		
		document.body.appendChild(renderer.domElement);
		
		window.addEventListener('resize', onWindowResize, false);
		
		someMore();
		onWindowResize();

		(window as any).Two_ = ThreeQuarter;
	}

	function someMore() {
		/*materialBg = new ShaderMaterial({
			uniforms: { time: { value: 0.0 } },
			vertexShader: vertexScreen,
			fragmentShader: fragmentBackdrop
		});*/

		materialPost = new ShaderMaterial({
			uniforms: { tDiffuse: { value: target.texture } },
			vertexShader: vertexScreen,
			fragmentShader: fragmentPost,
			depthWrite: false
		});

		plane = new PlaneBufferGeometry(
			window.innerWidth, window.innerHeight);

		/*let quad = new Mesh(plane, materialBg);
		quad.position.z = -100;
		scene.add(quad);*/

		quadPost = new Mesh(plane, materialPost);
		quadPost.position.z = -100;
		scene2.add(quadPost);
	}

	function onWindowResize() {

		w = window.innerWidth;
		h = window.innerHeight;

		if (w % 2 != 0) {
			w -= 1;
		}
		if (h % 2 != 0) {
			h -= 1;
		}

		let targetwidth = w;
		let targetheight = h;

		if (dpi == 2) {
			targetwidth *= dpi;
			targetheight *= dpi;
		}

		plane = new PlaneBufferGeometry(
			window.innerWidth, window.innerHeight);
		quadPost.geometry = plane;

		target.setSize(targetwidth, targetheight);

		camera = new OrthographicCamera(
			w / - 2,
			w / 2,
			h / 2,
			h / - 2,
			- 100, 100);
		camera.position.set(0, 0, -100);

		camera.updateProjectionMatrix();

		renderer.setSize(
			window.innerWidth, window.innerHeight);

	}

	let mem = [];

	export function loadTexture(file: string, salt?: string): Texture {
		if (mem[salt || file])
			return mem[salt || file];

		//console.log('LoadTexture ' + salt || file);

		let texture = new TextureLoader().load(file + `?v=${App.version}`);

		texture.magFilter = THREE.NearestFilter;
		texture.minFilter = THREE.NearestFilter;

		mem[salt || file] = texture;

		return texture;
	}
}