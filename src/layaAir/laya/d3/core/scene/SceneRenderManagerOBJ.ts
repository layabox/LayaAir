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
        // let index = object._motionIndexList;
        // if (index != -1) {//remove
        //     let elements = this._motionRenders.elements;
        //     this._motionRenders.length -= 1;
        //     elements[length]._motionIndexList = index;
        //     elements[index] = elements[length];
        // }

        //TODO
    }
    updateMotionObjects(): void {
        // for (let i = 0; i < this._motionRenders.length; i++) {
        //     this._motionRenders.elements[i].bounds;
        //     this._motionRenders.elements[i]._motionIndexList = -1;
        // }
        // this._motionRenders.length = 0;

        //TODO
    }
    addMotionObject(object: BaseRender): void {
        // if (object._motionIndexList == -1) {
        //     object._motionIndexList = this._motionRenders.length;
        //     this._motionRenders.add(object);
        // }

        //TODO
    }
    destroy(): void {
        this._renders.destroy();
    }

}