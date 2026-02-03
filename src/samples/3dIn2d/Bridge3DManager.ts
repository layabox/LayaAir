import { IBridge3DManager, Scene } from "../../layaAir/laya/display/Scene";
import { Scene3D } from "../../layaAir/laya/d3/core/scene/Scene3D";
import { Vector3 } from "../../layaAir/laya/maths/Vector3";
import { Bridge3DSprite } from "./Bridge3DSprite";
import { ILaya } from "../../layaAir/ILaya";
import { Bridge3DScene3D } from "./Bridge3DScene3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Event } from "laya/events/Event";
import { Bridge3DCamera } from "./Bridge3DCamera";
import { RenderState2D } from "../../layaAir/laya/webgl/utils/RenderState2D";

/**
 * Bridge3DManager是Scene2D的桥接管理器,负责协调场景内所有Bridge3DSprite的生命周期和共享资源
 *
 * @class Bridge3DManager
 */
export class Bridge3DManager implements IBridge3DManager{
    /**
     * 所属的Scene2D
     * @private
     */
    private _scene: Scene;

    /**
     * 内部Scene3D实例,提供完整的3D场景上下文
     * @private
     * @remarks
     * - 所有Bridge3DSprite共享此Scene3D
     * - _bridge3DList 由 Scene3D 管理，Manager 仅委托与协调相机等
     */
    private _scene3D: Bridge3DScene3D;

    /**
     * 共享的Bridge3D相机
     * @private
     */
    private _sharedCamera: Bridge3DCamera;


    /**
     * 相机是否已初始化
     * @private
     */
    private _cameraInitialized: boolean = false;

    /**
     * 是否已添加到Stage
     * @private
     */
    private _isAddedToStage: boolean = false;

    /**
     * 创建Bridge3DManager实例
     * @param scene - 所属的Scene2D实例
     * @remarks
     * - 每个Scene2D拥有唯一的Bridge3DManager
     * - 自动创建内部Scene3D实例和共享正交相机
     */
    constructor(scene: Scene) {
        this._scene = scene;

        // 创建轻量级Scene3D实例，优化渲染对象管理性能
        this._scene3D = new Bridge3DScene3D();
        this._scene3D._manager = this;

        // 创建共享Bridge3D相机并添加到Scene3D
        this._sharedCamera = new Bridge3DCamera();
        this._sharedCamera.orthographic = true;
        this._scene3D.addChild(this._sharedCamera);
        this._scene3D.updateContext();
        ILaya.stage.on(Event.RESIZE, this, this.onStageResize);
    }

    /**
     * 获取共享的Bridge3D相机
     * @readonly
     * @remarks
     * - 所有Bridge3DSprite共享此相机
     * - 相机由manager管理,用户不应销毁或替换
     */
    get sharedCamera(): Bridge3DCamera {
        return this._sharedCamera;
    }

    /**
     * 获取Bridge3D阴影渲染相机（就是共享相机）
     * @readonly
     * @remarks
     * - 专用于Bridge3D元素的阴影渲染
     * - 由manager管理,用户不应销毁或替换
     */
    get bridge3DShadowCamera(): Bridge3DCamera {
        return this._sharedCamera;
    }

    /**
     * 获取内部Scene3D实例
     * @readonly
     * @remarks
     * - Bridge3DSprite的容器节点会被添加到此Scene3D
     * - 提供完整的3D场景管理和组件生命周期
     */
    get scene3D(): Bridge3DScene3D {
        return this._scene3D;
    }

    /**
     * 注册Bridge3DSprite
     * @param bridge - 要注册的Bridge3DSprite实例
     * @remarks
     * - 由Bridge3DSprite._onAdded()自动调用
     * - 将bridge添加到内部管理列表
     * - 将bridge的容器Sprite3D添加到Scene3D(自动设置_scene引用)
     * - 如果是首个注册的bridge,触发相机初始化
     */
    registerBridge3D(bridge: Bridge3DSprite): void {
        // 委托给 Scene3D 管理 _bridge3DList 与 addChild(container)
        this._scene3D.registerBridge3D(bridge);

        // 首次注册时初始化相机
        if (!this._cameraInitialized && ILaya.stage) {
            this.setupCamera(ILaya.stage);
            this._cameraInitialized = true;
        }

        if (!this._isAddedToStage && this._scene3D.bridge3DListLength > 0) {
            ILaya.stage.addChild(this._scene3D);
            this._isAddedToStage = true;
        }
    }

    /**
     * 注销Bridge3DSprite
     * @param bridge - 要注销的Bridge3DSprite实例
     * @remarks
     * - 由Bridge3DSprite._onRemoved()和_onDestroy()自动调用
     * - 从内部管理列表移除
     * - 从Scene3D移除bridge的容器Sprite3D
     */
    unregisterBridge3D(bridge: Bridge3DSprite): void {
        this._scene3D.unregisterBridge3D(bridge);

        if (this._isAddedToStage && this._scene3D.bridge3DListLength === 0) {
            ILaya.stage.removeChild(this._scene3D);
            this._isAddedToStage = false;
        }
    }

    /**
     * 设置共享相机
     * @param stage - Stage实例,用于获取舞台尺寸
     * @remarks
     * - 配置正交投影参数
     * - 设置相机位置和朝向(lookAt)
     * - 在首次注册bridge或舞台尺寸变化时调用
     * - 使用RenderState2D的实际渲染尺寸而非stage逻辑尺寸
     */
    setupCamera(stage: any): void {
        // 使用实际渲染尺寸（考虑stage缩放）
        const width = RenderState2D.width || stage.width;
        const height = RenderState2D.height || stage.height;

        // 配置正交投影参数
        this._sharedCamera.orthographic = true;
        this._sharedCamera.orthographicVerticalSize = height;  // 使用完整高度
        this._sharedCamera.nearPlane = 0.1;
        this._sharedCamera.farPlane = 1000;

        // 设置相机位置(舞台中心，Z负方向)
        const centerX = width / 2;
        const centerY = height / 2;
        const cameraZ = -100;  // 相机在Z负方向

        let localPosition = this._sharedCamera.transform.localPosition;
        localPosition.x = centerX;
        localPosition.y = centerY;
        localPosition.z = cameraZ;
        this._sharedCamera.transform.localPosition = localPosition;

        // 设置相机朝向：从Z负方向看向Z正方向(屏幕内)
        // 1. 使用up=(0,-1,0)使Y向下
        let rotationEuler = this._sharedCamera.transform.rotationEuler;
        rotationEuler.x = 0;
        rotationEuler.y = 180;
        rotationEuler.z = 180;
        this._sharedCamera.transform.rotationEuler = rotationEuler;
    }

    /**
     * 处理舞台尺寸变化
     * @param width - 新的舞台宽度
     * @param height - 新的舞台高度
     * @remarks
     * - 由Scene2D监听Stage.EVENT_RESIZE事件时调用
     * - 重新配置共享相机的投影参数和位置
     * - 使用RenderState2D的实际渲染尺寸而非stage逻辑尺寸
     */
    onStageResize(): void {
        // 使用实际渲染尺寸（考虑stage缩放）
        const width = RenderState2D.width || ILaya.stage.width;
        const height = RenderState2D.height || ILaya.stage.height;

        // 重新配置相机
        this._sharedCamera.orthographicVerticalSize = height;  // 使用完整高度

        const centerX = width / 2;
        const centerY = height / 2;
        const cameraZ = -100;  // 相机在Z负方向

        let localPosition = this._sharedCamera.transform.localPosition;
        localPosition.x = centerX;
        localPosition.y = centerY;
        localPosition.z = cameraZ;
        this._sharedCamera.transform.localPosition = localPosition;
    }

    /**
     * 销毁管理器
     * @remarks
     * - 由Scene2D销毁时调用
     * - 注销所有Bridge3DSprite
     * - 销毁Scene3D(会自动销毁相机和所有容器节点)
     * - 清理内部资源
     */
    destroy(): void {
        ILaya.stage.off(Event.RESIZE, this, this.onStageResize);
        // Bridge3D 列表由 Scene3D 在 destroy 时清空

        // 销毁Scene3D(会自动销毁相机等所有子节点)
        if (this._scene3D) {
            this._scene3D.destroy();
            this._scene3D = null;
        }

        // 清空引用(已被Scene3D销毁)
        this._sharedCamera = null;
        this._scene = null;
    }
}
