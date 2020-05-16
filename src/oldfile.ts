import { tq, THREE } from "./tq";

import App from "./badhelper";

import Rekt from "./Nieuw mapje/Rekt";
import Obj from "./Nieuw mapje/Obj";

import Selection from "./Nieuw mapje 5/Selection";
import { Object3D, Mesh, PlaneBufferGeometry, MeshBasicMaterial } from "three";
import { aabb3 } from "./aabb";
import points from "./points";
import { Win } from "./chains";

// todo, aweful
export namespace Areas {

	// deprecated, port these to Zxcvs please
	// use Zxcvs.area_every

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
	dpi: number

	focal: Zxc
	view: aabb3
	frustumRekt: Rekt

	static rig() {
		return new Game();
	}

	constructor() {
		console.log('Game');

		this.rekts = [];
		this.objs = [];

		this.pos = [0, 0, 0]; //[-1665, 3585, 0];
		this.dpi = window.devicePixelRatio;
		this.scale = 1 / this.dpi;

		this.view = new aabb3([0, 0, 0]);

		this.frustumRekt = new Rekt({
			name: 'Frustum',
			xy: [0, 0],
			wh: [1, 1],
			asset: 'egyt/128'
		});

		this.frustumRekt.noDimetricization = true; // dont 2:1

		this.frustumRekt.use();
		this.frustumRekt.mesh.renderOrder = 9999999;
		this.frustumRekt.material.wireframe = true;
	}

	update() {

		this.sels();

		let speed = 5;
		const factor = 1 / this.dpi;

		let p = [...this.pos] as Zxc;

		if (App.map['x']) speed *= 10;

		if (App.map['w'] || App.map['W']) p[1] -= speed;
		if (App.map['s'] || App.map['S']) p[1] += speed;
		if (App.map['a'] || App.map['A']) p[0] += speed;
		if (App.map['d'] || App.map['D']) p[0] -= speed;

		this.pos = [...p] as Zxc;

		if (App.wheel > 0) {
			if (this.scale < 1) {
				this.scale = 1;
			}
			else {
				this.scale += factor;
			}
			if (this.scale > 2 / this.dpi)
				this.scale = 2 / this.dpi;

			console.log('scale up', this.scale);
		}

		else if (App.wheel < 0) {
			this.scale -= factor;
			if (this.scale < .5 / this.dpi)
				this.scale = .5 / this.dpi;

			console.log('scale down', this.scale);
		}

		tq.scene.scale.set(this.scale, this.scale, 1);

		let p2 = points.multpClone(p, this.scale);

		tq.scene.position.set(p2[0], p2[1], 0);

		this.focal = [-p[0], -p[1], 0];

		let w = tq.target.width;
		let h = tq.target.height;

		let w2 = w / this.dpi / this.scale;
		let h2 = h / this.dpi / this.scale;

		this.view = new aabb3(
			[-p[0] - w2 / 2, -p[1] - h2 / 2, 0],
			[-p[0] + w2 / 2, -p[1] + h2 / 2, 0]
		);
		points.floor(this.view.min);
		points.floor(this.view.max);

		Win.win.find('#gameAabb').html(`Viewport: <span>${this.view.min[0]}, ${this.view.min[1]} x ${this.view.max[0]}, ${this.view.max[1]} `);

		return;
		
		this.frustumRekt.mesh.scale.set(w2, h2, 1);
		this.frustumRekt.struct.xy = <zx>[...this.focal];
		this.frustumRekt.now_update_pos();
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