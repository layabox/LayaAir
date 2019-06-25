import { RenderableSprite3D } from "././RenderableSprite3D";
import { Mesh } from "../resource/models/Mesh";
/**
 * <code>MeshFilter</code> 类用于创建网格过滤器。
 */
export declare class MeshFilter {
    /** @private */
    private _owner;
    /** @private */
    private _sharedMesh;
    /**
     * 获取共享网格。
     * @return 共享网格。
     */
    /**
    * 设置共享网格。
    * @return  value 共享网格。
    */
    sharedMesh: Mesh;
    /**
     * 创建一个新的 <code>MeshFilter</code> 实例。
     * @param owner 所属网格精灵。
     */
    constructor(owner: RenderableSprite3D);
    /**
     * @private
     */
    private _getMeshDefine;
    /**
     * @inheritDoc
     */
    destroy(): void;
}
