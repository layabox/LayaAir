import { ILaya } from "../../ILaya";
import { Scene, IBridge3DSceneHolder } from "../display/Scene";
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
     * @internal
     */
    get bridge3DList(): Bridge3DSprite[] {
        return this._bridge3DList;
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
     * @en Register a Bridge3DSprite. Internally calls initScene3D() to ensure scene3d exists.
     * @zh 注册 Bridge3DSprite。内部调用 initScene3D() 确保 scene3d 已创建。
     */
    registerBridge3D(bridge: Bridge3DSprite): void {
        if (this._bridge3DList.indexOf(bridge) !== -1) {
            return;
        }
        this._bridge3DList.push(bridge);

        const scene3d = this.initScene3D();

        // Add to stage if needed
        if (!this._isAddedToStage && this._bridge3DList.length > 0) {
            ILaya.stage.addChild(scene3d);
            this._isAddedToStage = true;
        }

        scene3d.addChild(bridge.containerSprite3D);

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
     * @en Destroy the holder, scene3d, and clear the list.
     * @zh 销毁 holder、scene3d 并清空列表。
     */
    destroy(): void {
        if (this._scene3d) {
            if (this._isAddedToStage) {
                ILaya.stage.removeChild(this._scene3d);
                this._isAddedToStage = false;
            }
            this._scene3d.destroy();
            this._scene3d = null;
        }
        this._bridge3DList.length = 0;
        this._scene2D = null;
    }
}
