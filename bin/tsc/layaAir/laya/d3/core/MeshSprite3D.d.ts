import { RenderableSprite3D } from "././RenderableSprite3D";
import { MeshFilter } from "././MeshFilter";
import { MeshRenderer } from "././MeshRenderer";
import { Mesh } from "../resource/models/Mesh";
import { ShaderDefines } from "../shader/ShaderDefines";
import { Node } from "../../display/Node";
/**
 * <code>MeshSprite3D</code> 类用于创建网格。
 */
export declare class MeshSprite3D extends RenderableSprite3D {
    /**@private */
    static shaderDefines: ShaderDefines;
    /**
     * @private
     */
    static __init__(): void;
    /** @private */
    private _meshFilter;
    /**
     * 获取网格过滤器。
     * @return  网格过滤器。
     */
    readonly meshFilter: MeshFilter;
    /**
     * 获取网格渲染器。
     * @return  网格渲染器。
     */
    readonly meshRenderer: MeshRenderer;
    /**
     * 创建一个 <code>MeshSprite3D</code> 实例。
     * @param mesh 网格,同时会加载网格所用默认材质。
     * @param name 名字。
     */
    constructor(mesh?: Mesh, name?: string);
    /**
     * @inheritDoc
     */
    _parse(data: any, spriteMap: any): void;
    /**
     * @inheritDoc
     */
    _addToInitStaticBatchManager(): void;
    /**
     * @inheritDoc
     */
    _cloneTo(destObject: any, rootSprite: Node, dstSprite: Node): void;
    /**
     * @inheritDoc
     */
    destroy(destroyChild?: boolean): void;
    /**
     * @private
     */
    protected _create(): Node;
}
