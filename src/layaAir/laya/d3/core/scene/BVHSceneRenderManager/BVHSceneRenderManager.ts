import { ISceneRenderManager } from "../../../../RenderEngine/RenderInterface/RenderPipelineInterface/ISceneRenderManager";
import { BaseRender } from "../../render/BaseRender";
import { SceneRenderManager } from "../SceneRenderManager";

export class BVHSceneRenderManager extends SceneRenderManager {
    protected _sceneManagerOBJ: ISceneRenderManager;
    constructor() {
        super();
    }

    /**
     * 是否是静态
     * @returns 
     */
    isStatic(): boolean {
        return false;
    }

    /**
     * 是否适合BVH节点
     */
    isSuitableBVH(): boolean {
        return false;
    }

    /**
     * add Render Node
     * @param object 
     */
    addRenderObject(object: BaseRender): void {
        this._sceneManagerOBJ.addRenderObject(object);
    }

    /**
     * remove Render Node
     * @param object 
     */
    removeRenderObject(object: BaseRender): void {
        this._sceneManagerOBJ.removeRenderObject(object);
    }

    /**
     * remove motion Object
     * @param object 
     */
    removeMotionObject(object: BaseRender): void {
        this._sceneManagerOBJ.removeMotionObject(object);
    }

    /**
     * update All Motion Render Data
     */
    updateMotionObjects(): void {
        this._sceneManagerOBJ.updateMotionObjects();
    }

    /**
     * add motion Render Data
     * @param object 
     */
    addMotionObject(object: BaseRender): void {
        this._sceneManagerOBJ.addMotionObject(object);
    }

    /**
     * destroy
     */
    destroy(): void {
        this._sceneManagerOBJ.destroy();
    }
}