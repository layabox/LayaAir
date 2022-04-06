import { SingletonList } from "../../../d3/component/SingletonList";
import { RenderContext3D } from "../../../d3/core/render/RenderContext3D";
import { RenderElement } from "../../../d3/core/render/RenderElement";
import { Viewport } from "../../../d3/math/Viewport";
import { ShaderData } from "../../RenderShader/ShaderData";
import { IRenderTarget } from "../IRenderTarget";
import { IRenderElement } from "./IRenderElement";

/**
 * RenderQueue,渲染队列
 */
export interface IRenderQueue{
    //dest Texture
    destTarget:IRenderTarget;
    //viewPort
    viewPort:Viewport;
    //is invert Y
    invertY:boolean;
    //pipeLineMode
    pipelineMode:string;
    /** @internal */
	elements: SingletonList<RenderElement>;
    //Camera Shader Data
    cameraShaderData:ShaderData;
    //scene Shader Data
    sceneShaderData:ShaderData;
    //Camera Update Mark
    cameraUpdateMark:number;
    //Scene Update Mark
    sceneID:number;
    //渲染队列
    renderQueue(context:RenderContext3D):void;
    //增加渲染队列
    addRenderElement(renderElement:RenderElement):void;
    //清除队列
    clear():void
    
}