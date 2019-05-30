import { Laya } from "Laya";
import { Laya3D } from "./../../../Laya3D";
import { Event } from "laya/events/Event"
	import { Resource } from "laya/resource/Resource"
	import { Handler } from "laya/utils/Handler"
	
	/**
	 * <code>TerrainHeightData</code> 类用于描述地形高度信息。
	 */
	export class TerrainHeightData extends Resource {
		
		 _terrainHeightData:Float32Array;
		 _width:number;
		 _height:number;
		 _bitType:number;
		 _value:number;
		
		/**
		 * 异步回调
		 */
		 static _pharse(data:any, propertyParams:any = null, constructParams:any[] = null):void {
			var terrainHeightData:TerrainHeightData = new TerrainHeightData(constructParams[0],constructParams[1],constructParams[2],constructParams[3]);
			var buffer:any;
			var ratio:number;
			if (terrainHeightData._bitType == 8) {
				buffer = new Uint8Array(data);
				ratio = 1.0 / 255.0;
			} else if (terrainHeightData._bitType == 16) {
				buffer = new Int16Array(data);
				ratio = 1.0 / 32766.0;
			}
			terrainHeightData._terrainHeightData = new Float32Array(terrainHeightData._height * terrainHeightData._width);
			for (var i:number = 0, n:number = terrainHeightData._height * terrainHeightData._width; i < n; i++) {
				terrainHeightData._terrainHeightData[i] = (buffer[i] * ratio * terrainHeightData._value) / 2;
			}
		}
		
		/**
		 * 加载地形高度模板,注意:不缓存。
		 * @param url 模板地址。
		 * @param width 高度图的宽。
		 * @param height 高度图的高。
		 */
		 static load(url:string,complete:Handler, widht:number, height:number, bitType:number, value:number):void {
			 Laya.loader.create(url, complete, null, Laya3D.TERRAINHEIGHTDATA, [widht, height, bitType, value],null, 1, false);
		}
		
		/**
		 * 创建一个 <code>TerrainHeightData</code> 实例。
		 */
		constructor(width:number,height:number,bitType:number,value:number){
			super();
			this._width = width;
			this._height = height;
			this._bitType = bitType;
			this._value = value;
		}
		

	}

