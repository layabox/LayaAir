import { BaseRender } from "../core/render/BaseRender"
	import { BoundBox } from "../math/BoundBox"
	import { BoundSphere } from "../math/BoundSphere"
	import { Matrix4x4 } from "../math/Matrix4x4"
	import { Vector2 } from "../math/Vector2"
	import { Vector3 } from "../math/Vector3"
	
	/**
	 * <code>TerrainLeaf</code> Terrain的叶子节点
	 */
	export class TerrainLeaf {
		 static CHUNK_GRID_NUM:number = 64;
		 static LEAF_GRID_NUM:number = 32;
		
		 static LEAF_PLANE_VERTEXT_COUNT:number = (TerrainLeaf.LEAF_GRID_NUM + 1) * (TerrainLeaf.LEAF_GRID_NUM + 1);
		 static LEAF_SKIRT_VERTEXT_COUNT:number = (TerrainLeaf.LEAF_GRID_NUM + 1) * 2 * 4;
		 static LEAF_VERTEXT_COUNT:number = TerrainLeaf.LEAF_PLANE_VERTEXT_COUNT + TerrainLeaf.LEAF_SKIRT_VERTEXT_COUNT;
		
		 static LEAF_PLANE_MAX_INDEX_COUNT:number = TerrainLeaf.LEAF_GRID_NUM * TerrainLeaf.LEAF_GRID_NUM * 6;
		 static LEAF_SKIRT_MAX_INDEX_COUNT:number = TerrainLeaf.LEAF_GRID_NUM * 4 * 6;
		 static LEAF_MAX_INDEX_COUNT:number = TerrainLeaf.LEAF_PLANE_MAX_INDEX_COUNT + TerrainLeaf.LEAF_SKIRT_MAX_INDEX_COUNT;
		
		 static __ADAPT_MATRIX__:Matrix4x4;
		 static __ADAPT_MATRIX_INV__:Matrix4x4;
		 static __VECTOR3__:Vector3 = new Vector3();
		
		private static _maxLODLevel:number = Math.log2(TerrainLeaf.LEAF_GRID_NUM);
		private static _planeLODIndex:any[];
		private static _skirtLODIndex:any[];
		private static _bInit:boolean = false;
		
		 _boundingSphere:BoundSphere;
		 _boundingBox:BoundBox;
		 _sizeOfY:Vector2;
		 _currentLODLevel:number;
		private _lastDistanceToEye:number;
		private _originalBoundingSphere:BoundSphere;
		private _originalBoundingBox:BoundBox;
		private _originalBoundingBoxCorners:Vector3[];
		private _bUseStrip:boolean = false;
		private _gridSize:number;
		private _beginGridX:number;//针对整个大地形的偏移
		private _beginGridZ:number;//针对整个大地形的偏移
		private _LODError:Float32Array;
		
		 static __init__():void {
			if (!TerrainLeaf._bInit) {
				var nLeafNum:number = (TerrainLeaf.CHUNK_GRID_NUM / TerrainLeaf.LEAF_GRID_NUM) * (TerrainLeaf.CHUNK_GRID_NUM / TerrainLeaf.LEAF_GRID_NUM);
				//plane的LODIndex
				TerrainLeaf._planeLODIndex = [];
				var i:number = 0, j:number = 0, k:number = 0, n:number = 0, n1:number = 0, nOffset:number = 0;
				var nOriginIndexArray:Uint16Array = null, nTempIndex:Uint16Array = null;
				for (i = 0; i < nLeafNum; i++) {
					TerrainLeaf._planeLODIndex[i] = [];
				}
				for (i = 0, n = TerrainLeaf._maxLODLevel + 1; i < n; i++) {
					TerrainLeaf._planeLODIndex[0][i] = TerrainLeaf.calcPlaneLODIndex(i);
				}
				for (i = 1; i < nLeafNum; i++) {
					nOffset = i * TerrainLeaf.LEAF_PLANE_VERTEXT_COUNT;
					for (j = 0, n1 = TerrainLeaf._maxLODLevel + 1; j < n1; j++) {
						nOriginIndexArray = TerrainLeaf._planeLODIndex[0][j];
						nTempIndex = new Uint16Array(nOriginIndexArray.length);
						for (k = 0; k < nOriginIndexArray.length; k++) {
							nTempIndex[k] = nOriginIndexArray[k] + nOffset;
						}
						TerrainLeaf._planeLODIndex[i][j] = nTempIndex;
					}
				}
				//skirt的LODIndex
				TerrainLeaf._skirtLODIndex = [];
				for (i = 0; i < nLeafNum; i++) {
					TerrainLeaf._skirtLODIndex[i] = [];
				}
				for (i = 0, n = TerrainLeaf._maxLODLevel + 1; i < n; i++) {
					TerrainLeaf._skirtLODIndex[0][i] = TerrainLeaf.calcSkirtLODIndex(i);
				}
				for (i = 1; i < nLeafNum; i++) {
					nOffset = i * TerrainLeaf.LEAF_SKIRT_VERTEXT_COUNT;
					for (j = 0, n1 = TerrainLeaf._maxLODLevel + 1; j < n1; j++) {
						nOriginIndexArray = TerrainLeaf._skirtLODIndex[0][j];
						nTempIndex = new Uint16Array(nOriginIndexArray.length);
						for (k = 0; k < nOriginIndexArray.length; k++) {
							nTempIndex[k] = nOriginIndexArray[k] + nOffset;
						}
						TerrainLeaf._skirtLODIndex[i][j] = nTempIndex;
					}
				}
				TerrainLeaf._bInit = true;
			}
		}
		
		 static getPlaneLODIndex(leafIndex:number, LODLevel:number):Uint16Array {
			return TerrainLeaf._planeLODIndex[leafIndex][LODLevel];
		}
		
		 static getSkirtLODIndex(leafIndex:number, LODLevel:number):Uint16Array {
			return TerrainLeaf._skirtLODIndex[leafIndex][LODLevel];
		}
		
		private static calcPlaneLODIndex(level:number):Uint16Array {
			if (level > TerrainLeaf._maxLODLevel) level = TerrainLeaf._maxLODLevel;
			var nGridNumAddOne:number = TerrainLeaf.LEAF_GRID_NUM + 1;
			var nNum:number = 0;
			var indexBuffer:Uint16Array = null;
			var nLODGridNum:number = TerrainLeaf.LEAF_GRID_NUM / Math.pow(2, level);
			indexBuffer = new Uint16Array(nLODGridNum * nLODGridNum * 6);
			var nGridSpace:number = TerrainLeaf.LEAF_GRID_NUM / nLODGridNum;
			for (var i:number = 0; i < TerrainLeaf.LEAF_GRID_NUM; i += nGridSpace) {
				for (var j:number = 0; j < TerrainLeaf.LEAF_GRID_NUM; j += nGridSpace) {
					indexBuffer[nNum] = (i + nGridSpace) * nGridNumAddOne + j;
					nNum++;
					indexBuffer[nNum] = i * nGridNumAddOne + j;
					nNum++;
					indexBuffer[nNum] = i * nGridNumAddOne + j + nGridSpace;
					nNum++;
					indexBuffer[nNum] = i * nGridNumAddOne + j + nGridSpace;
					nNum++;
					indexBuffer[nNum] = (i + nGridSpace) * nGridNumAddOne + j + nGridSpace;
					nNum++;
					indexBuffer[nNum] = (i + nGridSpace) * nGridNumAddOne + j;
					nNum++;
				}
			}
			return indexBuffer;
		}
		
		private static calcSkirtLODIndex(level:number):Uint16Array {
			if (level > TerrainLeaf._maxLODLevel) level = TerrainLeaf._maxLODLevel;
			//裙边顶点总的偏移
			var nSkirtIndexOffset:number = (TerrainLeaf.CHUNK_GRID_NUM / TerrainLeaf.LEAF_GRID_NUM) * (TerrainLeaf.CHUNK_GRID_NUM / TerrainLeaf.LEAF_GRID_NUM) * TerrainLeaf.LEAF_PLANE_VERTEXT_COUNT;
			var nGridNumAddOne:number = TerrainLeaf.LEAF_GRID_NUM + 1;
			var nNum:number = 0;
			var indexBuffer:Uint16Array = null;
			var nLODGridNum:number = TerrainLeaf.LEAF_GRID_NUM / Math.pow(2, level);
			indexBuffer = new Uint16Array(nLODGridNum * 4 * 6);
			var nGridSpace:number = TerrainLeaf.LEAF_GRID_NUM / nLODGridNum;
			for (var j:number = 0; j < 4; j++) {
				for (var i:number = 0; i < TerrainLeaf.LEAF_GRID_NUM; i += nGridSpace) {
					indexBuffer[nNum] = nSkirtIndexOffset + nGridNumAddOne + i;
					nNum++;
					indexBuffer[nNum] = nSkirtIndexOffset + i;
					nNum++;
					indexBuffer[nNum] = nSkirtIndexOffset + i + nGridSpace;
					nNum++;
					
					indexBuffer[nNum] = nSkirtIndexOffset + i + nGridSpace;
					nNum++;
					indexBuffer[nNum] = nSkirtIndexOffset + nGridNumAddOne + i + nGridSpace;
					nNum++;
					indexBuffer[nNum] = nSkirtIndexOffset + nGridNumAddOne + i;
					nNum++;
				}
				nSkirtIndexOffset += nGridNumAddOne * 2;
			}
			return indexBuffer;
		}
		
		 static getHeightFromTerrainHeightData(x:number, z:number, terrainHeightData:Float32Array, heighDataWidth:number, heightDataHeight:number):number {
			x = x < 0 ? 0 : x;
			x = (x >= heighDataWidth) ? heighDataWidth - 1 : x;
			z = z < 0 ? 0 : z;
			z = (z >= heightDataHeight) ? heightDataHeight - 1 : z;
			return terrainHeightData[z * heighDataWidth + x];
		}
		
		/**
		 * 创建一个新的 <code>TerrainLeaf</code> 实例。
		 * @param owner 地形的叶子。
		 */
		constructor(){
			TerrainLeaf.__init__();
			this._currentLODLevel = 0;
		}
		
		 calcVertextNorml(x:number, z:number, terrainHeightData:Float32Array, heighDataWidth:number, heightDataHeight:number, normal:Vector3):void {
			var dZ:number = 0, dX:number = 0;
			dX = TerrainLeaf.getHeightFromTerrainHeightData(x - 1, z - 1, terrainHeightData, heighDataWidth, heightDataHeight) * -1.0;
			dX += TerrainLeaf.getHeightFromTerrainHeightData(x - 1, z, terrainHeightData, heighDataWidth, heightDataHeight) * -1.0;
			dX += TerrainLeaf.getHeightFromTerrainHeightData(x - 1, z + 1, terrainHeightData, heighDataWidth, heightDataHeight) * -1.0;
			dX += TerrainLeaf.getHeightFromTerrainHeightData(x + 1, z - 1, terrainHeightData, heighDataWidth, heightDataHeight) * 1.0;
			dX += TerrainLeaf.getHeightFromTerrainHeightData(x + 1, z, terrainHeightData, heighDataWidth, heightDataHeight) * 1.0;
			dX += TerrainLeaf.getHeightFromTerrainHeightData(x + 1, z + 1, terrainHeightData, heighDataWidth, heightDataHeight) * 1.0;
			
			dZ = TerrainLeaf.getHeightFromTerrainHeightData(x - 1, z - 1, terrainHeightData, heighDataWidth, heightDataHeight) * -1.0;
			dZ += TerrainLeaf.getHeightFromTerrainHeightData(x, z - 1, terrainHeightData, heighDataWidth, heightDataHeight) * -1.0;
			dZ += TerrainLeaf.getHeightFromTerrainHeightData(x + 1, z - 1, terrainHeightData, heighDataWidth, heightDataHeight) * -1.0;
			dZ += TerrainLeaf.getHeightFromTerrainHeightData(x - 1, z + 1, terrainHeightData, heighDataWidth, heightDataHeight) * 1.0;
			dZ += TerrainLeaf.getHeightFromTerrainHeightData(x, z + 1, terrainHeightData, heighDataWidth, heightDataHeight) * 1.0;
			dZ += TerrainLeaf.getHeightFromTerrainHeightData(x + 1, z + 1, terrainHeightData, heighDataWidth, heightDataHeight) * 1.0;
			
			normal.x = -dX;
			normal.y = 6;
			normal.z = -dZ;
			Vector3.normalize(normal, normal);
		}
		
		 calcVertextNormlUV(x:number, z:number, terrainWidth:number, terrainHeight:number, normal:Vector3):void {
			normal.x = x / terrainWidth;
			normal.y = z / terrainHeight;
			normal.z = z / terrainHeight;
		}
		
		 calcVertextBuffer(offsetChunkX:number, offsetChunkZ:number, beginX:number, beginZ:number, girdSize:number, vertextBuffer:Float32Array, offset:number, strideSize:number, terrainHeightData:Float32Array, heighDataWidth:number, heightDataHeight:number, cameraCoordinateInverse:boolean):void {
			if (cameraCoordinateInverse == true && !TerrainLeaf.__ADAPT_MATRIX__) {
				TerrainLeaf.__ADAPT_MATRIX__ = new Matrix4x4();
				var mat:Matrix4x4 = new Matrix4x4();
				Matrix4x4.createRotationY(Math.PI, TerrainLeaf.__ADAPT_MATRIX__);
				Matrix4x4.createTranslate(new Vector3(0, 0, (heightDataHeight - 1) * girdSize), mat);
				Matrix4x4.multiply(mat, TerrainLeaf.__ADAPT_MATRIX__, TerrainLeaf.__ADAPT_MATRIX__);
				TerrainLeaf.__ADAPT_MATRIX_INV__ = new Matrix4x4();
				TerrainLeaf.__ADAPT_MATRIX__.invert(TerrainLeaf.__ADAPT_MATRIX_INV__);
			}
			this._gridSize = girdSize;
			this._beginGridX = offsetChunkX * TerrainLeaf.CHUNK_GRID_NUM + beginX;
			this._beginGridZ = offsetChunkZ * TerrainLeaf.CHUNK_GRID_NUM + beginZ;
			var nNum:number = offset * strideSize;
			var minY:number = 2147483647;
			var maxY:number = -2147483648;
			var normal:Vector3 = new Vector3();
			for (var i:number = 0, s:number = TerrainLeaf.LEAF_GRID_NUM + 1; i < s; i++) {
				for (var j:number = 0, s1:number = TerrainLeaf.LEAF_GRID_NUM + 1; j < s1; j++) {
					TerrainLeaf.__VECTOR3__.x = (this._beginGridX + j) * this._gridSize;
					TerrainLeaf.__VECTOR3__.z = (this._beginGridZ + i) * this._gridSize;
					TerrainLeaf.__VECTOR3__.y = terrainHeightData[(this._beginGridZ + i) * (heighDataWidth) + (this._beginGridX + j)];
					minY = TerrainLeaf.__VECTOR3__.y < minY ? TerrainLeaf.__VECTOR3__.y : minY;
					maxY = TerrainLeaf.__VECTOR3__.y > maxY ? TerrainLeaf.__VECTOR3__.y : maxY;
					if (TerrainLeaf.__ADAPT_MATRIX__) {
						Vector3.transformV3ToV3(TerrainLeaf.__VECTOR3__, TerrainLeaf.__ADAPT_MATRIX__, TerrainLeaf.__VECTOR3__);
					}
					vertextBuffer[nNum] = TerrainLeaf.__VECTOR3__.x;
					nNum++;
					vertextBuffer[nNum] = TerrainLeaf.__VECTOR3__.y;
					nNum++;
					vertextBuffer[nNum] = TerrainLeaf.__VECTOR3__.z;
					nNum++;
					//计算norma的UV
					this.calcVertextNormlUV(this._beginGridX + j, this._beginGridZ + i, heighDataWidth, heightDataHeight, normal);
					//给顶点赋值
					vertextBuffer[nNum] = normal.x;
					nNum++;
					vertextBuffer[nNum] = normal.y;
					nNum++;
					vertextBuffer[nNum] = normal.z;
					nNum++;
					vertextBuffer[nNum] = (beginX + j) / TerrainLeaf.CHUNK_GRID_NUM;
					nNum++;
					vertextBuffer[nNum] = (beginZ + i) / TerrainLeaf.CHUNK_GRID_NUM;
					nNum++;
					vertextBuffer[nNum] = this._beginGridX + j;
					nNum++;
					vertextBuffer[nNum] = this._beginGridZ + i;
					nNum++;
				}
			}
			this._sizeOfY = new Vector2(minY - 1, maxY + 1);
			this.calcLODErrors(terrainHeightData, heighDataWidth, heightDataHeight);
			this.calcOriginalBoudingBoxAndSphere();
		}
		
		 calcSkirtVertextBuffer(offsetChunkX:number, offsetChunkZ:number, beginX:number, beginZ:number, girdSize:number, vertextBuffer:Float32Array, offset:number, strideSize:number, terrainHeightData:Float32Array, heighDataWidth:number, heightDataHeight:number):void {
			this._gridSize = girdSize;
			this._beginGridX = offsetChunkX * TerrainLeaf.CHUNK_GRID_NUM + beginX;
			this._beginGridZ = offsetChunkZ * TerrainLeaf.CHUNK_GRID_NUM + beginZ;
			var nNum:number = offset * strideSize;
			var i:number = 0, j:number = 0, s:number = TerrainLeaf.LEAF_GRID_NUM + 1;
			var normal:Vector3 = new Vector3();
			var hZIndex:number = 0;
			var hXIndex:number = 0;
			var h:number = 0;
			var zh:number = 0;
			var xh:number = 0;
			//上
			for (i = 0; i < 2; i++) {
				for (j = 0; j < s; j++) {
					TerrainLeaf.__VECTOR3__.x = (this._beginGridX + j) * this._gridSize;
					TerrainLeaf.__VECTOR3__.y = (i == 1 ? terrainHeightData[this._beginGridZ * heighDataWidth + (this._beginGridX + j)] : -this._gridSize);
					TerrainLeaf.__VECTOR3__.z = (this._beginGridZ + 0) * this._gridSize;
					if (TerrainLeaf.__ADAPT_MATRIX__) {
						Vector3.transformV3ToV3(TerrainLeaf.__VECTOR3__, TerrainLeaf.__ADAPT_MATRIX__, TerrainLeaf.__VECTOR3__);
					}
					vertextBuffer[nNum] = TerrainLeaf.__VECTOR3__.x;
					nNum++;
					vertextBuffer[nNum] = TerrainLeaf.__VECTOR3__.y;
					nNum++;
					vertextBuffer[nNum] = TerrainLeaf.__VECTOR3__.z;
					nNum++;
					//计算法线
					if (i == 0) {
						hZIndex = (this._beginGridZ - 1);
					} else {
						hZIndex = this._beginGridZ;
					}
					this.calcVertextNormlUV(this._beginGridX + j, hZIndex, heighDataWidth, heightDataHeight, normal);
					
					//给顶点赋值
					vertextBuffer[nNum] = normal.x;
					nNum++;
					vertextBuffer[nNum] = normal.y;
					nNum++;
					vertextBuffer[nNum] = normal.z;
					nNum++;
					vertextBuffer[nNum] = (beginX + j) / TerrainLeaf.CHUNK_GRID_NUM;
					nNum++;
					vertextBuffer[nNum] = (beginZ + 0) / TerrainLeaf.CHUNK_GRID_NUM;
					nNum++;
					vertextBuffer[nNum] = this._beginGridX + j;
					nNum++;
					vertextBuffer[nNum] = hZIndex;
					nNum++;
				}
			}
			//下
			for (i = 0; i < 2; i++) {
				for (j = 0; j < s; j++) {
					TerrainLeaf.__VECTOR3__.x = (this._beginGridX + j) * this._gridSize;
					TerrainLeaf.__VECTOR3__.y = (i == 0 ? terrainHeightData[(this._beginGridZ + TerrainLeaf.LEAF_GRID_NUM) * (heighDataWidth) + (this._beginGridX + j)] : -this._gridSize);
					TerrainLeaf.__VECTOR3__.z = (this._beginGridZ + TerrainLeaf.LEAF_GRID_NUM) * this._gridSize;
					if (TerrainLeaf.__ADAPT_MATRIX__) {
						Vector3.transformV3ToV3(TerrainLeaf.__VECTOR3__, TerrainLeaf.__ADAPT_MATRIX__, TerrainLeaf.__VECTOR3__);
					}
					vertextBuffer[nNum] = TerrainLeaf.__VECTOR3__.x;
					nNum++;
					vertextBuffer[nNum] = TerrainLeaf.__VECTOR3__.y;
					nNum++;
					vertextBuffer[nNum] = TerrainLeaf.__VECTOR3__.z;
					nNum++;
					
					//计算法线
					if (i == 0) {
						hZIndex = this._beginGridZ + TerrainLeaf.LEAF_GRID_NUM;
					} else {
						hZIndex = (this._beginGridZ + TerrainLeaf.LEAF_GRID_NUM + 1);
					}
					this.calcVertextNormlUV(this._beginGridX + j, hZIndex, heighDataWidth, heightDataHeight, normal);
					
					//给顶点赋值
					vertextBuffer[nNum] = normal.x;
					nNum++;
					vertextBuffer[nNum] = normal.y;
					nNum++;
					vertextBuffer[nNum] = normal.z;
					nNum++;
					vertextBuffer[nNum] = (beginX + j) / TerrainLeaf.CHUNK_GRID_NUM;
					nNum++;
					vertextBuffer[nNum] = (beginZ + TerrainLeaf.LEAF_GRID_NUM) / TerrainLeaf.CHUNK_GRID_NUM;
					nNum++;
					vertextBuffer[nNum] = this._beginGridX + j;
					nNum++;
					vertextBuffer[nNum] = hZIndex;
					nNum++;
				}
			}
			//左
			for (i = 0; i < 2; i++) {
				for (j = 0; j < s; j++) {
					TerrainLeaf.__VECTOR3__.x = (this._beginGridX + 0) * this._gridSize;
					TerrainLeaf.__VECTOR3__.y = (i == 0 ? terrainHeightData[(this._beginGridZ + j) * (heighDataWidth) + (this._beginGridX + 0)] : -this._gridSize);
					TerrainLeaf.__VECTOR3__.z = (this._beginGridZ + j) * this._gridSize;
					if (TerrainLeaf.__ADAPT_MATRIX__) {
						Vector3.transformV3ToV3(TerrainLeaf.__VECTOR3__, TerrainLeaf.__ADAPT_MATRIX__, TerrainLeaf.__VECTOR3__);
					}
					vertextBuffer[nNum] = TerrainLeaf.__VECTOR3__.x;
					nNum++;
					vertextBuffer[nNum] = TerrainLeaf.__VECTOR3__.y;
					nNum++;
					vertextBuffer[nNum] = TerrainLeaf.__VECTOR3__.z;
					nNum++;
					
					//计算法线
					if (i == 0) {
						hXIndex = this._beginGridX;
					} else {
						hXIndex = (this._beginGridX - 1);
					}
					this.calcVertextNormlUV(hXIndex, this._beginGridZ + j, heighDataWidth, heightDataHeight, normal);
					
					//给顶点赋值
					vertextBuffer[nNum] = normal.x;
					nNum++;
					vertextBuffer[nNum] = normal.y;
					nNum++;
					vertextBuffer[nNum] = normal.z;
					nNum++;
					vertextBuffer[nNum] = (beginX + 0) / TerrainLeaf.CHUNK_GRID_NUM;
					nNum++;
					vertextBuffer[nNum] = (beginZ + j) / TerrainLeaf.CHUNK_GRID_NUM;
					nNum++;
					vertextBuffer[nNum] = hXIndex;
					nNum++;
					vertextBuffer[nNum] = this._beginGridZ + j;
					nNum++;
				}
			}
			//右
			for (i = 0; i < 2; i++) {
				for (j = 0; j < s; j++) {
					TerrainLeaf.__VECTOR3__.x = (this._beginGridX + TerrainLeaf.LEAF_GRID_NUM) * this._gridSize;
					TerrainLeaf.__VECTOR3__.y = (i == 1 ? terrainHeightData[(this._beginGridZ + j) * (heighDataWidth) + (this._beginGridX + TerrainLeaf.LEAF_GRID_NUM)] : -this._gridSize);
					TerrainLeaf.__VECTOR3__.z = (this._beginGridZ + j) * this._gridSize;
					if (TerrainLeaf.__ADAPT_MATRIX__) {
						Vector3.transformV3ToV3(TerrainLeaf.__VECTOR3__, TerrainLeaf.__ADAPT_MATRIX__, TerrainLeaf.__VECTOR3__);
					}
					vertextBuffer[nNum] = TerrainLeaf.__VECTOR3__.x;
					nNum++;
					vertextBuffer[nNum] = TerrainLeaf.__VECTOR3__.y;
					nNum++;
					vertextBuffer[nNum] = TerrainLeaf.__VECTOR3__.z;
					nNum++;
					//计算法线
					if (i == 0) {
						hXIndex = this._beginGridX + TerrainLeaf.LEAF_GRID_NUM + 1;
					} else {
						hXIndex = this._beginGridX + TerrainLeaf.LEAF_GRID_NUM;
					}
					this.calcVertextNormlUV(hXIndex, this._beginGridZ + j, heighDataWidth, heightDataHeight, normal);
					
					//给顶点赋值
					vertextBuffer[nNum] = normal.x;
					nNum++;
					vertextBuffer[nNum] = normal.y;
					nNum++;
					vertextBuffer[nNum] = normal.z;
					nNum++;
					vertextBuffer[nNum] = (beginX + TerrainLeaf.LEAF_GRID_NUM) / TerrainLeaf.CHUNK_GRID_NUM;
					nNum++;
					vertextBuffer[nNum] = (beginZ + j) / TerrainLeaf.CHUNK_GRID_NUM;
					nNum++;
					vertextBuffer[nNum] = hXIndex;
					nNum++;
					vertextBuffer[nNum] = this._beginGridZ + j;
					nNum++;
				}
			}
		}
		
		 calcOriginalBoudingBoxAndSphere():void {
			var min:Vector3 = new Vector3(this._beginGridX * this._gridSize, this._sizeOfY.x, this._beginGridZ * this._gridSize);
			var max:Vector3 = new Vector3((this._beginGridX + TerrainLeaf.LEAF_GRID_NUM) * this._gridSize, this._sizeOfY.y, (this._beginGridZ + TerrainLeaf.LEAF_GRID_NUM) * this._gridSize);
			if (TerrainLeaf.__ADAPT_MATRIX__) {
				Vector3.transformV3ToV3(min, TerrainLeaf.__ADAPT_MATRIX__, min);
				Vector3.transformV3ToV3(max, TerrainLeaf.__ADAPT_MATRIX__, max);
			}
			this._originalBoundingBox = new BoundBox(min, max);
			var size:Vector3 = new Vector3();
			Vector3.subtract(max, min, size);
			Vector3.scale(size, 0.5, size);
			var center:Vector3 = new Vector3();
			Vector3.add(min, size, center);
			this._originalBoundingSphere = new BoundSphere(center, Vector3.scalarLength(size));
			this._originalBoundingBoxCorners = [];
			this._originalBoundingBox.getCorners(this._originalBoundingBoxCorners);
			this._boundingBox = new BoundBox(new Vector3(-0.5, -0.5, -0.5), new Vector3(0.5, 0.5, 0.5));
			this._boundingSphere = new BoundSphere(new Vector3(0, 0, 0), 1);
		}
		
		 calcLeafBoudingBox(worldMatrix:Matrix4x4):void {
			for (var i:number = 0; i < 8; i++) {
				Vector3.transformCoordinate(this._originalBoundingBoxCorners[i], worldMatrix, BaseRender._tempBoundBoxCorners[i]);
			}
			BoundBox.createfromPoints(BaseRender._tempBoundBoxCorners, this._boundingBox);
		}
		
		 calcLeafBoudingSphere(worldMatrix:Matrix4x4, maxScale:number):void {
			Vector3.transformCoordinate(this._originalBoundingSphere.center, worldMatrix, this._boundingSphere.center);
			this._boundingSphere.radius = this._originalBoundingSphere.radius * maxScale;
		}
		
		 calcLODErrors(terrainHeightData:Float32Array, heighDataWidth:number, heightDataHeight:number):void {
			this._LODError = new Float32Array(TerrainLeaf._maxLODLevel + 1);
			var step:number = 1;
			for (var i:number = 0, n:number = TerrainLeaf._maxLODLevel + 1; i < n; i++) {
				var maxError:number = 0;
				for (var y:number = 0, n1:number = TerrainLeaf.LEAF_GRID_NUM; y < n1; y += step) {
					for (var x:number = 0, n2:number = TerrainLeaf.LEAF_GRID_NUM; x < n2; x += step) {
						var z00:number = terrainHeightData[(this._beginGridZ + y) * heighDataWidth + (this._beginGridX + x)];
						var z10:number = terrainHeightData[(this._beginGridZ + y) * heighDataWidth + (this._beginGridX + x) + step];
						var z01:number = terrainHeightData[(this._beginGridZ + y + step) * heighDataWidth + (this._beginGridX + x)];
						var z11:number = terrainHeightData[(this._beginGridZ + y + step) * heighDataWidth + (this._beginGridX + x) + step];
						
						for (var j:number = 0; j < step; j++) {
							var ys:number = j / step;
							for (var k:number = 0; k < step; k++) {
								var xs:number = k / step;
								var z:number = terrainHeightData[(this._beginGridZ + y + j) * heighDataWidth + (this._beginGridX + x) + k];
								var iz:number = (xs + ys <= 1) ? (z00 + (z10 - z00) * xs + (z01 - z00) * ys) : (z11 + (z01 - z11) * (1 - xs) + (z10 - z11) * (1 - ys));
								var error:number = Math.abs(iz - z);
								maxError = Math.max(maxError, error);
							}
						}
					}
				}
				step *= 2;
				this._LODError[i] = maxError;
			}
		}
		
		 determineLod(eyePos:Vector3, perspectiveFactor:number, tolerance:number, tolerAndPerspectiveChanged:boolean):number {
			var nDistanceToEye:number = Vector3.distance(eyePos, this._boundingSphere.center);
			var n:number = TerrainLeaf._maxLODLevel;
			if (!tolerAndPerspectiveChanged) {
				if (this._lastDistanceToEye == nDistanceToEye) {
					return this._currentLODLevel;
				} else if (this._lastDistanceToEye > nDistanceToEye) {
					n = this._currentLODLevel;
				}
			}
			for (var i:number = n; i >= 1; i--) {
				if (Terrain.LOD_DISTANCE_FACTOR * this._LODError[i] / nDistanceToEye * perspectiveFactor < tolerance) {
					this._currentLODLevel = i;
					break;
				}
			}
			this._lastDistanceToEye = nDistanceToEye;
			return this._currentLODLevel;
		}
	}

