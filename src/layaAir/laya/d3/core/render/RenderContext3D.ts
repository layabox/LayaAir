import { RenderElement } from "././RenderElement";
import { BaseCamera } from "../BaseCamera"
import { Scene3D } from "../scene/Scene3D"
import { Matrix4x4 } from "../../math/Matrix4x4"
import { Viewport } from "../../math/Viewport"
import { ShaderInstance } from "../../shader/ShaderInstance"

/**
 * <code>RenderContext3D</code> 类用于实现渲染状态。
 */
export class RenderContext3D {
	/** @private */
	static _instance: RenderContext3D = new RenderContext3D();

	/**渲染区宽度。*/
	static clientWidth: number;
	/**渲染区高度。*/
	static clientHeight: number;

	/** @private */
	_batchIndexStart: number;
	/** @private */
	_batchIndexEnd: number;

	/** @private */
	viewMatrix: Matrix4x4;
	/** @private */
	projectionMatrix: Matrix4x4;
	/** @private */
	projectionViewMatrix: Matrix4x4;
	/** @private */
	viewport: Viewport;

	/** @private */
	scene: Scene3D;
	/** @private */
	camera: BaseCamera;
	/** @private */
	renderElement: RenderElement;
	/** @private */
	shader: ShaderInstance;

	/**
	 * 创建一个 <code>RenderContext3D</code> 实例。
	 */
	constructor() {
		/*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
	}

}


