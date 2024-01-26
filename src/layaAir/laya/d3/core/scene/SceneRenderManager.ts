import { ISceneRenderManager } from "../../../RenderDriver/DriverDesign/3DRenderPass/ISceneRenderManager";
import { IBaseRenderNode } from "../../../RenderDriver/RenderModuleData/Design/3D/I3DRenderModuleData";
import { SingletonList } from "../../../utils/SingletonList";
import { Laya3DRender } from "../../RenderObjs/Laya3DRender";
import { BaseRender } from "../render/BaseRender";
import { RenderContext3D } from "../render/RenderContext3D";

/**
 * <code>类用来实现场景渲染节点管理<code/>
 */
export class SceneRenderManager {
    /**@internal */
    protected _sceneManagerOBJ: ISceneRenderManager;

    /**
     * 实例化一个场景管理节点
     */
    constructor() {
        this._sceneManagerOBJ = Laya3DRender.Render3DPassFactory.createSceneRenderManager();
    }

    /**
     * get RenderList
     */
    get list(): SingletonList<BaseRender> {
        return this._sceneManagerOBJ.list;
    }

    set list(value: SingletonList<BaseRender>) {
        this._sceneManagerOBJ.list = value;
    }

    get renderBaselist(): SingletonList<IBaseRenderNode> {
        return this._sceneManagerOBJ.baseRenderList;
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

    renderUpdate():void{
        var context: RenderContext3D = RenderContext3D._instance;
        let lists = this._sceneManagerOBJ.list.elements;
        for(let i = 0,n = this.list.length;i<n;i++){
            lists[i].renderUpdate(context);
        }
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