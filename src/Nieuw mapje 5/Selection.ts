import Obj from "../Nieuw mapje/Obj";
import Rekt from "../Nieuw mapje/Rekt";

import { Mesh, PlaneBufferGeometry, MeshBasicMaterial, Vector3 } from "three";

import { game } from "../Game";
import { ThreeQuarter } from "../ThreeQuarter";
import Zxcvs from "../Zxcvs";

class Selection {

	mesh: Mesh
	meshShadow: Mesh

	material: MeshBasicMaterial
	geometry: PlaneBufferGeometry

	dim: Zx
	start: Zx
	end: Zx

	enuf: boolean

	constructor() {
		this.enuf = false;
	}

	Make() {
		this.geometry = new PlaneBufferGeometry(1, 1);

		this.material = new MeshBasicMaterial({
			transparent: true,
			//opacity: .5,
			color: 'white',
			wireframe: true
		});

		this.mesh = new Mesh(this.geometry, this.material);
		this.mesh.frustumCulled = false;
		this.mesh.scale.set(1, 1, 1);

		this.mesh.renderOrder = 500;

		ThreeQuarter.scene.add(this.mesh);
	}

	Update(mouse: Zx) {
		this.View(mouse);
		this.Save(mouse);
		this.Sufficient(mouse);
		this.Set(mouse);
	}

	Sufficient(mouse: Zx) {
		let rem = Zxcvs.SubtrClone(
			this.end, this.start);

		const px = Zxcvs.Together(
			Zxcvs.Abs(rem as Zx));

		if (!this.enuf && px > 15) {
			this.enuf = true;

			this.Make();
		}
	}

	View(mouse: Zx) {
		Zxcvs.Subtr(
			mouse, game.pos);

		Zxcvs.Subtr(
			mouse, Zxcvs.DivideClone(ThreeQuarter.ender, 2));

		let scale = 1;

		if (game.scale == 0.5)
			scale = 2;

		Zxcvs.Multp(
			mouse, scale);
	}

	Save(mouse: Zx) {
		if (!this.start)
			this.start = [...mouse] as Zx;

		this.end = [...mouse] as Zx;
	}

	Set(mouse: Zx) {
		if (!this.enuf)
			return;

		let size = Zxcvs.SubtrClone(
			this.end, this.start);

		let pos = Zxcvs.SubtrClone(
			mouse, Zxcvs.DivideClone(size as Zx, 2));

		this.mesh.scale.set(size[0], size[1], 1);
		this.mesh.position.set(pos[0], pos[1], 0);

		ThreeQuarter.changes = true;
	}

	End() {
		if (!this.enuf)
			return;

		ThreeQuarter.scene.remove(this.mesh);

		this.geometry.dispose();
		this.material.dispose();

		ThreeQuarter.changes = true;
	}
}

namespace Selection {
	//export type Stats = Selection['stats']
}

export default Selection;