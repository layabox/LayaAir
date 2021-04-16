import { ILaya } from "../../ILaya";
import { Const } from "../Const";
import { Event } from "../events/Event";
import { EventDispatcher } from "../events/EventDispatcher";
import { ColorFilter } from "../filters/ColorFilter";
import { Filter } from "../filters/Filter";
import { GrahamScan } from "../maths/GrahamScan";
import { Matrix } from "../maths/Matrix";
import { Point } from "../maths/Point";
import { Rectangle } from "../maths/Rectangle";
import { RenderSprite } from "../renders/RenderSprite";
import { Context } from "../resource/Context";
import { HTMLCanvas } from "../resource/HTMLCanvas";
import { Texture } from "../resource/Texture";
import { Texture2D } from "../resource/Texture2D";
import { ClassUtils } from "../utils/ClassUtils";
import { Handler } from "../utils/Handler";
import { Utils } from "../utils/Utils";
import { BoundsStyle } from "./css/BoundsStyle";
import { CacheStyle } from "./css/CacheStyle";
import { SpriteStyle } from "./css/SpriteStyle";
import { Graphics } from "./Graphics";
import { Node } from "./Node";
import { SpriteConst } from "./SpriteConst";
import { Stage } from "./Stage";
import { URL } from "../net/URL";
import { RenderTexture2D } from "../resource/RenderTexture2D";


/**在显示对象上按下后调度。
 * @eventType Event.MOUSE_DOWN
 * */
/*[Event(name = "mousedown", type = "laya.events.Event")]*/
/**在显示对象抬起后调度。
 * @eventType Event.MOUSE_UP
 * */
/*[Event(name = "mouseup", type = "laya.events.Event")]*/
/**鼠标在对象身上进行移动后调度
 * @eventType Event.MOUSE_MOVE
 * */
/*[Event(name = "mousemove", type = "laya.events.Event")]*/
/**鼠标经过对象后调度。
 * @eventType Event.MOUSE_OVER
 * */
/*[Event(name = "mouseover", type = "laya.events.Event")]*/
/**鼠标离开对象后调度。
 * @eventType Event.MOUSE_OUT
 * */
/*[Event(name = "mouseout", type = "laya.events.Event")]*/
/**鼠标点击对象后调度。
 * @eventType Event.CLICK
 * */
/*[Event(name = "click", type = "laya.events.Event")]*/
/**开始拖动后调度。
 * @eventType Event.DRAG_START
 * */
/*[Event(name = "dragstart", type = "laya.events.Event")]*/
/**拖动中调度。
 * @eventType Event.DRAG_MOVE
 * */
/*[Event(name = "dragmove", type = "laya.events.Event")]*/
/**拖动结束后调度。
 * @eventType Event.DRAG_END
 * */
/*[Event(name = "dragend", type = "laya.events.Event")]*/

/**
 * <p> <code>Sprite</code> 是基本的显示图形的显示列表节点。 <code>Sprite</code> 默认没有宽高，默认不接受鼠标事件。通过 <code>graphics</code> 可以绘制图片或者矢量图，支持旋转，缩放，位移等操作。<code>Sprite</code>同时也是容器类，可用来添加多个子节点。</p>
 * <p>注意： <code>Sprite</code> 默认没有宽高，可以通过<code>getBounds</code>函数获取；也可手动设置宽高；还可以设置<code>autoSize=true</code>，然后再获取宽高。<code>Sprite</code>的宽高一般用于进行碰撞检测和排版，并不影响显示图像大小，如果需要更改显示图像大小，请使用 <code>scaleX</code> ， <code>scaleY</code> ， <code>scale</code>。</p>
 * <p> <code>Sprite</code> 默认不接受鼠标事件，即<code>mouseEnabled=false</code>，但是只要对其监听任意鼠标事件，会自动打开自己以及所有父对象的<code>mouseEnabled=true</code>。所以一般也无需手动设置<code>mouseEnabled</code>。</p>
 * <p>LayaAir引擎API设计精简巧妙。核心显示类只有一个<code>Sprite</code>。<code>Sprite</code>针对不同的情况做了渲染优化，所以保证一个类实现丰富功能的同时，又达到高性能。</p>
 *
 * @example <caption>创建了一个 <code>Sprite</code> 实例。</caption>
 * package
 * {
 * 	import laya.display.Sprite;
 * 	import laya.events.Event;
 *
 * 	public class Sprite_Example
 * 	{
 * 		private var sprite:Sprite;
 * 		private var shape:Sprite
 * 		public function Sprite_Example()
 * 		{
 * 			Laya.init(640, 800);//设置游戏画布宽高、渲染模式。
 * 			Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
 * 			onInit();
 * 		}
 * 		private function onInit():void
 * 		{
 * 			sprite = new Sprite();//创建一个 Sprite 类的实例对象 sprite 。
 * 			sprite.loadImage("resource/ui/bg.png");//加载并显示图片。
 * 			sprite.x = 200;//设置 sprite 对象相对于父容器的水平方向坐标值。
 * 			sprite.y = 200;//设置 sprite 对象相对于父容器的垂直方向坐标值。
 * 			sprite.pivotX = 0;//设置 sprite 对象的水平方法轴心点坐标。
 * 			sprite.pivotY = 0;//设置 sprite 对象的垂直方法轴心点坐标。
 * 			Laya.stage.addChild(sprite);//将此 sprite 对象添加到显示列表。
 * 			sprite.on(Event.CLICK, this, onClickSprite);//给 sprite 对象添加点击事件侦听。
	
 * 			shape = new Sprite();//创建一个 Sprite 类的实例对象 sprite 。
 * 			shape.graphics.drawRect(0, 0, 100, 100, "#ccff00", "#ff0000", 2);//绘制一个有边框的填充矩形。
 * 			shape.x = 400;//设置 shape 对象相对于父容器的水平方向坐标值。
 * 			shape.y = 200;//设置 shape 对象相对于父容器的垂直方向坐标值。
 * 			shape.width = 100;//设置 shape 对象的宽度。
 * 			shape.height = 100;//设置 shape 对象的高度。
 * 			shape.pivotX = 50;//设置 shape 对象的水平方法轴心点坐标。
 * 			shape.pivotY = 50;//设置 shape 对象的垂直方法轴心点坐标。
 * 			Laya.stage.addChild(shape);//将此 shape 对象添加到显示列表。
 * 			shape.on(Event.CLICK, this, onClickShape);//给 shape 对象添加点击事件侦听。
 * 		}
 * 		private function onClickSprite():void
 * 		{
 * 			trace("点击 sprite 对象。");
 * 			sprite.rotation += 5;//旋转 sprite 对象。
 * 		}
 * 		private function onClickShape():void
 * 		{
 * 			trace("点击 shape 对象。");
 * 			shape.rotation += 5;//旋转 shape 对象。
 * 		}
 * 	}
 * }
 *
 * @example
 * var sprite;
 * var shape;
 * Sprite_Example();
 * function Sprite_Example()
 * {
 *     Laya.init(640, 800);//设置游戏画布宽高、渲染模式。
 *     Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
 *     onInit();
 * }
 * function onInit()
 * {
 *     sprite = new laya.display.Sprite();//创建一个 Sprite 类的实例对象 sprite 。
 *     sprite.loadImage("resource/ui/bg.png");//加载并显示图片。
 *     sprite.x = 200;//设置 sprite 对象相对于父容器的水平方向坐标值。
 *     sprite.y = 200;//设置 sprite 对象相对于父容器的垂直方向坐标值。
 *     sprite.pivotX = 0;//设置 sprite 对象的水平方法轴心点坐标。
 *     sprite.pivotY = 0;//设置 sprite 对象的垂直方法轴心点坐标。
 *     Laya.stage.addChild(sprite);//将此 sprite 对象添加到显示列表。
 *     sprite.on(Event.CLICK, this, onClickSprite);//给 sprite 对象添加点击事件侦听。
	
 *     shape = new laya.display.Sprite();//创建一个 Sprite 类的实例对象 sprite 。
 *     shape.graphics.drawRect(0, 0, 100, 100, "#ccff00", "#ff0000", 2);//绘制一个有边框的填充矩形。
 *     shape.x = 400;//设置 shape 对象相对于父容器的水平方向坐标值。
 *     shape.y = 200;//设置 shape 对象相对于父容器的垂直方向坐标值。
 *     shape.width = 100;//设置 shape 对象的宽度。
 *     shape.height = 100;//设置 shape 对象的高度。
 *     shape.pivotX = 50;//设置 shape 对象的水平方法轴心点坐标。
 *     shape.pivotY = 50;//设置 shape 对象的垂直方法轴心点坐标。
 *     Laya.stage.addChild(shape);//将此 shape 对象添加到显示列表。
 *     shape.on(laya.events.Event.CLICK, this, onClickShape);//给 shape 对象添加点击事件侦听。
 * }
 * function onClickSprite()
 * {
 *     console.log("点击 sprite 对象。");
 *     sprite.rotation += 5;//旋转 sprite 对象。
 * }
 * function onClickShape()
 * {
 *     console.log("点击 shape 对象。");
 *     shape.rotation += 5;//旋转 shape 对象。
 * }
 *
 * @example
 * import Sprite = laya.display.Sprite;
 * class Sprite_Example {
 *     private sprite: Sprite;
 *     private shape: Sprite
 *     public Sprite_Example() {
 *         Laya.init(640, 800);//设置游戏画布宽高、渲染模式。
 *         Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
 *         this.onInit();
 *     }
 *     private onInit(): void {
 *         this.sprite = new Sprite();//创建一个 Sprite 类的实例对象 sprite 。
 *         this.sprite.loadImage("resource/ui/bg.png");//加载并显示图片。
 *         this.sprite.x = 200;//设置 sprite 对象相对于父容器的水平方向坐标值。
 *         this.sprite.y = 200;//设置 sprite 对象相对于父容器的垂直方向坐标值。
 *         this.sprite.pivotX = 0;//设置 sprite 对象的水平方法轴心点坐标。
 *         this.sprite.pivotY = 0;//设置 sprite 对象的垂直方法轴心点坐标。
 *         Laya.stage.addChild(this.sprite);//将此 sprite 对象添加到显示列表。
 *         this.sprite.on(laya.events.Event.CLICK, this, this.onClickSprite);//给 sprite 对象添加点击事件侦听。
	
 *         this.shape = new Sprite();//创建一个 Sprite 类的实例对象 sprite 。
 *         this.shape.graphics.drawRect(0, 0, 100, 100, "#ccff00", "#ff0000", 2);//绘制一个有边框的填充矩形。
 *         this.shape.x = 400;//设置 shape 对象相对于父容器的水平方向坐标值。
 *         this.shape.y = 200;//设置 shape 对象相对于父容器的垂直方向坐标值。
 *         this.shape.width = 100;//设置 shape 对象的宽度。
 *         this.shape.height = 100;//设置 shape 对象的高度。
 *         this.shape.pivotX = 50;//设置 shape 对象的水平方法轴心点坐标。
 *         this.shape.pivotY = 50;//设置 shape 对象的垂直方法轴心点坐标。
 *         Laya.stage.addChild(this.shape);//将此 shape 对象添加到显示列表。
 *         this.shape.on(laya.events.Event.CLICK, this, this.onClickShape);//给 shape 对象添加点击事件侦听。
 *     }
 *     private onClickSprite(): void {
 *         console.log("点击 sprite 对象。");
 *         this.sprite.rotation += 5;//旋转 sprite 对象。
 *     }
 *     private onClickShape(): void {
 *         console.log("点击 shape 对象。");
 *         this.shape.rotation += 5;//旋转 shape 对象。
 *     }
 * }
 */
export class Sprite extends Node {
    /**@internal */
    _x: number = 0;
    /**@internal */
    _y: number = 0;
    /**@internal */
    _width: number = 0;
    /**@internal */
    _height: number = 0;
    /**@internal */
    _visible: boolean = true;
    /**@internal 鼠标状态，0:auto,1:mouseEnabled=false,2:mouseEnabled=true。*/
    _mouseState: number = 0;
    /**@internal z排序，数值越大越靠前。*/
    _zOrder: number = 0;
    /**@internal */
    _renderType: number = 0;
    /**@internal */
    _transform: Matrix|null = null;
    /**@internal */
    protected _tfChanged: boolean = false;
    /**@internal */
    protected _repaint: number = SpriteConst.REPAINT_NONE;
    /**@internal */
    private _texture: Texture|null = null;

    //以下变量为系统调用，请不要直接使用
    /**@internal */
    _style: SpriteStyle = SpriteStyle.EMPTY;
    /**@internal */
    _cacheStyle: CacheStyle = CacheStyle.EMPTY;
    /**@internal */
    _boundStyle: BoundsStyle|null = null;
    /**@internal */
    _graphics: Graphics|null = null;

    /**
     * <p>鼠标事件与此对象的碰撞检测是否可穿透。碰撞检测发生在鼠标事件的捕获阶段，此阶段引擎会从stage开始递归检测stage及其子对象，直到找到命中的目标对象或者未命中任何对象。</p>
     * <p>穿透表示鼠标事件发生的位置处于本对象绘图区域内时，才算命中，而与对象宽高和值为Rectangle对象的hitArea属性无关。如果sprite.hitArea值是HitArea对象，表示显式声明了此对象的鼠标事件响应区域，而忽略对象的宽高、mouseThrough属性。</p>
     * <p>影响对象鼠标事件响应区域的属性为：width、height、hitArea，优先级顺序为：hitArea(type:HitArea)>hitArea(type:Rectangle)>width/height。</p>
     * @default false	不可穿透，此对象的鼠标响应区域由width、height、hitArea属性决定。</p>
     */
    mouseThrough: boolean = false;
    /**
     * <p>指定是否自动计算宽高数据。默认值为 false 。</p>
     * <p>Sprite宽高默认为0，并且不会随着绘制内容的变化而变化，如果想根据绘制内容获取宽高，可以设置本属性为true，或者通过getBounds方法获取。设置为true，对性能有一定影响。</p>
     */
    autoSize: boolean = false;
    /**
     * <p>指定鼠标事件检测是优先检测自身，还是优先检测其子对象。鼠标事件检测发生在鼠标事件的捕获阶段，此阶段引擎会从stage开始递归检测stage及其子对象，直到找到命中的目标对象或者未命中任何对象。</p>
     * <p>如果为false，优先检测子对象，当有子对象被命中时，中断检测，获得命中目标。如果未命中任何子对象，最后再检测此对象；如果为true，则优先检测本对象，如果本对象没有被命中，直接中断检测，表示没有命中目标；如果本对象被命中，则进一步递归检测其子对象，以确认最终的命中目标。</p>
     * <p>合理使用本属性，能减少鼠标事件检测的节点，提高性能。可以设置为true的情况：开发者并不关心此节点的子节点的鼠标事件检测结果，也就是以此节点作为其子节点的鼠标事件检测依据。</p>
     * <p>Stage对象和UI的View组件默认为true。</p>
     * @default false	优先检测此对象的子对象，当递归检测完所有子对象后，仍然没有找到目标对象，最后再检测此对象。
     */
    hitTestPrior: boolean = false;

    /**
     * @inheritDoc 
     * @override
     */
    destroy(destroyChild: boolean = true): void {
        super.destroy(destroyChild);
        this._style && this._style.recover();
        this._cacheStyle && this._cacheStyle.recover();
        this._boundStyle && this._boundStyle.recover();
        this._style = null;
        this._cacheStyle = null;
        this._boundStyle = null;
        this._transform = null;
        if (this._graphics && this._graphics.autoDestroy) {
            this._graphics.destroy();
        }
        this._graphics = null;
        this.texture = null;
    }

    constructor() {
        super();
    }

    /**根据zOrder进行重新排序。*/
    updateZOrder(): void {
        Utils.updateOrder(this._children) && this.repaint();
    }

    /**
     * @internal
     */
    _getBoundsStyle(): BoundsStyle {
        if (!this._boundStyle) this._boundStyle = BoundsStyle.create();
        return this._boundStyle;
    }

    /**@internal */
    _setCustomRender(): void {

    }

    /**
     * 设置是否开启自定义渲染，只有开启自定义渲染，才能使用customRender函数渲染。
     */
    set customRenderEnable(b: boolean) {
        if (b) {
            this._renderType |= SpriteConst.CUSTOM;
            this._setRenderType(this._renderType);
            this._setCustomRender();
        }
    }

    /**
     * 指定显示对象是否缓存为静态图像，cacheAs时，子对象发生变化，会自动重新缓存，同时也可以手动调用reCache方法更新缓存。
     * 建议把不经常变化的“复杂内容”缓存为静态图像，能极大提高渲染性能。cacheAs有"none"，"normal"和"bitmap"三个值可选。
     * 默认为"none"，不做任何缓存。
     * 当值为"normal"时，canvas模式下进行画布缓存，webgl模式下进行命令缓存。
     * 当值为"bitmap"时，canvas模式下进行依然是画布缓存，webgl模式下使用renderTarget缓存。
     * webgl下renderTarget缓存模式缺点：会额外创建renderTarget对象，增加内存开销，缓存面积有最大2048限制，不断重绘时会增加CPU开销。优点：大幅减少drawcall，渲染性能最高。
     * webgl下命令缓存模式缺点：只会减少节点遍历及命令组织，不会减少drawcall数，性能中等。优点：没有额外内存开销，无需renderTarget支持。
     */
    get cacheAs(): string {
        return this._cacheStyle.cacheAs;
    }

    /**@internal */
    _setCacheAs(value: string): void {
        //_dataf32[SpriteConst.POSCACHE] = value == "bitmap"?2:(value == "normal"?1:0);
    }

    set cacheAs(value: string) {
        if (value === this._cacheStyle.userSetCache) return;
        if (this.mask && value === 'normal') return;
        this._setCacheAs(value);
        this._getCacheStyle().userSetCache = value;
        this._checkCanvasEnable();
        this.repaint();
    }

    /**
     * 更新_cnavas相关的状态
     */
    private _checkCanvasEnable(): void {
        var tEnable: boolean = this._cacheStyle.needEnableCanvasRender();
        this._getCacheStyle().enableCanvasRender = tEnable;
        if (tEnable) {
            if (this._cacheStyle.needBitmapCache()) {
                this._cacheStyle.cacheAs = "bitmap";
            } else {
                this._cacheStyle.cacheAs = this._cacheStyle.userSetCache;
            }
            this._cacheStyle.reCache = true;
            this._renderType |= SpriteConst.CANVAS;
        } else {
            this._cacheStyle.cacheAs = "none";
            this._cacheStyle.releaseContext();
            this._renderType &= ~SpriteConst.CANVAS;
        }
        this._setCacheAs(this._cacheStyle.cacheAs);
        this._setRenderType(this._renderType);
    }

    /**设置cacheAs为非空时此值才有效，staticCache=true时，子对象变化时不会自动更新缓存，只能通过调用reCache方法手动刷新。*/
    get staticCache(): boolean {
        return this._cacheStyle.staticCache;
    }

    set staticCache(value: boolean) {
        this._getCacheStyle().staticCache = value;
        if (!value) this.reCache();
    }

    /**在设置cacheAs的情况下，调用此方法会重新刷新缓存。*/
    reCache(): void {
        this._cacheStyle.reCache = true;
        this._repaint |= SpriteConst.REPAINT_CACHE;
    }

    getRepaint(): number {
        return this._repaint;
    }

    /**@internal */
    _setX(value: number): void {
        this._x = value;
    }

    /**@internal */
    _setY(value: number): void {
        this._y = value;
    }

    /**@internal */
    _setWidth(texture: Texture, value: number): void {
    }

    /**@internal */
    _setHeight(texture: Texture, value: number): void {
    }

    /**表示显示对象相对于父容器的水平方向坐标值。*/
    get x(): number {
        return this._x;
    }

    set x(value: number) {
        if (this.destroyed) return;
        if (this._x !== value) {
            this._setX(value);
            //_setTranformChange();
            this.parentRepaint(SpriteConst.REPAINT_CACHE);
            var p: Sprite = this._cacheStyle.maskParent;
            if (p) {
                p.repaint(SpriteConst.REPAINT_CACHE);
            }
        }
    }

    /**表示显示对象相对于父容器的垂直方向坐标值。*/
    get y(): number {
        return this._y;
    }

    set y(value: number) {
        if (this.destroyed) return;
        if (this._y !== value) {
            this._setY(value);
            //_setTranformChange();
            this.parentRepaint(SpriteConst.REPAINT_CACHE);
            var p: Sprite = this._cacheStyle.maskParent;
            if (p) {
                p.repaint(SpriteConst.REPAINT_CACHE);
            }
        }
    }

    /**
     * <p>显示对象的宽度，单位为像素，默认为0。</p>
     * <p>此宽度用于鼠标碰撞检测，并不影响显示对象图像大小。需要对显示对象的图像进行缩放，请使用scale、scaleX、scaleY。</p>
     * <p>可以通过getbounds获取显示对象图像的实际宽度。</p>
     */
    get width(): number {
        return this.get_width();
    }

    set width(value: number) {
        this.set_width(value);
    }

    // for ts
    set_width(value: number): void {
        if (this._width !== value) {
            this._width = value;
            this._setWidth(this.texture, value);
            this._setTranformChange();
            //repaint();
        }
    }
    get_width(): number {
        if (!this.autoSize) return this._width || (this.texture ? this.texture.width : 0);
        if (this.texture) return this.texture.width;
        if (!this._graphics && this._children.length === 0) return 0;
        return this.getSelfBounds().width;
    }

    /**
     * <p>显示对象的高度，单位为像素，默认为0。</p>
     * <p>此高度用于鼠标碰撞检测，并不影响显示对象图像大小。需要对显示对象的图像进行缩放，请使用scale、scaleX、scaleY。</p>
     * <p>可以通过getbounds获取显示对象图像的实际高度。</p>
     */
    get height(): number {
        return this.get_height();
    }

    set height(value: number) {
        this.set_height(value);
    }

    // for ts
    set_height(value: number): void {
        if (this._height !== value) {
            this._height = value;
            this._setHeight(this.texture, value);
            this._setTranformChange();
            //repaint();
        }
    }
    get_height(): number {
        if (!this.autoSize) return this._height || (this.texture ? this.texture.height : 0);
        if (this.texture) return this.texture.height;
        if (!this._graphics && this._children.length === 0) return 0;
        return this.getSelfBounds().height;
    }

    /**
     * <p>对象的显示宽度（以像素为单位）。</p>
     */
    get displayWidth(): number {
        return this.width * this.scaleX;
    }

    /**
     * <p>对象的显示高度（以像素为单位）。</p>
     */
    get displayHeight(): number {
        return this.height * this.scaleY;
    }

    /**
     * 设置对象bounds大小，如果有设置，则不再通过getBounds计算，合理使用能提高性能。
     * @param	bound bounds矩形区域
     */
    setSelfBounds(bound: Rectangle): void {
        this._getBoundsStyle().userBounds = bound;
    }

    /**
     * <p>获取本对象在父容器坐标系的矩形显示区域。</p>
     * <p><b>注意：</b>计算量较大，尽量少用。</p>
     * @return 矩形区域。
     */
    getBounds(): Rectangle {
        return this._getBoundsStyle().bounds = Rectangle._getWrapRec(this._boundPointsToParent());
    }

    /**
     * 获取本对象在自己坐标系的矩形显示区域。
     * <p><b>注意：</b>计算量较大，尽量少用。</p>
     * @return 矩形区域。
     */
    getSelfBounds(): Rectangle {
        if (this._boundStyle && this._boundStyle.userBounds) return this._boundStyle.userBounds;
        if (!this._graphics && this._children.length === 0 && !this._texture)
            return Rectangle.TEMP.setTo(0, 0, this.width, this.height); // 如果没有graphics则取对象指定的大小。原来是0000
        //if (_renderType === (SpriteConst.IMAGE | SpriteConst.GRAPHICS)) {
        //_getBoundsStyle();
        //if (!_boundStyle.bounds) _boundStyle.bounds = Rectangle.create();
        //var tDrawCmd:Array = _graphics._one;
        //return _boundStyle.bounds.setTo(tDrawCmd[1], tDrawCmd[2], tDrawCmd[3], tDrawCmd[4]);
        //}
        return this._getBoundsStyle().bounds = Rectangle._getWrapRec(this._getBoundPointsM(false));
    }

    /**
     * @internal
     * 获取本对象在父容器坐标系的显示区域多边形顶点列表。
     * 当显示对象链中有旋转时，返回多边形顶点列表，无旋转时返回矩形的四个顶点。
     * @param ifRotate	（可选）之前的对象链中是否有旋转。
     * @return 顶点列表。结构：[x1,y1,x2,y2,x3,y3,...]。
     */
    _boundPointsToParent(ifRotate: boolean = false): any[] {
        var pX: number = 0, pY: number = 0;
        if (this._style) {
            pX = this.pivotX;
            pY = this.pivotY;
            ifRotate = ifRotate || (this._style.rotation !== 0);
            if (this._style.scrollRect) {
                pX += this._style.scrollRect.x;
                pY += this._style.scrollRect.y;
            }
        }
        var pList: any[] = this._getBoundPointsM(ifRotate);
        if (!pList || pList.length < 1) return pList;

        if (pList.length != 8) {
            pList = ifRotate ? GrahamScan.scanPList(pList) : Rectangle._getWrapRec(pList, Rectangle.TEMP)._getBoundPoints();
        }

        if (!this.transform) {
            Utils.transPointList(pList, this._x - pX, this._y - pY);
            return pList;
        }
        var tPoint: Point = Point.TEMP;
        var i: number, len: number = pList.length;
        for (i = 0; i < len; i += 2) {
            tPoint.x = pList[i];
            tPoint.y = pList[i + 1];
            this.toParentPoint(tPoint);
            pList[i] = tPoint.x;
            pList[i + 1] = tPoint.y;
        }
        return pList;
    }

    /**
     * 返回此实例中的绘图对象（ <code>Graphics</code> ）的显示区域，不包括子对象。
     * @param realSize	（可选）使用图片的真实大小，默认为false
     * @return 一个 Rectangle 对象，表示获取到的显示区域。
     */
    getGraphicBounds(realSize: boolean = false): Rectangle {
        if (!this._graphics) return Rectangle.TEMP.setTo(0, 0, 0, 0);
        return this._graphics.getBounds(realSize);
    }

    /**
     * @internal
     * 获取自己坐标系的显示区域多边形顶点列表
     * @param ifRotate	（可选）当前的显示对象链是否由旋转
     * @return 顶点列表。结构：[x1,y1,x2,y2,x3,y3,...]。
     */
    _getBoundPointsM(ifRotate: boolean = false): any[] {
        if (this._boundStyle && this._boundStyle.userBounds) return this._boundStyle.userBounds._getBoundPoints();
        if (!this._boundStyle) this._getBoundsStyle();
        if (!this._boundStyle.temBM) this._boundStyle.temBM = [];
        if (this._style.scrollRect) {
            var rst: any[] = Utils.clearArray(this._boundStyle.temBM);
            var rec: Rectangle = Rectangle.TEMP;
            rec.copyFrom(this._style.scrollRect);
            Utils.concatArray(rst, rec._getBoundPoints());
            return rst;
        }
        var pList: any[];
        if (this._graphics) {
            pList = this._graphics.getBoundPoints();
        } else {
            pList = Utils.clearArray(this._boundStyle.temBM);
        }
        if (this._texture) {
            rec = Rectangle.TEMP;
            rec.setTo(0, 0, this.width || this._texture.width, this.height || this._texture.height);
            Utils.concatArray(pList, rec._getBoundPoints());
        }
        //处理子对象区域
        var child: Sprite;
        var cList: any[];
        var __childs: any[];
        __childs = this._children;
        for (var i: number = 0, n: number = __childs.length; i < n; i++) {
            //child = getChildAt(i) as Sprite; 
            child = (<Sprite>__childs[i]);
            if (child instanceof Sprite && child._visible === true) {
                cList = child._boundPointsToParent(ifRotate);
                if (cList)
                    pList = pList ? Utils.concatArray(pList, cList) : cList;
            }
        }
        return pList;
    }

    /**
     * @internal
     * 获取cache数据。
     * @return  cache数据 CacheStyle 。
     */
    _getCacheStyle(): CacheStyle {
        this._cacheStyle === CacheStyle.EMPTY && (this._cacheStyle = CacheStyle.create());
        return this._cacheStyle;
    }

    /**
     * @private
     * 获取样式。
     * @return  样式 Style 。
     */
    getStyle(): SpriteStyle {
        this._style === SpriteStyle.EMPTY && (this._style = SpriteStyle.create());
        return this._style;
    }

    /**
     * @private
     * 设置样式。
     * @param	value 样式。
     */
    setStyle(value: SpriteStyle): void {
        this._style = value;
    }

    /**X轴缩放值，默认值为1。设置为负数，可以实现水平反转效果，比如scaleX=-1。*/
    get scaleX(): number {
        return this._style.scaleX;
    }

    set scaleX(value: number) {
        this.set_scaleX(value);
    }

    /**@internal */
    _setScaleX(value: number): void {
        this._style.scaleX = value;
    }

    /**Y轴缩放值，默认值为1。设置为负数，可以实现垂直反转效果，比如scaleX=-1。*/
    get scaleY(): number {
        return this._style.scaleY;
    }

    set scaleY(value: number) {
        this.set_scaleY(value);
    }

    /**@internal */
    _setScaleY(value: number): void {
        this._style.scaleY = value;
    }


    set_scaleX(value: number): void {
        var style: SpriteStyle = this.getStyle();
        if (style.scaleX !== value) {
            this._setScaleX(value);
            this._setTranformChange();
        }
    }
    get_scaleX(): number {
        return this._style.scaleX;
    }

    set_scaleY(value: number): void {
        var style: SpriteStyle = this.getStyle();
        if (style.scaleY !== value) {
            this._setScaleY(value);
            this._setTranformChange();
        }
    }
    get_scaleY(): number {
        return this._style.scaleY;
    }

    /**旋转角度，默认值为0。以角度为单位。*/
    get rotation(): number {
        return this._style.rotation;
    }

    set rotation(value: number) {
        var style: SpriteStyle = this.getStyle();
        if (style.rotation !== value) {
            this._setRotation(value);
            this._setTranformChange();
        }
    }

    /**@internal */
    _setRotation(value: number): void {
        this._style.rotation = value;
    }

    /**水平倾斜角度，默认值为0。以角度为单位。*/
    get skewX(): number {
        return this._style.skewX;
    }

    set skewX(value: number) {
        var style: SpriteStyle = this.getStyle();
        if (style.skewX !== value) {
            this._setSkewX(value);
            this._setTranformChange();
        }
    }

    /**@internal */
    _setSkewX(value: number): void {
        this._style.skewX = value;
    }

    /**垂直倾斜角度，默认值为0。以角度为单位。*/
    get skewY(): number {
        return this._style.skewY;
    }

    set skewY(value: number) {
        var style: SpriteStyle = this.getStyle();
        if (style.skewY !== value) {
            this._setSkewY(value);
            this._setTranformChange();
        }
    }

    /**@internal */
    _setSkewY(value: number): void {
        this._style.skewY = value;
    }

    /**@internal */
    _createTransform(): Matrix {
        return Matrix.create();
    }

    /**@private */
    protected _adjustTransform(): Matrix {
        this._tfChanged = false;
        var style: SpriteStyle = this._style;
        var sx: number = style.scaleX, sy: number = style.scaleY;
        var sskx: number = style.skewX;
        var ssky: number = style.skewY;
        var rot: number = style.rotation;
        var m: Matrix = this._transform || (this._transform = this._createTransform());
        if (rot || sx !== 1 || sy !== 1 || sskx !== 0 || ssky !== 0) {
            m._bTransform = true;
            var skx: number = (rot - sskx) * 0.0174532922222222;//laya.CONST.PI180;
            var sky: number = (rot + ssky) * 0.0174532922222222;
            var cx: number = Math.cos(sky);
            var ssx: number = Math.sin(sky);
            var cy: number = Math.sin(skx);
            var ssy: number = Math.cos(skx);
            m.a = sx * cx;
            m.b = sx * ssx;
            m.c = -sy * cy;
            m.d = sy * ssy;
            m.tx = m.ty = 0;
        } else {
            m.identity();
            this._renderType &= ~SpriteConst.TRANSFORM;
            this._setRenderType(this._renderType);
        }
        return m;
    }

    /**@internal */
    _setTransform(value: Matrix): void {

    }

    /**
     * <p>对象的矩阵信息。通过设置矩阵可以实现节点旋转，缩放，位移效果。</p>
     * <p>矩阵更多信息请参考 <code>Matrix</code></p>
     */
    get transform(): Matrix {
        return this._tfChanged ? this._adjustTransform() : this._transform;
    }

    set transform(value: Matrix) {
        this.set_transform(value);
    }

    get_transform(): Matrix {
        return this._tfChanged ? this._adjustTransform() : this._transform;
    }

    set_transform(value: Matrix): void {
        this._tfChanged = false;
        var m: Matrix = this._transform || (this._transform = this._createTransform());
        value.copyTo(m);
        this._setTransform(m);
        //设置transform时重置x,y
        if (value) {
            this._x = m.tx;
            this._y = m.ty;
            m.tx = m.ty = 0;
        }
        if (value) this._renderType |= SpriteConst.TRANSFORM;
        else {
            this._renderType &= ~SpriteConst.TRANSFORM;
        }
        this._setRenderType(this._renderType);
        this.parentRepaint();
    }

    /**@internal */
    _setPivotX(value: number): void {
        var style: SpriteStyle = this.getStyle();
        style.pivotX = value;
    }

    /**@internal */
    _getPivotX(): number {
        return this._style.pivotX;
    }

    /**@internal */
    _setPivotY(value: number): void {
        var style: SpriteStyle = this.getStyle();
        style.pivotY = value;
    }

    /**@internal */
    _getPivotY(): number {
        return this._style.pivotY;
    }

    /**X轴 轴心点的位置，单位为像素，默认为0。轴心点会影响对象位置，缩放中心，旋转中心。*/
    get pivotX(): number {
        return this._getPivotX();
    }

    set pivotX(value: number) {
        this._setPivotX(value);
        this.repaint();
    }

    /**Y轴 轴心点的位置，单位为像素，默认为0。轴心点会影响对象位置，缩放中心，旋转中心。*/
    get pivotY(): number {
        return this._getPivotY();
    }

    set pivotY(value: number) {
        this._setPivotY(value);
        this.repaint();
    }

    /**@internal */
    _setAlpha(value: number): void {
        if (this._style.alpha !== value) {
            var style: SpriteStyle = this.getStyle();
            style.alpha = value;
            if (value !== 1) this._renderType |= SpriteConst.ALPHA;
            else this._renderType &= ~SpriteConst.ALPHA;
            this._setRenderType(this._renderType);
            this.parentRepaint();
        }
    }

    /**@internal */
    _getAlpha(): number {
        return this._style.alpha;
    }

    /**透明度，值为0-1，默认值为1，表示不透明。更改alpha值会影响drawcall。*/
    get alpha(): number {
        return this._getAlpha();
    }

    set alpha(value: number) {
        value = value < 0 ? 0 : (value > 1 ? 1 : value);
        this._setAlpha(value);
    }

    /**表示是否可见，默认为true。如果设置不可见，节点将不被渲染。*/
    get visible(): boolean {
        return this.get_visible();
    }

    set visible(value: boolean) {
        this.set_visible(value);
    }

    get_visible(): boolean {
        return this._visible;
    }

    set_visible(value: boolean): void {
        if (this._visible !== value) {
            this._visible = value;
            this.parentRepaint(SpriteConst.REPAINT_ALL);
        }
    }

    /**@internal */
    _setBlendMode(value: string): void {

    }

    /**指定要使用的混合模式。目前只支持"lighter"。*/
    get blendMode(): string {
        return this._style.blendMode;
    }

    set blendMode(value: string) {
        this._setBlendMode(value);
        this.getStyle().blendMode = value;
        if (value && value != "source-over") this._renderType |= SpriteConst.BLEND;
        else this._renderType &= ~SpriteConst.BLEND;
        this._setRenderType(this._renderType);
        this.parentRepaint();
    }

    /**绘图对象。封装了绘制位图和矢量图的接口，Sprite所有的绘图操作都通过Graphics来实现的。*/
    get graphics(): Graphics {
        if (!this._graphics) {
            this.graphics = new Graphics();
            this._graphics.autoDestroy = true;
        }
        return this._graphics;
    }

    /**@internal */
    _setGraphics(value: Graphics): void {
    }

    /**@internal */
    _setGraphicsCallBack(): void {
    }

    set graphics(value: Graphics) {
        if (this._graphics) this._graphics._sp = null;
        this._graphics = value;
        if (value) {
            this._setGraphics(value);
            this._renderType |= SpriteConst.GRAPHICS;
            value._sp = this;
        } else {
            this._renderType &= ~SpriteConst.GRAPHICS;
        }
        this._setRenderType(this._renderType);
        this.repaint();
    }

    /**
     * <p>显示对象的滚动矩形范围，具有裁剪效果(如果只想限制子对象渲染区域，请使用viewport)</p>
     * <p> srollRect和viewport的区别：<br/>
     * 1.srollRect自带裁剪效果，viewport只影响子对象渲染是否渲染，不具有裁剪效果（性能更高）。<br/>
     * 2.设置rect的x,y属性均能实现区域滚动效果，但scrollRect会保持0,0点位置不变。</p>
     */
    get scrollRect(): Rectangle {
        return this._style.scrollRect;
    }

    /**@internal */
    _setScrollRect(value: Rectangle): void {

    }

    set scrollRect(value: Rectangle) {
        this.getStyle().scrollRect = value;
        this._setScrollRect(value);
        //viewport = value;
        this.repaint();
        if (value) {
            this._renderType |= SpriteConst.CLIP;
        } else {
            this._renderType &= ~SpriteConst.CLIP;
        }
        this._setRenderType(this._renderType);
    }

    /**
     * <p>设置坐标位置。相当于分别设置x和y属性。</p>
     * <p>因为返回值为Sprite对象本身，所以可以使用如下语法：spr.pos(...).scale(...);</p>
     * @param	x			X轴坐标。
     * @param	y			Y轴坐标。
     * @param 	speedMode	（可选）是否极速模式，正常是调用this.x=value进行赋值，极速模式直接调用内部函数处理，如果未重写x,y属性，建议设置为急速模式性能更高。
     * @return	返回对象本身。
     */
    pos(x: number, y: number, speedMode: boolean = false): Sprite {
        if (this._x !== x || this._y !== y) {
            if (this.destroyed) return this;
            if (speedMode) {
                this._setX(x);
                this._setY(y);
                this.parentRepaint(SpriteConst.REPAINT_CACHE);
                var p: Sprite = this._cacheStyle.maskParent;
                if (p) {
                    p.repaint(SpriteConst.REPAINT_CACHE);
                }
            } else {
                this.x = x;
                this.y = y;
            }
        }
        return this;
    }

    /**
     * <p>设置轴心点。相当于分别设置pivotX和pivotY属性。</p>
     * <p>因为返回值为Sprite对象本身，所以可以使用如下语法：spr.pivot(...).pos(50, 100);</p>
     * @param	x X轴心点。
     * @param	y Y轴心点。
     * @return	返回对象本身。
     */
    pivot(x: number, y: number): Sprite {
        this.pivotX = x;
        this.pivotY = y;
        return this;
    }

    /**
     * <p>设置宽高。相当于分别设置width和height属性。</p>
     * <p>因为返回值为Sprite对象本身，所以可以使用如下语法：spr.size(...).pos(50, 100);</p>
     * @param	width 宽度值。
     * @param	hegiht 高度值。
     * @return	返回对象本身。
     */
    size(width: number, height: number): Sprite {
        this.width = width;
        this.height = height;
        return this;
    }

    /**
     * <p>设置缩放。相当于分别设置scaleX和scaleY属性。</p>
     * <p>因为返回值为Sprite对象本身，所以可以使用如下语法：spr.scale(...).pos(50, 100);</p>
     * @param	scaleX		X轴缩放比例。
     * @param	scaleY		Y轴缩放比例。
     * @param 	speedMode	（可选）是否极速模式，正常是调用this.scaleX=value进行赋值，极速模式直接调用内部函数处理，如果未重写scaleX,scaleY属性，建议设置为急速模式性能更高。
     * @return	返回对象本身。
     */
    scale(scaleX: number, scaleY: number, speedMode: boolean = false): Sprite {
        var style: SpriteStyle = this.getStyle();
        if (style.scaleX != scaleX || style.scaleY != scaleY) {
            if (this.destroyed) return this;
            if (speedMode) {
                this._setScaleX(scaleX);
                this._setScaleY(scaleY);
                this._setTranformChange();
            } else {
                this.scaleX = scaleX;
                this.scaleY = scaleY;
            }
        }
        return this;
    }

    /**
     * <p>设置倾斜角度。相当于分别设置skewX和skewY属性。</p>
     * <p>因为返回值为Sprite对象本身，所以可以使用如下语法：spr.skew(...).pos(50, 100);</p>
     * @param	skewX 水平倾斜角度。
     * @param	skewY 垂直倾斜角度。
     * @return	返回对象本身
     */
    skew(skewX: number, skewY: number): Sprite {
        this.skewX = skewX;
        this.skewY = skewY;
        return this;
    }

    /**
     * 更新、呈现显示对象。由系统调用。
     * @param	context 渲染的上下文引用。
     * @param	x X轴坐标。
     * @param	y Y轴坐标。
     */
    render(ctx: Context, x: number, y: number): void {
        RenderSprite.renders[this._renderType]._fun(this, ctx, x + this._x, y + this._y);
        /*
        var rt:int = _renderType;
        var style:SpriteStyle = _style;
        var oldAlpha:Number = ctx.globalAlpha;
        var save:Boolean = false;
        if (rt & SpriteConst.TRANSFORM ) {
            ctx.save();
            save = true;
            ctx.transform(transform.a, transform.b, transform.c, transform.d, transform.tx + x+_x, transform.ty + y+_y);
        }
    	
        if ( rt & SpriteConst.ALPHA) {
            var alpha:Number = style.alpha;
            if (alpha > 0.01 || _needRepaint()) {
                //var temp:Number = context.globalAlpha;
                ctx.globalAlpha *= alpha;
                //context.globalAlpha = temp;
            }				
        }
    	
        if ( rt & SpriteConst.TEXTURE ) {
            var tex:Texture = texture;
            ctx.drawTexture(tex, x-pivotX+_x, y-pivotY+_y, tex.width, tex.height);
        }
    	
        if ( rt & SpriteConst.GRAPHICS) {
            _graphics && _graphics._render(this, ctx, x-pivotX+_x, y-pivotY+_y);
        }
    	
        if (_children.length) {
            _children.forEach(function(c:Sprite) {
                c._visible && c.render(ctx, x - pivotX+_x, y - pivotY+_y);
            } );
        }
        ctx.globalAlpha = oldAlpha;//TODO 可能慢
        if (save) {
            ctx.restore();
        }
        */
        this._repaint = 0;
    }

    /**
     * <p>绘制 当前<code>Sprite</code> 到 <code>Canvas</code> 上，并返回一个HtmlCanvas。</p>
     * <p>绘制的结果可以当作图片源，再次绘制到其他Sprite里面，示例：</p>
     *
     * var htmlCanvas:HTMLCanvas = sprite.drawToCanvas(100, 100, 0, 0);//把精灵绘制到canvas上面
     * var sp:Sprite = new Sprite();//创建精灵
     * sp.graphics.drawTexture(htmlCanvas.getTexture());//把截图绘制到精灵上
     * Laya.stage.addChild(sp);//把精灵显示到舞台
     *
     * <p>也可以获取原始图片数据，分享到网上，从而实现截图效果，示例：</p>
     *
     * var htmlCanvas:HTMLCanvas = sprite.drawToCanvas(100, 100, 0, 0);//把精灵绘制到canvas上面
     * htmlCanvas.toBase64("image/png",0.9);//打印图片base64信息，可以发给服务器或者保存为图片
     *
     * @param	canvasWidth 画布宽度。
     * @param	canvasHeight 画布高度。
     * @param	x 绘制的 X 轴偏移量。
     * @param	y 绘制的 Y 轴偏移量。
     * @return  HTMLCanvas 对象。
     */
    drawToCanvas(canvasWidth: number, canvasHeight: number, offsetX: number, offsetY: number): HTMLCanvas {
        //console.log('drawToCanvas is deprecated, please use drawToTexture');
        return Sprite.drawToCanvas(this, this._renderType, canvasWidth, canvasHeight, offsetX, offsetY);
    }

    /**
     * 绘制到一个Texture对象
     * @param canvasWidth 
     * @param canvasHeight 
     * @param offsetX 
     * @param offsetY 
     */
    drawToTexture(canvasWidth: number, canvasHeight: number, offsetX: number, offsetY: number, rt:RenderTexture2D|null=null): Texture|RenderTexture2D {
        return Sprite.drawToTexture(this, this._renderType, canvasWidth, canvasHeight, offsetX, offsetY,rt);
    }

    /**
     * 把当前对象渲染到指定的贴图上。贴图由外部指定，避免每次都创建。
     * @param offx 
     * @param offy 
     * @param tex 输出渲染结果
     */
    drawToTexture3D(offx: number, offy: number, tex: Texture2D) {
        throw 'not implement'
    }


    /**
     * @private
     * 绘制到画布。
     */
    static drawToCanvas(sprite: Sprite, _renderType: number, canvasWidth: number, canvasHeight: number, offsetX: number, offsetY: number): HTMLCanvas {
        offsetX -= sprite.x;
        offsetY -= sprite.y;
        offsetX |= 0;
        offsetY |= 0;
        canvasWidth |= 0;
        canvasHeight |= 0;
        var ctx: Context = new Context();
        ctx.size(canvasWidth, canvasHeight);
        ctx.asBitmap = true;
        ctx._targets.start();
        ctx._targets.clear(0, 0, 0, 0);
        RenderSprite.renders[_renderType]._fun(sprite, ctx, offsetX, offsetY);
        ctx.flush();
        ctx._targets.end();
        ctx._targets.restore();
        var dt: Uint8Array = ctx._targets.getData(0, 0, canvasWidth, canvasHeight);
        ctx.destroy();
        var imgdata: any = new ImageData(canvasWidth, canvasHeight);;	//创建空的imagedata。因为下面要翻转，所以不直接设置内容
        //翻转getData的结果。
        var lineLen: number = canvasWidth * 4;
        var temp: Uint8Array = new Uint8Array(lineLen);
        var dst: Uint8Array = imgdata.data;
        var y: number = canvasHeight - 1;
        var off: number = y * lineLen;
        var srcoff: number = 0;
        for (; y >= 0; y--) {
            dst.set(dt.subarray(srcoff, srcoff + lineLen), off);
            off -= lineLen;
            srcoff += lineLen;
        }
        //imgdata.data.set(dt);
        //画到2d画布上
        var canv: HTMLCanvas = new HTMLCanvas(true);
        canv.size(canvasWidth, canvasHeight);
        var ctx2d: CanvasRenderingContext2D = <CanvasRenderingContext2D>(canv.getContext('2d') as any);
        ctx2d.putImageData(imgdata, 0, 0);;
        return canv;
    }

	static drawtocanvCtx:Context;
    /**
     * @private 
     * 
     */
    static drawToTexture(sprite: Sprite, _renderType: number, canvasWidth: number, canvasHeight: number, offsetX: number, offsetY: number, rt:RenderTexture2D|null=null): Texture|RenderTexture2D {
		if(!Sprite.drawtocanvCtx){
			Sprite.drawtocanvCtx = new Context();
		}
        offsetX -= sprite.x;
        offsetY -= sprite.y;
        offsetX |= 0;
        offsetY |= 0;
        canvasWidth |= 0;
        canvasHeight |= 0;
		var ctx = rt?Sprite.drawtocanvCtx:new Context();
		ctx.clear();
		ctx.size(canvasWidth, canvasHeight);
		if(rt){
			ctx._targets=rt;
		}else{
			ctx.asBitmap=true;
		}
		if(ctx._targets){
			ctx._targets.start();
			ctx._targets.clear(0, 0, 0, 0);	// 否则没有地方调用clear
			RenderSprite.renders[_renderType]._fun(sprite, ctx, offsetX, offsetY);
			ctx.flush();
			ctx._targets.end();
			ctx._targets.restore();
		}
		if(!rt){
        	var rtex: Texture = new Texture(((<Texture2D>(ctx._targets as any))), Texture.INV_UV);
        	ctx.destroy(true);// 保留 _targets
			return rtex;
		}
		sprite._repaint=0;
		return rt;
    }

    /**
     * <p>自定义更新、呈现显示对象。一般用来扩展渲染模式，请合理使用，可能会导致在加速器上无法渲染。</p>
     * <p><b>注意</b>不要在此函数内增加或删除树节点，否则会对树节点遍历造成影响。</p>
     * @param	context  渲染的上下文引用。
     * @param	x X轴坐标。
     * @param	y Y轴坐标。
     */
    customRender(context: Context, x: number, y: number): void {
        //_renderType |= SpriteConst.CUSTOM;
        //_setRenderType(_renderType);
        this._repaint = SpriteConst.REPAINT_ALL;
    }

    /**
     * @internal
     * 应用滤镜。
     */
    _applyFilters(): void {
        // canvas 模式不支持
    }

    /**滤镜集合。可以设置多个滤镜组合。*/
    get filters(): any[] {
        return this._cacheStyle.filters;
    }

    /**@internal */
    _setColorFilter(value: any): void { }

    set filters(value: any[]) {
        value && value.length === 0 && (value = null);
        if (this._cacheStyle.filters == value) return;
        this._getCacheStyle().filters = value ? value.slice() : null;
        if (value && value.length) {
            //temp TODO 
            this._setColorFilter(value[0]);
            this._renderType |= SpriteConst.FILTERS;
        } else {
            this._setColorFilter(null);
            this._renderType &= ~SpriteConst.FILTERS;
        }
        this._setRenderType(this._renderType);

        if (value && value.length > 0) {
            if (!this._getBit(Const.DISPLAY)) this._setBitUp(Const.DISPLAY);
            if (!(value.length == 1 && (value[0] instanceof ColorFilter))) {
                this._getCacheStyle().cacheForFilters = true;
                this._checkCanvasEnable();
            }
        } else {
            if (this._cacheStyle.cacheForFilters) {
                this._cacheStyle.cacheForFilters = false;
                this._checkCanvasEnable();
            }
        }
        this._getCacheStyle().hasGlowFilter = this._isHaveGlowFilter();
        this.repaint();
    }

    /**
     * @internal
     * 查看当前原件中是否包含发光滤镜。
     * @return 一个 Boolean 值，表示当前原件中是否包含发光滤镜。
     */
    _isHaveGlowFilter(): boolean {
        var i: number, len: number;
        if (this.filters) {
            for (i = 0; i < this.filters.length; i++) {
                if (this.filters[i].type == Filter.GLOW) {
                    return true;
                }
            }
        }
        for (i = 0, len = this._children.length; i < len; i++) {
            if (this._children[i]._isHaveGlowFilter()) {
                return true;
            }
        }
        return false;
    }

    /**
     * 把本地坐标转换为相对stage的全局坐标。
     * @param point				本地坐标点。
     * @param createNewPoint	（可选）是否创建一个新的Point对象作为返回值，默认为false，使用输入的point对象返回，减少对象创建开销。
     * @param globalNode		global节点，默认为Laya.stage
     * @return 转换后的坐标的点。
     */
    localToGlobal(point: Point, createNewPoint: boolean = false, globalNode: Sprite|null = null): Point {
        //if (!_displayedInStage || !point) return point;
        if (createNewPoint === true) {
            point = new Point(point.x, point.y);
        }
        var ele: Sprite = this;
        globalNode = globalNode || ILaya.stage;
        while (ele && !ele.destroyed) {
            if (ele == globalNode) break;
            point = ele.toParentPoint(point);
            ele = (<Sprite>ele.parent);
        }

        return point;
    }

    /**
     * 把stage的全局坐标转换为本地坐标。
     * @param point				全局坐标点。
     * @param createNewPoint	（可选）是否创建一个新的Point对象作为返回值，默认为false，使用输入的point对象返回，减少对象创建开销。
     * @param globalNode		global节点，默认为Laya.stage
     * @return 转换后的坐标的点。
     */
    globalToLocal(point: Point, createNewPoint: boolean = false, globalNode: Sprite|null = null): Point {
        //if (!_displayedInStage || !point) return point;
        if (createNewPoint) {
            point = new Point(point.x, point.y);
        }
        var ele: Sprite = this;
        var list: any[] = [];
        globalNode = globalNode || ILaya.stage;
        while (ele && !ele.destroyed) {
            if (ele == globalNode) break;
            list.push(ele);
            ele = (<Sprite>ele.parent);
        }
        var i: number = list.length - 1;
        while (i >= 0) {
            ele = list[i];
            point = ele.fromParentPoint(point);
            i--;
        }
        return point;
    }

    /**
     * 将本地坐标系坐标转转换到父容器坐标系。
     * @param point 本地坐标点。
     * @return  转换后的点。
     */
    toParentPoint(point: Point): Point {
        if (!point) return point;
        point.x -= this.pivotX;
        point.y -= this.pivotY;
        if (this.transform) {
            this._transform.transformPoint(point);
        }
        point.x += this._x;
        point.y += this._y;
        var scroll: Rectangle = this._style.scrollRect;
        if (scroll) {
            point.x -= scroll.x;
            point.y -= scroll.y;
        }
        return point;
    }

    /**
     * 将父容器坐标系坐标转换到本地坐标系。
     * @param point 父容器坐标点。
     * @return  转换后的点。
     */
    fromParentPoint(point: Point): Point {
        if (!point) return point;
        point.x -= this._x;
        point.y -= this._y;
        var scroll: Rectangle = this._style.scrollRect;
        if (scroll) {
            point.x += scroll.x;
            point.y += scroll.y;
        }
        if (this.transform) {
            //_transform.setTranslate(0,0);
            this._transform.invertTransformPoint(point);
        }
        point.x += this.pivotX;
        point.y += this.pivotY;
        return point;
    }

    /**
     * 将Stage坐标系坐标转换到本地坐标系。
     * @param point 父容器坐标点。
     * @return  转换后的点。
     */
    fromStagePoint(point: Point): Point {
        // TODO 没做
        return point;
    }

    /**
     * <p>增加事件侦听器，以使侦听器能够接收事件通知。</p>
     * <p>如果侦听鼠标事件，则会自动设置自己和父亲节点的属性 mouseEnabled 的值为 true(如果父节点mouseEnabled=false，则停止设置父节点mouseEnabled属性)。</p>
     * @param type		事件的类型。
     * @param caller	事件侦听函数的执行域。
     * @param listener	事件侦听函数。
     * @param args		（可选）事件侦听函数的回调参数。
     * @return 此 EventDispatcher 对象。
     * @override
     */
    on(type: string, caller: any, listener: Function, args: any[] = null): EventDispatcher {
        //如果是鼠标事件，则设置自己和父对象为可接受鼠标交互事件
        if (this._mouseState !== 1 && this.isMouseEvent(type)) {
            this.mouseEnabled = true;
            this._setBit(Const.HAS_MOUSE, true);
            if (this._parent) {
                this._onDisplay();
            }
            return this._createListener(type, caller, listener, args, false);
        }
        return super.on(type, caller, listener, args);
    }

    /**
     * <p>增加事件侦听器，以使侦听器能够接收事件通知，此侦听事件响应一次后则自动移除侦听。</p>
     * <p>如果侦听鼠标事件，则会自动设置自己和父亲节点的属性 mouseEnabled 的值为 true(如果父节点mouseEnabled=false，则停止设置父节点mouseEnabled属性)。</p>
     * @param type		事件的类型。
     * @param caller	事件侦听函数的执行域。
     * @param listener	事件侦听函数。
     * @param args		（可选）事件侦听函数的回调参数。
     * @return 此 EventDispatcher 对象。
     * @override
     */
    once(type: string, caller: any, listener: Function, args: any[] = null): EventDispatcher {
        //如果是鼠标事件，则设置自己和父对象为可接受鼠标交互事件
        if (this._mouseState !== 1 && this.isMouseEvent(type)) {
            this.mouseEnabled = true;
            this._setBit(Const.HAS_MOUSE, true);
            if (this._parent) {
                this._onDisplay();
            }
            return this._createListener(type, caller, listener, args, true);
        }
        return super.once(type, caller, listener, args);
    }

    /** @private */
    protected _onDisplay(v?: boolean): void {
        if (this._mouseState !== 1) {
            var ele: Sprite = this;
            ele = (<Sprite>ele.parent);
            while (ele && ele._mouseState !== 1) {
                if (ele._getBit(Const.HAS_MOUSE)) break;
                ele.mouseEnabled = true;
                ele._setBit(Const.HAS_MOUSE, true);
                ele = (<Sprite>ele.parent);
            }
        }
    }

    /**@private 
     * @override
    */
    protected _setParent(value: Node): void {
        super._setParent(value);
        if (value && this._getBit(Const.HAS_MOUSE)) {
            this._onDisplay();
        }
    }

    /**
     * <p>加载并显示一个图片。相当于加载图片后，设置texture属性</p>
     * <p>注意：2.0改动：多次调用，只会显示一个图片（1.0会显示多个图片）,x,y,width,height参数取消。</p>
     * @param url		图片地址。
     * @param complete	（可选）加载完成回调。
     * @return	返回精灵对象本身。
     */
    loadImage(url: string, complete: Handler = null): Sprite {
        if (!url) {
            this.texture = null;
            loaded.call(this);
        } else {
            var tex: Texture = ILaya.Loader.textureMap[URL.formatURL(url)];
            if (!tex) {
                tex = new Texture();
                tex.load(url);
                ILaya.Loader.cacheTexture(url, tex);
            }
            this.texture = tex;
            if (!tex.getIsReady()) tex.once(Event.READY, this, loaded);
            else loaded.call(this);
        }

        function loaded(this:Sprite): void {
            this.repaint(SpriteConst.REPAINT_ALL);
            complete && complete.run();
        }

        return this;
    }

    /**
     * 根据图片地址创建一个新的 <code>Sprite</code> 对象用于加载并显示此图片。
     * @param	url 图片地址。
     * @return	返回新的 <code>Sprite</code> 对象。
     */
    static fromImage(url: string): Sprite {
        return new Sprite().loadImage(url);
    }

    /**cacheAs后，设置自己和父对象缓存失效。*/
    repaint(type: number = SpriteConst.REPAINT_CACHE): void {
        if (!(this._repaint & type)) {
            this._repaint |= type;
            this.parentRepaint(type);
        }
        if (this._cacheStyle && this._cacheStyle.maskParent) {
            this._cacheStyle.maskParent.repaint(type);
        }
    }


    /**
     * @internal
     * 获取是否重新缓存。
     * @return 如果重新缓存值为 true，否则值为 false。
     */
    _needRepaint(): boolean {
        return (this._repaint & SpriteConst.REPAINT_CACHE) && this._cacheStyle.enableCanvasRender && this._cacheStyle.reCache;
    }

    /**@private	
     * @override
    */
    protected _childChanged(child: Node = null): void {
        if (this._children.length) this._renderType |= SpriteConst.CHILDS;
        else this._renderType &= ~SpriteConst.CHILDS;
        this._setRenderType(this._renderType);
        if (child && this._getBit(Const.HAS_ZORDER)) ILaya.systemTimer.callLater(this, this.updateZOrder);
        this.repaint(SpriteConst.REPAINT_ALL);
    }

    /**cacheAs时，设置所有父对象缓存失效。 */
    parentRepaint(type: number = SpriteConst.REPAINT_CACHE): void {
        var p: Sprite = (<Sprite>this._parent);
        if (p && !(p._repaint & type)) {
            p._repaint |= type;
            p.parentRepaint(type);
        }
    }

    /**对舞台 <code>stage</code> 的引用。*/
    get stage(): Stage {
        return ILaya.stage;
    }

    /**
     * <p>可以设置一个Rectangle区域作为点击区域，或者设置一个<code>HitArea</code>实例作为点击区域，HitArea内可以设置可点击和不可点击区域。</p>
     * <p>如果不设置hitArea，则根据宽高形成的区域进行碰撞。</p>
     */
    get hitArea(): any {
        return this._style.hitArea;
    }

    set hitArea(value: any) {
        this.getStyle().hitArea = value;
    }

    /**@internal */
    _setMask(value: Sprite): void {

    }

    /**
     * <p>遮罩，可以设置一个对象(支持位图和矢量图)，根据对象形状进行遮罩显示。</p>
     * <p>【注意】遮罩对象坐标系是相对遮罩对象本身的，和Flash机制不同</p>
     */
    get mask(): Sprite {
        return this._cacheStyle.mask;
    }

    set mask(value: Sprite) {
        if (value && this.mask && this.mask._cacheStyle.maskParent) return;
        this._getCacheStyle().mask = value;
        this._setMask(value);
        this._checkCanvasEnable();
        if (value) {
            value._getCacheStyle().maskParent = this;
        } else {
            if (this.mask) {
                this.mask._getCacheStyle().maskParent = null;
            }
        }
        this._renderType |= SpriteConst.MASK;
        this._setRenderType(this._renderType);
        this.parentRepaint(SpriteConst.REPAINT_ALL);
    }

    /**
     * 是否接受鼠标事件。
     * 默认为false，如果监听鼠标事件，则会自动设置本对象及父节点的属性 mouseEnable 的值都为 true（如果父节点手动设置为false，则不会更改）。
     * */
    get mouseEnabled(): boolean {
        return this._mouseState > 1;
    }

    set mouseEnabled(value: boolean) {
        this._mouseState = value ? 2 : 1;
    }

    /**
     * 开始拖动此对象。
     * @param area				（可选）拖动区域，此区域为当前对象注册点活动区域（不包括对象宽高），可选。
     * @param hasInertia		（可选）鼠标松开后，是否还惯性滑动，默认为false，可选。
     * @param elasticDistance	（可选）橡皮筋效果的距离值，0为无橡皮筋效果，默认为0，可选。
     * @param elasticBackTime	（可选）橡皮筋回弹时间，单位为毫秒，默认为300毫秒，可选。
     * @param data				（可选）拖动事件携带的数据，可选。
     * @param disableMouseEvent	（可选）禁用其他对象的鼠标检测，默认为false，设置为true能提高性能。
     * @param ratio				（可选）惯性阻尼系数，影响惯性力度和时长。
     */
    startDrag(area: Rectangle = null, hasInertia: boolean = false, elasticDistance: number = 0, elasticBackTime: number = 300, data: any = null, disableMouseEvent: boolean = false, ratio: number = 0.92): void {
        this._style.dragging || (this.getStyle().dragging = new ILaya.Dragging());
        this._style.dragging.start(this, area, hasInertia, elasticDistance, elasticBackTime, data, disableMouseEvent, ratio);
    }

    /**停止拖动此对象。*/
    stopDrag(): void {
        this._style.dragging && this._style.dragging.stop();
    }

    /**
     * @internal 
     * @override
    */
    _setDisplay(value: boolean): void {
        if (!value) {
            if (this._cacheStyle) {
                this._cacheStyle.releaseContext();
                this._cacheStyle.releaseFilterCache();
                if (this._cacheStyle.hasGlowFilter) {
                    this._cacheStyle.hasGlowFilter = false;
                }
            }
        }
        super._setDisplay(value);
    }

    /**
     * 检测某个点是否在此对象内。
     * @param	x 全局x坐标。
     * @param	y 全局y坐标。
     * @return  表示是否在对象内。
     */
    hitTestPoint(x: number, y: number): boolean {
        var point: Point = this.globalToLocal(Point.TEMP.setTo(x, y));
        x = point.x;
        y = point.y;
        var rect: Rectangle = this._style.hitArea ? this._style.hitArea : (this._width > 0 && this._height > 0) ? Rectangle.TEMP.setTo(0, 0, this._width, this._height) : this.getSelfBounds();
        return rect.contains(x, y);
    }

    /**获得相对于本对象上的鼠标坐标信息。*/
    getMousePoint(): Point {
        return this.globalToLocal(Point.TEMP.setTo(ILaya.stage.mouseX, ILaya.stage.mouseY));
    }

    /**
     * 获得相对于stage的全局X轴缩放值（会叠加父亲节点的缩放值）。
     */
    get globalScaleX(): number {
        var scale: number = 1;
        var ele: Sprite = this;
        while (ele) {
            if (ele === ILaya.stage) break;
            scale *= ele.scaleX;
            ele = (<Sprite>ele.parent);
        }
        return scale;
    }

    /**
     * 获得相对于stage的全局旋转值（会叠加父亲节点的旋转值）。
     */
    get globalRotation(): number {
        var angle: number = 0;
        var ele: Sprite = this;
        while (ele) {
            if (ele === ILaya.stage) break;
            angle += ele.rotation;
            ele = (<Sprite>ele.parent);
        }
        return angle;
    }

    /**
     * 获得相对于stage的全局Y轴缩放值（会叠加父亲节点的缩放值）。
     */
    get globalScaleY(): number {
        var scale: number = 1;
        var ele: Sprite = this;
        while (ele) {
            if (ele === ILaya.stage) break;
            scale *= ele.scaleY;
            ele = (<Sprite>ele.parent);
        }
        return scale;
    }

    /**
     * 返回鼠标在此对象坐标系上的 X 轴坐标信息。
     */
    get mouseX(): number {
        return this.getMousePoint().x;
    }

    /**
     * 返回鼠标在此对象坐标系上的 Y 轴坐标信息。
     */
    get mouseY(): number {
        return this.getMousePoint().y;
    }

    /**z排序，更改此值，则会按照值的大小对同一容器的所有对象重新排序。值越大，越靠上。默认为0，则根据添加顺序排序。*/
    get zOrder(): number {
        return this._zOrder;
    }

    set zOrder(value: number) {
        if (this._zOrder != value) {
            this._zOrder = value;
            if (this._parent) {
                value && this._parent._setBit(Const.HAS_ZORDER, true);
                ILaya.systemTimer.callLater(this._parent, this.updateZOrder);
            }
        }
    }

    /**
     * 设置一个Texture实例，并显示此图片（如果之前有其他绘制，则会被清除掉）。
     * 等同于graphics.clear();graphics.drawImage()，但性能更高
     * 还可以赋值一个图片地址，则会自动加载图片，然后显示
     */
    get texture(): Texture {
        return this._texture;
    }

    /**@internal */
    _setTexture(value: Texture | string): void {

    }

    set texture(value: Texture) {
        if (typeof (value) == 'string') {
            this.loadImage((<string>((<any>value))));
        } else if (this._texture != value) {
            this._texture && this._texture._removeReference();
            this._texture = value;
            value && value._addReference();
            this._setTexture(value);
            this._setWidth(this._texture, this.width);
            this._setHeight(this._texture, this.height);
            if (value) this._renderType |= SpriteConst.TEXTURE;
            else this._renderType &= ~SpriteConst.TEXTURE;
            this._setRenderType(this._renderType);
            this.repaint();
        }
    }

    /**
     * <p>视口大小，视口外的子对象，将不被渲染(如果想实现裁剪效果，请使用srollRect)，合理使用能提高渲染性能。比如由一个个小图片拼成的地图块，viewport外面的小图片将不渲染</p>
     * <p>srollRect和viewport的区别：<br/>
     * 1. srollRect自带裁剪效果，viewport只影响子对象渲染是否渲染，不具有裁剪效果（性能更高）。<br/>
     * 2. 设置rect的x,y属性均能实现区域滚动效果，但scrollRect会保持0,0点位置不变。</p>
     * @default null
     */
    get viewport(): Rectangle {
        return this._style.viewport;
    }

    set viewport(value: Rectangle) {
        if (typeof (value) == 'string') {
            var recArr: any[];
            recArr = ((<string>((<any>value)))).split(",");
            if (recArr.length > 3) {
                value = new Rectangle(parseFloat(recArr[0]), parseFloat(recArr[1]), parseFloat(recArr[2]), parseFloat(recArr[3]));
            }
        }
        this.getStyle().viewport = value;
    }

    /**@internal */
    _setRenderType(type: number): void {

    }

    /**@internal */
    _setTranformChange(): void {
        this._tfChanged = true;
        this._renderType |= SpriteConst.TRANSFORM;
        this.parentRepaint(SpriteConst.REPAINT_CACHE);
    }

    /**@internal */
    _setBgStyleColor(x: number, y: number, width: number, height: number, fillColor: any): void {

    }

    /**@internal */
    _setBorderStyleColor(x: number, y: number, width: number, height: number, fillColor: any, borderWidth: number): void {

    }

    /**@private */
    captureMouseEvent(exclusive: boolean): void {
        ILaya.MouseManager.instance.setCapture(this, exclusive);
    }

    /**@private */
    releaseMouseEvent(): void {
        ILaya.MouseManager.instance.releaseCapture();
    }

    set drawCallOptimize(value: boolean) {
        this._setBit(Const.DRAWCALL_OPTIMIZE, value);
    }

    get drawCallOptimize(): boolean {
        return this._getBit(Const.DRAWCALL_OPTIMIZE);
    }
}


ClassUtils.regClass("laya.display.Sprite", Sprite);
ClassUtils.regClass("Laya.Sprite", Sprite);