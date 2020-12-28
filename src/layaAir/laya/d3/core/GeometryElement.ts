//@ts-nocheck
import { RenderContext3D } from "./render/RenderContext3D"
import { IDestroy } from "../../resource/IDestroy"

/**
 * <code>GeometryElement</code> 类用于实现几何体元素,该类为抽象类。
 */
export class GeometryElement implements IDestroy {
	/**@internal */
	protected static _typeCounter: number = 0;

	/**@internal */
	protected _destroyed: boolean;

	/**
	 * 获取是否销毁。
	 * @return 是否销毁。
	 */
	get destroyed(): boolean {
		return this._destroyed;
	}

	/**
	 * 创建一个 <code>GeometryElement</code> 实例。
	 */
	constructor() {

		this._destroyed = false;
	}

	/**
	 * 获取几何体类型。
	 */
	_getType(): number {
		throw "GeometryElement:must override it.";
	}

	/**
	 * @internal
	 * @return  是否需要渲染。
	 */
	_prepareRender(state: RenderContext3D): boolean {
		return true;
	}

	/**
	 * @internal
	 */
	_render(state: RenderContext3D): void {
		throw "GeometryElement:must override it.";
	}

	/**
	 * 销毁。
	 */
	destroy(): void {
		if (this._destroyed)
			return;
		this._destroyed = true;
	}
}

