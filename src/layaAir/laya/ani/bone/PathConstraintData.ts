/**
 * @internal
 * @en The `PathConstraintData` class contains the setup data for a path constraint.
 * @zh `PathConstraintData` 类包含了路径约束的设置数据。
 */
export class PathConstraintData {

	/**
	 * @en The name of the path constraint.
	 * @zh 路径约束的名称。
	 */
	name: string;
	/**
	 * @en An array of bone indices that will be used as bones for the path constraint.
	 * @zh 用作路径约束骨骼的骨骼索引数组。
	 */
	bones: number[] = [];
	/**
	 * @en The target bone slot that will be constrained by the path.
	 * @zh 将被路径约束的目标骨骼插槽。
	 */
	target: string;
	/**
	 * @en The mode for how the bones are positioned along the path.
	 * @zh 骨骼沿路径定位的模式。
	 */
	positionMode: string;
	/**
	 * @en The mode for how the spacing between bones is controlled.
	 * @zh 控制骨骼间距的模式。
	 */
	spacingMode: string;
	/**
	 * @en The mode for how bones are rotated to match the path. 
	 * @zh 骨骼如何旋转以匹配路径的模式。
	 */
	rotateMode: string;
	/**
	 * @en The rotation offset added to the constrained bones.
	 * @zh 添加到受约束骨骼的旋转偏移量。
	 */
	offsetRotation: number;
	/**
	 * @en The position of the path constraint.
	 * @zh 路径约束的位置。
	 */
	position: number;
	/**
	 * @en The spacing between bones when the path constraint is applied.
	 * @zh 应用路径约束时骨骼之间的间隔。
	 */
	spacing: number;
	/**
	 * @en Used to apply path rotation to the mix ratio of the constrained bones.
	 * @zh 用于将路径旋转应用到受约束骨骼的混合比例。
	 */
	rotateMix: number;
	/**
	 * @en Used to apply path translation to the mix ratio of the constrained bones.
	 * @zh 用于将路径平移应用到受约束骨骼的混合比例。
	 */
	translateMix: number;

	constructor() {

	}
}

