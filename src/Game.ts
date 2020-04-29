import { ThreeQuarter, THREE } from "./ThreeQuarter";

import App from "./App";

import Rekt from "./Nieuw mapje/Rekt";
import Obj from "./Nieuw mapje/Obj";

import Selection from "./Nieuw mapje 5/Selection";
import { Object3D, Mesh, PlaneBufferGeometry, MeshBasicMaterial } from "three";
import { aabb3 } from "./Bound";
import Zxcvs from "./Zxcvs";

export var game;

export namespace Areas {

	export function Loop(area: Zxcv, callback: (p: Zx) => any) {
		for (let x = area[0]; x < area[2] + area[0]; x++)
			for (let y = area[1]; y < area[3] + area[1]; y++)
				callback([x, y]);
	}

	export function Corner(a: Zxcv, p: Zx | Zxc): boolean {
		return (
			p[0] == a[0] && p[1] == a[1] ||
			p[0] == a[0] && p[1] == a[3] + a[1] - 1 ||
			p[0] == a[2] + a[0] - 1 && p[1] == a[3] + a[1] - 1 ||
			p[0] == a[2] + a[0] - 1 && p[1] == a[1]);
	}

	export function Border(a: Zxcv, p: Zx) {
		return (
			p[0] == a[0] ||
			p[1] == a[1] ||
			p[0] == a[2] + a[0] - 1 ||
			p[1] == a[3] + a[1] - 1);
	}

	export function NotBorder(a: Zxcv, p: Zx) {
		return !Border(a, p);
	}
}

class Game {
	rekts: Rekt[]
	objs: Obj[]

	selection: Selection | null

	pos: Zxc
	scale: number

	focal: Zxc
	aabb: aabb3
	rekt: Rekt

	static init() {
		game = new Game();

		(window as any).game_ = game;
	}

	static update2() {
		game.update();
	}

	constructor() {
		console.log('Game');

		this.rekts = [];
		this.objs = [];

		this.pos = [-1665, 3585, 0];
		this.scale = 1 / window.devicePixelRatio;

		this.aabb = new aabb3([0, 0, 0]);

		this.rekt = new Rekt({
			name: 'A Turf',
			pos: [0, 0, 0],
			dim: [256, 256],
			asset: 'egyt/128'
		});

		this.rekt.dontFang = true; // dont 2:1

		this.rekt.make();
		this.rekt.mesh.renderOrder = 9999999;
		this.rekt.material.wireframe = true;
	}

	update() {

		this.sels();

		let speed = 5;
		const factor = 1 / window.devicePixelRatio;

		let p = [...this.pos] as Zxc;

		if (App.map['x']) speed *= 10;

		if (App.map['w'] || App.map['W']) p[1] -= speed;
		if (App.map['s'] || App.map['S']) p[1] += speed;
		if (App.map['a'] || App.map['A']) p[0] += speed;
		if (App.map['d'] || App.map['D']) p[0] -= speed;

		this.pos = [...p] as Zxc;

		if (App.wheel > 0) {
			this.scale += factor;
			if (this.scale > 5 / window.devicePixelRatio)
				this.scale = 5 / window.devicePixelRatio;

			console.log('scale up', this.scale);
		}

		else if (App.wheel < 0) {
			this.scale -= factor;
			if (this.scale < .5)
				this.scale = .5;

			console.log('scale down', this.scale);
		}

		ThreeQuarter.scene.scale.set(this.scale, this.scale, 1);

		let p2 = Zxcvs.MultpClone(p, this.scale);

		ThreeQuarter.scene.position.set(p2[0], p2[1], 0);

		this.focal = [-p[0], -p[1], 0];

		let w = window.innerWidth;
		let h = window.innerHeight;

		this.aabb = new aabb3(
			[-p[0] - w / 2, -p[1] - h / 2, 0] as Zxc,
			[-p[0] + w / 2, -p[1] + h / 2, 0] as Zxc
		);

		this.rekt.stats.pos = this.focal;
		this.rekt.set_pos();
	}

	sels() {
		/*if (App.left) {
			if (!this.selection)
				this.selection = new Selection();

			let pos = [...App.move];

			pos[1] = window.innerHeight - pos[1];

			this.selection.Update(
				pos as Zx);
		}
		else if (this.selection) {
			this.selection.End();
			this.selection = null;
		}*/
	}
}

//function Std(ops: RektStat) {
//if (!ops.img) ops.img = '';
//}

export default Game;