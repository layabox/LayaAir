import { MeshSprite3D } from "laya/d3/core/MeshSprite3D"
	import { Transform3D } from "laya/d3/core/Transform3D"
	import { BaseRender } from "laya/d3/core/render/BaseRender"
	import { RenderContext3D } from "laya/d3/core/render/RenderContext3D"
	import { BoundBox } from "laya/d3/math/BoundBox"
	import { BoundFrustum } from "laya/d3/math/BoundFrustum"
	import { BoundSphere } from "laya/d3/math/BoundSphere"
	import { Matrix4x4 } from "laya/d3/math/Matrix4x4"
	import { Vector3 } from "laya/d3/math/Vector3"
	import { Mesh } from "laya/d3/resource/models/Mesh"
	import { UISprite3D } from "./UISprite3D"

	export class UISprite3DRenderer extends BaseRender {
		 boundsph:BoundSphere = new BoundSphere(new Vector3(), 1.0);
		protected _projectionViewWorldMatrix:Matrix4x4;
		constructor(owner:UISprite3D){
			super(owner);
			this._projectionViewWorldMatrix = new Matrix4x4();
		}
		
		private _onMeshLoaed():void {
			this._boundingSphereNeedChange = true;
			this._boundingBoxNeedChange = true;
			this._boundingBoxCenterNeedChange = true;
			this._octreeNodeNeedChange = true;
		}
		
		/**
		 * @private
		 */
		//计算包围盒根据原始包围盒
		protected _calculateBoundBoxByInitCorners(corners:Vector3[]):void {
			var worldMat:Matrix4x4 = ((<MeshSprite3D>this._owner )).transform.worldMatrix;
			for (var i:number = 0; i < 8; i++)
				BoundBox.createfromPoints(BaseRender._tempBoundBoxCorners, this._boundingBox);
			Vector3.transformCoordinate(corners[i], worldMat, BaseRender._tempBoundBoxCorners[i]);
		}
		
		/**
		 * @inheritDoc
		 */
		//计算球包围盒
		/*override*/ protected _calculateBoundingSphere():void {
			var boundSphere:BoundSphere = ((<UISprite3D>this._owner ))._bsphere;
			var maxScale:number;
			var transform:Transform3D = this._owner.transform;
			var scale:Vector3= transform.scale;
			scale.x = -scale.x;
			scale.y = -scale.y;
			scale.z = -scale.z;
			
			if (scale.x >= scale.y && scale.x >= scale.z)
				maxScale = scale.x;
			else
				maxScale = scale.y >= scale.x ? scale.y : scale.z;
			Vector3.transformCoordinate(boundSphere.center, transform.worldMatrix, this._boundingSphere.center);
			this._boundingSphere.radius = boundSphere.radius * maxScale;
		}
		
		/**
		 * @inheritDoc
		 */
		//计算Box包围盒
		/*override*/ protected _calculateBoundingBox():void {
			var sharedMesh:Mesh = ((<MeshSprite3D>this._owner )).meshFilter.sharedMesh;
			if (sharedMesh == null || sharedMesh.boundingBox == null)
				this._boundingBox.toDefault();
			else
				this._calculateBoundBoxByInitCorners(sharedMesh.boundingBoxCorners);
		}
		
		/**
		 * @inheritDoc
		 */
		//判断是否需要渲染
		/*override*/  _needRender(boundFrustum:BoundFrustum):boolean {
			return true;
		}
		
		/**
		 * @inheritDoc
		 */
		//更新模型位置
		/*override*/  _renderUpdate(context:RenderContext3D, transform:Transform3D):void {
			var trans:Transform3D = this._owner.transform;
			//trans.lookAt();
			/*
			if (transform)
				_shaderValues.setMatrix4x4(Sprite3D.WORLDMATRIX, transform.worldMatrix);
			else
				_shaderValues.setMatrix4x4(Sprite3D.WORLDMATRIX, Matrix4x4.DEFAULT);
			*/
		}
		
		/**
		 * @inheritDoc
		 */
		//更新模型照相机位置
		/*override*/  _renderUpdateWithCamera(context:RenderContext3D, transform:Transform3D):void {
			if( ((<UISprite3D>this._owner )).oritype==2){
				var campos:Vector3 = context.camera._transform.position;
				var mytrans:Transform3D = this._owner.transform;
				mytrans.lookAt(campos, Vector3._Up);
			}
			
			var projectionView:Matrix4x4 = context.projectionViewMatrix;
			if (transform) {
				Matrix4x4.multiply(projectionView, transform.worldMatrix, this._projectionViewWorldMatrix);
				//_shaderValues.setMatrix4x4(Sprite3D.MVPMATRIX, _projectionViewWorldMatrix);
				this._owner._matWVP = this._projectionViewWorldMatrix;
			} else {
				//_shaderValues.setMatrix4x4(Sprite3D.MVPMATRIX, projectionView);
				this._owner._matWVP = projectionView;
			}
		}
		
		/**
		 * @inheritDoc
		 */
		//删除
		/*override*/  _destroy():void {
		
		}

	}

