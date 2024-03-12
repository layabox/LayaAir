import { ShaderPass } from "../../../RenderEngine/RenderShader/ShaderPass";
import { ShaderProcessInfo } from "../../../webgl/utils/ShaderCompileDefineBase";
import { IShaderInstance } from "../../DriverDesign/RenderDevice/IShaderInstance";
import { WebGPURenderEngine } from "./WebGPURenderEngine";
import { WebGPUBindingInfoType, WebGPUCodeGenerator, WebGPUUniformPropertyBindingInfo } from "./WebGPUCodeGenerator";
import { UniformBuffer } from "./WebGPUMemoryManagers/WebGPUUniformBuffer";
import { TextureBuffer } from "./WebGPUMemoryManagers/WebGPUTextureManager";

/**
 * WebGPU着色器实例
 */
export class WebGPUShaderInstance implements IShaderInstance {
    static idCounter: number = 0;
    _renderPipelineMap: Map<string, any> = new Map();
    _id: number = WebGPUShaderInstance.idCounter++;
    /**@internal */
    _shaderPass: ShaderPass;
    /**@internal */
    private _vsShader: GPUShaderModule;
    /**@internal */
    private _fsShader: GPUShaderModule;

    name: string;
    complete: boolean = false;

    _renderPipelineDescriptor: GPURenderPipelineDescriptor;
    _pipelineLayout: GPUPipelineLayout;
    _bindGroupLayouts: GPUBindGroupLayout[];

    uniformBuffers: UniformBuffer[];
    uniformSetMap: { [set: number]: Array<WebGPUUniformPropertyBindingInfo> } = {};

    /**
     * 创建一个 <code>WebGPUShaderInstance</code> 实例
     */
    constructor(name: string) {
        this.name = name;
    }

    _create(shaderProcessInfo: ShaderProcessInfo, shaderPass: ShaderPass): void {
        const engine = WebGPURenderEngine._instance;
        const device = engine.getDevice();
        const shaderObj = WebGPUCodeGenerator.ShaderLanguageProcess(
            shaderProcessInfo.defineString, shaderProcessInfo.attributeMap,
            shaderProcessInfo.uniformMap, shaderProcessInfo.vs, shaderProcessInfo.ps);

        shaderObj.uniformInfo.forEach(item => {
            if (!this.uniformSetMap[item.set])
                this.uniformSetMap[item.set] = new Array<WebGPUUniformPropertyBindingInfo>();
            this.uniformSetMap[item.set].push(item);
        });

        //生成pipeLineLayout
        const { pipelineLayout, bindGroupLayouts } = this._createPipelineLayout(device, 'pipelineLayout', shaderObj.uniformInfo);
        this._pipelineLayout = pipelineLayout;
        this._bindGroupLayouts = bindGroupLayouts;

        //建立uniform资源
        this.uniformBuffers = this._createUniformBuffers(shaderObj.uniformInfo);
        console.log(this.uniformBuffers);
        // uniformBuffers.forEach(ub => ub.upload(device));
        // console.log('uniform资源 =', uniformBuffers);

        // //建立sampler资源
        // const samplerBuffers = this._createSamplerBuffers(shaderObj.uniformInfo);
        // console.log('sampler资源 =', samplerBuffers);

        // //建立texture资源
        // const textureBuffers = this._createTextureBuffers(device, shaderObj.uniformInfo);
        // console.log('texture资源 =', textureBuffers);

        // //建立资源绑定组
        // const bindGroups = this._createBindGroups(device, uniformBuffers, samplerBuffers, textureBuffers, bindGroupLayouts);
        // engine.gpuBindGroupMgr.addBindGroup(this.name, bindGroups);
        // console.log('资源绑定组 =', bindGroups);

        // console.log('gpuBufferMgr =', engine.gpuBufferMgr);
        // console.log('gpuBindGroupMgr =', engine.gpuBindGroupMgr);

        this._vsShader = device.createShaderModule({ code: shaderObj.vs });
        this._fsShader = device.createShaderModule({ code: shaderObj.fs });

        this._shaderPass = shaderPass;
        this.complete = true;

        //设置颜色目标模式
        const colorTargetState: GPUColorTargetState = {
            format: 'bgra8unorm',
            blend: {
                alpha: {
                    srcFactor: 'src-alpha',
                    dstFactor: 'one-minus-src-alpha',
                    operation: 'add',
                },
                color: {
                    srcFactor: 'src-alpha',
                    dstFactor: 'one-minus-src-alpha',
                    operation: 'add',
                },
            },
            writeMask: GPUColorWrite.ALL,
        };

        //设置渲染管线描述
        this._renderPipelineDescriptor = {
            label: 'render',
            layout: this._pipelineLayout,
            vertex: {
                buffers: [],
                module: this._vsShader,
                entryPoint: 'main',
            },
            fragment: {
                module: this._fsShader,
                entryPoint: 'main',
                targets: [colorTargetState],
            },
            primitive: {
                topology: 'triangle-list',
                frontFace: 'ccw',
                cullMode: 'back',
            },
            depthStencil: {
                format: 'depth24plus-stencil8',
                depthWriteEnabled: true,
                depthCompare: 'less',
            },
            multisample: {
                count: 1,
            },
        };
    }

    /**
     * 基于名字获取UniformBufer
     * @param name 
     */
    getUniformBuffer(name: string) {
        if (this.uniformBuffers)
            for (let i = this.uniformBuffers.length - 1; i > -1; i--)
                if (this.uniformBuffers[i].name == name)
                    return this.uniformBuffers[i];
        return null;
    }

    /**
     * 基于WebGPUUniformPropertyBindingInfo创建PipelineLayout
     * @param device 
     * @param name 
     * @param info 
     */
    private _createPipelineLayout(device: GPUDevice, name: string, info: WebGPUUniformPropertyBindingInfo[]) {
        const _createBindGroupLayout = (set: number, name: string, info: WebGPUUniformPropertyBindingInfo[]) => {
            const data: WebGPUUniformPropertyBindingInfo[] = [];
            for (let i = 0; i < info.length; i++) {
                const item = info[i];
                if (item.set == set)
                    data.push(item);
            }
            if (data.length == 0) return null;
            const desc: GPUBindGroupLayoutDescriptor = {
                label: name,
                entries: [],
            };
            for (let i = 0; i < data.length; i++) {
                if (data[i].type == WebGPUBindingInfoType.buffer) {
                    const entry: GPUBindGroupLayoutEntry = {
                        binding: data[i].binding,
                        visibility: data[i].visibility,
                        buffer: data[i].buffer,
                    };
                    (desc.entries as GPUBindGroupLayoutEntry[]).push(entry);
                } else if (data[i].type == WebGPUBindingInfoType.sampler) {
                    const entry: GPUBindGroupLayoutEntry = {
                        binding: data[i].binding,
                        visibility: data[i].visibility,
                        sampler: data[i].sampler,
                    };
                    (desc.entries as GPUBindGroupLayoutEntry[]).push(entry);
                } else if (data[i].type == WebGPUBindingInfoType.texture) {
                    const entry: GPUBindGroupLayoutEntry = {
                        binding: data[i].binding,
                        visibility: data[i].visibility,
                        texture: data[i].texture,
                    };
                    (desc.entries as GPUBindGroupLayoutEntry[]).push(entry);
                }
            }
            return device.createBindGroupLayout(desc);
        }

        const bindGroupLayouts: GPUBindGroupLayout[] = [];
        for (let i = 0; i < 4; i++) {
            const group = _createBindGroupLayout(i, `group${i}`, info);
            if (group) bindGroupLayouts.push(group);
        }

        return { pipelineLayout: device.createPipelineLayout({ label: name, bindGroupLayouts }), bindGroupLayouts };
    }

    /**
     * 基于WebGPUUniformPropertyBindingInfo创建UniformBuffers
     * @param infos
     */
    private _createUniformBuffers(infos: WebGPUUniformPropertyBindingInfo[]) {
        const _createUniformBuffer = (info: WebGPUUniformPropertyBindingInfo) => {
            if (info.uniform) {
                const gpuBuffer = WebGPURenderEngine._instance.gpuBufferMgr;
                const uniformBuffer = new UniformBuffer(info.name, info.set, info.binding, info.uniform.size, gpuBuffer);
                info.sn = uniformBuffer.block.sn;
                for (let i = 0, len = info.uniform.items.length; i < len; i++) {
                    const uniform = info.uniform.items[i];
                    uniformBuffer.addUniform(uniform.id, uniform.type, uniform.offset, uniform.align, uniform.size, uniform.elements, uniform.count);
                }
                return uniformBuffer;
            }
            return null;
        };

        const uniformBuffers: UniformBuffer[] = [];
        for (let i = 0; i < infos.length; i++) {
            const uniformBuffer = _createUniformBuffer(infos[i]);
            if (uniformBuffer) uniformBuffers.push(uniformBuffer);
        }
        return uniformBuffers;
    }

    // /**
    //  * 基于WebGPUUniformPropertyBindingInfo创建SamplerBuffers
    //  * @param infos
    //  */
    // private _createSamplerBuffers(infos: WebGPUUniformPropertyBindingInfo[]) {
    //     const _createSamplerBuffer = (info: WebGPUUniformPropertyBindingInfo) => {
    //         if (info.sampler)
    //             return new SamplerBuffer(info.name, info.set, info.binding, this.gpuSampler);
    //         return null;
    //     };

    //     const samplerBuffers: SamplerBuffer[] = [];
    //     for (let i = 0; i < infos.length; i++) {
    //         const samplerBuffer = _createSamplerBuffer(infos[i]);
    //         if (samplerBuffer) samplerBuffers.push(samplerBuffer);
    //     }
    //     return samplerBuffers;
    // }

    /**
     * 基于WebGPUUniformPropertyBindingInfo创建TextureBuffers
     * @param device 
     * @param infos
     */
    private _createTextureBuffers(device: GPUDevice, infos: WebGPUUniformPropertyBindingInfo[]) {
        const _createTextureBuffer = (info: WebGPUUniformPropertyBindingInfo) => {
            if (info.texture) {
                const texture = device.createTexture({
                    size: {
                        width: 1024,
                        height: 1024,
                        depthOrArrayLayers: 1,
                    },
                    format: 'rgba8unorm',
                    mipLevelCount: 1,
                    sampleCount: 1,
                    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
                });
                return new TextureBuffer(info.name, info.set, info.binding, texture);
            }
            return null;
        };

        const textureBuffers: TextureBuffer[] = [];
        for (let i = 0; i < infos.length; i++) {
            const textureBuffer = _createTextureBuffer(infos[i]);
            if (textureBuffer) textureBuffers.push(textureBuffer);
        }
        return textureBuffers;
    }

    // /**
    //  * 基于UniformBuffers创建BindGroups
    //  * @param device 
    //  * @param uniformBuffers 
    //  * @param samplerBuffers 
    //  * @param textureBuffers 
    //  * @param bindGroupLayouts 
    //  */
    // private _createBindGroups(device: GPUDevice, uniformBuffers: UniformBuffer[],
    //     samplerBuffers: SamplerBuffer[], textureBuffers: TextureBuffer[], bindGroupLayouts: GPUBindGroupLayout[]) {
    //     const _createBindGroup = (uniformBuffers: UniformBuffer[], bindGroupLayout: GPUBindGroupLayout, set: number) => {
    //         const bindGroupDesc: GPUBindGroupDescriptor = {
    //             label: `group${set}`,
    //             layout: bindGroupLayout,
    //             entries: [],
    //         };

    //         for (let i = 0; i < uniformBuffers.length; i++)
    //             if (uniformBuffers[i].set == set)
    //                 (bindGroupDesc.entries as GPUBindGroupEntry[]).push(uniformBuffers[i].getGPUBindEntry());

    //         for (let i = 0; i < samplerBuffers.length; i++)
    //             if (samplerBuffers[i].set == set)
    //                 (bindGroupDesc.entries as GPUBindGroupEntry[]).push(samplerBuffers[i].getGPUBindEntry());

    //         for (let i = 0; i < textureBuffers.length; i++)
    //             if (textureBuffers[i].set == set)
    //                 (bindGroupDesc.entries as GPUBindGroupEntry[]).push(textureBuffers[i].getGPUBindEntry());

    //         return device.createBindGroup(bindGroupDesc);
    //     };

    //     const bindGroups: GPUBindGroup[] = [];
    //     for (let i = 0; i < bindGroupLayouts.length; i++)
    //         bindGroups.push(_createBindGroup(uniformBuffers, bindGroupLayouts[i], i));
    //     return bindGroups;
    // }

    _disposeResource(): void {
        this._renderPipelineMap.clear();
    }
}