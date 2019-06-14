import { Rigidbody3D } from "././Rigidbody3D";
import { PhysicsSimulation } from "./PhysicsSimulation"

/**
 * ...
 * @author ...
 */
export class Constraint3D {
	/**@private */
	_nativeConstraint: any;
	/**@private */
	_simulation: PhysicsSimulation;

	/**获取刚体A。[只读]*/
	rigidbodyA: Rigidbody3D;
	/**获取刚体A。[只读]*/
	rigidbodyB: Rigidbody3D;

	constructor() {

	}

}


