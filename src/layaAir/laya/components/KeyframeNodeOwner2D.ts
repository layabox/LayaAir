


export enum KeyFrameValueType {
	Float = 0,
	Position = 1,
	Rotation = 2,
	Scale = 3,
	RotationEuler = 4,
	Vector2 = 5,
	Vector3 = 6,
	Vector4 = 7,
	Color = 8
}
/**
 * @internal
 * <code>KeyframeNodeOwner</code> 类用于保存帧节点的拥有者信息。
 */
export class KeyframeNodeOwner2D {
	/**@internal */
	indexInList: number = -1;
	/**@internal */
	referenceCount: number = 0;
	/**@internal */
	updateMark: number = -1;

	/**@internal 0 float,1 position,2 rotation,3 Scale,4 rotationEuler*/
	type: KeyFrameValueType = -1;
	/**@internal */
	fullPath: string | null = null;
	nodePath: string | null = null;
	/**@internal */
	propertyOwner: any = null;
	/**@internal */
	property: string[] | null = null;
	/**@internal */
	defaultValue: any = null;
	/**@internal */
	value: any = null;
	/**@internal */
	crossFixedValue: any = null;
	/**@internal */
	isMaterial: boolean = false;

	/**
	 * 创建一个 <code>KeyframeNodeOwner</code> 实例。
	 */
	constructor() {
	}

	/**
	 * @internal
	 */
	saveCrossFixedValue(): void {
		var pro: any = this.propertyOwner;
		if (pro) {
			

		}
	}

}


