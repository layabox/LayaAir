import { ShaderPass } from "../../../RenderEngine/RenderShader/ShaderPass";
import { ShaderProcessInfo } from "../../../webgl/utils/ShaderCompileDefineBase";
import { IShaderInstance } from "../../DriverDesign/RenderDevice/IShaderInstance";
import { WebGPURenderEngine } from "./WebGPURenderEngine";
import { WebGPUBindingInfoType, WebGPUCodeGenerator, WebGPUUniformPropertyBindingInfo } from "./WebGPUCodeGenerator";
import { WebGPUGlobal } from "./WebGPUStatis/WebGPUGlobal";
import { NotImplementedError } from "../../../utils/Error";
import { WebGPUBindGroupHelper } from "./WebGPUBindGroupHelper";
import { WebGPURenderContext3D } from "../3DRenderPass/WebGPURenderContext3D";

/**
 * WebGPU着色器实例
 */
export class WebGPUShaderInstance implements IShaderInstance {
    static idCounter: number = 0;

    /**
     * @internal
     */
    _id: number = WebGPUShaderInstance.idCounter++;
    /**
     * @internal
     */
    _shaderPass: ShaderPass;

    private _vsShader: GPUShaderModule;
    private _fsShader: GPUShaderModule;

    private _destroyed: boolean = false;

    private _gpuPipelineLayout: GPUPipelineLayout;

    name: string;
    complete: boolean = false;

    uniformInfo: WebGPUUniformPropertyBindingInfo[];//TODO
    uniformSetMap: { [set: number]: WebGPUUniformPropertyBindingInfo[] } = {};

    constructor(name: string) {
        this.name = name;
    }

    _serializeShader(): ArrayBuffer {
        throw new NotImplementedError();
    }

    _deserialize(buffer: ArrayBuffer): boolean {
        throw new NotImplementedError();
    }

    /**
     * 获取渲染管线描述
     */
    getRenderPipelineDescriptor() {
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
        const renderPipelineDescriptor: GPURenderPipelineDescriptor = {
            label: 'render',
            layout: 'auto',
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

        return renderPipelineDescriptor;
    }

    /**
     * 创建ShaderInstance
     * @param shaderProcessInfo 
     * @param shaderPass 
     */
    _create(shaderProcessInfo: ShaderProcessInfo, shaderPass: ShaderPass): void {
        const engine = WebGPURenderEngine._instance;
        const device = engine.getDevice();
        if (!shaderProcessInfo.is2D) {
            //global
            let context = WebGPURenderContext3D._instance;
            let preDrawUniforms = context._preDrawUniformMaps;
            this.uniformSetMap[0] = WebGPUBindGroupHelper.createBindPropertyInfoArrayByCommandMap(0, Array.from(preDrawUniforms));
            //camera
            this.uniformSetMap[1] = WebGPUBindGroupHelper.createBindPropertyInfoArrayByCommandMap(1, ["BaseCamera"]);
            //sprite+additional
            let strArray = [];
            for (var com in shaderPass._nodeUniformCommonMap) {
                strArray.push(com);
            }
            for (var addition in shaderPass.additionShaderData) {
                strArray.push(addition);
            }
            this.uniformSetMap[2] = WebGPUBindGroupHelper.createBindPropertyInfoArrayByCommandMap(2, strArray);
            //material
            this.uniformSetMap[3] = WebGPUBindGroupHelper.createBindPropertyInfoArrayByCommandMap(3, [shaderPass.name]);
        }

        const shaderObj = WebGPUCodeGenerator.shaderLanguageProcess(
            shaderProcessInfo.defineString, shaderProcessInfo.attributeMap, //@ts-ignore
            shaderPass.uniformMap, shaderPass.arrayMap, shaderPass.nodeCommonMap, shaderProcessInfo.vs, shaderProcessInfo.ps,
            shaderProcessInfo.is2D);

        this.uniformInfo = shaderObj.uniformInfo;
        // this.uniformInfo.forEach(item => {
        //     if (!this.uniformSetMap[item.set])
        //         this.uniformSetMap[item.set] = new Array<WebGPUUniformPropertyBindingInfo>();
        //     this.uniformSetMap[item.set].push(item);
        // });



        this._shaderPass = shaderPass;
        this._vsShader = device.createShaderModule({ code: shaderObj.vs });
        this._fsShader = device.createShaderModule({ code: shaderObj.fs });

        this.complete = true;
    }

    private _createBindGroupLayout(set: number, name: string) {
        const data: WebGPUUniformPropertyBindingInfo[] = [];
        const info = this.uniformInfo;
        for (let i = 0; i < info.length; i++) {
            const item = info[i];
            if (item.set === set)
                data.push(item);
        }
        if (data.length === 0) return null;
        let entries: GPUBindGroupLayoutEntry[] = [];
        const desc: GPUBindGroupLayoutDescriptor = {
            label: name,
            entries: entries,
        };
        for (let i = 0; i < data.length; i++) {
            switch (data[i].type) {
                case WebGPUBindingInfoType.buffer:
                    (desc.entries as any).push({
                        binding: data[i].binding,
                        visibility: data[i].visibility,
                        buffer: data[i].buffer,
                    });
                    break;
                case WebGPUBindingInfoType.sampler:
                    (desc.entries as any).push({
                        binding: data[i].binding,
                        visibility: data[i].visibility,
                        sampler: data[i].sampler,
                    });
                    break;
                case WebGPUBindingInfoType.texture:
                    (desc.entries as any).push({
                        binding: data[i].binding,
                        visibility: data[i].visibility,
                        texture: data[i].texture,
                    });
                    break;
            }
        }
        return WebGPURenderEngine._instance.getDevice().createBindGroupLayout(desc);
    }

    /**
     * 基于WebGPUUniformPropertyBindingInfo创建PipelineLayout
     * @param device 
     * @param name 
     * @param entries 
     */
    createPipelineLayout(device: GPUDevice) {
        if (!this._gpuPipelineLayout) {
            const bindGroupLayouts: GPUBindGroupLayout[] = [];
            for (let i = 0; i < 4; i++) {
                const group = this._createBindGroupLayout(i, `group${i}`);
                if (group) bindGroupLayouts.push(group);
            }
            this._gpuPipelineLayout = device.createPipelineLayout({ label: "pipelineLayout", bindGroupLayouts });
        }
        return this._gpuPipelineLayout;
    }

    /**
     * 销毁
     */
    _disposeResource(): void {
        if (!this._destroyed) {
            WebGPUGlobal.releaseId(this);
            this._destroyed = true;
        }
    }
}