import { SimpleSingletonList } from "../../d3/component/SimpleSingletonList";
import { SingletonList } from "../../d3/component/SingletonList";
import { BaseRender } from "../../d3/core/render/BaseRender";
import { ISceneRenderManager } from "../RenderInterface/RenderPipelineInterface/ISceneRenderManager";

export class SceneRenderManager implements ISceneRenderManager{
    /** @internal */
	_renders: SimpleSingletonList = new SimpleSingletonList();
    constructor(){

    }

    get list(){
        return this._renders;
    }

    set list(value){
        this._renders = value;
    }
    
    addRenderObject(object: BaseRender): void {
        this._renders.add(object);
    }
    removeRenderObject(object: BaseRender): void {
        this._renders.remove(object);
    }

    removeMotionObject(object: BaseRender): void {
        //TODO
    }
    updateMotionObjects(object: BaseRender): void {
        //TODO
    }
    addMotionObject(object: BaseRender): void {
        //TODO
    }
    destroy(): void {
        this._renders.clearElement();
    }

}