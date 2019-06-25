import { Touch } from "././Touch";
import { Scene3D } from "./core/scene/Scene3D";
/**
 * <code>Input3D</code> 类用于实现3D输入。
 */
export declare class Input3D {
    /**@private */
    private static _tempPoint;
    /**@private */
    private static _tempVector20;
    /**@private */
    private static _tempRay0;
    /**@private */
    private static _tempHitResult0;
    /**@private */
    private _scene;
    /**@private */
    private _eventList;
    /**@private */
    private _mouseTouch;
    /**@private */
    private _touchPool;
    /**@private */
    private _touches;
    /**@private */
    private _multiTouchEnabled;
    /**
     *@private
     */
    __init__(canvas: any, scene: Scene3D): void;
    /**
     * 获取触摸点个数。
     * @return 触摸点个数。
     */
    touchCount(): number;
    /**
     * 获取是否可以使用多点触摸。
     * @return 是否可以使用多点触摸。
     */
    /**
    * 设置是否可以使用多点触摸。
    * @param 是否可以使用多点触摸。
    */
    multiTouchEnabled: boolean;
    /**
     * @private
     * 创建一个 <code>Input3D</code> 实例。
     */
    constructor();
    /**
     * @private
     */
    private _getTouch;
    /**
     * @private
     */
    private _mouseTouchDown;
    /**
     * @private
     */
    private _mouseTouchUp;
    /**
     * @private
     */
    private _mouseTouchRayCast;
    /**
     * @private
     * @param flag 0:add、1:remove、2:change
     */
    _changeTouches(changedTouches: any[], flag: number): void;
    /**
     * @private
     */
    _update(): void;
    /**
     *	获取触摸点。
     * 	@param	index 索引。
     * 	@return 触摸点。
     */
    getTouch(index: number): Touch;
}
