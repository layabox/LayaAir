import { Sprite } from "././Sprite";
import { Node } from "././Node";
import { Matrix } from "../maths/Matrix";
import { Point } from "../maths/Point";
import { Context } from "../resource/Context";
/**
 * stage大小经过重新调整时进行调度。
 * @eventType Event.RESIZE
 */
/**
 * 舞台获得焦点时调度。比如浏览器或者当前标签处于后台，重新切换回来时进行调度。
 * @eventType Event.FOCUS
 */
/**
 * 舞台失去焦点时调度。比如浏览器或者当前标签被切换到后台后调度。
 * @eventType Event.BLUR
 */
/**
 * 舞台焦点变化时调度，使用Laya.stage.isFocused可以获取当前舞台是否获得焦点。
 * @eventType Event.FOCUS_CHANGE
 */
/**
 * 舞台可见性发生变化时调度（比如浏览器或者当前标签被切换到后台后调度），使用Laya.stage.isVisibility可以获取当前是否处于显示状态。
 * @eventType Event.VISIBILITY_CHANGE
 */
/**
 * 浏览器全屏更改时调度，比如进入全屏或者退出全屏。
 * @eventType Event.FULL_SCREEN_CHANGE
 */
/**
 * <p> <code>Stage</code> 是舞台类，显示列表的根节点，所有显示对象都在舞台上显示。通过 Laya.stage 单例访问。</p>
 * <p>Stage提供几种适配模式，不同的适配模式会产生不同的画布大小，画布越大，渲染压力越大，所以要选择合适的适配方案。</p>
 * <p>Stage提供不同的帧率模式，帧率越高，渲染压力越大，越费电，合理使用帧率甚至动态更改帧率有利于改进手机耗电。</p>
 */
export declare class Stage extends Sprite {
    /**应用保持设计宽高不变，不缩放不变形，stage的宽高等于设计宽高。*/
    static SCALE_NOSCALE: string;
    /**应用根据屏幕大小铺满全屏，非等比缩放会变形，stage的宽高等于设计宽高。*/
    static SCALE_EXACTFIT: string;
    /**应用显示全部内容，按照最小比率缩放，等比缩放不变形，一边可能会留空白，stage的宽高等于设计宽高。*/
    static SCALE_SHOWALL: string;
    /**应用按照最大比率缩放显示，宽或高方向会显示一部分，等比缩放不变形，stage的宽高等于设计宽高。*/
    static SCALE_NOBORDER: string;
    /**应用保持设计宽高不变，不缩放不变形，stage的宽高等于屏幕宽高。*/
    static SCALE_FULL: string;
    /**应用保持设计宽度不变，高度根据屏幕比缩放，stage的宽度等于设计高度，高度根据屏幕比率大小而变化*/
    static SCALE_FIXED_WIDTH: string;
    /**应用保持设计高度不变，宽度根据屏幕比缩放，stage的高度等于设计宽度，宽度根据屏幕比率大小而变化*/
    static SCALE_FIXED_HEIGHT: string;
    /**应用保持设计比例不变，全屏显示全部内容(类似showall，但showall非全屏，会有黑边)，根据屏幕长宽比，自动选择使用SCALE_FIXED_WIDTH或SCALE_FIXED_HEIGHT*/
    static SCALE_FIXED_AUTO: string;
    /**画布水平居左对齐。*/
    static ALIGN_LEFT: string;
    /**画布水平居右对齐。*/
    static ALIGN_RIGHT: string;
    /**画布水平居中对齐。*/
    static ALIGN_CENTER: string;
    /**画布垂直居上对齐。*/
    static ALIGN_TOP: string;
    /**画布垂直居中对齐。*/
    static ALIGN_MIDDLE: string;
    /**画布垂直居下对齐。*/
    static ALIGN_BOTTOM: string;
    /**不更改屏幕。*/
    static SCREEN_NONE: string;
    /**自动横屏。*/
    static SCREEN_HORIZONTAL: string;
    /**自动竖屏。*/
    static SCREEN_VERTICAL: string;
    /**全速模式，以60的帧率运行。*/
    static FRAME_FAST: string;
    /**慢速模式，以30的帧率运行。*/
    static FRAME_SLOW: string;
    /**自动模式，以30的帧率运行，但鼠标活动后会自动加速到60，鼠标不动2秒后降低为30帧，以节省消耗。*/
    static FRAME_MOUSE: string;
    /**休眠模式，以1的帧率运行*/
    static FRAME_SLEEP: string;
    /**当前焦点对象，此对象会影响当前键盘事件的派发主体。*/
    focus: Node;
    /**@private 相对浏览器左上角的偏移，弃用，请使用_canvasTransform。*/
    offset: Point;
    /**帧率类型，支持三种模式：fast-60帧(默认)，slow-30帧，mouse-30帧（鼠标活动后会自动加速到60，鼠标不动2秒后降低为30帧，以节省消耗），sleep-1帧。*/
    private _frameRate;
    /**设计宽度（初始化时设置的宽度Laya.init(width,height)）*/
    designWidth: number;
    /**设计高度（初始化时设置的高度Laya.init(width,height)）*/
    designHeight: number;
    /**画布是否发生翻转。*/
    canvasRotation: boolean;
    /**画布的旋转角度。*/
    canvasDegree: number;
    /**
     * <p>设置是否渲染，设置为false，可以停止渲染，画面会停留到最后一次渲染上，减少cpu消耗，此设置不影响时钟。</p>
     * <p>比如非激活状态，可以设置renderingEnabled=false以节省消耗。</p>
     * */
    renderingEnabled: boolean;
    /**是否启用屏幕适配，可以适配后，在某个时候关闭屏幕适配，防止某些操作导致的屏幕意外改变*/
    screenAdaptationEnabled: boolean;
    /**@private */
    _canvasTransform: Matrix;
    /**@private */
    private _screenMode;
    /**@private */
    private _scaleMode;
    /**@private */
    private _alignV;
    /**@private */
    private _alignH;
    /**@private */
    private _bgColor;
    /**@private */
    private _mouseMoveTime;
    /**@private */
    private _renderCount;
    /**@private */
    private _safariOffsetY;
    /**@private */
    private _frameStartTime;
    /**@private */
    private _previousOrientation;
    /**@private */
    private _isFocused;
    /**@private */
    private _isVisibility;
    /**@private webgl Color*/
    _wgColor: any[];
    /**@private */
    _scene3Ds: any[];
    /**@private */
    private _globalRepaintSet;
    /**@private */
    private _globalRepaintGet;
    /**@private */
    static _dbgSprite: Sprite;
    /**@private */
    _3dUI: Sprite[];
    /**@private */
    _curUIBase: Sprite;
    /**使用物理分辨率作为canvas大小，会改进渲染效果，但是会降低性能*/
    useRetinalCanvas: boolean;
    /**场景类，引擎中只有一个stage实例，此实例可以通过Laya.stage访问。*/
    constructor();
    /**
     * @private
     * 在移动端输入时，输入法弹出期间不进行画布尺寸重置。
     */
    private _isInputting;
    /**@inheritDoc */
    /*override*/ width: number;
    /**@inheritDoc */
    /*override*/ height: number;
    /**@inheritDoc */
    /*override*/ transform: Matrix;
    /**
     * 舞台是否获得焦点。
     */
    readonly isFocused: boolean;
    /**
     * 舞台是否处于可见状态(是否进入后台)。
     */
    readonly isVisibility: boolean;
    /**@private */
    private _changeCanvasSize;
    /**@private */
    protected _resetCanvas(): void;
    /**
     * 设置屏幕大小，场景会根据屏幕大小进行适配。可以动态调用此方法，来更改游戏显示的大小。
     * @param	screenWidth		屏幕宽度。
     * @param	screenHeight	屏幕高度。
     */
    setScreenSize(screenWidth: number, screenHeight: number): void;
    /**@private */
    private _formatData;
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
    scaleMode: string;
    /**
     * <p>水平对齐方式。默认值为"left"。</p>
     * <p><ul>取值范围：
     * <li>"left" ：居左对齐；</li>
     * <li>"center" ：居中对齐；</li>
     * <li>"right" ：居右对齐；</li>
     * </ul></p>
     */
    alignH: string;
    /**
     * <p>垂直对齐方式。默认值为"top"。</p>
     * <p><ul>取值范围：
     * <li>"top" ：居顶部对齐；</li>
     * <li>"middle" ：居中对齐；</li>
     * <li>"bottom" ：居底部对齐；</li>
     * </ul></p>
     */
    alignV: string;
    /**舞台的背景颜色，默认为黑色，null为透明。*/
    bgColor: string;
    /**鼠标在 Stage 上的 X 轴坐标。*/
    readonly mouseX: number;
    /**鼠标在 Stage 上的 Y 轴坐标。*/
    readonly mouseY: number;
    /**@inheritDoc */
    getMousePoint(): Point;
    /**当前视窗由缩放模式导致的 X 轴缩放系数。*/
    readonly clientScaleX: number;
    /**当前视窗由缩放模式导致的 Y 轴缩放系数。*/
    readonly clientScaleY: number;
    /**
     * <p>场景布局类型。</p>
     * <p><ul>取值范围：
     * <li>"none" ：不更改屏幕</li>
     * <li>"horizontal" ：自动横屏</li>
     * <li>"vertical" ：自动竖屏</li>
     * </ul></p>
     */
    screenMode: string;
    /**@inheritDoc */
    repaint(type?: number): void;
    /**@inheritDoc */
    parentRepaint(type?: number): void;
    /**@private */
    _loop(): boolean;
    /**@private */
    getFrameTm(): number;
    /**@private */
    private _onmouseMove;
    /**
     * <p>获得距当前帧开始后，过了多少时间，单位为毫秒。</p>
     * <p>可以用来判断函数内时间消耗，通过合理控制每帧函数处理消耗时长，避免一帧做事情太多，对复杂计算分帧处理，能有效降低帧率波动。</p>
     */
    getTimeFromFrameStart(): number;
    /**@inheritDoc */
    visible: boolean;
    /** @private */
    static clear: Function;
    /**@inheritDoc */
    render(context: Context, x: number, y: number): void;
    renderToNative(context: Context, x: number, y: number): void;
    private _updateTimers;
    /**
     * <p>是否开启全屏，用户点击后进入全屏。</p>
     * <p>兼容性提示：部分浏览器不允许点击进入全屏，比如Iphone等。</p>
     */
    fullScreenEnabled: boolean;
    frameRate: string;
    /**@private */
    private _requestFullscreen;
    /**@private */
    private _fullScreenChanged;
    /**退出全屏模式*/
    exitFullscreen(): void;
    /**@private */
    isGlobalRepaint(): boolean;
    /**@private */
    setGlobalRepaint(): void;
    /**@private */
    add3DUI(uibase: Sprite): void;
    /**@private */
    remove3DUI(uibase: Sprite): boolean;
}
