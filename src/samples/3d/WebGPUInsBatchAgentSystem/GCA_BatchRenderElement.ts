import { LayaGL } from "laya/layagl/LayaGL";
import { WebShaderPass } from "laya/RenderDriver/RenderModuleData/WebModuleData/WebShaderPass";
import { WebGPURenderContext3D } from "laya/RenderDriver/WebGPUDriver/3DRenderPass/WebGPURenderContext3D";
import { WebGPURenderElement3D } from "laya/RenderDriver/WebGPUDriver/3DRenderPass/WebGPURenderElement3D";
import { WebGPURenderBundle } from "laya/RenderDriver/WebGPUDriver/RenderDevice/WebGPUBundle/WebGPURenderBundle";
import { WebGPUCommandUniformMap } from "laya/RenderDriver/WebGPUDriver/RenderDevice/WebGPUCommandUniformMap";
import { WebGPURenderCommandEncoder } from "laya/RenderDriver/WebGPUDriver/RenderDevice/WebGPURenderCommandEncoder";
import { WebGPURenderEngine } from "laya/RenderDriver/WebGPUDriver/RenderDevice/WebGPURenderEngine";
import { WebGPUShaderData } from "laya/RenderDriver/WebGPUDriver/RenderDevice/WebGPUShaderData";
import { WebGPUShaderInstance } from "laya/RenderDriver/WebGPUDriver/RenderDevice/WebGPUShaderInstance";
import { ShaderPass } from "laya/RenderEngine/RenderShader/ShaderPass";


export class GCA_BatchRenderElement extends WebGPURenderElement3D {
    static CommandMap: string[] = ["GCA_RenderSprite"];
    constructor() {
        super();
        this.isRender = true;

    }

    /**
     * 渲染前更新,更新所有Buffer
     * @param context 
     */
    _preUpdatePre(context: WebGPURenderContext3D) {
        //编译着色器
        this._compileShader(context);
        // material ubo
        let subShader = this.subShader;
        let matSubBuffer = this.materialShaderData.createSubUniformBuffer("Material", subShader._owner.name, subShader._uniformMap);
        if (matSubBuffer.needUpload) {
            matSubBuffer.bufferBlock.needUpload();
        }

        //sprite ubo
        if (this.renderShaderData) {
            let nodemap = GCA_BatchRenderElement.CommandMap;
            for (var i = 0, n = nodemap.length; i < n; i++) {
                let moduleName = nodemap[i];
                let unifomrMap = <WebGPUCommandUniformMap>LayaGL.renderDeviceFactory.createGlobalUniformMap(nodemap[i]);
                let uniformBuffer = this.renderShaderData.createSubUniformBuffer(moduleName, moduleName, unifomrMap._idata);
                if (uniformBuffer && uniformBuffer.needUpload) {
                    uniformBuffer.bufferBlock.needUpload();
                }
            }
        }
        //additional ubo
        if (this.owner) {
            for (let [key, value] of this.owner.additionShaderData) {
                let shaderData = value as WebGPUShaderData;
                let unifomrMap = <WebGPUCommandUniformMap>LayaGL.renderDeviceFactory.createGlobalUniformMap(key);
                let uniformBuffer = shaderData.createSubUniformBuffer(key, key, unifomrMap._idata);
                if (uniformBuffer && uniformBuffer.needUpload) {
                    uniformBuffer.bufferBlock.needUpload();
                }
            }
        }
        //是否反转面片
        this._invertFrontFace = this._getInvertFront();
        return;
    }

    /**
   * 编译着色器
   * @param context 
   */
    protected _compileShader(context: WebGPURenderContext3D) {
        this._shaderInstances.clear();
        let comDef = this._getShaderInstanceDefines(context);

        //查找着色器对象缓存
        var passes: ShaderPass[] = this.subShader._passes;
        for (var j: number = 0, m: number = passes.length; j < m; j++) {
            let pass = passes[j];
            let passdata = <WebShaderPass>pass.moduleData;
            if (passdata.pipelineMode !== context.pipelineMode)
                continue;

            //if (this.renderShaderData) {
            passdata.nodeCommonMap = GCA_BatchRenderElement.CommandMap;
            //} else {
            //    passdata.nodeCommonMap = null;
            //}

            passdata.additionShaderData = null;
            if (this.owner) {
                passdata.additionShaderData = this.owner._additionShaderDataKeys;
            }
            let attributeLocations = this.geometry.bufferState._attriLocArray;
            pass.moduleData.attributeLocations = attributeLocations;

            var shaderIns = pass.withCompile(comDef, false) as WebGPUShaderInstance;

            this._shaderInstances.add(shaderIns);
        }
    }


    _render(context: WebGPURenderContext3D, command: WebGPURenderCommandEncoder | WebGPURenderBundle) {
        //生成RenderBundle  调用
        let shaders: WebGPUShaderInstance[] = (this._shaderInstances as any).elements;
        if (!this.isRender) {
            return 0;
        }

        for (let j: number = 0, m: number = (this as any)._shaderInstances.length; j < m; j++) {
            if (!shaders[j].complete)
                continue;
            let shaderInstance = shaders[j];
            this._bindGroup(context, shaderInstance, command); //绑定资源组
            let pipeline = this._getWebGPURenderPipeline(shaderInstance, context.destRT, context);
            command.setPipeline(pipeline);  //新建渲染管线
            if (!command.isBundle && this.depthStencilParam.stencilEnable) {
                (command as WebGPURenderCommandEncoder).setStencilReference(this.depthStencilParam.stencilRef);
            }

            this._uploadGeometry(command); //上传几何数据 draw
        }
        return 0;
    }


    /**
     * 绑定资源组
     * @param shaderInstance 
     * @param command 
     * @param bundle 
     */
    protected _bindGroup(context: WebGPURenderContext3D, shaderInstance: WebGPUShaderInstance, command: WebGPURenderCommandEncoder | WebGPURenderBundle) {
        this.bindGroupMap.clear();
        {
            let sceneGroup = context._sceneBindGroup;
            command.setBindGroup(0, sceneGroup);
            this.bindGroupMap.set(0, sceneGroup);
        }
        {
            command.setBindGroup(1, context._cameraBindGroup);
            this.bindGroupMap.set(1, context._cameraBindGroup);
        }
        {
            let shaderResource = shaderInstance.uniformSetMap.get(2);
            let textureExitsMask = shaderInstance.uniformTextureExits.get(2);

            let commands = GCA_BatchRenderElement.CommandMap;
            let shaderData = this.renderShaderData;
            let addition = this.owner?.additionShaderData;
            let bindGroup = WebGPURenderEngine._instance.bindGroupCache.getBindGroup(commands, shaderData, addition, shaderResource, textureExitsMask);

            command.setBindGroup(2, bindGroup);
            this.bindGroupMap.set(2, bindGroup);

        }
        {
            let shaderResource = shaderInstance.uniformSetMap.get(3);
            let textureExitsMask = shaderInstance.uniformTextureExits.get(3);

            let bindgroup = WebGPURenderEngine._instance.bindGroupCache.getBindGroup([this.subShader._owner.name], this.materialShaderData, null, shaderResource, textureExitsMask);

            command.setBindGroup(3, bindgroup);
            this.bindGroupMap.set(3, bindgroup);
        }
    }


    // /**
    //   * 绑定资源组
    //   * @param shaderInstance 
    //   * @param command 
    //   * @param bundle 
    //   */
    // protected _bindGroup(context: WebGPURenderContext3D, shaderInstance: WebGPUShaderInstance, command: WebGPURenderCommandEncoder | WebGPURenderBundle) {

    //     {
    //         let sceneGroup = context._sceneBindGroup;
    //         command.setBindGroup(0, sceneGroup);
    //         this.bindGroupMap.set(0, sceneGroup);
    //     }
    //     {
    //         let cameraGroup = context._cameraBindGroup;
    //         command.setBindGroup(1, cameraGroup);
    //         this.bindGroupMap.set(1, cameraGroup);
    //     }
    //     {
    //         let shaderResource = shaderInstance.uniformSetMap.get(2);
    //         let textureExitsMask = shaderInstance.uniformTextureExits.get(2);

    //         let spriteGroup = WebGPURenderEngine._instance.bindGroupCache.getBindGroupByNode(shaderResource, this.owner, textureExitsMask);
    //         command.setBindGroup(2, spriteGroup);
    //         this.bindGroupMap.set(2, spriteGroup);
    //     }
    //     {
    //         let resource = shaderInstance.uniformSetMap.get(3);
    //         let textureExitsMask = shaderInstance.uniformTextureExits.get(3);
    //         let bindgroup = WebGPURenderEngine._instance.bindGroupCache.getBindGroup([this.subShader.owner.name], this.materialShaderData, null, resource, textureExitsMask);

    //         command.setBindGroup(3, bindgroup);
    //         this.bindGroupMap.set(3, bindgroup);
    //     }
    // }
}