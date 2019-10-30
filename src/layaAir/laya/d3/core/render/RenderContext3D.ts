import { RenderElement } from "./RenderElement";
import { BaseCamera } from "../BaseCamera"
import { Scene3D } from "../scene/Scene3D"
import { Matrix4x4 } from "../../math/Matrix4x4"
import { Viewport } from "../../math/Viewport"
import { ShaderInstance } from "../../shader/ShaderInstance"

/**
 * <code>RenderContext3D</code> 类用于实现渲染状态。
 */
export class RenderContext3D {
	/** @internal */
	static _instance: RenderContext3D = new RenderContext3D();

	/**渲染区宽度。*/
	static clientWidth: number;
	/**渲染区高度。*/
	static clientHeight: number;

	/** @internal */
	viewMatrix: Matrix4x4;
	/** @internal */
	projectionMatrix: Matrix4x4;
	/** @internal */
	projectionViewMatrix: Matrix4x4;
	/** @internal */
	viewport: Viewport;

	/** @internal */
	scene: Scene3D;
	/** @internal */
	camera: BaseCamera;
	/** @internal */
	renderElement: RenderElement;
	/** @internal */
	shader: ShaderInstance;
	/** @internal */
	invertY: boolean = false;

	/**
	 * 创建一个 <code>RenderContext3D</code> 实例。
	 */
	constructor() {

	}

}


