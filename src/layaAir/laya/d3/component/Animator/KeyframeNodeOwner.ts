import { Quaternion } from "../../../maths/Quaternion";
import { Vector2 } from "../../../maths/Vector2";
import { Vector3 } from "../../../maths/Vector3";
import { Vector4 } from "../../../maths/Vector4";
import { IOwnerData, createOwnerData } from "./factory/data/IAnimatorData";

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
	Color = 8,
	Boolean = 9,
	PathPoint = 10,
	MaterialRef = 11,
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
	 * 运行时热数据隔层：value / defaultValue / crossFixedValue / maskActive 全部转发到 _data。
	 * Web 路径下 _data 是 PlainOwnerData（字段就是 plain 字段，行为与重构前一致）；
	 * Native 路径下 _data 是 conch 端的 proxy 实例（getter/setter 跨边界写 OwnerTable）。
	 * 现有调用方 `owner.value` / `owner.defaultValue` 等都通过 accessor 透传，0 改动。
	 */
	_data: IOwnerData = createOwnerData();

	/**
	 * @internal
	 * @en Default value of the property
	 * @zh 属性的默认值
	 */
	get defaultValue(): any { return this._data.defaultValue; }
	set defaultValue(v: any) { this._data.defaultValue = v; }
	/**
	 * @internal
	 * @en Current value of the property
	 * @zh 属性的当前值
	 */
	get value(): any { return this._data.value; }
	set value(v: any) { this._data.value = v; }
	/**
	 * @internal
	 * @en Fixed value for cross-fading
	 * @zh 用于交叉淡入淡出的固定值
	 */
	get crossFixedValue(): any { return this._data.crossFixedValue; }
	set crossFixedValue(v: any) { this._data.crossFixedValue = v; }
	/**
	 * @internal
	 * AvatarMask 预解析结果：当前 owner 是否激活。默认 true，由上层在 mask 变更时刷新。
	 */
	get maskActive(): boolean { return this._data.maskActive; }
	set maskActive(v: boolean) { this._data.maskActive = v; }
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
				case KeyFrameValueType.Float:
				case KeyFrameValueType.Boolean:
					this.crossFixedValue = this.value;
					break;
				case KeyFrameValueType.Position:
				case KeyFrameValueType.Scale:
				case KeyFrameValueType.RotationEuler:
				case KeyFrameValueType.Vector3:
					(<Vector3>this.value).cloneTo(this.crossFixedValue);
					break;
				case KeyFrameValueType.Rotation:
					(<Quaternion>this.value).cloneTo(this.crossFixedValue);
					break;
				case KeyFrameValueType.Vector2:
					(<Vector2>this.value).cloneTo(this.crossFixedValue);
					break;
				case KeyFrameValueType.Vector4:
				case KeyFrameValueType.Color:
					(<Vector4>this.value).cloneTo(this.crossFixedValue);
					break;
				case KeyFrameValueType.MaterialRef:
					this.crossFixedValue = this.value;
					break;
				default:
					throw new Error("Animator:unknown type.");
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


