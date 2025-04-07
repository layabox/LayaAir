import { ShaderPass } from "../../../RenderEngine/RenderShader/ShaderPass";
import { ShaderProcessInfo } from "../../../webgl/utils/ShaderCompileDefineBase";
import { IShaderInstance } from "../../DriverDesign/RenderDevice/IShaderInstance";
import { WebGPURenderEngine } from "./WebGPURenderEngine";
import { WebGPUBindingInfoType, WebGPUUniformPropertyBindingInfo } from "./WebGPUCodeGenerator";
import { WebGPUGlobal } from "./WebGPUStatis/WebGPUGlobal";
import { NotImplementedError } from "../../../utils/Error";
import { WebGPUBindGroupHelper } from "./WebGPUBindGroupHelper";
import { WebGPURenderContext3D } from "../3DRenderPass/WebGPURenderContext3D";
import { GLSLForVulkanGenerator } from "./GLSLForVulkanGenerator";
import { WebGPURenderGeometry } from "./WebGPURenderGeometry";
import { ShaderDataType } from "../../DriverDesign/RenderDevice/ShaderData";
import { LayaGL } from "../../../layagl/LayaGL";
import { WebGPUCommandUniformMap } from "./WebGPUCommandUniformMap";
import { WebGPURenderContext2D } from "../2DRenderPass/WebGPURenderContext2D";

/**
 * WebGPU着色器实例
 */
export class WebGPUShaderInstance implements IShaderInstance {
    static idCounter: number = 0;

    private _vsShader: GPUShaderModule;

    private _fsShader: GPUShaderModule;

    private _destroyed: boolean = false;

    private _gpuPipelineLayout: GPUPipelineLayout;

    private _commanMap: string[] = [];

    /**
     * @internal
     */
    _id: number = WebGPUShaderInstance.idCounter++;

    /**
     * @internal
     */
    _shaderPass: ShaderPass;

    name: string;

    complete: boolean = false;

    uniformSetMap: Map<number, WebGPUUniformPropertyBindingInfo[]> = new Map();

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
        this._shaderPass = shaderPass;

        if (!shaderProcessInfo.is2D) {
            this._create3D();
        } else {
            this._create2D();
        }

        let attriLocArray = ((shaderPass.moduleData as any).geo as WebGPURenderGeometry).bufferState._attriLocArray;

        let filteredAttributeMap: Record<string, [number, ShaderDataType]> = {};
        for (const [key, value] of Object.entries(shaderProcessInfo.attributeMap)) {
            if (attriLocArray.has(value[0])) {
                filteredAttributeMap[key] = value;
            }
        }

        const glslObj = GLSLForVulkanGenerator.process(shaderProcessInfo.defineString, filteredAttributeMap, this.uniformSetMap, shaderPass._owner._uniformMap, shaderProcessInfo.vs, shaderProcessInfo.ps);
        {
            let vertexSpvRes = engine.shaderCompiler.glslang.glsl450_to_spirv(glslObj.vertex, "vertex");
            if (!vertexSpvRes.success) {
                console.error(vertexSpvRes.info_log);
            }
            let vertexSpirv = vertexSpvRes.spirv;

            let vertexWgsl = engine.shaderCompiler.naga.spirv_to_wgsl(new Uint8Array(vertexSpirv.buffer, vertexSpirv.byteOffset, vertexSpirv.byteLength), false);

            let fragmentSpvRes = engine.shaderCompiler.glslang.glsl450_to_spirv(glslObj.fragment, "fragment");
            if (!fragmentSpvRes.success) {
                console.error(fragmentSpvRes.info_log);
            }
            let fragmentSpv = new Uint8Array(fragmentSpvRes.spirv.buffer, fragmentSpvRes.spirv.byteOffset, fragmentSpvRes.spirv.byteLength);
            let fragmentWgsl = engine.shaderCompiler.naga.spirv_to_wgsl(fragmentSpv, false);

            this._vsShader = device.createShaderModule({ code: vertexWgsl });
            this._fsShader = device.createShaderModule({ code: fragmentWgsl });
        }

        this.complete = true;
    }

    private _generateMaterialCommandMap() {
        let shaderpass = this._shaderPass;
        let map = (LayaGL.renderDeviceFactory.createGlobalUniformMap(shaderpass.name) as WebGPUCommandUniformMap);
        if (map._idata.size == 0) {
            //组织一下
            for (const [key, value] of shaderpass._owner._uniformMap) {
                map.addShaderUniformArray(value.id, value.propertyName, value.uniformtype, value.arrayLength > 1 ? value.arrayLength : 0);
            }
            map._stateID = LayaGL.renderEngine.propertyNameToID("Material");
        }
    }


    private _create2D(): void {
        let shaderpass = this._shaderPass;
        let context = WebGPURenderContext2D._instance;
        //sprite2DGlobal
        if (context._needGlobalData())
            this.uniformSetMap.set(0, WebGPUBindGroupHelper.createBindPropertyInfoArrayByCommandMap(0, ["Sprite2DGlobal"]));
        else
            this.uniformSetMap.set(0, []);

        this._commanMap = shaderpass.nodeCommonMap.slice();

        this.uniformSetMap.set(1, WebGPUBindGroupHelper.createBindPropertyInfoArrayByCommandMap(1, this._commanMap));
        if (shaderpass._owner._uniformMap.size > 0) {
            this._generateMaterialCommandMap();
            this.uniformSetMap.set(2, WebGPUBindGroupHelper.createBindGroupInfosByUniformMap(3, "Material", shaderpass.name, shaderpass._owner._uniformMap));
        } else
            this.uniformSetMap.set(2, []);

        this.uniformSetMap.set(3, []);
    }

    private _create3D(): void {
        let shaderPass = this._shaderPass;
        //global
        let context = WebGPURenderContext3D._instance;
        let preDrawUniforms = context._preDrawUniformMaps;
        this.uniformSetMap.set(0, WebGPUBindGroupHelper.createBindPropertyInfoArrayByCommandMap(0, Array.from(preDrawUniforms)));
        //camera
        this.uniformSetMap.set(1, WebGPUBindGroupHelper.createBindPropertyInfoArrayByCommandMap(1, ["BaseCamera"]));
        //sprite+additional
        this._commanMap = this._commanMap.concat(shaderPass.moduleData.nodeCommonMap, shaderPass.moduleData.additionShaderData);
        this.uniformSetMap.set(2, WebGPUBindGroupHelper.createBindPropertyInfoArrayByCommandMap(2, this._commanMap));

        this._generateMaterialCommandMap();
        //material
        this.uniformSetMap.set(3, WebGPUBindGroupHelper.createBindGroupInfosByUniformMap(3, "Material", shaderPass.name, shaderPass._owner._uniformMap));
    }

    private _createBindGroupLayout(set: number, name: string) {
        const data: WebGPUUniformPropertyBindingInfo[] = this.uniformSetMap.get(set);
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
                bindGroupLayouts.push(group);
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