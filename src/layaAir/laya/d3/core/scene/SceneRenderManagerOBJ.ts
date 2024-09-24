import { ISceneRenderManager } from "../../../RenderDriver/DriverDesign/3DRenderPass/ISceneRenderManager";
import { IBaseRenderNode } from "../../../RenderDriver/RenderModuleData/Design/3D/I3DRenderModuleData";
import { SingletonList } from "../../../utils/SingletonList";
import { BaseRender } from "../../core/render/BaseRender";

/**
 * @en The `SceneRenderManagerOBJ` class is used to manage the rendering nodes of a scene.
 * @zh `SceneRenderManagerOBJ` 类用于管理场景的渲染节点。
 */
export class SceneRenderManagerOBJ implements ISceneRenderManager {
    /** @internal */
    _renders: SingletonList<BaseRender> = new SingletonList();
    _motionRenders: SingletonList<BaseRender> = new SingletonList();
    /** @ignore */
    constructor() {

    }

    /**
     * @en The base render list.
     * @zh 基础渲染节点列表。
     */
    baseRenderList: SingletonList<IBaseRenderNode> = new SingletonList();

    /**
     * @en The list of render objects.
     * @zh 渲染对象列表。
     */
    get list() {
        return this._renders;
    }

    set list(value) {
        this._renders = value;
    }

    /**
     * @en Adds a render object to the render list.
     * @param object The render object to add.
     * @zh 向渲染列表添加渲染对象。
     * @param object 要添加的渲染对象。
     */
    addRenderObject(object: BaseRender): void {
        this._renders.add(object);
        this.baseRenderList.add(object._baseRenderNode);
    }

    /**
     * @en Removes a render object from the render list and the base render list.
     * @param object The render object to remove.
     * @zh 从渲染列表和基础渲染列表中移除渲染对象。
     * @param object 要移除的渲染对象。
     */
    removeRenderObject(object: BaseRender): void {
        this._renders.remove(object);
        this.baseRenderList.remove(object._baseRenderNode);
        this.removeMotionObject(object);
    }


    /**
     * @en Removes a motion render object.
     * @param object The motion render object to remove.
     * @zh 移除运动渲染对象。
     * @param object  要移除的运动渲染对象。
     */
    removeMotionObject(object: BaseRender): void {
        //override
    }

    /**
     * @en Updates all motion render objects.
     * @zh 更新所有运动渲染对象。
     */
    updateMotionObjects(): void {
        //override
    }

    /**
     * @en Adds a motion render object.
     * @param object The motion render object to add.
     * @zh 向管理器添加运动渲染对象。
     * @param object 要添加的运动渲染对象。
     */
    addMotionObject(object: BaseRender): void {
        //override
    }

    /**
     * @en Destroys the render objects and cleans up resources.
     * @zh 销毁渲染对象并清理资源。
     */
    destroy(): void {
        this._renders.destroy();
    }

}