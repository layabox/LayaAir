import { Keyframe } from "../core/Keyframe"

/**
 * @internal
 */
export class KeyframeNode {
	private _ownerPath: string[] = [];
	private _propertys: string[] = [];

	/**@internal */
	_keyFrames: Keyframe[] = [];
	/**@internal */
	_indexInList: number;

	/**@internal */
	type: number;
	/**@internal */
	fullPath: string;
	/**@internal */
	nodePath: string;
	/**@internal */
	propertyOwner: string;

	/**
	 * 精灵路径个数。
	 */
	get ownerPathCount(): number {
		return this._ownerPath.length;
	}

	/**
	 * 属性路径个数。
	 */
	get propertyCount(): number {
		return this._propertys.length;
	}

	/**
	 * 帧个数。
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
	 * 通过索引获取精灵路径。
	 * @param index 索引。
	 */
	getOwnerPathByIndex(index: number): string {
		return this._ownerPath[index];
	}

	/**
	 * 通过索引获取属性路径。
	 * @param index 索引。
	 */
	getPropertyByIndex(index: number): string {
		return this._propertys[index];
	}

	/**
	 * 通过索引获取帧。
	 * @param index 索引。
	 */
	getKeyframeByIndex(index: number): Keyframe {
		return this._keyFrames[index];
	}
}

// native
/*if ((window as any).conch && (window as any).conchKeyframeNode) {
	//@ts-ignore
	KeyframeNode = (window as any).conchKeyframeNode;
}
if ((window as any).qq && (window as any).qq.webglPlus) {
	//@ts-ignore
	KeyframeNode = (window as any).qq.webglPlus.conchKeyframeNode;
}*/