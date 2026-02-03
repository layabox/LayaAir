import { Scene3D } from "../../layaAir/laya/d3/core/scene/Scene3D";
import { BaseRender } from "../../layaAir/laya/d3/core/render/BaseRender";
import { Bridge3DSprite } from "./Bridge3DSprite";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Bridge3DManager } from "./Bridge3DManager";
import { Bridge3DCamera } from "./Bridge3DCamera";
import { Bridge3DRenderElement } from "./Bridge3DRenderElement";
import { RenderListQueue } from "../../layaAir/laya/RenderDriver/DriverCommon/RenderListQueue";
import { FastSinglelist } from "laya/utils/SingletonList";
import { Bridge3DContext } from "./Bridge3DContext";
import { RenderContext3D } from "laya/d3/core/render/RenderContext3D";

/**
 * Bridge3DScene3D 是为 Bridge3DManager 优化的轻量级 Scene3D 实现
 *
 * 主要优化：
 * 1. _addRenderObject/_removeRenderObject 委托给 Bridge3DSprite 管理
 * 2. _update 只更新根级 Bridge3DSprite 的 renderUpdate，避免重复 _collectRenderNodes
 * 3. 移除不必要的重量级功能（物理、光照管理、体积管理等）
 *
 * @class Bridge3DScene3D
 * @extends Scene3D
 */
export class Bridge3DScene3D extends Scene3D {
    /**
     * 渲染对象到 Bridge3DSprite 的映射
     * @private
     */
    private _renderToBridgeMap: Map<BaseRender, Bridge3DSprite> = new Map();

    /**
     * 已注册的 Bridge3DSprite 列表（由本 Scene3D 管理）
     * @private
     */
    private _bridge3DList: Bridge3DSprite[] = [];


    /**
     * 收集到的不透明渲染队列列表
     * @private
     */
    private _opaqueListQueues: FastSinglelist<RenderListQueue> = new FastSinglelist;

    /**
     * Bridge3D渲染上下文（由Scene3D统一持有和管理）
     * @private
     */
    private _bridge3DContext: Bridge3DContext;

    /**
     * 已注册的 Bridge3DSprite 数量
     * @readonly
     */
    get bridge3DListLength(): number {
        return this._bridge3DList.length;
    }

    /** @internal */
    _manager: Bridge3DManager;

    /**
     * 创建 LightweightScene3D 实例
     */
    constructor() {
        super();

        // 创建统一的Bridge3D渲染上下文
        this._bridge3DContext = new Bridge3DContext();
    }

    updateContext() {
        // 获取共享相机
        const camera = this._manager.sharedCamera;
        // 更新Scene3D统一持有的Bridge3DContext数据
        this._bridge3DContext.setSceneData(this._shaderValues);
        this._bridge3DContext.setCameraData(camera._shaderValues);
        this._bridge3DContext.setSceneModuleData(this._sceneModuleData);
        this._bridge3DContext.setCameraModuleData(camera._renderDataModule);
        this._bridge3DContext.updateFromCamera(camera);
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
     * 注册 Bridge3DSprite，并将其容器添加到本 Scene3D
     * @param bridge - 要注册的 Bridge3DSprite
     * @internal
     */
    registerBridge3D(bridge: Bridge3DSprite): void {
        if (this._bridge3DList.indexOf(bridge) !== -1) {
            return;
        }
        this._bridge3DList.push(bridge);
        this.addChild(bridge.containerSprite3D);
    }

    /**
     * 注销 Bridge3DSprite，并从本 Scene3D 移除其容器
     * @param bridge - 要注销的 Bridge3DSprite
     * @internal
     */
    unregisterBridge3D(bridge: Bridge3DSprite): void {
        const index = this._bridge3DList.indexOf(bridge);
        if (index !== -1) {
            this._bridge3DList.splice(index, 1);
            this.removeChild(bridge.containerSprite3D);
        }
    }

    /**
     * 获取已注册的 Bridge3DSprite 列表（供 Manager 迭代查找等使用）
     * @internal
     */
    getBridge3DList(): Bridge3DSprite[] {
        return this._bridge3DList;
    }

    /**
     * 获取Bridge3D阴影相机（从manager获取）
     * @returns Bridge3D阴影相机实例
     */
    getBridge3DShadowCamera(): Bridge3DCamera {
        return this._manager.bridge3DShadowCamera;
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
     * 更新Bridge3D阴影（主要入口）
     *
     * @remarks
     * 这是Bridge3D阴影渲染的主要入口方法，执行以下步骤：
     * 1. 检查是否启用光照
     * 2. 收集已经准备好的不透明渲染队列
     * 3. 获取Bridge3D阴影相机
     * 4. 将收集到的队列传递给相机
     * 5. 执行阴影渲染
     */
    updateBridge3DShadows(): void {
        // 检查是否启用光照
        if (!this.enableLight) {
            return;
        }

        // 检查是否有不透明渲染队列
        if (this._opaqueListQueues.length === 0) {
            return;
        }

        // 2. 获取Bridge3D阴影相机
        const shadowCamera = this.getBridge3DShadowCamera();

        // 3. 将收集到的队列传递给相机
        shadowCamera.setOpaqueListQueues(this._opaqueListQueues);

        // 4. 执行阴影渲染
        shadowCamera.render(this);
    }

    /**
     * 重写renderSubmit方法，添加Bridge3D元素准备和阴影更新
     */
    override renderSubmit(): void {
        if (this._renderByEditor) return;

        Scene3D._updateMark++;
        
        
        
        let context3d = RenderContext3D._instance._contextOBJ;

        this._bridge3DContext.updateFromCamera(this._manager.sharedCamera);
        
        this._bridge3DContext.applyToContext(context3d);
        // this._bridge3DContext.setGlobalShaderData(camera.scene?._shaderValues || this._shaderValues);

        // 1. 对所有Bridge3DRenderElement执行_prepare()方法
        this.prepareAllBridge3DElements();

        // 2. 准备场景渲染
        this._prepareSceneToRender();

        // 3. 调用阴影更新
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
        for (let i = 0 , l = this._bridge3DList.length; i < l; i++) {
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
     * 销毁轻量级场景
     * @param destroyChild - 是否销毁子节点
     */
    destroy(destroyChild: boolean = true): void {
        // 清理 Bridge3DSprite 相关数据
        this._renderToBridgeMap.clear();
        this._bridge3DList.length = 0;

        // 清理Bridge3D渲染上下文
        if (this._bridge3DContext) {
            this._bridge3DContext.setSceneData(null);
            this._bridge3DContext.setCameraData(null);
            this._bridge3DContext.setGlobalShaderData(null);
            this._bridge3DContext.setSceneModuleData(null);
            this._bridge3DContext.setCameraModuleData(null);
            this._bridge3DContext = null;
        }

        // 调用父类销毁
        super.destroy(destroyChild);
    }
}