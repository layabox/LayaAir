import { RenderableSprite3D } from "./RenderableSprite3D";
import { MeshFilter } from "./MeshFilter";
import { MeshRenderer } from "./MeshRenderer";
import { DynamicBatchManager } from "../graphics/DynamicBatchManager";
import { MeshRenderDynamicBatchManager } from "../graphics/MeshRenderDynamicBatchManager";
import { MeshRenderStaticBatchManager } from "../graphics/MeshRenderStaticBatchManager";
import { StaticBatchManager } from "../graphics/StaticBatchManager";
import { Vector4 } from "../math/Vector4";
import { ShaderDefines } from "../shader/ShaderDefines";
import { MeshSprite3DShaderDeclaration } from "./MeshSprite3DShaderDeclaration";
import { Loader } from "../../net/Loader";
/**
 * <code>MeshSprite3D</code> 类用于创建网格。
 */
export class MeshSprite3D extends RenderableSprite3D {
    /**
     * @internal
     */
    static __init__() {
        MeshSprite3D.shaderDefines = new ShaderDefines(RenderableSprite3D.shaderDefines);
        MeshSprite3DShaderDeclaration.SHADERDEFINE_UV0 = MeshSprite3D.shaderDefines.registerDefine("UV");
        MeshSprite3DShaderDeclaration.SHADERDEFINE_COLOR = MeshSprite3D.shaderDefines.registerDefine("COLOR");
        MeshSprite3DShaderDeclaration.SHADERDEFINE_UV1 = MeshSprite3D.shaderDefines.registerDefine("UV1");
        MeshSprite3DShaderDeclaration.SHADERDEFINE_GPU_INSTANCE = MeshSprite3D.shaderDefines.registerDefine("GPU_INSTANCE");
        StaticBatchManager._registerManager(MeshRenderStaticBatchManager.instance);
        DynamicBatchManager._registerManager(MeshRenderDynamicBatchManager.instance);
    }
    /**
     * 获取网格过滤器。
     * @return  网格过滤器。
     */
    get meshFilter() {
        return this._meshFilter;
    }
    /**
     * 获取网格渲染器。
     * @return  网格渲染器。
     */
    get meshRenderer() {
        return this._render;
    }
    /**
     * 创建一个 <code>MeshSprite3D</code> 实例。
     * @param mesh 网格,同时会加载网格所用默认材质。
     * @param name 名字。
     */
    constructor(mesh = null, name = null) {
        super(name);
        this._meshFilter = new MeshFilter(this);
        this._render = new MeshRenderer(this);
        (mesh) && (this._meshFilter.sharedMesh = mesh);
    }
    /**
     * @inheritDoc
     */
    /*override*/ _parse(data, spriteMap) {
        super._parse(data, spriteMap);
        var render = this.meshRenderer;
        var lightmapIndex = data.lightmapIndex;
        (lightmapIndex != null) && (render.lightmapIndex = lightmapIndex);
        var lightmapScaleOffsetArray = data.lightmapScaleOffset;
        (lightmapScaleOffsetArray) && (render.lightmapScaleOffset = new Vector4(lightmapScaleOffsetArray[0], lightmapScaleOffsetArray[1], lightmapScaleOffsetArray[2], lightmapScaleOffsetArray[3]));
        (data.meshPath != undefined) && (this.meshFilter.sharedMesh = Loader.getRes(data.meshPath));
        (data.enableRender != undefined) && (this.meshRenderer.enable = data.enableRender);
        var materials = data.materials;
        if (materials) {
            var sharedMaterials = render.sharedMaterials;
            var materialCount = materials.length;
            sharedMaterials.length = materialCount;
            for (var i = 0; i < materialCount; i++) {
                sharedMaterials[i] = Loader.getRes(materials[i].path);
            }
            render.sharedMaterials = sharedMaterials;
        }
    }
    /**
     * @inheritDoc
     */
    /*override*/ _addToInitStaticBatchManager() {
        if (this.meshFilter.sharedMesh) //无sharedMesh精灵会报错
            MeshRenderStaticBatchManager.instance._addBatchSprite(this);
    }
    /**
     * @inheritDoc
     */
    /*override*/ _cloneTo(destObject, rootSprite, dstSprite) {
        var meshSprite3D = destObject;
        meshSprite3D._meshFilter.sharedMesh = this._meshFilter.sharedMesh;
        var meshRender = this._render;
        var destMeshRender = meshSprite3D._render;
        destMeshRender.enable = meshRender.enable;
        destMeshRender.sharedMaterials = meshRender.sharedMaterials;
        destMeshRender.castShadow = meshRender.castShadow;
        var lightmapScaleOffset = meshRender.lightmapScaleOffset;
        lightmapScaleOffset && (destMeshRender.lightmapScaleOffset = lightmapScaleOffset.clone());
        destMeshRender.lightmapIndex = meshRender.lightmapIndex;
        destMeshRender.receiveShadow = meshRender.receiveShadow;
        destMeshRender.sortingFudge = meshRender.sortingFudge;
        super._cloneTo(destObject, rootSprite, dstSprite); //父类函数在最后,组件应该最后赋值，否则获取材质默认值等相关函数会有问题
    }
    /**
     * @inheritDoc
     */
    /*override*/ destroy(destroyChild = true) {
        if (this.destroyed)
            return;
        super.destroy(destroyChild);
        this._meshFilter.destroy();
    }
    /**
     * @internal
     */
    _create() {
        return new MeshSprite3D();
    }
}
