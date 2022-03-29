import { BaseRender } from "../../../d3/core/render/BaseRender";
import { IBaseRenderOBJ } from "./IBaseRender";

export interface ISceneRenderManager{
    addRenderObject(object:BaseRender):void;
    removeRenderObject(object:BaseRender):void;
    removeMotionObject(object:BaseRender):void;
    updateMotionObjects(object:BaseRender):void;
    addMotionObject(object:BaseRender):void;
}