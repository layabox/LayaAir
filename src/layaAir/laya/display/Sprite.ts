import { ILaya } from "../../ILaya";
import { NodeFlags, SUBPASSFLAG } from "../Const";
import { Filter } from "../legacy/filters/Filter";
import { GrahamScan } from "../maths/GrahamScan";
import { Matrix } from "../maths/Matrix";
import { Point } from "../maths/Point";
import { Rectangle } from "../maths/Rectangle";
import { HTMLCanvas } from "../resource/HTMLCanvas";
import { Texture } from "../resource/Texture";
import { Handler } from "../utils/Handler";
import { CacheStyle } from "./css/CacheStyle";
import { Graphics } from "./Graphics";
import { Node } from "./Node";
import { SpriteConst, TransformKind } from "./SpriteConst";
import { RenderTexture2D } from "../resource/RenderTexture2D";
import { Event } from "../events/Event";
import { DragSupport } from "../utils/DragSupport";
import { URL } from "../net/URL";
import { LayaEnv } from "../../LayaEnv";
import { SpriteUtils } from "../utils/SpriteUtils";
import { IHitArea } from "../utils/IHitArea";
import type { Material } from "../resource/Material";
import { RenderTargetFormat } from "../RenderEngine/RenderEnum/RenderTargetFormat";
import { BaseRenderNode2D } from "../NodeRender2D/BaseRenderNode2D";
import { Component } from "../components/Component";
import { SpriteGlobalTransform } from "./SpriteGlobaTransform";
import { IRenderStruct2D } from "../RenderDriver/RenderModuleData/Design/2D/IRenderStruct2D";
import { LayaGL } from "../layagl/LayaGL";
import { ShaderData } from "../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { Vector3 } from "../maths/Vector3";
import { IRender2DPass } from "../RenderDriver/RenderModuleData/Design/2D/IRender2DPass";
import { BlendMode, BlendModeHandler } from "../webgl/canvas/BlendMode";

import { Stat } from "../utils/Stat";
import { Scene } from "./Scene";
import { GraphicsRenderData, SubStructRender } from "./Scene2DSpecial/GraphicsUtils";
import { PostProcess2D } from "./PostProcess2D";
import { Render2DProcessor } from "./Render2DProcessor";
import { Color } from "../maths/Color";


const hiddenBits = NodeFlags.FORCE_HIDDEN | NodeFlags.NOT_IN_PAGE;

/**
 * @en Sprite is a basic display list node for displaying graphical content. By default, Sprite does not accept mouse events. Through the graphics API, images or vector graphics can be drawn, supporting operations like rotation, scaling, translation, and more. Sprite also functions as a container class, allowing the addition of multiple child nodes.
 * @zh Sprite是基本的显示图形的显示列表节点。Sprite默认不接受鼠标事件。通过graphics可以绘制图片或者矢量图，支持旋转，缩放，位移等操作。Sprite同时也是容器类，可用来添加多个子节点。
 */
export class Sprite extends Node {
    /**
     * @internal 
     */
    _x: number = 0;
    /**
     * @internal 
     */
    _y: number = 0;
    /**
     * @internal
     */
    _width: number = 0;
    /**
     * @internal
     */
    _height: number = 0;
    /**
     * @internal
     * @en Horizontal scaling
     * @zh 水平缩放
     */
    _scaleX: number = 1;
    /**
     * @internal
     * @en Vertical scaling
     * @zh 垂直缩放
     */
    _scaleY: number = 1;
    /**
     * @internal
     * @en Horizontal skew angle
     * @zh 水平倾斜角度
     */
    _skewX: number = 0;
    /**
     * @internal
     * @en Vertical skew angle
     * @zh 垂直倾斜角度
     */
    _skewY: number = 0;
    /**
     * @internal
     * @en X-axis pivot point
     * @zh X轴心点
     */
    _pivotX: number = 0;
    /**
     * @internal
     * @en Y-axis pivot point
     * @zh Y轴心点
     */
    _pivotY: number = 0;
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
    /**
     * @internal
     * @en Rotation angle
     * @zh 旋转角度
     */
    _rotation: number = 0;
    /**
     * @internal
     * @en Transparency
     * @zh 透明度
     */
    _alpha: number = 1;
    /**
     * @internal
     * @en Scroll area
     * @zh 滚动区域
     */
    _scrollRect: Rectangle;
    /**
     * @internal
     * @en Viewport
     * @zh 视口
     */
    _viewport: Rectangle;
    /**
     * @internal
     * @en Hit area
     * @zh 点击区域
     */
    _hitArea: IHitArea;
    /**
     * @internal
     * @en Dragging
     * @zh 滑动
     */
    _dragSupport: DragSupport;
    /**
     * @internal
     * @en Blend mode
     * @zh 混合模式
     */
    _blendMode: BlendMode = BlendMode.Invalid;
    /**
     * @internal
    */
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
    /**
     * @internal 
     */
    _zIndex: number = 0;
    /**
     * @internal 
     */
    _transform: Matrix;
    /**
     * @internal 
     */
    private _globalTrans: SpriteGlobalTransform;

    //以下变量为系统调用，请不要直接使用

    /**@internal */
    _renderType: number = 0;
    /**@internal */
    _cacheStyle: CacheStyle = CacheStyle.EMPTY;
    /**@internal */
    _graphics: Graphics;
    /**@internal */
    _renderNode: BaseRenderNode2D;
    /**@internal */
    _struct: IRenderStruct2D;

    /**@internal */
    _subpassUpdateFlag: number;
    /**
     * @en For non-UI component display object nodes (container objects or display objects without image resources), specifies whether the mouse events penetrate this object's collision detection. `true` means the object is penetrable, `false` means it is not penetrable.
     * When penetrable, the engine will no longer detect this object and will recursively check its child objects until it finds the target object or misses all objects.
     * When not penetrable, the node's width and height define the mouse collision area (a non-penetrable rectangular area). If the rectangular collision area does not meet the requirements, you can use the drawing area of the hit area as the collision area. The hit area takes precedence over width and height of node as the non-penetrable mouse collision area.
     * Note that for UI object nodes with a set skin property, once a skin texture resource is set, this property becomes ineffective, and the rectangular area drawn by the texture will always be non-penetrable unless it does not accept mouse events or a non-clickable area is set.
     * @zh 用于非UI组件显示对象节点（容器对象或没有设置图像资源的显示对象），鼠标事件与此对象在碰撞检测时，是否穿透。ture为可穿透，false为不可穿透。
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
    * @en If the node needs to load related skins but placed in different domains, you can set it here.
    * @zh 如果节点需要加载相关的皮肤，但放在不同域，这里可以设置。
    **/
    _skinBaseUrl: string;

    private _autosize: boolean = false;
    private _tfChanged: boolean;
    private _repaint: number = -1;
    private _texture: Texture;
    private _sizeFlag: number = 0;
    private _filterArr: Filter[];
    private _userBounds: Rectangle;
    private _ownGraphics: boolean;
    private _tmpBounds: Array<number>;
    /** @internal */
    shaderData: ShaderData;

    declare _children: Sprite[];
    declare _$children: Sprite[];
    declare _parent: Sprite;
    declare _scene: Sprite;

    /**@internal */
    _ownerArea: Sprite;
    /** @internal */
    _subStructRender: SubStructRender = null;
    /** @internal  渲染真实spritet的pass，在启用后处理，cacheAsBitmap和mask的时候生效*/
    _oriRenderPass: IRender2DPass = null;
    /**@internal 渲染真实sprite所需的rt大小 */
    _drawOriRT: RenderTexture2D;
    /** @internal 片，代替的结构 ，真正的结构划到了rt上*/
    _subStruct: IRenderStruct2D = null;

    private _layer: number = 0;

    /** @ignore */
    constructor() {
        super();
        this._struct = LayaGL.render2DRenderPassFactory.createRenderStruct2D();
        this._globalTrans = new SpriteGlobalTransform(this);
    }

    /** @internal */
    _initShaderData() {
        if (this.shaderData)
            return

        this.shaderData = LayaGL.renderDeviceFactory.createShaderData();
        BlendModeHandler.initBlendMode(this.shaderData);
        this._struct.spriteShaderData = this.shaderData;
        this._struct.isRenderStruct = true;
    }

    /**
     * @en Destroy the sprite.
     * @param destroyChild Whether to destroy child nodes. Default is true.
     * @zh 销毁精灵。
     * @param destroyChild 是否删除子节点。默认为 true。
     */
    destroy(destroyChild: boolean = true): void {
        super.destroy(destroyChild);
        this._cacheStyle && this._cacheStyle.recover();
        this._cacheStyle = null;
        this._texture && this._texture._removeReference();
        if (this._oriRenderPass) {
            ILaya.stage.passManager.removePass(this._oriRenderPass);
            if (this._oriRenderPass.postProcess) {
                this._oriRenderPass.postProcess.destroy();
                this._oriRenderPass.postProcess = null;
            }
            this._oriRenderPass.destroy();
            this._oriRenderPass = null;
        }
        this._subStructRender && this._subStructRender.destroy();
        this._subStructRender = null;
        this._filterArr = null;
        this._texture = null;

        if (this._graphics) {
            this._graphicsData.destroy();
            if (this._ownGraphics) {
                this._graphics.destroy();
            }
            this._graphics = null;
            this._graphicsData = null;
        }
        this._subStruct = null;
        this._struct = null;
    }

    /**
     * @en The parent node.
     * @zh 父节点。
     */
    get parent(): Sprite {
        return <Sprite>this._$parent;
    }

    /**
     * @en Get the scene the sprite belongs to.
     * @returns The scene object.
     * @zh 获取所属的场景。
     * @returns 场景对象。
     */
    get scene(): Scene {
        return <Scene>this._scene;
    }

    /**
     * @en The x coordinate value relative to the parent container.
     * @zh 显示对象相对于父容器的水平方向坐标值。
     */
    get x(): number {
        return this._x;
    }

    set x(value: number) {
        this.pos(value, this._y);
    }

    /**
     * @en The y coordinate value relative to the parent container.
     * @zh 显示对象相对于父容器的垂直方向坐标值。
     */
    get y(): number {
        return this._y;
    }

    set y(value: number) {
        this.pos(this._x, value);
    }

    /**
     * @en The width of the Node, in pixels
     * @zh 节点的宽度，单位为像素。
     */
    get width(): number {
        if (this._autosize)
            return this.getSelfBounds(tmpRect).width;
        else if ((this._sizeFlag & 1) == 0)
            return this.measureWidth();
        else
            return this._width;
    }

    set width(value: number) {
        this.size(value, (this._sizeFlag & 2) == 0 ? null : this._height);
    }

    /**
     * @en The height of the Node, in pixels.
     * @zh 节点的高度，单位为像素。
     */
    get height(): number {
        if (this._autosize)
            return this.getSelfBounds(tmpRect).height;
        else if ((this._sizeFlag & 2) == 0)
            return this.measureHeight();
        else
            return this._height;
    }

    set height(value: number) {
        this.size((this._sizeFlag & 1) == 0 ? null : this._width, value);
    }

    /**
     * @en Check if the width is set.
     * @returns True if the width is set, otherwise false.
     * @zh 检查是否设置了宽度。
     * @returns True 表示宽度已设置，否则为 False。
     */
    get _isWidthSet() {
        return (this._sizeFlag & 1) != 0;
    }

    /**
     * @en Check if the height is set.
     * @returns True if the height is set, otherwise false.
     * @zh 检查是否设置了高度。
     * @returns True 表示高度已设置，否则为 False。
     */
    get _isHeightSet() {
        return (this._sizeFlag & 2) != 0;
    }

    /**
     * @zh 如果节点的宽度未设置，则每次获取节点宽度时都会调用这个方法获得显示宽度。
     * @en If the size of the node is not set, this method will be called to obtain the display width each time the node width is obtained.
     */
    protected measureWidth(): number {
        return this._texture ? this._texture.width : 0;
    }

    /**
     * @zh 如果节点的高度未设置，则每次获取节点高度时都会调用这个方法获得显示高度。
     * @en If the height of the node is not set, this method will be called to obtain the display height each time the node height is obtained.
     */
    protected measureHeight(): number {
        return this._texture ? this._texture.height : 0;
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
     * @en The scale factor on the X axis, with a default value of 1. Setting a negative value can achieve a horizontal flip effect, e.g., scaleX=-1.
     * @zh X轴缩放值，默认值为1。设置为负数可以实现水平反转效果，例如scaleX=-1。
     */
    get scaleX(): number {
        return this._scaleX;
    }

    set scaleX(value: number) {
        this.scale(value, this._scaleY);
    }

    /**
     * @en The scale factor on the Y axis, with a default value of 1. Setting a negative value can achieve a vertical flip effect, e.g., scaleY=-1.
     * @zh Y轴缩放值，默认值为1。设置为负数可以实现垂直反转效果，例如scaleY=-1。
     */
    get scaleY(): number {
        return this._scaleY;
    }

    set scaleY(value: number) {
        this.scale(this._scaleX, value);
    }

    /**
     * @en The rotation angle, in degrees, with a default value of 0.
     * @zh 旋转角度，默认值为0。以角度为单位。
     */
    get rotation(): number {
        return this._rotation;
    }

    set rotation(value: number) {
        if (this._rotation !== value) {
            this._rotation = value;
            this._transChanged(TransformKind.Rotation);
        }
    }

    /**
     * @en The horizontal skew angle, in degrees, with a default value of 0.
     * @zh 水平倾斜角度，默认值为0。以角度为单位。
     */
    get skewX(): number {
        return this._skewX;
    }

    set skewX(value: number) {
        this.skew(value, this._skewY);
    }

    /**
      * @en The vertical skew angle, in degrees, with a default value of 0.
      * @zh 垂直倾斜角度,默认值为0。以角度为单位。
      */
    get skewY(): number {
        return this._skewY;
    }

    set skewY(value: number) {
        this.skew(this._skewX, value);
    }

    /**
     * @en The matrix information of the object. By setting the matrix, node rotation, scaling, and displacement effects can be achieved.
     * @zh 对象的矩阵信息。通过设置矩阵可以实现节点旋转，缩放，位移效果。
     */
    get transform(): Matrix {
        if (!this._tfChanged)
            return this._transform;

        this._tfChanged = false;
        let m = this._transform || (this._transform = new Matrix());
        let sx = this._scaleX, sy = this._scaleY;
        let sskx = this._skewX;
        let ssky = this._skewY;
        let rot = this._rotation;

        if (rot || sx !== 1 || sy !== 1 || sskx !== 0 || ssky !== 0) {
            m._bTransform = true;
            let skx = (rot - sskx) * 0.0174532922222222;//laya.CONST.PI180;
            let sky = (rot + ssky) * 0.0174532922222222;
            let cx = Math.cos(sky);
            let ssx = Math.sin(sky);
            let cy = Math.sin(skx);
            let ssy = Math.cos(skx);
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

    set transform(value: Matrix) {
        this._tfChanged = false;
        let m = this._transform || (this._transform = new Matrix());
        if (value !== m)
            value.copyTo(m);
        if (value) { //设置transform时重置x,y
            let out = Matrix.extractTransformInfo(value);
            this._x = out.x;
            this._y = out.y;
            this._scaleX = out.scaleX;
            this._scaleY = out.scaleY;
            this._skewX = out.skewX;
            this._skewY = out.skewY;
            this._rotation = out.rotation;
            m.tx = m.ty = 0;
            this._transChanged(TransformKind.TRS);
        }
        this._renderType |= SpriteConst.TRANSFORM;
        this.parentRepaint();
    }

    /**
     * @en The global transformation information of the object.
     * @zh 对象的全局变换信息。
     */
    get globalTrans(): SpriteGlobalTransform {
        return this._globalTrans;
    }

    /**
     * @en The x-axis pivot point position, in pixels, with a default value of 0. The pivot point affects the object's position, scaling center, and rotation center.
     * @zh X 轴轴心点的位置，以像素为单位，默认为 0。轴心点会影响对象的位置、缩放中心和旋转中心。
     */
    get pivotX(): number {
        return this._pivotX;
    }

    set pivotX(value: number) {
        this.pivot(value, this._pivotY);
    }

    /**
     * @en The y-axis pivot point position, in pixels, with a default value of 0. The pivot point affects the object's position, scaling center, and rotation center.
     * @zh Y 轴轴心点的位置，以像素为单位，默认为 0。轴心点会影响对象的位置、缩放中心和旋转中心。
     */
    get pivotY(): number {
        return this._pivotY;
    }

    set pivotY(value: number) {
        this.pivot(this._pivotX, value);
    }

    /**
     * @en The anchor point's x-coordinate, ranging from 0 to 1. Setting anchorX will ultimately change the node's pivot point through the pivotX value.
     * @zh X 轴锚点,值为 0-1。设置 anchorX 值最终会通过 pivotX 值来改变节点的轴心点。
     */
    get anchorX(): number {
        return this._anchorX;
    }

    set anchorX(value: number) {
        this.anchor(value, this._anchorY);
    }

    /**
     * @en The anchor point's y-coordinate, ranging from 0 to 1. Setting anchorY will ultimately change the node's pivot point through the pivotY value.
     * @zh Y 轴锚点，值为 0-1。设置 anchorY 值最终会通过 pivotY 值来改变节点的轴心点。
     */
    get anchorY(): number {
        return this._anchorY;
    }

    set anchorY(value: number) {
        this.anchor(this._anchorX, value);
    }

    /**
     * @en The transparency value, ranging from 0 to 1, with a default value of 1 (opaque). Changing the alpha value will affect the drawcall.
     * @zh 透明度,值为 0-1,默认值为 1(不透明)。更改 alpha 值会影响 drawcall。
     */
    get alpha(): number {
        return this._alpha;
    }

    set alpha(value: number) {
        value = value < 0 ? 0 : (value > 1 ? 1 : value);
        if (this._alpha !== value) {
            this._alpha = value;
            this._struct.alpha = this.alpha;
            if (value !== 1) this._renderType |= SpriteConst.ALPHA;
            else this._renderType &= ~SpriteConst.ALPHA;
            this.repaint();
        }
    }

    /**
     * @en Indicates whether the object is visible. The default value is true. If set to false, the node will not be rendered.
     * @zh 表示对象是否可见,默认为 true。如果设置为 false,节点将不会被渲染。
     */
    get visible(): boolean {
        return this._visible;
    }

    set visible(value: boolean) {
        if (this._visible !== value) {
            this._visible = value;
            this._struct.enable = value;
            // if(this._graphics) this._graphics._modefied = true;
            this.repaint();
            this._processVisible();
        }
    }

    /**
     * @en Specifies the blending mode to be used. Only "lighter" is currently supported.
     * @zh 指定要使用的混合模式，目前只支持 "lighter"。
     */
    get blendMode(): BlendMode {
        return this._blendMode;
    }

    set blendMode(value: BlendMode | string) {
        if (this._blendMode != value) {
            if (typeof value === 'string') {
                value = BlendModeHandler.NAMES[value] || BlendMode.Invalid;
            } else if (value == null) {
                value = BlendMode.Invalid;
            }

            this._blendMode = value;
            this._initShaderData();
            if (value)
                this._renderType |= SpriteConst.BLEND;
            else
                this._renderType &= ~SpriteConst.BLEND;

            this._struct.blendMode = this._blendMode;
            this.parentRepaint();
        }
    }

    /**
     * @en Mask layer.
     * @zh 蒙版层。
     */
    get layer(): number {
        return this._layer;
    }

    set layer(value: number) {
        if (this._layer !== value) {
            if (value >= 0 && value <= 30) {
                this._layer = value;
                this._struct.renderLayer = 1 << value;
            } else {
                throw new Error("Layer value must be 0-30.");
            }
        }
    }
    /** @internal */
    _graphicsData: GraphicsRenderData;
    
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
            this._graphics._setDisplay(false);
            this._graphics._data = null;
            this._graphics.owner = null;
            if (this._ownGraphics)
                this._graphics.destroy();
        }
        if (!this._graphicsData) {
            this._graphicsData = new GraphicsRenderData();
        }
        this._ownGraphics = transferOwnership;
        this._graphics = value;
        
        if (value) {
            value._data = this._graphicsData;
            value.owner = this;
            value._checkDisplay();
            value._modefied = true;
        }

        this.repaint();
    }

    /**
     * @deprecated use post2DProcess
     * @en The filter collection. Multiple filters can be combined.
     * @zh 滤镜集合。可以设置多个滤镜组合。
     */
    get filters(): Filter[] {
        return this._filterArr;
    }

    set filters(value: Filter[]) {
        value && value.length === 0 && (value = null);
        if (value) {
            this._filterArr = value;
            this._renderType |= SpriteConst.POSTPROCESS;
            let postProcess = this._getPostProcess();
            postProcess.clear();
            for (var i = 0; i < this._filterArr.length; i++) {
                postProcess.addEffect(this.filters[i].getEffect());
            }
        }
        else {
            this._renderType &= ~SpriteConst.POSTPROCESS;
            this._oriRenderPass.postProcess && this._oriRenderPass.postProcess.destroy();
        }

        this.setSubpassFlag(SUBPASSFLAG.PostProcess);

        if (value && value.length > 0) {
            if (!this._getBit(NodeFlags.DISPLAY)) this._setBitUp(NodeFlags.DISPLAY);
        }
        this.repaint();
    }

    protected _getPostProcess(create: boolean = true): PostProcess2D {
        if (!this._oriRenderPass || !this._oriRenderPass.postProcess) {
            if (create) {
                this.postProcess = new PostProcess2D();
            }else{
                return null;
            }
        }
        return this._oriRenderPass.postProcess;
    }

    get postProcess(): PostProcess2D {
        return this._getPostProcess(false);
    }

    set postProcess(value: PostProcess2D) {
        if (!this._oriRenderPass) {
            this.createSubRenderPass();
        }
        
        if (this._oriRenderPass.postProcess) {
            this._oriRenderPass.postProcess.owner = null;
        }

        this._oriRenderPass.postProcess = value;
        value.owner = this;
        this.setSubpassFlag(SUBPASSFLAG.PostProcess);
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
        if (value === this._cacheStyle.userSetCache)
            return;
        this._getCacheStyle().userSetCache = value;

        if (this.mask && value === 'normal')
            return;
        if (value == 'bitmap' || value == 'normal') {
            this._renderType |= SpriteConst.CANVAS;
        } else {
            this._renderType &= ~SpriteConst.CANVAS;
        }
        this.setSubpassFlag(SUBPASSFLAG.CacheAsBitmap);
        this.repaint();
    }

    /**
     * @deprecated
     * 设置cacheAs为非空时此值才有效，staticCache=true时，子对象变化时不会自动更新缓存，只能通过调用reCache方法手动刷新。
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
     * @en Masking allows setting an object (bitmap or vector graphic) as a mask, displaying content based on the object's shape. 
     * @zh 遮罩，可以设置一个对象（支持位图和矢量图），根据对象形状进行遮罩显示。
     */
    get mask(): Sprite {
        return this._cacheStyle.mask;
    }

    set mask(value: Sprite) {
        if (value == this || (value && this.mask == value && value._cacheStyle.maskParent == this))
            return;

        if (this.mask) {
            this.mask._getCacheStyle().maskParent = null;
            this.mask.blendMode = null;
        }
        // this.removeChild(this.mask);

        this._getCacheStyle().mask = value;

        if (value) {
            value.blendMode = BlendMode.Mask;
            value._getCacheStyle().maskParent = this;
            //if (!value._oriRenderPass) {
            value.setSubRenderPassState(true);
            //}
            value._oriRenderPass.isSupport = true;
            value._oriRenderPass.doClearColor = false;
            this._renderType |= SpriteConst.MASK;

        }
        else {
            this._renderType &= ~SpriteConst.MASK;
        }
        this.setSubpassFlag(SUBPASSFLAG.Mask);
        this.repaint();
    }

    setSubpassFlag(flag: SUBPASSFLAG) {
        this._subpassUpdateFlag |= flag;
        this.stage._addSubPassNeedUpdateElement(this);
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
        return this._scrollRect;
    }

    set scrollRect(value: Rectangle) {
        if (this._scrollRect == null && value == null)
            return;

        this._scrollRect = value;
        if (value) {
            this._renderType |= SpriteConst.CLIP;
            this._struct.setClipRect(value);
            this._transChanged(TransformKind.Layout);
        } else {
            this._renderType &= ~SpriteConst.CLIP;
            this._struct.setClipRect(null);
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
        return this._viewport;
    }

    set viewport(value: Rectangle) {
        if (typeof (value) == 'string') {
            let recArr = (<any>value).split(",");
            if (recArr.length > 3) {
                value = new Rectangle(parseFloat(recArr[0]), parseFloat(recArr[1]), parseFloat(recArr[2]), parseFloat(recArr[3]));
            }
        }
        this._viewport = value;
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
     * @en You can set a rectangular area as the clickable region, or set a HitArea instance as the clickable region. The HitArea can have both clickable and non-clickable areas defined. If the hitArea is not set, the mouse collision detection will be based on the area formed by the width and height of the object.
     * @zh 可以设置一个矩形区域作为点击区域，或者设置一个 `HitArea` 实例作为点击区域，HitArea 内可以设置可点击和不可点击区域。如果不设置 hitArea，则根据宽高形成的区域进行鼠标碰撞检测。
     */
    get hitArea(): IHitArea {
        return this._hitArea;
    }

    set hitArea(value: IHitArea) {
        this._hitArea = value;
    }

    /**
     * @en Indicates whether the object receives mouse events. The default is false. If you listen to mouse events, this value will be automatically set to true.
     * @zh 是否接受鼠标事件。默认为 false，如果监听鼠标事件，则会自动设置为 true.
     */
    get mouseEnabled(): boolean {
        return this._mouseState === 2;
    }

    set mouseEnabled(value: boolean) {
        let i = value ? 2 : 1;
        if (this._mouseState !== i) {
            this._mouseState = i;
            if (i === 2)
                this.setMouseEnabledUp();
        }
    }

    private setMouseEnabledUp() {
        let p = this._parent;
        while (p && p !== ILaya.stage) {
            if (p._mouseState !== 0 || !p._setBit(NodeFlags.CHECK_INPUT, true))
                break;

            p = p._parent;
        }
    }

    /**
     * @en Get the mouse coordinates relative to this object.
     * @returns The screen point information.
     * @zh 获得相对于本对象上的鼠标坐标信息。
     * @returns 屏幕点信息。
     */
    getMousePoint(): Readonly<Point> {
        return this.globalToLocal(tmpPoint.setTo(ILaya.stage.mouseX, ILaya.stage.mouseY));
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
     * @en Gets the global X-axis scale relative to the stage (this value includes the scaling of parent nodes).
     * @returns The global X-axis scale.
     * @zh 获得相对于stage的全局X轴缩放值（会叠加父亲节点的缩放值）。
     * @returns 全局X轴缩放值。
     */
    get globalScaleX(): number {
        return this.globalTrans.scaleX;
    }

    /**
     * @en Gets the global Y-axis scale relative to the stage (this value includes the scaling of parent nodes).
     * @returns The global Y-axis scale.
     * @zh 获得相对于stage的全局Y轴缩放值（会叠加父亲节点的缩放值）。
     * @returns 全局Y轴缩放值。
     */
    get globalScaleY(): number {
        return this.globalTrans.scaleY;
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
     * @en z rendering sort, which will modify the rendering order of the current object. The larger the value, the higher it is. The default is 0.
     * @zh z渲染排序，会修改当前对象的渲染顺序。值越大，越靠上。默认值为 0。
     */
    get zIndex(): number {
        return this._zIndex;
    }

    set zIndex(value: number) {
        if (this._zIndex != value) {
            this._zIndex = value;
            this._struct.zIndex = value;
        }
    }

    /**
     * @en Re-sort by zOrder.
     * @zh 根据 zOrder 进行重新排序。
     */
    protected updateZOrder(): void {
        SpriteUtils.updateOrder(this) && this.repaint()
    }

    /**
     * @en Set a Texture instance and display the image (if there are other drawings before, it will be cleared).
     * Equivalent to graphics.clear();graphics.drawImage(), but with better performance.
     * You can also assign an image address, which will automatically load the image and then display it.
     * @zh 设置一个Texture实例，并显示此图片（如果之前有其他绘制，则会被清除掉）。
     * 等同于graphics.clear();graphics.drawImage()，但性能更高。
     */
    get texture(): Texture {
        return this._texture;
    }

    set texture(value: Texture) {
        if (this._texture == value)
            return;

        this._texture && this._texture._removeReference();
        this._texture = value;
        if (value) {
            value._addReference();
            this._renderType |= SpriteConst.TEXTURE;
            this.graphics._setDisplay(true);
        }
        else {
            this._renderType &= ~SpriteConst.TEXTURE;
            this._graphics?._checkDisplay();
        }
        this._graphics._modefied = true;
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
     * @en The rendering component node of the sprite.
     * @zh 精灵的渲染组件节点。
     */
    get renderNode2D() {
        return this._renderNode;
    }

    set renderNode2D(value: BaseRenderNode2D) {
        this._renderNode = value;
        if (value) {
            value.renderUpdate && this._struct.set_renderNodeUpdateCall(value, value.renderUpdate);
            this._renderType |= SpriteConst.RENDERNODE2D;
        } else {
            this._struct.set_renderNodeUpdateCall(null, null);
            this._renderType &= ~SpriteConst.RENDERNODE2D;
        }
    }

    /**
     * @en Whether to automatically calculate the width and height of the node. The default value is `false`, which does not automatically calculate and offers better performance.
     * If you want to get the width and height based on the drawn content, you can set this property to `true`, or use the getBounds method to obtain them, which has some impact on performance.
     * @zh 是否自动计算节点的宽高数据。默认值为 false，不自动计算，性能更佳。
     * 如果想根据绘制内容获取宽高，可以设置本属性为true，或者通过getBounds方法获取，对性能有一定影响。
     */
    get autoSize(): boolean {
        return this._autosize;
    }

    set autoSize(value: boolean) {
        this._autosize = value;
    }

    /**
     * @en Set the position. Equivalent to setting the x and y properties separately.
     * Since the return value is the Sprite object itself, you can use the following syntax: spr.pos(...).scale(...);
     * @param x X-axis coordinate.
     * @param y Y-axis coordinate.
     * @returns The object itself.
     * @zh 设置坐标位置。相当于分别设置x和y属性。
     * 因为返回值为Sprite对象本身，所以可以使用如下语法：spr.pos(...).scale(...);
     * @param x X轴坐标。
     * @param y Y轴坐标。
     * @returns 返回对象本身。
     */
    pos(x: number, y: number): this;
    /**
     * @deprecated speedMode参数已经弃用。
     */
    pos(x: number, y: number, speedMode: boolean): this;
    pos(x: number, y: number): this {
        if (this._x != x || this._y != y) {
            this._x = x;
            this._y = y;

            this._transChanged(TransformKind.Pos);
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
    pivot(x: number, y: number): this {
        if (this._pivotX != x || this._pivotY != y) {
            this._pivotX = x;
            this._pivotY = y;
            let t = this.width;
            if (t != 0) this._anchorX = x / t;
            t = this.height;
            if (t != 0) this._anchorY = y / t;

            this._transChanged(TransformKind.Anchor);
        }
        return this;
    }

    /**
     * @en Set the anchor coordinate
     * @param x The x coordinate of the anchor.
     * @param y The y coordinate of the anchor.
     * @zh 设置锚点坐标
     * @param x 锚点的X坐标
     * @param y 锚点的Y坐标
     */
    anchor(x: number, y: number): this {
        if (this._anchorX != x || this._anchorY != y) {
            this._anchorX = x;
            this._anchorY = y;

            this._pivotX = x * this.width;
            this._pivotY = y * this.height;

            this._transChanged(TransformKind.Anchor);
        }
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
    size(width: number, height: number): this {
        let bw: boolean, bh: boolean;

        if (width == null) {
            bw = (this._sizeFlag & 1) != 0;
            this._sizeFlag &= ~1;
        }
        else {
            bw = this._width != width || (this._sizeFlag & 1) == 0;
            this._width = width;
            this._pivotX = this._anchorX * width;
            this._sizeFlag |= 1;
        }

        if (height == null) {
            bh = (this._sizeFlag & 2) != 0;
            this._sizeFlag &= ~2;
        }
        else {
            bh = this._height != height || (this._sizeFlag & 2) == 0;
            this._height = height;
            this._pivotY = this._anchorY * height;
            this._sizeFlag |= 2;
        }

        if (bw || bh)
            this._transChanged((bw ? TransformKind.Width : 0) | (bh ? TransformKind.Height : 0));

        return this;
    }

    /**
     * @en Set the scale. Equivalent to setting the scaleX and scaleY properties separately.
     * Since the return value is the Sprite object itself, you can use the following syntax: spr.scale(...).pos(50, 100);
     * @param x X-axis scale ratio.
     * @param y Y-axis scale ratio.
     * @returns The object itself.
     * @zh 设置缩放。相当于分别设置scaleX和scaleY属性。
     * 因为返回值为Sprite对象本身，所以可以使用如下语法：spr.scale(...).pos(50, 100);
     * @param x X轴缩放比例。
     * @param y Y轴缩放比例。
     * @returns 返回对象本身。
     */
    scale(x: number, y: number): this;
    /**
     * @deprecated speedMode参数已经弃用。
     */
    scale(x: number, y: number, speedMode: boolean): this;
    scale(x: number, y: number): this {
        if (this._scaleX !== x || this._scaleY !== y) {
            this._scaleX = x;
            this._scaleY = y;

            this._transChanged(TransformKind.Scale);
        }
        return this;
    }

    /**
     * @en Set the skew angle. Equivalent to setting the skewX and skewY properties separately.
     * Since the return value is the Sprite object itself, you can use the following syntax: spr.skew(...).pos(50, 100);
     * @param x Horizontal skew angle.
     * @param y Vertical skew angle.
     * @returns The object itself.
     * @zh 设置倾斜角度。相当于分别设置skewX和skewY属性。
     * 因为返回值为Sprite对象本身，所以可以使用如下语法：spr.skew(...).pos(50, 100);
     * @param x 水平倾斜角度。
     * @param y 垂直倾斜角度。
     * @returns 返回对象本身。
     */
    skew(x: number, y: number): this {
        if (this._skewX !== x || this._skewY !== y) {
            this._skewX = x;
            this._skewY = y;

            this._transChanged(TransformKind.Skew);
        }
        return this;
    }

    /**
     * @zh Transform改变时的通知，包括坐标，尺寸等，详见TransChangeType定义。
     * @param kind 通知类型
     * @en Notify when the transform changes, including coordinates, size, etc., see TransChangeType for details.
     * @param kind Notify type
     */
    protected _transChanged(kind: TransformKind) {
        if (this._destroyed) return;

        this.parentRepaint();

        if (this._oriRenderPass) this._oriRenderPass.repaint = true;

        if (kind != TransformKind.Pos && kind != TransformKind.Anchor) {
            this._tfChanged = true;
            this._renderType |= SpriteConst.TRANSFORM;
            if ((kind & TransformKind.Size) != 0)
                this._graphics?._clearBoundsCache(true);
        }
        else {
            let p: Sprite = this._cacheStyle.maskParent;
            if (p)
                p.repaint();
        }

        if ((kind & TransformKind.TRS) != 0) {
            this._globalTrans && this._globalTrans._spTransChanged(kind);

            if (this._getBit(NodeFlags.DEMAND_TRANS_EVENT))
                notifyTransChanged(this);
        }
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
    render(x: number, y: number): void {
        //RenderSprite.renders[this._renderType]._fun(this, null, x + this._x, y + this._y);
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
        return Sprite.drawToRenderTexture2D(sprite, canvasWidth, canvasHeight, offsetX, offsetY, rt, isDrawRenderRect);
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
     * @param clearColor Optional. If provided, the texture will be cleared to this color before drawing. Default is null.
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
     * @param clearColor 可选。如果为 true，则清除颜色。默认为 null。
     * @returns 绘制的 RenderTexture2D 对象。
     */
    static drawToRenderTexture2D(sprite: Sprite, canvasWidth: number, canvasHeight: number, offsetX: number, offsetY: number, rt: RenderTexture2D | null = null, isDrawRenderRect: boolean = true, flipY: boolean = false, clearColor: Color = null): RenderTexture2D {

        let renderout = rt || new RenderTexture2D(canvasWidth, canvasHeight, RenderTargetFormat.R8G8B8A8);
        renderout._invertY = flipY;
        let runner = Render2DProcessor.runner;

        const _updateSprites = function (root: Sprite): void {
            for (let i = 0, len = root.numChildren; i < len; i++) {
                let child = root._children[i];

                if (child._subpassUpdateFlag) {
                    child.updateRenderTexture();
                    child.updateSubRenderPassState();
                    let destrt: RenderTexture2D = child._drawOriRT;
                    child._oriRenderPass.renderTexture = child._drawOriRT;
                    if (child.mask) {
                        child._oriRenderPass.mask = child.mask._struct;
                    }
                    let process = child._oriRenderPass.postProcess;
                    if (process) {
                        process.setResource(child._drawOriRT);
                        process.clearCMD();
                        process.render();
                        destrt = process._context.destination;
                    }
                    child._subStructRender.updateQuat(child._drawOriRT, destrt);
                    //Mask TODO
                    child._subpassUpdateFlag = 0;
                }

                if (child._struct) {
                    let matrix = child.globalTrans.getMatrix();
                    child._struct.renderMatrix = matrix;
                    child._subStruct && (child._subStruct.renderMatrix = matrix);
                }

                if (child._graphics) {
                    child._graphics._render(runner, 0, 0);
                }
                _updateSprites(child);
            }
        }

        _updateSprites(sprite);

        let pass = LayaGL.render2DRenderPassFactory.createRender2DPass();
        
        if (clearColor) {
            pass.setClearColor(clearColor.r, clearColor.g, clearColor.b, clearColor.a);
        } else
            pass.setClearColor(0, 0, 0, 0);
        pass.renderTexture = renderout;
        pass.root = sprite._struct;
        pass.renderOffset.x = offsetX;
        pass.renderOffset.y = offsetY;
        // renderout
        // 设置 invMatrix
        pass.fowardRender(Render2DProcessor.rendercontext2D);

        pass.destroy();
        return renderout;
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
        let point = this.globalToLocal(tmpPoint.setTo(x, y));
        x = point.x;
        y = point.y;
        var rect: IHitArea = this._hitArea ? this._hitArea :
            (this._isWidthSet && this._isHeightSet) ? tmpRect.setTo(0, 0, this._width, this._height) : this.getSelfBounds(tmpRect);
        return rect.contains(x, y, this);
    }


    /**
     * @en Set the bounds of the object. If set, getBounds will not be used to calculate the bounds. Proper use can improve performance.
     * @param bound The bounds rectangle.
     * @zh 设置对象的边界大小，如果设置，则不再通过getBounds计算边界。合理使用能提高性能。
     * @param bound 边界矩形区域
     */
    setSelfBounds(bound: Rectangle): void {
        this._userBounds = bound;
    }

    /**
     * @en Get the rectangle display area of the object in the parent container's coordinate system.
     * Note: This calculation is complex, use sparingly.
     * @return The rectangle area.
     * @zh 获取本对象在父容器坐标系的矩形显示区域。
     * 注意：计算量较大，尽量少用。
     * @returns 矩形区域。
     */
    getBounds(out?: Rectangle): Rectangle {
        return Rectangle._getWrapRec(this._boundPointsToParent(), out);
    }

    /**
     * @en Get the rectangle display area of the object in its own coordinate system.
     * Note: This calculation is complex, use sparingly.
     * @returns The rectangle area.
     * @zh 获取本对象在自己坐标系的矩形显示区域。
     * 注意：计算量较大，尽量少用。
     * @returns 矩形区域。
     */
    getSelfBounds(out?: Rectangle): Rectangle {
        out = out || new Rectangle();

        if (this._userBounds)
            return out.copyFrom(this._userBounds);
        if (!this._graphics && this._children.length === 0 && !this._texture)
            return out.setTo(0, 0, this._width, this._height); //不要this.width，不然死循环
        else {
            tmpPoints.length = 0;
            return Rectangle._getWrapRec(this._getBoundPointsM(false, tmpPoints), out);
        }
    }

    /**
     * @zh 获取孩子的包围盒
     * @param recursive 是否递归获取所有子对象的包围盒
     * @param ignoreInvisibles 是否忽略不可见对象 
     * @param ignoreScale 是否忽略缩放 
     * @param out （可选）计算结果输出对象 
     * @returns 包围盒
     * @en Get the bounding box of the child
     * @param recursive Whether to get the bounding box of the child object recursively
     * @param ignoreInvisibles Whether to ignore invisible objects
     * @param ignoreScale Whether to ignore scaling
     * @param out (Optional) Output object for calculation results
     * @returns Bounding box 
     */
    getChildrenBounds(recursive?: boolean, ignoreInvisibles?: boolean, ignoreScale?: boolean, out?: Rectangle): Rectangle {
        out = out || new Rectangle();
        out.setTo(0, 0, 0, 0);

        let children = recursive ? this._children : this._$children;
        for (let child of children) {
            if (ignoreInvisibles && !child._getBit(NodeFlags.ACTUAL_VISIBLE))
                continue;

            let w = child.width;
            let h = child.height;
            if (!ignoreScale) {
                w *= Math.abs(child._scaleX);
                h *= Math.abs(child._scaleY);
            }
            out.union(tmpRect2.setTo(child._x - w * child._anchorX, child._y - h * child._anchorY, w, h), out);

            if (recursive && child._children.length > 0) {
                let rect = child.getChildrenBounds(recursive, ignoreInvisibles, ignoreScale);
                rect.x += child._x;
                rect.y += child._y;
                out.union(rect, out);
            }
        }
        return out;
    }

    /**
     * @internal
     * @en Get the polygon vertex list of the display area of the object in the parent container's coordinate system.
     * @param ifRotate Whether to consider the rotation of the object itself. 
     * If true, and the object has rotation, the vertices will be calculated based on the object's rotated position.
     * If false, the vertices will be calculated based on the object's unrotated position, even if the object has rotation.
     * @returns  The vertex list in the format: [x1, y1, x2, y2, x3, y3, ...].
     * @zh 获取本对象在父容器坐标系的显示区域多边形顶点列表。
     * @param  ifRotate （可选）是否考虑对象自身的旋转。
     * 如果为 true，且对象有旋转，则顶点会根据对象旋转后的位置进行计算。
     * 如果为 false，则顶点会根据对象未旋转的位置进行计算，即使对象有旋转。
     * @returns 顶点列表。结构：[x1,y1,x2,y2,x3,y3,...]。
     */
    private _boundPointsToParent(ifRotate?: boolean): number[] {
        let px = this._pivotX, py = this._pivotY;
        ifRotate = ifRotate || (this._rotation !== 0);
        if (this._scrollRect != null) {
            px += this._scrollRect.x;
            py += this._scrollRect.y;
        }

        let pts = this._tmpBounds || (this._tmpBounds = []); //会递归调用，所以不能用全局临时变量
        pts.length = 0;
        this._getBoundPointsM(ifRotate, pts);
        if (pts.length == 0)
            return pts;

        if (pts.length != 8) {
            if (ifRotate)
                GrahamScan.scanPList(pts);
            else {
                Rectangle._getWrapRec(pts, tmpRect2);
                pts.length = 0;
                tmpRect2.getBoundPoints(pts);
            }
        }

        if (!this.transform) {
            let len = pts.length;
            for (let i = 0; i < len; i += 2) {
                tmpPoint.x = pts[i];
                tmpPoint.y = pts[i + 1];
                this.toParentPoint(tmpPoint);
                pts[i] = tmpPoint.x;
                pts[i + 1] = tmpPoint.y;
            }
        }
        else {
            let dx = this._x - px;
            let dy = this._y - py;
            let len: number = pts.length;
            for (let i = 0; i < len; i += 2) {
                pts[i] += dx;
                pts[i + 1] += dy;
            }
        }

        return pts;
    }

    /**
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
    protected _getBoundPointsM(ifRotate?: boolean, out?: number[]): number[] {
        out = out || [];

        if (this._userBounds != null)
            return this._userBounds.getBoundPoints(out);

        if (this._scrollRect != null)
            return this._scrollRect.getBoundPoints(out);

        if (this._graphics != null)
            out.push(...this._graphics.getBoundPoints());

        if (this._renderNode != null || this._texture != null)
            tmpRect2.setTo(0, 0, this._width || this._texture?.width, this._height || this._texture?.height).getBoundPoints(out);

        //处理子对象区域
        let chidren = this._children;
        for (let i = 0, n = chidren.length; i < n; i++) {
            let child = chidren[i];
            if (child._getBit(NodeFlags.ACTUAL_VISIBLE) && child._cacheStyle.maskParent != this) {
                out.push(...child._boundPointsToParent(ifRotate));
            }
        }

        return out;
    }

    /**
     * @en Returns the display area of the drawing object (`Graphics`) in this instance, excluding child objects.
     * @param realSize (Optional) Use the actual size of the image, default is false.
     * @param out (Optional) Rectangle object for output.
     * @returns A Rectangle object representing the obtained display area.
     * @zh 返回此实例中绘图对象（`Graphics`）的显示区域，不包括子对象。
     * @param realSize （可选）使用图片的真实大小，默认为false。
     * @param out （可选）矩形区域输出对象。
     * @returns 一个 Rectangle 对象，表示获取到的显示区域。
     */
    getGraphicBounds(realSize?: boolean, out?: Rectangle): Rectangle {
        out = out || new Rectangle();
        if (this._graphics)
            return out.copyFrom(this._graphics.getBounds(realSize));
        else
            return out.setTo(0, 0, 0, 0);
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
    localToGlobal(point: Point, createNewPoint?: boolean, globalNode?: Sprite): Point {
        if (createNewPoint) {
            point = new Point(point.x, point.y);
        }
        var ele: Sprite = this;
        globalNode = globalNode || ILaya.stage;
        while (ele && !ele._destroyed) {
            if (ele == globalNode)
                break;
            point = ele.toParentPoint(point);
            ele = ele._parent;
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
    globalToLocal(point: Point, createNewPoint?: boolean, globalNode?: Sprite): Point {
        if (createNewPoint) {
            point = new Point(point.x, point.y);
        }
        var ele: Sprite = this;
        var list: any[] = [];
        globalNode = globalNode || ILaya.stage;
        while (ele && !ele._destroyed) {
            if (ele == globalNode) break;
            list.push(ele);
            ele = ele._parent;
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
        if (this.transform)
            this._transform.transformPoint(point);
        point.x += this._x;
        point.y += this._y;
        var scroll: Rectangle = this._scrollRect;
        if (scroll) {
            point.x -= scroll.x * this._scaleX;
            point.y -= scroll.y * this._scaleY;
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
        var scroll: Rectangle = this._scrollRect;
        if (scroll) {
            point.x += scroll.x * this._scaleX;
            point.y += scroll.y * this._scaleY;
        }
        if (this.transform)
            this._transform.invertTransformPoint(point);
        point.x += this.pivotX;
        point.y += this.pivotY;
        return point;
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
    loadImage(url: string, complete?: Handler): this {
        if (!url) {
            this.texture = null;
            this.repaint();
            complete && complete.run();
        } else {
            let tex = ILaya.loader.getRes(url);
            if (tex) {
                this.texture = tex;
                this.repaint();
                complete && complete.run();
            }
            else {
                if (this._skinBaseUrl)
                    url = URL.formatURL(url, this._skinBaseUrl);
                ILaya.loader.load(url).then((tex: Texture) => {
                    this.texture = tex;
                    this.repaint();
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
    * @en Get the cache 
    * @return The cache style (CacheStyle).
    * @zh 获取缓存样式。
    * @return 缓存样式 (CacheStyle)。
    */
    _getCacheStyle(): CacheStyle {
        this._cacheStyle === CacheStyle.EMPTY && (this._cacheStyle = CacheStyle.create());
        return this._cacheStyle;
    }

    /**
     * @deprecated
     * @en Call this method to refresh the cache when cacheAs is set.
     * @zh 在设置 cacheAs 的情况下，调用此方法会重新刷新缓存。
     */
    reCache(): void {
        this.repaint();
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
    * @en Redraw the Sprite and invalidate its own and parent's cache after setting cacheAs.
    * @param type The redraw type.
    * @zh 重新绘制，cacheAs后，设置自己和父对象缓存失效。
    * @param type 重新绘制类型。
    */
    repaint(): void {

        if ((this._repaint < Stat.loopCount)) {
            this._repaint = Stat.loopCount;
            this._struct.setRepaint();
            this.stage._addgraphicRenderElement(this);
            this.parentRepaint();
        }

        if (this._cacheStyle) {
            this._cacheStyle.renderTexture = null;//TODO 重用
            if (this._cacheStyle.maskParent) {
                this._cacheStyle.maskParent.setSubpassFlag(SUBPASSFLAG.Mask);
                this._cacheStyle.maskParent.repaint();
            }
        }
    }

    /**
     * @en Clear the repaint flag.
     * @zh 清除重绘标志。
     */
    clearRepaint() {
        this._repaint = 0;
    }

    /**
     * @internal
     * @en Check if it is re-cached.
     * @returns True if it is re-cached, otherwise false.
     * @zh 检查是否重新缓存。
     * @returns 如果重新缓存值为 true，否则值为 false。
     */
    _needRepaint(): boolean {
        //return (this._repaint & SpriteConst.REPAINT_CACHE) && this._cacheenableCanvasRender && this._cachereCache;
        return !!(this._repaint >= Stat.loopCount);
    }

    /**
     * @en Repaint the parent node. When `cacheAs` is enabled, set all parent object caches to invalid.
     * @param type The type of repaint. Default is SpriteConst.REPAINT_CACHE.
     * @zh 重新绘制父节点。启用 `cacheAs` 时，设置所有父对象缓存失效。
     * @param type 重新绘制类型。默认为 SpriteConst.REPAINT_CACHE。
     */
    parentRepaint(): void {
        var p: Sprite = this._parent;
        if (p && !(p._needRepaint())) {
            p._struct.setRepaint();
            p.parentRepaint();
        }
    }

    /**
     * @en Get the drag support object.
     * @return The drag support object (DragSupport).
     * @zh 获取拖拽支持对象。
     * @return 拖拽支持对象 (DragSupport)。
     */
    get dragSupport(): DragSupport {
        return this._dragSupport || (this._dragSupport = new DragSupport(this));
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
     * @param area （可选）拖动区域，此区域为当前对象注册点活动区域（不包括对象宽高） 。
     * @param hasInertia （可选）鼠标松开后，是否还惯性滑动，默认为false。
     * @param elasticDistance （可选）橡皮筋效果的距离值，0为无橡皮筋效果，默认为0。
     * @param elasticBackTime （可选）橡皮筋回弹时间，单位为毫秒，默认为300毫秒。
     * @param data （可选）拖动事件携带的数据。
     * @param ratio （可选）惯性阻尼系数，影响惯性力度和时长。
     */
    startDrag(area?: Rectangle, hasInertia?: boolean, elasticDistance?: number, elasticBackTime?: number, data?: any, ratio?: number): void {
        let d = this.dragSupport;
        area != null && d.area.copyFrom(area);
        hasInertia != null && (d.hasInertia = hasInertia);
        elasticDistance != null && (d.elasticDistance = elasticDistance);
        elasticBackTime != null && (d.elasticBackTime = elasticBackTime);
        ratio != null && (d.ratio = ratio);
        d.start(data);
    }

    /**
     * @en Stops dragging this object.
     * @zh 停止拖动此对象。
     */
    stopDrag(): void {
        this._dragSupport && this._dragSupport.stop();
    }

    /**
     * @ignore
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

    protected onStartListeningToType(type: string) {
        super.onStartListeningToType(type);

        if (Event.isMouseEvent(type)) {
            if (this._mouseState === 0) {
                this._setBit(NodeFlags.CHECK_INPUT, true);
                this.setMouseEnabledUp();
            }
        }
        else if (type === Event.TRANSFORM_CHANGED) {
            this._setBit(NodeFlags.DEMAND_TRANS_EVENT, true);
            this.setDemandTransEventUp();
        }
    }

    private setDemandTransEventUp() {
        let p = this._parent;
        while (p && p !== ILaya.stage) {
            if (!p._setBit(NodeFlags.DEMAND_TRANS_EVENT, true))
                break;

            p = p._parent;
        }
    }

    /**
     * @ignore
     */
    _setDisplay(value: boolean): void {
        if (!value && this._cacheStyle)
            this._cacheStyle.onInvisible();
        super._setDisplay(value);
    }

    /**
     * @internal
     * @en This method should be called when all variable state determining factors change, typically such as the visible property.
     * @return Whether the visible status is actually changed.
     * @zh 这个方法在所有可变状态决定因子改变时都应调用，典型的如visible属性。
     * @return 可见状态是否真正改变了。
     */
    _processVisible(): boolean {
        if (this._setBit(NodeFlags.ACTUAL_VISIBLE, this._visible && !this._getBit(hiddenBits) || this._getBit(NodeFlags.FORCE_VISIBLE))) {
            this.parentRepaint();
            return true;
        }
        else
            return false;
    }



    /**
     * @ignore
     */
    _setUnBelongScene(): void {
        if (this._ownerArea != null) {
            this._ownerArea = null;
        }
        this._struct.globalRenderData = null;
        super._setUnBelongScene();
    }

    /**
     * @ignore
     * @param scene 
     */
    _setBelongScene(scene: Node): void {
        super._setBelongScene(scene);
        this._findOwnerArea();
    }

    protected _findOwnerArea() {
        let ele = this as any;
        while (ele) {
            if (ele === this._scene || ele === ILaya.stage) break;
            if (ele._globalRenderData) {
                this._ownerArea = ele;
                this._struct.globalRenderData = ele._globalRenderData;
                break;
            }
            ele = ele._parent;
        }
        if (this._ownerArea == null) {
            this._struct.globalRenderData = (this.scene)?._globalRenderData;
        }
    }

    protected _setStructParent(value: Node) {
        let struct = this._oriRenderPass?.enable ? this._subStruct : this._struct;

        if (struct.parent) {
            struct.parent.removeChild(struct);
            struct.parent = null;
        }

        if (value && (value as Sprite)._struct) {
            let index = value.children.indexOf(this);
            (value as Sprite)._struct.addChild(struct, index);
        }
    }

    private createSubRenderPass() {
        let rtPass = ILaya.stage.passManager;
        let subPass = LayaGL.render2DRenderPassFactory.createRender2DPass();
        rtPass.addPass(subPass);
        subPass.root = this._struct;
        subPass.enable = false;
        subPass.setClearColor(0, 0, 0, 0);
        let subStruct = LayaGL.render2DRenderPassFactory.createRenderStruct2D();
        subStruct.pass = subPass;

        this._subStructRender = new SubStructRender();
        this._subStructRender.bind(this, subPass, subStruct);
        this._subStruct = subStruct;
        this._oriRenderPass = subPass;

        subStruct.renderMatrix = this.globalTrans.getMatrix();
    }

    //TODO
    updateRenderTexture() {
        //计算方式调整
        let rect = new Rectangle;
        SpriteUtils.getRTRect(this, rect);
        //this.getSelfBounds();

        if (rect.width === 0 || rect.height === 0)
            return;

        let oldRT = this._drawOriRT;
        //判断待考虑
        if (oldRT && oldRT.width === rect.width && oldRT.height === rect.height)
            return;
        oldRT && oldRT.destroy();
        let renderTexture = new RenderTexture2D(rect.width, rect.height, RenderTargetFormat.R8G8B8A8);
        renderTexture._invertY = LayaGL.renderEngine._screenInvertY;
        this._drawOriRT = renderTexture;
    }

    updateSubRenderPassState() {
        this.setSubRenderPassState((this._renderType & SpriteConst.DRAW2RT) !== 0);
    }

    /**
     * @en Set the state of the sub-render pass.
     * @param enable Whether to enable the sub-render pass.
     * @zh 设置子渲染通道的状态。
     * @param enable 是否启用子渲染通道。
     */
    setSubRenderPassState(enable: boolean) {
        if (!this._oriRenderPass && enable) {
            this.createSubRenderPass();
        }

        if (enable && !this._oriRenderPass.enable) {
            let parent = this._struct.parent;
            this._struct.pass = this._oriRenderPass;
            if (parent) {
                let index = parent.children.indexOf(this._struct);
                parent.removeChild(this._struct);
                parent.addChild(this._subStruct, index);
            }
        } else if (!enable && this._oriRenderPass && this._oriRenderPass.enable) {
            let parent = this._subStruct.parent;
            this._struct.pass = null;
            if (parent) {
                let index = parent.children.indexOf(this._subStruct);
                parent.removeChild(this._subStruct);
                parent.addChild(this._struct, index);
            }
        }
        this._oriRenderPass.enable = enable;
    }

    /**
     * @ignore
     */
    protected _setParent(value: Node): void {
        super._setParent(value);

        this._setStructParent(value);

        this._globalTrans._spTransChanged(TransformKind.TRS);

        if (value && (this._mouseState === 2 || this._mouseState === 0 && this._getBit(NodeFlags.CHECK_INPUT))
            && !value._getBit(NodeFlags.CHECK_INPUT)) {
            this.setMouseEnabledUp();
        }

        if (value && this._getBit(NodeFlags.DEMAND_TRANS_EVENT) && !value._getBit(NodeFlags.DEMAND_TRANS_EVENT))
            this.setDemandTransEventUp();
    }

    /**
     * @internal
     */
    _setChildIndex(node: Sprite, oldIndex: number, index: number): number {
        let out = super._setChildIndex(node, oldIndex, index);
        this._struct.updateChildIndex(node._struct, oldIndex, out);
        return out;
    }

    /**
     * @ignore
     */
    protected _childChanged(child?: Sprite): void {
        super._childChanged(child);

        if (this._children.length)
            this._renderType |= SpriteConst.CHILDS;
        else
            this._renderType &= ~SpriteConst.CHILDS;
        if (child) {
            if (child._zOrder)
                this._setBit(NodeFlags.HAS_ZORDER, true);
        }
        if (this._getBit(NodeFlags.HAS_ZORDER))
            ILaya.systemTimer.callLater(this, this.updateZOrder);
        this.repaint();
    }

    /**
     * @ignore
     */
    protected _addComponentInstance(comp: Component): void {
        if (
            comp instanceof BaseRenderNode2D &&
            this._components?.some((c) => c instanceof BaseRenderNode2D)
        ) {
            console.warn(`${this.name} add RenderNode2D invalid, one sprite can only add one RenderNode`);
            return;
        }
        super._addComponentInstance(comp);
    }
}

const tmpRect = new Rectangle();
const tmpRect2 = new Rectangle();
const tmpPoint = new Point();
const tmpPoints: Array<number> = [];

function notifyTransChanged(sp: Sprite) {
    sp.event(Event.TRANSFORM_CHANGED);

    for (let child of sp._children) {
        if (child._getBit(NodeFlags.DEMAND_TRANS_EVENT))
            notifyTransChanged(child as Sprite);
    }
}