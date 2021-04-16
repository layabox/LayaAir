import { Sprite } from "./Sprite";
import { Node } from "./Node";
import { Config } from "./../../Config";
import { Input } from "./Input";
import { SpriteConst } from "./SpriteConst";
import { Const } from "../Const"
import { Event } from "../events/Event"
import { MouseManager } from "../events/MouseManager"
import { Matrix } from "../maths/Matrix"
import { Point } from "../maths/Point"
import { Render } from "../renders/Render"
import { RenderInfo } from "../renders/RenderInfo"
import { Context } from "../resource/Context"
import { HTMLCanvas } from "../resource/HTMLCanvas"
import { Browser } from "../utils/Browser"
import { CallLater } from "../utils/CallLater"
import { ColorUtils } from "../utils/ColorUtils"
import { RunDriver } from "../utils/RunDriver"
import { VectorGraphManager } from "../utils/VectorGraphManager"
import { RenderState2D } from "../webgl/utils/RenderState2D";
import { WebGLContext } from "../webgl/WebGLContext";
import { Stat } from "../utils/Stat";
import { Timer } from "../utils/Timer";
import { ILaya } from "../../ILaya";
import { LayaGL } from "../layagl/LayaGL";
import { ClassUtils } from "../utils/ClassUtils";
import { PerformancePlugin } from "../utils/Performance";

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
	private _bgColor: string = "black";
	/**@private */
	private _mouseMoveTime: number = 0;
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
	_wgColor: number[]|null = [0, 0, 0, 1];
	/**@internal */
	_scene3Ds: any[] = [];

	/**@private */
	private _globalRepaintSet: boolean = false;		// 设置全局重画标志。这个是给IDE用的。IDE的Image无法在onload的时候通知对应的sprite重画。
	/**@private */
	private _globalRepaintGet: boolean = false;		// 一个get一个set是为了把标志延迟到下一帧的开始，防止部分对象接收不到。

	/**@internal */
	_3dUI: Sprite[] = [];
	/**@internal */
	_curUIBase: Sprite|null = null; 		// 给鼠标事件capture用的。用来找到自己的根。因为3d界面的根不是stage（界面链会被3d对象打断）
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
		this._setBit(Const.DISPLAYED_INSTAGE, true);
		this._setBit(Const.ACTIVE_INHIERARCHY, true);
		this._isFocused = true;
		this._isVisibility = true;

		//this.drawCallOptimize=true;
		this.useRetinalCanvas = Config.useRetinalCanvas;

		var window: any = Browser.window;
		//var _me = this;	

		window.addEventListener("focus", ()=>{
			this._isFocused = true;
			this.event(Event.FOCUS);
			this.event(Event.FOCUS_CHANGE);
		});
		window.addEventListener("blur", ()=> {
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

		window.document.addEventListener(visibilityChange, ()=> {
			if (Browser.document[state] == "hidden") {
				this._isVisibility = false;
				if (this._isInputting()) (Input["inputElement"] as any).target.focus = false;
			} else {
				this._isVisibility = true;
			}
			this.renderingEnabled = this._isVisibility;
			this.event(Event.VISIBILITY_CHANGE);
		});
		window.addEventListener("resize", ()=> {
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
				this._safariOffsetY = (Browser.window.__innerHeight || Browser.document.body.clientHeight || Browser.document.documentElement.clientHeight) - Browser.window.innerHeight;

			this._resetCanvas();
		});

		// 微信的iframe不触发orientationchange。
		window.addEventListener("orientationchange", (e: any)=>{
			this._resetCanvas();
		});

		this.on(Event.MOUSE_MOVE, this, this._onmouseMove);
		if (Browser.onMobile) this.on(Event.MOUSE_DOWN, this, this._onmouseMove);
	}

	/**
	 * @private
	 * 在移动端输入时，输入法弹出期间不进行画布尺寸重置。
	 */
	private _isInputting(): boolean {
		return (Browser.onMobile && Input.isInputting);
	}

	/**@inheritDoc @override*/
	set width(value: number) {
		this.designWidth = value;
		super.set_width(value);
		ILaya.systemTimer.callLater(this, this._changeCanvasSize);
	}
	/**
     * @inheritDoc 
     * @override
     */
	get width(): number {
		return super.get_width();
	}

	/**@inheritDoc @override */
	set height(value: number) {
		this.designHeight = value;
		super.set_height(value);
		ILaya.systemTimer.callLater(this, this._changeCanvasSize);
	}

	/** @override*/  
	get height(): number {
		return super.get_height();
	}

	/**@override*/
	set transform(value: Matrix) {
		super.set_transform(value);
	}
	/**@inheritDoc @override*/ 
	get transform(): Matrix {
		if (this._tfChanged) this._adjustTransform();
		return (this._transform = this._transform || this._createTransform());
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

	/**@private */
	private _changeCanvasSize(): void {
		this.setScreenSize(Browser.clientWidth * Browser.pixelRatio, Browser.clientHeight * Browser.pixelRatio);
	}

	/**@private */
	protected _resetCanvas(): void {
		if (!this.screenAdaptationEnabled) return;
		//var canvas:HTMLCanvas = Render._mainCanvas;
		//var canvasStyle:* = canvas.source.style;
		//canvas.size(1, 1);
		//canvasStyle.transform = canvasStyle.webkitTransform = canvasStyle.msTransform = canvasStyle.mozTransform = canvasStyle.oTransform = "";
		//visible = false;
		//Laya.timer.once(100, this, this._changeCanvasSize);
		this._changeCanvasSize();
	}

	/**
	 * 设置屏幕大小，场景会根据屏幕大小进行适配。可以动态调用此方法，来更改游戏显示的大小。
	 * @param	screenWidth		屏幕宽度。
	 * @param	screenHeight	屏幕高度。
	 */
	setScreenSize(screenWidth: number, screenHeight: number): void {
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
		var canvasStyle: any = canvas.source.style;
		var mat: Matrix = this._canvasTransform.identity();
		var scaleMode: string = this._scaleMode;
		var scaleX: number = screenWidth / this.designWidth
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
				scaleX = scaleY = 1;
				this._width = canvasWidth = screenWidth;
				this._height = canvasHeight = screenHeight;
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
			realWidth =  canvasWidth = screenWidth;
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
		canvasStyle.transformOrigin = canvasStyle.webkitTransformOrigin = canvasStyle.msTransformOrigin = canvasStyle.mozTransformOrigin = canvasStyle.oTransformOrigin = "0px 0px 0px";
		canvasStyle.transform = canvasStyle.webkitTransform = canvasStyle.msTransform = canvasStyle.mozTransform = canvasStyle.oTransform = "matrix(" + mat.toString() + ")";
		canvasStyle.width = canvasWidth;
		canvasStyle.height = canvasHeight;
		//修正用户自行设置的偏移
		if (this._safariOffsetY) mat.translate(0, -this._safariOffsetY);
		mat.translate(parseInt(canvasStyle.left) || 0, parseInt(canvasStyle.top) || 0);
		this.visible = true;
		this._repaint |= SpriteConst.REPAINT_CACHE;
		this.event(Event.RESIZE);
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
		ILaya.systemTimer.callLater(this, this._changeCanvasSize);
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
		return this._alignH;
	}

	set alignH(value: string) {
		this._alignH = value;
		ILaya.systemTimer.callLater(this, this._changeCanvasSize);
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
		return this._alignV;
	}

	set alignV(value: string) {
		this._alignV = value;
		ILaya.systemTimer.callLater(this, this._changeCanvasSize);
	}

	/**舞台的背景颜色，默认为黑色，null为透明。*/
	get bgColor(): string {
		return this._bgColor;
	}

	set bgColor(value: string) {
		this._bgColor = value;
		if (value)
			this._wgColor = ColorUtils.create(value).arrColor;
		else
			this._wgColor = null;

		if (value) {
			Render.canvas.style.background = value;
		} else {
			Render.canvas.style.background = "none";
		}
	}

	/**鼠标在 Stage 上的 X 轴坐标。@override*/
	get mouseX(): number {
		return Math.round(MouseManager.instance.mouseX / this.clientScaleX);
	}

	/**鼠标在 Stage 上的 Y 轴坐标。@override*/
	get mouseY(): number {
		return Math.round(MouseManager.instance.mouseY / this.clientScaleY);
	}

	/**@inheritDoc @override*/
	getMousePoint(): Point {
		return Point.TEMP.setTo(this.mouseX, this.mouseY);
	}

	/**当前视窗由缩放模式导致的 X 轴缩放系数。*/
	get clientScaleX(): number {
		return this._transform ? this._transform.getScaleX() : 1;
	}

	/**当前视窗由缩放模式导致的 Y 轴缩放系数。*/
	get clientScaleY(): number {
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

	/**@inheritDoc @override*/
	repaint(type: number = SpriteConst.REPAINT_CACHE): void {
		this._repaint |= type;
	}

	/**@inheritDoc @override*/
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

	/**@private */
	private _onmouseMove(e: Event): void {
		this._mouseMoveTime = Browser.now();
	}

	/**
	 * <p>获得距当前帧开始后，过了多少时间，单位为毫秒。</p>
	 * <p>可以用来判断函数内时间消耗，通过合理控制每帧函数处理消耗时长，避免一帧做事情太多，对复杂计算分帧处理，能有效降低帧率波动。</p>
	 */
	getTimeFromFrameStart(): number {
		return Browser.now() - this._frameStartTime;
	}

	/**@inheritDoc @override*/
	set visible(value: boolean) {
		if (this.visible !== value) {
			super.set_visible(value);
			var style: any = Render._mainCanvas.source.style;
			style.visibility = value ? "visible" : "hidden";
		}
	}
	/**
     * @inheritDoc 
     * @override
     */
	get visible() {
		return super.visible;
	}

	/** @private */
	static clear: Function = function (value: string): void {
		//修改需要同步到上面的native实现中
		Context.set2DRenderConfig();//渲染2D前要还原2D状态,否则可能受3D影响
		var gl: WebGLRenderingContext = LayaGL.instance;
		RenderState2D.worldScissorTest && gl.disable(gl.SCISSOR_TEST);
		var ctx: Context = Render.context;
		//兼容浏览器
		var c: any[] = (ctx._submits._length == 0 || Config.preserveDrawingBuffer) ? ColorUtils.create(value).arrColor : ILaya.stage._wgColor;
		if (c)
			ctx.clearBG(c[0], c[1], c[2], c[3]);
		else
			ctx.clearBG(0, 0, 0, 0);
		RenderState2D.clear();
	};


	/**@inheritDoc @override*/
	render(context: Context, x: number, y: number): void {
		if (((<any>window)).conch) {
			this.renderToNative(context, x, y);
			return;
		}

		if (this._frameRate === Stage.FRAME_SLEEP) {
			var now: number = Browser.now();
			if (now - this._frameStartTime >= 1000) this._frameStartTime = now;
			else return;
		} else {
			if (!this._visible) {
				this._renderCount++;
				if (this._renderCount % 5 === 0) {
					CallLater.I._update();
					Stat.loopCount++;
					RenderInfo.loopCount = Stat.loopCount;
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

		PerformancePlugin.begainSample(PerformancePlugin.PERFORMANCE_LAYA);
		if (this.renderingEnabled) {
			for (var i: number = 0, n: number = this._scene3Ds.length; i < n; i++)//更新3D场景,必须提出来,否则在脚本中移除节点会导致BUG
				this._scene3Ds[i]._update();
			context.clear();
			super.render(context, x, y);
			Stat._StatRender.renderNotCanvas(context, x, y);
		}

		if (this.renderingEnabled) {
			Stage.clear(this._bgColor);
			context.flush();
			VectorGraphManager.instance && VectorGraphManager.getInstance().endDispose();
		}
		this._updateTimers();
		PerformancePlugin.endSample(PerformancePlugin.PERFORMANCE_LAYA);
	}

	renderToNative(context: Context, x: number, y: number): void {
		this._renderCount++;
		if (!this._visible) {
			if (this._renderCount % 5 === 0) {
				CallLater.I._update();
				Stat.loopCount++;
				RenderInfo.loopCount = Stat.loopCount;
				this._updateTimers();
			}
			return;
		}
		//update
		CallLater.I._update();
		Stat.loopCount++;
		RenderInfo.loopCount = Stat.loopCount;

		//render
		if (this.renderingEnabled) {
			for (var i: number = 0, n: number = this._scene3Ds.length; i < n; i++)//更新3D场景,必须提出来,否则在脚本中移除节点会导致BUG
				this._scene3Ds[i]._update();
			context.clear();
			super.render(context, x, y);
			Stat._StatRender.renderNotCanvas(context, x, y);
		}
		//commit submit
		if (this.renderingEnabled) {
			Stage.clear(this._bgColor);
			context.flush();
			VectorGraphManager.instance && VectorGraphManager.getInstance().endDispose();
		}
		this._updateTimers();
	}

	private _updateTimers(): void {
		ILaya.systemTimer._update();
		ILaya.startTimer._update();
		ILaya.physicsTimer._update();
		ILaya.updateTimer._update();
		ILaya.lateTimer._update();
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
			canvas.addEventListener('mousedown', this._requestFullscreen);
			canvas.addEventListener('touchstart', this._requestFullscreen);
			document.addEventListener("fullscreenchange", this._fullScreenChanged);
			document.addEventListener("mozfullscreenchange", this._fullScreenChanged);
			document.addEventListener("webkitfullscreenchange", this._fullScreenChanged);
			document.addEventListener("msfullscreenchange", this._fullScreenChanged);
		} else {
			canvas.removeEventListener('mousedown', this._requestFullscreen);
			canvas.removeEventListener('touchstart', this._requestFullscreen);
			document.removeEventListener("fullscreenchange", this._fullScreenChanged);
			document.removeEventListener("mozfullscreenchange", this._fullScreenChanged);
			document.removeEventListener("webkitfullscreenchange", this._fullScreenChanged);
			document.removeEventListener("msfullscreenchange", this._fullScreenChanged);
		}
	}

	get frameRate(): string {
		if (!ILaya.Render.isConchApp) {
			return this._frameRate;
		} else {
			return ((<any>this))._frameRateNative;
		}
	}

	set frameRate(value: string) {
		if (!ILaya.Render.isConchApp) {
			this._frameRate = value;
		} else {
			var c: any = ((<any>window)).conch;
			switch (value) {
				case Stage.FRAME_FAST:
					c.config.setLimitFPS(60);
					break;
				case Stage.FRAME_MOUSE:
					c.config.setMouseFrame(2000);
					break;
				case Stage.FRAME_SLOW:
					c.config.setSlowFrame(true);
					break;
				case Stage.FRAME_SLEEP:
					c.config.setLimitFPS(1);
					break;
			}
			((<any>this))._frameRateNative = value;
		}
	}

	/**@private */
	private _requestFullscreen(): void {
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
	}

	/**@private */
	private _fullScreenChanged(): void {
		ILaya.stage.event(Event.FULL_SCREEN_CHANGE);
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

	/**@private */
	isGlobalRepaint(): boolean {
		return this._globalRepaintGet;
	}

	/**@private */
	setGlobalRepaint(): void {
		this._globalRepaintSet = true;
	}

	/**@private */
	add3DUI(uibase: Sprite): void {
		var uiroot: Sprite = ((<any>uibase)).rootView;
		if (this._3dUI.indexOf(uiroot) >= 0) return;
		this._3dUI.push(uiroot);
	}

	/**@private */
	remove3DUI(uibase: Sprite): boolean {
		var uiroot: Sprite = ((<any>uibase)).rootView;
		var p: number = this._3dUI.indexOf(uiroot);
		if (p >= 0) {
			this._3dUI.splice(p, 1);
			return true;
		}
		return false;
	}
}


ClassUtils.regClass("laya.display.Stage", Stage);
ClassUtils.regClass("Laya.Stage", Stage);
