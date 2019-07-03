import { Sprite } from "./Sprite";
import { Config } from "./../../Config";
import { Input } from "./Input";
import { SpriteConst } from "./SpriteConst";
import { Const } from "../Const";
import { Event } from "../events/Event";
import { MouseManager } from "../events/MouseManager";
import { Matrix } from "../maths/Matrix";
import { Point } from "../maths/Point";
import { Render } from "../renders/Render";
import { RenderInfo } from "../renders/RenderInfo";
import { Context } from "../resource/Context";
import { Browser } from "../utils/Browser";
import { CallLater } from "../utils/CallLater";
import { ColorUtils } from "../utils/ColorUtils";
import { RunDriver } from "../utils/RunDriver";
import { VectorGraphManager } from "../utils/VectorGraphManager";
import { RenderState2D } from "../webgl/utils/RenderState2D";
import { WebGLContext } from "../webgl/WebGLContext";
import { Stat } from "../utils/Stat";
import { ILaya } from "../../ILaya";
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
    /**场景类，引擎中只有一个stage实例，此实例可以通过Laya.stage访问。*/
    constructor() {
        super();
        /**@private 相对浏览器左上角的偏移，弃用，请使用_canvasTransform。*/
        this.offset = new Point();
        /**帧率类型，支持三种模式：fast-60帧(默认)，slow-30帧，mouse-30帧（鼠标活动后会自动加速到60，鼠标不动2秒后降低为30帧，以节省消耗），sleep-1帧。*/
        this._frameRate = "fast";
        /**设计宽度（初始化时设置的宽度Laya.init(width,height)）*/
        this.designWidth = 0;
        /**设计高度（初始化时设置的高度Laya.init(width,height)）*/
        this.designHeight = 0;
        /**画布是否发生翻转。*/
        this.canvasRotation = false;
        /**画布的旋转角度。*/
        this.canvasDegree = 0;
        /**
         * <p>设置是否渲染，设置为false，可以停止渲染，画面会停留到最后一次渲染上，减少cpu消耗，此设置不影响时钟。</p>
         * <p>比如非激活状态，可以设置renderingEnabled=false以节省消耗。</p>
         * */
        this.renderingEnabled = true;
        /**是否启用屏幕适配，可以适配后，在某个时候关闭屏幕适配，防止某些操作导致的屏幕意外改变*/
        this.screenAdaptationEnabled = true;
        this._canvasTransform = new Matrix();
        /**@private */
        this._screenMode = "none";
        /**@private */
        this._scaleMode = "noscale";
        /**@private */
        this._alignV = "top";
        /**@private */
        this._alignH = "left";
        /**@private */
        this._bgColor = "black";
        /**@private */
        this._mouseMoveTime = 0;
        /**@private */
        this._renderCount = 0;
        /**@private */
        this._safariOffsetY = 0;
        /**@private */
        this._frameStartTime = 0;
        /**@private */
        this._previousOrientation = Browser.window.orientation;
        /**@internal webgl Color*/
        this._wgColor = [0, 0, 0, 1];
        /**@internal */
        this._scene3Ds = [];
        /**@private */
        this._globalRepaintSet = false; // 设置全局重画标志。这个是给IDE用的。IDE的Image无法在onload的时候通知对应的sprite重画。
        /**@private */
        this._globalRepaintGet = false; // 一个get一个set是为了把标志延迟到下一帧的开始，防止部分对象接收不到。
        /**@internal */
        this._3dUI = [];
        /**@internal */
        this._curUIBase = null; // 给鼠标事件capture用的。用来找到自己的根。因为3d界面的根不是stage（界面链会被3d对象打断）
        /**使用物理分辨率作为canvas大小，会改进渲染效果，但是会降低性能*/
        this.useRetinalCanvas = false;
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
        var window = Browser.window;
        var _me = this; //for TS 。 TS的_this是有特殊用途的
        window.addEventListener("focus", function () {
            this._isFocused = true;
            _me.event(Event.FOCUS);
            _me.event(Event.FOCUS_CHANGE);
        });
        window.addEventListener("blur", function () {
            this._isFocused = false;
            _me.event(Event.BLUR);
            _me.event(Event.FOCUS_CHANGE);
            if (_me._isInputting())
                Input["inputElement"].target.focus = false;
        });
        // 各种浏览器兼容
        var hidden = "hidden", state = "visibilityState", visibilityChange = "visibilitychange";
        var document = window.document;
        if (typeof document.hidden !== "undefined") {
            visibilityChange = "visibilitychange";
            state = "visibilityState";
        }
        else if (typeof document.mozHidden !== "undefined") {
            visibilityChange = "mozvisibilitychange";
            state = "mozVisibilityState";
        }
        else if (typeof document.msHidden !== "undefined") {
            visibilityChange = "msvisibilitychange";
            state = "msVisibilityState";
        }
        else if (typeof document.webkitHidden !== "undefined") {
            visibilityChange = "webkitvisibilitychange";
            state = "webkitVisibilityState";
        }
        window.document.addEventListener(visibilityChange, visibleChangeFun);
        function visibleChangeFun() {
            if (Browser.document[state] == "hidden") {
                this._isVisibility = false;
                if (_me._isInputting())
                    Input["inputElement"].target.focus = false;
            }
            else {
                this._isVisibility = true;
            }
            this.renderingEnabled = this._isVisibility;
            _me.event(Event.VISIBILITY_CHANGE);
        }
        window.addEventListener("resize", function () {
            // 处理屏幕旋转。旋转后收起输入法。
            var orientation = Browser.window.orientation;
            if (orientation != null && orientation != this._previousOrientation && _me._isInputting()) {
                Input["inputElement"].target.focus = false;
            }
            this._previousOrientation = orientation;
            // 弹出输入法不应对画布进行resize。
            if (_me._isInputting())
                return;
            // Safari横屏工具栏偏移
            if (Browser.onSafari)
                _me._safariOffsetY = (Browser.window.__innerHeight || Browser.document.body.clientHeight || Browser.document.documentElement.clientHeight) - Browser.window.innerHeight;
            _me._resetCanvas();
        });
        // 微信的iframe不触发orientationchange。
        window.addEventListener("orientationchange", function (e) {
            _me._resetCanvas();
        });
        this.on(Event.MOUSE_MOVE, this, this._onmouseMove);
        if (Browser.onMobile)
            this.on(Event.MOUSE_DOWN, this, this._onmouseMove);
    }
    /**
     * @private
     * 在移动端输入时，输入法弹出期间不进行画布尺寸重置。
     */
    _isInputting() {
        return (Browser.onMobile && Input.isInputting);
    }
    /**@inheritDoc */
    /*override*/ set width(value) {
        this.designWidth = value;
        super.set_width(value);
        ILaya.systemTimer.callLater(this, this._changeCanvasSize);
    }
    /*override*/ get width() {
        return super.get_width();
    }
    /**@inheritDoc */
    /*override*/ set height(value) {
        this.designHeight = value;
        super.set_height(value);
        ILaya.systemTimer.callLater(this, this._changeCanvasSize);
    }
    /*override*/ get height() {
        return super.get_height();
    }
    /*override*/ set transform(value) {
        super.set_transform(value);
    }
    /**@inheritDoc */
    /*override*/ get transform() {
        if (this._tfChanged)
            this._adjustTransform();
        return (this._transform = this._transform || this._createTransform());
    }
    /**
     * 舞台是否获得焦点。
     */
    get isFocused() {
        return this._isFocused;
    }
    /**
     * 舞台是否处于可见状态(是否进入后台)。
     */
    get isVisibility() {
        return this._isVisibility;
    }
    /**@private */
    _changeCanvasSize() {
        this.setScreenSize(Browser.clientWidth * Browser.pixelRatio, Browser.clientHeight * Browser.pixelRatio);
    }
    /**@private */
    _resetCanvas() {
        if (!this.screenAdaptationEnabled)
            return;
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
    setScreenSize(screenWidth, screenHeight) {
        //计算是否旋转
        var rotation = false;
        if (this._screenMode !== Stage.SCREEN_NONE) {
            var screenType = screenWidth / screenHeight < 1 ? Stage.SCREEN_VERTICAL : Stage.SCREEN_HORIZONTAL;
            rotation = screenType !== this._screenMode;
            if (rotation) {
                //宽高互换
                var temp = screenHeight;
                screenHeight = screenWidth;
                screenWidth = temp;
            }
        }
        this.canvasRotation = rotation;
        var canvas = Render._mainCanvas;
        var canvasStyle = canvas.source.style;
        var mat = this._canvasTransform.identity();
        var scaleMode = this._scaleMode;
        var scaleX = screenWidth / this.designWidth;
        var scaleY = screenHeight / this.designHeight;
        var canvasWidth = this.useRetinalCanvas ? screenWidth : this.designWidth;
        var canvasHeight = this.useRetinalCanvas ? screenHeight : this.designHeight;
        var realWidth = screenWidth;
        var realHeight = screenHeight;
        var pixelRatio = Browser.pixelRatio;
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
                }
                else {
                    scaleX = scaleY;
                    this._width = canvasWidth = Math.round(screenWidth / scaleY);
                }
                break;
        }
        if (this.useRetinalCanvas) {
            canvasWidth = screenWidth;
            canvasHeight = screenHeight;
        }
        //根据不同尺寸缩放stage画面
        scaleX *= this.scaleX;
        scaleY *= this.scaleY;
        if (scaleX === 1 && scaleY === 1) {
            this.transform.identity();
        }
        else {
            this.transform.a = this._formatData(scaleX / (realWidth / canvasWidth));
            this.transform.d = this._formatData(scaleY / (realHeight / canvasHeight));
        }
        //处理canvas大小			
        canvas.size(canvasWidth, canvasHeight);
        RunDriver.changeWebGLSize(canvasWidth, canvasHeight);
        mat.scale(realWidth / canvasWidth / pixelRatio, realHeight / canvasHeight / pixelRatio);
        //处理水平对齐
        if (this._alignH === Stage.ALIGN_LEFT)
            this.offset.x = 0;
        else if (this._alignH === Stage.ALIGN_RIGHT)
            this.offset.x = screenWidth - realWidth;
        else
            this.offset.x = (screenWidth - realWidth) * 0.5 / pixelRatio;
        //处理垂直对齐
        if (this._alignV === Stage.ALIGN_TOP)
            this.offset.y = 0;
        else if (this._alignV === Stage.ALIGN_BOTTOM)
            this.offset.y = screenHeight - realHeight;
        else
            this.offset.y = (screenHeight - realHeight) * 0.5 / pixelRatio;
        //处理用户自行设置的画布偏移
        this.offset.x = Math.round(this.offset.x);
        this.offset.y = Math.round(this.offset.y);
        mat.translate(this.offset.x, this.offset.y);
        if (this._safariOffsetY)
            mat.translate(0, this._safariOffsetY);
        //处理横竖屏
        this.canvasDegree = 0;
        if (rotation) {
            if (this._screenMode === Stage.SCREEN_HORIZONTAL) {
                mat.rotate(Math.PI / 2);
                mat.translate(screenHeight / pixelRatio, 0);
                this.canvasDegree = 90;
            }
            else {
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
        //修正用户自行设置的偏移
        if (this._safariOffsetY)
            mat.translate(0, -this._safariOffsetY);
        mat.translate(parseInt(canvasStyle.left) || 0, parseInt(canvasStyle.top) || 0);
        this.visible = true;
        this._repaint |= SpriteConst.REPAINT_CACHE;
        this.event(Event.RESIZE);
    }
    /**@private */
    _formatData(value) {
        if (Math.abs(value) < 0.000001)
            return 0;
        if (Math.abs(1 - value) < 0.001)
            return value > 0 ? 1 : -1;
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
    get scaleMode() {
        return this._scaleMode;
    }
    set scaleMode(value) {
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
    get alignH() {
        return this._alignH;
    }
    set alignH(value) {
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
    get alignV() {
        return this._alignV;
    }
    set alignV(value) {
        this._alignV = value;
        ILaya.systemTimer.callLater(this, this._changeCanvasSize);
    }
    /**舞台的背景颜色，默认为黑色，null为透明。*/
    get bgColor() {
        return this._bgColor;
    }
    set bgColor(value) {
        this._bgColor = value;
        if (value)
            this._wgColor = ColorUtils.create(value).arrColor;
        else
            this._wgColor = null;
        if (Browser.onLimixiu) {
            this._wgColor = ColorUtils.create(value).arrColor;
        }
        else if (value) {
            Render.canvas.style.background = value;
        }
        else {
            Render.canvas.style.background = "none";
        }
    }
    /**鼠标在 Stage 上的 X 轴坐标。*/
    /*override*/ get mouseX() {
        return Math.round(MouseManager.instance.mouseX / this.clientScaleX);
    }
    /**鼠标在 Stage 上的 Y 轴坐标。*/
    /*override*/ get mouseY() {
        return Math.round(MouseManager.instance.mouseY / this.clientScaleY);
    }
    /**@inheritDoc */
    /*override*/ getMousePoint() {
        return Point.TEMP.setTo(this.mouseX, this.mouseY);
    }
    /**当前视窗由缩放模式导致的 X 轴缩放系数。*/
    get clientScaleX() {
        return this._transform ? this._transform.getScaleX() : 1;
    }
    /**当前视窗由缩放模式导致的 Y 轴缩放系数。*/
    get clientScaleY() {
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
    get screenMode() {
        return this._screenMode;
    }
    set screenMode(value) {
        this._screenMode = value;
    }
    /**@inheritDoc */
    /*override*/ repaint(type = SpriteConst.REPAINT_CACHE) {
        this._repaint |= type;
    }
    /**@inheritDoc */
    /*override*/ parentRepaint(type = SpriteConst.REPAINT_CACHE) {
    }
    /**@internal */
    _loop() {
        this._globalRepaintGet = this._globalRepaintSet;
        this._globalRepaintSet = false;
        this.render(Render._context, 0, 0);
        return true;
    }
    /**@private */
    getFrameTm() {
        return this._frameStartTime;
    }
    /**@private */
    _onmouseMove(e) {
        this._mouseMoveTime = Browser.now();
    }
    /**
     * <p>获得距当前帧开始后，过了多少时间，单位为毫秒。</p>
     * <p>可以用来判断函数内时间消耗，通过合理控制每帧函数处理消耗时长，避免一帧做事情太多，对复杂计算分帧处理，能有效降低帧率波动。</p>
     */
    getTimeFromFrameStart() {
        return Browser.now() - this._frameStartTime;
    }
    /**@inheritDoc */
    /*override*/ set visible(value) {
        if (this.visible !== value) {
            super.set_visible(value);
            var style = Render._mainCanvas.source.style;
            style.visibility = value ? "visible" : "hidden";
        }
    }
    get visible() {
        return super.visible;
    }
    /**@inheritDoc */
    /*override*/ render(context, x, y) {
        if (window.conch) {
            this.renderToNative(context, x, y);
            return;
        }
        //临时
        Stage._dbgSprite.graphics.clear();
        if (this._frameRate === Stage.FRAME_SLEEP) {
            var now = Browser.now();
            if (now - this._frameStartTime >= 1000)
                this._frameStartTime = now;
            else
                return;
        }
        else {
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
        var frameMode = this._frameRate === Stage.FRAME_MOUSE ? (((this._frameStartTime - this._mouseMoveTime) < 2000) ? Stage.FRAME_FAST : Stage.FRAME_SLOW) : this._frameRate;
        var isFastMode = (frameMode !== Stage.FRAME_SLOW);
        var isDoubleLoop = (this._renderCount % 2 === 0);
        Stat.renderSlow = !isFastMode;
        if (isFastMode || isDoubleLoop) {
            CallLater.I._update();
            Stat.loopCount++;
            RenderInfo.loopCount = Stat.loopCount;
            if (this.renderingEnabled) {
                for (var i = 0, n = this._scene3Ds.length; i < n; i++) //更新3D场景,必须提出来,否则在脚本中移除节点会导致BUG
                    this._scene3Ds[i]._update();
                context.clear();
                super.render(context, x, y);
                Stat._StatRender.renderNotCanvas(context, x, y);
            }
        }
        Stage._dbgSprite.render(context, 0, 0);
        if (isFastMode || !isDoubleLoop) {
            if (this.renderingEnabled) {
                Stage.clear(this._bgColor);
                context.flush();
                VectorGraphManager.instance && VectorGraphManager.getInstance().endDispose();
            }
            this._updateTimers();
        }
    }
    renderToNative(context, x, y) {
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
            for (var i = 0, n = this._scene3Ds.length; i < n; i++) //更新3D场景,必须提出来,否则在脚本中移除节点会导致BUG
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
    _updateTimers() {
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
    set fullScreenEnabled(value) {
        var document = Browser.document;
        var canvas = Render.canvas;
        if (value) {
            canvas.addEventListener('mousedown', this._requestFullscreen);
            canvas.addEventListener('touchstart', this._requestFullscreen);
            document.addEventListener("fullscreenchange", this._fullScreenChanged);
            document.addEventListener("mozfullscreenchange", this._fullScreenChanged);
            document.addEventListener("webkitfullscreenchange", this._fullScreenChanged);
            document.addEventListener("msfullscreenchange", this._fullScreenChanged);
        }
        else {
            canvas.removeEventListener('mousedown', this._requestFullscreen);
            canvas.removeEventListener('touchstart', this._requestFullscreen);
            document.removeEventListener("fullscreenchange", this._fullScreenChanged);
            document.removeEventListener("mozfullscreenchange", this._fullScreenChanged);
            document.removeEventListener("webkitfullscreenchange", this._fullScreenChanged);
            document.removeEventListener("msfullscreenchange", this._fullScreenChanged);
        }
    }
    get frameRate() {
        if (!ILaya.Render.isConchApp) {
            return this._frameRate;
        }
        else {
            return this._frameRateNative;
        }
    }
    set frameRate(value) {
        if (!ILaya.Render.isConchApp) {
            this._frameRate = value;
        }
        else {
            var c = window.conch;
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
            this._frameRateNative = value;
        }
    }
    /**@private */
    _requestFullscreen() {
        var element = Browser.document.documentElement;
        if (element.requestFullscreen) {
            element.requestFullscreen();
        }
        else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        }
        else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        }
        else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    }
    /**@private */
    _fullScreenChanged() {
        ILaya.stage.event(Event.FULL_SCREEN_CHANGE);
    }
    /**退出全屏模式*/
    exitFullscreen() {
        var document = Browser.document;
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
        else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        }
        else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }
    /**@private */
    isGlobalRepaint() {
        return this._globalRepaintGet;
    }
    /**@private */
    setGlobalRepaint() {
        this._globalRepaintSet = true;
    }
    /**@private */
    add3DUI(uibase) {
        var uiroot = uibase.rootView;
        if (this._3dUI.indexOf(uiroot) >= 0)
            return;
        this._3dUI.push(uiroot);
    }
    /**@private */
    remove3DUI(uibase) {
        var uiroot = uibase.rootView;
        var p = this._3dUI.indexOf(uiroot);
        if (p >= 0) {
            this._3dUI.splice(p, 1);
            return true;
        }
        return false;
    }
}
/**应用保持设计宽高不变，不缩放不变形，stage的宽高等于设计宽高。*/
Stage.SCALE_NOSCALE = "noscale";
/**应用根据屏幕大小铺满全屏，非等比缩放会变形，stage的宽高等于设计宽高。*/
Stage.SCALE_EXACTFIT = "exactfit";
/**应用显示全部内容，按照最小比率缩放，等比缩放不变形，一边可能会留空白，stage的宽高等于设计宽高。*/
Stage.SCALE_SHOWALL = "showall";
/**应用按照最大比率缩放显示，宽或高方向会显示一部分，等比缩放不变形，stage的宽高等于设计宽高。*/
Stage.SCALE_NOBORDER = "noborder";
/**应用保持设计宽高不变，不缩放不变形，stage的宽高等于屏幕宽高。*/
Stage.SCALE_FULL = "full";
/**应用保持设计宽度不变，高度根据屏幕比缩放，stage的宽度等于设计高度，高度根据屏幕比率大小而变化*/
Stage.SCALE_FIXED_WIDTH = "fixedwidth";
/**应用保持设计高度不变，宽度根据屏幕比缩放，stage的高度等于设计宽度，宽度根据屏幕比率大小而变化*/
Stage.SCALE_FIXED_HEIGHT = "fixedheight";
/**应用保持设计比例不变，全屏显示全部内容(类似showall，但showall非全屏，会有黑边)，根据屏幕长宽比，自动选择使用SCALE_FIXED_WIDTH或SCALE_FIXED_HEIGHT*/
Stage.SCALE_FIXED_AUTO = "fixedauto";
/**画布水平居左对齐。*/
Stage.ALIGN_LEFT = "left";
/**画布水平居右对齐。*/
Stage.ALIGN_RIGHT = "right";
/**画布水平居中对齐。*/
Stage.ALIGN_CENTER = "center";
/**画布垂直居上对齐。*/
Stage.ALIGN_TOP = "top";
/**画布垂直居中对齐。*/
Stage.ALIGN_MIDDLE = "middle";
/**画布垂直居下对齐。*/
Stage.ALIGN_BOTTOM = "bottom";
/**不更改屏幕。*/
Stage.SCREEN_NONE = "none";
/**自动横屏。*/
Stage.SCREEN_HORIZONTAL = "horizontal";
/**自动竖屏。*/
Stage.SCREEN_VERTICAL = "vertical";
/**全速模式，以60的帧率运行。*/
Stage.FRAME_FAST = "fast";
/**慢速模式，以30的帧率运行。*/
Stage.FRAME_SLOW = "slow";
/**自动模式，以30的帧率运行，但鼠标活动后会自动加速到60，鼠标不动2秒后降低为30帧，以节省消耗。*/
Stage.FRAME_MOUSE = "mouse";
/**休眠模式，以1的帧率运行*/
Stage.FRAME_SLEEP = "sleep";
/**@private */
Stage._dbgSprite = new Sprite();
/** @private */
Stage.clear = function (value) {
    //修改需要同步到上面的native实现中
    Context.set2DRenderConfig(); //渲染2D前要还原2D状态,否则可能受3D影响
    RenderState2D.worldScissorTest && WebGLContext.mainContext.disable(WebGL2RenderingContext.SCISSOR_TEST);
    var ctx = Render.context;
    //兼容浏览器
    var c = (ctx._submits._length == 0 || Config.preserveDrawingBuffer) ? ColorUtils.create(value).arrColor : window.Laya.stage._wgColor;
    if (c)
        ctx.clearBG(c[0], c[1], c[2], c[3]);
    else
        ctx.clearBG(0, 0, 0, 0);
    RenderState2D.clear();
};
