import { SkinnedMeshRenderer } from "../../../d3/core/SkinnedMeshRenderer";
import { Laya3DRender } from "../../../d3/RenderObjs/Laya3DRender";
import { LayaGL } from "../../../layagl/LayaGL";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { ISkinRenderElement3D } from "../../DriverDesign/3DRenderPass/I3DRenderPass";
import { UniformProperty } from "../../DriverDesign/RenderDevice/CommandUniformMap";
import { ShaderDataType } from "../../DriverDesign/RenderDevice/ShaderData";
import { WebGPURenderBundle } from "../RenderDevice/WebGPUBundle/WebGPURenderBundle";
import { WebGPUCommandUniformMap } from "../RenderDevice/WebGPUCommandUniformMap";
import { WebGPURenderCommandEncoder } from "../RenderDevice/WebGPURenderCommandEncoder";
import { WebGPUShaderData } from "../RenderDevice/WebGPUShaderData";
import { WebGPUShaderInstance } from "../RenderDevice/WebGPUShaderInstance";
import { WebGPUGlobal } from "../RenderDevice/WebGPUStatis/WebGPUGlobal";
import { WebGPUSubUniformBuffer } from "../RenderDevice/WebGPUUniform/WebGPUSubUniformBuffer";
import { WebGPUUniformBuffer } from "../RenderDevice/WebGPUUniform/WebGPUUniformBuffer";
import { WebGPU3DRenderPassFactory } from "./WebGPU3DRenderPassFactory";
import { WebGPURenderContext3D } from "./WebGPURenderContext3D";
import { WebGPURenderElement3D } from "./WebGPURenderElement3D";


/**
 * 带骨骼的基本渲染单元
 */
export class WebGPUSkinRenderElement3D extends WebGPURenderElement3D implements ISkinRenderElement3D {

    skinnedData: Float32Array[];

    globalId: number;

    objectName: string = 'WebGPUSkinRenderElement3D';

    skinnedBuffer: WebGPUSubUniformBuffer;

    skinnedUniformMap: Map<number, UniformProperty>;

    constructor() {
        super();
        this.globalId = WebGPUGlobal.getId(this);
        this.skinnedUniformMap = new Map();

        this.skinnedUniformMap.set(SkinnedMeshRenderer.BONES, {
            id: SkinnedMeshRenderer.BONES,
            uniformtype: ShaderDataType.Matrix4x4,
            propertyName: "u_bones",
            arrayLength: 0,
        });
    }

    _preUpdatePre(context: WebGPURenderContext3D): void {
        //编译着色器
        this._compileShader(context);

        // material ubo
        let subShader = this.subShader;
        let matSubBuffer = this.materialShaderData.createSubUniformBuffer("Material", subShader._owner.name, subShader._uniformMap);
        if (matSubBuffer.needUpload) {
            matSubBuffer.bufferBlock.needUpload();
        }

        //sprite ubo
        if (this.renderShaderData && this.owner._commonUniformMap.length > 0) {
            let nodemap = this.owner._commonUniformMap;
            for (var i = 0, n = nodemap.length; i < n; i++) {
                let moduleName = nodemap[i];

                if (moduleName == "SkinSprite3D") {
                    continue;
                }

                let unifomrMap = <WebGPUCommandUniformMap>LayaGL.renderDeviceFactory.createGlobalUniformMap(nodemap[i]);

                let uniformBuffer = this.renderShaderData.createSubUniformBuffer(moduleName, moduleName, unifomrMap._idata);
                if (uniformBuffer && uniformBuffer.needUpload) {
                    uniformBuffer.bufferBlock.needUpload();
                }
            }

            // skin data
            if (this.skinnedData) {
                let uniform = this.skinnedUniformMap.get(SkinnedMeshRenderer.BONES);
                // todo number 24 
                let arrayLength = 24 * (this.skinnedData.length);

                // create buffer
                if (arrayLength != uniform.arrayLength) {
                    uniform.arrayLength = arrayLength;
                    this.skinnedBuffer?.destroy();
                }

                // this.renderShaderData.setBuffer(SkinnedMeshRenderer.BONES, this.skinnedData[0]);

                this.skinnedBuffer = this.renderShaderData.createSubUniformBuffer("SkinSprite3D", "SkinSprite3D", this.skinnedUniformMap);

                let dataOffset = 0;
                for (let i = 0; i < this.skinnedData.length; i++) {
                    let data = this.skinnedData[i];
                    this.skinnedBuffer.descriptor.uniforms.get(SkinnedMeshRenderer.BONES).view.set(data, dataOffset);
                    dataOffset += data.length;
                }

                this.skinnedBuffer.bufferBlock.needUpload();

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

    protected _bindGroup(context: WebGPURenderContext3D, shaderInstance: WebGPUShaderInstance, command: WebGPURenderCommandEncoder | WebGPURenderBundle) {
        if (shaderInstance.uniformSetMap.get(0).length > 0) {
            command.setBindGroup(0, context._sceneBindGroup);
        }
        if (shaderInstance.uniformSetMap.get(1).length > 0) {
            command.setBindGroup(1, context._cameraBindGroup);
        }
        // if (shaderInstance.uniformSetMap.get(2).length > 0) {//additional & Sprite3D NodeModule
        //     let bindgroup = (Laya3DRender.Render3DPassFactory as WebGPU3DRenderPassFactory).getBaseRender3DNodeBindGroup(this.owner, context, shaderInstance);
        //     command.setBindGroup(2, bindgroup.gpuRS);
        // }
        if (shaderInstance.uniformSetMap.get(3).length > 0) {
            command.setBindGroup(3, this.materialShaderData._createOrGetBindGroupByBindInfoArray("Material", this.subShader._owner.name, shaderInstance, 3, shaderInstance.uniformSetMap.get(3)));
        }
    }

    /**
     * 渲染
     * @param context 
     * @param command 
     * @param bundle 
     */
    _render(context: WebGPURenderContext3D, command: WebGPURenderCommandEncoder | WebGPURenderBundle) {
        if (!this.isRender) {
            return 0;
        }

        let shaders = this._shaderInstances.elements;

        for (let j: number = 0, m: number = this._shaderInstances.length; j < m; j++) {
            let shaderInstance = shaders[j];

            if (!shaderInstance.complete) {
                continue;
            }
            command.setPipeline(this._getWebGPURenderPipeline(shaderInstance, context.destRT, context));
            this._bindGroup(context, shaderInstance, command);
            {
                let bindgroup = (Laya3DRender.Render3DPassFactory as WebGPU3DRenderPassFactory).getBaseRender3DNodeBindGroup(this.owner, context, shaderInstance);


                let skinDataOffset = [0];
                for (let i = 0; i < this.skinnedData.length; i++) {
                    command.setBindGroup(2, bindgroup, skinDataOffset);

                    this._uploadGeometry(command);

                    skinDataOffset[0] += this.skinnedData[i].length;
                }
            }

        }


        return 0;
    }

    destroy(): void {
        super.destroy();
        this.skinnedData = null;
    }
}