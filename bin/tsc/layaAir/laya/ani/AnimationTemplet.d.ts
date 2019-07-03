import { KeyFramesContent } from "./KeyFramesContent";
import { Resource } from "../resource/Resource";
/**
 * <code>AnimationTemplet</code> 类用于动画模板资源。
 */
export declare class AnimationTemplet extends Resource {
    static interpolation: any[];
    /**
     * @private
     */
    private static _LinearInterpolation_0;
    /**
     * @private
     */
    private static _QuaternionInterpolation_1;
    /**
     * @private
     */
    private static _AngleInterpolation_2;
    /**
     * @private
     */
    private static _RadiansInterpolation_3;
    /**
     * @private
     */
    private static _Matrix4x4Interpolation_4;
    /**
     * @private
     */
    private static _NoInterpolation_5;
    /**
     * @private
     */
    private static _BezierInterpolation_6;
    /**
     * @private
     */
    private static _BezierInterpolation_7;
    /**@private */
    protected unfixedCurrentFrameIndexes: Uint32Array;
    /**@private */
    protected unfixedCurrentTimes: Float32Array;
    /**@private */
    protected unfixedKeyframes: KeyFramesContent[];
    /**@private */
    protected unfixedLastAniIndex: number;
    /**@private */
    private _boneCurKeyFrm;
    constructor();
    /**
     * @private
     */
    parse(data: ArrayBuffer): void;
    getAnimationCount(): number;
    getAnimation(aniIndex: number): any;
    getAniDuration(aniIndex: number): number;
    getNodes(aniIndex: number): any;
    getNodeIndexWithName(aniIndex: number, name: string): number;
    getNodeCount(aniIndex: number): number;
    getTotalkeyframesLength(aniIndex: number): number;
    getPublicExtData(): ArrayBuffer;
    getAnimationDataWithCache(key: any, cacheDatas: any, aniIndex: number, frameIndex: number): Float32Array;
    setAnimationDataWithCache(key: any, cacheDatas: any[], aniIndex: number, frameIndex: number, data: any): void;
    /**
     * 计算当前时间应该对应关键帧的哪一帧
     * @param	nodeframes	当前骨骼的关键帧数据
     * @param	nodeid		骨骼id，因为要使用和更新 _boneCurKeyFrm
     * @param	tm
     * @return
     * 问题
     * 	最后一帧有问题，例如倒数第二帧时间是0.033ms,则后两帧非常靠近，当实际给最后一帧的时候，根据帧数计算出的时间实际上落在倒数第二帧
     *  	使用与AnimationPlayer一致的累积时间就行
     */
    getNodeKeyFrame(nodeframes: KeyFramesContent[], nodeid: number, tm: number): number;
    /**
     *
     * @param	aniIndex
     * @param	originalData
     * @param	nodesFrameIndices
     * @param	frameIndex
     * @param	playCurTime
     */
    getOriginalData(aniIndex: number, originalData: Float32Array, nodesFrameIndices: any[], frameIndex: number, playCurTime: number): void;
    getNodesCurrentFrameIndex(aniIndex: number, playCurTime: number): Uint32Array;
    getOriginalDataUnfixedRate(aniIndex: number, originalData: Float32Array, playCurTime: number): void;
}
