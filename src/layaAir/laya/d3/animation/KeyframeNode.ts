import { KeyFrameValueType } from "../component/Animator/KeyframeNodeOwner";
import { Keyframe } from "../../maths/Keyframe";
import { Shader3D } from "../../RenderEngine/RenderShader/Shader3D";

/**
 * @en The KeyframeNode class is used for animation keyframes.
 * @zh KeyframeNode 类用于动画关键帧。
 */
export class KeyframeNode {
	private _ownerPath: string[] = [];
	private _propertys: string[] = [];
	private _materialId: number;

	/**@internal */
	_keyFrames: Keyframe[] = [];
	/**@internal */
	_indexInList: number;

	/**
	 * @internal
	 * Hermite fast-path 嗅探缓存。
	 * 整条曲线上：没有任何 frame 启用 weightedMode + 全部 tangent 分量为有限数，则置 true。
	 * 由 AnimationClip._evaluateClipDatasRealTime 首次扫到该 node 时 lazy 解析（只算一次），
	 * 命中后 hermite 内层省掉 per-component 的 weightedMode 分支与 Number.isFinite × 2 调用。
	 */
	_isPlainHermite: boolean = false;
	/**@internal */
	_isPlainHermiteResolved: boolean = false;

	/**@internal */
	type: KeyFrameValueType;
	/**@internal */
	fullPath: string;
	/**@internal */
	nodePath: string;
	/**@internal */
	propertyOwner: string;
	/**@internal call bake fun*/
	callbackFunData: string;
	/**@internal apply params*/
	callParams: any[];
	/**
	 * @internal
	 * ide
	 */
	propertyChangePath: string;

	/**
	 * @en The number of sprite paths.
	 * @zh 精灵路径个数。
	 */
	get ownerPathCount(): number {
		return this._ownerPath.length;
	}

	/**
	 * @en The number of property paths.
	 * @zh 属性路径个数。
	 */
	get propertyCount(): number {
		return this._propertys.length;
	}

	/**
	 * @en The number of keyframes.
	 * @zh 帧个数。
	 */
	get keyFramesCount(): number {
		return this._keyFrames.length;
	}

	/**
	 * @internal
	 */
	_setOwnerPathCount(value: number): void {
		this._ownerPath.length = value;
	}

	/**
	 * @internal
	 */
	_setOwnerPathByIndex(index: number, value: string): void {
		this._ownerPath[index] = value;
	}

	/**
	 * @internal
	 */
	_joinOwnerPath(sep: string): string {
		return this._ownerPath.join(sep);
	}

	/**
	 * @internal
	 */
	_setPropertyCount(value: number): void {
		this._propertys.length = value;
	}

	/**
	 * @internal
	 */
	_setPropertyByIndex(index: number, value: string): void {
		this._propertys[index] = value;
	}

	/**
	 * @internal
	 */
	_joinProperty(sep: string): string {
		return this._propertys.join(sep);
	}

	/**
	 * @internal
	 */
	_setKeyframeCount(value: number): void {
		this._keyFrames.length = value;
	}

	/**
	 * @internal
	 */
	_setKeyframeByIndex(index: number, value: Keyframe): void {
		this._keyFrames[index] = value;
	}

	/**
	 * @en Get the sprite path by index.
	 * @param index The index of the sprite path.
	 * @returns The sprite path at the specified index.
	 * @zh 通过索引获取精灵路径。
	 * @param index 索引。
	 * @returns 指定索引处的精灵路径。
	 */
	getOwnerPathByIndex(index: number): string {
		return this._ownerPath[index];
	}

	/**
	 * @en Get the property path by index.
	 * @param index The index of the property path.
	 * @returns The property path at the specified index.
	 * @zh 通过索引获取属性路径。
	 * @param index 索引。
	 * @returns 指定索引处的属性路径。
	 */
	getPropertyByIndex(index: number): string {
		return this._propertys[index];
	}

	/**
	 * @internal
	 * @en Get cached material property ID by index (for shader properties)
	 * @param index The index of the property
	 * @returns The shader property ID
	 * @zh 通过索引获取缓存的材质属性ID（用于shader属性）
	 * @param index 索引
	 * @returns shader属性ID
	 */
	getMaterialPropertyId(index: number): number {
		if (null == this._materialId) {
			this._materialId = Shader3D.propertyNameToID(this._propertys[index]);
		}
		return this._materialId;
	}

	/**
	 * @en Get the keyframe by index.
	 * @param index The index of the keyframe.
	 * @returns The keyframe at the specified index.
	 * @zh 通过索引获取帧。
	 * @param index 索引。
	 * @returns 指定索引处的关键帧。
	 */
	getKeyframeByIndex(index: number): Keyframe {
		return this._keyFrames[index];
	}
}