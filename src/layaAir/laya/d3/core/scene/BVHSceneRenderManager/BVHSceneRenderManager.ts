import { ISceneRenderManager } from "../../../../RenderEngine/RenderInterface/RenderPipelineInterface/ISceneRenderManager";
import { SingletonList } from "../../../../utils/SingletonList";
import { BaseRender } from "../../render/BaseRender";
import { SceneRenderManager } from "../SceneRenderManager";
import { BVHRenderSpatial } from "./BVHRenderSpatial";

export class BVHSceneRenderManager extends SceneRenderManager {
    /**@internal */
    protected _sceneManagerOBJ: ISceneRenderManager;
    /**@internal */
    private _bvhRenderSpatial: BVHRenderSpatial;

    private _allRenderList:SingletonList<BaseRender>;

    /**
     * 实例化
     */
    constructor() {
        super();
        this._bvhRenderSpatial = new BVHRenderSpatial();
        this._allRenderList = new SingletonList<BaseRender>();
    }

    /**
    * get RenderList
    */
    get list(): SingletonList<BaseRender> {
        return this._allRenderList;
    }

    set list(value: SingletonList<BaseRender>) {
        for(let i = 0,n = value.length;i<n;i++){
            let render = value.elements[i];
            this.addRenderObject(render);
        }
    }

    get bvhSpatial(){
        return this._bvhRenderSpatial;
    }

    get otherList(){
        return this._sceneManagerOBJ.list;
    }

    /**
     * add Render Node
     * @param object 
     */
    addRenderObject(object: BaseRender): void {
        if (!this._bvhRenderSpatial.addOne(object)) {
            this._sceneManagerOBJ.addRenderObject(object);
        }
        this._allRenderList.add(object);
    }

    /**
     * remove Render Node
     * @param object 
     */
    removeRenderObject(object: BaseRender): void {
        if (!this._bvhRenderSpatial.removeOne(object))
            this._sceneManagerOBJ.removeRenderObject(object);
        this._allRenderList.remove(object);
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
        this._bvhRenderSpatial.update();
        this._sceneManagerOBJ.updateMotionObjects();

    }

    /**
     * add motion Render Data
     * @param object 
     */
    addMotionObject(object: BaseRender): void {
        if (this._bvhRenderSpatial.cellLegal(object)) {
            this._bvhRenderSpatial.motionOne(object);
        } else {
            this._sceneManagerOBJ.addMotionObject(object);
        }
    }

    /**
     * destroy
     */
    destroy(): void {
        this._sceneManagerOBJ.destroy();
        this._bvhRenderSpatial.destroy();
        this._allRenderList .destroy();
    }
}