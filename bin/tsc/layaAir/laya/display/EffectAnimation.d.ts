import { FrameAnimation } from "./FrameAnimation";
/**
 * <p> 动效模板。用于为指定目标对象添加动画效果。每个动效有唯一的目标对象，而同一个对象可以添加多个动效。 当一个动效开始播放时，其他动效会自动停止播放。</p>
 * <p> 可以通过LayaAir IDE创建。 </p>
 */
export declare class EffectAnimation extends FrameAnimation {
    /**
     * @private
     * 动效开始事件。
     */
    private static EFFECT_BEGIN;
    /**@private */
    private _target;
    /**@private */
    private _playEvent;
    /**@private */
    private _initData;
    /**@private */
    private _aniKeys;
    /**@private */
    private _effectClass;
    /**
     * 本实例的目标对象。通过本实例控制目标对象的属性变化。
     * @param v 指定的目标对象。
     */
    target: any;
    /**@private */
    private _onOtherBegin;
    /**
     * 设置开始播放的事件。本实例会侦听目标对象的指定事件，触发后播放相应动画效果。
     * @param event
     */
    playEvent: string;
    /**@private */
    private _addEvent;
    /**@private */
    private _onPlayAction;
    play(start?: any, loop?: boolean, name?: string): void;
    /**@private */
    private _recordInitData;
    /**
     * 设置提供数据的类。
     * @param classStr 类路径
     */
    effectClass: string;
    /**
     * 设置动画数据。
     * @param uiData
     */
    effectData: any;
    /**@private */
    protected _displayToIndex(value: number): void;
    /**@private */
    protected _displayNodeToFrame(node: any, frame: number, targetDic?: any): void;
    /**@private */
    protected _calculateKeyFrames(node: any): void;
}
