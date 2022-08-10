import { SingletonList } from "../../../utils/SingletonList";
import { RenderContext3D } from "../../../d3/core/render/RenderContext3D";
import { IBaseRenderNode } from "./IBaseRenderNode";
import { ICullPass } from "./ICullPass";
import { IRenderQueue } from "./IRenderQueue";

/**
 * 渲染通道
 */
export interface IRenderPass{
    /**渲染状态 */
    context:RenderContext3D;
    //裁剪工具
    _cullPass:ICullPass;
    //set Render Obj List
    setRenderlist(list:SingletonList<IBaseRenderNode>):void;
    //render Queue
    applyRenderQueue(queue:IRenderQueue):void;
    //update data
    update():void;
    //render element
    render():void;
}