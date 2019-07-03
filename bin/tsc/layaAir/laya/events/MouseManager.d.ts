import { Sprite } from "../display/Sprite";
import { Stage } from "../display/Stage";
/**
 * <p><code>MouseManager</code> 是鼠标、触摸交互管理器。</p>
 * <p>鼠标事件流包括捕获阶段、目标阶段、冒泡阶段。<br/>
 * 捕获阶段：此阶段引擎会从stage开始递归检测stage及其子对象，直到找到命中的目标对象或者未命中任何对象；<br/>
 * 目标阶段：找到命中的目标对象；<br/>
 * 冒泡阶段：事件离开目标对象，按节点层级向上逐层通知，直到到达舞台的过程。</p>
 */
export declare class MouseManager {
    /**
     * MouseManager 单例引用。
     */
    static instance: MouseManager;
    /**是否开启鼠标检测，默认为true*/
    static enabled: boolean;
    /**是否开启多点触控*/
    static multiTouchEnabled: boolean;
    /** canvas 上的鼠标X坐标。*/
    mouseX: number;
    /** canvas 上的鼠标Y坐标。*/
    mouseY: number;
    /** 是否禁用除 stage 以外的鼠标事件检测。*/
    disableMouseEvent: boolean;
    /** 鼠标按下的时间。单位为毫秒。*/
    mouseDownTime: number;
    /** 鼠标移动精度。*/
    mouseMoveAccuracy: number;
    /** @private */
    private static _isTouchRespond;
    private _stage;
    /** @private 希望capture鼠标事件的对象。*/
    private _captureSp;
    /** @private 现在不支持直接把绝对坐标转到本地坐标，只能一级一级做下去，因此记录一下这个链*/
    private _captureChain;
    /** @private capture对象独占消息 */
    private _captureExlusiveMode;
    /** @private 在发送事件的过程中，是否发送给了_captureSp */
    private _hitCaputreSp;
    private _point;
    private _rect;
    private _target;
    private _lastMoveTimer;
    private _isLeftMouse;
    private _prePoint;
    private _touchIDs;
    private _curTouchID;
    private _id;
    private static _isFirstTouch;
    /**
     * @private
     * 初始化。
     */
    __init__(stage: Stage, canvas: any): void;
    private _tTouchID;
    private initEvent;
    private checkMouseWheel;
    private onMouseMove;
    private onMouseDown;
    private onMouseUp;
    private check;
    private hitTest;
    private _checkAllBaseUI;
    /**
     * 处理3d界面。
     * @param	mousex
     * @param	mousey
     * @param	callback
     * @return
     */
    check3DUI(mousex: number, mousey: number, callback: Function): boolean;
    handleExclusiveCapture(mousex: number, mousey: number, callback: Function): boolean;
    handleCapture(mousex: number, mousey: number, callback: Function): boolean;
    /**
     * 执行事件处理。
     */
    runEvent(evt: any): void;
    /**
     *
     * @param	sp
     * @param	exlusive  是否是独占模式
     */
    setCapture(sp: Sprite, exclusive?: boolean): void;
    releaseCapture(): void;
}
