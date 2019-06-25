import { Loader } from "../../net/Loader";
import { Vector3 } from "../math/Vector3";
import { Vector4 } from "../math/Vector4";
import { Shader3D } from "../shader/Shader3D";
import { ShaderDefines } from "../shader/ShaderDefines";
import { Utils3D } from "../utils/Utils3D";
import { MeshFilter } from "././MeshFilter";
import { MeshSprite3D } from "././MeshSprite3D";
import { RenderableSprite3D } from "././RenderableSprite3D";
import { SkinnedMeshRenderer } from "././SkinnedMeshRenderer";
import { SkinnedMeshSprite3DShaderDeclaration } from "./SkinnedMeshSprite3DShaderDeclaration";
/**
 * <code>SkinnedMeshSprite3D</code> 类用于创建网格。
 */
export class SkinnedMeshSprite3D extends RenderableSprite3D {
    /**
     * 创建一个 <code>MeshSprite3D</code> 实例。
     * @param mesh 网格,同时会加载网格所用默认材质。
     * @param name 名字。
     */
    constructor(mesh = null, name = null) {
        super(name);
        this._meshFilter = new MeshFilter(this);
        this._render = new SkinnedMeshRenderer(this);
        (mesh) && (this._meshFilter.sharedMesh = mesh);
    }
    /**
     * @private
     */
    static __init__() {
        SkinnedMeshSprite3D.shaderDefines = new ShaderDefines(MeshSprite3D.shaderDefines);
        SkinnedMeshSprite3DShaderDeclaration.SHADERDEFINE_BONE = SkinnedMeshSprite3D.shaderDefines.registerDefine("BONE");
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
    get skinnedMeshRenderer() {
        return this._render;
    }
    /**
     * @inheritDoc
     */
    /*override*/ _parse(data, spriteMap) {
        super._parse(data, spriteMap);
        var render = this.skinnedMeshRenderer;
        var lightmapIndex = data.lightmapIndex;
        (lightmapIndex != null) && (render.lightmapIndex = lightmapIndex);
        var lightmapScaleOffsetArray = data.lightmapScaleOffset;
        (lightmapScaleOffsetArray) && (render.lightmapScaleOffset = new Vector4(lightmapScaleOffsetArray[0], lightmapScaleOffsetArray[1], lightmapScaleOffsetArray[2], lightmapScaleOffsetArray[3]));
        var meshPath;
        meshPath = data.meshPath;
        if (meshPath) {
            var mesh = Loader.getRes(meshPath); //加载失败mesh为空
            (mesh) && (this.meshFilter.sharedMesh = mesh);
        }
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
        var boundBox = data.boundBox;
        var min = boundBox.min;
        var max = boundBox.max;
        render.localBounds.setMin(new Vector3(min[0], min[1], min[2]));
        render.localBounds.setMax(new Vector3(max[0], max[1], max[2]));
        if (spriteMap) {
            var rootBoneData = data.rootBone;
            render.rootBone = spriteMap[rootBoneData];
            var bonesData = data.bones;
            var n;
            for (i = 0, n = bonesData.length; i < n; i++)
                render.bones.push(spriteMap[bonesData[i]]);
        }
        else { //[兼容代码]
            (data.rootBone) && (render._setRootBone(data.rootBone)); //[兼容性]
        }
    }
    /**
     * @inheritDoc
     */
    /*override*/ _changeHierarchyAnimator(animator) {
        super._changeHierarchyAnimator(animator);
        this.skinnedMeshRenderer._setCacheAnimator(animator);
    }
    /**
     * @inheritDoc
     */
    /*override*/ _changeAnimatorAvatar(avatar) {
        this.skinnedMeshRenderer._setCacheAvatar(avatar);
    }
    /**
     * @inheritDoc
     */
    /*override*/ _cloneTo(destObject, srcRoot, dstRoot) {
        var meshSprite3D = destObject;
        meshSprite3D.meshFilter.sharedMesh = this.meshFilter.sharedMesh;
        var meshRender = this._render;
        var destMeshRender = meshSprite3D._render;
        destMeshRender.enable = meshRender.enable;
        destMeshRender.sharedMaterials = meshRender.sharedMaterials;
        destMeshRender.castShadow = meshRender.castShadow;
        var lightmapScaleOffset = meshRender.lightmapScaleOffset;
        lightmapScaleOffset && (destMeshRender.lightmapScaleOffset = lightmapScaleOffset.clone());
        destMeshRender.receiveShadow = meshRender.receiveShadow;
        destMeshRender.sortingFudge = meshRender.sortingFudge;
        destMeshRender._rootBone = meshRender._rootBone;
        var bones = meshRender.bones;
        var destBones = destMeshRender.bones;
        var bonesCount = bones.length;
        destBones.length = bonesCount;
        var rootBone = meshRender.rootBone;
        if (rootBone) {
            var pathes = Utils3D._getHierarchyPath(srcRoot, rootBone, SkinnedMeshSprite3D._tempArray0);
            if (pathes)
                destMeshRender.rootBone = Utils3D._getNodeByHierarchyPath(dstRoot, pathes);
            else
                destMeshRender.rootBone = rootBone;
        }
        for (var i = 0; i < bones.length; i++) {
            pathes = Utils3D._getHierarchyPath(srcRoot, bones[i], SkinnedMeshSprite3D._tempArray0);
            if (pathes)
                destBones[i] = Utils3D._getNodeByHierarchyPath(dstRoot, pathes);
            else
                destBones[i] = bones[i];
        }
        var lbb = meshRender.localBounds;
        (lbb) && (lbb.cloneTo(destMeshRender.localBounds));
        super._cloneTo(destObject, srcRoot, dstRoot); //父类函数在最后,组件应该最后赋值，否则获取材质默认值等相关函数会有问题
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
     * @private
     */
    _create() {
        return new SkinnedMeshSprite3D();
    }
}
/**@private */
SkinnedMeshSprite3D._tempArray0 = [];
/**着色器变量名，蒙皮动画。*/
SkinnedMeshSprite3D.BONES = Shader3D.propertyNameToID("u_Bones");
/**@private */
SkinnedMeshSprite3D.shaderDefines = null;
