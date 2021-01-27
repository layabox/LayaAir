import { RenderableSprite3D } from "./RenderableSprite3D";
import { MeshFilter } from "./MeshFilter";
import { MeshRenderer } from "./MeshRenderer";
import { Material } from "./material/Material";
import { DynamicBatchManager } from "../graphics/DynamicBatchManager"
import { MeshRenderDynamicBatchManager } from "../graphics/MeshRenderDynamicBatchManager"
import { MeshRenderStaticBatchManager } from "../graphics/MeshRenderStaticBatchManager"
import { StaticBatchManager } from "../graphics/StaticBatchManager"
import { Vector4 } from "../math/Vector4"
import { Mesh } from "../resource/models/Mesh"
import { Node } from "../../display/Node"
import { MeshSprite3DShaderDeclaration } from "./MeshSprite3DShaderDeclaration";
import { Loader } from "../../net/Loader";
import { Shader3D } from "../shader/Shader3D";

/**
 * <code>MeshSprite3D</code> 类用于创建网格。
 */
export class MeshSprite3D extends RenderableSprite3D {
	/**
	 * @internal
	 */
	static __init__(): void {
		MeshSprite3DShaderDeclaration.SHADERDEFINE_UV0 = Shader3D.getDefineByName("UV");
		MeshSprite3DShaderDeclaration.SHADERDEFINE_COLOR = Shader3D.getDefineByName("COLOR");
		MeshSprite3DShaderDeclaration.SHADERDEFINE_UV1 = Shader3D.getDefineByName("UV1");
		MeshSprite3DShaderDeclaration.SHADERDEFINE_GPU_INSTANCE = Shader3D.getDefineByName("GPU_INSTANCE");
		MeshSprite3DShaderDeclaration.SHADERDEFINE_SPECCUBE_BOX_PROJECTION = Shader3D.getDefineByName("SPECCUBE_BOX_PROJECTION");
		StaticBatchManager._registerManager(MeshRenderStaticBatchManager.instance);
		DynamicBatchManager._registerManager(MeshRenderDynamicBatchManager.instance);
	}

	private _meshFilter: MeshFilter;

	/**
	 * 网格过滤器。
	 */
	get meshFilter(): MeshFilter {
		return (<MeshFilter>this._meshFilter);
	}

	/**
	 * 网格渲染器。
	 */
	get meshRenderer(): MeshRenderer {
		return (<MeshRenderer>this._render);
	}

	/**
	 * 创建一个 <code>MeshSprite3D</code> 实例。
	 * @param mesh 网格,同时会加载网格所用默认材质。
	 * @param name 名字。
	 */
	constructor(mesh: Mesh = null, name: string = null) {
		super(name);
		this._meshFilter = new MeshFilter(this);
		this._render = new MeshRenderer(this);
		(mesh) && (this._meshFilter.sharedMesh = mesh);
	}

	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	_parse(data: any, spriteMap: any): void {
		super._parse(data, spriteMap);
		var render: MeshRenderer = this.meshRenderer;
		var lightmapIndex: any = data.lightmapIndex;
		(lightmapIndex != null) && (render.lightmapIndex = lightmapIndex);
		var lightmapScaleOffsetArray: any[] = data.lightmapScaleOffset;
		(lightmapScaleOffsetArray) && (render.lightmapScaleOffset = new Vector4(lightmapScaleOffsetArray[0], lightmapScaleOffsetArray[1], lightmapScaleOffsetArray[2], lightmapScaleOffsetArray[3]));
		(data.meshPath != undefined) && (this.meshFilter.sharedMesh = Loader.getRes(data.meshPath));
		(data.enableRender != undefined) && (render.enable = data.enableRender);
		(data.receiveShadows != undefined) && (render.receiveShadow = data.receiveShadows);
		(data.castShadow != undefined) && (render.castShadow = data.castShadow);
		var materials: any[] = data.materials;
		if (materials) {
			var sharedMaterials: Material[] = render.sharedMaterials;
			var materialCount: number = materials.length;
			sharedMaterials.length = materialCount;
			for (var i: number = 0; i < materialCount; i++) {
				sharedMaterials[i] = Loader.getRes(materials[i].path);
			}

			render.sharedMaterials = sharedMaterials;
		}
	}

	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	_addToInitStaticBatchManager(): void {
		if (this.meshFilter.sharedMesh)//无sharedMesh精灵会报错
			MeshRenderStaticBatchManager.instance._addBatchSprite(this);
	}

	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	_cloneTo(destObject: any, rootSprite: Node, dstSprite: Node): void {
		var meshSprite3D: MeshSprite3D = (<MeshSprite3D>destObject);
		meshSprite3D._meshFilter.sharedMesh = this._meshFilter.sharedMesh;
		var meshRender: MeshRenderer = (<MeshRenderer>this._render);
		var destMeshRender: MeshRenderer = (<MeshRenderer>meshSprite3D._render);
		destMeshRender.enable = meshRender.enable;
		destMeshRender.sharedMaterials = meshRender.sharedMaterials;
		destMeshRender.castShadow = meshRender.castShadow;
		var lightmapScaleOffset: Vector4 = meshRender.lightmapScaleOffset;
		lightmapScaleOffset && (destMeshRender.lightmapScaleOffset = lightmapScaleOffset.clone());
		destMeshRender.lightmapIndex = meshRender.lightmapIndex;
		destMeshRender.receiveShadow = meshRender.receiveShadow;
		destMeshRender.sortingFudge = meshRender.sortingFudge;
		super._cloneTo(destObject, rootSprite, dstSprite);//父类函数在最后,组件应该最后赋值，否则获取材质默认值等相关函数会有问题
	}

	/**
	 * @inheritDoc
	 * @override	
	 */
	destroy(destroyChild: boolean = true): void {
		if (this.destroyed)
			return;
		super.destroy(destroyChild);
		this._meshFilter.destroy();
	}

	/**
	 * @internal
	 */
	protected _create(): Node {
		return new MeshSprite3D();
	}

}

