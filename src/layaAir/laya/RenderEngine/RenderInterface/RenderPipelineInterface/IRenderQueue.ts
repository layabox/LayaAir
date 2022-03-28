import { SingletonList } from "../../../d3/component/SingletonList";
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
	elements: SingletonList<IRenderElement>;
    //Camera Shader Data
    cameraShaderData:ShaderData;
    //scene Shader Data
    sceneShaderData:ShaderData;
    /**快排接口 */
    quickSort(left:number,right:number):void;
    /**渲染 */
    renderQueue():void;
}