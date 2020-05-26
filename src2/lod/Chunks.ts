import Rekt from "../objrekt/Rekt";
import { Win } from "../lib/Board";
import Egyt from "../Egyt";
import App from "../lib/App";
import points from "../lib/Points";
import Forestation from "./gen/Forestation";
import Agriculture from "./gen/Agriculture";
import { aabb2 } from "../lib/AABB";
import Obj from "../objrekt/Obj";
import { Color, Group, WebGLRenderTarget, Int8Attribute, RGBFormat, NearestFilter, LinearFilter, RGBAFormat, PlaneBufferGeometry, MeshBasicMaterial, Mesh, OrthographicCamera } from "three";
import { tq } from "../lib/tq";
import Tilization from "./gen/Tilization";
import { tqlib } from "../lib/tqlib";


declare class sobj {

}

class Chunk {
	on = false
	changed = true
	childobjscolor

	readonly objs: Chunk_Objs2
	rt: Chunk_Rt | null
	p: zx

	tile_n: zx
	tile_s: zx
	mult: zx

	bound: aabb2
	screen: aabb2
	rekt_offset: zx

	group: Group
	grouprt: Group

	rektcolor = 'white'

	outline: Rekt

	constructor(x, y, public master: Chunk_Master<Chunk>) {
		this.master.total++;

		const colors = ['lightsalmon', 'khaki', 'lightgreen', 'paleturquoise', 'plum', 'pink'];

		this.objs = new Chunk_Objs2(this);
		//this.color = Egyt.sample(colors);

		this.p = [x, y];
		this.group = new Group;
		this.grouprt = new Group;

		this.set_bounds();
	}

	set_bounds() {
		let x = this.p[0];
		let y = this.p[1];

		let basest_tile = points.multp([x + 1, y], this.master.span * 24);

		this.tile_n = [x - 3, y + 3];
		points.multp(this.tile_n, this.master.span * 24);

		this.rekt_offset = <zx>points.clone(basest_tile);

		if (Egyt.OFFSET_CHUNK_OBJ_REKT) {
			let frightening = <zxc>[...basest_tile, 0];
			frightening = <zxc><unknown>points.two_one(frightening);
			frightening[2] = 0;

			this.group.position.fromArray(frightening);
			this.grouprt.position.fromArray(frightening);

			this.group.renderOrder = this.grouprt.renderOrder = Rekt.Srorder(this.tile_n);
		}

		// non screen bound not used anymore
		this.bound = new aabb2(
			[x * this.master.span, y * this.master.span],
			[(x + 1) * this.master.span, (y + 1) * this.master.span]);

		this.screen = Chunk.Sscreen(x, y, this.master);
	}
	update_color() {
		return;
		//if (!this.rttrekt.inuse)
		//	return;
		//this.rttrekt.material.color.set(new Color(this.rektcolor));
		//this.rttrekt.material.needsUpdate = true;
	}
	empty() {
		return this.objs.tuples.length < 1;
	}
	comes() {
		if (this.on || this.empty())
			return;
		this.objs.comes();
		tq.scene.add(this.group, this.grouprt);
		this.comes_pt2();
		this.on = true;
		return true;
	}
	comes_pt2() {
		if (!Egyt.USE_CHUNK_RT)
			return;
		let rtt = 0;
		for (let tuple of this.objs.tuples)
			if (tuple[0].rtt)
				rtt++;
		const threshold = rtt >= 10;
		if (!threshold)
			return;
		if (!this.rt)
			this.rt = new Chunk_Rt(this);
		this.rt.comes();
		this.rt.render();
	}
	goes() {
		if (!this.on)
			return;
		tq.scene.remove(this.group, this.grouprt);
		tqlib.erase_children(this.group);
		tqlib.erase_children(this.grouprt);
		this.objs.goes();
		this.rt?.goes();
		this.on = false;
	}
	sec() {
		return Egyt.game.view.intersect2(this.screen);
	}
	see() {
		return this.sec() != aabb2.SEC.OUT;
	}
	out() {
		return this.sec() == aabb2.SEC.OUT;
	}
	update() {
		this.objs.updates();
		if (Egyt.USE_CHUNK_RT && this.changed)
			this.rt?.render();
		this.changed = false;
	}
}
namespace Chunk {
	export function Sscreen(x, y, master) {

		let basest_tile = points.multp([x + 1, y], master.span * 24);

		let real = <vec2>points.two_one(basest_tile);
		points.subtract(real, [0, -master.height / 2]);

		return new aabb2(
			points.add(<vec2>points.clone(real), [-master.width / 2, -master.height / 2]),
			points.add(<vec2>points.clone(real), [master.width / 2, master.height / 2])
		)
	}
}

class Chunk_Objs2 {
	public rtts = 0
	public readonly tuples: [Obj, number][]
	constructor(private chunk: Chunk) {
		this.tuples = [];
	}
	rate(obj: Obj) {
		return this.tuples.length * obj.rate;
	}
	where(obj: Obj) {
		let i = this.tuples.length;
		while (i--)
			if (this.tuples[i][0] == obj)
				return i;
	}
	add(obj: Obj) {
		let i = this.where(obj);
		if (i == undefined) {
			this.tuples.push([obj, this.rate(obj)]);
			return true;
		}
	}
	remove(obj: Obj) {
		let i = this.where(obj);
		if (i != undefined) {
			this.tuples.splice(i, 1);
			return true;
		}
	}
	updates() {
		for (let tuple of this.tuples) {
			let rate = tuple[1]--;
			if (rate <= 0) {
				tuple[0].update();
				tuple[1] = this.rate(tuple[0]);
			}
		}
	}
	comes() {
		for (let tuple of this.tuples) {
			tuple[0].comes();
		}
	}
	goes() {
		for (let tuple of this.tuples) {
			tuple[0].goes();
		}
	}
}

class statchunk extends Chunk {

}

class dynchunk extends Chunk {

}

class Chunk_Master<T extends Chunk> {
	readonly span: number
	readonly span2: number
	readonly width: number
	readonly height: number

	total: number = 0
	arrays: T | null[][] = []

	refit = true
	fitter: Chunk_Fitter<T>

	constructor(private testType: new (x, y, m) => T, span: number) {
		this.span = span;
		this.span2 = span * span;
		this.width = span * 24;
		this.height = span * 12;

		this.fitter = new Chunk_Fitter<T>(this);
	}
	update() {
		if (this.refit) {
			this.fitter.update();
		}
	}
	big(t: zx | zxc): zx {
		return <zx>points.floor(points.divide(<zx>[...t], this.span));
	}
	at(x, y): T | null {
		let c;
		if (this.arrays[y] == undefined)
			this.arrays[y] = [];
		c = this.arrays[y][x];
		return c;
	}
	make(x, y): T {
		let c;
		c = this.at(x, y);
		if (c)
			return c;
		c = this.arrays[y][x] = new this.testType(x, y, this);
		return c;
	}
	which(t: zx): T {
		let b = this.big(t);
		let c = this.guarantee(b[0], b[1]);
		return c;
	}
	guarantee(x, y): T {
		return this.at(x, y) || this.make(x, y);
	}
	//static probe<T>() {

	//}
}

class Chunk_Fitter<T extends Chunk> { // chunk-snake

	lines: number
	total: number

	shown: T[] = []
	colors: string[] = []

	constructor(private master: Chunk_Master<T>) {
	}

	off() {
		let i = this.shown.length;
		while (i--) {
			let c = this.shown[i];
			c.update();
			if (c.out()) {
				c.goes();
				this.shown.splice(i, 1);
			}
		}
	}
	update() {

		let middle = Egyt.map.query_world_pixel(Egyt.game.view.center()).tile;

		let b = this.master.big(middle);

		this.lines = 0;
		this.total = 0;

		this.off();

		this.slither(b, 1);
		this.slither(b, -1);
	}

	slither(b: zx, n: number) {
		let x = b[0], y = b[1];
		let i = 0, j = 0, s = 0, u = 0;

		while (true) {
			i++;
			let c: T;
			c = this.master.guarantee(x, y);
			if (c.out()) {
				if (s > 2) {
					if (j == 0) j = 1;
					if (j == 2) j = 3;
				}
				u++;
			}
			else {
				u = 0;
				if (c.comes()) {
					this.shown.push(c);
				}
			}
			if (j == 0) {
				y += n;
				s++;
			}
			else if (j == 1) {
				x -= n;
				j = 2;
				s = 0;
			}
			else if (j == 2) {
				y -= n;
				s++;
			}
			else if (j == 3) {
				x -= n;
				j = 0;
				s = 0;
			}
			if (!s)
				this.lines++;
			this.total++;
			if (u > 5 || i >= 350) {
				break;
			}
		}
	}

}

class Chunk_Rt {
	readonly padding = Egyt.YUM * 4
	readonly w: number
	readonly h: number

	offset: zx = [0, 0]

	rekt: Rekt
	target: WebGLRenderTarget
	camera: OrthographicCamera

	constructor(private chunk: Chunk) {
		this.w = this.chunk.master.width + this.padding;
		this.h = this.chunk.master.height + this.padding;
		this.camera = tqlib.ortographiccamera(this.w, this.h);

		let p2 = <zx>[this.chunk.p[0] + 1, this.chunk.p[1]];
		points.multp(p2, this.chunk.master.span);

		this.rekt = new Rekt({
			tiled: true,
			xy: p2,
			wh: [this.w, this.h],
			asset: 'egyt/tenbyten'
		});
	}
	// todo pool the rts?
	comes() {
		this.rekt.use();
		this.rekt.mesh.renderOrder = Rekt.Srorder(this.chunk.tile_n);
		this.target = tqlib.rendertarget(this.w, this.h);
	}
	goes() {
		this.rekt.unuse();
		this.target.dispose();
	}
	render() {
		while (tq.rttscene.children.length > 0)
			tq.rttscene.remove(tq.rttscene.children[0]);

		const group = this.chunk.grouprt;

		group.position.set(0, -this.h / 2, 0);
		tq.rttscene.add(group);

		tq.renderer.setRenderTarget(this.target);
		tq.renderer.clear();
		tq.renderer.render(tq.rttscene, this.camera);

		this.rekt.material.map = this.target.texture;
	}
}

export { Chunk, Chunk_Master, Chunk_Fitter, Chunk_Objs2, statchunk, dynchunk }