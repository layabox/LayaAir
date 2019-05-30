import { TerrainHeightData } from "././TerrainHeightData";
import { Laya } from "Laya";
import { Laya3D } from "./../../../Laya3D";
import { Vector2 } from "../math/Vector2"
	import { Vector3 } from "../math/Vector3"
	import { Vector4 } from "../math/Vector4"
	import { ChunkInfo } from "./unit/ChunkInfo"
	import { DetailTextureInfo } from "./unit/DetailTextureInfo"
	import { MaterialInfo } from "./unit/MaterialInfo"
	import { Event } from "laya/events/Event"
	import { Loader } from "laya/net/Loader"
	import { Resource } from "laya/resource/Resource"
	import { Handler } from "laya/utils/Handler"
	
	/**
	 * <code>TerrainRes</code> 类用于描述地形信息。
	 */
	export class TerrainRes extends Resource {
		 _version:number;
		 _cameraCoordinateInverse:boolean;
		 _gridSize:number;
		 _chunkNumX:number;
		 _chunkNumZ:number;
		 _heightDataX:number;
		 _heightDataZ:number;
		 _heightDataBitType:number;
		 _heightDataValue:number;
		 _heightDataUrl:string;
		 _detailTextureInfos:DetailTextureInfo[];
		 _chunkInfos:ChunkInfo[];
		 _heightData:TerrainHeightData;
		 _materialInfo:MaterialInfo;
		 _alphaMaps:string[];
		 _normalMaps:string[];
		
		/**
		 * 异步回调
		 * 
		 */
		 static _parse(data:any, propertyParams:any = null, constructParams:any[] = null):TerrainRes {
			var terrainRes:TerrainRes = new TerrainRes();
			terrainRes.parseData(data);
			return terrainRes;
		}
		
		/**
		 * 加载地形模板,注意:不缓存。
		 * @param url 模板地址。
		 * @param complete 完成回掉。
		 */
		 static load(url:string, complete:Handler):void {
			Laya.loader.create(url, complete, null, Laya3D.TERRAINRES, null, null, 1, false);
		}
		
		/**
		 * 创建一个 <code>TerrainHeightData</code> 实例。
		 */
		constructor(){
			super();
		}
		
		 parseData(data:any):boolean {
			var json:any = data[0];
			var resouMap:any = data[1];
			this._version = json.version;
			if (this._version == 1.0) {
				this._cameraCoordinateInverse = json.cameraCoordinateInverse;
				this._gridSize = json.gridSize;
				this._chunkNumX = json.chunkNumX;
				this._chunkNumZ = json.chunkNumZ;
				var heightData:any = json.heightData;
				this._heightDataX = heightData.numX;
				this._heightDataZ = heightData.numZ;
				this._heightDataBitType = heightData.bitType;
				this._heightDataValue = heightData.value;
				this._heightDataUrl = resouMap[heightData.url];
				this._materialInfo = new MaterialInfo();
				if (json.material) {
					var ambient:any = json.material.ambient;
					var diffuse:any = json.material.diffuse;
					var specular:any = json.material.specular;
					this._materialInfo.ambientColor = new Vector3(ambient[0], ambient[1], ambient[2]);
					this._materialInfo.diffuseColor = new Vector3(diffuse[0], diffuse[1], diffuse[2]);
					this._materialInfo.specularColor = new Vector4(specular[0], specular[1], specular[2], specular[3]);
				}
				var detailTextures:any = json.detailTexture;
				this._detailTextureInfos = [];
				for (var i:number = 0; i < detailTextures.length; i++) {
					var detail:any = detailTextures[i];
					var info:DetailTextureInfo = new DetailTextureInfo();
					info.diffuseTexture = resouMap[detail.diffuse];
					info.normalTexture = detail.normal ? resouMap[detail.normal] : null;
					if (detail.scale) {
						info.scale = new Vector2(detail.scale[0], detail.scale[1]);
					} else {
						info.scale = new Vector2(1, 1);
					}
					if (detail.offset) {
						info.offset = new Vector2(detail.offset[0], detail.offset[1]);
					} else {
						info.offset = new Vector2(0, 0);
					}
					this._detailTextureInfos[i] = info;
				}
				var alphaMaps:any = json.alphaMap;
				this._alphaMaps = [];
				for (i = 0; i < this._alphaMaps.length; i++) {
					this._alphaMaps[i] = json.alphaMap[i];
				}
				var normalMaps:any = json.normalMap;
				this._normalMaps = [];
				for (i = 0; i < this._normalMaps.length; i++) {
					this._normalMaps[i] = json.normalMap[i];
				}
				
				var jchunks:any = json.chunkInfo;
				if (this._chunkNumX * this._chunkNumZ != jchunks.length) {
					alert("terrain data error");
					return false;
				}
				this._chunkInfos = [];
				for (i = 0; i < jchunks.length; i++) {
					var jchunk:any = jchunks[i];
					var chunkinfo:ChunkInfo = new ChunkInfo();
					var nAlphaMapNum:number = jchunk.alphaMap.length;
					var nDetailIDNum:number = jchunk.detailID.length;
					if (nAlphaMapNum != nDetailIDNum) {
						alert("terrain chunk data error");
						return false;
					}
					chunkinfo.alphaMap = [];
					chunkinfo.detailID = [];
					chunkinfo.normalMap = resouMap[this._normalMaps[jchunk.normalMap]];
					for (var j:number = 0; j < nAlphaMapNum; j++) {
						chunkinfo.alphaMap[j] = resouMap[this._alphaMaps[jchunk.alphaMap[j]]];
						var jid:any = jchunk.detailID[j];
						var nIDNum:number = jid.length;
						chunkinfo.detailID[j] = new Uint8Array(nIDNum);
						for (var k:number = 0; k < nIDNum; k++) {
							chunkinfo.detailID[j][k] = jid[k];
						}
					}
					this._chunkInfos[i] = chunkinfo;
				}
				
				this._heightData = Loader.getRes(this._heightDataUrl);
				this.onLoadTerrainComplete(this._heightData);
			}
			return true;
		}
		
		 onLoadTerrainComplete(heightData:TerrainHeightData):void {
		}
	
	}

