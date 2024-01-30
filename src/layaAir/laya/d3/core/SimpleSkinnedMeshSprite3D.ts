import { Node } from "../../display/Node";
import { Loader } from "../../net/Loader";
import { Mesh } from "../resource/models/Mesh";
import { MeshFilter } from "./MeshFilter";
import { RenderableSprite3D } from "./RenderableSprite3D";
import { Sprite3D } from "./Sprite3D";
import { Material } from "../../resource/Material";
import { SimpleSkinnedMeshRenderer } from "./SimpleSkinnedMeshRenderer";
import { Texture2D } from "../../resource/Texture2D";
import { Shader3D } from "../../RenderEngine/RenderShader/Shader3D";
import { Vector3 } from "../../maths/Vector3";
import { Vector4 } from "../../maths/Vector4";
import { LayaGL } from "../../layagl/LayaGL";
import { ShaderDataType } from "../../RenderDriver/RenderModuleData/Design/ShaderData";



/**
 * <code>SkinnedMeshSprite3D</code> 类用于创建网格。
 */
export class SimpleSkinnedMeshSprite3D extends RenderableSprite3D {
    /**@internal */
    static _tempArray0: any[] = [];

    /** */
    static SIMPLE_SIMPLEANIMATORTEXTURE: number;
    static SIMPLE_SIMPLEANIMATORPARAMS: number;
    static SIMPLE_SIMPLEANIMATORTEXTURESIZE: number;
    /**
     * @internal
     */
    static __init__(): void {
        SimpleSkinnedMeshRenderer.SIMPLE_SIMPLEANIMATORPARAMS = SimpleSkinnedMeshSprite3D.SIMPLE_SIMPLEANIMATORPARAMS;
        SimpleSkinnedMeshRenderer.SIMPLE_SIMPLEANIMATORTEXTURE = SimpleSkinnedMeshSprite3D.SIMPLE_SIMPLEANIMATORTEXTURE;
        SimpleSkinnedMeshRenderer.SIMPLE_SIMPLEANIMATORTEXTURESIZE = SimpleSkinnedMeshSprite3D.SIMPLE_SIMPLEANIMATORTEXTURESIZE;

        SimpleSkinnedMeshSprite3D.SIMPLE_SIMPLEANIMATORTEXTURE = Shader3D.propertyNameToID("u_SimpleAnimatorTexture");
        SimpleSkinnedMeshSprite3D.SIMPLE_SIMPLEANIMATORPARAMS = Shader3D.propertyNameToID("u_SimpleAnimatorParams");
        SimpleSkinnedMeshSprite3D.SIMPLE_SIMPLEANIMATORTEXTURESIZE = Shader3D.propertyNameToID("u_SimpleAnimatorTextureSize");

        const commandUniform = LayaGL.renderDeviceFactory.createGlobalUniformMap("SimpleSkinnedMesh");
        commandUniform.addShaderUniform(SimpleSkinnedMeshSprite3D.SIMPLE_SIMPLEANIMATORTEXTURE, "u_SimpleAnimatorTexture", ShaderDataType.Texture2D);
        commandUniform.addShaderUniform(SimpleSkinnedMeshSprite3D.SIMPLE_SIMPLEANIMATORPARAMS, "u_SimpleAnimatorParams", ShaderDataType.Vector4);
        commandUniform.addShaderUniform(SimpleSkinnedMeshSprite3D.SIMPLE_SIMPLEANIMATORTEXTURESIZE, "u_SimpleAnimatorTextureSize", ShaderDataType.Float);
    }

    /** @internal */
    private _meshFilter: MeshFilter;

    /**
     * 网格过滤器。
     */
    get meshFilter(): MeshFilter {
        return this._meshFilter;
    }

    /**
     * 网格渲染器。
     */
    get simpleSkinnedMeshRenderer(): SimpleSkinnedMeshRenderer {
        return (<SimpleSkinnedMeshRenderer>this._render);
    }

    /**
     * 创建一个 <code>MeshSprite3D</code> 实例。
     * @param mesh 网格,同时会加载网格所用默认材质。
     * @param name 名字。
     */
    constructor(mesh: Mesh = null, name: string = null) {
        super(name);
        this._meshFilter = this.addComponent(MeshFilter);
        this._render = this.addComponent(SimpleSkinnedMeshRenderer);
        (mesh) && (this._meshFilter.sharedMesh = mesh);
    }

    /**
     * @inheritDoc
     * @override
     * @internal
     */
    _parse(data: any, spriteMap: any): void {
        super._parse(data, spriteMap);
        var render: SimpleSkinnedMeshRenderer = this.simpleSkinnedMeshRenderer;
        var lightmapIndex: any = data.lightmapIndex;
        (lightmapIndex != null) && (render.lightmapIndex = lightmapIndex);
        var lightmapScaleOffsetArray: any[] = data.lightmapScaleOffset;
        (lightmapScaleOffsetArray) && (render.lightmapScaleOffset = new Vector4(lightmapScaleOffsetArray[0], lightmapScaleOffsetArray[1], lightmapScaleOffsetArray[2], lightmapScaleOffsetArray[3]));
        (data.enableRender != undefined) && (render.enabled = data.enableRender);
        (data.receiveShadows != undefined) && (render.receiveShadow = data.receiveShadows);
        (data.castShadow != undefined) && (render.castShadow = data.castShadow);
        let meshPath: string = data.meshPath;
        if (meshPath) {
            let mesh: Mesh = Loader.getRes(meshPath);//加载失败mesh为空
            (mesh) && (this.meshFilter.sharedMesh = mesh);
        }

        var materials: any[] = data.materials;
        if (materials) {
            let sharedMaterials: Material[] = render.sharedMaterials;
            let materialCount: number = materials.length;
            sharedMaterials.length = materialCount;
            for (let i = 0; i < materialCount; i++) {
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
            let rootBoneData: number = data.rootBone;
            render.rootBone = spriteMap[rootBoneData];
            let bonesData: any[] = data.bones;
            for (let i = 0, n = bonesData.length; i < n; i++)
                render.bones.push(spriteMap[bonesData[i]]);

            render._bonesNums = data.bonesNums ? data.bonesNums : render.bones.length;
        }
        // else {//[兼容代码]
        // 	(data.rootBone) && (render._setRootBone(data.rootBone));//[兼容性]
        // }
        var animatorTexture: string = data.animatorTexture;
        if (animatorTexture) {
            let animatortexture: Texture2D = Loader.getRes(animatorTexture, Loader.TEXTURE2D);
            render.simpleAnimatorTexture = animatortexture;
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

