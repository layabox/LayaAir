import { SingletonList } from "../../../d3/component/SingletonList";
import { RenderContext3D } from "../../../d3/core/render/RenderContext3D";
import { RenderElement } from "../../../d3/core/render/RenderElement";
import { Viewport } from "../../../d3/math/Viewport";
import { ShaderData } from "../../RenderShader/ShaderData";
import { IRenderTarget } from "../IRenderTarget";
import { IRenderContext3D } from "./IRenderContext3D";

/**
 * RenderQueue,渲染队列
 */
export interface IRenderQueue{
    /** @internal */
	elements: SingletonList<RenderElement>;
    /**@internal 共享渲染数据 */
    _context:IRenderContext3D
    //渲染队列
    renderQueue(context:RenderContext3D):void;
    //增加渲染队列
    addRenderElement(renderElement:RenderElement):void;
    //清除队列
    clear():void
    
}