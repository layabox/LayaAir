import { Quaternion } from "../../../maths/Quaternion";
import { Vector3 } from "../../../maths/Vector3";

export enum KeyFrameValueType {
	None = -1,
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
 * @en The KeyframeNodeOwner class is used to store the owner information of frame nodes.
 * @zh KeyframeNodeOwner 类用于保存帧节点的拥有者信息。
 */
export class KeyframeNodeOwner {
	/**
	 * @internal
	 * @en Index in the list
	 * @zh 列表中的索引
	 */
	indexInList: number = -1;
	/**
	 * @internal
	 * @en Reference count
	 * @zh 引用计数
	 */
	referenceCount: number = 0;
	/**
	 * @internal
	 * @en Update mark
	 * @zh 更新标记
	 */
	updateMark: number = -1;

	/**
	 * @internal
	 * @en 0 float, 1 position, 2 rotation, 3 Scale, 4 rotationEuler
	 * @zh 0 浮点数, 1 位置, 2 旋转, 3 缩放, 4 欧拉角旋转
	 */
	type: KeyFrameValueType = -1;
	/**
	 * @internal
	 * @en Full path of the node
	 * @zh 节点的完整路径
	 */
	fullPath: string | null = null;
	nodePath: string | null = null;
	/**
	 * @internal
	 * @en Owner of the property
	 * @zh 属性的所有者
	 */
	propertyOwner: any = null;
	/**
	 * @internal
	 * @en Property array
	 * @zh 属性数组
	 */
	property: string[] | null = null;
	/**
	 * @internal
	 * @en Default value of the property
	 * @zh 属性的默认值
	 */
	defaultValue: any = null;
	/**
	 * @internal
	 * @en Current value of the property
	 * @zh 属性的当前值
	 */
	value: any = null;
	/**
	 * @internal
	 * @en Fixed value for cross-fading
	 * @zh 用于交叉淡入淡出的固定值
	 */
	crossFixedValue: any = null;
	/**
	 * @internal
	 * @en Whether the property belongs to a material
	 * @zh 属性是否属于材质
	 */
	isMaterial: boolean = false;

	/**
	 * @internal
	 * @en Callback path
	 * @zh 回调路径
	 */
	callbackFunData: string;
	/**
	 * @internal
	 * @en Callback owner
	 * @zh 回调归属
	 */
	callBackOwner: any;
	/**@internal */
	callbackFun: string;
	/**@internal */
	callParams: any[];
	/**
	 * @en constructor of KeyframeNodeOwner
	 * @zh 构造函数
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

	/**
	 * @internal
	 */
	animatorDataSetCallBack() {
		let fn: Function = this.callBackOwner[this.callbackFun];
		fn.apply(this.callBackOwner, this.callParams);
	}

	/**
	 * @internal
	 */
	getCallbackNode() {
		if (this.propertyOwner && this.callbackFunData) {
			let funPropertys = this.callbackFunData.split(".");
			this.callBackOwner = this.propertyOwner;
			for (let i = 0, n = funPropertys.length - 1; i < n; i++) {
				this.callBackOwner = this.callBackOwner[funPropertys[i]];
			}
			this.callbackFun = funPropertys[funPropertys.length - 1];
		}
	}
}


