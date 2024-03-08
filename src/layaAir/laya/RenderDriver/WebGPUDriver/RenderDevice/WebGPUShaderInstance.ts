import { ShaderPass } from "../../../RenderEngine/RenderShader/ShaderPass";
import { ShaderCompileDefineBase, ShaderProcessInfo } from "../../../webgl/utils/ShaderCompileDefineBase";
import { IShaderInstance } from "../../DriverDesign/RenderDevice/IShaderInstance";
import { WebGPURenderEngine } from "./WebGPURenderEngine";
import { WebGPUBindingInfoType, WebGPUCodeGenerator, WebGPUUniformPropertyBindingInfo } from "./WebGPUCodeGenerator";

/**
 * WebGPU着色器实例
 */
export class WebGPUShaderInstance implements IShaderInstance {
    static idCounter: number = 0;
    _renderPipelineMap = {}; //destroy 要删除
    _id: number = WebGPUShaderInstance.idCounter++;
    /**@internal */
    _shaderPass: ShaderCompileDefineBase | ShaderPass;
    /**@internal VertexState*/
    private _vsShader: GPUShaderModule;
    /**@internal fragmentModule*/
    private _fsShader: GPUShaderModule;

    _renderPipelineDescriptor: GPURenderPipelineDescriptor;
    _pipeLineLayout: GPUPipelineLayout;
    _vertexState: GPUVertexState;
    _fragment: GPUFragmentState;

    uniformSetMap: { [key: number]: Array<WebGPUUniformPropertyBindingInfo> } = {};

    /**
     * 创建一个 <code>WebGPUShaderInstance</code> 实例
     */
    constructor() {
    }

    _create(shaderProcessInfo: ShaderProcessInfo, shaderPass: ShaderPass): void {
        const shaderObj = WebGPUCodeGenerator.ShaderLanguageProcess(
            shaderProcessInfo.defineString, shaderProcessInfo.attributeMap,
            shaderProcessInfo.uniformMap, shaderProcessInfo.vs, shaderProcessInfo.ps);
        const device = WebGPURenderEngine._instance.getDevice();

        shaderObj.uniformInfo.forEach((item) => {
            if (!this.uniformSetMap[item.set])
                this.uniformSetMap[item.set] = new Array<WebGPUUniformPropertyBindingInfo>();
            this.uniformSetMap[item.set].push(item);
        });

        //生成GPUPipeLineLayout
        this._pipeLineLayout = this._createPipelineLayout(device, 'pipeLineLayout', shaderObj.uniformInfo);

        this._vsShader = device.createShaderModule({ code: shaderObj.vs });
        this._fsShader = device.createShaderModule({ code: shaderObj.fs });

        // //设置颜色目标模式
        // const colorTargetState: GPUColorTargetState = {
        //     format: Config.colorFormat,
        //     blend: {
        //         alpha: {
        //             srcFactor: 'src-alpha',
        //             dstFactor: 'one-minus-src-alpha',
        //             operation: 'add',
        //         },
        //         color: {
        //             srcFactor: 'src-alpha',
        //             dstFactor: 'one-minus-src-alpha',
        //             operation: 'add',
        //         },
        //     },
        //     writeMask: GPUColorWrite.ALL,
        // };

        // //设置渲染管线描述
        // const renderPipelineDesc: GPURenderPipelineDescriptor = {
        //     label: 'render',
        //     layout: this.pipelineLayout,
        //     vertex: {
        //         buffers: [vertexBufferLayout],
        //         module: this._vsShader,
        //         entryPoint: 'main',
        //     },
        //     fragment: {
        //         module: this._fsShader,
        //         entryPoint: 'main',
        //         targets: [colorTargetState],
        //     },
        //     primitive: {
        //         topology: 'triangle-list',
        //         frontFace: 'ccw',
        //         cullMode: 'back',
        //     },
        //     depthStencil: {
        //         format: Config.depthFormat,
        //         depthWriteEnabled: true,
        //         depthCompare: 'less',
        //     },
        //     multisample: {
        //         count: 1,
        //     },
        // };

        // const renderPipeline = device.createRenderPipeline(renderPipelineDesc);
        // console.log(renderPipeline);
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

    private _createVertexState() {
        this._vertexState = {
            // buffers?: Iterable<GPUVertexBufferLayout | null>;
            module: this._vsShader,
            entryPoint: "main",
            constants: null
        }
    }
    private _createFragment() {
        this._fragment = {
            module: this._fsShader,
            entryPoint: "main",
            targets: []
        }
    }
    _disposeResource(): void {
        throw new Error("Method not implemented.");
    }
}

// /**
//  * WebGPU着色器实例
//  */
// export class WebGPUShaderInstance implements IShaderInstance {
//     /**@internal */
//     _shaderPass: ShaderCompileDefineBase | ShaderPass;
//     /**@internal VertexState*/
//     private _vsShader: GPUShaderModule;
//     /**@internal fragmentModule*/
//     private _fsShader: GPUShaderModule;

//     _layout: GPUPipelineLayout;
//     _layoutDescriptor: GPUPipelineLayoutDescriptor;

//     _renderPipelineDescriptor: GPURenderPipelineDescriptor;
//     _vertexState: GPUVertexState;
//     _fragment: GPUFragmentState;
//     _pipeLineLayout: GPUPipelineLayout;
//     /**
//      * 创建一个 <code>ShaderInstance</code> 实例。
//      */
//     constructor() {

//     }

//     _create(shaderProcessInfo: ShaderProcessInfo, shaderPass: ShaderPass): void {
//         const shaderObj = WGSLCodeGenerator.ShaderLanguageProcess(
//             shaderProcessInfo.defineString, shaderProcessInfo.attributeMap,
//             shaderProcessInfo.uniformMap, shaderProcessInfo.vs, shaderProcessInfo.ps);
//         const device = WebGPURenderEngine._instance.getDevice();

//         //生成GPUPipeLineLayout

//         //
//         this._createVertexState();
//         this._createFragment();
//         this._renderPipelineDescriptor = {
//             vertex: this._vertexState,
//             fragment: this._fragment,
//             layout: this._pipeLineLayout
//         };
//     }

//     /**
//      * 基于WebGPUUniformPropertyBindingInfo创建PipelineLayout
//      * @param device
//      * @param name
//      * @param info
//      */
//     private _createPipelineLayout(device: GPUDevice, name: string, info: WebGPUUniformPropertyBindingInfo[]) {
//         const _createBindGroupLayout = (set: number, name: string, info: WebGPUUniformPropertyBindingInfo[]) => {
//             const data: WebGPUUniformPropertyBindingInfo[] = [];
//             for (let i = 0; i < info.length; i++) {
//                 const item = info[i];
//                 if (item.set == set)
//                     data.push(item);
//             }
//             if (data.length == 0) return null;
//             const desc: GPUBindGroupLayoutDescriptor = {
//                 label: name,
//                 entries: [],
//             };
//             for (let i = 0; i < data.length; i++) {
//                 if (data[i].type == WebGPUBindingInfoType.buffer) {
//                     const entry: GPUBindGroupLayoutEntry = {
//                         binding: data[i].binding,
//                         visibility: data[i].visibility,
//                         buffer: data[i].buffer,
//                     };
//                     (desc.entries as GPUBindGroupLayoutEntry[]).push(entry);
//                 } else if (data[i].type == WebGPUBindingInfoType.sampler) {
//                     const entry: GPUBindGroupLayoutEntry = {
//                         binding: data[i].binding,
//                         visibility: data[i].visibility,
//                         sampler: data[i].sampler,
//                     };
//                     (desc.entries as GPUBindGroupLayoutEntry[]).push(entry);
//                 } else if (data[i].type == WebGPUBindingInfoType.texture) {
//                     const entry: GPUBindGroupLayoutEntry = {
//                         binding: data[i].binding,
//                         visibility: data[i].visibility,
//                         texture: data[i].texture,
//                     };
//                     (desc.entries as GPUBindGroupLayoutEntry[]).push(entry);
//                 }
//             }
//             return device.createBindGroupLayout(desc);
//         }

//         const bindGroupLayouts: GPUBindGroupLayout[] = [];
//         for (let i = 0; i < 4; i++) {
//             const group = _createBindGroupLayout(i, `group${i}`, info);
//             if (group) bindGroupLayouts.push(group);
//         }

//         return device.createPipelineLayout({ label: name, bindGroupLayouts });
//     }

//     private _createVertexState() {
//         this._vertexState = {
//             // buffers?: Iterable<GPUVertexBufferLayout | null>;
//             module: this._vsshader,
//             entryPoint: "main",
//             constants: null
//         }
//     }
//     private _createFragment() {
//         this._fragment = {
//             module: this._psshader,
//             entryPoint: "main",
//             targets: []
//         }
//     }
//     _disposeResource(): void {
//         throw new Error("Method not implemented.");
//     }
// }