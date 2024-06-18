import { ISceneRenderManager } from "../../../RenderDriver/DriverDesign/3DRenderPass/ISceneRenderManager";
import { IBaseRenderNode } from "../../../RenderDriver/RenderModuleData/Design/3D/I3DRenderModuleData";
import { SingletonList } from "../../../utils/SingletonList";
import { BaseRender } from "../../core/render/BaseRender";


export class SceneRenderManagerOBJ implements ISceneRenderManager {
    /** @internal */
    _renders: SingletonList<BaseRender> = new SingletonList();
    _motionRenders: SingletonList<BaseRender> = new SingletonList();
    constructor() {

    }
    baseRenderList: SingletonList<IBaseRenderNode> = new SingletonList();

    get list() {
        return this._renders;
    }

    set list(value) {
        this._renders = value;
    }

    addRenderObject(object: BaseRender): void {
        this._renders.add(object);
        this.baseRenderList.add(object._baseRenderNode);
    }
    removeRenderObject(object: BaseRender): void {
        this._renders.remove(object);
        this.baseRenderList.remove(object._baseRenderNode);
        this.removeMotionObject(object);
    }

    removeMotionObject(object: BaseRender): void {
        //override
    }
    updateMotionObjects(): void {
        //override
    }
    addMotionObject(object: BaseRender): void {
        //override
    }
    destroy(): void {
        this._renders.destroy();
    }

}