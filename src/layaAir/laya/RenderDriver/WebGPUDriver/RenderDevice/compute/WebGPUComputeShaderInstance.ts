import { NotImplementedError } from "../../../../utils/Error";
import { WebGPURenderEngine } from "../WebGPURenderEngine";
import { ComputeShaderProcessInfo, IComputeShader } from "../../../DriverDesign/RenderDevice/ComputeShader/IComputeShader";
import { WebGPUCommandUniformMap } from "../WebGPUCommandUniformMap";
import { WebGPUBindGroupHelper, WebGPUUniformPropertyBindingInfo } from "../WebGPUBindGroupHelper";



export class WebGPUComputeShaderInstance implements IComputeShader {
    static idCounter: number = 0;

    private _device;

    private _shaderModule: GPUShaderModule | null = null;

    private _pipelineCache: Map<string, GPUComputePipeline> = new Map();

    private _gpuPipelineLayout: GPUPipelineLayout;

    private _entryPoints: string[] = [];

    _id: number = WebGPUComputeShaderInstance.idCounter++;

    name: string;

    uniformSetMap: Map<number, WebGPUUniformPropertyBindingInfo[]> = new Map();
    uniformCommandMap: WebGPUCommandUniformMap[];
    compilete: boolean = false;

    constructor(name: string) {

        this._device = WebGPURenderEngine._instance.getDevice();
        this.name = name;
    }
    HasKernel(kernel: string): boolean {
        throw new Error("Method not implemented.");
    }


    /**
     * 序列化着色器
     * @returns 序列化后的着色器
     */
    _serializeShader(): ArrayBuffer {
        throw new NotImplementedError();
    }

    /**
     * 反序列化着色器
     * @param buffer 序列化后的着色器
     * @returns 是否反序列化成功
     */
    _deserialize(buffer: ArrayBuffer): boolean {
        throw new NotImplementedError();
    }

    /**
     * 编译计算着色器
     * @param info 着色器编译信息
     */
    public compile(info: ComputeShaderProcessInfo): void {
        let code = info.code;
        //经过一系列的操作和变换  比如spriv  或者glsl转换wgsl
        //分析字符串  得到uniformSetMap
        //分析字符串  得到所有的entryPoints
        //临时方案，后面换成自动方案
        let other = info.other as WebGPUCommandUniformMap[];
        for (let i = 0, n = other.length; i < n; i++) {
            this.uniformSetMap.set(i, WebGPUBindGroupHelper.createBindPropertyInfoArrayByCommandMap(i, [other[i]._stateName], true));
        }
        this.uniformCommandMap = other;

        //创建BindGroupLayouts
        this._shaderModule = this._device.createShaderModule({
            code: code
        });
        this.compilete = true;
    }

    getPipelineDescriptor(entryPoint: string): GPUComputePipelineDescriptor {
        let descriptor: GPUComputePipelineDescriptor = {
            label: this.name,
            layout: null,
            compute: {
                module: this._shaderModule!,
                entryPoint: entryPoint
            }
        };

        return descriptor;
    };
} 