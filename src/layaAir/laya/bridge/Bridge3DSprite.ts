import { LayaEnv } from "../../LayaEnv";
import { BaseRender } from "../d3/core/render/BaseRender";
import { RenderContext3D } from "../d3/core/render/RenderContext3D";
import { Sprite3D } from "../d3/core/Sprite3D";
import { Transform3D } from "../d3/core/Transform3D";
import { Bounds } from "../d3/math/Bounds";
import { Node } from "../display/Node";
import { Scene } from "../display/Scene";
import { Sprite } from "../display/Sprite";
import { Event } from "../events/Event";
import { LayaGL } from "../layagl/LayaGL";
import { Point } from "../maths/Point";
import { Rectangle } from "../maths/Rectangle";
import { Vector3 } from "../maths/Vector3";
import { RenderListQueue } from "../RenderDriver/DriverCommon/RenderListQueue";
import { IRenderElement2D } from "../RenderDriver/DriverDesign/2DRenderPass/IRenderElement2D";
import { IBaseRenderNode } from "../RenderDriver/RenderModuleData/Design/3D/I3DRenderModuleData";
import { SingletonList } from "../utils/SingletonList";
import { Bridge3DRenderElement } from "./Bridge3DRenderElement";
import { Bridge3DScene3D } from "./Bridge3DScene3D";
import { Bridge3DCoordinate } from "./utils/Bridge3DCoordinate";

export interface IBridgeRenderElement extends IRenderElement2D {
    addBaseRenderNode(node: IBaseRenderNode): void;
    removeBaseRenderNode(node: IBaseRenderNode): void;
    updateRenderElements(): void;
    getOpaqueList(): RenderListQueue;
    getTransparentList(): RenderListQueue;
    setBridge3DContext(context: any): void;
}

/**
 * Bridge3DSprite是2D/3D桥接容器,允许在2D场景中嵌入和管理3D节点树
 *
 * @class Bridge3DSprite
 * @extends Sprite
 */
export class Bridge3DSprite extends Sprite {

    static scale3DToPixel = 10;

    static createBridge3DRenderElement(): IBridgeRenderElement {
        if (LayaEnv.isConch && (window as any).conchConfig.getGraphicsAPI() != 2) {//native
            return null;
        } else
            return new Bridge3DRenderElement();
    }
    /**
     * Internal BridgeContainerSprite3D, parent node for all 3D children
     * @internal
     * @remarks
     * - Container is added to Bridge3DScene3D
     * - Automatically gets _scene reference, supports component lifecycle
     */
    _containerSprite3D: BridgeContainerSprite3D;

    /**
     * Render element
     * @private
     */
    private _bridge3DRenderElement: IBridgeRenderElement;

    /**
     * Whether registered to Bridge3DScene3D
     * @private
     */
    private _isRegistered: boolean = false;

    /**
     * Scale factor from 3D units to pixels
     * @private
     * @remarks
     * - Controls how 3D content is scaled relative to 2D pixels
     * - Default: Bridge3DConfig.defaultScale3DToPixel
     * - Example: 100 means 1 3D unit = 100 pixels
     */
    private _scale3DToPixel: number;

    /** 缓存的3D世界空间包围盒 */
    private _bounds3D: Bounds;
    /** 缓存的2D本地空间矩形 */
    private _bounds2DRect: Rectangle;
    /** 包围盒是否需要重新计算 */
    private _boundsDirty: boolean = true;

    /**
     * 创建一个Bridge3DSprite实例
     * @remarks
     * - 自动创建内部容器Sprite3D
     * - 自动创建Bridge3DRenderElement作为渲染元素
     */
    constructor() {
        super();

        // Initialize scale from global default
        this._scale3DToPixel = Bridge3DSprite.scale3DToPixel;

        // Initialize bounds cache
        this._bounds3D = new Bounds(new Vector3(), new Vector3());
        this._bounds2DRect = new Rectangle();

        // 创建内部容器Sprite3D
        this._containerSprite3D = new Sprite3D();
        this._containerSprite3D.name = "Bridge3DContainer";
        this._setContainer(this._containerSprite3D);
        // 创建渲染元素
        this._bridge3DRenderElement = Bridge3DSprite.createBridge3DRenderElement();
        this._bridge3DRenderElement.owner = this._struct;
        //占位几何体
        this._bridge3DRenderElement.geometry = LayaGL.renderDeviceFactory.createRenderGeometryElement(0, 0);
        this._struct.renderElements = [this._bridge3DRenderElement];
        // 使 _handleInterData 跑通，父级 scrollRect（clipRect）可写入 spriteShaderData，供 Bridge3DRenderElement 裁剪
        this._initShaderData();
        const emptyHandle = LayaGL.render2DRenderPassFactory.createEmptyRenderDataHandle();
        if (emptyHandle) {
            this._struct.renderDataHandler = emptyHandle;
            emptyHandle.needUseMatrix = false;
        }
    }

    /**
     * Get internal container Sprite3D
     * @internal
     * @remarks
     * - Only for internal engine use (e.g., used by Bridge3DScene3D during registration)
     * - User code should use addChild/removeChild APIs, not access container directly
     */
    get containerSprite3D(): Sprite3D {
        return this._containerSprite3D;
    }

    /**
     * 获取内部Transform3D实例
     * @readonly
     * @deprecated 请使用addChild/removeChild/getChildAt等API管理子节点
     * @remarks
     * - 此getter保留用于向后兼容
     * - 返回容器Sprite3D的transform
     */
    get transform3D(): Transform3D {
        return this._containerSprite3D.transform;
    }

    /**
     * Get the scale factor from 3D units to pixels
     * @remarks
     * - Defines the conversion ratio between 3D units and 2D pixels
     * - Example: 100 means 1 3D unit = 100 pixels
     * - Affects the visual size of 3D content in the 2D scene
     */
    get scale3DToPixel(): number {
        return this._scale3DToPixel;
    }

    /**
     * Set the scale factor from 3D units to pixels
     * @param value - Scale factor (must be > 0)
     * @throws Error if value <= 0
     * @remarks
     * - Changes take effect immediately
     * - Triggers transform synchronization
     * - Example: Setting to 100 makes a 1-unit cube appear as 100x100 pixels
     *
     * @example
     * ```typescript
     * const bridge = new Bridge3DSprite();
     * bridge.scale3DToPixel = 100; // 1 meter = 100 pixels
     *
     * // Add a 1-unit cube (1 meter in 3D space)
     * const cube = new MeshSprite3D(PrimitiveMesh.createBox(1, 1, 1));
     * bridge.addChild(cube);
     * // The cube will appear as 100x100 pixels on screen
     * ```
     */
    set scale3DToPixel(value: number) {
        if (value <= 0) {
            throw new Error("scale3DToPixel must be greater than 0");
        }

        if (this._scale3DToPixel !== value) {
            this._scale3DToPixel = value;
            // Trigger transform sync to apply new scale
            this._syncTransform2DTo3D();
        }
    }

    /**
     * 添加3D子节点
     * @param node - 要添加的Sprite3D节点
     * @returns 返回添加的子节点
     * @throws 如果node不是Sprite3D类型
     * @remarks
     * - Bridge3DSprite只能添加Sprite3D类型的子节点,不能添加普通2D节点
     * - 通过_setContainer机制,addChild操作自动委托给内部容器Sprite3D
     * - 节点自动获得_scene引用,支持组件生命周期
     */
    override addChild<T extends Node>(node: T): T {
        if (!node) {
            throw new Error("node cannot be null or undefined");
        }

        // 运行时类型检查:只允许Sprite3D类型
        if (!(node instanceof Sprite3D)) {
            throw new Error("Bridge3DSprite can only add Sprite3D children, not 2D nodes");
        }

        // 通过_setContainer机制,base.addChild会自动委托给容器
        return super.addChild(node);
    }

    /**
     * @internal
     */
    _setBelongScene(scene: Node): void {
        super._setBelongScene(scene);
        this._regsiterScene();
    }

    /**
     * @internal
     */
    _setUnBelongScene(): void {
        this._removeRegister();
        super._setUnBelongScene();
    }

    /**
     * Called when node is added to display list
     * @remarks
     * - Overrides Sprite._onAdded
     * - Auto-initializes and registers to Bridge3DScene3D
     * @protected
     */
    protected _onAdded(): void {
        this.on(Event.TRANSFORM_CHANGED, this, this._syncTransform2DTo3D);
        super._onAdded();
    }

    private _regsiterScene() {
        if (!this._scene) {
            return;
        }
        // Auto-initialize and register to Bridge3DScene3D
        const scene3d = this._scene.bridge3D;  // Triggers lazy initialization
        if (scene3d) {
            scene3d.registerBridge3D(this);
            this._isRegistered = true;
        }
    }

    private _removeRegister() {
        if (!this._scene) {
            return;
        }
        // Unregister from Bridge3DScene3D
        if (this._isRegistered) {
            const scene3d = this._scene.bridge3D;
            if (scene3d) {
                scene3d.unregisterBridge3D(this);
            }
            this._isRegistered = false;
        }

    }

    /**
     * Called when node is removed from display list
     * @remarks
     * - Overrides Sprite._onRemoved
     * - Unregisters from Bridge3DScene3D
     * @protected
     */
    protected _onRemoved(): void {
        // this._removeRegister();
        this.off(Event.TRANSFORM_CHANGED, this, this._syncTransform2DTo3D);
        super._onRemoved();
    }

    protected _setParent(value: Node, index?: number): void {
        super._setParent(value, index);
        if (value) {
            this._syncTransform2DTo3D();
        }
    }

    /**
     * 当2D变换改变时调用
     * @param flag - 变换标志位
     * @remarks
     * - 覆写Sprite._onTransformChanged
     * - 同步更新内部Transform3D的localPosition、localScale、localRotationEuler
     * - MVP阶段不处理倾斜变换
     * @protected
     */
    protected _transChanged(flag: number): void {
        super._transChanged(flag);

        // 同步2D变换到3D
        this._syncTransform2DTo3D();
    }

    /**
     * 同步2D变换到3D容器
     * @private
     * @remarks
     * 使用Bridge3DCoordinate工具类进行坐标转换，确保2D逻辑坐标正确映射到3D世界坐标
     * 使用全局变换矩阵，确保正确处理父节点的变换（包括倾斜）
     */
    private _syncTransform2DTo3D(): void {
        const transform = this._containerSprite3D.transform;

        // 获取全局变换矩阵
        const globalMatrix = this.globalTrans.getMatrix();

        // 从全局矩阵中提取2D变换参数
        const a = globalMatrix.a;
        const b = globalMatrix.b;
        const c = globalMatrix.c;
        const d = globalMatrix.d;
        const tx = globalMatrix.tx;
        const ty = globalMatrix.ty;

        // 应用单位转换缩放
        const scale = this._scale3DToPixel;

        // 获取3D位置
        const pos3D = Vector3.TEMP;
        Bridge3DCoordinate.logicTo3D(tx, ty, 0, pos3D);

        // 构建4x4矩阵
        // 矩阵布局（列主序）：
        // [a*scale  c*scale  0  tx]
        // [b*scale  d*scale  0  ty]
        // [0        0        scale  tz]
        // [0        0        0  1 ]
        const matrix = transform.localMatrix;
        const e = matrix.elements;

        // 第一列（X轴基向量）
        e[0] = a * scale;
        e[1] = -b * scale;
        e[2] = 0;
        e[3] = 0;

        // 第二列（Y轴基向量）
        e[4] = -c * scale;
        e[5] = d * scale;
        e[6] = 0;
        e[7] = 0;

        // 第三列（Z轴基向量）
        e[8] = 0;
        e[9] = 0;
        e[10] = scale;
        e[11] = 0;

        // 第四列（平移）
        e[12] = pos3D.x;
        e[13] = pos3D.y;
        e[14] = pos3D.z;
        e[15] = 1;

        // 应用矩阵
        transform.localMatrix = matrix;

        this._markBoundsDirty();
    }

    /**
     * 管理的渲染对象列表
     * @private
     */
    private _list: SingletonList<BaseRender> = new SingletonList();

    /**
     * 添加渲染对象到管理列表
     * @param render - 渲染对象
     * @internal
     */
    _addRenderObject(render: BaseRender): void {
        this._list.add(render);
        this._bridge3DRenderElement.addBaseRenderNode(render.renderNode);
        this._markBoundsDirty();
    }

    /**
     * 从管理列表移除渲染对象
     * @param render - 渲染对象
     * @internal
     */
    _removeRenderObject(render: BaseRender): void {
        this._list.remove(render);
        this._bridge3DRenderElement.removeBaseRenderNode(render.renderNode);
        this._markBoundsDirty();
    }

    /**
     * 更新渲染对象，只在需要时重新收集
     * @internal
     */
    _renderUpdate(): void {
        let context = RenderContext3D._instance;
        let elements = this._list.elements;
        // 更新所有渲染对象
        for (let i = 0, len = this._list.length; i < len; i++) {
            elements[i].renderUpdate(context);
        }
    }

    /**
     * 获取3D世界空间包围盒
     * @returns 合并所有子渲染对象的世界空间包围盒
     */
    get3DBounds(): Bounds {
        if (this._boundsDirty) this._updateBounds();
        return this._bounds3D;
    }

    /**
     * 标记包围盒需要重新计算
     * @private
     */
    private _markBoundsDirty(): void {
        this._boundsDirty = true;
    }

    /**
     * 更新包围盒计算
     * @private
     */
    private _updateBounds(): void {
        const elements = this._list.elements;
        const len = this._list.length;

        if (len === 0) {
            this._bounds3D.min = _boundsTemp0;
            this._bounds3D.max = _boundsTemp1;
        } else {
            elements[0].bounds.cloneTo(this._bounds3D);
            for (let i = 1; i < len; i++) {
                Bounds.merge(this._bounds3D, elements[i].bounds, this._bounds3D);
            }
        }

        this._project3DTo2D();
        this._boundsDirty = false;
    }

    /**
     * 将3D包围盒投影到2D本地坐标空间
     * @private
     */
    private _project3DTo2D(): void {
        const min3D = this._bounds3D.min;
        const max3D = this._bounds3D.max;

        // 3D世界坐标 → 2D全局坐标（stage坐标）
        const min2D = Bridge3DCoordinate.worldTo2D(min3D);
        const max2D = Bridge3DCoordinate.worldTo2D(max3D);

        // 取4个角点并转换为本地坐标
        const p = _boundsPoint;
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;

        // (minX, minY)
        p.setTo(min2D.x, min2D.y);
        this.globalToLocal(p);
        if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y;

        // (maxX, minY)
        p.setTo(max2D.x, min2D.y);
        this.globalToLocal(p);
        if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y;

        // (minX, maxY)
        p.setTo(min2D.x, max2D.y);
        this.globalToLocal(p);
        if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y;

        // (maxX, maxY)
        p.setTo(max2D.x, max2D.y);
        this.globalToLocal(p);
        if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y;

        this._bounds2DRect.setTo(minX, minY, maxX - minX, maxY - minY);
    }

    /**
     * @override
     */
    getGraphicBounds(realSize?: boolean, out?: Rectangle): Rectangle {
        if (this._boundsDirty) this._updateBounds();
        return this._bounds2DRect.clone(out);
    }

    /**
     * Called when node is destroyed
     * @remarks
     * - Overrides Node._onDestroy
     * - Destroys internal container Sprite3D (automatically destroys all child nodes)
     * - Destroys render element
     * - Unregisters from Bridge3DScene3D
     */
    onDestroy(): void {
        // Unregister from Bridge3DScene3D
        this._removeRegister();

        // 清理渲染对象列表
        this._list.length = 0;

        // 清理包围盒缓存
        this._bounds3D = null;
        this._bounds2DRect = null;

        // 销毁渲染元素
        if (this._bridge3DRenderElement) {
            this._bridge3DRenderElement.destroy();
            this._bridge3DRenderElement = null;
        }

        // 销毁容器Sprite3D(会自动销毁所有子节点)
        if (this._containerSprite3D) {
            this._containerSprite3D.destroy();
            this._containerSprite3D = null;
        }

        super.onDestroy();
    }

    /**
     * 获取Bridge3D渲染元素
     * @internal
     */
    get bridge3DRenderElement(): IBridgeRenderElement {
        return this._bridge3DRenderElement;
    }
}

export class BridgeContainerSprite3D extends Sprite3D{

}

/** @internal 包围盒计算临时变量 */
const _boundsTemp0: Vector3 = new Vector3();
const _boundsTemp1: Vector3 = new Vector3();
const _boundsPoint: Point = new Point();
