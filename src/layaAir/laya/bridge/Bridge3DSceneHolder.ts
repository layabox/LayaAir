import { ILaya } from "../../ILaya";
import { Scene, IBridge3DSceneHolder } from "../display/Scene";
import { SerializeUtil } from "../loaders/SerializeUtil";
import { Bridge3DCamera } from "./Bridge3DCamera";
import { Bridge3DScene3D } from "./Bridge3DScene3D";
import { Bridge3DSprite, IBridgeRenderElement } from "./Bridge3DSprite";

/**
 * Bridge3DSceneHolder manages the lifecycle of Bridge3DScene3D and registered Bridge3DSprites.
 *
 * Responsibilities:
 * - Explicit Scene3D creation via initScene3D() (idempotent)
 * - Configuration caching (cameraZDistance stored on holder, synced to scene3d when created)
 * - Bridge3DSprite list management
 * - Stage lifecycle (addChild/removeChild on first/last sprite)
 * - Read-only access to sharedCamera, scene3d
 * - Register/unregister Bridge3DSprite
 * - Destroy scene3d and clear list
 */
export class Bridge3DSceneHolder implements IBridge3DSceneHolder {
    /** @internal */
    _scene2D: Scene;

    private _scene3d: Bridge3DScene3D | null = null;
    private _bridge3DList: Bridge3DSprite[] = [];
    private _isAddedToStage: boolean = false;
    private _cameraZDistance: number = 100;
    private _cameraFarPlane: number = 1000;

    /** @internal 反序列化时存储 Scene3D 属性数据，initScene3D 后 apply */
    private _scene3dSettingsData: Record<string, any> = {};
    /** @internal 反序列化时存储 Camera 属性数据，initScene3D 后 apply */
    private _cameraSettingsData: Record<string, any> = {};

    constructor(scene: Scene) {
        this._scene2D = scene;
    }

    /**
     * @en Get the Bridge3DScene3D instance (nullable, not auto-created)
     * @zh 获取 Bridge3DScene3D 实例（可能为 null，不会自动创建）
     */
    get scene3d(): Bridge3DScene3D | null {
        return this._scene3d;
    }

    /**
     * @en Get the shared Bridge3D camera (null if scene3d not yet created)
     * @zh 获取共享 Bridge3D 相机（scene3d 未创建时返回 null）
     */
    get sharedCamera(): Bridge3DCamera | null {
        return this._scene3d ? this._scene3d.sharedCamera : null;
    }

    /**
     * @en Camera Z distance. Stored on holder, synced to scene3d if created.
     * @zh 相机 Z 距离。存储在 holder 上，scene3d 创建后同步。
     */
    get cameraZDistance(): number {
        return this._cameraZDistance;
    }

    set cameraZDistance(value: number) {
        this._cameraZDistance = value;
        if (this._scene3d) {
            this._scene3d._applyCameraZDistance(value);
        }
    }

    /**
     * @en Camera far clipping plane distance. Stored on holder, synced to scene3d if created.
     * @zh 相机远裁面距离。存储在 holder 上，scene3d 创建后同步。
     */
    get cameraFarPlane(): number {
        return this._cameraFarPlane;
    }

    set cameraFarPlane(value: number) {
        this._cameraFarPlane = value;
        if (this._scene3d) {
            this._scene3d._applyCameraFarPlane(value);
        }
    }

    /**
     * @en Get the registered Bridge3DSprite list
     * @zh 获取已注册的 Bridge3DSprite 列表
     */
    get bridge3DList(): readonly Bridge3DSprite[] {
        return this._bridge3DList;
    }

    /**
     * @en Scene3D settings data. Used by runtime deserialization (ObjDecoder merges data into this object).
     * Applied to scene3d when initScene3D() is called.
     * @zh Scene3D 配置数据。运行时反序列化时 ObjDecoder 将数据 merge 进此对象，
     * initScene3D() 调用后 apply 到 scene3d。
     */
    get scene3dSettings(): Record<string, any> {
        return this._scene3dSettingsData;
    }

    /**
     * @en Camera settings data. Used by runtime deserialization (ObjDecoder merges data into this object).
     * Applied to sharedCamera when initScene3D() is called.
     * @zh Camera 配置数据。运行时反序列化时 ObjDecoder 将数据 merge 进此对象，
     * initScene3D() 调用后 apply 到 sharedCamera。
     */
    get cameraSettings(): Record<string, any> {
        return this._cameraSettingsData;
    }

    /**
     * @en Explicitly create Bridge3DScene3D (idempotent). Called internally by registerBridge3D.
     * @zh 显式创建 Bridge3DScene3D（幂等）。registerBridge3D 内部也会调用。
     */
    initScene3D(): Bridge3DScene3D {
        if (!this._scene3d) {
            this._scene3d = new Bridge3DScene3D(this);
            this._scene3d._scene2D = this._scene2D;
            this._scene3d._applyCameraZDistance(this._cameraZDistance);
        }
        return this._scene3d;
    }

    /**
     * @en Recursively apply settings data to target object.
     * For readonly properties (only getter, no setter), merge sub-properties into existing object.
     * @zh 递归地将配置数据应用到目标对象。
     * 对于只读属性（只有 getter 无 setter），将子属性 merge 到已有对象中。
     * @internal
     */
    private _applySettingsTo(target: any, data: Record<string, any>): void {
        if (!target || !data) return;
        for (const key in data) {
            const value = data[key];
            try {
                target[key] = value;
            } catch (e) {
                // Readonly property: merge sub-properties into existing object
                const existing = target[key];
                if (existing != null && typeof existing === 'object'
                    && value != null && typeof value === 'object') {
                    this._applySettingsTo(existing, value);
                }
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
        if (SerializeUtil.isDeserializing) return;

        const scene3d = this.initScene3D();

        // Add to stage if needed
        if (!this._isAddedToStage && this._bridge3DList.length > 0) {
            ILaya.stage.addChild(scene3d);
            this._isAddedToStage = true;
        }

        // Avoid duplicate addChild (e.g. when re-registering after holder replacement)
        if (bridge.containerSprite3D.parent !== scene3d) {
            scene3d.addChild(bridge.containerSprite3D);
        }

        // First time camera initialization
        if (!scene3d._cameraInitialized) {
            scene3d.setupCamera();
            scene3d._cameraInitialized = true;
        }

        // Register render element to process (one-time context/process binding + add to list)
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

            // Remove render element from process
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
     * @en Take over scene3d and bridges from old holder (used during holder replacement).
     * @zh 从旧 holder 接管 scene3d 和 bridge 列表（holder 替换时使用）。
     * @internal
     */
    _takeoverFrom(oldHolder: IBridge3DSceneHolder): void {
        const oldBridges = oldHolder.bridge3DList.slice();
        const oldScene3d = oldHolder.scene3d;

        if (this._scene3d) {
            // This holder already has scene3d (from deserialization), destroy old
            oldHolder.destroy();
        } else if (oldScene3d) {
            // Transfer old scene3d to this holder
            // Release old holder without destroying scene3d
            if (oldHolder instanceof Bridge3DSceneHolder) {
                if (oldHolder._isAddedToStage && oldHolder._scene3d) {
                    ILaya.stage.removeChild(oldHolder._scene3d);
                }
                oldHolder._scene3d = null;
                oldHolder._bridge3DList.length = 0;
                oldHolder._isAddedToStage = false;
                oldHolder._scene2D = null;
            }
            // Adopt the scene3d
            this._scene3d = oldScene3d as Bridge3DScene3D;
            (oldScene3d as Bridge3DScene3D)._setHolder(this);
            (oldScene3d as Bridge3DScene3D)._scene2D = this._scene2D;
            this._scene3d._applyCameraZDistance(this._cameraZDistance);
            this._scene3d._applyCameraFarPlane(this._cameraFarPlane);
        } else {
            // Neither has scene3d, just release old
            if (oldHolder instanceof Bridge3DSceneHolder) {
                oldHolder._scene2D = null;
            }
            oldHolder.destroy();
        }

        // Transfer bridge list
        for (const bridge of oldBridges) {
            if (this._bridge3DList.indexOf(bridge as Bridge3DSprite) === -1) {
                this._bridge3DList.push(bridge as Bridge3DSprite);
            }
        }

        // Finalize immediately if at runtime; during deserialization, onAfterDeserialize will handle it
        if (!SerializeUtil.isDeserializing) {
            this._finalizeSetup();
        }
    }

    /**
     * @en Finalize scene3d setup: add to stage, setup camera, register render elements.
     * Called by Scene.onAfterDeserialize after holder is assigned and bridges transferred.
     * @zh 完成 scene3d 初始化：添加到 stage、初始化相机、注册渲染元素。
     * 由 Scene.onAfterDeserialize 在 holder 赋值和 bridge 转移完成后调用。
     * @internal
     */
    _finalizeSetup(): void {
        if (!this._scene3d) {
            this.initScene3D();
        }
        if (!this._scene3d) return;

        // Apply settings after all properties have been deserialized
        this._applySettingsTo(this._scene3d, this._scene3dSettingsData);
        this._applySettingsTo(this._scene3d.sharedCamera, this._cameraSettingsData);

        if (this._bridge3DList.length === 0) return;

        const scene3d = this._scene3d;

        // Add to stage
        if (!this._isAddedToStage) {
            ILaya.stage.addChild(scene3d);
            this._isAddedToStage = true;
        }

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
     * @en Destroy the holder, scene3d, and clear the list.
     * @zh 销毁 holder、scene3d 并清空列表。
     */
    destroy(): void {
        if (this._scene3d) {
            if (this._isAddedToStage) {
                ILaya.stage.removeChild(this._scene3d);
                this._isAddedToStage = false;
            }
            // Destroy camera explicitly, then scene3d without destroying children
            this._scene3d.destroy(false);
            this._scene3d = null;
        }
        this._bridge3DList.length = 0;
        this._scene2D = null;
    }
}
