import { Sprite } from "../../display/Sprite";
import { Matrix } from "../../maths/Matrix";
import { Context } from "../../resource/Context";
/**
 * 对象 cacheas normal的时候，本质上只是想把submit缓存起来，以后直接执行
 * 为了避免各种各样的麻烦，这里采用复制相应部分的submit的方法。执行环境还是在原来的context中
 * 否则包括clip等都非常难以处理
 */
export declare class WebGLCacheAsNormalCanvas {
    submitStartPos: number;
    submitEndPos: number;
    context: Context;
    touches: any[];
    submits: any[];
    sprite: Sprite;
    private _pathMesh;
    private _triangleMesh;
    meshlist: any[];
    private _oldMesh;
    private _oldPathMesh;
    private _oldTriMesh;
    private _oldMeshList;
    private cachedClipInfo;
    private oldTx;
    private oldTy;
    private static matI;
    invMat: Matrix;
    constructor(ctx: Context, sp: Sprite);
    startRec(): void;
    endRec(): void;
    /**
     * 当前缓存是否还有效。例如clip变了就失效了，因为clip太难自动处理
     * @return
     */
    isCacheValid(): boolean;
    flushsubmit(): void;
    releaseMem(): void;
}
