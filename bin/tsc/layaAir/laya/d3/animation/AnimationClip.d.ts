import { AnimationEvent } from "./AnimationEvent";
import { Resource } from "../../resource/Resource";
import { Handler } from "../../utils/Handler";
/**
 * <code>AnimationClip</code> 类用于动画片段资源。
 */
export declare class AnimationClip extends Resource {
    /**AnimationClip资源。*/
    static ANIMATIONCLIP: string;
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
    private _hermiteInterpolate;
    private _hermiteInterpolateVector3;
    private _hermiteInterpolateQuaternion;
    _evaluateClipDatasRealTimeForNative(nodes: any, playCurTime: number, realTimeCurrentFrameIndexes: Uint16Array, addtive: boolean): void;
    private _evaluateFrameNodeVector3DatasRealTime;
    private _evaluateFrameNodeQuaternionDatasRealTime;
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
