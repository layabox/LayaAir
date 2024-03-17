import { ShaderPass } from "../../../RenderEngine/RenderShader/ShaderPass";
import { ShaderProcessInfo } from "../../../webgl/utils/ShaderCompileDefineBase";
import { IShaderInstance } from "../../DriverDesign/RenderDevice/IShaderInstance";
import { WebGPURenderEngine } from "./WebGPURenderEngine";
import { WebGPUBindingInfoType, WebGPUCodeGenerator, WebGPUUniformPropertyBindingInfo } from "./WebGPUCodeGenerator";
import { WebGPUGlobal } from "./WebGPUStatis/WebGPUGlobal";

/**
 * WebGPU着色器实例
 */
export class WebGPUShaderInstance implements IShaderInstance {
    static idCounter: number = 0;
    _id: number = WebGPUShaderInstance.idCounter++;
    /**@internal */
    _shaderPass: ShaderPass;
    /**@internal */
    private _vsShader: GPUShaderModule;
    /**@internal */
    private _fsShader: GPUShaderModule;

    name: string;
    complete: boolean = false;

    renderPipelineDescriptor: GPURenderPipelineDescriptor;
    renderPipelineMap: Map<string, any> = new Map();

    uniformInfo: WebGPUUniformPropertyBindingInfo[];
    uniformSetMap: { [set: number]: WebGPUUniformPropertyBindingInfo[] } = {};

    globalId: number;
    objectName: string = 'WebGPUShaderInstance';

    /**
     * 创建一个 <code>WebGPUShaderInstance</code> 实例
     */
    constructor(name: string) {
        this.name = name;
        this.globalId = WebGPUGlobal.getId(this);
    }

    _create(shaderProcessInfo: ShaderProcessInfo, shaderPass: ShaderPass): void {
        const engine = WebGPURenderEngine._instance;
        const device = engine.getDevice();
        const shaderObj = WebGPUCodeGenerator.shaderLanguageProcess(
            shaderProcessInfo.defineString, shaderProcessInfo.attributeMap,
            shaderProcessInfo.uniformMap, shaderProcessInfo.vs, shaderProcessInfo.ps);

        this.uniformInfo = shaderObj.uniformInfo;
        this.uniformInfo.forEach(item => {
            if (!this.uniformSetMap[item.set])
                this.uniformSetMap[item.set] = new Array<WebGPUUniformPropertyBindingInfo>();
            this.uniformSetMap[item.set].push(item);
        });

        //生成pipeLineLayout
        const pipelineLayout = this._createPipelineLayout(device, 'pipelineLayout', shaderObj.uniformInfo);

        this._vsShader = device.createShaderModule({ code: shaderObj.vs });
        this._fsShader = device.createShaderModule({ code: shaderObj.fs });

        this._shaderPass = shaderPass;

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
        this.renderPipelineDescriptor = {
            label: 'render',
            layout: pipelineLayout,
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

        this.complete = true;
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

        return device.createPipelineLayout({ label: name, bindGroupLayouts });
    }

    _disposeResource(): void {
        WebGPUGlobal.releaseId(this);
        this.renderPipelineMap.clear();
    }
}