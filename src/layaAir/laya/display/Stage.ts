import { Sprite } from "./Sprite";
import { Node } from "./Node";
import { Config } from "./../../Config";
import { TransformKind } from "./SpriteConst";
import { NodeFlags } from "../Const";
import { Event } from "../events/Event";
import { InputManager } from "../events/InputManager";
import { Matrix } from "../maths/Matrix";
import { Point } from "../maths/Point";
import { RenderInfo } from "../renders/RenderInfo";
import { Context } from "../renders/Context";
import { Browser } from "../utils/Browser";
import { ColorUtils } from "../utils/ColorUtils";
import { Stat } from "../utils/Stat";
import { ILaya } from "../../ILaya";
import { ComponentDriver } from "../components/ComponentDriver";
import type { Scene3D } from "../d3/core/scene/Scene3D";
import { Color } from "../maths/Color";
import { LayaGL } from "../layagl/LayaGL";
import type { Scene } from "./Scene";
import { RenderState2D } from "../webgl/utils/RenderState2D";
import type { Laya3D } from "../../Laya3D";
import { Timer } from "../utils/Timer";
import { Tweener } from "../tween/Tweener";
import { PAL } from "../platform/PlatformAdapters";

/**
 * @en Stage is the root node of the display list. All display objects are shown on the stage. It can be accessed through the Laya.stage singleton.
 * Stage provides several adaptation modes. Different adaptation modes will produce different canvas sizes. The larger the canvas, the greater the rendering pressure, so it's important to choose an appropriate adaptation scheme.
 * Stage provides different frame rate modes. The higher the frame rate, the greater the rendering pressure and power consumption. Reasonable use of frame rates or even dynamic changes in frame rates can help improve mobile phone power consumption.
 * - Event.RESIZE("resize"): Discheduled when the stage size is resized.
 * - Event.FOCUS("focus"): Dispatched when the stage gains focus. For example, when the browser or current tab is switched back from the background.
 * - Event.BLUR("blur"): Dispatched when the stage loses focus. For example, when the browser or current tab is switched to the background.
 * - Event.FOCUS_CHANGE("focuschange"): Dispatched when the stage focus changes. Use Laya.stage.isFocused to get whether the current stage has focus.
 * - Event.VISIBILITY_CHANGE("visibilitychange"): Dispatched when the stage visibility changes (e.g., when the browser or current tab is switched to the background). Use Laya.stage.isVisibility to get the current visibility state.
 * - Event.FULL_SCREEN_CHANGE("fullscreenchange"): Discheduled when the browser fullscreen state changes, such as entering or exiting fullscreen mode.
 * @zh Stage 是舞台类，显示列表的根节点，所有显示对象都在舞台上显示。通过 Laya.stage 单例访问。
 * Stage提供几种适配模式，不同的适配模式会产生不同的画布大小，画布越大，渲染压力越大，所以要选择合适的适配方案。
 * Stage提供不同的帧率模式，帧率越高，渲染压力越大，越费电，合理使用帧率甚至动态更改帧率有利于改进手机耗电。
 * - Event.RESIZE("resize"): 舞台大小经过重新调整时进行调度。
 * - Event.FOCUS("focus"): 舞台获得焦点时调度。比如浏览器或者当前标签处于后台，重新切换回来时进行调度。
 * - Event.BLUR("blur"): 舞台失去焦点时调度。比如浏览器或者当前标签被切换到后台后调度。
 * - Event.FOCUS_CHANGE("focuschange"): 舞台焦点变化时调度，使用Laya.stage.isFocused可以获取当前舞台是否获得焦点。
 * - Event.VISIBILITY_CHANGE("visibilitychange"): 舞台可见性发生变化时调度（比如浏览器或者当前标签被切换到后台后调度），使用Laya.stage.isVisibility可以获取当前是否处于显示状态。
 * - Event.FULL_SCREEN_CHANGE("fullscreenchange"): 浏览器全屏更改时调度，比如进入全屏或者退出全屏。
 */
export class Stage extends Sprite {
    /**
     * @en No scaling is applied, and the stage is displayed at its design size. The actual width and height of the canvas are set to the design width and height. This mode is suitable for applications that want to maintain the original design ratio, but it may result in blank areas or content overflow on different devices.
     * @zh 不进行缩放，舞台按照设计尺寸显示，画布的实际宽度和高度设置为设计宽度和高度。这种模式适合希望保持原始设计比例的应用，但在不同设备上可能会出现空白区域或内容超出屏幕的情况。
     */
    static readonly SCALE_NOSCALE: string = "noscale";

    /**
     * @en The canvas and stage are proportionally scaled to fit the screen as much as possible while preserving the original design aspect ratio. The scaling factor is determined by the smaller ratio between the screen size and the design resolution (width and height), ensuring that all design content remains fully visible without cropping. This approach may result in blank margins at the top/bottom or sides of the screen, which are typically handled using appropriate canvas alignment settings.
     * @zh 保持设计宽高比例的情况下，将画布和舞台等比缩放至屏幕最大尺寸，缩放系数取设计宽度与屏幕宽度、设计高度与屏幕高度之间的最小缩放因子，以确保整个设计宽高的内容可见，避免裁切，但可能会出现上下或左右的空白边缘，通常需要配合画布的对齐方式使用。
     */
    static readonly SCALE_SHOWALL: string = "showall";

    /**
     * @en The stage is scaled to fill the screen, with the actual width and height of the canvas calculated based on the design width and height multiplied by the maximum scale factor. This mode ensures that content fully covers the display area, but it may result in some content being cut off.
     * @zh 将舞台缩放以填满屏幕，画布的实际宽度和高度根据设计宽度和高度乘以最大缩放因子计算。这种模式保证内容完全覆盖屏幕，但可能会导致部分设计内容被裁切。
     */
    static readonly SCALE_NOBORDER: string = "noborder";

    /**
     * @en Set the stage and canvas directly to the screen's width and height. Other aspects are the same as the SCALE_NOSCALE mode, with no scaling applied to the design content itself. This mode is suitable for scenarios where you want to fully utilize the screen space and handle dynamic layout on the screen yourself.
     * @zh 将舞台与画布直接设置为屏幕宽度和高度，其它方面与SCALE_NOSCALE模式一样，不对设计内容本身进行缩放。这种模式适用于希望完全利用屏幕空间，自行对屏幕动态排版的需求。
     */
    static readonly SCALE_FULL: string = "full";

    /**
     * @en The stage width is kept fixed, and scaling is done based on the screen height. The canvas height is calculated based on the screen height and scale factor, and the stage height is set accordingly. This mode ensures consistent width but may alter the height ratio on different devices.
     * @zh 保持舞台的宽度固定，根据屏幕高度进行缩放。画布的高度根据屏幕高度和缩放因子计算，并设置舞台的高度。这种模式确保宽度一致，但在不同设备上可能会改变高度比例。
     */
    static readonly SCALE_FIXED_WIDTH: string = "fixedwidth";

    /**
     * @en The stage height is kept fixed, and scaling is done based on the screen width. The canvas width is calculated based on the screen width and scale factor, and the stage width is set accordingly. This mode ensures consistent height but may alter the width ratio on different devices.
     * @zh 保持舞台的高度固定，根据屏幕宽度进行缩放。画布的宽度根据屏幕宽度和缩放因子计算，并设置舞台的宽度。这种模式确保高度一致，但在不同设备上可能会改变宽度比例。
     */
    static readonly SCALE_FIXED_HEIGHT: string = "fixedheight";

    /**
     * @en The scaling method is automatically chosen based on the comparison between the screen aspect ratio and the design aspect ratio. If the screen aspect ratio is less than the design aspect ratio, the width is kept fixed with equal scale factors and the canvas height is calculated; otherwise, the height is kept fixed with equal scale factors and the canvas width is calculated. This mode flexibly adapts to different devices but may result in content being cut off or blank borders appearing.
     * @zh 根据屏幕宽高比与设计宽高比的比较，自动选择缩放方式；如果屏幕宽高比小于设计宽高比，则保持宽度固定，缩放因子相等并计算画布高度；否则，保持高度固定，缩放因子相等并计算画布宽度。这种模式可以灵活适应不同的设备，但可能会导致内容被裁切或出现空白边缘。
     */
    static readonly SCALE_FIXED_AUTO: string = "fixedauto";

    /**
     * @en Canvas is horizontally aligned to the left.
     * @zh 画布水平居左对齐。
     */
    static readonly ALIGN_LEFT: string = "left";
    /**
     * @en Canvas is horizontally aligned to the right.
     * @zh 画布水平居右对齐。
     */
    static readonly ALIGN_RIGHT: string = "right";
    /**
     * @en Canvas is horizontally centered.
     * @zh 画布水平居中对齐。
     */
    static readonly ALIGN_CENTER: string = "center";
    /**
     * @en Canvas is vertically aligned to the top.
     * @zh 画布垂直居上对齐。
     */
    static readonly ALIGN_TOP: string = "top";
    /**
     * @en Canvas is vertically centered.
     * @zh 画布垂直居中对齐。
     */
    static readonly ALIGN_MIDDLE: string = "middle";
    /**
     * @en Canvas is vertically aligned to the bottom.
     * @zh 画布垂直居下对齐。
     */
    static readonly ALIGN_BOTTOM: string = "bottom";

    /**
     * @en Do not change the screen orientation.
     * @zh 不更改屏幕。
     */
    static readonly SCREEN_NONE: string = "none";
    /**
     * @en Automatically switch to landscape mode.
     * @zh 自动横屏。
     */
    static readonly SCREEN_HORIZONTAL: string = "horizontal";
    /**
     * @en Automatically switch to portrait mode.
     * @zh 自动竖屏。
     */
    static readonly SCREEN_VERTICAL: string = "vertical";

    /**
     * @en Fast mode, running at the configured maximum frame rate (not exceeding the device's maximum frame rate).
     * @zh 快速模式，以配置的最高帧率运行（不得超过设备最高帧率）。
     */
    static readonly FRAME_FAST: string = "fast";
    /**
     * @en Slow mode has a frame rate that is half of the fast mode. The principle is to skip rendering every other frame. For example, if the maximum frame rate in fast mode is 60, the maximum frame rate in slow mode would be 30.
     * @zh 慢速模式的帧率是快速模式的一半，其原理是每隔一帧就会跳过渲染。例如快速模式的满帧为60时，慢速模式的满帧则为30。
     */
    static readonly FRAME_SLOW: string = "slow";
    /**
     * @en Mouse mode, In this mode, it checks if the last mouse movement occurred within the last two seconds. If it did, `frameMode` will be set to `FRAME_FAST`; otherwise, it will be set to `FRAME_SLOW`.
     * @zh 鼠标模式，该模式下，会检查上一次鼠标移动的时间，如果是在最近的两秒内，帧率的模式会采用快速模式，否则采用慢速模式。
     */
    static readonly FRAME_MOUSE: string = "mouse";
    /**
     * @en Sleep mode, running at 1 frame per second.
     * @zh 休眠模式，以每秒1帧的速度运行。
     */
    static readonly FRAME_SLEEP: string = "sleep";

    /**
     * @en The current focus object, which will affect the dispatch of current keyboard events.
     * @zh 当前焦点对象，此对象会影响当前键盘事件的派发主体。
     */
    readonly focus: Node;
    /**
     * @en Offset relative to the browser's top-left corner.
     * @zh 相对浏览器左上角的偏移。
     */
    offset: Point = new Point();
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
    /**
     * @en The transformation matrix of the canvas.
     * @zh 画布的变换矩阵。
     */
    readonly _canvasTransform: Matrix = new Matrix();

    /**@internal */
    _scene3Ds: Scene3D[] = [];
    /**@internal */
    _scene2Ds: Scene[] = [];

    private _frameRate: string = "fast";
    private _screenMode: string = "none";
    private _scaleMode: string = "noscale";
    private _alignV: string = "top";
    private _alignH: string = "left";
    private _bgColor: string = "gray";
    private _renderCount: number = 0;
    private _frameStartTime: number = 0;
    private _isFocused: boolean;
    private _wgColor = new Color(0, 0, 0, 0);
    private _needUpdateCanvasSize: boolean = false;

    /**
     * @ignore
     * @en Stage class, there is only one stage instance in the engine. This instance can be accessed through Laya.stage.
     * @zh 场景类，引擎中只有一个stage实例，此实例可以通过Laya.stage访问。
     * */
    constructor() {
        super();

        this.mouseEnabled = true;
        this.hitTestPrior = true;
        this._setBit(NodeFlags.DISPLAYED_INSTAGE, true);
        this._setBit(NodeFlags.ACTIVE_INHIERARCHY, true);
        this._isFocused = true;
        this._transform = new Matrix();
        this._componentDriver = new ComponentDriver();

        PAL.browser.on(Event.FOCUS, () => {
            if (!this._isFocused) {
                this._isFocused = true;
                this.event(Event.FOCUS);
                this.event(Event.FOCUS_CHANGE);
            }
        });
        PAL.browser.on(Event.BLUR, () => {
            if (this._isFocused) {
                this._isFocused = false;
                this.event(Event.BLUR);
                this.event(Event.FOCUS_CHANGE);
            }
        });

        PAL.browser.on(Event.VISIBILITY_CHANGE, (visible: boolean) => {
            this.renderingEnabled = visible;
            this.event(Event.VISIBILITY_CHANGE, visible);
        });

        PAL.browser.on(Event.RESIZE, () => {
            // 弹出输入法不应对画布进行resize。
            if (PAL.textInput.target) return;

            if (this.screenAdaptationEnabled) {
                this.event(Event.WILL_RESIZE);
                this.updateCanvasSize(true);
            }
        });

        PAL.browser.on(Event.ORIENTATION_CHANGE, (e: any) => {
            if (this.screenAdaptationEnabled) {
                this.event(Event.WILL_RESIZE);
                this.updateCanvasSize(true);
            }
        });
    }

    /**
     * @ignore
     */
    protected _transChanged(kind: TransformKind) {
        super._transChanged(kind);

        if ((kind & TransformKind.Size) != 0) {
            this.designWidth = this._width;
            this.designHeight = this._height;
            this.updateCanvasSize(true);
        }
    }

    /**
     * @ignore
     */
    protected measureWidth(): number {
        this.needUpdateCanvasSize();
        return this._width;
    }

    /**
     * @ignore
     */
    protected measureHeight(): number {
        this.needUpdateCanvasSize();
        return this._height;
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
        return PAL.browser.getVisibility();
    }

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
        let pixelRatio = Browser.pixelRatio;
        //screen width/height是乘了dpr的，先除回去
        screenWidth /= pixelRatio;
        screenHeight /= pixelRatio;

        //计算是否需要旋转
        if (this._screenMode !== Stage.SCREEN_NONE) {
            let screenType: string = screenWidth / screenHeight < 1 ? Stage.SCREEN_VERTICAL : Stage.SCREEN_HORIZONTAL;
            this.canvasRotation = screenType !== this._screenMode;
            if (this.canvasRotation) {
                //宽高互换
                let temp = screenHeight;
                screenHeight = screenWidth;
                screenWidth = temp;
            }
        }
        else
            this.canvasRotation = false;

        let canvas = Browser.mainCanvas;
        let mat: Matrix = this._canvasTransform.identity();
        let scaleMode: string = this._scaleMode;
        let canvasWidth: number = this.designWidth;
        let canvasHeight: number = this.designHeight;
        let canvasScale: number = 1;

        if (!Browser.isDomSupported  //在这种情况下（例如小游戏），画布是强制全屏的，所以需要改变画布大小的模式都不能支持
            && (scaleMode === Stage.SCALE_NOSCALE || scaleMode == Stage.SCALE_SHOWALL || scaleMode === Stage.SCALE_NOBORDER)) {
            scaleMode = Stage.SCALE_FIXED_AUTO;
        }

        //设计大小 => 调整宽度或高度得到 => 舞台大小 => 乘以缩放因子 => canvas大小
        switch (scaleMode) {
            case Stage.SCALE_NOSCALE:
                break;
            case Stage.SCALE_FULL:
                canvasWidth = screenWidth;
                canvasHeight = screenHeight;
                break;
            case Stage.SCALE_SHOWALL:
                canvasScale = Math.min(screenWidth / canvasWidth, screenHeight / canvasHeight);
                break;
            case Stage.SCALE_NOBORDER:
                canvasScale = Math.max(screenWidth / canvasWidth, screenHeight / canvasHeight);
                break;
            case Stage.SCALE_FIXED_WIDTH:
            case Stage.SCALE_FIXED_HEIGHT:
            case Stage.SCALE_FIXED_AUTO:
                if (scaleMode === Stage.SCALE_FIXED_WIDTH
                    || scaleMode === Stage.SCALE_FIXED_AUTO && (screenWidth / screenHeight) < (canvasWidth / canvasHeight)) {
                    canvasScale = screenWidth / canvasWidth;
                    canvasHeight = screenHeight / canvasScale;
                }
                else {
                    canvasScale = screenHeight / canvasHeight;
                    canvasWidth = screenWidth / canvasScale;
                }
                break;
        }

        //设置舞台大小
        this._width = canvasWidth;
        this._height = canvasHeight;

        if (Config.useRetinalCanvas || !Browser.isDomSupported) {
            //高清画布模式放弃canvasScale, 通过改变画布大小实现
            canvasWidth *= canvasScale;
            canvasHeight *= canvasScale;
            canvasScale = 1;

            //高清画布模式继续将画布大小增大到乘以dpr，后续会通过matrix缩回到需求的显示大小，实现视网膜效果
            if (pixelRatio > 4 && Browser.isDomSupported) //限制最大放大倍数，避免浏览器缩放引起巨大dpr造成的卡死
                pixelRatio = 4;
            canvasWidth *= pixelRatio;
            canvasHeight *= pixelRatio;
            canvasScale /= pixelRatio;
        }
        mat.scale(canvasScale, canvasScale);

        //处理画布对齐
        if (Browser.isDomSupported) { //在这种情况下，画布是强制全屏的，不能移动
            let offsetX: number = 0;
            let offsetY: number = 0;
            //处理水平对齐
            if (this._alignH === Stage.ALIGN_LEFT)
                offsetX = 0;
            else if (this._alignH === Stage.ALIGN_RIGHT)
                offsetX = screenWidth - canvasWidth * canvasScale;
            else
                offsetX = (screenWidth - canvasWidth * canvasScale) * 0.5;

            //处理垂直对齐
            if (this._alignV === Stage.ALIGN_TOP)
                offsetY = 0;
            else if (this._alignV === Stage.ALIGN_BOTTOM)
                offsetY = screenHeight - canvasHeight * canvasScale;
            else
                offsetY = (screenHeight - canvasHeight * canvasScale) * 0.5;
            offsetX += this.offset.x;
            offsetY += this.offset.y;

            mat.translate(Math.round(offsetX), Math.round(offsetY));
        }

        //处理横竖屏
        if (this.canvasRotation) {
            if (this._screenMode === Stage.SCREEN_HORIZONTAL) {
                mat.rotate(Math.PI / 2);
                mat.translate(screenHeight, 0);
                this.canvasDegree = 90;
            } else {
                mat.rotate(-Math.PI / 2);
                mat.translate(0, screenWidth);
                this.canvasDegree = -90;
            }
        }
        else
            this.canvasDegree = 0;

        mat.a = formatData(mat.a);
        mat.d = formatData(mat.d);
        mat.tx = formatData(mat.tx);
        mat.ty = formatData(mat.ty);

        canvasWidth = Math.round(canvasWidth);
        canvasHeight = Math.round(canvasHeight);
        canvas.size(canvasWidth, canvasHeight);

        if (Browser.isDomSupported) {
            let canvasStyle = Browser.mainCanvas.source.style;
            PAL.browser.setStyleTransformOrigin(canvasStyle, "0px 0px 0px");
            PAL.browser.setStyleTransform(canvasStyle, "matrix(" + mat.toString() + ")");
            canvasStyle.width = canvasWidth + "px";
            canvasStyle.height = canvasHeight + "px";

            mat.translate(parseInt(canvasStyle.left) || 0, parseInt(canvasStyle.top) || 0);
        }

        //放大舞台
        this.transform.a = formatData(canvasWidth / this._width * this.scaleX);
        this.transform.d = formatData(canvasHeight / this._height * this.scaleY);
        this.transform = this.transform; //force call

        RenderState2D.width = canvasWidth;
        RenderState2D.height = canvasHeight;
        (<typeof Laya3D>(<any>window)['Laya3D'])?._changeWebGLSize(canvasWidth, canvasHeight);
        LayaGL.renderEngine.resizeOffScreen(canvasWidth, canvasHeight);

        this.visible = true;
        this.repaint();
        this.event(Event.RESIZE);
    }

    /**
     * @en The scale mode. Default value is "noscale".
     * Available values:
     * - "noscale": No scaling.
     * - "showall": The canvas matches the design width and height, and the stage is scaled proportionally to the maximum size while ensuring the design content remains fully visible.
     * - "full": No scaling, the stage width and height equal to the screen width and height.
     * - "fixedwidth": Fixed width, height scales according to the screen ratio.
     * - "fixedheight": Fixed height, width scales according to the screen ratio.
     * - "fixedauto": Automatically choose between fixedwidth or fixedheight based on the aspect ratio.
     * @zh 缩放模式。默认值为 "noscale"。
     * 取值范围：
     * - "noscale"：不缩放，舞台与画布采用设计宽高。
     * - "showall"：画布等于设计宽高，在保障设计内容可见的前提下，按设计宽高对舞台等比缩放至最大。
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

        if (Browser.isDomSupported)
            Browser.mainCanvas.source.style.background = value ?? "none";
    }

    /**
     * @en The X coordinate of the mouse on the Stage.
     * @zh 鼠标在 舞台 上的 X 轴坐标。
     */
    get mouseX(): number {
        return Math.round(InputManager.mouseX / this.clientScaleX);
    }

    /**
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
     * @en Indicates whether it is visible, default is true. If set to invisible, the node will not be rendered.
     * @zh 表示是否可见，默认为true。如果设置不可见，节点将不被渲染。
     */
    get visible() {
        return super.visible;
    }

    set visible(value: boolean) {
        super.visible = value;

        if (Browser.isDomSupported)
            Browser.mainCanvas.source.style.visibility = value ? "visible" : "hidden";
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
                    Timer.callLaters._update();
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
        let frameMode: string = this._frameRate === Stage.FRAME_MOUSE ? (((this._frameStartTime - InputManager.lastMouseTime) < 2000) ? Stage.FRAME_FAST : Stage.FRAME_SLOW) : this._frameRate;
        let isFastMode: boolean = (frameMode !== Stage.FRAME_SLOW);
        let isDoubleLoop: boolean = (this._renderCount % 2 === 0);

        Stat.renderSlow = !isFastMode;
        if (!isFastMode && !isDoubleLoop)//统一双帧处理渲染
            return;

        Timer.callLaters._update();
        Stat.loopCount++;
        RenderInfo.loopCount = Stat.loopCount;
        LayaGL.renderEngine.startFrame();
        if (this.renderingEnabled) {

            for (let i = 0, n = this._scene2Ds.length; i < n; i++) {
                this._scene2Ds[i]._update();
            }
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
        }
        else
            this._runComponents();

        this._updateTimers();

        LayaGL.renderEngine.endFrame();
    }

    /**
     * @param context2D The rendering context
     * @param x The x-axis coordinate
     * @param y The y-axis coordinate
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
        Tweener._runAll();
    }

    /**
     * @en Whether to enable fullscreen mode. Users can enter fullscreen mode by clicking.
     * 
     * Compatibility note: Some browsers, such as iPhone, do not allow entering fullscreen mode by clicking.
     * @zh 是否开启全屏，用户点击后进入全屏。
     * 
     * 兼容性提示：部分浏览器不允许点击进入全屏，比如iPhone等。
     */
    set fullScreenEnabled(value: boolean) {
        let canvas = Browser.mainCanvas.source;
        if (value) {
            canvas.addEventListener('mousedown', requestFullscreen);
            canvas.addEventListener('touchstart', requestFullscreen);
            PAL.browser.on("fullscreenchange", this, this.fullScreenChanged);
        }
        else {
            canvas.removeEventListener('mousedown', requestFullscreen);
            canvas.removeEventListener('touchstart', requestFullscreen);
            PAL.browser.off("fullscreenchange", this, this.fullScreenChanged);
        }
    }

    private fullScreenChanged(): void {
        this.event(Event.FULL_SCREEN_CHANGE);
    }

    /**
     * @zh Exit full screen mode
     * @en 退出全屏模式
     */
    exitFullscreen(): void {
        PAL.browser.exitFullscreen();
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

    /** @internal @blueprintEvent */
    Stage_bpEvent: {
        [Event.KEY_DOWN]: (event: Event) => void;
        [Event.KEY_UP]: (event: Event) => void;
        [Event.KEY_PRESS]: (event: Event) => void;

        [Event.RESIZE]: () => void;
        [Event.FOCUS]: () => void;
        [Event.BLUR]: () => void;
        [Event.FOCUS_CHANGE]: () => void;
        [Event.VISIBILITY_CHANGE]: (visible: boolean) => void;
        [Event.FULL_SCREEN_CHANGE]: () => void;
        [Event.WILL_RESIZE]: () => void;
    };
}

function requestFullscreen(): void {
    PAL.browser.requestFullscreen();

    let canvas = Browser.mainCanvas.source;
    canvas.removeEventListener('mousedown', requestFullscreen);
    canvas.removeEventListener('touchstart', requestFullscreen);
}

function formatData(value: number): number {
    if (Math.abs(value) < 0.000001) return 0;
    if (Math.abs(1 - value) < 0.001) return value > 0 ? 1 : -1;
    return value;
}