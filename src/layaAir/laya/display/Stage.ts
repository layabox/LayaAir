import { Sprite } from "./Sprite";
import { Node } from "./Node";
import { Config } from "./../../Config";
import { Input } from "./Input";
import { SpriteConst } from "./SpriteConst";
import { NodeFlags } from "../Const"
import { Event } from "../events/Event"
import { InputManager } from "../events/InputManager"
import { Matrix } from "../maths/Matrix"
import { Point } from "../maths/Point"
import { Render } from "../renders/Render"
import { RenderInfo } from "../renders/RenderInfo"
import { Context } from "../renders/Context"
import { HTMLCanvas } from "../resource/HTMLCanvas"
import { Browser } from "../utils/Browser"
import { CallLater } from "../utils/CallLater"
import { ColorUtils } from "../utils/ColorUtils"
import { RunDriver } from "../utils/RunDriver"
import { VectorGraphManager } from "../utils/VectorGraphManager"
import { RenderState2D } from "../webgl/utils/RenderState2D";
import { Stat } from "../utils/Stat";
import { ILaya } from "../../ILaya";
import { ComponentDriver } from "../components/ComponentDriver";
import { LayaEnv } from "../../LayaEnv";
import { LayaGL } from "../layagl/LayaGL";
import { Scene3D } from "../d3/core/scene/Scene3D";
import { Color } from "../maths/Color";
import { PERF_BEGIN, PERF_END, PerformanceDefine } from "../tools/PerformanceTool";

/**
 * stage大小经过重新调整时进行调度。
 * @eventType Event.RESIZE
 */
/*[Event(name = "resize", type = "laya.events.Event")]*/
/**
 * 舞台获得焦点时调度。比如浏览器或者当前标签处于后台，重新切换回来时进行调度。
 * @eventType Event.FOCUS
 */
/*[Event(name = "focus", type = "laya.events.Event")]*/
/**
 * 舞台失去焦点时调度。比如浏览器或者当前标签被切换到后台后调度。
 * @eventType Event.BLUR
 */
/*[Event(name = "blur", type = "laya.events.Event")]*/
/**
 * 舞台焦点变化时调度，使用Laya.stage.isFocused可以获取当前舞台是否获得焦点。
 * @eventType Event.FOCUS_CHANGE
 */
/*[Event(name = "focuschange", type = "laya.events.Event")]*/
/**
 * 舞台可见性发生变化时调度（比如浏览器或者当前标签被切换到后台后调度），使用Laya.stage.isVisibility可以获取当前是否处于显示状态。
 * @eventType Event.VISIBILITY_CHANGE
 */
/*[Event(name = "visibilitychange", type = "laya.events.Event")]*/
/**
 * 浏览器全屏更改时调度，比如进入全屏或者退出全屏。
 * @eventType Event.FULL_SCREEN_CHANGE
 */
/*[Event(name = "fullscreenchange", type = "laya.events.Event")]*/

/**
 * <p> <code>Stage</code> 是舞台类，显示列表的根节点，所有显示对象都在舞台上显示。通过 Laya.stage 单例访问。</p>
 * <p>Stage提供几种适配模式，不同的适配模式会产生不同的画布大小，画布越大，渲染压力越大，所以要选择合适的适配方案。</p>
 * <p>Stage提供不同的帧率模式，帧率越高，渲染压力越大，越费电，合理使用帧率甚至动态更改帧率有利于改进手机耗电。</p>
 */
export class Stage extends Sprite {
    /**应用保持设计宽高不变，不缩放不变形，stage的宽高等于设计宽高。*/
    static SCALE_NOSCALE: string = "noscale";
    /**应用根据屏幕大小铺满全屏，非等比缩放会变形，stage的宽高等于设计宽高。*/
    static SCALE_EXACTFIT: string = "exactfit";
    /**应用显示全部内容，按照最小比率缩放，等比缩放不变形，一边可能会留空白，stage的宽高等于设计宽高。*/
    static SCALE_SHOWALL: string = "showall";
    /**应用按照最大比率缩放显示，宽或高方向会显示一部分，等比缩放不变形，stage的宽高等于设计宽高。*/
    static SCALE_NOBORDER: string = "noborder";
    /**应用保持设计宽高不变，不缩放不变形，stage的宽高等于屏幕宽高。*/
    static SCALE_FULL: string = "full";
    /**应用保持设计宽度不变，高度根据屏幕比缩放，stage的宽度等于设计高度，高度根据屏幕比率大小而变化*/
    static SCALE_FIXED_WIDTH: string = "fixedwidth";
    /**应用保持设计高度不变，宽度根据屏幕比缩放，stage的高度等于设计宽度，宽度根据屏幕比率大小而变化*/
    static SCALE_FIXED_HEIGHT: string = "fixedheight";
    /**应用保持设计比例不变，全屏显示全部内容(类似showall，但showall非全屏，会有黑边)，根据屏幕长宽比，自动选择使用SCALE_FIXED_WIDTH或SCALE_FIXED_HEIGHT*/
    static SCALE_FIXED_AUTO: string = "fixedauto";

    // static SCALE_FIXED_AUTO_LAYAME: string = "fixedauto_layame";
    // static SCALE_FIXED_AUTO_LAYAVERSE: string = "fixedauto_layaverse";

    /**画布水平居左对齐。*/
    static ALIGN_LEFT: string = "left";
    /**画布水平居右对齐。*/
    static ALIGN_RIGHT: string = "right";
    /**画布水平居中对齐。*/
    static ALIGN_CENTER: string = "center";
    /**画布垂直居上对齐。*/
    static ALIGN_TOP: string = "top";
    /**画布垂直居中对齐。*/
    static ALIGN_MIDDLE: string = "middle";
    /**画布垂直居下对齐。*/
    static ALIGN_BOTTOM: string = "bottom";

    /**不更改屏幕。*/
    static SCREEN_NONE: string = "none";
    /**自动横屏。*/
    static SCREEN_HORIZONTAL: string = "horizontal";
    /**自动竖屏。*/
    static SCREEN_VERTICAL: string = "vertical";

    /**全速模式，以60的帧率运行。*/
    static FRAME_FAST: string = "fast";
    /**慢速模式，以30的帧率运行。*/
    static FRAME_SLOW: string = "slow";
    /**自动模式，以30的帧率运行，但鼠标活动后会自动加速到60，鼠标不动2秒后降低为30帧，以节省消耗。*/
    static FRAME_MOUSE: string = "mouse";
    /**休眠模式，以1的帧率运行*/
    static FRAME_SLEEP: string = "sleep";

    /**当前焦点对象，此对象会影响当前键盘事件的派发主体。*/
    focus: Node;
    /**@private 相对浏览器左上角的偏移，弃用，请使用_canvasTransform。*/
    offset: Point = new Point();
    /**帧率类型，支持三种模式：fast-60帧(默认)，slow-30帧，mouse-30帧（鼠标活动后会自动加速到60，鼠标不动2秒后降低为30帧，以节省消耗），sleep-1帧。*/
    private _frameRate: string = "fast";
    /**设计宽度（初始化时设置的宽度Laya.init(width,height)）*/
    designWidth: number = 0;
    /**设计高度（初始化时设置的高度Laya.init(width,height)）*/
    designHeight: number = 0;
    /**画布是否发生翻转。*/
    canvasRotation: boolean = false;
    /**画布的旋转角度。*/
    canvasDegree: number = 0;
    /**
     * <p>设置是否渲染，设置为false，可以停止渲染，画面会停留到最后一次渲染上，减少cpu消耗，此设置不影响时钟。</p>
     * <p>比如非激活状态，可以设置renderingEnabled=false以节省消耗。</p>
     * */
    renderingEnabled: boolean = true;
    /**是否启用屏幕适配，可以适配后，在某个时候关闭屏幕适配，防止某些操作导致的屏幕意外改变*/
    screenAdaptationEnabled: boolean = true;
    /**@internal */
    _canvasTransform: Matrix = new Matrix();
    /**@private */
    private _screenMode: string = "none";
    /**@private */
    private _scaleMode: string = "noscale";
    /**@private */
    private _alignV: string = "top";
    /**@private */
    private _alignH: string = "left";
    /**@private */
    private _bgColor: string = "gray";
    /**@internal */
    _mouseMoveTime: number = 0;
    /**@private */
    private _renderCount: number = 0;
    /**@private */
    private _safariOffsetY: number = 0;
    /**@private */
    private _frameStartTime: number = 0;
    /**@private */
    private _previousOrientation: number = Browser.window.orientation;
    /**@private */
    private _isFocused: boolean;
    /**@private */
    private _isVisibility: boolean;
    /**@internal webgl Color*/
    _wgColor = new Color(0, 0, 0, 0);// number[] | null = [0, 0, 0, 1];
    /**@internal */
    _scene3Ds: Scene3D[] = [];

    /**@private */
    private _globalRepaintSet: boolean = false;		// 设置全局重画标志。这个是给IDE用的。IDE的Image无法在onload的时候通知对应的sprite重画。
    /**@private */
    private _globalRepaintGet: boolean = false;		// 一个get一个set是为了把标志延迟到下一帧的开始，防止部分对象接收不到。

    /**使用物理分辨率作为canvas大小，会改进渲染效果，但是会降低性能*/
    useRetinalCanvas: boolean = false;

    /**场景类，引擎中只有一个stage实例，此实例可以通过Laya.stage访问。*/
    constructor() {
        super();
        super.set_transform(this._createTransform());
        //重置默认值，请不要修改
        this.mouseEnabled = true;
        this.hitTestPrior = true;
        this.autoSize = false;
        this._setBit(NodeFlags.DISPLAYED_INSTAGE, true);
        this._setBit(NodeFlags.ACTIVE_INHIERARCHY, true);
        this._isFocused = true;
        this._isVisibility = true;

        //this.drawCallOptimize=true;
        this.useRetinalCanvas = LayaEnv.isConch ? true : Config.useRetinalCanvas;

        var window: any = Browser.window;
        //var _me = this;	

        window.addEventListener("focus", () => {
            this._isFocused = true;
            this.event(Event.FOCUS);
            this.event(Event.FOCUS_CHANGE);
        });
        window.addEventListener("blur", () => {
            this._isFocused = false;
            this.event(Event.BLUR);
            this.event(Event.FOCUS_CHANGE);
            if (this._isInputting()) (Input["inputElement"] as any).target.focus = false;
        });

        // 各种浏览器兼容
        var state = "visibilityState", visibilityChange = "visibilitychange";
        var document: any = window.document;
        if (typeof document.hidden !== "undefined") {
            visibilityChange = "visibilitychange";
            state = "visibilityState";
        } else if (typeof document.mozHidden !== "undefined") {
            visibilityChange = "mozvisibilitychange";
            state = "mozVisibilityState";
        } else if (typeof document.msHidden !== "undefined") {
            visibilityChange = "msvisibilitychange";
            state = "msVisibilityState";
        } else if (typeof document.webkitHidden !== "undefined") {
            visibilityChange = "webkitvisibilitychange";
            state = "webkitVisibilityState";
        }

        window.document.addEventListener(visibilityChange, () => {
            if (Browser.document[state] == "hidden") {
                this._isVisibility = false;
                if (this._isInputting()) (Input["inputElement"] as any).target.focus = false;
            } else {
                this._isVisibility = true;
            }
            this.renderingEnabled = this._isVisibility;
            this.event(Event.VISIBILITY_CHANGE);
        });
        window.addEventListener("resize", () => {
            // 处理屏幕旋转。旋转后收起输入法。
            var orientation: any = Browser.window.orientation;
            if (orientation != null && orientation != this._previousOrientation && this._isInputting()) {
                (Input["inputElement"] as any).target.focus = false;
            }
            this._previousOrientation = orientation;

            // 弹出输入法不应对画布进行resize。
            if (this._isInputting()) return;

            // Safari横屏工具栏偏移
            if (Browser.onSafari)
                this._safariOffsetY = Browser.getSafariToolbarOffset();

            if (this.screenAdaptationEnabled) {
                this.event(Event.WILL_RESIZE);
                this.updateCanvasSize();
            }
        });

        // 微信的iframe不触发orientationchange。
        window.addEventListener("orientationchange", (e: any) => {
            if (this.screenAdaptationEnabled) {
                this.event(Event.WILL_RESIZE);
                this.updateCanvasSize();
            }
        });

        this._componentDriver = new ComponentDriver();
    }

    /**
     * @private
     * 在移动端输入时，输入法弹出期间不进行画布尺寸重置。
     */
    private _isInputting(): boolean {
        return (Browser.onMobile && InputManager.isTextInputting);
    }

    /**
     * @internal
     * @override
     * @param value 数值
     */
    set_width(value: number) {
        this.designWidth = value;
        super.set_width(value);
        this.updateCanvasSize(true);
    }

    /**
     * @internal
     * @override
     * @param value 数值
     */
    get_width(): number {
        this.needUpdateCanvasSize();
        return super.get_width();
    }

    /**
     * @override
     * @internal
     */
    set_height(value: number) {
        this.designHeight = value;
        super.set_height(value);
        this.updateCanvasSize(true);
    }

    /**
     * @override
     * @internal
     */
    get_height(): number {
        this.needUpdateCanvasSize();
        return super.get_height();
    }

    /**
     * @override
     * @en The matrix information of the object. By setting the matrix, node rotation, scaling, and displacement effects can be achieved.
     * @zh 对象的矩阵信息。通过设置矩阵可以实现节点旋转，缩放，位移效果。
     */
    get transform(): Matrix {
        if (this._tfChanged) this._adjustTransform();
        return (this._transform = this._transform || this._createTransform());
    }

    set transform(value: Matrix) {
        super.set_transform(value);
    }

    /**
     * 舞台是否获得焦点。
     */
    get isFocused(): boolean {
        return this._isFocused;
    }

    /**
     * 舞台是否处于可见状态(是否进入后台)。
     */
    get isVisibility(): boolean {
        return this._isVisibility;
    }

    private _needUpdateCanvasSize: boolean = false;

    /**
     * 更新canvas大小
     * @param delay 是否立即执行改动，如果是true，将延迟执行
     */
    updateCanvasSize(delay?: boolean): void {
        if (delay) {
            if (!this._needUpdateCanvasSize) {
                this._needUpdateCanvasSize = true;
                ILaya.systemTimer.callLater(this, this.updateCanvasSize);
            }
        }
        else {
            this.setScreenSize(Browser.clientWidth * Browser.pixelRatio, Browser.clientHeight * Browser.pixelRatio);
        }
    }

    /**
     * 同步最终canvas大小
     */
    needUpdateCanvasSize() {
        if (this._needUpdateCanvasSize)
            this.updateCanvasSize();
    }

    /**
     * 设置屏幕大小，场景会根据屏幕大小进行适配。可以动态调用此方法，来更改游戏显示的大小。
     * @param	screenWidth		屏幕宽度。
     * @param	screenHeight	屏幕高度。
     */
    setScreenSize(screenWidth: number, screenHeight: number): void {
        this._needUpdateCanvasSize = false;

        //计算是否旋转
        var rotation: boolean = false;
        if (this._screenMode !== Stage.SCREEN_NONE) {
            var screenType: string = screenWidth / screenHeight < 1 ? Stage.SCREEN_VERTICAL : Stage.SCREEN_HORIZONTAL;
            rotation = screenType !== this._screenMode;
            if (rotation) {
                //宽高互换
                var temp: number = screenHeight;
                screenHeight = screenWidth;
                screenWidth = temp;
            }
        }
        this.canvasRotation = rotation;

        var canvas: HTMLCanvas = Render._mainCanvas;
        var mat: Matrix = this._canvasTransform.identity();
        var scaleMode: string = this._scaleMode;
        var scaleX: number = screenWidth / this.designWidth;
        var scaleY: number = screenHeight / this.designHeight;
        var canvasWidth: number = this.useRetinalCanvas ? screenWidth : this.designWidth;
        var canvasHeight: number = this.useRetinalCanvas ? screenHeight : this.designHeight;
        var realWidth: number = screenWidth;
        var realHeight: number = screenHeight;
        var pixelRatio: number = Browser.pixelRatio;
        this._width = this.designWidth;
        this._height = this.designHeight;

        //处理缩放模式
        switch (scaleMode) {
            case Stage.SCALE_NOSCALE:
                scaleX = scaleY = 1;
                realWidth = this.designWidth;
                realHeight = this.designHeight;
                break;
            case Stage.SCALE_SHOWALL:
                scaleX = scaleY = Math.min(scaleX, scaleY);
                canvasWidth = realWidth = Math.round(this.designWidth * scaleX);
                canvasHeight = realHeight = Math.round(this.designHeight * scaleY);
                break;
            case Stage.SCALE_NOBORDER:
                scaleX = scaleY = Math.max(scaleX, scaleY);
                realWidth = Math.round(this.designWidth * scaleX);
                realHeight = Math.round(this.designHeight * scaleY);
                break;
            // case Stage.SCALE_FULL:
            //     scaleX = scaleY = 1;
            //     this._width = canvasWidth = screenWidth;
            //     this._height = canvasHeight = screenHeight;
            //     break;
            case Stage.SCALE_FULL:
                scaleX = scaleY = pixelRatio;
                canvasWidth = screenWidth;
                canvasHeight = screenHeight;
                this._width = screenWidth / pixelRatio;
                this._height = screenHeight / pixelRatio;
                break;
            case Stage.SCALE_FIXED_WIDTH:
                scaleY = scaleX;
                this._height = canvasHeight = Math.round(screenHeight / scaleX);
                break;
            case Stage.SCALE_FIXED_HEIGHT:
                scaleX = scaleY;
                this._width = canvasWidth = Math.round(screenWidth / scaleY);
                break;
            case Stage.SCALE_FIXED_AUTO:
                if ((screenWidth / screenHeight) < (this.designWidth / this.designHeight)) {
                    scaleY = scaleX;
                    this._height = canvasHeight = Math.round(screenHeight / scaleX);
                } else {
                    scaleX = scaleY;
                    this._width = canvasWidth = Math.round(screenWidth / scaleY);
                }
                break;
            // case Stage.SCALE_FIXED_AUTO_LAYAME:
            //     if (screenWidth < screenHeight) {
            //         scaleY = scaleX;
            //         this._height = canvasHeight = Math.round(screenHeight / scaleX);
            //     } else {
            //         scaleX = screenHeight / this.designWidth;
            //         scaleY = scaleX;
            //         this._width = canvasWidth = Math.round(screenWidth / scaleX);
            //         this._height = canvasHeight = Math.round(screenHeight / scaleY);
            //     }
            //     break;
            // case Stage.SCALE_FIXED_AUTO_LAYAVERSE:
            //     if (screenWidth > screenHeight) {
            //         scaleX = scaleY;
            //         this._width = canvasWidth = Math.round(screenWidth / scaleY);
            //     }
            //     else {
            //         scaleX = screenWidth / this.designHeight;
            //         scaleY = scaleX;
            //         this._width = canvasWidth = Math.round(screenWidth / scaleX);
            //         this._height = canvasHeight = Math.round(screenHeight / scaleY);
            //     }
            //     break;
        }

        if (this.useRetinalCanvas) {
            realWidth = canvasWidth = screenWidth;
            realHeight = canvasHeight = screenHeight;
        }

        //根据不同尺寸缩放stage画面
        scaleX *= this.scaleX;
        scaleY *= this.scaleY;
        if (scaleX === 1 && scaleY === 1) {
            this.transform.identity();
        } else {
            this.transform.a = this._formatData(scaleX / (realWidth / canvasWidth));
            this.transform.d = this._formatData(scaleY / (realHeight / canvasHeight));
        }

        //处理canvas大小
        canvas.size(canvasWidth, canvasHeight);
        RunDriver.changeWebGLSize(canvasWidth, canvasHeight);
        mat.scale(realWidth / canvasWidth / pixelRatio, realHeight / canvasHeight / pixelRatio);

        //处理水平对齐
        if (this._alignH === Stage.ALIGN_LEFT) this.offset.x = 0;
        else if (this._alignH === Stage.ALIGN_RIGHT) this.offset.x = screenWidth - realWidth;
        else this.offset.x = (screenWidth - realWidth) * 0.5 / pixelRatio;

        //处理垂直对齐
        if (this._alignV === Stage.ALIGN_TOP) this.offset.y = 0;
        else if (this._alignV === Stage.ALIGN_BOTTOM) this.offset.y = screenHeight - realHeight;
        else this.offset.y = (screenHeight - realHeight) * 0.5 / pixelRatio;

        //处理用户自行设置的画布偏移
        this.offset.x = Math.round(this.offset.x);
        this.offset.y = Math.round(this.offset.y);
        mat.translate(this.offset.x, this.offset.y);
        if (this._safariOffsetY) mat.translate(0, this._safariOffsetY);

        //处理横竖屏
        this.canvasDegree = 0;
        if (rotation) {
            if (this._screenMode === Stage.SCREEN_HORIZONTAL) {
                mat.rotate(Math.PI / 2);
                mat.translate(screenHeight / pixelRatio, 0);
                this.canvasDegree = 90;
            } else {
                mat.rotate(-Math.PI / 2);
                mat.translate(0, screenWidth / pixelRatio);
                this.canvasDegree = -90;
            }
        }

        mat.a = this._formatData(mat.a);
        mat.d = this._formatData(mat.d);
        mat.tx = this._formatData(mat.tx);
        mat.ty = this._formatData(mat.ty);

        super.set_transform(this.transform);
        Stage._setStageStyle(canvas, canvasWidth, canvasHeight, mat);
        //修正用户自行设置的偏移
        if (this._safariOffsetY) mat.translate(0, -this._safariOffsetY);
        this.visible = true;
        this._repaint |= SpriteConst.REPAINT_CACHE;

        this.event(Event.RESIZE);
    }

    /**
     * @internal
     * 适配淘宝小游戏
     * @param mainCanv 
     */
    static _setStageStyle(mainCanv: HTMLCanvas, canvasWidth: number, canvasHeight: number, mat: Matrix) {
        var canvasStyle: any = mainCanv.source.style;
        canvasStyle.transformOrigin = canvasStyle.webkitTransformOrigin = canvasStyle.msTransformOrigin = canvasStyle.mozTransformOrigin = canvasStyle.oTransformOrigin = "0px 0px 0px";
        canvasStyle.transform = canvasStyle.webkitTransform = canvasStyle.msTransform = canvasStyle.mozTransform = canvasStyle.oTransform = "matrix(" + mat.toString() + ")";
        canvasStyle.width = canvasWidth;
        canvasStyle.height = canvasHeight;
        mat.translate(parseInt(canvasStyle.left) || 0, parseInt(canvasStyle.top) || 0);
    }

    /**
     * 屏幕旋转用layaverse 需要
     * @param screenWidth 屏幕宽度
     * @param screenHeight 屏幕高度
     * @param _screenMode 屏幕模式 "none"为默认值，horizontal为横屏，vertical为竖屏
     * @returns 
     */
    setScreenSizeForScene(screenWidth: number, screenHeight: number, screenMode: string) {
        //计算是否旋转
        var rotation: boolean = false;
        if (/**this.*/screenMode !== Stage.SCREEN_NONE) {
            var screenType: string = screenWidth / screenHeight < 1 ? Stage.SCREEN_VERTICAL : Stage.SCREEN_HORIZONTAL;
            rotation = screenType !== /**this.*/screenMode;
            if (rotation) {
                //宽高互换
                var temp: number = screenHeight;
                screenHeight = screenWidth;
                screenWidth = temp;
            }
        }
        this.canvasRotation = rotation;

        var canvas: HTMLCanvas = Render._mainCanvas;
        var canvasStyle: any = canvas.source.style;
        var mat: Matrix = this._canvasTransform/**add */.clone().identity();
        var scaleMode: string = this._scaleMode;
        var scaleX: number = screenWidth / this.designWidth
        var scaleY: number = screenHeight / this.designHeight;
        var canvasWidth: number = this.useRetinalCanvas ? screenWidth : this.designWidth;
        var canvasHeight: number = this.useRetinalCanvas ? screenHeight : this.designHeight;
        var realWidth: number = screenWidth;
        var realHeight: number = screenHeight;
        var pixelRatio: number = Browser.pixelRatio;
        let /**this.*/_width = this.designWidth;
        let /**this.*/_height = this.designHeight;

        //处理缩放模式
        switch (scaleMode) {
            case Stage.SCALE_NOSCALE:
                scaleX = scaleY = 1;
                realWidth = this.designWidth;
                realHeight = this.designHeight;
                break;
            case Stage.SCALE_SHOWALL:
                scaleX = scaleY = Math.min(scaleX, scaleY);
                canvasWidth = realWidth = Math.round(this.designWidth * scaleX);
                canvasHeight = realHeight = Math.round(this.designHeight * scaleY);
                break;
            case Stage.SCALE_NOBORDER:
                scaleX = scaleY = Math.max(scaleX, scaleY);
                realWidth = Math.round(this.designWidth * scaleX);
                realHeight = Math.round(this.designHeight * scaleY);
                break;
            case Stage.SCALE_FULL:
                scaleX = scaleY = 1;
				/**this.*/_width = canvasWidth = screenWidth;
				/**this.*/_height = canvasHeight = screenHeight;
                break;
            case Stage.SCALE_FIXED_WIDTH:
                scaleY = scaleX;
				/**this.*/_height = canvasHeight = Math.round(screenHeight / scaleX);
                break;
            case Stage.SCALE_FIXED_HEIGHT:
                scaleX = scaleY;
				/**this.*/_width = canvasWidth = Math.round(screenWidth / scaleY);
                break;
            case Stage.SCALE_FIXED_AUTO:
                if ((screenWidth / screenHeight) < (this.designWidth / this.designHeight)) {
                    scaleY = scaleX;
					/**this.*/_height = canvasHeight = Math.round(screenHeight / scaleX);
                } else {
                    scaleX = scaleY;
					/**this.*/_width = canvasWidth = Math.round(screenWidth / scaleY);
                }
                break;
        }

        if (this.useRetinalCanvas) {
            realWidth = canvasWidth = screenWidth;
            realHeight = canvasHeight = screenHeight;
        }

        return {
            stageWidth: _width,
            stageHeight: _height,
            canvasWidth: canvasWidth,
            canvasHeight: canvasHeight,
            scaleX: scaleX / (realWidth / canvasWidth),
            scaleY: scaleY / (realHeight / canvasHeight),
        }
    }

    /**@private */
    private _formatData(value: number): number {
        if (Math.abs(value) < 0.000001) return 0;
        if (Math.abs(1 - value) < 0.001) return value > 0 ? 1 : -1;
        return value;
    }

    /**
     * <p>缩放模式。默认值为 "noscale"。</p>
     * <p><ul>取值范围：
     * <li>"noscale" ：不缩放；</li>
     * <li>"exactfit" ：全屏不等比缩放；</li>
     * <li>"showall" ：最小比例缩放；</li>
     * <li>"noborder" ：最大比例缩放；</li>
     * <li>"full" ：不缩放，stage的宽高等于屏幕宽高；</li>
     * <li>"fixedwidth" ：宽度不变，高度根据屏幕比缩放；</li>
     * <li>"fixedheight" ：高度不变，宽度根据屏幕比缩放；</li>
     * <li>"fixedauto" ：根据宽高比，自动选择使用fixedwidth或fixedheight；</li>
     * </ul></p>
     */
    get scaleMode(): string {
        return this._scaleMode;
    }

    set scaleMode(value: string) {
        this._scaleMode = value;
        this.updateCanvasSize(true);
    }

    /**
     * <p>水平对齐方式。默认值为"left"。</p>
     * <p><ul>取值范围：
     * <li>"left" ：居左对齐；</li>
     * <li>"center" ：居中对齐；</li>
     * <li>"right" ：居右对齐；</li>
     * </ul></p>
     */
    get alignH(): string {
        this.needUpdateCanvasSize();
        return this._alignH;
    }

    set alignH(value: string) {
        this._alignH = value;
        this.updateCanvasSize(true);
    }

    /**
     * <p>垂直对齐方式。默认值为"top"。</p>
     * <p><ul>取值范围：
     * <li>"top" ：居顶部对齐；</li>
     * <li>"middle" ：居中对齐；</li>
     * <li>"bottom" ：居底部对齐；</li>
     * </ul></p>
     */
    get alignV(): string {
        this.needUpdateCanvasSize();
        return this._alignV;
    }

    set alignV(value: string) {
        this._alignV = value;
        this.updateCanvasSize(true);
    }

    /**舞台的背景颜色，默认为黑色，null为透明。*/
    get bgColor(): string {
        return this._bgColor;
    }

    set bgColor(value: string) {
        this._bgColor = value;
        if (value) {
            let colorArr = ColorUtils.create(value).arrColor;
            this._wgColor.setValue(colorArr[0], colorArr[1], colorArr[2], colorArr[3]);
        }
        else
            this._wgColor = null;

        Stage._setStyleBgColor(value);
    }

    /**
     * @internal
     * 适配淘宝小游戏
     * @param value 
     */
    static _setStyleBgColor(value: string) {
        if (value) {
            Render.canvas.style.background = value;
        } else {
            Render.canvas.style.background = "none";
        }
    }

    /**鼠标在 Stage 上的 X 轴坐标。@override*/
    get mouseX(): number {
        return Math.round(InputManager.mouseX / this.clientScaleX);
    }

    /**鼠标在 Stage 上的 Y 轴坐标。@override*/
    get mouseY(): number {
        return Math.round(InputManager.mouseY / this.clientScaleY);
    }

    /**
     * 获得屏幕上的鼠标坐标信息
     * @returns 屏幕点信息
     */
    getMousePoint(): Point {
        return Point.TEMP.setTo(this.mouseX, this.mouseY);
    }

    /**
     * 当前视窗由缩放模式导致的 X 轴缩放系数。
     */
    get clientScaleX(): number {
        this.needUpdateCanvasSize();
        return this._transform ? this._transform.getScaleX() : 1;
    }

    /**
     * 当前视窗由缩放模式导致的 Y 轴缩放系数。
     */
    get clientScaleY(): number {
        this.needUpdateCanvasSize();
        return this._transform ? this._transform.getScaleY() : 1;
    }

    /**
     * <p>场景布局类型。</p>
     * <p><ul>取值范围：
     * <li>"none" ：不更改屏幕</li>
     * <li>"horizontal" ：自动横屏</li>
     * <li>"vertical" ：自动竖屏</li>
     * </ul></p>
     */
    get screenMode(): string {
        return this._screenMode;
    }

    set screenMode(value: string) {
        this._screenMode = value;
    }

    /**
     * @override
     * 重新绘制
     * @param type 重新绘制类型
     */
    repaint(type: number = SpriteConst.REPAINT_CACHE): void {
        this._repaint |= type;
    }

    /**
     * @override
     * 重新绘制父节点
     * @param type 重新绘制类型
     */
    parentRepaint(type: number = SpriteConst.REPAINT_CACHE): void {
    }

    /**@internal */
    _loop(): boolean {
        this._globalRepaintGet = this._globalRepaintSet;
        this._globalRepaintSet = false;
        this.render(Render._context, 0, 0);
        return true;
    }

    /**@private */
    getFrameTm(): number {
        return this._frameStartTime;
    }

    /**
     * <p>获得距当前帧开始后，过了多少时间，单位为毫秒。</p>
     * <p>可以用来判断函数内时间消耗，通过合理控制每帧函数处理消耗时长，避免一帧做事情太多，对复杂计算分帧处理，能有效降低帧率波动。</p>
     */
    getTimeFromFrameStart(): number {
        return Browser.now() - this._frameStartTime;
    }

    /**
     * @override
     * 表示是否可见，默认为true。如果设置不可见，节点将不被渲染。
     */
    get visible() {
        return super.visible;
    }

    set visible(value: boolean) {
        if (this.visible !== value) {
            super.set_visible(value);
            Stage._setVisibleStyle(value);
        }
    }


    /**
     * @internal
     * 适配淘宝小游戏
     * @param value 
     */
    static _setVisibleStyle(value: boolean) {
        var style: any = Render._mainCanvas.source.style;
        style.visibility = value ? "visible" : "hidden";
    }

    /**
     * 渲染舞台上的所有显示对象
     * @param context2D 渲染的上下文
     * @param x 横轴坐标
     * @param y 纵轴坐标
     * @returns 
     */
    render(context2D: Context, x: number, y: number): void {
        if (this._frameRate === Stage.FRAME_SLEEP) {
            var now: number = Browser.now();
            if (now - this._frameStartTime < 1000)
                return;
            this._frameStartTime = now;
        } else {
            if (!this._visible) {
                this._renderCount++;
                if (this._renderCount % 5 === 0) {
                    CallLater.I._update();
                    Stat.loopCount++;
                    RenderInfo.loopCount = Stat.loopCount;
                    this._runComponents();
                    this._updateTimers();
                }
                return;
            }
            this._frameStartTime = Browser.now();
            RenderInfo.loopStTm = this._frameStartTime;
        }

        this._renderCount++;
        var frameMode: string = this._frameRate === Stage.FRAME_MOUSE ? (((this._frameStartTime - this._mouseMoveTime) < 2000) ? Stage.FRAME_FAST : Stage.FRAME_SLOW) : this._frameRate;
        var isFastMode: boolean = (frameMode !== Stage.FRAME_SLOW);
        var isDoubleLoop: boolean = (this._renderCount % 2 === 0);

        Stat.renderSlow = !isFastMode;
        if (!isFastMode && !isDoubleLoop)//统一双帧处理渲染
            return;

        CallLater.I._update();
        Stat.loopCount++;
        RenderInfo.loopCount = Stat.loopCount;

        if (this.renderingEnabled) {

            for (let i = 0, n = this._scene3Ds.length; i < n; i++)//更新3D场景,必须提出来,否则在脚本中移除节点会导致BUG
                (<any>this._scene3Ds[i])._update();
            this._runComponents();
            this._componentDriver.callPreRender();

            //仅仅是clear
            context2D.render2D.renderStart(!Config.preserveDrawingBuffer, this._wgColor);
            //context2D.render2D.renderEnd();

            //Stage.clear(this._bgColor);
            //先渲染3d
            for (let i = 0, n = this._scene3Ds.length; i < n; i++)//更新3D场景,必须提出来,否则在脚本中移除节点会导致BUG
                (<any>this._scene3Ds[i]).renderSubmit();
            //再渲染2d
            this._render2d(context2D, x, y);

            this._componentDriver.callPostRender();

            VectorGraphManager.instance && VectorGraphManager.getInstance().endDispose();
        }
        else
            this._runComponents();

        this._updateTimers();
    }

    /**
     * @override
     * @param context2D
     * @param x
     * @param y
     * @perfTag PerformanceDefine.T_UIRender
     */
    private _render2d(context2D: Context, x: number, y: number) {
        Stat.draw2D = 0;
        context2D.startRender();
        super.render(context2D, x, y);
        Stat.render(context2D, x, y);
        context2D.endRender();
    }

    private _runComponents() {
        this._componentDriver.callStart();
        this._componentDriver.callUpdate();
        this._componentDriver.callLateUpdate();
        this._componentDriver.callDestroy();
    }

    private _updateTimers(): void {
        ILaya.systemTimer._update();
        ILaya.physicsTimer._update();
        ILaya.timer._update();
    }

    /**
     * <p>是否开启全屏，用户点击后进入全屏。</p>
     * <p>兼容性提示：部分浏览器不允许点击进入全屏，比如Iphone等。</p>
     */
    set fullScreenEnabled(value: boolean) {
        var document: any = Browser.document;
        var canvas: any = Render.canvas;
        if (value) {
            canvas.addEventListener('mousedown', requestFullscreen);
            canvas.addEventListener('touchstart', requestFullscreen);
            document.addEventListener("fullscreenchange", fullScreenChanged);
            document.addEventListener("mozfullscreenchange", fullScreenChanged);
            document.addEventListener("webkitfullscreenchange", fullScreenChanged);
            document.addEventListener("msfullscreenchange", fullScreenChanged);
        } else {
            canvas.removeEventListener('mousedown', requestFullscreen);
            canvas.removeEventListener('touchstart', requestFullscreen);
            document.removeEventListener("fullscreenchange", fullScreenChanged);
            document.removeEventListener("mozfullscreenchange", fullScreenChanged);
            document.removeEventListener("webkitfullscreenchange", fullScreenChanged);
            document.removeEventListener("msfullscreenchange", fullScreenChanged);
        }
    }

    /**退出全屏模式*/
    exitFullscreen(): void {
        var document: any = Browser.document;
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }

    get frameRate(): string {
        return this._frameRate;
    }

    set frameRate(value: string) {
        this._frameRate = value;
    }

    /**@private */
    isGlobalRepaint(): boolean {
        return this._globalRepaintGet;
    }

    /**@private */
    setGlobalRepaint(): void {
        this._globalRepaintSet = true;
    }
}

function requestFullscreen(): void {
    var element: any = Browser.document.documentElement;
    if (element.requestFullscreen) {
        element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
    }

    var canvas: any = Render.canvas;
    canvas.removeEventListener('mousedown', requestFullscreen);
    canvas.removeEventListener('touchstart', requestFullscreen);
}

function fullScreenChanged(): void {
    ILaya.stage.event(Event.FULL_SCREEN_CHANGE);
}