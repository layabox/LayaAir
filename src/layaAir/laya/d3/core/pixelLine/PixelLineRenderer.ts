import { PixelLineSprite3D } from "./PixelLineSprite3D";
import { Sprite3D } from "../Sprite3D"
import { Transform3D } from "../Transform3D"
import { BaseRender } from "../render/BaseRender"
import { RenderContext3D } from "../render/RenderContext3D"
import { FrustumCulling } from "../../graphics/FrustumCulling"
import { Matrix4x4 } from "../../math/Matrix4x4"
import { Vector3 } from "../../math/Vector3"
import { ShaderData } from "../../shader/ShaderData"
import { Render } from "../../../renders/Render"


/**
 * <code>PixelLineRenderer</code> 类用于线渲染器。
 */
export class PixelLineRenderer extends BaseRender {
	/** @internal */
	protected _projectionViewWorldMatrix: Matrix4x4;

	constructor(owner: PixelLineSprite3D) {
		super(owner);
		this._projectionViewWorldMatrix = new Matrix4x4();
		this._supportOctree = false;
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	protected _calculateBoundingBox(): void {
		var min: Vector3 = this._bounds.getMin();
		min.x = -Number.MAX_VALUE;
		min.y = -Number.MAX_VALUE;
		min.z = -Number.MAX_VALUE;
		this._bounds.setMin(min);
		var max: Vector3 = this._bounds.getMax();
		max.x = Number.MAX_VALUE;
		max.y = Number.MAX_VALUE;
		max.z = Number.MAX_VALUE;
		this._bounds.setMax(max);

		if (Render.supportWebGLPlusCulling) {//[NATIVE]
			var min: Vector3 = this._bounds.getMin();
			var max: Vector3 = this._bounds.getMax();
			var buffer: Float32Array = FrustumCulling._cullingBuffer;
			buffer[this._cullingBufferIndex + 1] = min.x;
			buffer[this._cullingBufferIndex + 2] = min.y;
			buffer[this._cullingBufferIndex + 3] = min.z;
			buffer[this._cullingBufferIndex + 4] = max.x;
			buffer[this._cullingBufferIndex + 5] = max.y;
			buffer[this._cullingBufferIndex + 6] = max.z;
		}
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	_renderUpdateWithCamera(context: RenderContext3D, transform: Transform3D): void {//TODO:整理_renderUpdate
		var projectionView: Matrix4x4 = context.projectionViewMatrix;
		var sv: ShaderData = this._shaderValues;
		if (transform) {
			var worldMat: Matrix4x4 = transform.worldMatrix;
			sv.setMatrix4x4(Sprite3D.WORLDMATRIX, worldMat);
			Matrix4x4.multiply(projectionView, worldMat, this._projectionViewWorldMatrix);
			sv.setMatrix4x4(Sprite3D.MVPMATRIX, this._projectionViewWorldMatrix);
		} else {
			sv.setMatrix4x4(Sprite3D.WORLDMATRIX, Matrix4x4.DEFAULT);
			sv.setMatrix4x4(Sprite3D.MVPMATRIX, projectionView);
		}
	}

}


