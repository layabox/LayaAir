import { LayaGL } from "laya/layagl/LayaGL";
import { WebGPURenderContext3D } from "laya/RenderDriver/WebGPUDriver/3DRenderPass/WebGPURenderContext3D";
import { WebGPURenderElement3D } from "laya/RenderDriver/WebGPUDriver/3DRenderPass/WebGPURenderElement3D";
import { WebGPURenderBundle } from "laya/RenderDriver/WebGPUDriver/RenderDevice/WebGPUBundle/WebGPURenderBundle";
import { WebGPURenderCommandEncoder } from "laya/RenderDriver/WebGPUDriver/RenderDevice/WebGPURenderCommandEncoder";
import { WebGPURenderEngine } from "laya/RenderDriver/WebGPUDriver/RenderDevice/WebGPURenderEngine";
import { WebGPUShaderData } from "laya/RenderDriver/WebGPUDriver/RenderDevice/WebGPUShaderData";
import { WebGPUShaderInstance } from "laya/RenderDriver/WebGPUDriver/RenderDevice/WebGPUShaderInstance";


export class GCA_BatchRenderElement extends WebGPURenderElement3D {
    cullShaderData: WebGPUShaderData;
    constructor() {
        super();
        this.cullShaderData = LayaGL.renderDeviceFactory.createShaderData() as any;
        this.isRender = true;
    }


    // _preUpdatePre(context: WebGPURenderContext3D) {
    //     //编译着色器
    //     this._compileShader(context);
    //     // material ubo
    //     let subShader = this.subShader;
    //     let matSubBuffer = this.materialShaderData.createSubUniformBuffer("Material", subShader.owner.name, (subShader as any)._uniformMap);
    //     if (matSubBuffer.needUpload) {
    //         matSubBuffer.bufferBlock.needUpload();
    //     }
    // }

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

            let commands = this.owner?._commonUniformMap;
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