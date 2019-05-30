import { TerrainChunk } from "././TerrainChunk";
import { Sprite3D } from "../core/Sprite3D"
	import { Transform3D } from "../core/Transform3D"
	import { BaseRender } from "../core/render/BaseRender"
	import { RenderContext3D } from "../core/render/RenderContext3D"
	import { BoundFrustum } from "../math/BoundFrustum"
	import { ContainmentType } from "../math/ContainmentType"
	import { Matrix4x4 } from "../math/Matrix4x4"
	
	/**
	 * <code>MeshRender</code> 类用于网格渲染器。
	 */
	export class TerrainRender extends BaseRender {
		
		/** @private */
		private _terrainSprite3DOwner:TerrainChunk;
		/** @private */
		protected _projectionViewWorldMatrix:Matrix4x4;
		
		/**
		 * 创建一个新的 <code>MeshRender</code> 实例。
		 */
		constructor(owner:TerrainChunk){
			super(owner);
			this._terrainSprite3DOwner = owner;
			this._projectionViewWorldMatrix = new Matrix4x4();
		}
		
		/**
		 * @inheritDoc
		 */
		/*override*/  _needRender(boundFrustum:BoundFrustum):boolean {
			if (boundFrustum)
				return boundFrustum.containsBoundBox(this._bounds._getBoundBox()) !== ContainmentType.Disjoint;
			else
				return true;
		}
		
		/**
		 * @inheritDoc
		 */
		/*override*/ protected _calculateBoundingBox():void {
			//var terrainFilter:TerrainFilter = _terrainSprite3DOwner.terrainFilter;
			//var worldMat:Matrix4x4 = _terrainSprite3DOwner.transform.worldMatrix;
			//var corners:Vector.<Vector3> = terrainFilter._boundingBoxCorners;
			//for (var i:int = 0; i < 8; i++)
				//Vector3.transformCoordinate(corners[i], worldMat, _tempBoundBoxCorners[i]);
			//BoundBox.createfromPoints(_tempBoundBoxCorners, _boundingBox);
			//terrainFilter.calcLeafBoudingBox(worldMat);
		}
		
		/**
		 * @inheritDoc
		 */
		/*override*/  _renderUpdate(context:RenderContext3D, transform:Transform3D):void {
			this._shaderValues.setMatrix4x4(Sprite3D.WORLDMATRIX, transform.worldMatrix);
		}
		
		/**
		 * @inheritDoc
		 */
		/*override*/  _renderUpdateWithCamera(context:RenderContext3D, transform:Transform3D):void {
			var projectionView:Matrix4x4 = context.projectionViewMatrix;
			Matrix4x4.multiply(projectionView, transform.worldMatrix, this._projectionViewWorldMatrix);
			this._shaderValues.setMatrix4x4(Sprite3D.MVPMATRIX, this._projectionViewWorldMatrix);
		}
		
		/**
		 * @private
		 */
		/*override*/  _destroy():void {
			super._destroy();
			this._terrainSprite3DOwner = null;
		}
	}

