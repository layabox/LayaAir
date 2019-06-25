import { SimpleSingletonList } from "../component/SimpleSingletonList";
import { SingletonList } from "../component/SingletonList";
import { Camera } from "../core/Camera";
import { RenderContext3D } from "../core/render/RenderContext3D";
import { Scene3D } from "../core/scene/Scene3D";
/**
 * @private
 * <code>FrustumCulling</code> 类用于裁剪。
 */
export declare class FrustumCulling {
    /**@private */
    private static _tempVector3;
    /**@private */
    private static _tempColor0;
    /**@private */
    static debugFrustumCulling: boolean;
    /**@private	[NATIVE]*/
    static _cullingBufferLength: number;
    /**@private	[NATIVE]*/
    static _cullingBuffer: Float32Array;
    /**
     * @private
     */
    static __init__(): void;
    /**
     * @private
     */
    private static _drawTraversalCullingBound;
    /**
     * @private
     */
    private static _traversalCulling;
    /**
     * @private
     */
    static renderObjectCulling(camera: Camera, scene: Scene3D, context: RenderContext3D, renderList: SingletonList): void;
    /**
     * @private [NATIVE]
     */
    static renderObjectCullingNative(camera: Camera, scene: Scene3D, context: RenderContext3D, renderList: SimpleSingletonList): void;
    /**
     * @private [NATIVE]
     */
    static cullingNative(boundFrustumBuffer: Float32Array, cullingBuffer: Float32Array, cullingBufferIndices: Int32Array, cullingCount: number, cullingBufferResult: Int32Array): number;
    /**
     * 创建一个 <code>FrustumCulling</code> 实例。
     */
    constructor();
}
