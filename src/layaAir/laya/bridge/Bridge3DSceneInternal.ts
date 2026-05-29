import { ILaya } from "../../ILaya";
import { IBridge3DSceneInternal, Scene } from "../display/Scene";
import { Event } from "../events/Event";
import { SerializeUtil } from "../loaders/SerializeUtil";
import { ClassUtils } from "../utils/ClassUtils";
import { RenderState2D } from "../webgl/utils/RenderState2D";
import { Bridge3DScene3D } from "./Bridge3DScene3D";
import { Bridge3DSprite, IBridgeRenderElement } from "./Bridge3DSprite";

/**
 * Bridge3DSceneInternal manages the runtime lifecycle of Bridge3DScene3D and registered Bridge3DSprites.
 * This is an internal class held by Scene._bridge3DInternal, NOT serialized.
 *
 * It reads configuration from Scene.bridge3D (the data holder).
 */
export class Bridge3DSceneInternal implements IBridge3DSceneInternal{
    /** @internal */
    _scene2D: Scene;
    /** @internal */
    _scene3d: Bridge3DScene3D | null = null;
    /** @internal */
    _bridge3DList: Bridge3DSprite[] = [];
    /** @internal */
    _isAddedToStage: boolean = false;
    /** @internal sceneOffset 监听是否已挂上 */
    private _offsetListenersHooked: boolean = false;

    constructor(scene: Scene) {
        this._scene2D = scene;
    }

    /**
     * 根据 Scene 当前的 globalTrans + stage 高度，更新 Bridge3DCamera 的 sceneOffsetMatrix。
     * 触发时机：Scene transform 改变、stage resize、scene3d 首次创建。
     * @private
     */
    private _updateSceneOffset = (): void => {
        if (!this._scene3d || !this._scene2D) return;
        const cam = this._scene3d.sharedCamera;
        if (!cam) return;
        const m = this._scene2D.globalTrans.getMatrix();
        const renderH = RenderState2D.height || ILaya.stage.height;
        const sceneH = this._scene2D.height || renderH;
        cam.setSceneOffsetFrom2DMatrix(m.a, m.b, m.c, m.d, m.tx, m.ty, renderH, sceneH);
        this._scene3d.updateContext();
    };

    private _onScene2DResize = (): void => {
        if (this._scene3d) {
            this._scene3d.onStageResize();
        }
        this._updateSceneOffset();
        for (let i = 0, len = this._bridge3DList.length; i < len; i++) {
            this._bridge3DList[i]._onScene2DResize();
        }
    };

    /**
     * 挂载 sceneOffset 相关事件监听（idempotent）。
     * @private
     */
    private _hookOffsetListeners(): void {
        if (this._offsetListenersHooked) return;
        this._scene2D.on(Event.TRANSFORM_CHANGED, this, this._updateSceneOffset);
        this._scene2D.on(Event.RESIZE, this, this._onScene2DResize);
        ILaya.stage.on(Event.RESIZE, this, this._updateSceneOffset);
        this._offsetListenersHooked = true;
    }

    /**
     * 卸载 sceneOffset 相关事件监听。
     * @private
     */
    private _unhookOffsetListeners(): void {
        if (!this._offsetListenersHooked) return;
        this._scene2D && this._scene2D.off(Event.TRANSFORM_CHANGED, this, this._updateSceneOffset);
        this._scene2D && this._scene2D.off(Event.RESIZE, this, this._onScene2DResize);
        ILaya.stage && ILaya.stage.off(Event.RESIZE, this, this._updateSceneOffset);
        this._offsetListenersHooked = false;
    }

    _onAdded(){
        // Add to stage if needed
        if (!this._isAddedToStage && this._bridge3DList.length > 0) {
            ILaya.stage.addChild(this._scene3d);
            this._isAddedToStage = true;
        }

    }

    _onRemoved(){
        if (this._scene3d && this._isAddedToStage) {
            ILaya.stage.removeChild(this._scene3d);
            this._isAddedToStage = false;
        }
    }

    /**
     * @en Get the Bridge3DScene3D instance (nullable)
     * @zh 获取 Bridge3DScene3D 实例（可能为 null）
     */
    get scene3d(): Bridge3DScene3D | null {
        return this._scene3d;
    }

    /**
     * @en Get the shared Bridge3D camera (null if scene3d not yet created)
     * @zh 获取共享 Bridge3D 相机（scene3d 未创建时返回 null）
     */
    get sharedCamera(): any {
        return this._scene3d ? this._scene3d.sharedCamera : null;
    }

    /**
     * @en Get the registered Bridge3DSprite list
     * @zh 获取已注册的 Bridge3DSprite 列表
     */
    get bridge3DList(): readonly Bridge3DSprite[] {
        return this._bridge3DList;
    }

    /**
     * @en Create Bridge3DScene3D and apply initial settings from the holder (idempotent).
     * Camera intrinsics are set inside Bridge3DScene3D's constructor; here we only
     * forward the data-driven scene3dSettings / cameraSettings.
     * @zh 创建 Bridge3DScene3D 并套用 holder 的初始配置（幂等）。
     * 相机内参已在 Bridge3DScene3D 构造中完成，此处仅下发数据层的 scene3dSettings / cameraSettings。
     */
    initScene3D(): Bridge3DScene3D {
        if (!this._scene3d) {
            this._scene3d = new Bridge3DScene3D(this);
            this._scene3d._scene2D = this._scene2D;

            const holder = this._scene2D.bridge3D;
            if (holder) {
                this._scene3d.applyCameraZDistance(holder.cameraZDistance);
                this._scene3d.applyCameraFarPlane(holder.cameraFarPlane);
                this._applySettingsTo(this._scene3d, holder.scene3dSettings);
                this._applySettingsTo(this._scene3d.sharedCamera, holder.cameraSettings);
                this._scene3d.applyOrthographicCamera(holder.orthographicCamera);
            }

            // 创建相机后立即推送一次 sceneOffsetMatrix，并挂上监听
            this._hookOffsetListeners();
            this._updateSceneOffset();
        }
        return this._scene3d;
    }

    /**
     * @en Recursively apply settings data to target object.
     * @zh 递归地将配置数据应用到目标对象。
     * @internal
     */
    /** @internal getter-only 属性，需要递归应用子属性而非直接赋值 */
    private static _readonlyKeys = new Set(["skyRenderer"]);

    private _applySettingsTo(target: any, data: Record<string, any>): void {
        if (!target || !data) return;
        for (const key in data) {
            const value = data[key];
            if (value == null) continue;

            if (Bridge3DSceneInternal._readonlyKeys.has(key)) {
                const existing = target[key];
                if (existing != null && typeof value === 'object') {
                    this._applySettingsTo(existing, value);
                }
            } else {
                target[key] = value;
            }
        }
    }

    /**
     * @en Register a Bridge3DSprite. Internally calls initScene3D() to ensure scene3d exists.
     * @zh 注册 Bridge3DSprite。内部调用 initScene3D() 确保 scene3d 已创建。
     */
    registerBridge3D(bridge: Bridge3DSprite): void {
        if (this._bridge3DList.indexOf(bridge) !== -1) {
            return;
        }
        this._bridge3DList.push(bridge);

        // Ensure scene3d exists and reparent the container into it (with render element hookup).
        const scene3d = this.initScene3D();

        if (bridge.containerSprite3D.parent !== scene3d) {
            bridge.containerSprite3D.removeSelf();
            scene3d.addChild(bridge.containerSprite3D);

            // Register render element to process
            const element = bridge.bridge3DRenderElement as IBridgeRenderElement;
            if (element) {
                const process = scene3d.sharedCamera.bridge3DRenderProcess;
                element.setBridge3DContext(scene3d.bridge3DContext);
                element.setRenderProcess(process);
                process.addBridgeElement(element);
            }
        }

        // Defer attaching scene3d to the stage during deserialization or before the scene is displayed;
        // _onAdded will perform the attach once the scene is added to the stage.
        if (SerializeUtil.isDeserializing || !this._scene2D.displayedInStage) return;
        if (!this._isAddedToStage && this._bridge3DList.length > 0) {
            ILaya.stage.addChild(scene3d);
            this._isAddedToStage = true;
        }
    }

    /**
     * @en Unregister a Bridge3DSprite.
     * @zh 取消注册 Bridge3DSprite。
     */
    unregisterBridge3D(bridge: Bridge3DSprite): void {
        const index = this._bridge3DList.indexOf(bridge);
        if (index !== -1) {
            this._bridge3DList.splice(index, 1);

            if (this._scene3d) {
                const element = bridge.bridge3DRenderElement as IBridgeRenderElement;
                if (element) {
                    this._scene3d.sharedCamera.bridge3DRenderProcess.removeBridgeElement(element);
                }
                this._scene3d.removeChild(bridge.containerSprite3D);
            }
        }

        // Remove from stage if no more bridges
        if (this._isAddedToStage && this._bridge3DList.length === 0 && this._scene3d) {
            ILaya.stage.removeChild(this._scene3d);
            this._isAddedToStage = false;
        }
    }

    /**
     * @en Apply data from bridge3D holder to runtime. Called when bridge3D is set/replaced.
     * If data is null, resets to defaults.
     * @zh 将 bridge3D 数据应用到运行时。bridge3D 赋值/替换时调用。
     * data 为 null 时恢复默认值。
     */
    applyData(data: any): void {
        if (!this._scene3d) return;
        if (data) {
            this._scene3d.applyCameraZDistance(data.cameraZDistance);
            this._scene3d.applyCameraFarPlane(data.cameraFarPlane);
            this._scene3d.applyOrthographicCamera(data.orthographicCamera);
            // 编辑器的 forwarding proxy 带有 _applyCache，跳过（proxy 直接读写 scene3d）
            // 运行时原始数据 Record 没有 _applyCache，正常 apply
            const s3d = data.scene3dSettings;
            if (s3d && !s3d._applyCache) {
                this._applySettingsTo(this._scene3d, s3d);
            }
            const cam = data.cameraSettings;
            if (cam && !cam._applyCache) {
                this._applySettingsTo(this._scene3d.sharedCamera, cam);
            }
            this._scene3d.applyOrthographicCamera(data.orthographicCamera);
        } else {
            this._scene3d.applyCameraZDistance(100);
            this._scene3d.applyCameraFarPlane(1000);
            this._scene3d.applyOrthographicCamera(true);
        }
    }

    /**
     * @en Re-apply holder settings after deserialization, once bridge3D data is fully populated.
     * Called by Scene.onAfterDeserialize. Scene3D creation, camera intrinsics and bridge
     * registration already happened inside registerBridge3D / initScene3D — this is only a
     * final data-apply pass to cover the case where holder data arrives after the bridges.
     * @zh 反序列化完成、holder 数据就绪后重新套用一次配置。
     * scene3d 创建、相机内参、bridge 注册都已在 registerBridge3D / initScene3D 中完成，
     * 此处仅做一次最终的数据 apply，覆盖 holder 数据晚于 bridge 到位的情况。
     * @internal
     */
    finalizeSetup(): void {
        if (!this._scene3d) return;

        const holder = this._scene2D.bridge3D;
        if (holder) {
            this._scene3d.applyCameraZDistance(holder.cameraZDistance);
            this._scene3d.applyCameraFarPlane(holder.cameraFarPlane);
            this._applySettingsTo(this._scene3d, holder.scene3dSettings);
            this._applySettingsTo(this._scene3d.sharedCamera, holder.cameraSettings);
            this._scene3d.applyOrthographicCamera(holder.orthographicCamera);
        }
    }

    /**
     * @en Destroy scene3d and clear the list.
     * @zh 销毁 scene3d 并清空列表。
     */
    destroy(): void {
        this._unhookOffsetListeners();
        if (this._scene3d) {
            if (this._isAddedToStage) {
                ILaya.stage.removeChild(this._scene3d);
                this._isAddedToStage = false;
            }
            this._scene3d.destroy(false);
            this._scene3d = null;
        }
        this._bridge3DList.length = 0;
        this._scene2D = null;
    }
}
