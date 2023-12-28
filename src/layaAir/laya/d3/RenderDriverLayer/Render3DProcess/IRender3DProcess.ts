import { SingletonList } from "../../../utils/SingletonList";
import { IRenderContext3D } from "../IRenderContext3D";
import { IBaseRenderNode } from "../Render3DNode/IBaseRenderNode";
import { IForwardAddRP } from "./IForwardAddRP";

export interface IRender3DProcess{
    renderFowarAddCameraPass(context:IRenderContext3D,renderpass:IForwardAddRP,list:SingletonList<IBaseRenderNode>):void;
}