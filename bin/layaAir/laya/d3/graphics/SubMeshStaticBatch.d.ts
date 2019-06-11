import { VertexDeclaration } from "././VertexDeclaration";
import { GeometryElement } from "../core/GeometryElement";
import { RenderableSprite3D } from "../core/RenderableSprite3D";
import { Sprite3D } from "../core/Sprite3D";
import { RenderContext3D } from "../core/render/RenderContext3D";
import { IDispose } from "laya/resource/IDispose";
/**
 * @private
 * <code>SubMeshStaticBatch</code> 类用于网格静态合并。
 */
export declare class SubMeshStaticBatch extends GeometryElement implements IDispose {
    /** @private */
    private static _tempVector30;
    /** @private */
    private static _tempVector31;
    /** @private */
    private static _tempQuaternion0;
    /** @private */
    private static _tempMatrix4x40;
    /** @private */
    private static _tempMatrix4x41;
    /** @private */
    static maxBatchVertexCount: number;
    /** @private */
    private static _batchIDCounter;
    /** @private */
    private _currentBatchVertexCount;
    /** @private */
    private _currentBatchIndexCount;
    /** @private */
    private _vertexDeclaration;
    /**@private */
    private _vertexBuffer;
    /**@private */
    private _indexBuffer;
    /** @private */
    private _bufferState;
    /** @private */
    _batchElements: RenderableSprite3D[];
    /** @private */
    _batchID: number;
    /** @private [只读]*/
    batchOwner: Sprite3D;
    /** @private [只读]*/
    number: number;
    /**
     * 创建一个 <code>SubMeshStaticBatch</code> 实例。
     */
    constructor(batchOwner: Sprite3D, number: number, vertexDeclaration: VertexDeclaration);
    /**
     * @private
     */
    private _getStaticBatchBakedVertexs;
    /**
     * @private
     */
    addTest(sprite: RenderableSprite3D): boolean;
    /**
     * @private
     */
    add(sprite: RenderableSprite3D): void;
    /**
     * @private
     */
    remove(sprite: RenderableSprite3D): void;
    /**
     * @private
     */
    finishInit(): void;
    /**
     * @inheritDoc
     */
    _render(state: RenderContext3D): void;
    /**
     * @private
     */
    dispose(): void;
}
