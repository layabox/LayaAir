/**
 * @internal
 * @en Represents the data structure for an inverse kinematics (IK) constraint in a skeletal animation system.
 * @zh 表示骨骼动画系统中逆动力学（IK）约束的数据结构。
 */
export class IkConstraintData {

	/**
	 * @en The name of the IK constraint.
	 * @zh IK 约束的名称。
	 */
	name: string;
	/**
	 * @en The name of the target bone that the IK constraint targets.
	 * @zh IK 约束所指向的目标骨骼的名称。
	 */
	targetBoneName: string;
	/**
	 * @en An array of bone names that are affected by the IK constraint.
	 * @zh 受 IK 约束影响的骨骼名称数组。
	 */
	boneNames: string[] = [];
	/**
	 * @en The bend direction of the IK constraint.
	 * @zh IK 约束的弯曲方向。
	 */
	bendDirection: number = 1;
	/**
	 * @en The mix value of the IK constraint, influencing the weight of the constraint.
	 * @zh IK 约束的混合值，影响约束的权重。
	 */
	mix: number = 1;
	/**
	 * @en A boolean indicating whether the IK constraint is used in a Spine project.
	 * @zh 一个布尔值，指示 IK 约束是否用于 Spine 项目。
	 */
	isSpine: boolean = true;
	/**
	 * @en The index of the target bone in the skeleton.
	 * @zh 在骨架中目标骨骼的索引。
	 */
	targetBoneIndex: number = -1;
	/**
	 * @en An array of bone indices affected by the IK constraint.
	 * @zh 受 IK 约束影响的骨骼索引数组。
	 */
	boneIndexs: number[] = [];

	//TODO:coverage
	constructor() {

	}

}


