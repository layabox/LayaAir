import { TrailSprite3D } from "././TrailSprite3D";
import { Sprite3D } from "../Sprite3D"
import { Transform3D } from "../Transform3D"
import { BaseRender } from "../render/BaseRender"
import { RenderContext3D } from "../render/RenderContext3D"
import { BoundFrustum } from "../../math/BoundFrustum"
import { Matrix4x4 } from "../../math/Matrix4x4"
import { Vector3 } from "../../math/Vector3"
import { Render } from "../../../renders/Render"
import { FrustumCulling } from "../../graphics/FrustumCulling"

/**
 * <code>TrailRenderer</code> 类用于创建拖尾渲染器。
 */
export class TrailRenderer extends BaseRender {
	constructor(owner: TrailSprite3D) {
		super(owner);
		this._supportOctree=false;
	}

		/**
		 * @inheritDoc
		 */
		/*override*/ protected _calculateBoundingBox(): void {
			var bounds = this._bounds;
			if (Render.supportWebGLPlusCulling) {//[NATIVE]
				var min:Vector3 = this._bounds.getMin();
				var max:Vector3 = this._bounds.getMax();
				var buffer:Float32Array = FrustumCulling._cullingBuffer;
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
		 */
		/*override*/  _needRender(boundFrustum: BoundFrustum): boolean {
		return true;
	}

		/**
		 * @inheritDoc
		 */
		/*override*/  _renderUpdate(state: RenderContext3D, transform: Transform3D): void {
		super._renderUpdate(state, transform);
		((<TrailSprite3D>this._owner)).trailFilter._update(state);
	}
	protected _projectionViewWorldMatrix: Matrix4x4 = new Matrix4x4();

		/**
		 * @inheritDoc
		 */
		/*override*/  _renderUpdateWithCamera(context: RenderContext3D, transform: Transform3D): void {
		var projectionView: Matrix4x4 = context.projectionViewMatrix;
		if (transform) {
			Matrix4x4.multiply(projectionView, transform.worldMatrix, this._projectionViewWorldMatrix);
			this._shaderValues.setMatrix4x4(Sprite3D.MVPMATRIX, this._projectionViewWorldMatrix);
		} else {
			this._shaderValues.setMatrix4x4(Sprite3D.MVPMATRIX, projectionView);
		}
	}
}

