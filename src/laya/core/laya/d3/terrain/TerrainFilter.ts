import { TerrainLeaf } from "././TerrainLeaf";
import { TerrainChunk } from "././TerrainChunk";
import { BufferState } from "../core/BufferState"
	import { Camera } from "../core/Camera"
	import { GeometryElement } from "../core/GeometryElement"
	import { BaseMaterial } from "../core/material/BaseMaterial"
	import { RenderState } from "../core/material/RenderState"
	import { TerrainMaterial } from "../core/material/TerrainMaterial"
	import { RenderElement } from "../core/render/RenderElement"
	import { RenderContext3D } from "../core/render/RenderContext3D"
	import { IndexBuffer3D } from "../graphics/IndexBuffer3D"
	import { VertexBuffer3D } from "../graphics/VertexBuffer3D"
	import { VertexDeclaration } from "../graphics/VertexDeclaration"
	import { VertexPositionTerrain } from "../graphics/Vertex/VertexPositionTerrain"
	import { BoundBox } from "../math/BoundBox"
	import { BoundSphere } from "../math/BoundSphere"
	import { Matrix4x4 } from "../math/Matrix4x4"
	import { Vector2 } from "../math/Vector2"
	import { Vector3 } from "../math/Vector3"
	import { EventDispatcher } from "laya/events/EventDispatcher"
	import { LayaGL } from "laya/layagl/LayaGL"
	import { Stat } from "laya/utils/Stat"
	import { WebGL } from "laya/webgl/WebGL"
	import { WebGLContext } from "laya/webgl/WebGLContext"
import { Terrain } from "./Terrain";
	
	/**
	 * <code>TerrainFilter</code> 类用于创建TerrainFilter过滤器。
	 */
	export class TerrainFilter extends GeometryElement {
		/** @private */
		 static _TEMP_ARRAY_BUFFER:Uint32Array = new Uint32Array(TerrainLeaf.CHUNK_GRID_NUM / TerrainLeaf.LEAF_GRID_NUM * TerrainLeaf.CHUNK_GRID_NUM / TerrainLeaf.LEAF_GRID_NUM);
		
		/**@private */
		private static _type:number = GeometryElement._typeCounter++;
		
		 _owner:TerrainChunk;
		 _gridSize:number;
		 memorySize:number;
		protected _numberVertices:number;
		protected _maxNumberIndices:number;
		protected _currentNumberIndices:number;
		protected _numberTriangle:number;
		protected _vertexBuffer:VertexBuffer3D;
		protected _indexBuffer:IndexBuffer3D;
		protected _bufferState:BufferState = new BufferState();
		protected _indexArrayBuffer:Uint16Array;
		 _boundingBoxCorners:Vector3[];
		private _leafs:TerrainLeaf[];
		private _leafNum:number;
		private _terrainHeightData:Float32Array;
		private _terrainHeightDataWidth:number;
		private _terrainHeightDataHeight:number;
		private _chunkOffsetX:number;
		private _chunkOffsetZ:number;
		private _cameraCoordinateInverse:boolean;
		private _cameraPos:Vector3;
		private _currentLOD:number;//LOD级别 4个叶子节点  第1个叶子的level<<24 + 第2个叶子的level<<16 + 第3个叶子的level<<8 + 第4个叶子的level
		private _perspectiveFactor:number;
		private _LODTolerance:number;
		
		/** @private */
		 _boundingSphere:BoundSphere;
		/** @private */
		 _boundingBox:BoundBox;
		
		/**
		 * 创建一个新的 <code>MeshFilter</code> 实例。
		 * @param owner 所属网格精灵。
		 */
		constructor(owner:TerrainChunk, chunkOffsetX:number, chunkOffsetZ:number, gridSize:number, terrainHeightData:Float32Array, heightDataWidth:number, heightDataHeight:number, cameraCoordinateInverse:boolean){
			super();
this._owner = owner;
			this._cameraPos = new Vector3();
			this._chunkOffsetX = chunkOffsetX;
			this._chunkOffsetZ = chunkOffsetZ;
			this._gridSize = gridSize;
			this._terrainHeightData = terrainHeightData;
			this._terrainHeightDataWidth = heightDataWidth;
			this._terrainHeightDataHeight = heightDataHeight;
			this._leafNum = (TerrainLeaf.CHUNK_GRID_NUM / TerrainLeaf.LEAF_GRID_NUM) * (TerrainLeaf.CHUNK_GRID_NUM / TerrainLeaf.LEAF_GRID_NUM);
			this._leafs = [];
			this._cameraCoordinateInverse = cameraCoordinateInverse;
			for (var i:number = 0; i < this._leafNum; i++) {
				this._leafs[i] = new TerrainLeaf();
			}
			this.recreateResource();
		}
		
		protected recreateResource():void {
			this._currentNumberIndices = 0;
			this._numberTriangle = 0;
			var nLeafVertexCount:number = TerrainLeaf.LEAF_VERTEXT_COUNT;
			var nLeafIndexCount:number = TerrainLeaf.LEAF_MAX_INDEX_COUNT;
			this._numberVertices = nLeafVertexCount * this._leafNum;
			this._maxNumberIndices = nLeafIndexCount * this._leafNum;
			this._indexArrayBuffer = new Uint16Array(this._maxNumberIndices);
			var vertexDeclaration:VertexDeclaration = VertexPositionTerrain.vertexDeclaration;
			var vertexFloatStride:number = vertexDeclaration.vertexStride / 4;
			var vertices:Float32Array = new Float32Array(this._numberVertices * vertexFloatStride);
			var nNum:number = TerrainLeaf.CHUNK_GRID_NUM / TerrainLeaf.LEAF_GRID_NUM;
			var i:number = 0, x:number = 0, z:number = 0;
			for (i = 0; i < this._leafNum; i++) {
				x = i % nNum;
				z = Math.floor(i / nNum);
				this._leafs[i].calcVertextBuffer(this._chunkOffsetX, this._chunkOffsetZ, x * TerrainLeaf.LEAF_GRID_NUM, z * TerrainLeaf.LEAF_GRID_NUM, this._gridSize, vertices, i * TerrainLeaf.LEAF_PLANE_VERTEXT_COUNT, vertexFloatStride, this._terrainHeightData, this._terrainHeightDataWidth, this._terrainHeightDataHeight, this._cameraCoordinateInverse);
			}
			for (i = 0; i < this._leafNum; i++) {
				x = i % nNum;
				z = Math.floor(i / nNum);
				this._leafs[i].calcSkirtVertextBuffer(this._chunkOffsetX, this._chunkOffsetZ, x * TerrainLeaf.LEAF_GRID_NUM, z * TerrainLeaf.LEAF_GRID_NUM, this._gridSize, vertices, this._leafNum * TerrainLeaf.LEAF_PLANE_VERTEXT_COUNT + i * TerrainLeaf.LEAF_SKIRT_VERTEXT_COUNT, vertexFloatStride, this._terrainHeightData, this._terrainHeightDataWidth, this._terrainHeightDataHeight);
			}
			this.assembleIndexInit();
			this._vertexBuffer = new VertexBuffer3D(vertexDeclaration.vertexStride * this._numberVertices, WebGLContext.STATIC_DRAW, false);
			this._vertexBuffer.vertexDeclaration = vertexDeclaration;
			this._indexBuffer = new IndexBuffer3D(IndexBuffer3D.INDEXTYPE_USHORT, this._maxNumberIndices, WebGLContext.STATIC_DRAW, false);
			this._vertexBuffer.setData(vertices);
			this._indexBuffer.setData(this._indexArrayBuffer);
			this.memorySize = (this._vertexBuffer._byteLength + this._indexBuffer._byteLength) * 2;//修改占用内存,upload()到GPU后CPU中和GPU中各占一份内存
			this.calcOriginalBoudingBoxAndSphere();
			
			this._bufferState.bind();
			this._bufferState.applyVertexBuffer(this._vertexBuffer);
			this._bufferState.applyIndexBuffer(this._indexBuffer);
			this._bufferState.unBind();
		}
		
		private setLODLevel(leafsLODLevel:Uint32Array):boolean {
			if (leafsLODLevel.length != 4) return true;
			var nLOD:number = ((leafsLODLevel[0] + 1) << 24) + ((leafsLODLevel[1] + 1) << 16) + ((leafsLODLevel[2] + 1) << 8) + (leafsLODLevel[3] + 1);
			if (this._currentLOD == nLOD) {
				return false;
			}
			this._currentLOD = nLOD;
			return true;
		}
		
		protected assembleIndexInit():void {
			this._currentNumberIndices = 0;
			this._numberTriangle = 0;
			var nOffsetIndex:number = 0;
			for (var i:number = 0; i < this._leafNum; i++) {
				var planeLODIndex:Uint16Array = TerrainLeaf.getPlaneLODIndex(i, 0);
				this._indexArrayBuffer.set(planeLODIndex, nOffsetIndex);
				nOffsetIndex += planeLODIndex.length;
				var skirtLODIndex:Uint16Array = TerrainLeaf.getSkirtLODIndex(i, 0);
				this._indexArrayBuffer.set(skirtLODIndex, nOffsetIndex);
				nOffsetIndex += skirtLODIndex.length;
				this._currentNumberIndices += (planeLODIndex.length + skirtLODIndex.length);
			}
			
			this._numberTriangle = this._currentNumberIndices / 3;
		}
		
		protected isNeedAssemble(camera:Camera, cameraPostion:Vector3):number {
			//TODO是否可以存储到摄影机中
			var perspectiveFactor:number = Math.min(camera.viewport.width, camera.viewport.height) / (2 * Math.tan(Math.PI * camera.fieldOfView / 180.0));
			if (this._perspectiveFactor != perspectiveFactor) {
				this._perspectiveFactor = perspectiveFactor;
				return 1;
			}
			if (this._LODTolerance != Terrain.LOD_TOLERANCE_VALUE) {
				this._LODTolerance = Terrain.LOD_TOLERANCE_VALUE;
				return 1;
			}
			if (Vector3.equals(cameraPostion, this._cameraPos) == false) {
				this._cameraPos.x = cameraPostion.x;
				this._cameraPos.y = cameraPostion.y;
				this._cameraPos.z = cameraPostion.z;
				return 2;
			}
			return 0;
		}
		
		protected assembleIndex(camera:Camera, cameraPostion:Vector3):boolean {
			var nNeedType:number = this.isNeedAssemble(camera, cameraPostion);
			if (nNeedType > 0) {
				for (var i:number = 0; i < this._leafNum; i++) {
					TerrainFilter._TEMP_ARRAY_BUFFER[i] = this._leafs[i].determineLod(cameraPostion, this._perspectiveFactor, Terrain.LOD_TOLERANCE_VALUE, nNeedType == 1);
				}
				if (this.setLODLevel(TerrainFilter._TEMP_ARRAY_BUFFER)) {
					this._currentNumberIndices = 0;
					this._numberTriangle = 0;
					var nOffsetIndex:number = 0;
					for (i = 0; i < this._leafNum; i++) {
						var nLODLevel:number = TerrainFilter._TEMP_ARRAY_BUFFER[i];
						var planeLODIndex:Uint16Array = TerrainLeaf.getPlaneLODIndex(i, nLODLevel);
						this._indexArrayBuffer.set(planeLODIndex, nOffsetIndex);
						nOffsetIndex += planeLODIndex.length;
						var skirtLODIndex:Uint16Array = TerrainLeaf.getSkirtLODIndex(i, nLODLevel);
						this._indexArrayBuffer.set(skirtLODIndex, nOffsetIndex);
						nOffsetIndex += skirtLODIndex.length;
						this._currentNumberIndices += (planeLODIndex.length + skirtLODIndex.length);
					}
					this._numberTriangle = this._currentNumberIndices / 3;
					return true;
				}
			}
			return false;
		}
		
		 calcOriginalBoudingBoxAndSphere():void {
			var sizeOfY:Vector2 = new Vector2(2147483647, -2147483647);
			for (var i:number = 0; i < this._leafNum; i++) {
				sizeOfY.x = this._leafs[i]._sizeOfY.x < sizeOfY.x ? this._leafs[i]._sizeOfY.x : sizeOfY.x;
				sizeOfY.y = this._leafs[i]._sizeOfY.y > sizeOfY.y ? this._leafs[i]._sizeOfY.y : sizeOfY.y;
			}
			var min:Vector3 = new Vector3(this._chunkOffsetX * TerrainLeaf.CHUNK_GRID_NUM * this._gridSize, sizeOfY.x, this._chunkOffsetZ * TerrainLeaf.CHUNK_GRID_NUM * this._gridSize);
			var max:Vector3 = new Vector3((this._chunkOffsetX + 1) * TerrainLeaf.CHUNK_GRID_NUM * this._gridSize, sizeOfY.y, (this._chunkOffsetZ + 1) * TerrainLeaf.CHUNK_GRID_NUM * this._gridSize);
			if (TerrainLeaf.__ADAPT_MATRIX__) {
				Vector3.transformV3ToV3(min, TerrainLeaf.__ADAPT_MATRIX__, min);
				Vector3.transformV3ToV3(max, TerrainLeaf.__ADAPT_MATRIX__, max);
			}
			this._boundingBox = new BoundBox(min, max);
			var size:Vector3 = new Vector3();
			Vector3.subtract(max, min, size);
			Vector3.scale(size, 0.5, size);
			var center:Vector3 = new Vector3();
			Vector3.add(min, size, center);
			this._boundingSphere = new BoundSphere(center, Vector3.scalarLength(size));
			this._boundingBoxCorners = [];
			this._boundingBox.getCorners(this._boundingBoxCorners);
		}
		
		 calcLeafBoudingBox(worldMatrix:Matrix4x4):void {
			for (var i:number = 0; i < this._leafNum; i++) {
				this._leafs[i].calcLeafBoudingBox(worldMatrix);
			}
		}
		
		 calcLeafBoudingSphere(worldMatrix:Matrix4x4, maxScale:number):void {
			for (var i:number = 0; i < this._leafNum; i++) {
				this._leafs[i].calcLeafBoudingSphere(worldMatrix, maxScale);
			}
		}
		
		 _getVertexBuffer(index:number = 0):VertexBuffer3D {
			if (index == 0) {
				return this._vertexBuffer;
			}
			return null;
		}
		
		 _getIndexBuffer():IndexBuffer3D {
			return this._indexBuffer;
		}
		
		/**
		 * @inheritDoc
		 */
		/*override*/  _getType():number {
			return TerrainFilter._type;
		}
		
		/**
		 * @inheritDoc
		 */
		/*override*/  _prepareRender(state:RenderContext3D):boolean {
			//TODO:
			//var terrainMaterial:TerrainMaterial = state.renderElement.material as TerrainMaterial;
			//if (terrainMaterial.getRenderState(0).blend == RenderState.BLEND_DISABLE) {
				//var camera:Camera = state.camera as Camera;
				//if (assembleIndex(camera, camera.transform.position)) {
					//_indexBuffer.setData(_indexArrayBuffer);
				//}
			//}
			return true;
		}
		
		/**
		 * @inheritDoc
		 */
		/*override*/  _render(state:RenderContext3D):void {
			this._bufferState.bind();
			/*
			   //绘制第二遍的时候，如果DEPTHFUNC_LEQUAL有bug，就可以用这种偏移的方式
			   if ( (state.renderElement._material as TerrainMaterial).renderMode == TerrainMaterial.RENDERMODE_TRANSPARENT )
			   {
			   WebGL.mainContext.enable( WebGLContext.POLYGON_OFFSET_FILL );
			   WebGL.mainContext.polygonOffset(-1,0);
			   }
			   else
			   {
			   WebGL.mainContext.disable( WebGLContext.POLYGON_OFFSET_FILL );
			   }
			 */
			LayaGL.instance.drawElements(Terrain.RENDER_LINE_MODEL ? WebGLContext.LINES : WebGLContext.TRIANGLES, this._currentNumberIndices, WebGLContext.UNSIGNED_SHORT, 0);
			Stat.trianglesFaces += this._numberTriangle;
			Stat.renderBatches++;
		}
		
		/**
		 * @inheritDoc
		 */
		/*override*/  destroy():void {
			this._owner = null;
			this._bufferState.destroy();
			if (this._vertexBuffer) this._vertexBuffer.destroy();
			if (this._indexBuffer) this._indexBuffer.destroy();
		}
	}

