import { ILaya } from "../../ILaya";
import { BaseRender } from "../d3/core/render/BaseRender";
import { RenderContext3D } from "../d3/core/render/RenderContext3D";
import { AmbientMode } from "../d3/core/scene/AmbientMode";
import { Scene3D } from "../d3/core/scene/Scene3D";
import { Sprite3D } from "../d3/core/Sprite3D";
import { IBridge3DScene, Scene } from "../display/Scene";
import { Event } from "../events/Event";
import { Color } from "../maths/Color";
import { RenderListQueue } from "../RenderDriver/DriverCommon/RenderListQueue";
import { FastSinglelist } from "../utils/SingletonList";
import { RenderState2D } from "../webgl/utils/RenderState2D";
import { Bridge3DCamera } from "./Bridge3DCamera";
import { Bridge3DContext } from "./Bridge3DContext";
import { Bridge3DRenderElement } from "./Bridge3DRenderElement";
import { Bridge3DSprite } from "./Bridge3DSprite";
import { Config3D } from "../../Config3D";
import { Utils3D } from "../d3/utils/Utils3D";
import { Texture2D } from "../resource/Texture2D";

/**
 * Bridge3DScene3D is a lightweight Scene3D implementation optimized for Bridge3D system
 *
 * Main optimizations:
 * 1. _addRenderObject/_removeRenderObject delegated to Bridge3DSprite management
 * 2. _update only updates root-level Bridge3DSprite renderUpdate, avoiding redundant _collectRenderNodes
 * 3. Removes unnecessary heavyweight features (physics, light management, volume management, etc.)
 * 4. Manages shared camera and stage lifecycle directly (merged from Bridge3DManager)
 *
 * @class Bridge3DScene3D
 * @extends Scene3D
 */
export class Bridge3DScene3D extends Scene3D implements IBridge3DScene {
    /**
     * Shared Bridge3D camera
     * @private
     */
    private _sharedCamera: Bridge3DCamera;

    /**
     * Whether camera has been initialized
     * @private
     */
    private _cameraInitialized: boolean = false;

    /**
     * Whether added to Stage
     * @private
     */
    private _isAddedToStage: boolean = false;

    /**
     * Render object to Bridge3DSprite mapping
     * @private
     */
    private _renderToBridgeMap: Map<BaseRender, Bridge3DSprite> = new Map();

    /**
     * Registered Bridge3DSprite list (managed by this Scene3D)
     * @private
     */
    private _bridge3DList: Bridge3DSprite[] = [];

    /**
     * Collected opaque render queue list
     * @private
     */
    private _opaqueListQueues: FastSinglelist<RenderListQueue> = new FastSinglelist;

    /**
     * Bridge3D rendering context (unified held and managed by Scene3D)
     * @private
     */
    private _bridge3DContext: Bridge3DContext;

    /**
     * Camera Z distance (negative value means camera is in front of the scene)
     * @private
     */
    private _cameraZDistance: number = 100;

    /**
     * Bridge3D独立的灯光贴图
     * @private
     */
    private _bridge3DLightTexture: Texture2D = null;

    /**
     * 重写获取灯光贴图方法，返回Bridge3D独立的灯光贴图
     * @internal
     */
    protected _getLightTexture(): Texture2D {
        return this._bridge3DLightTexture;
    }

    /**
     * Registered Bridge3DSprite count
     * @readonly
     */
    get bridge3DListLength(): number {
        return this._bridge3DList.length;
    }

    /**
     * Get or set the camera Z distance
     * @remarks
     * - Negative values place the camera in front of the scene (looking towards positive Z)
     * - Default value is -100
     * - Changing this value will update the camera position immediately
     */
    get cameraZDistance(): number {
        return this._cameraZDistance;
    }

    set cameraZDistance(value: number) {
        if (this._cameraZDistance !== value) {
            this._cameraZDistance = value;
            // Update camera position immediately if camera is initialized
            if (this._cameraInitialized) {
                this._updateCameraPosition();
            }
        }
    }

    /**
     * Get the shared Bridge3D camera
     * @readonly
     * @remarks
     * - All Bridge3DSprites share this camera
     * - Camera is managed by Scene3D, users should not destroy or replace it
     */
    get sharedCamera(): Bridge3DCamera {
        return this._sharedCamera;
    }

    /**
     * Get the Bridge3D shadow rendering camera (same as shared camera)
     * @readonly
     * @remarks
     * - Dedicated for Bridge3D element shadow rendering
     * - Managed by Scene3D, users should not destroy or replace it
     */
    get bridge3DShadowCamera(): Bridge3DCamera {
        return this._sharedCamera;
    }

    /**
     * Create Bridge3DScene3D instance
     * @remarks
     * - Each Scene2D has a unique Bridge3DScene3D
     * - Automatically creates internal shared orthographic camera
     */
    constructor() {
        super();

        // 创建Bridge3D独立的灯光贴图（复用全局pixels数组）
        if (Config3D._multiLighting) {
            const width = 4;
            const maxLightCount = Config3D.maxLightCount;
            this._bridge3DLightTexture = Utils3D._createFloatTextureBuffer(width, maxLightCount);
            this._bridge3DLightTexture.lock = true;
        }

        // Create unified Bridge3D rendering context
        this._bridge3DContext = new Bridge3DContext();
        // 设置Bridge3D独立的灯光贴图到context
        this._bridge3DContext.setBridge3DLightData(this._bridge3DLightTexture, this._getLightPixels());

        this.ambientMode = AmbientMode.SolidColor;

        // Create shared Bridge3D camera and add to Scene3D
        this._sharedCamera = new Bridge3DCamera();
        this._sharedCamera.orthographic = true;
        this.addChild(this._sharedCamera);
        this.updateContext();

        // Listen to stage resize
        ILaya.stage.on(Event.RESIZE, this, this.onStageResize);
    }

    updateContext() {
        // Update Scene3D's unified Bridge3DContext data
        this._bridge3DContext.setSceneData(this._shaderValues);
        this._bridge3DContext.setCameraData(this._sharedCamera._shaderValues);
        this._bridge3DContext.setSceneModuleData(this._sceneModuleData);
        this._bridge3DContext.setCameraModuleData(this._sharedCamera._renderDataModule);
        this._bridge3DContext.updateFromCamera(this._sharedCamera);
    }

    /**
     * 重写 _addRenderObject，委托给对应的 Bridge3DSprite 管理
     * @param render - 渲染对象
     * @internal
     */
    _addRenderObject(render: BaseRender): void {

        super._addRenderObject(render);

        // 找到渲染对象所属的 Bridge3DSprite
        const bridge = this._findOwnerBridge3DSprite(render.owner as Sprite3D);
        if (bridge) {
            // 委托给 Bridge3DSprite 管理
            bridge._addRenderObject(render);
            this._renderToBridgeMap.set(render, bridge);
        }
    }


    /**
     * 查找渲染对象所属的 Bridge3DSprite
     * @param sprite
     * @returns 所属的 Bridge3DSprite，如果找不到返回 null
     * @private
     */
    private _findOwnerBridge3DSprite(node: Sprite3D): Bridge3DSprite | null {
        const list = this._bridge3DList;
        while (node) {
            for (let i = 0, len = list.length; i < len; i++) {
                const bridge = list[i];
                if (node === bridge.containerSprite3D) {
                    return bridge;
                }
            }
            node = node._parent as Sprite3D;
        }
        return null;
    }

    /**
     * 重写 _removeRenderObject，从对应的 Bridge3DSprite 移除
     * @param render - 渲染对象
     * @internal
     */
    _removeRenderObject(render: BaseRender): void {

        super._removeRenderObject(render);

        const bridge = this._renderToBridgeMap.get(render);
        if (bridge) {
            // 委托给 Bridge3DSprite 管理
            bridge._removeRenderObject(render);
            this._renderToBridgeMap.delete(render);
        }
    }

    /**
     * Register Bridge3DSprite and add its container to this Scene3D
     * @param bridge - Bridge3DSprite to register
     * @internal
     */
    registerBridge3D(bridge: Bridge3DSprite): void {
        if (this._bridge3DList.indexOf(bridge) !== -1) {
            return;
        }
        this._bridge3DList.push(bridge);

        // Add to stage if needed
        if (!this._isAddedToStage && this._bridge3DList.length > 0) {
            ILaya.stage.addChild(this);
            this._isAddedToStage = true;
        }

        this.addChild(bridge.containerSprite3D);

        // First time initialization
        if (!this._cameraInitialized) {
            this.setupCamera();
            this._cameraInitialized = true;
        }

    }

    /**
     * Unregister Bridge3DSprite and remove its container from this Scene3D
     * @param bridge - Bridge3DSprite to unregister
     * @internal
     */
    unregisterBridge3D(bridge: Bridge3DSprite): void {
        const index = this._bridge3DList.indexOf(bridge);
        if (index !== -1) {
            this._bridge3DList.splice(index, 1);
            this.removeChild(bridge.containerSprite3D);
        }

        // Remove from stage if no more bridges
        if (this._isAddedToStage && this._bridge3DList.length === 0) {
            ILaya.stage.removeChild(this);
            this._isAddedToStage = false;
        }
    }

    /**
     * Get registered Bridge3DSprite list (for Manager iteration, etc.)
     * @internal
     */
    getBridge3DList(): Bridge3DSprite[] {
        return this._bridge3DList;
    }

    /**
     * Update camera position based on current stage size and camera Z distance
     * @private
     */
    private _updateCameraPosition(): void {
        // Use actual render size (considering stage scaling)
        const width = RenderState2D.width || ILaya.stage.width;
        const height = RenderState2D.height || ILaya.stage.height;

        // Set camera position (stage center, at configured Z distance)
        const centerX = width / 2;
        const centerY = height / 2;

        let localPosition = this._sharedCamera.transform.localPosition;
        localPosition.x = centerX;
        localPosition.y = centerY;
        localPosition.z = this._cameraZDistance;
        this._sharedCamera.transform.localPosition = localPosition;
    }

    /**
     * Setup shared camera
     * @remarks
     * - Configure orthographic projection parameters
     * - Set camera position and orientation (lookAt)
     * - Called on first bridge registration or stage resize
     * - Uses RenderState2D's actual render size instead of stage logical size
     */
    setupCamera(): void {
        // Use actual render size (considering stage scaling)
        const width = RenderState2D.width;
        const height = RenderState2D.height;

        // Configure orthographic projection parameters
        this._sharedCamera.orthographic = true;
        this._sharedCamera.orthographicVerticalSize = height;  // Use full height
        this._sharedCamera.nearPlane = 0.1;
        this._sharedCamera.farPlane = 1000;

        // Set camera position using the configured Z distance
        this._updateCameraPosition();

        // Set camera orientation: look from positive Z towards negative Z (standard 3D convention)
        // Use up=(0,+1,0) so that Y points up in 3D world space
        let rotationEuler = this._sharedCamera.transform.rotationEuler;
        rotationEuler.x = 0;
        rotationEuler.y = 0;
        rotationEuler.z = 0;
        this._sharedCamera.transform.rotationEuler = rotationEuler;
    }

    /**
     * Handle stage resize
     * @remarks
     * - Called when Scene2D listens to Stage.EVENT_RESIZE event
     * - Reconfigure shared camera projection parameters and position
     * - Uses RenderState2D's actual render size instead of stage logical size
     */
    onStageResize(): void {
        // Use actual render size (considering stage scaling)
        const width = RenderState2D.width || ILaya.stage.width;
        const height = RenderState2D.height || ILaya.stage.height;

        // Reconfigure camera
        this._sharedCamera.orthographicVerticalSize = height;  // Use full height

        // Update camera position using the configured Z distance
        this._updateCameraPosition();
    }

    /**
     * 准备所有Bridge3D渲染元素（在renderSubmit中调用）
     *
     * @remarks
     * 该方法遍历所有注册的Bridge3DSprite，调用其Bridge3DRenderElement的_prepare方法。
     * 这是渲染流程的关键步骤，必须在相机渲染之前完成。
     *
     * Context管理：
     * - 更新Scene3D统一持有的Bridge3DContext数据
     * - 将context传递给每个Bridge3DRenderElement使用
     */
    prepareAllBridge3DElements(): void {
        // 清空之前收集的渲染队列
        this._opaqueListQueues.length = 0;

        // 遍历所有Bridge3DSprite，调用其Bridge3DRenderElement的_prepare方法
        for (const bridge3DSprite of this._bridge3DList) {
            if (!bridge3DSprite) {
                continue;
            }

            const bridge3DElement = bridge3DSprite.bridge3DRenderElement as Bridge3DRenderElement;
            if (!bridge3DElement) {
                continue;
            }

            // 将Scene3D的context传递给RenderElement
            bridge3DElement.setBridge3DContext(this._bridge3DContext);

            // 调用Bridge3DRenderElement的updateRenderElements方法
            // 这会填充_opaqueList和_transparentList
            bridge3DElement.updateRenderElements();

            // 收集不透明渲染队列（用于阴影渲染）
            const opaqueList = bridge3DElement.getOpaqueList();
            if (opaqueList && opaqueList.elements.length > 0) {
                this._opaqueListQueues.add(opaqueList);
            }
        }
    }

    /**
     * Update Bridge3D shadows (main entry point)
     *
     * @remarks
     * This is the main entry method for Bridge3D shadow rendering, performing the following steps:
     * 1. Check if lighting is enabled
     * 2. Collect prepared opaque render queues
     * 3. Use shared camera for shadow rendering
     * 4. Pass collected queues to camera
     * 5. Execute shadow rendering
     */
    updateBridge3DShadows(): void {
        // Check if lighting is enabled
        if (!this.enableLight) {
            return;
        }

        // Check if there are opaque render queues
        if (this._opaqueListQueues.length === 0) {
            return;
        }

        // Use shared camera for shadow rendering
        this._sharedCamera.setOpaqueListQueues(this._opaqueListQueues);

        // Execute shadow rendering
        this._sharedCamera.render(this);
    }

    /**
     * Override renderSubmit method, add Bridge3D element preparation and shadow update
     */
    override renderSubmit(): void {
        if (this._renderByEditor) return;

        Scene3D._updateMark++;

        let context3d = RenderContext3D._instance._contextOBJ;

        this._bridge3DContext.updateFromCamera(this._sharedCamera);
        this._bridge3DContext.applyToContext(context3d);

        // 1. Execute _prepare() method for all Bridge3DRenderElements
        this.prepareAllBridge3DElements();

        // 2. Prepare scene rendering (使用Bridge3D独立的灯光贴图，通过重写的_getLightTexture方法)
        this._prepareSceneToRender();

        // 3. 无条件写入相机矩阵到 _shaderValues，与阴影渲染解耦
        // 避免首帧或 opaqueListQueues 为空时 UBO 全为 0 的问题
        const context = RenderContext3D._instance;
        this._sharedCamera._prepareCameraToRender();
        this._sharedCamera._applyViewProject(
            this._sharedCamera.viewMatrix,
            this._sharedCamera.projectionMatrix,
            context.invertY   // invertY 由 Bridge3DRenderElement 在 2D pass 中单独处理
        );

        // 4. Call shadow update
        this.updateBridge3DShadows();
    }

    /**
     * 重写 _update，只更新必要的部分和 Bridge3DSprite 的 renderUpdate
     * @internal
     */
    _update(): void {
        // 只保留必要的更新逻辑
        var delta: number = this.timer.delta / 1000;
        this._time += delta;
        this._shaderValues.setNumber(Scene3D.TIME, this._time);

        // 组件生命周期管理（保留，因为 Bridge3DSprite 的子节点可能有组件）
        this._componentDriver.callStart();
        this._componentDriver.callUpdate();
        this._componentDriver.callLateUpdate();
        this._componentDriver.callDestroy();

        if (this._volumeManager.needreCaculateAllRenderObjects())
            this._volumeManager.reCaculateAllRenderObjects(this._sceneRenderManager.list);
        else
            this._volumeManager.handleMotionlist();

        // 只更新根级 Bridge3DSprite 的 renderUpdate
        for (let i = 0, l = this._bridge3DList.length; i < l; i++) {
            this._bridge3DList[i]._renderUpdate();
        }
        // 这样避免了每次都重新 _collectRenderNodes
        // 注意：这里我们不直接调用 _renderUpdate，而是让渲染管线在合适的时候调用
        // Bridge3DSprite 的 _renderUpdate 会在渲染阶段被调用

        // 跳过以下重量级操作：
        // - 物理更新 (physicsManager.update)
        // - 全局渲染管理 (_sceneRenderManager.renderUpdate)
        // - 天空渲染 (skyRenderer.renderUpdate)
        // - UI3D 管理 (_UI3DManager.update)
    }



    /**
     * Destroy lightweight scene
     * @param destroyChild - Whether to destroy child nodes
     */
    destroy(destroyChild: boolean = true): void {
        // Remove stage event listener
        ILaya.stage.off(Event.RESIZE, this, this.onStageResize);

        // Remove from stage if added
        if (this._isAddedToStage) {
            ILaya.stage.removeChild(this);
            this._isAddedToStage = false;
        }

        // Clear Bridge3DSprite related data
        this._renderToBridgeMap.clear();
        this._bridge3DList.length = 0;

        // Clear Bridge3D独立的灯光贴图（pixels数组是全局共享的，不需要清理）
        if (this._bridge3DLightTexture) {
            this._bridge3DLightTexture.destroy();
            this._bridge3DLightTexture = null;
        }

        // Clear Bridge3D rendering context
        if (this._bridge3DContext) {
            this._bridge3DContext.setSceneData(null);
            this._bridge3DContext.setCameraData(null);
            this._bridge3DContext.setGlobalShaderData(null);
            this._bridge3DContext.setSceneModuleData(null);
            this._bridge3DContext.setCameraModuleData(null);
            this._bridge3DContext.setBridge3DLightData(null, null);
            this._bridge3DContext = null;
        }

        // Clear camera reference
        this._sharedCamera = null;

        // Call parent destroy
        super.destroy(destroyChild);
    }
}