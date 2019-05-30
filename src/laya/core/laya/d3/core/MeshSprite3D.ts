import { RenderableSprite3D } from "././RenderableSprite3D";
import { MeshFilter } from "././MeshFilter";
import { MeshRenderer } from "././MeshRenderer";
import { BaseMaterial } from "./material/BaseMaterial"
	import { DynamicBatchManager } from "../graphics/DynamicBatchManager"
	import { MeshRenderDynamicBatchManager } from "../graphics/MeshRenderDynamicBatchManager"
	import { MeshRenderStaticBatchManager } from "../graphics/MeshRenderStaticBatchManager"
	import { StaticBatchManager } from "../graphics/StaticBatchManager"
	import { Vector4 } from "../math/Vector4"
	import { Mesh } from "../resource/models/Mesh"
	import { ShaderDefines } from "../shader/ShaderDefines"
	import { Node } from "laya/display/Node"
	import { Loader } from "laya/net/Loader"
	
	/**
	 * <code>MeshSprite3D</code> 类用于创建网格。
	 */
	export class MeshSprite3D extends RenderableSprite3D {
		 static SHADERDEFINE_UV0:number;
		 static SHADERDEFINE_COLOR:number;
		 static SHADERDEFINE_UV1:number;
		 static SHADERDEFINE_GPU_INSTANCE:number;
		/**@private */
		 static shaderDefines:ShaderDefines = new ShaderDefines(RenderableSprite3D.shaderDefines);
		
		/**
		 * @private
		 */
		 static __init__():void {
			MeshSprite3D.SHADERDEFINE_UV0 = MeshSprite3D.shaderDefines.registerDefine("UV");
			MeshSprite3D.SHADERDEFINE_COLOR = MeshSprite3D.shaderDefines.registerDefine("COLOR");
			MeshSprite3D.SHADERDEFINE_UV1 = MeshSprite3D.shaderDefines.registerDefine("UV1");
			MeshSprite3D.SHADERDEFINE_GPU_INSTANCE = MeshSprite3D.shaderDefines.registerDefine("GPU_INSTANCE");
			StaticBatchManager._registerManager(MeshRenderStaticBatchManager.instance);
			DynamicBatchManager._registerManager(MeshRenderDynamicBatchManager.instance);
		}
		
		/** @private */
		private _meshFilter:MeshFilter;
		
		/**
		 * 获取网格过滤器。
		 * @return  网格过滤器。
		 */
		 get meshFilter():MeshFilter {
			return (<MeshFilter>this._meshFilter );
		}
		
		/**
		 * 获取网格渲染器。
		 * @return  网格渲染器。
		 */
		 get meshRenderer():MeshRenderer {
			return (<MeshRenderer>this._render );
		}
		
		/**
		 * 创建一个 <code>MeshSprite3D</code> 实例。
		 * @param mesh 网格,同时会加载网格所用默认材质。
		 * @param name 名字。
		 */
		constructor(mesh:Mesh = null, name:string = null){
			/*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
			super(name);
			this._meshFilter = new MeshFilter(this);
			this._render = new MeshRenderer(this);
			(mesh) && (this._meshFilter.sharedMesh = mesh);
		}
		
		/**
		 * @inheritDoc
		 */
		/*override*/  _parse(data:any, spriteMap:any):void {
			super._parse(data, spriteMap);
			var render:MeshRenderer = this.meshRenderer;
			var lightmapIndex:any = data.lightmapIndex;
			(lightmapIndex != null) && (render.lightmapIndex = lightmapIndex);
			var lightmapScaleOffsetArray:any[] = data.lightmapScaleOffset;
			(lightmapScaleOffsetArray) && (render.lightmapScaleOffset = new Vector4(lightmapScaleOffsetArray[0], lightmapScaleOffsetArray[1], lightmapScaleOffsetArray[2], lightmapScaleOffsetArray[3]));
			(data.meshPath != undefined) && (this.meshFilter.sharedMesh = Loader.getRes(data.meshPath));
			(data.enableRender != undefined) && (this.meshRenderer.enable = data.enableRender);
			var materials:any[] = data.materials;
			if (materials) {
				var sharedMaterials:BaseMaterial[] = render.sharedMaterials;
				var materialCount:number = materials.length;
				sharedMaterials.length = materialCount;
				for (var i:number = 0; i < materialCount; i++) {
					sharedMaterials[i] = Loader.getRes(materials[i].path);
				}
				
				render.sharedMaterials = sharedMaterials;
			}
		}
		
		/**
		 * @inheritDoc
		 */
		/*override*/  _addToInitStaticBatchManager():void {
			MeshRenderStaticBatchManager.instance._addBatchSprite(this);
		}
		
		/**
		 * @inheritDoc
		 */
		/*override*/  _cloneTo(destObject:any, rootSprite:Node, dstSprite:Node):void {
			var meshSprite3D:MeshSprite3D = (<MeshSprite3D>destObject );
			meshSprite3D._meshFilter.sharedMesh = this._meshFilter.sharedMesh;
			var meshRender:MeshRenderer = (<MeshRenderer>this._render );
			var destMeshRender:MeshRenderer = (<MeshRenderer>meshSprite3D._render );
			destMeshRender.enable = meshRender.enable;
			destMeshRender.sharedMaterials = meshRender.sharedMaterials;
			destMeshRender.castShadow = meshRender.castShadow;
			var lightmapScaleOffset:Vector4 = meshRender.lightmapScaleOffset;
			lightmapScaleOffset && (destMeshRender.lightmapScaleOffset = lightmapScaleOffset.clone());
			destMeshRender.lightmapIndex = meshRender.lightmapIndex;
			destMeshRender.receiveShadow = meshRender.receiveShadow;
			destMeshRender.sortingFudge = meshRender.sortingFudge;
			super._cloneTo(destObject, rootSprite, dstSprite);//父类函数在最后,组件应该最后赋值，否则获取材质默认值等相关函数会有问题
		}
		
		/**
		 * @inheritDoc
		 */
		/*override*/  destroy(destroyChild:boolean = true):void {
			if (this.destroyed)
				return;
			super.destroy(destroyChild);
			this._meshFilter.destroy();
		}
	
	}

