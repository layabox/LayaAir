import { Node } from "../../display/Node";
import { Mesh } from "../resource/models/Mesh";
import { MeshFilter } from "./MeshFilter";
import { RenderableSprite3D } from "./RenderableSprite3D";
import { SkinnedMeshRenderer } from "./SkinnedMeshRenderer";
import { Sprite3D } from "./Sprite3D";
import { SkinnedMeshSprite3DShaderDeclaration } from "./SkinnedMeshSprite3DShaderDeclaration";
import { Shader3D } from "../../RenderEngine/RenderShader/Shader3D";
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
}

