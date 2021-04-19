import { Matrix4x4 } from "../../math/Matrix4x4";
import { ShaderData } from "../../shader/ShaderData";
import { BaseRender } from "../render/BaseRender";
import { RenderContext3D } from "../render/RenderContext3D";
import { Sprite3D } from "../Sprite3D";
import { Transform3D } from "../Transform3D";
import { PixelLineSprite3D } from "./PixelLineSprite3D";
import { PixelLineFilter } from "./PixelLineFilter";


/**
 * <code>PixelLineRenderer</code> 类用于线渲染器。
 */
export class PixelLineRenderer extends BaseRender {
	/** @internal */
	protected _projectionViewWorldMatrix: Matrix4x4;

	/**
	 * 创建一个PixelLineRenderer实例
	 * @param owner 线渲染精灵
	 */
	constructor(owner: PixelLineSprite3D) {
		super(owner);
		this._projectionViewWorldMatrix = new Matrix4x4();
	}

	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	protected _calculateBoundingBox(): void {
		var worldMat: Matrix4x4 = ((<PixelLineSprite3D>this._owner)).transform.worldMatrix;
		var lineFilter: PixelLineFilter = (<PixelLineSprite3D>this._owner)._geometryFilter;
		lineFilter._reCalculateBound();
		lineFilter._bounds._tranform(worldMat, this._bounds);
	}

	/**
	 * @inheritDoc
	 * @override
	 * @internal
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


