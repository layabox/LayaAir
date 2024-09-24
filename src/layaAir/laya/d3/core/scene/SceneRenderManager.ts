import { ISceneRenderManager } from "../../../RenderDriver/DriverDesign/3DRenderPass/ISceneRenderManager";
import { IBaseRenderNode } from "../../../RenderDriver/RenderModuleData/Design/3D/I3DRenderModuleData";
import { SingletonList } from "../../../utils/SingletonList";
import { Laya3DRender } from "../../RenderObjs/Laya3DRender";
import { BaseRender } from "../render/BaseRender";
import { RenderContext3D } from "../render/RenderContext3D";

/**
 * @en The class is used to implement scene rendering node management.
 * @zh 该类用于实现场景渲染节点的管理。
 */
export class SceneRenderManager {
    /**@internal */
    protected _sceneManagerOBJ: ISceneRenderManager;

    /**
     * @ignore
     * @en Creates an instance of SceneRenderManager.
     * @zh 创建一个 SceneRenderManager 的实例。
     */
    constructor() {
        this._sceneManagerOBJ = Laya3DRender.Render3DPassFactory.createSceneRenderManager();
    }

    /**
     * @en The render list.
     * @zh 渲染列表。
     */
    get list(): SingletonList<BaseRender> {
        return this._sceneManagerOBJ.list;
    }

    set list(value: SingletonList<BaseRender>) {
        this._sceneManagerOBJ.list = value;
    }

    /**
     * @en The base render list.
     * @zh 基础渲染节点列表。
     */
    get renderBaselist(): SingletonList<IBaseRenderNode> {
        return this._sceneManagerOBJ.baseRenderList;
    }

    /**
     * @en Adds a render node to the manager.
     * @param object The render object to add.
     * @zh 向管理器添加渲染节点。
     * @param object 要添加的渲染对象。
     */
    addRenderObject(object: BaseRender): void {
        this._sceneManagerOBJ.addRenderObject(object);
    }

    /**
     * @en Removes a render node from the manager.
     * @param object The render object to remove.
     * @zh 从管理器移除渲染节点。
     * @param object 要移除的渲染对象。
     */
    removeRenderObject(object: BaseRender): void {
        this._sceneManagerOBJ.removeRenderObject(object);
    }

    /**
     * @en Removes a motion object from the manager.
     * @param object The motion object to remove.
     * @zh 从管理器移除运动对象。
     * @param object 要移除的运动对象。
     */
    removeMotionObject(object: BaseRender): void {
        this._sceneManagerOBJ.removeMotionObject(object);
    }

    /**
     * @en Updates all motion render data.
     * @zh 更新所有运动渲染数据。
     */
    updateMotionObjects(): void {
        this._sceneManagerOBJ.updateMotionObjects();
    }

    /**
     * @en Updates the scene render.
     * @zh 更新场景渲染。
     */
    renderUpdate(): void {
        var context: RenderContext3D = RenderContext3D._instance;
        let lists = this._sceneManagerOBJ.list.elements;
        for (let i = 0, n = this.list.length; i < n; i++) {
            lists[i].renderUpdate(context);
        }
    }

    /**
     * @en Adds motion render data to the manager.
     * @param object The motion render object to add.
     * @zh 向管理器添加运动渲染数据。
     * @param object 要添加的运动渲染对象。
     */
    addMotionObject(object: BaseRender): void {
        this._sceneManagerOBJ.addMotionObject(object);
    }

    /**
     * @en Destroys and cleans up the manager resources.
     * @zh 销毁并清理管理器资源。
     */
    destroy(): void {
        this._sceneManagerOBJ.destroy();
    }

}