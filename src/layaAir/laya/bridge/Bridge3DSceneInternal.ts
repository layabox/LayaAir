import { ILaya } from "../../ILaya";
import { Scene } from "../display/Scene";
import { SerializeUtil } from "../loaders/SerializeUtil";
import { ClassUtils } from "../utils/ClassUtils";
import { Bridge3DScene3D } from "./Bridge3DScene3D";
import { Bridge3DSprite, IBridgeRenderElement } from "./Bridge3DSprite";

/**
 * Bridge3DSceneInternal manages the runtime lifecycle of Bridge3DScene3D and registered Bridge3DSprites.
 * This is an internal class held by Scene._bridge3DInternal, NOT serialized.
 *
 * It reads configuration from Scene.bridge3D (the data holder).
 * @internal
 */
export class Bridge3DSceneInternal {
    /** @internal */
    _scene2D: Scene;
    /** @internal */
    _scene3d: Bridge3DScene3D | null = null;
    /** @internal */
    _bridge3DList: Bridge3DSprite[] = [];
    /** @internal */
    _isAddedToStage: boolean = false;

    constructor(scene: Scene) {
        this._scene2D = scene;
    }

    _onAdded(){
        // Add to stage if needed
        if (!this._isAddedToStage && this._bridge3DList.length > 0) {
            ILaya.stage.addChild(this._scene3d);
            this._isAddedToStage = true;
        }

    }

    _onRemoved(){
        if (this._isAddedToStage) {
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
     * @en Explicitly create Bridge3DScene3D (idempotent).
     * @zh 显式创建 Bridge3DScene3D（幂等）。
     */
    initScene3D(): Bridge3DScene3D {
        if (!this._scene3d) {
            const holder = this._scene2D.bridge3D;
            this._scene3d = new Bridge3DScene3D(this);
            this._scene3d._scene2D = this._scene2D;
            if (holder) {
                this._scene3d._applyCameraZDistance(holder.cameraZDistance);
            }
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

        // During deserialization, only add to list; scene3d will be set up later
        if (SerializeUtil.isDeserializing || !this._scene2D.displayedInStage) return;

        const scene3d = this.initScene3D();

        // Add to stage if needed
        if (!this._isAddedToStage && this._bridge3DList.length > 0) {
            ILaya.stage.addChild(scene3d);
            this._isAddedToStage = true;
        }

        // Avoid duplicate addChild
        if (bridge.containerSprite3D.parent !== scene3d) {
            scene3d.addChild(bridge.containerSprite3D);
        }

        // First time camera initialization
        if (!scene3d._cameraInitialized) {
            scene3d.setupCamera();
            scene3d._cameraInitialized = true;
        }

        // Register render element to process
        const element = bridge.bridge3DRenderElement as IBridgeRenderElement;
        if (element) {
            const process = scene3d.sharedCamera.bridge3DRenderProcess;
            element.setBridge3DContext(scene3d.bridge3DContext);
            element.setRenderProcess(process);
            process.addBridgeElement(element);
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
            this._scene3d._applyCameraZDistance(data.cameraZDistance);
            this._scene3d._applyCameraFarPlane(data.cameraFarPlane);
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
        } else {
            this._scene3d._applyCameraZDistance(100);
            this._scene3d._applyCameraFarPlane(1000);
        }
    }

    /**
     * @en Finalize scene3d setup: apply settings, add to stage, setup camera, register render elements.
     * Called by Scene.onAfterDeserialize after bridge3D data and bridges are ready.
     * @zh 完成 scene3d 初始化：应用配置、添加到 stage、初始化相机、注册渲染元素。
     * @internal
     */
    finalizeSetup(): void {
        if (!this._scene3d) {
            this.initScene3D();
        }
        if (!this._scene3d) return;

        // Apply settings from the data holder
        const holder = this._scene2D.bridge3D;
        if (holder) {
            this._applySettingsTo(this._scene3d, holder.scene3dSettings);
            this._applySettingsTo(this._scene3d.sharedCamera, holder.cameraSettings);
        }

        if (this._bridge3DList.length === 0) return;

        const scene3d = this._scene3d;

        // Setup camera
        if (!scene3d._cameraInitialized) {
            scene3d.setupCamera();
            scene3d._cameraInitialized = true;
        }

        // Ensure all bridges are fully connected
        for (const bridge of this._bridge3DList) {
            if (bridge.containerSprite3D.parent !== scene3d) {
                scene3d.addChild(bridge.containerSprite3D);
            }
            const element = bridge.bridge3DRenderElement as IBridgeRenderElement;
            if (element) {
                const process = scene3d.sharedCamera.bridge3DRenderProcess;
                element.setBridge3DContext(scene3d.bridge3DContext);
                element.setRenderProcess(process);
                process.addBridgeElement(element);
            }
        }
    }

    /**
     * @en Destroy scene3d and clear the list.
     * @zh 销毁 scene3d 并清空列表。
     */
    destroy(): void {
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
