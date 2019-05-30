import { TerrainRes } from "././TerrainRes";
import { Laya } from "Laya";
import { Laya3D } from "./../../../Laya3D";
import { TerrainChunk } from "././TerrainChunk";
import { TerrainHeightData } from "././TerrainHeightData";
import { TerrainLeaf } from "././TerrainLeaf";
import { Sprite3D } from "../core/Sprite3D"
	import { TerrainMaterial } from "../core/material/TerrainMaterial"
	import { Vector2 } from "../math/Vector2"
	import { Vector3 } from "../math/Vector3"
	import { Vector4 } from "../math/Vector4"
	import { ChunkInfo } from "./unit/ChunkInfo"
	import { Node } from "laya/display/Node"
	import { Event } from "laya/events/Event"
	import { Loader } from "laya/net/Loader"
	
	/**
	 * <code>Terrain</code> 类用于创建地块。
	 */
	export class Terrain extends Sprite3D {
		 static RENDER_LINE_MODEL:boolean = false;
		 static LOD_TOLERANCE_VALUE:number = 4;
		 static LOD_DISTANCE_FACTOR:number = 2.0;
		 static __VECTOR3__:Vector3;
		//地形资源
		private _terrainRes:TerrainRes = null;
		private _lightmapScaleOffset:Vector4;
		
		 set terrainRes(value:TerrainRes) {
			if (value) {
				this._terrainRes = value;
				this.buildTerrain(value);
			}
		}
		
		/**
		 * 加载网格模板,注意:不缓存。
		 * @param url 模板地址。
		 */
		 static load(url:string):void {
			Laya.loader.create(url, null, null, Laya3D.TERRAINRES, null, null, 1, false);
		}
		
		/**
		 * 创建一个 <code>MeshSprite3D</code> 实例。
		 * @param mesh 网格,同时会加载网格所用默认材质。
		 * @param name 名字。
		 */
		constructor(terrainRes:TerrainRes = null){

			super();
this._lightmapScaleOffset = new Vector4(1, 1, 0, 0);
			if (terrainRes) {
				this._terrainRes = terrainRes;
				this.buildTerrain(terrainRes);
			}
		}
		
		/**
		 * @inheritDoc
		 */
		/*override*/  _parse(data:any,spriteMap:any):void {
			super._parse(data,spriteMap);
			this.terrainRes = Loader.getRes(data.dataPath);
			
			var lightmapIndex:any = data.lightmapIndex;
			if (lightmapIndex != null)
				this.setLightmapIndex(lightmapIndex);
			
			var lightmapScaleOffsetArray:any[] = data.lightmapScaleOffset;
			if (lightmapScaleOffsetArray)
				this.setLightmapScaleOffset(new Vector4(lightmapScaleOffsetArray[0], lightmapScaleOffsetArray[1], lightmapScaleOffsetArray[2], lightmapScaleOffsetArray[3]));
		}
		
		 setLightmapIndex(value:number):void {
			for (var i:number = 0; i < this._children.length; i++) {
				var terrainChunk:TerrainChunk = this._children[i];
				terrainChunk.terrainRender.lightmapIndex = value;
			}
		}
		
		 setLightmapScaleOffset(value:Vector4):void {
			if (!value) return;
			value.cloneTo(this._lightmapScaleOffset);
			for (var i:number = 0; i < this._children.length; i++) {
				var terrainChunk:TerrainChunk = this._children[i];
				terrainChunk.terrainRender.lightmapScaleOffset = this._lightmapScaleOffset;
			}
		}
		
		 disableLight():void {
			for (var i:number = 0, n:number = this._children.length; i < n; i++) {
				var terrainChunk:TerrainChunk = this._children[i];
				for (var j:number = 0, m:number = terrainChunk._render.sharedMaterials.length; j < m; j++) {
					var terrainMaterial:TerrainMaterial = (<TerrainMaterial>terrainChunk._render.sharedMaterials[j] );
					terrainMaterial.disableLight();
				}
			}
		}
		//建筑地形
		 buildTerrain(terrainRes:TerrainRes):void {
			var chunkNumX:number = terrainRes._chunkNumX;
			var chunkNumZ:number = terrainRes._chunkNumZ;
			var heightData:TerrainHeightData = terrainRes._heightData;
			var n:number = 0;
			for (var i:number = 0; i < chunkNumZ; i++) {
				for (var j:number = 0; j < chunkNumX; j++) {
					var terrainChunk:TerrainChunk = new TerrainChunk(j, i, terrainRes._gridSize, heightData._terrainHeightData, heightData._width, heightData._height, terrainRes._cameraCoordinateInverse);
					var chunkInfo:ChunkInfo = terrainRes._chunkInfos[n++];
					for (var k:number = 0; k < chunkInfo.alphaMap.length; k++) {
						var nNum:number = chunkInfo.detailID[k].length;
						var sDetialTextureUrl1:string = (nNum > 0) ? terrainRes._detailTextureInfos[chunkInfo.detailID[k][0]].diffuseTexture : null;
						var sDetialTextureUrl2:string = (nNum > 1) ? terrainRes._detailTextureInfos[chunkInfo.detailID[k][1]].diffuseTexture : null;
						var sDetialTextureUrl3:string = (nNum > 2) ? terrainRes._detailTextureInfos[chunkInfo.detailID[k][2]].diffuseTexture : null;
						var sDetialTextureUrl4:string = (nNum > 3) ? terrainRes._detailTextureInfos[chunkInfo.detailID[k][3]].diffuseTexture : null;
						
						var detialScale1:Vector2 = (nNum > 0) ? terrainRes._detailTextureInfos[chunkInfo.detailID[k][0]].scale : null;
						var detialScale2:Vector2 = (nNum > 1) ? terrainRes._detailTextureInfos[chunkInfo.detailID[k][1]].scale : null;
						var detialScale3:Vector2 = (nNum > 2) ? terrainRes._detailTextureInfos[chunkInfo.detailID[k][2]].scale : null;
						var detialScale4:Vector2 = (nNum > 3) ? terrainRes._detailTextureInfos[chunkInfo.detailID[k][3]].scale : null;
						terrainChunk.buildRenderElementAndMaterial(nNum, chunkInfo.normalMap, chunkInfo.alphaMap[k], sDetialTextureUrl1, sDetialTextureUrl2, sDetialTextureUrl3, sDetialTextureUrl4, terrainRes._materialInfo.ambientColor, terrainRes._materialInfo.diffuseColor, terrainRes._materialInfo.specularColor, detialScale1 ? detialScale1.x : 1, detialScale1 ? detialScale1.y : 1, detialScale2 ? detialScale2.x : 1, detialScale2 ? detialScale2.y : 1, detialScale3 ? detialScale3.x : 1, detialScale3 ? detialScale3.y : 1, detialScale4 ? detialScale4.x : 1, detialScale4 ? detialScale4.y : 1);
					}
					terrainChunk.terrainRender.receiveShadow = true;
					terrainChunk.terrainRender.lightmapScaleOffset = this._lightmapScaleOffset;
					this.addChild(terrainChunk);
				}
			}
		}
		
		/**
		 * 获取地形X轴长度。
		 * @return  地形X轴长度。
		 */
		 width():number {
			return this._terrainRes._chunkNumX * TerrainLeaf.CHUNK_GRID_NUM * this._terrainRes._gridSize;
		}
		
		/**
		 * 获取地形Z轴长度。
		 * @return  地形Z轴长度。
		 */
		 depth():number {
			return this._terrainRes._chunkNumZ * TerrainLeaf.CHUNK_GRID_NUM * this._terrainRes._gridSize;
		}
		
		/**
		 * 获取地形高度。
		 * @param x X轴坐标。
		 * @param z Z轴坐标。
		 */
		 getHeightXZ(x:number, z:number):number {
			if (!this._terrainRes)
				return NaN;
			
			x -= this.transform.position.x;
			z -= this.transform.position.z;
			
			if (!Terrain.__VECTOR3__) {
				Terrain.__VECTOR3__ = new Vector3();
				
			}
			Terrain.__VECTOR3__.x = x;
			Terrain.__VECTOR3__.y = 0;
			Terrain.__VECTOR3__.z = z;
			
			Vector3.transformV3ToV3(Terrain.__VECTOR3__, TerrainLeaf.__ADAPT_MATRIX_INV__, Terrain.__VECTOR3__);
			
			x = Terrain.__VECTOR3__.x;
			z = Terrain.__VECTOR3__.z;
			
			if (x < 0 || x > this.width() || z < 0 || z > this.depth())
				return NaN;
			
			var gridSize:number = this._terrainRes._gridSize;
			var nIndexX:number = parseInt("" + x / gridSize);
			var nIndexZ:number = parseInt("" + z / gridSize);
			
			var offsetX:number = x - nIndexX * gridSize;
			var offsetZ:number = z - nIndexZ * gridSize;
			var h1:number;
			var h2:number;
			var h3:number;
			var u:number;
			var v:number;
			
			var heightData:TerrainHeightData = this._terrainRes._heightData;
			
			if (offsetX + offsetZ > gridSize) {
				h1 = heightData._terrainHeightData[(nIndexZ + 1 - 1) * heightData._width + nIndexX + 1];
				h2 = heightData._terrainHeightData[(nIndexZ + 1 - 1) * heightData._width + nIndexX];
				h3 = heightData._terrainHeightData[(nIndexZ - 1) * heightData._width + nIndexX + 1];
				u = (gridSize - offsetX) / gridSize;
				v = (gridSize - offsetZ) / gridSize;
				return h1 + (h2 - h1) * u + (h3 - h1) * v;
			} else {
				h1 = heightData._terrainHeightData[Math.max(0.0, nIndexZ - 1) * heightData._width + nIndexX];
				h2 = heightData._terrainHeightData[Math.min(heightData._width * heightData._height - 1, (nIndexZ + 1 - 1) * heightData._width + nIndexX)];
				h3 = heightData._terrainHeightData[Math.min(heightData._width * heightData._height - 1, Math.max(0.0, nIndexZ - 1) * heightData._width + nIndexX + 1)];
				u = offsetX / gridSize;
				v = offsetZ / gridSize;
				return h1 + (h2 - h1) * v + (h3 - h1) * u;
			}
		}
	}

