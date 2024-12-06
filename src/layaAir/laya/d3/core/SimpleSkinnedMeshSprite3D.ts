import { Node } from "../../display/Node";
import { Mesh } from "../resource/models/Mesh";
import { MeshFilter } from "./MeshFilter";
import { RenderableSprite3D } from "./RenderableSprite3D";
import { Sprite3D } from "./Sprite3D";
import { SimpleSkinnedMeshRenderer } from "./SimpleSkinnedMeshRenderer";
import { Shader3D } from "../../RenderEngine/RenderShader/Shader3D";
import { LayaGL } from "../../layagl/LayaGL";
import { ShaderDataType } from "../../RenderDriver/DriverDesign/RenderDevice/ShaderData";



/**
 * @en The `SimpleSkinnedMeshSprite3D` class is used to create a simple skinned mesh.
 * @zh `SimpleSkinnedMeshSprite3D` 类用于创建简单网格。
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
     * @en The mesh filter component.
     * @zh 网格过滤器。
     */
    get meshFilter(): MeshFilter {
        return this._meshFilter;
    }

    /**
     * @en The simple skinned mesh renderer component.
     * @zh 网格渲染器。
     */
    get simpleSkinnedMeshRenderer(): SimpleSkinnedMeshRenderer {
        return (<SimpleSkinnedMeshRenderer>this._render);
    }

    /**
     * @en Constructor function.
     * @param mesh The mesh to use. The default material for the mesh will also be loaded.
     * @param name The name of the instance.
     * @zh 构造函数。
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
     */
    destroy(destroyChild: boolean = true): void {
        if (this._destroyed)
            return;
        super.destroy(destroyChild);
        this._meshFilter.destroy();
    }
}

