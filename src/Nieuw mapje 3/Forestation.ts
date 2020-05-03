import Rekt from "../Nieuw mapje/Rekt";
import Egyt from "../Egyt";
import { aabb3 } from "../Bound";

namespace Forestation {

	export function sow_area(aabb: aabb3) {

	}

	export function place_tree(pos: Zxc) {

		const trees = [
			'egyt/oaktree1',
			'egyt/oaktree2',
		]

		let pick = trees[
			Egyt.floor_random(trees.length)];

		let tree = new Rekt({
			asset: pick,
			pos: pos,
			dim: [102, 114],
		});

		tree.initiate();

		return tree;
	}
}

export default Forestation;