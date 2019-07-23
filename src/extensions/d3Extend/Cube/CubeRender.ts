import { RenderableSprite3D } from "laya/d3/core/RenderableSprite3D"
	import { Sprite3D } from "laya/d3/core/Sprite3D"
	import { Transform3D } from "laya/d3/core/Transform3D"
	import { BaseRender } from "laya/d3/core/render/BaseRender"
	import { RenderContext3D } from "laya/d3/core/render/RenderContext3D"
	import { BoundFrustum } from "laya/d3/math/BoundFrustum"
	import { Matrix4x4 } from "laya/d3/math/Matrix4x4"
	
	/**
	 * <code>CubeRender</code> 类用于实现方块渲染器。
	 */
	export class CubeRender extends BaseRender {
		/**@private */
		private _projectionViewWorldMatrix:Matrix4x4;
		
		/**
		 * 创建一个 <code>CubeRender</code> 实例。
		 */
		constructor(owner:RenderableSprite3D){
			super(owner, 4);
			this._projectionViewWorldMatrix = new Matrix4x4();
		}
		
		/**
		 * @inheritDoc
		 */
		/*override*/ protected _calculateBoundingSphere():void {
			this._boundingSphere.radius = Number.MAX_VALUE;
		}
		
		/**
		 * @inheritDoc
		 */
		/*override*/  _renderUpdate(context:RenderContext3D, transform:Transform3D):void {
			if (transform)
				this._shaderValues.setMatrix4x4(Sprite3D.WORLDMATRIX, transform.worldMatrix);
			else
				this._shaderValues.setMatrix4x4(Sprite3D.WORLDMATRIX, Matrix4x4.DEFAULT);
		}
		
		/**
		 * @inheritDoc
		 */
		/*override*/  _renderUpdateWithCamera(context:RenderContext3D, transform:Transform3D):void {
			var projectionView:Matrix4x4 = context.projectionViewMatrix;
			if (transform) {
				Matrix4x4.multiply(projectionView, transform.worldMatrix, this._projectionViewWorldMatrix);
				this._shaderValues.setMatrix4x4(Sprite3D.MVPMATRIX, this._projectionViewWorldMatrix);
			} else {
				this._shaderValues.setMatrix4x4(Sprite3D.MVPMATRIX, projectionView);
			}
		}
		
		/**
		 * @inheritDoc
		 */
		/*override*/  _destroy():void {
		
		}
	
	}


