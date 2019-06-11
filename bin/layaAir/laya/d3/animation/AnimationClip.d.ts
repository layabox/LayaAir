import { KeyframeNodeList } from "././KeyframeNodeList";
import { AnimationEvent } from "././AnimationEvent";
import { Quaternion } from "../math/Quaternion";
import { Resource } from "laya/resource/Resource";
import { Handler } from "laya/utils/Handler";
/**
 * <code>AnimationClip</code> 类用于动画片段资源。
 */
export declare class AnimationClip extends Resource {
    /**AnimationClip资源。*/
    static ANIMATIONCLIP: string;
    /**@private	*/
    static _tempQuaternion0: Quaternion;
    /**
     * @inheritDoc
     */
    static _parse(data: any, propertyParams?: any, constructParams?: any[]): AnimationClip;
    /**
     * 加载动画片段。
     * @param url 动画片段地址。
     * @param complete  完成回掉。
     */
    static load(url: string, complete: Handler): void;
    /**@private */
    _duration: number;
    /**@private */
    _frameRate: number;
    /**@private */
    _nodes: KeyframeNodeList;
    /**@private */
    _nodesDic: any;
    /**@private */
    _nodesMap: any;
    /** @private */
    _animationEvents: AnimationEvent[];
    /**是否循环。*/
    islooping: boolean;
    /**
     * 获取动画片段时长。
     */
    duration(): number;
    /**
     * 创建一个 <code>AnimationClip</code> 实例。
     */
    constructor();
    /**
     * @private
     */
    private _hermiteInterpolate;
    /**
     * @private
     */
    private _hermiteInterpolateVector3;
    /**
     * @private
     */
    private _hermiteInterpolateQuaternion;
    /**
     * @private
     */
    _evaluateClipDatasRealTime(nodes: KeyframeNodeList, playCurTime: number, realTimeCurrentFrameIndexes: Int16Array, addtive: boolean, frontPlay: boolean): void;
    _evaluateClipDatasRealTimeForNative(nodes: any, playCurTime: number, realTimeCurrentFrameIndexes: Uint16Array, addtive: boolean): void;
    /**
     * @private
     */
    private _evaluateFrameNodeVector3DatasRealTime;
    /**
     * @private
     */
    private _evaluateFrameNodeQuaternionDatasRealTime;
    /**
     * @private
     */
    private _binarySearchEventIndex;
    /**
     * 添加动画事件。
     */
    addEvent(event: AnimationEvent): void;
    /**
     * @inheritDoc
     */
    protected _disposeResource(): void;
}
