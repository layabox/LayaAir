import { TrailSprite3D } from "./TrailSprite3D";
import { Sprite3D } from "../Sprite3D"
import { Transform3D } from "../Transform3D"
import { BaseRender } from "../render/BaseRender"
import { RenderContext3D } from "../render/RenderContext3D"
import { BoundFrustum } from "../../math/BoundFrustum"
import { Matrix4x4 } from "../../math/Matrix4x4"

/**
 * <code>TrailRenderer</code> 类用于创建拖尾渲染器。
 */
export class TrailRenderer extends BaseRender {
	constructor(owner: TrailSprite3D) {
		super(owner);
	}

	/**
	 * @inheritDoc
	 * @internal
	 * @override
	 */
	protected _calculateBoundingBox(): void {
	}

	/**
	 * @inheritDoc
	 * @internal
	 * @override
	 */
	_needRender(boundFrustum: BoundFrustum,context: RenderContext3D): boolean {
		(<TrailSprite3D>this._owner).trailFilter._update(context);
		if (boundFrustum)
			return boundFrustum.intersects(this.bounds._getBoundBox());
		else
			return true;
	}
	/**
	 *@internal [NATIVE]
	 */
	_updateForNative(context: RenderContext3D): void {
		(<TrailSprite3D>this._owner).trailFilter._update(context);
	}
	/**
	 * @inheritDoc
	 * @internal
	 * @override
	 */
	_renderUpdate(state: RenderContext3D, transform: Transform3D): void {
		super._renderUpdate(state, transform);
	}
	protected _projectionViewWorldMatrix: Matrix4x4 = new Matrix4x4();

	/**
	 * @inheritDoc
	 * @internal
	 * @override
	 */
	_renderUpdateWithCamera(context: RenderContext3D, transform: Transform3D): void {
		var projectionView: Matrix4x4 = context.projectionViewMatrix;
		if (transform) {
			Matrix4x4.multiply(projectionView, transform.worldMatrix, this._projectionViewWorldMatrix);
			this._shaderValues.setMatrix4x4(Sprite3D.MVPMATRIX, this._projectionViewWorldMatrix);
		} else {
			this._shaderValues.setMatrix4x4(Sprite3D.MVPMATRIX, projectionView);
		}
	}
}

