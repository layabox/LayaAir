import { LineSprite3D } from "./LineSprite3D";
import { RenderableSprite3D } from "laya/d3/core/RenderableSprite3D"
	import { Sprite3D } from "laya/d3/core/Sprite3D"
	import { Transform3D } from "laya/d3/core/Transform3D"
	import { BaseRender } from "laya/d3/core/render/BaseRender"
	import { RenderContext3D } from "laya/d3/core/render/RenderContext3D"
	import { Matrix4x4 } from "laya/d3/math/Matrix4x4"
	import { ShaderData } from "laya/d3/shader/ShaderData"
	
	/**
	 * ...
	 * @author
	 */
	export class LineRenderer extends BaseRender {
		/** @private */
		protected _projectionViewWorldMatrix:Matrix4x4;
		
		constructor(owner:LineSprite3D){
			super(owner,RenderableSprite3D.shaderUniforms.count);
			this._projectionViewWorldMatrix = new Matrix4x4();
		}
		
		/**
		 * @inheritDoc
		 */
		/*override*/ protected _calculateBoundingBox():void {
			var minE:Float32Array = this._boundingBox.min.elements;
			minE[0] = -Number.MAX_VALUE;
			minE[1] = -Number.MAX_VALUE;
			minE[2] = -Number.MAX_VALUE;
			var maxE:Float32Array = this._boundingBox.min.elements;
			maxE[0] = Number.MAX_VALUE;
			maxE[1] = Number.MAX_VALUE;
			maxE[2] = Number.MAX_VALUE;
		}
		
		/**
		 * @inheritDoc
		 */
		/*override*/ protected _calculateBoundingSphere():void {
			var centerE:Float32Array = this._boundingSphere.center.elements;
			centerE[0] = 0;
			centerE[1] = 0;
			centerE[2] = 0;
			this._boundingSphere.radius = Number.MAX_VALUE;
		}
		
		/**
		 * @inheritDoc
		 */
		/*override*/  _renderUpdateWithCamera(context:RenderContext3D, transform:Transform3D):void {//TODO:整理_renderUpdate
			var projectionView:Matrix4x4 = context.projectionViewMatrix;
			var sv:ShaderData = this._shaderValues;
			if (transform) {
				var worldMat:Matrix4x4 = transform.worldMatrix;
				sv.setMatrix4x4(Sprite3D.WORLDMATRIX, worldMat);
				Matrix4x4.multiply(projectionView, worldMat, this._projectionViewWorldMatrix);
				sv.setMatrix4x4(Sprite3D.MVPMATRIX, this._projectionViewWorldMatrix);
			} else {
				sv.setMatrix4x4(Sprite3D.WORLDMATRIX, Matrix4x4.DEFAULT);
				sv.setMatrix4x4(Sprite3D.MVPMATRIX, projectionView);
			}
		}
	
	}


