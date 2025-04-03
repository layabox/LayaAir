import { BaseRender } from "../../../../d3/core/render/BaseRender";
import { SingletonList } from "../../../../utils/SingletonList";
import { ISceneRenderManager } from "../../../DriverDesign/3DRenderPass/ISceneRenderManager";
import { WebBaseRenderNode } from "./WebBaseRenderNode";

/**
 * @en The `WebSceneRenderManager` class is used to manage the rendering nodes of a scene.
 * @zh `WebSceneRenderManager` 类用于管理场景的渲染节点。
 */
export class WebSceneRenderManager implements ISceneRenderManager {
    /** @internal */
    _list: SingletonList<BaseRender> = new SingletonList();
    //_motionRenders: SingletonList<BaseRender> = new SingletonList();
    /** @ignore */
    constructor() {

    }

    /**
     * @en The base render list.
     * @zh 基础渲染节点列表。
     */
    baseRenderList: SingletonList<WebBaseRenderNode> = new SingletonList();

    /**
     * @en The list of render objects.
     * @zh 渲染对象列表。
     */
    get list() {
        return this._list;
    }

    set list(value) {
        this._list = value;
        let elemnt = this._list.elements
        this.baseRenderList.clear();
        for (let i = 0; i < this._list.length; i++) {
            this.baseRenderList.add(elemnt[i]._baseRenderNode as WebBaseRenderNode);
        }
    }

    /**
     * @en Adds a render object to the render list.
     * @param object The render object to add.
     * @zh 向渲染列表添加渲染对象。
     * @param object 要添加的渲染对象。
     */
    addRenderObject(object: BaseRender): void {
        this._list.add(object);
        this.baseRenderList.add(object._baseRenderNode as WebBaseRenderNode);
    }

    /**
     * @en Removes a render object from the render list and the base render list.
     * @param object The render object to remove.
     * @zh 从渲染列表和基础渲染列表中移除渲染对象。
     * @param object 要移除的渲染对象。
     */
    removeRenderObject(object: BaseRender): void {
        this._list.remove(object);
        this.baseRenderList.remove(object._baseRenderNode as WebBaseRenderNode);
        //this.removeMotionObject(object);TODO
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
        this._list.destroy();
        this.baseRenderList.destroy();
        this._list = null;
        this.baseRenderList = null;
    }

}