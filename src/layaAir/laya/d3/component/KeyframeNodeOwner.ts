import { Vector3 } from "../math/Vector3";
import { Quaternion } from "../math/Quaternion";

/**
 * @internal
 * <code>KeyframeNodeOwner</code> 类用于保存帧节点的拥有者信息。
 */
export class KeyframeNodeOwner {
	/**@internal */
	indexInList: number = -1;
	/**@internal */
	referenceCount: number = 0;
	/**@internal */
	updateMark: number = -1;

	/**@internal */
	type: number = -1;
	/**@internal */
	fullPath: string|null = null;
	/**@internal */
	propertyOwner: any = null;
	/**@internal */
	property: string[]|null = null;
	/**@internal */
	defaultValue: any = null;
	/**@internal */
	value: any = null;
	/**@internal */
	crossFixedValue: any = null;

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
			switch (this.type) {
				case 0:
					this.crossFixedValue = this.value;
					break;
				case 1:
				case 3:
				case 4:
					(<Vector3>this.value).cloneTo(this.crossFixedValue);
					break;
				case 2:
					(<Quaternion>this.value).cloneTo(this.crossFixedValue);
					break;
				default:
					throw "Animator:unknown type.";
			}

		}
	}

}


