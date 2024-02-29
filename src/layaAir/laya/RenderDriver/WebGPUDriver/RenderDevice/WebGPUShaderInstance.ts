import { GLSLCodeGenerator } from "../../../RenderEngine/RenderShader/GLSLCodeGenerator";
import { ShaderPass } from "../../../RenderEngine/RenderShader/ShaderPass";
import { UniformMapType } from "../../../RenderEngine/RenderShader/SubShader";
import { ShaderProcessInfo } from "../../../webgl/utils/ShaderCompileDefineBase";
import { ShaderNode } from "../../../webgl/utils/ShaderNode";
import { IShaderInstance } from "../../DriverDesign/RenderDevice/IShaderInstance";
import { ShaderDataType } from "../../DriverDesign/RenderDevice/ShaderData";
import { WebGLEngine } from "../../WebGLDriver/RenderDevice/WebGLEngine";
import { WebGPURenderEngine } from "./WebGPURenderEngine";
export enum WebGPUBindingInfoType{
    texture,
    sampler,
    blockBuffer
}
export class WebGPUUniformPropertyBindingInfo{
    set:number;
    binding:number;
    type:WebGPUBindingInfoType;
    propertyID:number;
    texture?:GPUBufferBindingLayout;
    sampler?:GPUSamplerBindingLayout;
    blockBuffer?:GPUTextureBindingLayout;
}
export class WGSLCodeGenerator {
    static ShaderLanguageProcess(defineString: string[],
        attributeMap: { [name: string]: [number, ShaderDataType] },
        uniformMap: UniformMapType, VS: ShaderNode, FS: ShaderNode) {
        //翻译转换和分析
      
        let dstVS: string;
        let detFS: string;
        //处理vs 和fs的shaderNode，material UniformMap
        
        //把所有uniformmap 分Block，分组
        
        //重新写入vs和fs的string
        let alluniform:WebGPUUniformPropertyBindingInfo[] =[];//
        //处理ShaderString  并且得到想要的所有shader布局，每个buffer属于哪个shader阶段
        return { vs: dstVS, fs: detFS ,uniform:alluniform}
    }
}

export class WebGPUShaderInstance implements IShaderInstance {

    /**@internal VertexState*/
    private _vsshader: GPUShaderModule;
    /**@internal fragmentModule*/
    private _psshader: GPUShaderModule;

    _layout: GPUPipelineLayout;
    _layoutDescriptor:GPUPipelineLayoutDescriptor;
    /**
     * 创建一个 <code>ShaderInstance</code> 实例。
     */
    constructor() {
    }

    _create(shaderProcessInfo: ShaderProcessInfo, shaderPass: ShaderPass): void {
        let shaderObj = WGSLCodeGenerator.ShaderLanguageProcess(shaderProcessInfo.defineString, shaderProcessInfo.attributeMap, shaderProcessInfo.uniformMap, shaderProcessInfo.vs, shaderProcessInfo.ps);
        this._vsshader = WebGPURenderEngine._instance.getDevice().createShaderModule({
            code: shaderObj.vs,
        });
        this._psshader = WebGPURenderEngine._instance.getDevice().createShaderModule({
            code: shaderObj.fs,
        });

        //生成GPUPipeLineLayout
    }
    _disposeResource(): void {
        throw new Error("Method not implemented.");
    }

}