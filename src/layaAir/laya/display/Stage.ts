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
import { Stat } from "../utils/Stat";
import { ILaya } from "../../ILaya";
import { ComponentDriver } from "../components/ComponentDriver";
import { LayaEnv } from "../../LayaEnv";
import { Scene3D } from "../d3/core/scene/Scene3D";
import { Color } from "../maths/Color";
import { LayaGL } from "../layagl/LayaGL";

/**
 * @en Dispatched when the stage size is resized.
 * @zh stage大小经过重新调整时进行调度。
 * @eventType Event.RESIZE
 */
/*[Event(name = "resize", type = "laya.events.Event")]*/
/**
 * @en Dispatched when the stage gains focus. For example, when the browser or current tab is switched back from the background.
 * @zh 舞台获得焦点时调度。比如浏览器或者当前标签处于后台，重新切换回来时进行调度。
 * @eventType Event.FOCUS
 */
/*[Event(name = "focus", type = "laya.events.Event")]*/
/**
 * @en Dispatched when the stage loses focus. For example, when the browser or current tab is switched to the background.
 * @zh 舞台失去焦点时调度。比如浏览器或者当前标签被切换到后台后调度。
 * @eventType Event.BLUR
 */
/*[Event(name = "blur", type = "laya.events.Event")]*/
/**
 * @en Dispatched when the stage focus changes. Use Laya.stage.isFocused to get whether the current stage has focus.
 * @zh 舞台焦点变化时调度，使用Laya.stage.isFocused可以获取当前舞台是否获得焦点。
 * @eventType Event.FOCUS_CHANGE
 */
/*[Event(name = "focuschange", type = "laya.events.Event")]*/
/**
 * @en Dispatched when the stage visibility changes (e.g., when the browser or current tab is switched to the background). Use Laya.stage.isVisibility to get the current visibility state.
 * @zh 舞台可见性发生变化时调度（比如浏览器或者当前标签被切换到后台后调度），使用Laya.stage.isVisibility可以获取当前是否处于显示状态。
 * @eventType Event.VISIBILITY_CHANGE
 */
/*[Event(name = "visibilitychange", type = "laya.events.Event")]*/
/**
 * @en Dispatched when the browser fullscreen state changes, such as entering or exiting fullscreen mode.
 * @zh 浏览器全屏更改时调度，比如进入全屏或者退出全屏。
 * @eventType Event.FULL_SCREEN_CHANGE
 */
/*[Event(name = "fullscreenchange", type = "laya.events.Event")]*/

/**
 * @en Stage is the root node of the display list. All display objects are shown on the stage. It can be accessed through the Laya.stage singleton.
 * Stage provides several adaptation modes. Different adaptation modes will produce different canvas sizes. The larger the canvas, the greater the rendering pressure, so it's important to choose an appropriate adaptation scheme.
 * Stage provides different frame rate modes. The higher the frame rate, the greater the rendering pressure and power consumption. Reasonable use of frame rates or even dynamic changes in frame rates can help improve mobile phone power consumption.
 * @zh Stage 是舞台类，显示列表的根节点，所有显示对象都在舞台上显示。通过 Laya.stage 单例访问。
 * Stage提供几种适配模式，不同的适配模式会产生不同的画布大小，画布越大，渲染压力越大，所以要选择合适的适配方案。
 * Stage提供不同的帧率模式，帧率越高，渲染压力越大，越费电，合理使用帧率甚至动态更改帧率有利于改进手机耗电。
 */
export class Stage extends Sprite {
    /**
     * @en No scaling is applied, and the stage is displayed at its design size. The actual width and height of the canvas are set to the design width and height. This mode is suitable for applications that want to maintain the original design ratio, but it may result in blank areas or content overflow on different devices.
     * @zh 不进行缩放，舞台按照设计尺寸显示，画布的实际宽度和高度设置为设计宽度和高度。这种模式适合希望保持原始设计比例的应用，但在不同设备上可能会出现空白区域或内容超出屏幕的情况。
     */
    static SCALE_NOSCALE: string = "noscale";

    /**
     * @en The stage is scaled to fit the screen while maintaining the aspect ratio, ensuring the entire stage content is visible. The actual width and height of the canvas are calculated based on the design width and height multiplied by the minimum scale factor. While this prevents content from being cut off, it may result in blank borders at the top/bottom or sides.
     * @zh 保持纵横比的情况下，将舞台缩放以适应屏幕，确保整个舞台内容可见。画布的实际宽度和高度根据设计宽度和高度乘以最小缩放因子计算。虽然避免了内容被裁切，但可能会出现上下或左右的空白边缘。
     */
    static SCALE_SHOWALL: string = "showall";

    /**
     * @en The stage is scaled to fill the screen, with the actual width and height of the canvas calculated based on the design width and height multiplied by the maximum scale factor. This mode ensures that content fully covers the display area, but it may result in some content being cut off.
     * @zh 将舞台缩放以填满屏幕，画布的实际宽度和高度根据设计宽度和高度乘以最大缩放因子计算。这种模式保证内容完全覆盖屏幕，但可能会导致部分设计内容被裁切。
     */
    static SCALE_NOBORDER: string = "noborder";

    /**
     * @en Set the stage and canvas directly to the screen's width and height. Other aspects are the same as the SCALE_NOSCALE mode, with no scaling applied to the design content itself. This mode is suitable for scenarios where you want to fully utilize the screen space and handle dynamic layout on the screen yourself.
     * @zh 将舞台与画布直接设置为屏幕宽度和高度，其它方面与SCALE_NOSCALE模式一样，不对设计内容本身进行缩放。这种模式适用于希望完全利用屏幕空间，自行对屏幕动态排版的需求。
     */
    static SCALE_FULL: string = "full";

    /**
     * @en The stage width is kept fixed, and scaling is done based on the screen height. The canvas height is calculated based on the screen height and scale factor, and the stage height is set accordingly. This mode ensures consistent width but may alter the height ratio on different devices.
     * @zh 保持舞台的宽度固定，根据屏幕高度进行缩放。画布的高度根据屏幕高度和缩放因子计算，并设置舞台的高度。这种模式确保宽度一致，但在不同设备上可能会改变高度比例。
     */
    static SCALE_FIXED_WIDTH: string = "fixedwidth";

    /**
     * @en The stage height is kept fixed, and scaling is done based on the screen width. The canvas width is calculated based on the screen width and scale factor, and the stage width is set accordingly. This mode ensures consistent height but may alter the width ratio on different devices.
     * @zh 保持舞台的高度固定，根据屏幕宽度进行缩放。画布的宽度根据屏幕宽度和缩放因子计算，并设置舞台的宽度。这种模式确保高度一致，但在不同设备上可能会改变宽度比例。
     */
    static SCALE_FIXED_HEIGHT: string = "fixedheight";

    /**
     * @en The scaling method is automatically chosen based on the comparison between the screen aspect ratio and the design aspect ratio. If the screen aspect ratio is less than the design aspect ratio, the width is kept fixed with equal scale factors and the canvas height is calculated; otherwise, the height is kept fixed with equal scale factors and the canvas width is calculated. This mode flexibly adapts to different devices but may result in content being cut off or blank borders appearing.
     * @zh 根据屏幕宽高比与设计宽高比的比较，自动选择缩放方式；如果屏幕宽高比小于设计宽高比，则保持宽度固定，缩放因子相等并计算画布高度；否则，保持高度固定，缩放因子相等并计算画布宽度。这种模式可以灵活适应不同的设备，但可能会导致内容被裁切或出现空白边缘。
     */
    static SCALE_FIXED_AUTO: string = "fixedauto";



    /**
     * @en Canvas is horizontally aligned to the left.
     * @zh 画布水平居左对齐。
     */
    static ALIGN_LEFT: string = "left";
    /**
     * @en Canvas is horizontally aligned to the right.
     * @zh 画布水平居右对齐。
     */
    static ALIGN_RIGHT: string = "right";
    /**
     * @en Canvas is horizontally centered.
     * @zh 画布水平居中对齐。
     */
    static ALIGN_CENTER: string = "center";
    /**
     * @en Canvas is vertically aligned to the top.
     * @zh 画布垂直居上对齐。
     */
    static ALIGN_TOP: string = "top";
    /**
     * @en Canvas is vertically centered.
     * @zh 画布垂直居中对齐。
     */
    static ALIGN_MIDDLE: string = "middle";
    /**
     * @en Canvas is vertically aligned to the bottom.
     * @zh 画布垂直居下对齐。
     */
    static ALIGN_BOTTOM: string = "bottom";

    /**
     * @en Do not change the screen orientation.
     * @zh 不更改屏幕。
     */
    static SCREEN_NONE: string = "none";
    /**
     * @en Automatically switch to landscape mode.
     * @zh 自动横屏。
     */
    static SCREEN_HORIZONTAL: string = "horizontal";
    /**
     * @en Automatically switch to portrait mode.
     * @zh 自动竖屏。
     */
    static SCREEN_VERTICAL: string = "vertical";

    /**
     * @en Fast mode, running at the configured maximum frame rate (not exceeding the device's maximum frame rate).
     * @zh 快速模式，以配置的最高帧率运行（不得超过设备最高帧率）。
     */
    static FRAME_FAST: string = "fast";
    /**
     * @en Slow mode has a frame rate that is half of the fast mode. The principle is to skip rendering every other frame. For example, if the maximum frame rate in fast mode is 60, the maximum frame rate in slow mode would be 30.
     * @zh 慢速模式的帧率是快速模式的一半，其原理是每隔一帧就会跳过渲染。例如快速模式的满帧为60时，慢速模式的满帧则为30。
     */
    static FRAME_SLOW: string = "slow";
    /**
     * @en Mouse mode, In this mode, it checks if the last mouse movement occurred within the last two seconds. If it did, `frameMode` will be set to `FRAME_FAST`; otherwise, it will be set to `FRAME_SLOW`.
     * @zh 鼠标模式，该模式下，会检查上一次鼠标移动的时间，如果是在最近的两秒内，帧率的模式会采用快速模式，否则采用慢速模式。
     */
    static FRAME_MOUSE: string = "mouse";
    /**
     * @en Sleep mode, running at 1 frame per second.
     * @zh 休眠模式，以每秒1帧的速度运行。
     */
    static FRAME_SLEEP: string = "sleep";

    /**
     * @en The current focus object, which will affect the dispatch of current keyboard events.
     * @zh 当前焦点对象，此对象会影响当前键盘事件的派发主体。
     */
    focus: Node;
    /**
     * @private
     * @deprecated
     * @en Offset relative to the browser's top-left corner, deprecated, please use _canvasTransform.
     * @zh 相对浏览器左上角的偏移，弃用，请使用_canvasTransform。
     */
    offset: Point = new Point();
    /**
     * @en Frame rate types:fast (default, full frame rate),slow (half of the full frame rate),mouse (full frame rate after mouse activity, switches to half frame rate if the mouse is idle for 2 seconds),sleep (1 frame per second)
     * @zh 帧率类型：fast(默认，满帧)，slow（满帧减半），mouse（鼠标活动后满帧，鼠标不动2秒后满帧减半），sleep（每秒1帧）。
     */
    private _frameRate: string = "fast";
    /**
     * @en Design width (the width set during initialization Laya.init(width,height))
     * @zh 设计宽度（初始化时设置的宽度Laya.init(width,height)）
     */
    designWidth: number = 0;
    /**
     * @en Design height (the height set during initialization Laya.init(width,height))
     * @zh 设计高度（初始化时设置的高度Laya.init(width,height)）
     */
    designHeight: number = 0;
    /**
     * @en Whether the canvas has been flipped.
     * @zh 画布是否发生翻转。
     */
    canvasRotation: boolean = false;
    /**
     * @en The rotation angle of the canvas.
     * @zh 画布的旋转角度。
     */
    canvasDegree: number = 0;
    /**
     * @en Set whether to render. When set to false, rendering can be stopped, the screen will stay on the last render, reducing CPU consumption. This setting does not affect the clock.
     * For example, in an inactive state, you can set renderingEnabled=false to save consumption.
     * @zh 设置是否渲染，设置为false，可以停止渲染，画面会停留到最后一次渲染上，减少cpu消耗，此设置不影响时钟。
     * 比如非激活状态，可以设置renderingEnabled=false以节省消耗。
     */
    renderingEnabled: boolean = true;
    /**
     * @en Whether to enable screen adaptation. After adaptation, screen adaptation can be turned off at some point to prevent unexpected screen changes caused by certain operations.
     * @zh 是否启用屏幕适配，可以适配后，在某个时候关闭屏幕适配，防止某些操作导致的屏幕意外改变。
     */
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

    /**
     * @en Using physical resolution as the canvas size will improve rendering effects, but it will reduce performance
     * @zh 使用物理分辨率作为画布大小，会改进渲染效果，但是会降低性能
     */
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
                this.updateCanvasSize(true);
            }
        });

        // 微信的iframe不触发orientationchange。
        window.addEventListener("orientationchange", (e: any) => {
            if (this.screenAdaptationEnabled) {
                this.event(Event.WILL_RESIZE);
                this.updateCanvasSize(true);
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
     * @en Set the width of the stage.
     * @param value The numeric value to set as the width.
     * @zh 设置舞台的宽度。
     * @param value  要设置的宽度数值。
     */
    set_width(value: number) {
        this.designWidth = value;
        super.set_width(value);
        this.updateCanvasSize(true);
    }

    /**
     * @internal
     * @override
     * @en Get the width of the stage.
     * @zh 获取舞台的宽度。
     */
    get_width(): number {
        this.needUpdateCanvasSize();
        return super.get_width();
    }

    /**
     * @internal
     * @override
     * @en Set the height of the stage.
     * @param value The numeric value to set as the height.
     * @zh 设置舞台的高度。
     * @param value 要设置的高度数值。
     */
    set_height(value: number) {
        this.designHeight = value;
        super.set_height(value);
        this.updateCanvasSize(true);
    }

    /**
     * @internal
     * @override
     * @en Get the height of the stage.
     * @zh 获取舞台的高度。
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
     * @en Whether the stage has focus.
     * @zh 舞台是否获得焦点。
     */
    get isFocused(): boolean {
        return this._isFocused;
    }

    /**
     * @en Indicates whether the stage is in a visible state (whether it has entered the background).
     * @zh 舞台是否处于可见状态(是否进入后台)。
     */
    get isVisibility(): boolean {
        return this._isVisibility;
    }

    private _needUpdateCanvasSize: boolean = false;

    /**
     * @en Update the canvas size
     * @param delay If true, the change will be executed with a delay
     * @zh 更新canvas大小
     * @param delay 是否延迟执行改动，如果为true，将延迟执行
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
     * @en Synchronize the final canvas size
     * @zh 同步最终canvas大小
     */
    needUpdateCanvasSize() {
        if (this._needUpdateCanvasSize)
            this.updateCanvasSize();
    }

    /**
     * @en Set the screen size. The scene will adapt to the screen size. This method can be called dynamically to change the game display size.
     * @param screenWidth The width of the screen.
     * @param screenHeight The height of the screen.
     * @zh 设置屏幕大小，场景会根据屏幕大小进行适配。可以动态调用此方法，来更改游戏显示的大小。
     * @param screenWidth 屏幕宽度。
     * @param screenHeight 屏幕高度。
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
     * @en Adapt to Taobao mini-game
     * @param mainCanv The main canvas
     * @param canvasWidth The width of the canvas
     * @param canvasHeight The height of the canvas
     * @param mat The transformation matrix
     * @zh 适配淘宝小游戏
     * @param mainCanv 主画布
     * @param canvasWidth 画布宽度
     * @param canvasHeight 画布高度
     * @param mat 变换矩阵
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
     * @en Set screen size for scene rotation, required by layaverse
     * @param screenWidth The width of the screen
     * @param screenHeight The height of the screen
     * @param screenMode The screen mode. "none" is the default value, "horizontal" for landscape mode, "vertical" for portrait mode
     * @zh 设置场景旋转的屏幕大小，layaverse 需要
     * @param screenWidth 屏幕宽度
     * @param screenHeight 屏幕高度
     * @param screenMode 屏幕模式。"none"为默认值，"horizontal"为横屏，"vertical"为竖屏
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

        // var canvas: HTMLCanvas = Render._mainCanvas;
        // var canvasStyle: any = canvas.source.style;
        // var mat: Matrix = this._canvasTransform.clone().identity();
        var scaleMode: string = this._scaleMode;
        var scaleX: number = screenWidth / this.designWidth
        var scaleY: number = screenHeight / this.designHeight;
        var canvasWidth: number = this.useRetinalCanvas ? screenWidth : this.designWidth;
        var canvasHeight: number = this.useRetinalCanvas ? screenHeight : this.designHeight;
        var realWidth: number = screenWidth;
        var realHeight: number = screenHeight;
        // var pixelRatio: number = Browser.pixelRatio;
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
     * @en The scale mode. Default value is "noscale".
     * Available values:
     * - "noscale": No scaling.
     * - "showall": Scale with the minimum ratio to fit the screen.
     * - "noborder": Scale with the maximum ratio to fit the screen.
     * - "full": No scaling, the stage width and height equal to the screen width and height.
     * - "fixedwidth": Fixed width, height scales according to the screen ratio.
     * - "fixedheight": Fixed height, width scales according to the screen ratio.
     * - "fixedauto": Automatically choose between fixedwidth or fixedheight based on the aspect ratio.
     * @zh 缩放模式。默认值为 "noscale"。
     * 取值范围：
     * - "noscale"：不缩放，舞台与画布采用设计宽高。
     * - "showall"：舞台与画布按最小比例缩放。
     * - "noborder"：舞台与画布按最大比例缩放。
     * - "full"：不缩放，舞台与画布的宽高等于屏幕宽高。
     * - "fixedwidth"：宽度不变，高度根据屏幕比缩放。
     * - "fixedheight"：高度不变，宽度根据屏幕比缩放。
     * - "fixedauto"：根据宽高比，自动选择使用fixedwidth或fixedheight。
     */
    get scaleMode(): string {
        return this._scaleMode;
    }

    set scaleMode(value: string) {
        this._scaleMode = value;
        this.updateCanvasSize(true);
    }

    /**
     * @en Horizontal alignment of canvas. Default value is "left".
     * Available values:
     * - "left": Align to the left.
     * - "center": Align to the center.
     * - "right": Align to the right.
     * @zh 画布水平对齐方式。默认值为"left"。
     * 取值范围：
     * - "left"：居左对齐。
     * - "center"：居中对齐。
     * - "right"：居右对齐。
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
     * @en Vertical alignment of canvas. Default value is "top".
     * Available values:
     * - "top": Align to the top.
     * - "middle": Align to the middle.
     * - "bottom": Align to the bottom.
     * @zh 画布垂直对齐方式。默认值为"top"。
     * 取值范围：
     * - "top"：居顶部对齐。
     * - "middle"：居中对齐。
     * - "bottom"：居底部对齐。
     */
    get alignV(): string {
        this.needUpdateCanvasSize();
        return this._alignV;
    }

    set alignV(value: string) {
        this._alignV = value;
        this.updateCanvasSize(true);
    }

    /**
     * @en The background color of the stage. Default is black, null for transparent.
     * @zh 舞台的背景颜色，默认为黑色，null为透明。
     */
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
     * @en Adapt to Taobao mini-game
     * @param value The background color value
     * @zh 适配淘宝小游戏
     * @param value 背景颜色值
     */
    static _setStyleBgColor(value: string) {
        if (value) {
            Render.canvas.style.background = value;
        } else {
            Render.canvas.style.background = "none";
        }
    }

    /**
     * @override
     * @en The X coordinate of the mouse on the Stage.
     * @zh 鼠标在 舞台 上的 X 轴坐标。
     */
    get mouseX(): number {
        return Math.round(InputManager.mouseX / this.clientScaleX);
    }

    /**
     * @override
     * @en The Y coordinate of the mouse on the Stage.
     * @zh 鼠标在 舞台 上的 Y 轴坐标。
     */
    get mouseY(): number {
        return Math.round(InputManager.mouseY / this.clientScaleY);
    }

    /**
     * @en Get the mouse coordinate information on the screen
     * @returns Screen point information
     * @zh 获得屏幕上的鼠标坐标信息
     * @returns 屏幕点信息
     */
    getMousePoint(): Point {
        return Point.TEMP.setTo(this.mouseX, this.mouseY);
    }

    /**
     * @en The X-axis scaling factor caused by the current viewport scaling mode.
     * @zh 当前视窗由缩放模式导致的 X 轴缩放系数。
     */
    get clientScaleX(): number {
        this.needUpdateCanvasSize();
        return this._transform ? this._transform.getScaleX() : 1;
    }

    /**
     * @en The Y-axis scaling factor caused by the current viewport scaling mode.
     * @zh 当前视窗由缩放模式导致的 Y 轴缩放系数。
     */
    get clientScaleY(): number {
        this.needUpdateCanvasSize();
        return this._transform ? this._transform.getScaleY() : 1;
    }

    /**
     * @en The scene layout type.
     * Available values:
     * - "none": Do not change the screen
     * - "horizontal": Automatic landscape mode
     * - "vertical": Automatic portrait mode
     * @zh 场景布局类型。
     * 取值范围：
     * - "none"：不更改屏幕
     * - "horizontal"：自动横屏
     * - "vertical"：自动竖屏
     */
    get screenMode(): string {
        return this._screenMode;
    }

    set screenMode(value: string) {
        this._screenMode = value;
    }

    /**
     * @override
     * @en Redraw
     * @param type The type of redraw
     * @zh 重新绘制
     * @param type 重新绘制类型
     */
    repaint(type: number = SpriteConst.REPAINT_CACHE): void {
        this._repaint |= type;
    }

    /**
     * @override
     * @en Redraw the parent node
     * @param type The type of redraw
     * @zh 重新绘制父节点
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

    /**
     * @private
     * @en Get frame start time.
     * @zh 获取帧开始时间
     */
    getFrameTm(): number {
        return this._frameStartTime;
    }

    /**
     * @en Get the time elapsed since the current frame started, in milliseconds.
     * This can be used to judge the time consumption within functions, reasonably control the processing time of each frame function, avoid doing too much in one frame, and process complex calculations across frames, which can effectively reduce frame rate fluctuations.
     * @zh 获得距当前帧开始后，过了多少时间，单位为毫秒。
     * 可以用来判断函数内时间消耗，通过合理控制每帧函数处理消耗时长，避免一帧做事情太多，对复杂计算分帧处理，能有效降低帧率波动。
     */
    getTimeFromFrameStart(): number {
        return Browser.now() - this._frameStartTime;
    }

    /**
     * @override
     * @en Indicates whether it is visible, default is true. If set to invisible, the node will not be rendered.
     * @zh 表示是否可见，默认为true。如果设置不可见，节点将不被渲染。
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
     * @en Adapt to Taobao mini-game
     * @param value The visibility value
     * @zh 适配淘宝小游戏
     * @param value 可见性值
     */
    static _setVisibleStyle(value: boolean) {
        var style: any = Render._mainCanvas.source.style;
        style.visibility = value ? "visible" : "hidden";
    }

    /**
     * @en Render all display objects on the stage
     * @param context2D The rendering context
     * @param x The x-axis coordinate
     * @param y The y-axis coordinate
     * @zh 渲染舞台上的所有显示对象
     * @param context2D 渲染的上下文
     * @param x 横轴坐标
     * @param y 纵轴坐标
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

        LayaGL.renderEngine.endFrame();
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
     * @en Whether to enable fullscreen mode. Users can enter fullscreen mode by clicking.
     * Compatibility note: Some browsers, such as iPhone, do not allow entering fullscreen mode by clicking.
     * @zh 是否开启全屏，用户点击后进入全屏。
     * 兼容性提示：部分浏览器不允许点击进入全屏，比如iPhone等。
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

    /**
     * @zh Exit full screen mode
     * @en 退出全屏模式
     */
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

    /**
     * @en Frame rate types:fast (default, full frame rate),slow (half of the full frame rate),mouse (full frame rate after mouse activity, switches to half frame rate if the mouse is idle for 2 seconds),sleep (1 frame per second)
     * @zh 当前帧率类型：fast(默认，满帧)，slow（满帧减半），mouse（鼠标活动后满帧，鼠标不动2秒后满帧减半），sleep（每秒1帧）。
     */
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