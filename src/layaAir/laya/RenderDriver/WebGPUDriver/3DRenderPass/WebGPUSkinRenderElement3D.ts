import { info } from "console";
import { SkinnedMeshRenderer } from "../../../d3/core/SkinnedMeshRenderer";
import { LayaGL } from "../../../layagl/LayaGL";
import { Stat } from "../../../utils/Stat";
import { ISkinRenderElement3D } from "../../DriverDesign/3DRenderPass/I3DRenderPass";
import { UniformProperty } from "../../DriverDesign/RenderDevice/CommandUniformMap";
import { ShaderDataType } from "../../DriverDesign/RenderDevice/ShaderData";
import { WebGPUBindGroupCache } from "../RenderDevice/WebGPUBindGroupCache";
import { WebGPURenderBundle } from "../RenderDevice/WebGPUBundle/WebGPURenderBundle";
import { WebGPUCommandUniformMap } from "../RenderDevice/WebGPUCommandUniformMap";
import { WebGPURenderCommandEncoder } from "../RenderDevice/WebGPURenderCommandEncoder";
import { WebGPURenderEngine } from "../RenderDevice/WebGPURenderEngine";
import { WebGPUShaderData } from "../RenderDevice/WebGPUShaderData";
import { WebGPUShaderInstance } from "../RenderDevice/WebGPUShaderInstance";
import { WebGPUGlobal } from "../RenderDevice/WebGPUStatis/WebGPUGlobal";
import { WebGPUSubUniformBuffer } from "../RenderDevice/WebGPUUniform/WebGPUSubUniformBuffer";
import { WebGPURenderContext3D } from "./WebGPURenderContext3D";
import { compareCahceFlag, coverCahceFlag, oneDrawCacheInfo, WebGPURenderElement3D } from "./WebGPURenderElement3D";


const dynamicOffsetsData = new Uint32Array(1);

/**
 * 带骨骼的基本渲染单元
 */
export class WebGPUSkinRenderElement3D extends WebGPURenderElement3D implements ISkinRenderElement3D {

    skinnedData: Float32Array[];

    globalId: number;

    objectName: string = 'WebGPUSkinRenderElement3D';

    skinnedBuffer: WebGPUSubUniformBuffer;

    skinnedUniformMap: Map<number, UniformProperty>;

    _skinnedDataSize: number = 0;
    _skinnedBufferOffsetAlignment: number = 0;

    constructor() {
        super();
        this.globalId = WebGPUGlobal.getId(this);
        this.skinnedUniformMap = new Map();

        this.skinnedUniformMap.set(SkinnedMeshRenderer.BONES, {
            id: SkinnedMeshRenderer.BONES,
            uniformtype: ShaderDataType.Matrix4x4,
            propertyName: "u_bones",
            arrayLength: 1,
        });

        const boneCount = 24;
        let bufferLength = boneCount * 16 * Float32Array.BYTES_PER_ELEMENT;

        const engine = WebGPURenderEngine._instance;
        const alignment = engine.getDevice().limits.minUniformBufferOffsetAlignment;

        this._skinnedBufferOffsetAlignment = Math.ceil(bufferLength / alignment) * alignment;
        this._skinnedDataSize = this._skinnedBufferOffsetAlignment / Float32Array.BYTES_PER_ELEMENT;
    }

    _preUpdatePre(context: WebGPURenderContext3D): void {
        //编译着色器
        this._compileShader(context);

        // material ubo
        let subShader = this.subShader;
        let matSubBuffer = this.materialShaderData.createSubUniformBuffer("Material", subShader._owner.name, subShader._uniformMap);
        if (matSubBuffer) {
            matSubBuffer.upload();
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
                if (uniformBuffer) {
                    uniformBuffer.upload();
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
                    // //create subUniformBuffer
                    this.skinnedBuffer = new WebGPUSubUniformBuffer("SkinSprite3D", this.skinnedUniformMap, null);
                }

                for (let i = 0; i < this.skinnedData.length; i++) {
                    let data = this.skinnedData[i];
                    this.skinnedBuffer.descriptor.uniforms.get(SkinnedMeshRenderer.BONES).view.set(data, this._skinnedDataSize * i);
                    this.skinnedBuffer.needUpload = true;
                }

                this.skinnedBuffer.upload();
            }
        }

        //additional ubo
        if (this.owner) {
            for (let [key, value] of this.owner.additionShaderData) {
                let shaderData = value as WebGPUShaderData;
                let unifomrMap = <WebGPUCommandUniformMap>LayaGL.renderDeviceFactory.createGlobalUniformMap(key);
                let uniformBuffer = shaderData.createSubUniformBuffer(key, key, unifomrMap._idata);
                if (uniformBuffer) {
                    uniformBuffer.upload();
                }
            }
        }

        //是否反转面片
        this._invertFrontFace = this._getInvertFront();

        return;
    }

    protected _bindGroup(context: WebGPURenderContext3D, info: oneDrawCacheInfo, command: WebGPURenderCommandEncoder | WebGPURenderBundle) {
        let shaderInstance = info.shaderInstance;

        {
            command.setBindGroup(0, context._sceneBindGroup);
        }
        {
            command.setBindGroup(1, context._cameraBindGroup);
        }
        {//TODO?
            let resource = shaderInstance.uniformSetMap.get(2);
            let textureExitsMask = shaderInstance.uniformTextureExits.get(2);
            let shaderData = this.owner.shaderData as WebGPUShaderData;
            shaderData._cacheSubUniformBuffer(this.skinnedBuffer, "SkinSprite3D", "SkinSprite3D", this.skinnedUniformMap);

            let bindGroup = WebGPURenderEngine._instance.bindGroupCache.getBindGroupByNode(resource, this.owner, textureExitsMask);
            // command.setBindGroup(2, bindgroup);
            this._bindGroupMap.set(2, bindGroup);
        }

        {
            if (this.materialShaderData) {
                if (info.shaderChange || compareCahceFlag(this._matBindGroupChangeFlag, this.matBindGroupCacheFlag)) {
                    this.matBindGroupCacheFlag.setValue(Stat.loopCount, WebGPURenderEngine._instance._framePassCount);
                    let shaderResource = shaderInstance.uniformSetMap.get(3);
                    let textureExitsMask = shaderInstance.uniformTextureExits.get(3);

                    this.matBindGroup = WebGPURenderEngine._instance.bindGroupCache.getBindGroup([this.subShader._owner.name], this.materialShaderData, null, shaderResource, textureExitsMask);
                    coverCahceFlag(this._matBindGroupLayoutFlag, this._pipelineChangeFlag);
                }
                command.setBindGroup(3, this.matBindGroup);
            } else {
                this.matBindGroup = WebGPUBindGroupCache.emptyBindGroup;
            }
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

        if (this._drawCacheArray && this._drawCacheArray.length == 0) return 0;

        for (let j: number = 0, m: number = this._drawCacheArray.length; j < m; j++) {
            let drawInfo = this._drawCacheArray[j];
            let shaderInstance = drawInfo.shaderInstance;
            if (!shaderInstance.complete)
                return 0;

            //set BindGroup
            this._bindGroup(context, drawInfo, command); //绑定资源组
            let pipelineCache = drawInfo.pipeLineCacheFlag;
            //1、context的pipeline变化(destRT和BindGroup资源引起的pipelineLayout变化)
            //2、自身属性变化引起的pipeline变化
            if (drawInfo.shaderChange ||
                context._pipelineChange ||
                compareCahceFlag(this._pipelineChangeFlag, pipelineCache)) {
                this._bindGroupMap.clear();
                this._bindGroupMap.set(0, context._sceneBindGroup);
                this._bindGroupMap.set(1, context._cameraBindGroup);
                this._bindGroupMap.set(2, this.nodeBindGroup);
                this._bindGroupMap.set(3, this.matBindGroup);
                drawInfo.shaderChange = false;
                drawInfo.pipeline = this._getWebGPURenderPipeline(drawInfo.shaderInstance, context.destRT, context);
                drawInfo.pipeLineCacheFlag.setValue(Stat.loopCount, WebGPURenderEngine._instance._framePassCount);
            }
            command.setPipeline(drawInfo.pipeline);
            if (!command.isBundle && this.depthStencilParam.stencilEnable) {
                (command as WebGPURenderCommandEncoder).setStencilReference(this.depthStencilParam.stencilRef);
            }

            {//TODO??
                let bindgroup = this._bindGroupMap.get(2);
                for (let i = 0; i < this.skinnedData.length; i++) {
                    dynamicOffsetsData[0] = i * this._skinnedBufferOffsetAlignment;
                    command.setBindGroupByDataOffaset(2, bindgroup, dynamicOffsetsData, 0, 1);
                    this._uploadGeometryIndex(command, i);
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