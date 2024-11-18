import { ILaya } from "../../ILaya";
import { NodeFlags } from "../Const";
import { Filter } from "../filters/Filter";
import { GrahamScan } from "../maths/GrahamScan";
import { Matrix } from "../maths/Matrix";
import { Point } from "../maths/Point";
import { Rectangle } from "../maths/Rectangle";
import { RenderSprite } from "../renders/RenderSprite";
import { Context } from "../renders/Context";
import { HTMLCanvas } from "../resource/HTMLCanvas";
import { Texture } from "../resource/Texture";
import { Handler } from "../utils/Handler";
import { Utils } from "../utils/Utils";
import { BoundsStyle } from "./css/BoundsStyle";
import { CacheStyle } from "./css/CacheStyle";
import { SpriteStyle } from "./css/SpriteStyle";
import { Graphics } from "./Graphics";
import { Node } from "./Node";
import { SpriteConst } from "./SpriteConst";
import { RenderTexture2D } from "../resource/RenderTexture2D";
import { Event } from "../events/Event";
import { Dragging } from "../utils/Dragging";
import { URL } from "../net/URL";
import { Scene } from "./Scene";
import { LayaEnv } from "../../LayaEnv";
import { SpriteUtils } from "../utils/SpriteUtils";
import { IHitArea } from "../utils/IHitArea";
import type { Material } from "../resource/Material";
import { RenderTargetFormat } from "../RenderEngine/RenderEnum/RenderTargetFormat";
import { BaseRenderNode2D } from "../NodeRender2D/BaseRenderNode2D";
import { Vector2 } from "../maths/Vector2";
import type { Stage } from "./Stage";

/**
 * @en Sprite is a basic display list node for displaying graphical content. By default, Sprite does not accept mouse events. Through the graphics API, images or vector graphics can be drawn, supporting operations like rotation, scaling, translation, and more. Sprite also functions as a container class, allowing the addition of multiple child nodes.
 * @zh Sprite是基本的显示图形的显示列表节点。Sprite默认不接受鼠标事件。通过graphics可以绘制图片或者矢量图，支持旋转，缩放，位移等操作。Sprite同时也是容器类，可用来添加多个子节点。
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
    /**
     * @internal
     * @en X anchor point, value ranges from 0 to 1. Setting anchorX ultimately changes the node's pivot point through the pivotX value.
     * @zh X锚点，值为0-1，设置anchorX值最终通过pivotX值来改变节点轴心点。
     */
    _anchorX: number = 0;
    /**
     * @internal
     * @en Y anchor point, value ranges from 0 to 1. Setting anchorY ultimately changes the node's pivot point through the pivotY value.
     * @zh Y锚点，值为0-1，设置anchorY值最终通过pivotY值来改变节点轴心点。
     */
    _anchorY: number = 0;
    /**@internal */
    _visible: boolean = true;
    /**
     * @internal
     * @en Mouse state, 0: auto, 1: mouseEnabled=false, 2: mouseEnabled=true.
     * @zh 鼠标状态，0:auto，1:mouseEnabled=false，2:mouseEnabled=true。
     */
    _mouseState: number = 0;
    /**
     * @internal
     * @en Z-order for sorting, higher values are displayed in front.
     * @zh z排序，数值越大越靠前。
     */
    _zOrder: number = 0;
    /**@internal */
    _renderType: number = 0;
    /**@internal */
    _transform: Matrix | null = null;
    /**@internal */
    protected _tfChanged: boolean = false;
    /**@internal */
    protected _repaint: number = SpriteConst.REPAINT_NONE;
    private _texture: Texture | null = null;
    private _sizeFlag: number = 0;

    //以下变量为系统调用，请不要直接使用
    /**@internal */
    _style: SpriteStyle = SpriteStyle.EMPTY;
    /**@internal */
    _cacheStyle: CacheStyle = CacheStyle.EMPTY;
    private _filterArr: Filter[] = null;
    /**@internal */
    _boundStyle: BoundsStyle | null = null;
    /**@internal */
    _graphics: Graphics | null = null;
    /**@internal */
    _renderNode: BaseRenderNode2D = null;
    /**
     * @internal
     */
    _ownGraphics: boolean = false;

    /**
     @en For non-UI component display object nodes (container objects or display objects without image resources), specifies whether the mouse events penetrate this object's collision detection. `true` means the object is penetrable, `false` means it is not penetrable.
    * When penetrable, the engine will no longer detect this object and will recursively check its child objects until it finds the target object or misses all objects.
    * When not penetrable, the node's width and height define the mouse collision area (a non-penetrable rectangular area). If the rectangular collision area does not meet the requirements, you can use the drawing area of the hit area as the collision area. The hit area takes precedence over width and height of node as the non-penetrable mouse collision area.
    * Note that for UI object nodes with a set skin property, once a skin texture resource is set, this property becomes ineffective, and the rectangular area drawn by the texture will always be non-penetrable unless it does not accept mouse events or a non-clickable area is set.
    *@zh 用于非UI组件显示对象节点（容器对象或没有设置图像资源的显示对象），鼠标事件与此对象在碰撞检测时，是否穿透。ture为可穿透，false为不可穿透。
     * 可穿透时，引擎不再检测本对象，而会递归检测子对象，直到找到命中的目标对象或者未命中任何对象。
     * 不可穿透时，以节点宽高为鼠标碰撞区（矩形的不可穿透区域）。如果矩形碰撞区不能满足需求，可以将点击区域的绘制图形作为碰撞区，绘制区域优先于宽高作为不可穿透的鼠标碰撞区域。
     * 注意，可以设置skin属性的UI对象节点，当设置了skin纹理资源之后，该属性设置失效，纹理绘制的矩形区域内会始终处于不可穿透状态。除非不接受鼠标事件或设置不可点击区域。
     */
    mouseThrough: boolean = false;
    /**
     * @en Under the premise that this object is non-penetrable (mouseThrough is false), specify whether the mouse event capture detection prioritizes this object.  When set to true, the object itself is prioritized for detection.  When set to false, the child objects are prioritized.
     * When set to prioritize the object itself, the object is detected first.  If the object itself is not hit, the detection is directly interrupted, indicating that no target was hit.  If the object itself is hit, further recursive detection is performed on its child objects until the final mouse hit target is found or all child nodes have been checked.
     * When set to prioritize child objects, the child objects are recursively detected first.  If a child object is hit, the detection is interrupted and the hit target is obtained.  If all child nodes have been checked and no child object is hit, then the detection checks if the object itself is hit.
     * In most cases, prioritizing the detection of child objects is advisable unless the developer does not care about the mouse event detection results of the current node's child nodes.  For example, when child nodes are certainly within the width and height range of the parent node's container, there is no need for recursive detection layer by layer if the mouse click does not occur within the parent node's area.
     * Using this property appropriately can reduce the nodes for mouse event detection and improve performance.
     * @zh 在本对象为不可穿透（mouseThrough为false）的前提下，指定鼠标事件捕获检测是否优先检测本对象。为`true`时优先检测本对象，为`false`时优先检测子对象。
     * 优先检测本对象时，如果本对象没有被检测命中，会中断检测，表示没有命中目标；如果本对象被检测命中，则进一步递归检测其子对象，直到找到鼠标最终的命中目标或所有子节点都检测完毕。
     * 优先检测子对象时，先递归检测其子对象，如果子对象被检测命中，则中断检测，获得命中目标。如果所有子节点都检测完毕，仍未检测命中任何子对象，最后再检测本对象是否被命中；
     * 大多数情况下需要优先检测子对象，除非开发者并不关心当前节点的子节点的鼠标事件检测结果，也就是以当前节点作为其子节点的鼠标事件检测依据。例如，子节点肯定在父节点的容器宽高范围内，当鼠标点击不发生在父节点范围内的区域时，就不必层层递归检测了。
     * 合理使用本属性，能减少鼠标事件检测的节点，提高性能。
     */
    hitTestPrior: boolean = false;
    /**
     * @en Whether to automatically calculate the width and height of the node. The default value is `false`, which does not automatically calculate and offers better performance.
     * If you want to get the width and height based on the drawn content, you can set this property to `true`, or use the getBounds method to obtain them, which has some impact on performance.
     * @zh 是否自动计算节点的宽高数据。默认值为 false，不自动计算，性能更佳。
     * 如果想根据绘制内容获取宽高，可以设置本属性为true，或者通过getBounds方法获取，对性能有一定影响。
     */
    autoSize: boolean = false;
    /** 
    * @internal
    * @en If the node needs to load related skins but placed in different domains, you can set it here.
    * @zh 如果节点需要加载相关的皮肤，但放在不同域，这里可以设置。
    **/
    _skinBaseUrl: string;

    /**
     * @override
     * @inheritDoc
     * @en Destroy the sprite.
     * @param destroyChild Whether to destroy child nodes. Default is true.
     * @zh 销毁精灵。
     * @param destroyChild 是否删除子节点。默认为 true。
     */
    destroy(destroyChild: boolean = true): void {
        super.destroy(destroyChild);
        this._style && this._style.recover();
        this._cacheStyle && this._cacheStyle.recover();
        this._boundStyle && this._boundStyle.recover();
        this._transform && this._transform.recover();
        this._style = null;
        this._cacheStyle = null;
        this._boundStyle = null;
        this._transform = null;
        this._texture && this._texture._removeReference();
        this._texture = null;
        this._graphics && this._ownGraphics && this._graphics.destroy();
        this._graphics = null;
    }

    constructor() {
        super();
    }

    /**
     * @en Get the scene the sprite belongs to.
     * @returns {Scene} The scene object.
     * @zh 获取所属的场景。
     * @returns {Scene} 场景对象。
     */
    get scene(): Scene {
        return <Scene>this._scene;
    }

    /**
     * @en Re-sort by zOrder.
     * @zh 根据 zOrder 进行重新排序。
     */
    updateZOrder(): void {
        SpriteUtils.updateOrder(this._children) && this.repaint();
    }

    /**
    * @internal
    * @en Get the bounds style.
    * @returns The bounds style.
    * @zh 获取边界样式。
    * @returns 边界样式。
    */
    _getBoundsStyle(): BoundsStyle {
        if (!this._boundStyle) this._boundStyle = BoundsStyle.create();
        return this._boundStyle;
    }

    /**
     * @internal
     * @en Set custom render.
     * @zh 设置自定义渲染。
     */
    _setCustomRender(): void {

    }

    /**
     * @en Enable or disable custom rendering. Custom rendering must be enabled to use the customRender function.
     * @param {boolean} b Whether to enable custom rendering.
     * @zh 设置是否开启自定义渲染，只有开启自定义渲染，才能使用 customRender 函数渲染。
     * @param {boolean} b 是否开启自定义渲染。
     */
    set customRenderEnable(b: boolean) {
        if (b) {
            this._renderType |= SpriteConst.CUSTOM;
            this._setCustomRender();
        }
    }


    /**
     * @en Specifies whether the display object is cached as a static image. When cacheAs is set, changes in child objects will automatically update the cache. You can also manually call the reCache method to update the cache.
     * It is recommended to cache "complex content" that does not change frequently as a static image to greatly improve rendering performance. cacheAs has three values: "none", "normal", and "bitmap".
     * The default is "none," which does not perform any caching.
     * When set to "normal," command caching is used.
     * When set to "bitmap," renderTarget caching is used.
     * Disadvantages of the renderTarget caching mode: it creates additional renderTarget objects, increasing memory overhead, has a maximum cache area limit of 2048, and can increase CPU overhead with constant redrawing. Advantages: it significantly reduces draw calls and provides the highest rendering performance.
     * Disadvantages of the command caching mode: it only reduces node traversal and command organization and does not reduce the number of draw calls, resulting in moderate performance. Advantages: it has no additional memory overhead and does not require renderTarget support.
     * @zh 指定显示对象是否缓存为静态图像，cacheAs 时，子对象发生变化，会自动重新缓存，同时也可以手动调用 reCache 方法更新缓存。
     * 建议把不经常变化的“复杂内容”缓存为静态图像，能极大提高渲染性能。cacheAs 有 "none"，"normal" 和 "bitmap" 三个值可选。
     * 默认为 "none"，不做任何缓存。
     * 当值为 "normal" 时，使用命令缓存。
     * 当值为 "bitmap" 时，使用 renderTarget 缓存。
     * renderTarget 缓存模式缺点：会额外创建 renderTarget 对象，增加内存开销，缓存面积有最大 2048 限制，不断重绘时会增加 CPU 开销。优点：大幅减少 drawcall，渲染性能最高。
     * 命令缓存模式缺点：只会减少节点遍历及命令组织，不会减少 drawcall 数，性能中等。优点：没有额外内存开销，无需 renderTarget 支持。
     */
    get cacheAs(): string {
        return this._getCacheStyle().userSetCache;
    }

    set cacheAs(value: string) {
        if (value === this._cacheStyle.userSetCache) return;
        this._getCacheStyle().userSetCache = value;

        if (this.mask && value === 'normal') return;
        if (value == 'bitmap' || value == 'normal') {
            this._renderType |= SpriteConst.CANVAS;
        } else {
            this._renderType &= ~SpriteConst.CANVAS;
        }
        //this._checkCanvasEnable();
        this.repaint();
    }


    /**
     * 设置cacheAs为非空时此值才有效，staticCache=true时，子对象变化时不会自动更新缓存，只能通过调用reCache方法手动刷新。
     * @deprecated
     */
    get staticCache(): boolean {
        return this._getCacheStyle().staticCache;
    }

    /**@deprecated */
    set staticCache(value: boolean) {
        this._getCacheStyle().staticCache = value;
        if (!value) this.reCache();
    }

    /**
     * @en The rendering component node of the sprite.
     * @zh 精灵的渲染组件节点。
     */
    get renderNode2D() {
        return this._renderNode;
    }

    set renderNode2D(value: BaseRenderNode2D) {
        if (value) {
            this._renderType |= SpriteConst.RENDERNODE2D;
            this._renderNode = value;
        } else {
            this._renderType &= ~SpriteConst.RENDERNODE2D;
        }
    }

    /**
     * @deprecated
     * @en Call this method to refresh the cache when cacheAs is set.
     * @zh 在设置 cacheAs 的情况下，调用此方法会重新刷新缓存。
     */
    reCache(): void {
        this._repaint |= SpriteConst.REPAINT_CACHE;
    }

    /**
     * @en Get the repaint type.
     * @returns The repaint type.
     * @zh 获取重绘类型。
     * @returns 重绘类型。
     */
    getRepaint(): number {
        return this._repaint;
    }

    /** 
     * @internal
     * @en Set the x coordinate value.
     * @param value The x coordinate value.
     * @zh 设置 x 坐标值。
     * @param value x 坐标值。
     */
    _setX(value: number): void {
        this._x = value;
        this._notifyTransChangedEvent();
    }

    /** 
     * @internal
     * @en Set the y coordinate value.
     * @param  value The y coordinate value.
     * @zh 设置 y 坐标值。
     * @param  value y 坐标值。
     */
    _setY(value: number): void {
        this._y = value;
        this._notifyTransChangedEvent();
    }

    /**
     * 
     */
    _notifyTransChangedEvent() {
        if (this._transChangeNotify) {
            this.event("2DtransChanged");
            this._children.forEach(element => {
                (element as Sprite)._notifyTransChangedEvent();
            });
        }

    }

    /**
     * @en The x coordinate value relative to the parent container.
     * @zh 显示对象相对于父容器的水平方向坐标值。
     */
    get x(): number {
        return this._x;
    }

    set x(value: number) {
        if (this._destroyed) return;
        if (this._x !== value) {
            this._setX(value);
            if (this.cacheGlobal) {
                this._setGlobalCacheFlag(Sprite.Sprite_GlobalDeltaFlage_Position_X | Sprite.Sprite_GlobalDeltaFlage_Matrix, true)
                this._syncGlobalFlag(Sprite.Sprite_GlobalDeltaFlage_Position_X | Sprite.Sprite_GlobalDeltaFlage_Matrix, true);
            }
            //_setTranformChange();
            this.parentRepaint(SpriteConst.REPAINT_CACHE);
            var p: Sprite = this._getCacheStyle().maskParent;
            if (p) {
                p.repaint(SpriteConst.REPAINT_CACHE);
            }
        }
    }

    /**
     * @en The y coordinate value relative to the parent container.
     * @zh 显示对象相对于父容器的垂直方向坐标值。
     */
    get y(): number {
        return this._y;
    }

    set y(value: number) {
        if (this._destroyed) return;
        if (this._y !== value) {
            this._setY(value);

            if (this.cacheGlobal) {
                this._setGlobalCacheFlag(Sprite.Sprite_GlobalDeltaFlage_Position_Y | Sprite.Sprite_GlobalDeltaFlage_Matrix, true)
                this._syncGlobalFlag(Sprite.Sprite_GlobalDeltaFlage_Position_Y | Sprite.Sprite_GlobalDeltaFlage_Matrix, true);
            }
            //_setTranformChange();
            this.parentRepaint(SpriteConst.REPAINT_CACHE);
            var p: Sprite = this._getCacheStyle().maskParent;
            if (p) {
                p.repaint(SpriteConst.REPAINT_CACHE);
            }
        }
    }

    /**
     * @en The width of the Node, in pixels
     * @zh 节点的宽度，单位为像素。
     */
    get width(): number {
        return this.get_width();
    }

    set width(value: number) {
        this.set_width(value);
    }

    /**
     * @internal
     * @en Set the width of the Node.
     * @param number value  The width value, in pixels.
     * @zh 设置节点的宽度。
     * @param number value  宽度值，以像素为单位。
     */
    set_width(value: number): void {
        let flag = this._sizeFlag;
        if (value == null) {
            value = 0;
            this._sizeFlag &= ~1;
        }
        else if (value == 0)
            this._sizeFlag |= 1;
        else
            this._sizeFlag &= ~1;
        if (this._width !== value || flag != this._sizeFlag) {
            this._width = value;
            this._setWidth(value);
            this._setPivotX(this._anchorX * value);
            if (this._graphics) this._graphics._clearBoundsCache(true);
            this._setTranformChange();
            this._shouldRefreshLayout();
        }
    }

    /**
     * @internal
     * @en Get the width of the Node, in pixels
     * @zh 获取节点的宽度。以像素为单位。
     */
    get_width(): number {
        if (!this.autoSize) return (this._width == 0 && (this._sizeFlag & 1) == 0 && this.texture) ? this.texture.width : this._width;
        if (this.texture) return this.texture.width;
        if (!this._graphics && this._children.length === 0) return 0;
        return this.getSelfBounds().width;
    }

    /**
     * @en The height of the Node, in pixels.
     * @zh 节点的高度，单位为像素。
     */
    get height(): number {
        return this.get_height();
    }

    set height(value: number) {
        this.set_height(value);
    }

    /**
    * @internal
    * @en Set the height of the Node, in pixels
    * @zh 设置节点的高度，单位为像素。
    */
    set_height(value: number): void {
        let flag = this._sizeFlag;
        if (value == null) {
            value = 0;
            this._sizeFlag &= ~2;
        }
        else if (value == 0)
            this._sizeFlag |= 2;
        else
            this._sizeFlag &= ~2;
        if (this._height !== value || flag != this._sizeFlag) {
            this._height = value;
            this._setHeight(value);
            this._setPivotY(this._anchorY * value);
            if (this._graphics) this._graphics._clearBoundsCache(true);
            this._setTranformChange();
            this._shouldRefreshLayout();
        }
    }

    /**
    * @internal
    * @en Get the height of the Node, in pixels.
    * @zh 获取节点的高度，以像素为单位。
    */
    get_height(): number {
        if (!this.autoSize) return (this._height == 0 && (this._sizeFlag & 2) == 0 && this.texture) ? this.texture.height : this._height;
        if (this.texture) return this.texture.height;
        if (!this._graphics && this._children.length === 0) return 0;
        return this.getSelfBounds().height;
    }

    /**
     * @internal
     * @en Check if the width is set.
     * @returns True if the width is set, otherwise false.
     * @zh 检查是否设置了宽度。
     * @returns True 表示宽度已设置，否则为 False。
     */
    get _isWidthSet() {
        return this._width != 0 || (this._sizeFlag & 1) != 0;
    }

    /**
     * @internal
     * @en Check if the height is set.
     * @returns True if the height is set, otherwise false.
     * @zh 检查是否设置了高度。
     * @returns True 表示高度已设置，否则为 False。
     */
    get _isHeightSet() {
        return this._height != 0 || (this._sizeFlag & 2) != 0;
    }

    /**@internal */
    _setWidth(value: number): void {
    }

    /**@internal */
    _setHeight(value: number): void {
    }

    /**
     * @internal
     * @protected
     * @en Called when the layout should be refreshed.
     * @zh 当需要刷新布局时调用。
     */
    protected _shouldRefreshLayout() {
    }

    /**
     * @en The display width of the object, in pixels, including X axis scaling.
     * @returns The display width.
     * @zh 对象的显示宽度（以像素为单位），包含X轴缩放。
     * @returns 显示宽度。
     */
    get displayWidth(): number {
        return this.width * this.scaleX;
    }

    /**
    * @en The display height of the object, in pixels, including Y axis scaling.
    * @returns The display height.
    * @zh 对象的显示高度（以像素为单位），包含Y轴缩放。
    * @returns 显示高度。
    */
    get displayHeight(): number {
        return this.height * this.scaleY;
    }

    /**
     * @en Set the bounds of the object. If set, getBounds will not be used to calculate the bounds. Proper use can improve performance.
     * @param bound The bounds rectangle.
     * @zh 设置对象的边界大小，如果设置，则不再通过getBounds计算边界。合理使用能提高性能。
     * @param bound 边界矩形区域
     */
    setSelfBounds(bound: Rectangle): void {
        this._getBoundsStyle().userBounds = bound;
    }

    /**
     * @en Get the rectangle display area of the object in the parent container's coordinate system.
     * Note: This calculation is complex, use sparingly.
     * @return The rectangle area.
     * @zh 获取本对象在父容器坐标系的矩形显示区域。
     * 注意：计算量较大，尽量少用。
     * @returns 矩形区域。
     */
    getBounds(): Rectangle {
        return this._getBoundsStyle().bounds = Rectangle._getWrapRec(this._boundPointsToParent());
    }

    /**
     * @en Get the rectangle display area of the object in its own coordinate system.
     * Note: This calculation is complex, use sparingly.
     * @returns The rectangle area.
     * @zh 获取本对象在自己坐标系的矩形显示区域。
     * 注意：计算量较大，尽量少用。
     * @returns 矩形区域。
     */
    getSelfBounds(): Rectangle {
        if (this._boundStyle && this._boundStyle.userBounds) return this._boundStyle.userBounds;
        if (!this._graphics && this._children.length === 0 && !this._texture)
            return Rectangle.TEMP.setTo(0, 0, this.width, this.height); // 如果没有graphics则取对象指定的大小。原来是0000
        return this._getBoundsStyle().bounds = Rectangle._getWrapRec(this._getBoundPointsM(false));
    }

    /**
     * @internal
     * @en Get the polygon vertex list of the display area of the object in the parent container's coordinate system.
     * @param  ifRotate Whether to consider the rotation of the object itself. 
     * If true, and the object has rotation, the vertices will be calculated based on the object's rotated position.
     * If false, the vertices will be calculated based on the object's unrotated position, even if the object has rotation.
     * @returns  The vertex list in the format: [x1, y1, x2, y2, x3, y3, ...].
     * @zh 获取本对象在父容器坐标系的显示区域多边形顶点列表。
     * @param  ifRotate （可选）是否考虑对象自身的旋转。
     * 如果为 true，且对象有旋转，则顶点会根据对象旋转后的位置进行计算。
     * 如果为 false，则顶点会根据对象未旋转的位置进行计算，即使对象有旋转。
     * @returns 顶点列表。结构：[x1,y1,x2,y2,x3,y3,...]。
     */
    _boundPointsToParent(ifRotate: boolean = false): any[] {
        let pX: number = 0, pY: number = 0;
        if (this._style) {
            pX = this.pivotX;
            pY = this.pivotY;
            ifRotate = ifRotate || (this._style.rotation !== 0);
            if (this._style.scrollRect) {
                pX += this._style.scrollRect.x;
                pY += this._style.scrollRect.y;
            }
        }
        let pList: any[] = this._getBoundPointsM(ifRotate);
        if (!pList || pList.length < 1) return pList;

        if (pList.length != 8) {
            pList = ifRotate ? GrahamScan.scanPList(pList) : Rectangle._getWrapRec(pList, Rectangle.TEMP)._getBoundPoints();
        }

        if (!this.transform) {
            Utils.transPointList(pList, this._x - pX, this._y - pY);
            return pList;
        }
        let tPoint = Point.TEMP;
        let len = pList.length;
        for (let i = 0; i < len; i += 2) {
            tPoint.x = pList[i];
            tPoint.y = pList[i + 1];
            this.toParentPoint(tPoint);
            pList[i] = tPoint.x;
            pList[i + 1] = tPoint.y;
        }
        return pList;
    }

    /**
     * @internal
     * @en Get the vertex list of the display area polygon in its own coordinate system.
     * @param ifRotate (Optional) Whether to consider the rotation of the child objects when calculating their vertices.
     * If true, and a child object has rotation, the child's vertices will be calculated based on its rotated position.
     * If false, the child's vertices will be calculated based on its unrotated position, even if it has rotation.
     * @returns A list of vertices. Structure: [x1, y1, x2, y2, x3, y3, ...].
     * @zh 获取自己坐标系的显示区域多边形顶点列表。
     * @param ifRotate （可选）在计算子对象的顶点时是否考虑子对象的旋转。
     * 如果为 true,且子对象有旋转,则子对象的顶点将根据其旋转后的位置来计算。
     * 如果为 false,则子对象的顶点将根据其未旋转的位置来计算,即使子对象有旋转。
     * @returns 顶点列表。结构：[x1,y1,x2,y2,x3,y3,...]。
     */
    _getBoundPointsM(ifRotate: boolean = false): any[] {
        if (this._boundStyle && this._boundStyle.userBounds) return this._boundStyle.userBounds._getBoundPoints();
        if (!this._boundStyle) this._getBoundsStyle();
        let rst = this._boundStyle.temBM;
        if (!rst) rst = this._boundStyle.temBM = [];
        if (this._style.scrollRect) {
            rst.length = 0;
            var rec: Rectangle = Rectangle.TEMP;
            rec.copyFrom(this._style.scrollRect);
            rst.push(...rec._getBoundPoints());
            return rst;
        }
        let pList: any[];
        if (this._graphics) {
            pList = this._graphics.getBoundPoints();
        } else {
            rst.length = 0;
            pList = rst;
        }
        if (this._texture) {
            rec = Rectangle.TEMP;
            rec.setTo(0, 0, this.width || this._texture.width, this.height || this._texture.height);
            pList.push(...rec._getBoundPoints());
        }
        //处理子对象区域
        let chidren = this._children;
        for (let i = 0, n = chidren.length; i < n; i++) {
            let child = <Sprite>chidren[i]; //_visible===true隐含了是Sprite
            if (child._visible === true && child._cacheStyle.maskParent != this) {
                let cList = child._boundPointsToParent(ifRotate);
                if (cList) {
                    if (pList)
                        pList.push(...cList);
                    else
                        pList = cList;
                }
            }
        }
        return pList;
    }

    /**
     * @en Returns the display area of the drawing object (`Graphics`) in this instance, excluding child objects.
     * @param realSize (Optional) Use the actual size of the image, default is false.
     * @returns A Rectangle object representing the obtained display area.
     * @zh 返回此实例中绘图对象（`Graphics`）的显示区域，不包括子对象。
     * @param realSize （可选）使用图片的真实大小，默认为false。
     * @returns 一个 Rectangle 对象，表示获取到的显示区域。
     */
    getGraphicBounds(realSize: boolean = false): Rectangle {
        if (!this._graphics) return Rectangle.TEMP.setTo(0, 0, 0, 0);
        return this._graphics.getBounds(realSize);
    }

    /**
     * @internal
     * @en Get the cache style.
     * @return The cache style (CacheStyle).
     * @zh 获取缓存样式。
     * @return 缓存样式 (CacheStyle)。
     */
    _getCacheStyle(): CacheStyle {
        this._cacheStyle === CacheStyle.EMPTY && (this._cacheStyle = CacheStyle.create());
        return this._cacheStyle;
    }

    /**
     * @en Get the sprite style.
     * @return The sprite style (SpriteStyle).
     * @zh 获取精灵样式。
     * @return 精灵样式 (SpriteStyle)。
     */
    getStyle(): SpriteStyle {
        this._style === SpriteStyle.EMPTY && (this._style = SpriteStyle.create());
        return this._style;
    }

    /**
     * @en Set the sprite style.
     * @param value The sprite style to set.
     * @zh 设置精灵样式。
     * @param value 要设置的精灵样式。
     */
    setStyle(value: SpriteStyle): void {
        this._style = value;
    }

    /**
     * @en The scale factor on the X axis, with a default value of 1. Setting a negative value can achieve a horizontal flip effect, e.g., scaleX=-1.
     * @zh X轴缩放值，默认值为1。设置为负数可以实现水平反转效果，例如scaleX=-1。
     */
    get scaleX(): number {
        return this._style.scaleX;
    }

    set scaleX(value: number) {
        this.set_scaleX(value);
    }

    /**
     * @en The scale factor on the Y axis, with a default value of 1. Setting a negative value can achieve a vertical flip effect, e.g., scaleY=-1.
     * @zh Y轴缩放值，默认值为1。设置为负数可以实现垂直反转效果，例如scaleY=-1。
     */
    get scaleY(): number {
        return this._style.scaleY;
    }

    set scaleY(value: number) {
        this.set_scaleY(value);
    }

    /**
     * @internal
     * @en Set the scale factor on the X axis and update the transform and layout if necessary.
     * @param value The scale factor to set on the X axis.
     * @zh 设置X轴缩放值,并在必要时更新变换和布局。
     * @param value 要设置的X轴缩放值。
     */
    set_scaleX(value: number): void {
        var style: SpriteStyle = this.getStyle();
        if (style.scaleX !== value) {
            if (this.cacheGlobal) {
                this._setGlobalCacheFlag(Sprite.Sprite_GlobalDeltaFlage_Scale_X | Sprite.Sprite_GlobalDeltaFlage_Matrix, true)
                this._syncGlobalFlag(Sprite.Sprite_GlobalDeltaFlage_Scale_X | Sprite.Sprite_GlobalDeltaFlage_Matrix, true);
            }
            this._setScaleX(value);
            this._setTranformChange();
            this._shouldRefreshLayout();
        }
    }
    /**
     * @internal
     * @en Get the scale factor on the X axis.
     * @return The scale factor on the X axis.
     * @zh 获取X轴缩放值。
     * @return X轴缩放值。
     */
    get_scaleX(): number {
        return this._style.scaleX;
    }

    /**
     * @internal
     * @en Set the scale factor on the Y axis and update the transform and layout if necessary.
     * @param value The scale factor to set on the Y axis.
     * @zh 设置Y轴缩放值,并在必要时更新变换和布局。
     * @param value 要设置的Y轴缩放值。
     */
    set_scaleY(value: number): void {
        var style: SpriteStyle = this.getStyle();
        if (style.scaleY !== value) {
            if (this.cacheGlobal) {
                this._setGlobalCacheFlag(Sprite.Sprite_GlobalDeltaFlage_Scale_Y | Sprite.Sprite_GlobalDeltaFlage_Matrix, true)
                this._syncGlobalFlag(Sprite.Sprite_GlobalDeltaFlage_Scale_Y | Sprite.Sprite_GlobalDeltaFlage_Matrix, true);
            }
            this._setScaleY(value);
            this._setTranformChange();
            this._shouldRefreshLayout();
        }
    }

    /**
     * @internal
     * @en Get the scale factor on the Y axis.
     * @return The scale factor on the Y axis.
     * @zh 获取Y轴缩放值。
     * @return Y轴缩放值。
     */
    get_scaleY(): number {
        return this._style.scaleY;
    }

    /**
     * @internal
     * @en Set the scale factor on the X axis.
     * @param value The scale factor to set on the X axis.
     * @zh 设置X轴缩放值。
     * @param value 要设置的X轴缩放值。
     */
    _setScaleX(value: number): void {
        this._style.scaleX = value;
    }

    /**
     * @internal
     * @en Set the scale factor on the Y axis.
     * @param value The scale factor to set on the Y axis.
     * @zh 设置Y轴缩放值。
     * @param value 要设置的Y轴缩放值。
     */
    _setScaleY(value: number): void {
        this._style.scaleY = value;
    }

    /**
     * @en The rotation angle, in degrees, with a default value of 0.
     * @zh 旋转角度，默认值为0。以角度为单位。
     */
    get rotation(): number {
        return this._style.rotation;
    }

    set rotation(value: number) {
        var style: SpriteStyle = this.getStyle();
        if (style.rotation !== value) {
            if (this.cacheGlobal) {
                this._setGlobalCacheFlag(Sprite.Sprite_GlobalDeltaFlage_Rotation | Sprite.Sprite_GlobalDeltaFlage_Matrix, true)
                this._syncGlobalFlag(Sprite.Sprite_GlobalDeltaFlage_Rotation | Sprite.Sprite_GlobalDeltaFlage_Matrix, true);
            }
            this._setRotation(value);
            this._setTranformChange();
        }
    }

    /**
     * @internal
     * @en Set the rotation angle.
     * @param value The rotation angle to set, in degrees.
     * @zh 设置旋转角度。
     * @param value 要设置的旋转角度，以角度为单位。
     */
    _setRotation(value: number): void {
        this.getStyle().rotation = value;
    }

    /**
     * @en The horizontal skew angle, in degrees, with a default value of 0.
     * @zh 水平倾斜角度，默认值为0。以角度为单位。
     */
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

    /**
      * @internal
      * @en Set the horizontal skew angle.
      * @param value The horizontal skew angle to set, in degrees.
      * @zh 设置水平倾斜角度。
      * @param value 要设置的水平倾斜角度,以角度为单位。
      */
    _setSkewX(value: number): void {
        this._style.skewX = value;
    }

    /**
      * @en The vertical skew angle, in degrees, with a default value of 0.
      * @zh 垂直倾斜角度,默认值为0。以角度为单位。
      */
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

    /**
     * @internal
     * @en Set the vertical skew angle.
     * @param value The vertical skew angle to set, in degrees.
     * @zh 设置垂直倾斜角度。
     * @param value 要设置的垂直倾斜角度,以角度为单位。
     */
    _setSkewY(value: number): void {
        this._style.skewY = value;
    }

    /**
     * @internal
     * @en Create a transform matrix.
     * @return The created transform matrix.
     * @zh 创建变换矩阵。
     * @return 创建的变换矩阵。
     */
    _createTransform(): Matrix {
        return Matrix.create();
    }

    /**
     * @internal
     * @protected 
     * @en Adjust the transform matrix.
     * @return The adjusted transform matrix.
     * @zh 调整变换矩阵。
     * @return 调整后的变换矩阵。
     */
    protected _adjustTransform(): Matrix {
        this._tfChanged = false;
        var style = this._style;
        var sx = style.scaleX, sy = style.scaleY;
        var sskx = style.skewX;
        var ssky = style.skewY;
        var rot = style.rotation;
        var m = this._transform || (this._transform = this._createTransform());
        if (rot || sx !== 1 || sy !== 1 || sskx !== 0 || ssky !== 0) {
            m._bTransform = true;
            var skx = (rot - sskx) * 0.0174532922222222;//laya.CONST.PI180;
            var sky = (rot + ssky) * 0.0174532922222222;
            var cx = Math.cos(sky);
            var ssx = Math.sin(sky);
            var cy = Math.sin(skx);
            var ssy = Math.cos(skx);
            m.a = sx * cx;
            m.b = sx * ssx;
            m.c = -sy * cy;
            m.d = sy * ssy;
            m.tx = m.ty = 0;
        } else {
            m.identity();
            this._renderType &= ~SpriteConst.TRANSFORM;
        }
        return m;
    }

    /**@internal */
    _setTransform(value: Matrix): void {

    }

    /**
     * @en The matrix information of the object. By setting the matrix, node rotation, scaling, and displacement effects can be achieved.
     * @zh 对象的矩阵信息。通过设置矩阵可以实现节点旋转，缩放，位移效果。
     */
    get transform(): Matrix {
        return this._tfChanged ? this._adjustTransform() : this._transform;
    }

    set transform(value: Matrix) {
        this.set_transform(value);
    }

    /**
      * @internal
      * @en Get the transform matrix.
      * @return The transform matrix.
      * @zh 获取变换矩阵。
      * @return 变换矩阵。
      */
    get_transform(): Matrix {
        return this._tfChanged ? this._adjustTransform() : this._transform;
    }

    /**
     * @internal
     * @en Set the transform matrix and update the object's position and render type.
     * @param value The transform matrix to set.
     * @zh 设置变换矩阵,并更新对象的位置和渲染类型。
     * @param value 要设置的变换矩阵。
     */
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
        this.parentRepaint();
    }


    /**
     * @internal
     * @en Get the pivot point's x coordinate.
     * @return The pivot point's x coordinate.
     * @zh 获取轴心点的 x 坐标。
     * @return 轴心点的 x 坐标。
     */
    _getPivotX(): number {
        return this._style.pivotX;
    }

    /**
     * @internal
     * @en Set the pivot point's x coordinate.
     * @param value The x coordinate to set.
     * @zh 设置轴心点的 x 坐标。
     * @param value 要设置的 x 坐标。
     */
    _setPivotX(value: number): void {
        var style: SpriteStyle = this.getStyle();
        style.pivotX = value;
    }

    /**
     * @internal
     * @en Get the pivot point's y coordinate.
     * @return The pivot point's y coordinate.
     * @zh 获取轴心点的 y 坐标。
     * @return 轴心点的 y 坐标。
     */
    _getPivotY(): number {
        return this._style.pivotY;
    }

    /**
     * @internal
     * @en Set the pivot point's y coordinate.
     * @param value The y coordinate to set.
     * @zh 设置轴心点的 y 坐标。
     * @param value 要设置的 y 坐标。
     */
    _setPivotY(value: number): void {
        var style: SpriteStyle = this.getStyle();
        style.pivotY = value;
    }

    /**
     * @en The x-axis pivot point position, in pixels, with a default value of 0. The pivot point affects the object's position, scaling center, and rotation center.
     * @zh X 轴轴心点的位置，以像素为单位，默认为 0。轴心点会影响对象的位置、缩放中心和旋转中心。
     */
    get pivotX(): number {
        return this._getPivotX();
    }

    set pivotX(value: number) {
        var style: SpriteStyle = this.getStyle();
        if (style.pivotX != value) {
            this._setPivotX(value);
            let t = this.width;
            if (t != 0) this._anchorX = value / t;
            this._shouldRefreshLayout();
            this.repaint();
        }
    }

    /**
     * @en The y-axis pivot point position, in pixels, with a default value of 0. The pivot point affects the object's position, scaling center, and rotation center.
     * @zh Y 轴轴心点的位置，以像素为单位，默认为 0。轴心点会影响对象的位置、缩放中心和旋转中心。
     */
    get pivotY(): number {
        return this._getPivotY();
    }

    set pivotY(value: number) {
        var style: SpriteStyle = this.getStyle();
        if (style.pivotY != value) {
            this._setPivotY(value);
            let t = this.height;
            if (t != 0) this._anchorY = value / t;
            this._shouldRefreshLayout();
            this.repaint();
        }
    }

    /**
     * @en The anchor point's x-coordinate, ranging from 0 to 1. Setting anchorX will ultimately change the node's pivot point through the pivotX value.
     * @zh X 轴锚点,值为 0-1。设置 anchorX 值最终会通过 pivotX 值来改变节点的轴心点。
     */
    get anchorX(): number {
        return this.get_anchorX();
    }

    /**
      * @internal
      * @en Get the anchor point's x-coordinate.
      * @return The anchor point's x-coordinate.
      * @zh 获取锚点的 x 坐标。
      * @return 锚点的 x 坐标。
      */
    get_anchorX(): number {
        return this._anchorX;
    }

    set anchorX(value: number) {
        this.set_anchorX(value);
    }

    /**
     * @internal
     * @en Set the anchor point's x-coordinate, ultimately changing the node's pivot point through the pivotX value.
     * @param value The anchor point's x-coordinate to set.
     * @zh 设置锚点的 x 坐标,最终会通过 pivotX 值来改变节点的轴心点。
     * @param value 要设置的锚点的 x 坐标。
     */
    set_anchorX(value: number) {
        if (isNaN(value))
            value = null;
        if (this._anchorX != value) {
            this._anchorX = value;
            if (value != null) {
                this._setPivotX(value * this.width);
                this._shouldRefreshLayout();
                this.repaint();
            }
        }
    }

    /**
     * @en The anchor point's y-coordinate, ranging from 0 to 1. Setting anchorY will ultimately change the node's pivot point through the pivotY value.
     * @zh Y 轴锚点，值为 0-1。设置 anchorY 值最终会通过 pivotY 值来改变节点的轴心点。
     */
    get anchorY(): number {
        return this.get_anchorY();
    }

    /**
     * @internal
     * @en Get the anchor point's y-coordinate.
     * @return The anchor point's y-coordinate.
     * @zh 获取锚点的 y 坐标。
     * @return 锚点的 y 坐标。
     */
    get_anchorY(): number {
        return this._anchorY;
    }

    set anchorY(value: number) {
        this.set_anchorY(value);
    }

    /**
     * @internal
     * @en Set the anchor point's y-coordinate, ultimately changing the node's pivot point through the pivotY value.
     * @param value The anchor point's y-coordinate to set.
     * @zh 设置锚点的 y 坐标,最终会通过 pivotY 值来改变节点的轴心点。
     * @param value 要设置的锚点的 y 坐标。
     */
    set_anchorY(value: number) {
        if (isNaN(value))
            value = null;
        if (this._anchorY != value) {
            this._anchorY = value;
            if (value != null) {
                this._setPivotY(value * this.height);
                this._shouldRefreshLayout();
                this.repaint();
            }
        }
    }

    /**
     * @internal
     * @en Set the alpha value. If the value is not 1, the render type will be changed.
     * @param value The alpha value to set.
     * @zh 设置 alpha 值。如果值不为 1,则会改变渲染类型。
     * @param value 要设置的 alpha 值。
     */
    _setAlpha(value: number): void {
        if (this._style.alpha !== value) {
            var style: SpriteStyle = this.getStyle();
            style.alpha = value;
            if (value !== 1) this._renderType |= SpriteConst.ALPHA;
            else this._renderType &= ~SpriteConst.ALPHA;
            this.parentRepaint();
        }
    }

    /**
     * @internal
     * @en Get the alpha value.
     * @return The alpha value.
     * @zh 获取 alpha 值。
     * @return alpha 值。
     */
    _getAlpha(): number {
        return this._style.alpha;
    }

    /**
     * @en The transparency value, ranging from 0 to 1, with a default value of 1 (opaque). Changing the alpha value will affect the drawcall.
     * @zh 透明度,值为 0-1,默认值为 1(不透明)。更改 alpha 值会影响 drawcall。
     */
    get alpha(): number {
        return this._getAlpha();
    }

    set alpha(value: number) {
        value = value < 0 ? 0 : (value > 1 ? 1 : value);
        this._setAlpha(value);
    }

    /**
     * @en Indicates whether the object is visible. The default value is true. If set to false, the node will not be rendered.
     * @zh 表示对象是否可见,默认为 true。如果设置为 false,节点将不会被渲染。
     */
    get visible(): boolean {
        return this.get_visible();
    }

    set visible(value: boolean) {
        this.set_visible(value);
    }

    /**
      * @internal
      * @en Get the visibility value.
      * @return The visibility value.
      * @zh 获取可见性的值。
      * @return 可见性的值。
      */
    get_visible(): boolean {
        return this._visible;
    }

    /**
     * @internal 
     * @en Set the visibility value. If the value changes, the node will be redrawn.
     * @param value The visibility value to set.
     * @zh 设置可见性的值。如果值改变,节点将会被重绘。
     * @param value 要设置的可见性的值。
     */
    set_visible(value: boolean): void {
        if (this._visible !== value) {
            this._visible = value;
            this.parentRepaint(SpriteConst.REPAINT_ALL);
        }
    }

    /**
     * @en Specifies the blending mode to be used. Only "lighter" is currently supported.
     * @zh 指定要使用的混合模式，目前只支持 "lighter"。
     */
    get blendMode(): string {
        return this._style.blendMode;
    }

    set blendMode(value: string) {
        if (this.getStyle().blendMode != value) {
            this.getStyle().blendMode = value;
            if (value && value != "source-over")
                this._renderType |= SpriteConst.BLEND;
            else
                this._renderType &= ~SpriteConst.BLEND;
            this.parentRepaint();
        }
    }

    /**
     * @en The drawing object, which encapsulates the interfaces for drawing bitmaps and vector graphics. All drawing operations of Sprite are implemented through Graphics.
     * @zh 绘图对象。封装了绘制位图和矢量图的接口,Sprite 的所有绘图操作都是通过 Graphics 实现的。
     */
    get graphics(): Graphics {
        if (!this._graphics) {
            this.graphics = new Graphics();
            this._ownGraphics = true;
        }
        return this._graphics;
    }

    set graphics(value: Graphics) {
        this.setGraphics(value, false);
    }

    /**
     * @en Set the Graphics object for drawing.
     * @param value The Graphics object to set.
     * @param transferOwnership Whether to set the Graphics object to the belonging node (i.e., transfer the ownership of the Graphics object to the Sprite). If true, the Sprite will be responsible for destroying the Graphics object when it's no longer needed.
     * @zh 设置用于绘制的 Graphics 对象。
     * @param value 要设置的 Graphics 对象。
     * @param transferOwnership 是否将 Graphics 对象设置到所属节点上(即将 Graphics 对象的所有权转移给 Sprite)。如果为 true,则 Sprite 将负责在不再需要 Graphics 对象时销毁它。
     */
    setGraphics(value: Graphics, transferOwnership: boolean) {
        if (this._graphics) {
            this._graphics._sp = null;
            if (this._ownGraphics)
                this._graphics.destroy();
        }
        this._ownGraphics = transferOwnership;
        this._graphics = value;
        if (value) {
            this._renderType |= SpriteConst.GRAPHICS;
            value._sp = this;
        } else {
            this._renderType &= ~SpriteConst.GRAPHICS;
        }
        this.repaint();
    }

    /**
     * @en 2D sprite material
     * @zh 2D精灵材质
     */
    get material() {
        return this._graphics?.material;
    }

    set material(value: Material) {
        if (this._graphics == null && value == null)
            return;

        this.graphics.material = value;
    }

    /**
     * @en The scroll rectangle range of the display object, with a clipping effect (if you only want to limit the rendering area of child objects, please use viewport).
     * Differences between srollRect and viewport:
     * 1. srollRect has a clipping effect, viewport only affects whether child objects are rendered, and does not have a clipping effect (higher performance).
     * 2. Setting the x and y properties of the rect can achieve scrolling effect, but scrollRect will keep the position of point 0,0 unchanged.
     * @zh 显示对象的滚动矩形范围，具有裁剪效果(如果只想限制子对象渲染区域，请使用viewport)
     * srollRect和viewport的区别：
     * 1.srollRect自带裁剪效果，viewport只影响子对象渲染是否渲染，不具有裁剪效果（性能更高）。
     * 2.设置rect的x,y属性均能实现区域滚动效果，但scrollRect会保持0,0点位置不变。
     */
    get scrollRect(): Rectangle {
        return this._style.scrollRect;
    }

    set scrollRect(value: Rectangle) {
        if (this.getStyle().scrollRect == null && value == null)
            return;

        this.getStyle().scrollRect = value;
        //viewport = value;
        if (value) {
            this._renderType |= SpriteConst.CLIP;
        } else {
            this._renderType &= ~SpriteConst.CLIP;
        }
        this.repaint();
    }

    /**
    * @en The viewport size. Child objects outside the viewport will not be rendered (if you want to achieve a clipping effect, please use scrollRect). Proper use can improve rendering performance. For example, map tiles composed of small images will not render small images outside the viewport.
    * The default value is null.
    * The differences between scrollRect and viewport:
    * 1. scrollRect comes with a clipping effect, while viewport only affects whether child objects are rendered without clipping (better performance).
    * 2. Setting the x and y properties of the rect can achieve a scrolling effect in the area, but scrollRect will keep the position of point 0,0 unchanged.
    * @zh 视口大小，视口外的子对象将不被渲染（如果想实现裁剪效果，请使用scrollRect），合理使用能提高渲染性能。例如，由一个个小图片拼成的地图块，viewport外面的小图片将不渲染。
    * 默认值为null。
    * scrollRect和viewport的区别：
    * 1. scrollRect自带裁剪效果，viewport只影响子对象是否渲染，不具有裁剪效果（性能更高）。
    * 2. 设置rect的x,y属性均能实现区域滚动效果，但scrollRect会保持0,0点位置不变。
    */
    get viewport(): Rectangle {
        return this._style.viewport;
    }

    set viewport(value: Rectangle) {
        if (typeof (value) == 'string') {
            let recArr = (<any>value).split(",");
            if (recArr.length > 3) {
                value = new Rectangle(parseFloat(recArr[0]), parseFloat(recArr[1]), parseFloat(recArr[2]), parseFloat(recArr[3]));
            }
        }
        this.getStyle().viewport = value;
    }

    /**
     * @en Set the position. Equivalent to setting the x and y properties separately.
     * Since the return value is the Sprite object itself, you can use the following syntax: spr.pos(...).scale(...);
     * @param x X-axis coordinate.
     * @param y Y-axis coordinate.
     * @param speedMode (Optional) Whether to use speed mode. Normally, this.x=value is called to assign values. Speed mode directly calls the internal function to handle it. If the x and y properties are not overridden, it is recommended to set to speed mode for higher performance.
     * @returns The object itself.
     * @zh 设置坐标位置。相当于分别设置x和y属性。
     * 因为返回值为Sprite对象本身，所以可以使用如下语法：spr.pos(...).scale(...);
     * @param x X轴坐标。
     * @param y Y轴坐标。
     * @param speedMode （可选）是否极速模式，正常是调用this.x=value进行赋值，极速模式直接调用内部函数处理，如果未重写x,y属性，建议设置为极速模式性能更高。
     * @returns 返回对象本身。
     */
    pos(x: number, y: number, speedMode: boolean = false): Sprite {
        if (this._x !== x || this._y !== y) {
            if (this._destroyed) return this;
            if (speedMode) {
                this._setX(x);
                this._setY(y);
                this.parentRepaint(SpriteConst.REPAINT_CACHE);
                var p: Sprite = this._cacheStyle.maskParent;
                if (p) {
                    p.repaint(SpriteConst.REPAINT_CACHE);
                }

                if (this.cacheGlobal) {
                    let flag = Sprite.Sprite_GlobalDeltaFlage_Position_X | Sprite.Sprite_GlobalDeltaFlage_Position_Y;
                    this._setGlobalCacheFlag(flag, true);
                    this._syncGlobalFlag(flag, true);
                }

            } else {
                this.x = x;
                this.y = y;
            }
        }
        return this;
    }

    /**
     * @en Set the pivot point. Equivalent to setting the pivotX and pivotY properties separately.
     * Since the return value is the Sprite object itself, you can use the following syntax: spr.pivot(...).pos(50, 100);
     * @param x X-axis pivot point.
     * @param y Y-axis pivot point.
     * @returns The object itself.
     * @zh 设置轴心点。相当于分别设置pivotX和pivotY属性。
     * 因为返回值为Sprite对象本身，所以可以使用如下语法：spr.pivot(...).pos(50, 100);
     * @param x X轴心点。
     * @param y Y轴心点。
     * @returns 返回对象本身。
     */
    pivot(x: number, y: number): Sprite {
        this.pivotX = x;
        this.pivotY = y;
        return this;
    }

    /**
     * @en Set the size. Equivalent to setting the width and height properties separately.
     * Since the return value is the Sprite object itself, you can use the following syntax: spr.size(...).pos(50, 100);
     * @param width Width value.
     * @param height Height value.
     * @returns The object itself.
     * @zh 设置宽高。相当于分别设置width和height属性。
     * 因为返回值为Sprite对象本身，所以可以使用如下语法：spr.size(...).pos(50, 100);
     * @param width 宽度值。
     * @param height 高度值。
     * @returns 返回对象本身。
     */
    size(width: number, height: number): Sprite {
        this.width = width;
        this.height = height;
        return this;
    }

    /**
     * @en Set the scale. Equivalent to setting the scaleX and scaleY properties separately.
     * Since the return value is the Sprite object itself, you can use the following syntax: spr.scale(...).pos(50, 100);
     * @param scaleX X-axis scale ratio.
     * @param scaleY Y-axis scale ratio.
     * @param speedMode (Optional) Whether to use speed mode. Normally, this.scaleX=value is called to assign values. Speed mode directly calls the internal function to handle it. If the scaleX and scaleY properties are not overridden, it is recommended to set to speed mode for higher performance.
     * @returns The object itself.
     * @zh 设置缩放。相当于分别设置scaleX和scaleY属性。
     * 因为返回值为Sprite对象本身，所以可以使用如下语法：spr.scale(...).pos(50, 100);
     * @param scaleX X轴缩放比例。
     * @param scaleY Y轴缩放比例。
     * @param speedMode （可选）是否极速模式，正常是调用this.scaleX=value进行赋值，极速模式直接调用内部函数处理，如果未重写scaleX,scaleY属性，建议设置为极速模式性能更高。
     * @returns 返回对象本身。
     */
    scale(scaleX: number, scaleY: number, speedMode?: boolean): Sprite {
        if (this._destroyed) return this;
        var style: SpriteStyle = this.getStyle();
        if (style.scaleX != scaleX || style.scaleY != scaleY) {
            if (speedMode) {
                this._setScaleX(scaleX);
                this._setScaleY(scaleY);
                this._setTranformChange();
                this._shouldRefreshLayout();
            } else {
                this.scaleX = scaleX;
                this.scaleY = scaleY;
            }
        }
        return this;
    }

    /**
     * @en Set the skew angle. Equivalent to setting the skewX and skewY properties separately.
     * Since the return value is the Sprite object itself, you can use the following syntax: spr.skew(...).pos(50, 100);
     * @param skewX Horizontal skew angle.
     * @param skewY Vertical skew angle.
     * @returns The object itself.
     * @zh 设置倾斜角度。相当于分别设置skewX和skewY属性。
     * 因为返回值为Sprite对象本身，所以可以使用如下语法：spr.skew(...).pos(50, 100);
     * @param skewX 水平倾斜角度。
     * @param skewY 垂直倾斜角度。
     * @returns 返回对象本身。
     */
    skew(skewX: number, skewY: number): Sprite {
        this.skewX = skewX;
        this.skewY = skewY;
        return this;
    }

    /**
     * @en Update and render the display object. Called by the system.
     * @param ctx The rendering context reference.
     * @param x The X-axis coordinate.
     * @param y The Y-axis coordinate.
     * The meaning of x and y is complex. Without rotation, it is the world position of the current node.
     * If any parent node has rotation, x and y will be reset to [0,0] there and then accumulated again.
     * So, x and y can be considered as the cumulative value from the current node to a node with rotation (or the root node).
     * @zh 更新、呈现显示对象。由系统调用。
     * @param ctx 渲染的上下文引用。
     * @param x X轴坐标。
     * @param y Y轴坐标。
     * 关于上面的x、y的含义比较复杂，在没有旋转的情况下，它就是当前节点的世界坐标的位置。
     * 如果此节点的某个父节点有旋转，x、y会在那里被重置为[0,0]，然后继续累加。
     * 所以可以认为这个x、y是表示当前节点到某个有旋转的节点（或者根节点）的累加值。
     */
    render(ctx: Context, x: number, y: number): void {
        RenderSprite.renders[this._renderType]._fun(this, ctx, x + this._x, y + this._y);
        this._repaint = 0;
    }

    /**
     * @en Draws the current Sprite to a Canvas and returns an HtmlCanvas object.
     * The drawing result can be used as an image source to be drawn into other Sprites.
     * It can also obtain the original image data, send it to the server, or save it as an image to achieve a screenshot effect.
     * @param canvasWidth The width of the canvas.
     * @param canvasHeight The height of the canvas.
     * @param offsetX The X-axis offset for drawing.
     * @param offsetY The Y-axis offset for drawing.
     * @returns The HTMLCanvas object.
     * @zh 绘制当前 Sprite 到 Canvas 上,并返回一个 HtmlCanvas 对象。
     * 绘制的结果可以当作图片源,再次绘制到其他 Sprite 里面。也可以获取原始图片数据,发给服务器或者保存为图片,从而实现截图效果。
     * @param canvasWidth 画布宽度。
     * @param canvasHeight 画布高度。
     * @param offsetX 绘制的 X 轴偏移量。
     * @param offsetY 绘制的 Y 轴偏移量。
     * @returns HTMLCanvas 对象。
     */
    drawToCanvas(canvasWidth: number, canvasHeight: number, offsetX: number, offsetY: number): HTMLCanvas {
        //console.log('drawToCanvas is deprecated, please use drawToTexture');
        return Sprite.drawToCanvas(this, canvasWidth, canvasHeight, offsetX, offsetY);
    }
    /**
     * @ignore
     * @en Draws the specified Sprite to a Canvas and returns an HtmlCanvas object.
     * @param sprite The Sprite to draw.
     * @param canvasWidth The width of the canvas.
     * @param canvasHeight The height of the canvas.
     * @param offsetX The X-axis offset for drawing.
     * @param offsetY The Y-axis offset for drawing.
     * @returns The HTMLCanvas object.
     * @zh 绘制指定的 Sprite 到 Canvas 上,并返回一个 HtmlCanvas 对象。
     * @param sprite 要绘制的 Sprite。
     * @param canvasWidth 画布宽度。
     * @param canvasHeight 画布高度。
     * @param offsetX 绘制的 X 轴偏移量。
     * @param offsetY 绘制的 Y 轴偏移量。
     * @returns HTMLCanvas 对象。
     */
    static drawToCanvas(sprite: Sprite, canvasWidth: number, canvasHeight: number, offsetX: number, offsetY: number, isDrawRenderRect: boolean = true): HTMLCanvas {
        // if (arguments.length > 5) {
        //     throw 'drawToCanvas 接口参数不对'
        // }
        let rt = Sprite.drawToRenderTexture2D(sprite, canvasWidth, canvasHeight, offsetX, offsetY, null);
        var dt = rt.getData(0, 0, canvasWidth, canvasHeight) as Uint8Array;
        var imgdata = new ImageData(canvasWidth, canvasHeight);;	//创建空的imagedata。因为下面要翻转，所以不直接设置内容
        //翻转getData的结果。
        var lineLen = canvasWidth * 4;
        var dst = imgdata.data;
        var y = canvasHeight - 1;
        var off = y * lineLen;
        var srcoff = 0;
        for (; y >= 0; y--) {
            dst.set(dt.subarray(srcoff, srcoff + lineLen), off);
            off -= lineLen;
            srcoff += lineLen;
        }
        //imgdata.data.set(dt);
        //画到2d画布上
        var canv = new HTMLCanvas(true);
        canv.size(canvasWidth, canvasHeight);
        var ctx2d = <CanvasRenderingContext2D>(canv.getContext('2d') as any);
        ctx2d.putImageData(imgdata, 0, 0);
        rt.destroy();
        return canv;
    }

    /**
     * @deprecated
     * @en Draws the current object to a Texture object.
     * @param canvasWidth The width of the canvas.
     * @param canvasHeight The height of the canvas.
     * @param offsetX The X-axis offset for drawing.
     * @param offsetY The Y-axis offset for drawing.
     * @param rt The render target.
     * @param isDrawRenderRect A boolean indicating whether to draw the render rectangle. When true, it starts drawing from (0,0) of the render texture and subtracts the offset of the cache rectangle. When false, it keeps the sprite's original relative position for drawing.
     * @returns The drawn Texture or RenderTexture2D object.
     * @zh 绘制当前对象到一个 Texture 对象上。
     * @param canvasWidth 画布宽度。
     * @param canvasHeight 画布高度。
     * @param offsetX 绘制的 X 轴偏移量。
     * @param offsetY 绘制的 Y 轴偏移量。
     * @param rt 渲染目标。
     * @param isDrawRenderRect 表示是否绘制渲染矩形。为 true 时，从渲染纹理的(0,0)点开始绘制，但要减去缓存矩形的偏移；为 false 时，保持精灵的原始相对位置进行绘制。
     * @returns 绘制的 Texture 或 RenderTexture2D 对象。
     */
    drawToTexture(canvasWidth: number, canvasHeight: number, offsetX: number, offsetY: number, rt: RenderTexture2D | null = null, isDrawRenderRect: boolean = true): Texture | RenderTexture2D {
        let res = Sprite.drawToTexture(this, canvasWidth, canvasHeight, offsetX, offsetY, rt, isDrawRenderRect);
        return res;
    }

    /**
     * @deprecated
     * @ignore
     * @en Draws the specified Sprite to a Texture or RenderTexture2D object.
     * @param sprite The Sprite to draw.
     * @param canvasWidth The width of the canvas.
     * @param canvasHeight The height of the canvas.
     * @param offsetX The X-axis offset for drawing.
     * @param offsetY The Y-axis offset for drawing.
     * @param rt The render target. If not provided, a new RenderTexture2D will be created.
     * @param isDrawRenderRect A boolean indicating whether to draw the render rectangle. When true, it starts drawing from (0,0) of the render texture and subtracts the offset of the cache rectangle. When false, it keeps the sprite's original relative position for drawing.
     * @returns The drawn Texture or RenderTexture2D object.
     * @zh 将指定的 Sprite 绘制到 Texture 或 RenderTexture2D 对象上。
     * @param sprite 要绘制的 Sprite。
     * @param canvasWidth 画布宽度。
     * @param canvasHeight 画布高度。
     * @param offsetX 绘制的 X 轴偏移量。
     * @param offsetY 绘制的 Y 轴偏移量。
     * @param rt 渲染目标。如果未提供,将创建一个新的 RenderTexture2D。
     * @param isDrawRenderRect 表示是否绘制渲染矩形。为 true 时，从渲染纹理的(0,0)点开始绘制，但要减去缓存矩形的偏移；为 false 时，保持精灵的原始相对位置进行绘制。
     * @returns 绘制的 Texture 或 RenderTexture2D 对象。
     */
    static drawToTexture(sprite: Sprite, canvasWidth: number, canvasHeight: number, offsetX: number, offsetY: number, rt: RenderTexture2D | null = null, isDrawRenderRect: boolean = true): Texture | RenderTexture2D {
        let renderout = rt || new RenderTexture2D(canvasWidth, canvasHeight, RenderTargetFormat.R8G8B8A8);
        let ctx = new Context();
        if (rt) {
            ctx.size(rt.width, rt.height);
        } else {
            ctx.size(canvasWidth, canvasHeight)
        }
        ctx.render2D = ctx.render2D.clone(null);//这个ctx只是提供大小，所以不要设置rt
        let outrt = RenderSprite.RenderToRenderTexture(sprite, ctx, offsetX, offsetY, renderout, isDrawRenderRect);
        ctx._drawingToTexture = false;
        ctx.destroy();
        if (!rt) {
            let outTexture = new Texture(outrt, Texture.INV_UV);
            return outTexture;
        }
        return outrt;
    }

    /**
     * @en Draws the current object to a RenderTexture2D object.
     * @param canvasWidth The width of the canvas.
     * @param canvasHeight The height of the canvas.
     * @param offsetX The X-axis offset for drawing.
     * @param offsetY The Y-axis offset for drawing.
     * @param rt The render target.
     * @param isDrawRenderRect A boolean indicating whether to draw the render rectangle. When true, it starts drawing from (0,0) of the render texture and subtracts the offset of the cache rectangle. When false, it keeps the sprite's original relative position for drawing.
     * @param flipY Optional. If true, the texture will be flipped vertical. Default is false.
     * @returns The drawn RenderTexture2D object.
     * @zh 绘制当前对象到一个 Texture 对象上。
     * @param canvasWidth 画布宽度。
     * @param canvasHeight 画布高度。
     * @param offsetX 绘制的 X 轴偏移量。
     * @param offsetY 绘制的 Y 轴偏移量。
     * @param rt 渲染目标。
     * @param isDrawRenderRect 表示是否绘制渲染矩形。为 true 时，从渲染纹理的(0,0)点开始绘制，但要减去缓存矩形的偏移；为 false 时，保持精灵的原始相对位置进行绘制。
     * @param flipY 可选。如果为 true，则垂直翻转纹理。默认为 false。
     * @returns 绘制的 RenderTexture2D 对象。
     */
    drawToRenderTexture2D(canvasWidth: number, canvasHeight: number, offsetX: number, offsetY: number, rt: RenderTexture2D | null = null, isDrawRenderRect: boolean = true, flipY: boolean = false): RenderTexture2D {
        let res = Sprite.drawToRenderTexture2D(this, canvasWidth, canvasHeight, offsetX, offsetY, rt, isDrawRenderRect, flipY);
        return res;
    }

    /**
     * @ignore
     * @en Draws the specified Sprite to a RenderTexture2D object.
     * @param sprite The Sprite to draw.
     * @param canvasWidth The width of the canvas.
     * @param canvasHeight The height of the canvas.
     * @param offsetX The X-axis offset for drawing.
     * @param offsetY The Y-axis offset for drawing.
     * @param rt The render target. If not provided, a new RenderTexture2D will be created.
     * @param isDrawRenderRect A boolean indicating whether to draw the render rectangle. When true, it starts drawing from (0,0) of the render texture and subtracts the offset of the cache rectangle. When false, it keeps the sprite's original relative position for drawing.
     * @param flipY Optional. If true, the texture will be flipped vertical. Default is false.
     * @returns The drawn RenderTexture2D object.
     * @zh 将指定的 Sprite 绘制到 RenderTexture2D 对象上。
     * @param sprite 要绘制的 Sprite。
     * @param canvasWidth 画布宽度。
     * @param canvasHeight 画布高度。
     * @param offsetX 绘制的 X 轴偏移量。
     * @param offsetY 绘制的 Y 轴偏移量。
     * @param rt 渲染目标。如果未提供,将创建一个新的 RenderTexture2D。
     * @param isDrawRenderRect 表示是否绘制渲染矩形。为 true 时，从渲染纹理的(0,0)点开始绘制，但要减去缓存矩形的偏移；为 false 时，保持精灵的原始相对位置进行绘制。
     * @param flipY 可选。如果为 true，则垂直翻转纹理。默认为 false。
     * @returns 绘制的 RenderTexture2D 对象。
     */
    static drawToRenderTexture2D(sprite: Sprite, canvasWidth: number, canvasHeight: number, offsetX: number, offsetY: number, rt: RenderTexture2D | null = null, isDrawRenderRect: boolean = true, flipY: boolean = false): RenderTexture2D {
        let renderout = rt || new RenderTexture2D(canvasWidth, canvasHeight, RenderTargetFormat.R8G8B8A8);
        let ctx = new Context();
        if (rt) {
            ctx.size(rt.width, rt.height);
        } else {
            ctx.size(canvasWidth, canvasHeight)
        }
        ctx.render2D = ctx.render2D.clone(renderout);
        ctx._drawingToTexture = true;
        if (flipY) renderout._invertY = true;//翻转纹理
        let outrt = RenderSprite.RenderToRenderTexture(sprite, ctx, offsetX, offsetY, renderout, isDrawRenderRect);
        ctx.destroy();
        return outrt;
    }

    /**
     * 绘制到Canvas的上下文
     */
    static drawtocanvCtx: Context;

    /**
     * @en Custom update and render display objects. Generally used to extend rendering modes. Please use it reasonably as it may cause inability to render on accelerators.
     * Note: Do not add or remove tree nodes in this function, otherwise it will affect the traversal of tree nodes.
     * @param context The rendering context reference.
     * @param x The X-axis coordinate.
     * @param y The Y-axis coordinate.
     * @zh 自定义更新、呈现显示对象。一般用来扩展渲染模式,请合理使用,可能会导致在加速器上无法渲染。
     * 注意: 不要在此函数内增加或删除树节点,否则会对树节点遍历造成影响。
     * @param context 渲染的上下文引用。
     * @param x X轴坐标。
     * @param y Y轴坐标。
     */
    customRender(context: Context, x: number, y: number): void {
        //_renderType |= SpriteConst.CUSTOM;
        this._repaint = SpriteConst.REPAINT_ALL;
    }

    /**
     * @internal
     * @en Apply filters.
     * @zh 应用滤镜。
     */
    _applyFilters(): void {
        // canvas 模式不支持
    }

    /**
     * @en The filter collection. Multiple filters can be combined.
     * @zh 滤镜集合。可以设置多个滤镜组合。
     */
    get filters(): Filter[] {
        return this._filterArr;
    }

    set filters(value: Filter[]) {
        value && value.length === 0 && (value = null);

        //先去掉旧的事件监听
        if (this._filterArr) {
            for (let f of this._filterArr) {
                f && f.off(Filter.EVENT_CHANGE, this, this.repaint);
            }
        }
        this._filterArr = value ? value.slice() : null;
        if (value) {
            for (let f of value) {
                f && f.on(Filter.EVENT_CHANGE, this, this.repaint);
            }
        }
        if (value)
            this._renderType |= SpriteConst.FILTERS;
        else
            this._renderType &= ~SpriteConst.FILTERS;

        if (value && value.length > 0) {
            if (!this._getBit(NodeFlags.DISPLAY)) this._setBitUp(NodeFlags.DISPLAY);
        }
        this.repaint();
    }

    /**
     * @en Converts the local coordinates to the global coordinates relative to the stage.
     * @param point The local coordinate point.
     * @param createNewPoint (Optional) Whether to create a new Point object as the return value. The default is false, which uses the input point object as the return value to reduce object creation overhead.
     * @param globalNode The global node, default is Laya.stage 
     * @return The converted global coordinate point.
     * @zh 把本地坐标转换为相对stage的全局坐标。
     * @param point 本地坐标点。
     * @param createNewPoint （可选）是否创建一个新的Point对象作为返回值，默认为false，使用输入的point对象返回，减少对象创建开销。
     * @param globalNode global节点，默认为Laya.stage 
     * @return 转换后的坐标的点。
     */
    localToGlobal(point: Point, createNewPoint: boolean = false, globalNode: Sprite | null = null): Point {
        //if (!_displayedInStage || !point) return point;
        if (createNewPoint === true) {
            point = new Point(point.x, point.y);
        }
        var ele: Sprite = this;
        globalNode = globalNode || ILaya.stage;
        while (ele && !ele._destroyed) {
            if (ele == globalNode) break;
            point = ele.toParentPoint(point);
            ele = (<Sprite>ele.parent);
        }

        return point;
    }

    /**
     * @en Converts the global coordinates relative to the stage to the local coordinates.
     * @param point The global coordinate point.
     * @param createNewPoint (Optional) Whether to create a new Point object as the return value. The default is false, which uses the input point object as the return value to reduce object creation overhead.
     * @param globalNode The global node, default is Laya.stage.
     * @return The converted local coordinate point.
     * @zh 把stage的全局坐标转换为本地坐标。
     * @param point 全局坐标点。
     * @param createNewPoint （可选）是否创建一个新的Point对象作为返回值，默认为false，使用输入的point对象返回，减少对象创建开销。
     * @param globalNode global节点，默认为Laya.stage。
     * @return 转换后的坐标的点。
     */
    globalToLocal(point: Point, createNewPoint: boolean = false, globalNode: Sprite | null = null): Point {
        //if (!_displayedInStage || !point) return point;
        if (createNewPoint) {
            point = new Point(point.x, point.y);
        }
        var ele: Sprite = this;
        var list: any[] = [];
        globalNode = globalNode || ILaya.stage;
        while (ele && !ele._destroyed) {
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
     * @en Converts the coordinates in the local coordinate system to the coordinates in the parent container coordinate system.
     * @param point The local coordinate point.
     * @return The converted point in the parent container coordinate system.
     * @zh 将本地坐标系坐标转换到父容器坐标系。
     * @param point 本地坐标点。
     * @return 转换后的点。
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
     * @en Converts the coordinates in the parent container coordinate system to the coordinates in the local coordinate system.
     * @param point The point in the parent container coordinate system.
     * @return The converted point in the local coordinate system.
     * @zh 将父容器坐标系坐标转换到本地坐标系。
     * @param point 父容器坐标点。
     * @return 转换后的点。
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
     * @internal
     * @protected
     * @en Starts listening to a specific event type. This method is called when a new event listener is added.
     * If it is a mouse event, it sets itself and its parent objects to accept mouse interaction events.
     * @param type The event type.
     * @zh 开始监听特定事件类型。当添加新的事件侦听器时调用此方法。
     * 如果是鼠标事件，则设置自己和父对象为可接受鼠标交互事件。
     * @param type 事件类型。
     */
    protected onStartListeningToType(type: string) {
        super.onStartListeningToType(type);

        if (this._mouseState !== 1 && Event.isMouseEvent(type)) {
            this.mouseEnabled = true;
            this._setBit(NodeFlags.HAS_MOUSE, true);
            if (this._parent) {
                this._onDisplay();
            }
        }
    }


    /**
    * @internal
    * @protected
    * @en Ensures that when the node is set to accept mouse interaction events, all parent objects are also set to accept mouse interaction events.
    * @zh 当节点设置为接受鼠标交互事件时，确保所有父对象也被设置为接受鼠标交互事件。
    */
    protected _onDisplay(v?: boolean): void {
        if (this._mouseState !== 1) {
            var ele: Sprite = this;
            ele = (<Sprite>ele.parent);
            while (ele && ele._mouseState !== 1) {
                if (ele._getBit(NodeFlags.HAS_MOUSE)) break;
                ele.mouseEnabled = true;
                ele._setBit(NodeFlags.HAS_MOUSE, true);
                ele = (<Sprite>ele.parent);
            }
        }
    }

    /**
     * @internal
     * @protected 
     * @override
     * @en Set the parent node of the current node.
     * @param value The new parent node.
     * @zh 设置当前节点的父节点。
     * @param value 新的父节点。
     */
    protected _setParent(value: Node): void {
        super._setParent(value);
        if (value && this._getBit(NodeFlags.HAS_MOUSE)) {
            this._onDisplay();
        }
    }

    /**
     * @en Load and display an image. Equivalent to loading the image and then setting the texture property. Note: calling this method multiple times will only display one image.
     * @param url The image URL.
     * @param complete (Optional) The callback function when loading is complete.
     * @returns Returns the Sprite object itself.
     * @zh 加载并显示一个图片。相当于加载图片后，设置texture属性。注意：多次调用，只会显示一个图片。
     * @param url 图片地址。
     * @param complete （可选）加载完成回调。
     * @returns 返回精灵对象本身。
     */
    loadImage(url: string, complete: Handler = null): Sprite {
        if (!url) {
            this.texture = null;
            this.repaint(SpriteConst.REPAINT_ALL);
            complete && complete.run();
        } else {
            let tex = ILaya.loader.getRes(url);
            if (tex) {
                this.texture = tex;
                this.repaint(SpriteConst.REPAINT_ALL);
                complete && complete.run();
            }
            else {
                if (this._skinBaseUrl)
                    url = URL.formatURL(url, this._skinBaseUrl);
                ILaya.loader.load(url).then((tex: Texture) => {
                    this.texture = tex;
                    this.repaint(SpriteConst.REPAINT_ALL);
                    complete && complete.run();
                });
            }
        }
        return this;
    }

    /**
     * @en Create a new `Sprite` object based on the image URL to load and display the image.
     * @param url The image URL.
     * @returns Returns a new `Sprite` object.
     * @zh 根据图片地址创建一个新的 `Sprite` 对象用于加载并显示此图片。
     * @param url 图片地址。
     * @returns 返回新的 `Sprite`  对象。
     */
    static fromImage(url: string): Sprite {
        return new Sprite().loadImage(url);
    }

    /**
    * @en Redraw the Sprite and invalidate its own and parent's cache after setting cacheAs.
    * @param type The redraw type.
    * @zh 重新绘制，cacheAs后，设置自己和父对象缓存失效。
    * @param type 重新绘制类型。
    */
    repaint(type: number = SpriteConst.REPAINT_CACHE): void {
        if (!(this._repaint & type)) {
            this._repaint |= type;
            this.parentRepaint(type);
        }
        this._getCacheStyle();
        if (this._cacheStyle) {
            this._cacheStyle.renderTexture = null;//TODO 重用
        }
        if (this._cacheStyle && this._cacheStyle.maskParent) {
            this._cacheStyle.maskParent.repaint(type);
        }
    }


    /**
     * @internal
     * @en Check if it is re-cached.
     * @returns True if it is re-cached, otherwise false.
     * @zh 检查是否重新缓存。
     * @returns 如果重新缓存值为 true，否则值为 false。
     */
    _needRepaint(): boolean {
        //return (this._repaint & SpriteConst.REPAINT_CACHE) && this._cacheStyle.enableCanvasRender && this._cacheStyle.reCache;
        return !!(this._repaint & SpriteConst.REPAINT_CACHE);
    }

    /**
    * @internal
    * @protected
    * @override
    * @en Callback when a child node changes.
    * @param child The child node that has changed.
    * @zh 子节点发生变化时的回调。
    * @param child 发生变化的子节点。
    */
    protected _childChanged(child: Node = null): void {
        super._childChanged(child);

        if (this._children.length) this._renderType |= SpriteConst.CHILDS;
        else this._renderType &= ~SpriteConst.CHILDS;
        if (child && this._getBit(NodeFlags.HAS_ZORDER)) ILaya.systemTimer.callLater(this, this.updateZOrder);
        this.repaint(SpriteConst.REPAINT_ALL);
    }

    /**
     * @override
     * @en Repaint the parent node. When `cacheAs` is enabled, set all parent object caches to invalid.
     * @param type The type of repaint. Default is SpriteConst.REPAINT_CACHE.
     * @zh 重新绘制父节点。启用 `cacheAs` 时，设置所有父对象缓存失效。
     * @param type 重新绘制类型。默认为 SpriteConst.REPAINT_CACHE。
     */
    parentRepaint(type: number = SpriteConst.REPAINT_CACHE): void {
        var p: Sprite = <Sprite>this._parent;
        if (p && !(p._repaint & type)) {
            p._repaint |= type;
            p.parentRepaint(type);
        }
    }

    /** 
     * @en Reference to the stage.
     * @zh 对舞台的引用。
     */
    get stage(): Stage {
        return ILaya.stage;
    }

    /**
     * @enYou can set a rectangular area as the clickable region, or set a HitArea instance as the clickable region. The HitArea can have both clickable and non-clickable areas defined. If the hitArea is not set, the mouse collision detection will be based on the area formed by the width and height of the object.
     * @zh 可以设置一个矩形区域作为点击区域，或者设置一个 `HitArea` 实例作为点击区域，HitArea 内可以设置可点击和不可点击区域。如果不设置 hitArea，则根据宽高形成的区域进行鼠标碰撞检测。
     */
    get hitArea(): IHitArea {
        return this._style.hitArea;
    }

    set hitArea(value: IHitArea) {
        this.getStyle().hitArea = value;
    }

    /**@internal */
    _setMask(value: Sprite): void {

    }

    /**
     * @en Masking allows setting an object (bitmap or vector graphic) as a mask, displaying content based on the object's shape. 
     * @zh 遮罩，可以设置一个对象（支持位图和矢量图），根据对象形状进行遮罩显示。
     */
    get mask(): Sprite {
        return this._cacheStyle.mask;
    }

    set mask(value: Sprite) {
        if (value == this || (value && this.mask == value && value._cacheStyle.maskParent == this))
            return;

        if (this.mask)
            this.mask._getCacheStyle().maskParent = null;

        this._getCacheStyle().mask = value;
        this._setMask(value);
        //this._checkCanvasEnable();

        if (value) {
            value._getCacheStyle().maskParent = this;
            this._renderType |= SpriteConst.MASK;
        }
        else
            this._renderType &= ~SpriteConst.MASK;
        this.repaint();
    }

    /**
     * @en Indicates whether the object receives mouse events.
     * The default is false. If you listen to mouse events, this value and the value of mouseEnable for parent nodes will be automatically set to true (unless the parent node is manually set to false).
     * @zh 是否接受鼠标事件。
     * 默认为 false，如果监听鼠标事件，则会自动设置本对象及父节点的属性 mouseEnable 的值都为 true（如果父节点手动设置为 false，则不会更改）。
     */
    get mouseEnabled(): boolean {
        return this._mouseState > 1;
    }

    set mouseEnabled(value: boolean) {
        this._mouseState = value ? 2 : 1;
    }

    /**
     * @en Starts dragging this object.
     * @param area (Optional) The drag area, which is the active area of the object's registration point (excluding the object's width and height).
     * @param hasInertia (Optional) Whether the object has inertia when the mouse is released. The default is false.
     * @param elasticDistance (Optional) The distance value of the elastic effect. A value of 0 means no elastic effect. The default is 0.
     * @param elasticBackTime (Optional) The bounce-back time for the elastic effect in milliseconds. The default is 300 milliseconds.
     * @param data (Optional) The data carried by the drag event. 
     * @param ratio (Optional) The inertia damping coefficient, which affects the strength and duration of inertia.
     * @zh 开始拖动此对象。
     * @param area				（可选）拖动区域，此区域为当前对象注册点活动区域（不包括对象宽高） 。
     * @param hasInertia		（可选）鼠标松开后，是否还惯性滑动，默认为false。
     * @param elasticDistance	（可选）橡皮筋效果的距离值，0为无橡皮筋效果，默认为0。
     * @param elasticBackTime	（可选）橡皮筋回弹时间，单位为毫秒，默认为300毫秒。
     * @param data				（可选）拖动事件携带的数据。
     * @param ratio				（可选）惯性阻尼系数，影响惯性力度和时长。
     */
    startDrag(area: Rectangle = null, hasInertia: boolean = false, elasticDistance: number = 0, elasticBackTime: number = 300, data: any = null, ratio: number = 0.92): void {
        this._style.dragging || (this.getStyle().dragging = new Dragging());
        this._style.dragging.start(this, area, hasInertia, elasticDistance, elasticBackTime, data, ratio);
    }

    /**
     * @en Stops dragging this object.
     * @zh 停止拖动此对象。
     */
    stopDrag(): void {
        this._style.dragging && this._style.dragging.stop();
    }

    /**
     * @internal
     * @override
     * @en Set the display status of the node.
     * @param value The display status.
     * @zh 设置节点的显示状态。
     * @param value 显示状态。
     */
    _setDisplay(value: boolean): void {
        this._getCacheStyle();
        if (!value) {
            this._cacheStyle.onInvisible();
        }
        super._setDisplay(value);
    }

    /**
     * @en Checks whether a point is within this object.
     * @param x Global x-coordinate.
     * @param y Global y-coordinate.
     * @returns Indicates whether the point is inside the object.
     * @zh 检测某个点是否在此对象内。
     * @param x 全局x坐标。
     * @param y 全局y坐标。
     * @returns 表示是否在对象内。
     */
    hitTestPoint(x: number, y: number): boolean {
        var point: Point = this.globalToLocal(Point.TEMP.setTo(x, y));
        x = point.x;
        y = point.y;
        var rect: IHitArea = this._style.hitArea ? this._style.hitArea : (this._isWidthSet && this._isHeightSet) ? Rectangle.TEMP.setTo(0, 0, this._width, this._height) : this.getSelfBounds();
        return rect.contains(x, y, this);
    }

    /**
     * @en Get the mouse coordinates relative to this object.
     * @returns The screen point information.
     * @zh 获得相对于本对象上的鼠标坐标信息。
     * @returns 屏幕点信息。
     */
    getMousePoint(): Point {
        return this.globalToLocal(Point.TEMP.setTo(ILaya.stage.mouseX, ILaya.stage.mouseY));
    }
    /**
     * @en The X-axis coordinate of the mouse in this object's coordinate system.
     * @zh 鼠标在此对象坐标系上的 X 轴坐标信息。
     */
    get mouseX(): number {
        return this.getMousePoint().x;
    }

    /**
     * @en The Y-axis coordinate of the mouse in this object's coordinate system.
     * @zh 鼠标在此对象坐标系上的 Y 轴坐标信息。
     */
    get mouseY(): number {
        return this.getMousePoint().y;
    }

    /**
     * @en The z-order. If this value is changed, all objects of the same container will be re-sorted according to the value. The larger the value, the higher it is. The default is 0, which is sorted according to the order of addition.
     * @zh z排序，更改此值，则会按照值的大小对同一容器的所有对象重新排序。值越大，越靠上。默认为0，则根据添加顺序排序。
     */
    get zOrder(): number {
        return this._zOrder;
    }

    set zOrder(value: number) {
        if (this._zOrder != value) {
            this._zOrder = value;
            if (this._parent) {
                value && this._parent._setBit(NodeFlags.HAS_ZORDER, true);
                ILaya.systemTimer.callLater(this._parent, this.updateZOrder);
            }
        }
    }

    /**
     * @en Set a Texture instance and display the image (if there are other drawings before, it will be cleared).
     * Equivalent to graphics.clear();graphics.drawImage(), but with better performance.
     * You can also assign an image address, which will automatically load the image and then display it.
     * @zh 设置一个Texture实例，并显示此图片（如果之前有其他绘制，则会被清除掉）。
     * 等同于graphics.clear();graphics.drawImage()，但性能更高。
     * 还可以赋值一个图片地址，则会自动加载图片，然后显示。
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
            this._setWidth(this.width);
            this._setHeight(this.height);
            if (value) this._renderType |= SpriteConst.TEXTURE;
            else this._renderType &= ~SpriteConst.TEXTURE;
            this.repaint();
        }
    }




    /**@internal */
    _setTranformChange(): void {
        this._tfChanged = true;
        this._renderType |= SpriteConst.TRANSFORM;
        this.parentRepaint(SpriteConst.REPAINT_CACHE);
        this._notifyTransChangedEvent();
    }

    /**
     * @en Draw call optimization: when set to true, draw call optimization is enabled. During engine rendering, all text is automatically brought to the top layer to avoid interruptions by text when drawing images from the same atlas, thus reducing the number of draw calls.
     * Enabling this will cause text to be non-obstructable. Use this feature cautiously if your project requires text to be obstructed.
     * @zh 绘制调用优化，为true时，开启drawcall优化。引擎绘制时自动将所有文本提到显示最上层，避免同一个图集内的图像绘制时被文本打断，可以减少drawcall数量。
     * 开启后，会导致文本无法被遮挡，存在文本遮挡需求的项目，请谨慎使用该功能。
     */
    set drawCallOptimize(value: boolean) {
        this._setBit(NodeFlags.DRAWCALL_OPTIMIZE, value);
    }

    get drawCallOptimize(): boolean {
        return this._getBit(NodeFlags.DRAWCALL_OPTIMIZE);
    }

    /**
     * @internal
     */
    onAfterDeserialize() {
        super.onAfterDeserialize();

        if (LayaEnv.isPlaying) {
            if ((<any>this)._gcmds) {
                this.graphics.cmds = (<any>this)._gcmds;
                delete (<any>this)._gcmds;
            }

            if ((<any>this)._filters) {
                this.filters = (<any>this)._filters;
                delete (<any>this)._filters;
            }
        }
    }


    //miner 为了不破坏之前的local性能架构，采用标致开启的方式来增加GlobalMode的更新系统，优化需要高频调用Global数据的
    //因为此块功能比较集中，顾单独写在下方
    /**@internal */
    static Sprite_GlobalDeltaFlage_Position_X: number = 0x01;
    /**@internal */
    static Sprite_GlobalDeltaFlage_Position_Y: number = 0x02;
    /**@internal */
    static Sprite_GlobalDeltaFlage_Rotation: number = 0x04;
    /**@internal */
    static Sprite_GlobalDeltaFlage_Scale_X: number = 0x08;
    /**@internal */
    static Sprite_GlobalDeltaFlage_Scale_Y: number = 0x10;
    /**@internal */
    static Sprite_GlobalDeltaFlage_Matrix: number = 0x20;
    /**@internal */
    static Sprite_GlobalTempMatrix: Matrix = new Matrix();
    /**@internal */
    private _globalDeltaFlages: number = 0;
    /**@internal */
    private _cacheGlobal: boolean = false;
    /**@internal */
    protected _transChangeNotify: boolean = false;
    /**@internal */
    private _globalPosx: number = 0.0;
    /**@internal */
    private _globalPosy: number = 0.0;
    /**@internal */
    private _globalRotate: number = 0.0;
    /**@internal */
    private _globalScalex: number = 1.0;
    /**@internal */
    private _globalScaley: number = 1.0;
    /**@internal */
    private _globalMatrix: Matrix;

    /**
     * @internal
     * @en cacheGlobal mode. This mode provides higher performance for the getGlobal property.
     * If this node's cacheGlobal is set to true, all parent nodes up to the root node will be forced to true.
     * If this node is set to false, all child nodes' cacheGlobal will be forced to false.
     * @zh cacheGlobal模式。此模式会获得更高的getGlobal属性性能。
     * 如果此节点的cacheGlobal设置为true，那所有父节点直到根节点都会被强制改为true。
     * 如果此节点设置为false，将强制所有子节点的cacheGlobal改为false。
     */
    get cacheGlobal(): boolean {
        return this._cacheGlobal;
    }

    set cacheGlobal(value: boolean) {
        if (this._cacheGlobal == value)
            return;
        this._cacheGlobal = value;
        if (value) {
            //缓存全局变量
            this._setGlobalCacheFlag(Sprite.Sprite_GlobalDeltaFlage_Position_X, true);
            this._setGlobalCacheFlag(Sprite.Sprite_GlobalDeltaFlage_Position_Y, true);
            this._setGlobalCacheFlag(Sprite.Sprite_GlobalDeltaFlage_Scale_X, true);
            this._setGlobalCacheFlag(Sprite.Sprite_GlobalDeltaFlage_Scale_Y, true);
            this._setGlobalCacheFlag(Sprite.Sprite_GlobalDeltaFlage_Rotation, true);
            this._setGlobalCacheFlag(Sprite.Sprite_GlobalDeltaFlage_Matrix, true);
            //更新父节点
            if (this._parent == ILaya.stage || !this._parent) {
                return;
            } else {
                (this._parent as Sprite).cacheGlobal = value;
            }
        } else {
            //更新子节点
            this._children.forEach(element => {
                (element as Sprite).cacheGlobal = value;
            });
        }
    }

    /**
     * @internal
     * 是否派发Trasform改动事件
     */
    public get transChangeNotify(): boolean {
        return this._transChangeNotify;
    }
    public set transChangeNotify(value: boolean) {
        if (this._transChangeNotify == value)
            return;
        this._transChangeNotify = value;
        if (value) {
            if (this._parent == ILaya.stage || !this._parent) {
                return;
            } else {
                (this._parent as Sprite).transChangeNotify = value;
            }
        } else {
            //更新子节点
            this._children.forEach(element => {
                (element as Sprite).transChangeNotify = value;
            });
        }
    }


    /**
     * @en Get the global matrix of the sprite.
     * @returns The global transformation matrix of the sprite.
     * @zh 获取精灵的全局矩阵。
     * @returns 精灵的全局变换矩阵。
     */
    getGlobalMatrix() {
        if (this._globalMatrix == null) this._globalMatrix = Matrix.create();
        //if (this.scene == null) { return this._globalMatrix; }
        if (this.cacheGlobal && !this._getGlobalCacheFlag(Sprite.Sprite_GlobalDeltaFlage_Matrix)) {
            return this._globalMatrix;
        } else {
            const style = this._style;
            this._globalMatrix.setMatrix(this._x, this._y, style.scaleX, style.scaleY, style.rotation, style.skewX, style.skewY, style.pivotX, style.pivotY);
            if (this.parent) {
                Matrix.mul(this._globalMatrix, (<Sprite>this.parent).getGlobalMatrix(), this._globalMatrix);
                 this._setGlobalCacheFlag(Sprite.Sprite_GlobalDeltaFlage_Matrix, false);
                this._syncGlobalFlag(Sprite.Sprite_GlobalDeltaFlage_Matrix, true);
            }

        }
        return this._globalMatrix;
    }

    /**
     * @internal
     * @en The global X position.
     * @zh 全局X位置。
     */
    set globalPosX(value: number) {
        this.setGlobalPos(value, this._globalPosy);
    }


    /**
     * @en Sets the global position of the node.
     * @param globalx The global X position.
     * @param globaly The global Y position.
     * @zh 设置节点对象在全局坐标系中的位置。
     * @param globalx 全局X位置。
     * @param globaly 全局Y位置。
     */
    setGlobalPos(globalx: number, globaly: number) {
        if (globalx == this.globalPosX && globaly == this.globalPosY) {
            return;
        }
        if (!this._cacheGlobal) {
            Point.TEMP.setTo(globalx, globaly);
            let point = this.globalToLocal(Point.TEMP, false, null);
            point = this.toParentPoint(point);
            this.x = point.x;
            this.y = point.y;
        } else {

            let point = (<Sprite>this.parent).getGlobalMatrix().invertTransformPoint(Point.TEMP.setTo(globalx, globaly));
            this._setX(point.x);
            this._setY(point.y);
            this._globalPosx = globalx;
            this._globalPosy = globaly;
            let flag = Sprite.Sprite_GlobalDeltaFlage_Position_X | Sprite.Sprite_GlobalDeltaFlage_Position_Y;
            this._setGlobalCacheFlag(flag, false);
            this._setGlobalCacheFlag(Sprite.Sprite_GlobalDeltaFlage_Matrix, true);
            this._syncGlobalFlag(flag | Sprite.Sprite_GlobalDeltaFlage_Matrix, true);
        }

    }

    /**
     * @en The X-axis position in global coordinates.
     * @zh 全局坐标中的 X 轴位置。
     */
    get globalPosX(): number {
        if (!this._cacheGlobal) {
            let point = this.localToGlobal(Point.TEMP.setTo(0, 0), false, null);
            return point.x;
        } else {
            this._cacheGlobalPos();
            return this._globalPosx;
        }
    }

    /**
     * @en The Y-axis position in global coordinates.
     * @zh 全局坐标中的 Y 轴位置。
     */
    get globalPosY(): number {
        if (!this._cacheGlobal) {
            let point = this.localToGlobal(Point.TEMP.setTo(0, 0), false, null);
            return point.y;
        } else {
            this._cacheGlobalPos();
            return this._globalPosy;
        }
    }
    /**
     * @internal
     * @en cache the global Position from global Matrix;
     * @zh 设置全局缓存坐标。
     */
    private _cacheGlobalPos() {
        if (this._getGlobalCacheFlag(Sprite.Sprite_GlobalDeltaFlage_Matrix | Sprite.Sprite_GlobalDeltaFlage_Position_Y || Sprite.Sprite_GlobalDeltaFlage_Position_X)) {
            this._setGlobalCacheFlag(Sprite.Sprite_GlobalDeltaFlage_Position_Y, false);
            this._setGlobalCacheFlag(Sprite.Sprite_GlobalDeltaFlage_Position_X, false);
            let p = this.getGlobalMatrix().transformPoint(Point.TEMP.setTo(this.pivotX, this.pivotY));
            this._globalPosx = p.x;
            this._globalPosy = p.y;
        }
    }

    private _cacheGlobalScale() {
        if (this._getGlobalCacheFlag(Sprite.Sprite_GlobalDeltaFlage_Matrix | Sprite.Sprite_GlobalDeltaFlage_Scale_X || Sprite.Sprite_GlobalDeltaFlage_Scale_Y)) {
            this._setGlobalCacheFlag(Sprite.Sprite_GlobalDeltaFlage_Scale_X, false);
            this._setGlobalCacheFlag(Sprite.Sprite_GlobalDeltaFlage_Scale_Y, false);
            let mat = this.getGlobalMatrix();
            this._globalScalex = mat.getScaleX();
            this._globalScaley = mat.getScaleY();
        }

    }

    /**
     * @en get the global position of the node.
     * @zh 获取节点对象在全局坐标系中的位置。
     * @param out 
     */
    getGlobalPos(out: Point) {
        if (!this._cacheGlobal) {
            this.localToGlobal(out.setTo(0, 0), false, null);
        } else {
            this._cacheGlobalPos();
            out.x = this._globalPosx;
            out.y = this._globalPosy;
        }
    }

    /**
     * @en global rotation value relative to the stage (this value includes the rotation of parent nodes).
     * @zh 相对于stage的全局旋转值（会叠加父亲节点的旋转值）。
     */
    get globalRotation(): number {
        if (!this._cacheGlobal) {
            //循环算法
            var angle: number = 0;
            var ele: Sprite = this;
            while (ele) {
                if (ele === this.scene) break;
                angle += ele.rotation;
                ele = (<Sprite>ele.parent);
            }
            return angle;
        } else {
            if (this._getGlobalCacheFlag(Sprite.Sprite_GlobalDeltaFlage_Rotation)) {
                this._setGlobalCacheFlag(Sprite.Sprite_GlobalDeltaFlage_Rotation, false);
                if (this._parent == this.scene || !this._parent)
                    this._globalRotate = this.rotation;
                else {
                    this._globalRotate = this.rotation + (this.parent as Sprite).globalRotation;
                }
            }
            return this._globalRotate;
        }
    }

    set globalRotation(value: number) {
        if (value == this.globalRotation) {
            return;
        }
        //set local
        if (this._parent == this.scene || !this._parent) {
            this._setRotation(value);
            this._setTranformChange();
        } else {
            this._setRotation(value - (this.parent as Sprite).globalRotation);
            this._setTranformChange();
        }
        if (this._cacheGlobal) {
            this._globalRotate = value;
            this._setGlobalCacheFlag(Sprite.Sprite_GlobalDeltaFlage_Rotation, false);
            this._setGlobalCacheFlag(Sprite.Sprite_GlobalDeltaFlage_Matrix, true);
            this._syncGlobalFlag(Sprite.Sprite_GlobalDeltaFlage_Matrix, true);
        }
    }

    /**
     * @en Gets the global X-axis scale relative to the stage (this value includes the scaling of parent nodes).
     * @returns The global X-axis scale.
     * @zh 获得相对于stage的全局X轴缩放值（会叠加父亲节点的缩放值）。
     * @returns 全局X轴缩放值。
     */
    get globalScaleX(): number {
        if (!this._cacheGlobal) {
            var scale: number = 1;
            var ele: Sprite = this;
            while (ele) {
                if (ele === ILaya.stage) break;
                scale *= ele.scaleX;
                ele = (<Sprite>ele.parent);
            }
            return scale;
        } else {
            this._cacheGlobalScale();
            return this._globalScalex;
        }
    }

    /**
     * @en Gets the global Y-axis scale relative to the stage (this value includes the scaling of parent nodes).
     * @returns The global Y-axis scale.
     * @zh 获得相对于stage的全局Y轴缩放值（会叠加父亲节点的缩放值）。
     * @returns 全局Y轴缩放值。
     */
    get globalScaleY(): number {
        if (!this._cacheGlobal) {
            var scale: number = 1;
            var ele: Sprite = this;
            while (ele) {
                if (ele === ILaya.stage) break;
                scale *= ele.scaleY;
                ele = (<Sprite>ele.parent);
            }
            return scale;
        } else {
            this._cacheGlobalScale();
            return this._globalScaley;
        }
    }

    /**
     * @internal
     */
    _getGlobalCacheFlag(type: number): boolean {
        return (this._globalDeltaFlages & type) != 0;
    }


    /**
     * @internal 
     */
    _getGlobalCacheLocalToGlobal(x: number, y: number): Point {
        if (this._cacheGlobal) {
            return this.getGlobalMatrix().transformPoint(Point.TEMP.setTo(this.pivotX + x, this.pivotY + y));
        } else {
            return this.localToGlobal(Point.TEMP.setTo(x, y), false, null);
        }
    }

    /**
     * @internal 
     */
    _getGlobalCacheGlobalToLocal(x: number, y: number): Point {
        if (this._cacheGlobal) {
            let point = this.getGlobalMatrix().invertTransformPoint(Point.TEMP.setTo(x, y));
            point.x -= this.pivotX;
            point.y -= this.pivotY;
            return point;
        } else {
            return this.globalToLocal(Point.TEMP.setTo(x, y), false, null);
        }
    }

    /**
    * @internal 
    * @en Sets a global cache flag for a specific type.
    * @param type The type of cache flag to set.
    * @param value Whether to enable the cache flag.
    * @zh 设置特定类型的全局缓存标志。
    * @param type 要设置的缓存标志类型。
    * @param value 是否启用缓存标志。
    */
    protected _setGlobalCacheFlag(type: number, value: boolean): void {
        if (value)
            this._globalDeltaFlages |= type;
        else
            this._globalDeltaFlages &= ~type;
        if (value) {
            this.event("GlobaChange", type)
        }
    }

    /**
    * @internal 
    */
    get globalDeltaFlages(): number {
        return this._globalDeltaFlages;
    }

    /**
     * @internal
     * @param flag 
     * @param value 
     */
    protected _syncGlobalFlag(flag: number, value: boolean) {
        if (this.cacheGlobal) {
            this._children.forEach(element => {
                (element as Sprite)._setGlobalCacheFlag(flag, value);
                (element as Sprite)._syncGlobalFlag(flag, value);
            });
        }
    }
}