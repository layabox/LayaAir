import { LayaGL } from "../../../layagl/LayaGL";
import { ShaderPass } from "../../../RenderEngine/RenderShader/ShaderPass";
import { IPrimitiveRenderElement2D } from "../../DriverDesign/2DRenderPass/IRenderElement2D";
import { ShaderData } from "../../DriverDesign/RenderDevice/ShaderData";
import { WebShaderPass } from "../../RenderModuleData/WebModuleData/WebShaderPass";
import { WebGPURenderBundle } from "../RenderDevice/WebGPUBundle/WebGPURenderBundle";
import { WebGPUCommandUniformMap } from "../RenderDevice/WebGPUCommandUniformMap";
import { WebGPURenderCommandEncoder } from "../RenderDevice/WebGPURenderCommandEncoder";
import { WebGPURenderEngine } from "../RenderDevice/WebGPURenderEngine";
import { WebGPUShaderData } from "../RenderDevice/WebGPUShaderData";
import { WebGPUShaderInstance } from "../RenderDevice/WebGPUShaderInstance";
import { WebGPURenderContext2D } from "./WebGPURenderContext2D";
import { WebGPURenderElement2D } from "./WebGPURenderElement2D";

export class WebGPUPrimitiveRenderElement2D extends WebGPURenderElement2D implements IPrimitiveRenderElement2D {

    private _primitiveShaderData: WebGPUShaderData;
    public get primitiveShaderData(): WebGPUShaderData {
        return this._primitiveShaderData;
    }
    public set primitiveShaderData(value: WebGPUShaderData) {
        this._primitiveShaderData = value;
        if (value) {
            this._additionShaderData.set("Sprite2DGraphics", value);
        }
    }

    private _additionShaderData: Map<string, ShaderData> = new Map();

    constructor() {
        super();
    }

    /**
     * 编译着色器
     * @param context 
     */
    protected _compileShader(context: WebGPURenderContext2D) {
        //将场景或全局配置定义准备好
        this._shaderInstances.clear();
        const comDef = this._getShaderInstanceDefines(context);

        if (this.primitiveShaderData) {
            comDef.addDefineDatas(this.primitiveShaderData.getDefineData());
        }

        var passes: ShaderPass[] = this.subShader._passes;
        //查找着色器对象缓存
        for (var j: number = 0, m: number = passes.length; j < m; j++) {
            var pass: ShaderPass = passes[j];
            //NOTE:this will cause maybe a shader not render but do prepare before，but the developer can avoide this manual,for example shaderCaster=false.
            if (pass.pipelineMode !== context.pipelineMode)
                continue;

            //设置nodeCommonMap
            if (this.value2DShaderData)
                pass.nodeCommonMap = this.nodeCommonMap;
            else
                pass.nodeCommonMap = null;

            let attributeLocations = this.geometry.bufferState._attriLocArray;
            pass.moduleData.attributeLocations = attributeLocations

            let passData = pass.moduleData as WebShaderPass;
            if (this._additionShaderData.has("Sprite2DGraphics")) {
                passData.additionShaderData = ["Sprite2DGraphics"]
            }

            //获取着色器实例，先查找缓存，如果没有则创建
            const shaderInstance = pass.withCompile(comDef, true) as WebGPUShaderInstance;
            this._shaderInstances.add(shaderInstance);
        }
    }

    protected _bindGroup(context: WebGPURenderContext2D, shader: WebGPUShaderInstance, command: WebGPURenderCommandEncoder | WebGPURenderBundle): void {
        this.bindGroupMap.clear();

        {
            command.setBindGroup(0, context._sceneBindGroup);
            this.bindGroupMap.set(0, context._sceneBindGroup);
        }
        {
            let resource = shader.uniformSetMap.get(1);
            let textureExitsMask = shader.uniformTextureExits.get(1);
            this._value2DgpuRS = WebGPURenderEngine._instance.bindGroupCache.getBindGroup(this._nodeCommonMap, this.value2DShaderData, this._additionShaderData, resource, textureExitsMask);

            command.setBindGroup(1, this._value2DgpuRS);
            this.bindGroupMap.set(1, this._value2DgpuRS);

        }

        if (this.materialShaderData) {
            let resource = shader.uniformSetMap.get(2);
            let textureExitsMask = shader.uniformTextureExits.get(2);
            let bindGroup = WebGPURenderEngine._instance.bindGroupCache.getBindGroup([this.subShader._owner.name], this.materialShaderData, null, resource, textureExitsMask);
            command.setBindGroup(2, bindGroup);
            this.bindGroupMap.set(2, bindGroup);
        }
    }

    _prepare(context: WebGPURenderContext2D): void {
        super._prepare(context);
        let subShader = this.subShader;

        if (this.primitiveShaderData) {
            let graphicsMap = LayaGL.renderDeviceFactory.createGlobalUniformMap("Sprite2DGraphics") as WebGPUCommandUniformMap;
            let subBuffer = this.primitiveShaderData.createUniformBuffer("Sprite2DGraphics", graphicsMap);
            this.primitiveShaderData.updateUBOBuffer("Sprite2DGraphics");
            if (subBuffer.needUpload) {
                subBuffer.upload();
            }
        }
    }

}