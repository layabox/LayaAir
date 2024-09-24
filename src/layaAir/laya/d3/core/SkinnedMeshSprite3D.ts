import { Node } from "../../display/Node";
import { Loader } from "../../net/Loader";
import { Mesh } from "../resource/models/Mesh";
import { MeshFilter } from "./MeshFilter";
import { RenderableSprite3D } from "./RenderableSprite3D";
import { SkinnedMeshRenderer } from "./SkinnedMeshRenderer";
import { Sprite3D } from "./Sprite3D";
import { Material } from "../../resource/Material";
import { SkinnedMeshSprite3DShaderDeclaration } from "./SkinnedMeshSprite3DShaderDeclaration";
import { Shader3D } from "../../RenderEngine/RenderShader/Shader3D";
import { Vector3 } from "../../maths/Vector3";
import { Vector4 } from "../../maths/Vector4";
import { LayaGL } from "../../layagl/LayaGL";
import { ShaderDataType } from "../../RenderDriver/DriverDesign/RenderDevice/ShaderData";

/**
 * @en The `SkinnedMeshSprite3D` class is used for sprite with skinned mesh and bone nodes.
 * @zh `SkinnedMeshSprite3D` 类用于绑点骨骼节点精灵。
 */
export class SkinnedMeshSprite3D extends RenderableSprite3D {
    /**@internal */
    static _tempArray0: any[] = [];

    /**
     * @en Shader variable name for skinned animation.
     * @zh 着色器变量名，用于蒙皮动画。
     */
    static BONES: number;
    /**
     * @internal
     */
    static __init__(): void {
        SkinnedMeshSprite3DShaderDeclaration.SHADERDEFINE_BONE = Shader3D.getDefineByName("BONE");
        SkinnedMeshSprite3DShaderDeclaration.SHADERDEFINE_SIMPLEBONE = Shader3D.getDefineByName("SIMPLEBONE");
        const commandUniform = LayaGL.renderDeviceFactory.createGlobalUniformMap("Custom");
        SkinnedMeshSprite3D.BONES = Shader3D.propertyNameToID("u_Bones");
        commandUniform.addShaderUniform(SkinnedMeshSprite3D.BONES, "u_Bones", ShaderDataType.Buffer);
    }

    /** @internal */
    private _meshFilter: MeshFilter;

    /**
     * @en Mesh filter component.
     * @zh 网格过滤器。
     */
    get meshFilter(): MeshFilter {
        return this._meshFilter;
    }

    /**
     * @en Skinned mesh renderer component.
     * @zh 网格渲染器。
     */
    get skinnedMeshRenderer(): SkinnedMeshRenderer {
        return (<SkinnedMeshRenderer>this._render);
    }

    /**
     * @ignore
     * @en Creates an instance of SkinnedMeshSprite3D.
     * @param mesh The mesh to be used. The default material for the mesh will also be loaded.
     * @param name The name of the sprite.
     * @zh 创建一个 SkinnedMeshSprite3D 的实例。
     * @param mesh 网格,同时会加载网格所用默认材质。
     * @param name 名字。
     */
    constructor(mesh: Mesh = null, name: string = null) {
        super(name);
        this._meshFilter = this.addComponent(MeshFilter);
        this._render = this.addComponent(SkinnedMeshRenderer);
        (mesh) && (this._meshFilter.sharedMesh = mesh);
    }

    /**
     * @inheritDoc
     * @override
     * @internal
     */
    _parse(data: any, spriteMap: any): void {
        super._parse(data, spriteMap);
        var render: SkinnedMeshRenderer = this.skinnedMeshRenderer;
        var lightmapIndex: any = data.lightmapIndex;
        (lightmapIndex != null) && (render.lightmapIndex = lightmapIndex);
        var lightmapScaleOffsetArray: any[] = data.lightmapScaleOffset;
        (lightmapScaleOffsetArray) && (render.lightmapScaleOffset = new Vector4(lightmapScaleOffsetArray[0], lightmapScaleOffsetArray[1], lightmapScaleOffsetArray[2], lightmapScaleOffsetArray[3]));
        (data.enableRender != undefined) && (render.enabled = data.enableRender);
        (data.receiveShadows != undefined) && (render.receiveShadow = data.receiveShadows);
        (data.castShadow != undefined) && (render.castShadow = data.castShadow);
        var meshPath: string;
        meshPath = data.meshPath;
        if (meshPath) {
            var mesh: Mesh = Loader.getRes(meshPath);//加载失败mesh为空
            (mesh) && (this.meshFilter.sharedMesh = mesh);
        }

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

        var boundBox: any = data.boundBox;
        var min: any[] = boundBox.min;
        var max: any[] = boundBox.max;
        render.localBounds.setMin(new Vector3(min[0], min[1], min[2]));
        render.localBounds.setMax(new Vector3(max[0], max[1], max[2]));
        render.localBounds = render.localBounds;
        if (spriteMap) {
            var rootBoneData: number = data.rootBone;
            render.rootBone = spriteMap[rootBoneData];
            var bonesData: any[] = data.bones;
            var n: number;
            for (i = 0, n = bonesData.length; i < n; i++)
                (render as SkinnedMeshRenderer).bones.push(spriteMap[bonesData[i]]);
            
            render.bones = render.bones;
        }
    }

    /**
     * @inheritDoc
     * @override
     * @internal
     */
    _cloneTo(destObject: any, srcRoot: Node, dstRoot: Node): void {
        super._cloneTo(destObject, srcRoot, dstRoot);//父类函数在最后,组件应该最后赋值，否则获取材质默认值等相关函数会有问题
    }

    /**
     * @inheritDoc
     * @override
     * @en Destroy the SkinnedMeshSprite3D instance.
     * @param destroyChild Whether to destroy child nodes.
     * @zh 销毁 SkinnedMeshSprite3D 实例。
     * @param destroyChild 是否销毁子节点。
     */
    destroy(destroyChild: boolean = true): void {
        if (this._destroyed)
            return;
        super.destroy(destroyChild);
        this._meshFilter.destroy();
    }

    /**
     * @internal
     */
    protected _create(): Node {
        return new Sprite3D();
    }

}

