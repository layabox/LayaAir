import { MeshFilter } from "laya/d3/core/MeshFilter"
	import { MeshSprite3D } from "laya/d3/core/MeshSprite3D"
	import { RenderableSprite3D } from "laya/d3/core/RenderableSprite3D"
	import { Sprite3D } from "laya/d3/core/Sprite3D"
	import { Transform3D } from "laya/d3/core/Transform3D"
	import { BaseRender } from "laya/d3/core/render/BaseRender"
	import { RenderContext3D } from "laya/d3/core/render/RenderContext3D"
	import { BoundBox } from "laya/d3/math/BoundBox"
	import { BoundFrustum } from "laya/d3/math/BoundFrustum"
	import { BoundSphere } from "laya/d3/math/BoundSphere"
	import { Matrix4x4 } from "laya/d3/math/Matrix4x4"
	import { Vector3 } from "laya/d3/math/Vector3"
	import { Mesh } from "laya/d3/resource/models/Mesh"
import { SimpleShapeSprite3D } from "./SimpleShapeSprite3D";

	export class SimpleShapeRenderer extends BaseRender {
		 boundsph:BoundSphere = new BoundSphere(new Vector3(), 1.0);
		protected _projectionViewWorldMatrix:Matrix4x4;
		constructor(owner:RenderableSprite3D){
			super(owner, 4);
			this._projectionViewWorldMatrix = new Matrix4x4();
		}
		private _onMeshChanged(meshFilter:MeshFilter, oldMesh:Mesh, mesh:Mesh):void {
			this._onMeshLoaed();
		}
		
		private _onMeshLoaed():void {
			//_boundingSphereNeedChange = true;
			//_boundingBoxNeedChange = true;
			//_boundingBoxCenterNeedChange = true;
			//_octreeNodeNeedChange = true;
		}
		
		/**
		 * @private
		 */
		//计算包围盒根据原始包围盒
		protected _calculateBoundBoxByInitCorners(corners:Vector3[]):void {
			var worldMat:Matrix4x4 = ((<MeshSprite3D>this._owner )).transform.worldMatrix;
			//for (var i:int = 0; i < 8; i++)
				//BoundBox.createfromPoints(_tempBoundBoxCorners, _boundingBox);
			Vector3.transformCoordinate(corners[this.i], worldMat, BaseRender._tempBoundBoxCorners[this.i]);
		}
		
		/**
		 * @inheritDoc
		 */
		//计算球包围盒
		/*override*/ protected _calculateBoundingSphere():void {
			var boundSphere:BoundSphere = ((<SimpleShapeSprite3D>this._owner ))._simpleShapeMesh.boundSphere;
			var maxScale:number;
			var transform:Transform3D = this._owner.transform;
			var scaleE:Float32Array = transform.scale.elements;
			var scaleX:number = scaleE[0];
			scaleX || (scaleX = -scaleX);
			var scaleY:number = scaleE[1];
			scaleY || (scaleY = -scaleY);
			var scaleZ:number = scaleE[2];
			scaleZ || (scaleZ = -scaleZ);
			
			if (scaleX >= scaleY && scaleX >= scaleZ)
				maxScale = scaleX;
			else
				maxScale = scaleY >= scaleZ ? scaleY : scaleZ;
			//Vector3.transformCoordinate(boundSphere.center, transform.worldMatrix, _boundingSphere.center);
			//_boundingSphere.radius = boundSphere.radius * maxScale;
		}
		
		/**
		 * @inheritDoc
		 */
		//计算Box包围盒
		/*override*/ protected _calculateBoundingBox():void {
			var sharedMesh:Mesh = ((<MeshSprite3D>this._owner )).meshFilter.sharedMesh;
			if (sharedMesh == null || sharedMesh.boundingBox == null){}
				//_boundingBox.toDefault();
			else
				this._calculateBoundBoxByInitCorners(sharedMesh.boundingBoxCorners);
		}
		
		/**
		 * @inheritDoc
		 */
		//判断是否需要渲染
		/*override*/  _needRender(boundFrustum:BoundFrustum):boolean {
			//if (boundFrustum)
			////？？
			//return boundFrustum.containsBoundSphere(boundingSphere) !== ContainmentType.Disjoint;
			//else
			//return true;
			return true;
		}
		
		/**
		 * @inheritDoc
		 */
		//更新模型位置
		/*override*/  _renderUpdate(context:RenderContext3D, transform:Transform3D):void {
			if (transform)
				this._shaderValues.setMatrix4x4(Sprite3D.WORLDMATRIX, transform.worldMatrix);
			else
				this._shaderValues.setMatrix4x4(Sprite3D.WORLDMATRIX, Matrix4x4.DEFAULT);
		}
		
		/**
		 * @inheritDoc
		 */
		//更新模型照相机位置
		/*override*/  _renderUpdateWithCamera(context:RenderContext3D, transform:Transform3D):void {
			var projectionView:Matrix4x4 = context.projectionViewMatrix;
			if (transform) {
				Matrix4x4.multiply(projectionView, transform.worldMatrix, this._projectionViewWorldMatrix);
				this._shaderValues.setMatrix4x4(Sprite3D.MVPMATRIX, this._projectionViewWorldMatrix);
			} else {
				this._shaderValues.setMatrix4x4(Sprite3D.MVPMATRIX, projectionView);
			}
			//if (Laya3D.debugMode)
				//_renderRenderableBoundBox();
		}
		
		/**
		 * @inheritDoc
		 */
		//删除
		/*override*/  _destroy():void {
		
		}

	}

