import { TerrainFilter } from "././TerrainFilter";
import { TerrainRender } from "././TerrainRender";
import { RenderableSprite3D } from "../core/RenderableSprite3D"
	import { Sprite3D } from "../core/Sprite3D"
	import { BaseMaterial } from "../core/material/BaseMaterial"
	import { TerrainMaterial } from "../core/material/TerrainMaterial"
	import { RenderElement } from "../core/render/RenderElement"
	import { Matrix4x4 } from "../math/Matrix4x4"
	import { Vector3 } from "../math/Vector3"
	import { Vector4 } from "../math/Vector4"
	import { Mesh } from "../resource/models/Mesh"
	import { Node } from "laya/display/Node"
	import { Loader } from "laya/net/Loader"
	
	/**
	 * <code>TerrainChunk</code> 类用于创建地块。
	 */
	export class TerrainChunk extends RenderableSprite3D {
		
		/** @private */
		private _terrainFilter:TerrainFilter;
		
		/**
		 * 获取地形过滤器。
		 * @return  地形过滤器。
		 */
		 get terrainFilter():TerrainFilter {
			return this._terrainFilter;
		}
		
		/**
		 * 获取地形渲染器。
		 * @return  地形渲染器。
		 */
		 get terrainRender():TerrainRender {
			return (<TerrainRender>this._render );
		}
		
		/**
		 * 创建一个 <code>MeshSprite3D</code> 实例。
		 * @param mesh 网格,同时会加载网格所用默认材质。
		 * @param name 名字。
		 */
		constructor(chunkOffsetX:number, chunkOffsetZ:number, girdSize:number, terrainHeightData:Float32Array, heightDataWidth:number, heightDataHeight:number, cameraCoordinateInverse:boolean, name:string = null){
			super(name);
			this._terrainFilter = new TerrainFilter(this, chunkOffsetX, chunkOffsetZ, girdSize, terrainHeightData, heightDataWidth, heightDataHeight, cameraCoordinateInverse);
			this._render = new TerrainRender(this);
		}
		
		 buildRenderElementAndMaterial(detailNum:number, normalMap:string, alphaMapUrl:string, detailUrl1:string, detailUrl2:string, detailUrl3:string, detailUrl4:string, ambientColor:Vector3, diffuseColor:Vector3, specularColor:Vector4, sx1:number = 1, sy1:number = 1, sx2:number = 1, sy2:number = 1, sx3:number = 1, sy3:number = 1, sx4:number = 1, sy4:number = 1):void {
			var terrainMaterial:TerrainMaterial = new TerrainMaterial();
			if (diffuseColor) terrainMaterial.diffuseColor = diffuseColor;
			if (ambientColor) terrainMaterial.ambientColor = ambientColor;
			if (specularColor) terrainMaterial.specularColor = specularColor;
			terrainMaterial.splatAlphaTexture = Loader.getRes(alphaMapUrl);
			terrainMaterial.normalTexture = normalMap ? Loader.getRes(normalMap) : null;
			terrainMaterial.diffuseTexture1 = detailUrl1 ? Loader.getRes(detailUrl1) : null;
			terrainMaterial.diffuseTexture2 = detailUrl2 ? Loader.getRes(detailUrl2) : null;
			terrainMaterial.diffuseTexture3 = detailUrl3 ? Loader.getRes(detailUrl3) : null;
			terrainMaterial.diffuseTexture4 = detailUrl4 ? Loader.getRes(detailUrl4) : null;
			terrainMaterial.setDiffuseScale1(sx1, sy1);
			terrainMaterial.setDiffuseScale2(sx2, sy2);
			terrainMaterial.setDiffuseScale3(sx3, sy3);
			terrainMaterial.setDiffuseScale4(sx4, sy4);
			terrainMaterial.setDetailNum(detailNum);
			if (this._render._renderElements.length != 0) {
				terrainMaterial.renderMode = TerrainMaterial.RENDERMODE_TRANSPARENT;
			}
			
			var renderElement:RenderElement = new RenderElement();
			renderElement.setTransform(this._transform);
			renderElement.render = this._render;
			renderElement.setGeometry(this._terrainFilter);
			this._render._renderElements.push(renderElement);
			this._render.sharedMaterial = terrainMaterial;
			
		}
		
		/*override*/  _cloneTo(destObject:any,srcSprite:Node,dstSprite:Node):void {
			console.log("Terrain Chunk can't clone");
		}
		
		/*override*/  destroy(destroyChild:boolean = true):void {
			if (this.destroyed)
				return;
			super.destroy(destroyChild);
			this._terrainFilter.destroy();
			this._terrainFilter = null;
		}
	
	}

