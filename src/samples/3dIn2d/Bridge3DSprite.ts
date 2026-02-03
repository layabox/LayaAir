import { Sprite } from "../../layaAir/laya/display/Sprite";
import { Transform3D } from "../../layaAir/laya/d3/core/Transform3D";
import { Sprite3D } from "../../layaAir/laya/d3/core/Sprite3D";
import { Bridge3DRenderElement } from "./Bridge3DRenderElement";
import { Bridge3DCoordinate } from "./utils/Bridge3DCoordinate";
import { Scene } from "../../layaAir/laya/display/Scene";
import type { Node } from "../../layaAir/laya/display/Node";
import { BaseRender } from "laya/d3/core/render/BaseRender";
import { SingletonList } from "laya/utils/SingletonList";
import { RenderContext3D } from "laya/d3/core/render/RenderContext3D";
import { IBaseRenderNode, ICameraNodeData, ISceneNodeData } from "laya/RenderDriver/RenderModuleData/Design/3D/I3DRenderModuleData";
import { IRenderElement2D } from "laya/RenderDriver/DriverDesign/2DRenderPass/IRenderElement2D";
import { LayaEnv } from "LayaEnv";
import { LayaGL } from "laya/layagl/LayaGL";
import { RenderListQueue } from "laya/RenderDriver/DriverCommon/RenderListQueue";


export interface IBridgeRenderElement extends IRenderElement2D{
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

    static createBridge3DRenderElement(): IBridgeRenderElement {
        if (LayaEnv.isConch && (window as any).conchConfig.getGraphicsAPI() != 2) {//native
            
        }else
            return new Bridge3DRenderElement();
    }
    /**
     * 内部容器Sprite3D,作为所有3D子节点的父节点
     * @private
     * @remarks
     * - 容器会被添加到Bridge3DManager的Scene3D中
     * - 自动获得_scene引用,支持组件生命周期
     */
    private _containerSprite3D: Sprite3D;

    /**
     * 渲染元素
     * @private
     */
    private _bridge3DRenderElement: IBridgeRenderElement;

    /**
     * 是否已注册到Bridge3DManager
     * @private
     */
    private _isRegistered: boolean = false;

    /**
     * 创建一个Bridge3DSprite实例
     * @remarks
     * - 自动创建内部容器Sprite3D
     * - 自动创建Bridge3DRenderElement作为渲染元素
     */
    constructor() {
        super();

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
        // 初始化2D变换同步到3D
        this._syncTransform2DTo3D();
    }

    /**
     * 获取内部容器Sprite3D
     * @internal
     * @remarks
     * - 仅供引擎内部使用(如Bridge3DManager注册时使用)
     * - 用户代码应使用addChild/removeChild等API,不要直接访问容器
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
     * 当节点被添加到显示列表时调用
     * @remarks
     * - 覆写Sprite._onAdded
     * - 如果父节点所在的Scene2D有Bridge3DManager,则自动注册
     * @protected
     */
    protected _onAdded(): void {
        super._onAdded();

        // 查找Scene并注册到Bridge3DManager
        const scene = this.scene as Scene;
        if (scene && scene._bridge3DManager) {
            scene._bridge3DManager.registerBridge3D(this);
            this._isRegistered = true;

            // let scene3D = scene._bridge3DManager.scene3D;
            // let camera = (scene._bridge3DManager as Bridge3DManager).sharedCamera;
        }

    }

    private _removeRegister() {
        // 从Bridge3DManager注销
        if (this._isRegistered) {
            const scene = this.scene as Scene;
            if (scene && scene._bridge3DManager) {
                scene._bridge3DManager.unregisterBridge3D(this);
            }
            this._isRegistered = false;
        }
    }

    /**
     * 当节点从显示列表移除时调用
     * @remarks
     * - 覆写Sprite._onRemoved
     * - 从Bridge3DManager注销
     * @protected
     */
    protected _onRemoved(): void {
        super._onRemoved();
        this._removeRegister();
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
     */
    private _syncTransform2DTo3D(): void {
        const transform = this._containerSprite3D.transform;

        let localPosition = transform.localPosition;
        // 位置同步：2D逻辑坐标 → 3D世界坐标
        Bridge3DCoordinate.logicTo3D(this._x, this._y, 0, localPosition);

        transform.localPosition = localPosition;

        // 缩放同步(MVP阶段1:1映射)
        let localScale = transform.localScale;
        localScale.x = this._scaleX;
        localScale.y = this._scaleY;
        localScale.z = 1;
        transform.localScale = localScale;

        let localRotationEuler = transform.localRotationEuler;
        localRotationEuler.x = 0;
        localRotationEuler.y = 0;
        // 2D旋转直接映射到3D旋转（相机配置已处理坐标系对齐）
        localRotationEuler.z = this._rotation * Math.PI / 180;
        transform.localRotationEuler = localRotationEuler;
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
    }

    /**
     * 从管理列表移除渲染对象
     * @param render - 渲染对象
     * @internal
     */
    _removeRenderObject(render: BaseRender): void {
        this._list.remove(render);
        this._bridge3DRenderElement.removeBaseRenderNode(render.renderNode);
    }

    /**
     * 更新渲染对象，只在需要时重新收集
     * @internal
     */
    _renderUpdate(): void {
        let context = RenderContext3D._instance;
        let elements = this._list.elements;
        // 更新所有渲染对象
        for (let i = 0, len = elements.length; i < len; i++) {
            elements[i].renderUpdate(context);
        }
    }

    /**
     * 当节点销毁时调用
     * @remarks
     * - 覆写Node._onDestroy
     * - 销毁内部容器Sprite3D(会自动销毁所有子节点)
     * - 销毁渲染元素
     * - 从Bridge3DManager注销
     */
    onDestroy(): void {
        // 从Bridge3DManager注销
        this._removeRegister();

        // 清理渲染对象列表
        this._list.length = 0;

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
