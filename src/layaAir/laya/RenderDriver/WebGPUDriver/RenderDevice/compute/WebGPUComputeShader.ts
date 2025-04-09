import { error } from "console";
import { NotImplementedError } from "../../../../utils/Error";
import { WebGPUUniformPropertyBindingInfo } from "../WebGPUCodeGenerator";
import { WebGPURenderEngine } from "../WebGPURenderEngine";
import { ComputeShaderProcessInfo, IComputeShader } from "../../../DriverDesign/RenderDevice/ComputeShader/IComputeShader";



export class WebGPUComputeShader implements IComputeShader {
    static idCounter: number = 0;
    static computeShaderNameMap: Set<string>;
    private device;
    private shaderModule: GPUShaderModule | null = null;
    private pipelineCache: Map<string, GPUComputePipeline> = new Map();
    private bindGroupLayouts: GPUBindGroupLayout[] = [];
    private entryPoints: string[] = [];
    _id: number = WebGPUComputeShader.idCounter++;
    name: string;
    uniformSetMap: Map<number, WebGPUUniformPropertyBindingInfo[]> = new Map();
    compilete: boolean = false;
    constructor(name: string) {
        if (WebGPUComputeShader.computeShaderNameMap.has(name)) {
            throw error`重复的ComputeShader名字${name}`;
        } else {
            WebGPUComputeShader.computeShaderNameMap.add(name);
        }
        this.device = WebGPURenderEngine._instance.getDevice();
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
        //创建BindGroupLayouts
        this.shaderModule = this.device.createShaderModule({
            code: code
        });
        this.compilete = true;
    }

    /**
     * 获取或创建计算管线
     * @param entryPoint 入口函数名
     * @returns 计算管线
     */
    public getOrcreatePipeline(entryPoint: string): GPUComputePipeline {
        if (!this.entryPoints.includes(entryPoint)) {
            throw new Error('Entry point not found');
        }
        if (this.pipelineCache.has(entryPoint)) {
            return this.pipelineCache.get(entryPoint)!;
        }

        if (!this.shaderModule) {
            throw new Error('Shader not compiled');
        }

        const pipeline = this.device.createComputePipeline({
            layout: 'auto',
            compute: {
                module: this.shaderModule,
                entryPoint: entryPoint
            }
        });

        this.pipelineCache.set(entryPoint, pipeline);
        return pipeline;
    }

    /**
     * 获取绑定组布局
     * @returns 绑定组布局数组
     */
    public getBindGroupLayouts(): GPUBindGroupLayout[] {
        return this.bindGroupLayouts;
    }
} 