import { ComputeShaderProcessInfo, IComputeShader } from "../../../DriverDesign/RenderDevice/ComputeShader/IComputeShader";
import { IDefineDatas } from "../../../RenderModuleData/Design/IDefineDatas";
import { GLESCommandUniformMap } from "../GLESCommandUniformMap";

/**
 * OpenGL ES计算着色器实现
 * 管理计算着色器的编译、内核函数和uniform映射
 */
export class GLESComputeShader implements IComputeShader {
    /** ID计数器 */
    static idCounter: number = 0;

    /** 着色器唯一ID */
    private _id: number = GLESComputeShader.idCounter++;

    /** 原生着色器对象 */
    private _nativeObj: any;

    /** 着色器名称 */
    name: string;

    /** 是否编译完成 */
    compilete: boolean = false;

    /** 内核函数集合 */
    private _kernels: Set<string> = new Set();

    /** uniform命令映射 */
    uniformCommandMap: GLESCommandUniformMap[] = [];

    /** uniform绑定信息映射 */
    uniformBindingMap: Map<number, any> = new Map();

    constructor(name: string) {
        this.name = name;
        // 创建原生OpenGL ES计算着色器对象
        this._nativeObj = new (window as any).conchGLESComputeShader(this.name);
    }

    /**
     * 检查是否包含指定的内核函数
     * @param kernel 内核函数名称
     * @returns 是否包含该内核
     */
    HasKernel(kernel: string): boolean {
        return this._kernels.has(kernel);
    }

    /**
     * 添加内核函数
     * @param kernel 内核函数名称
     */
    addKernel(kernel: string): void {
        this._kernels.add(kernel);
    }

    /**
     * 移除内核函数
     * @param kernel 内核函数名称
     */
    removeKernel(kernel: string): void {
        this._kernels.delete(kernel);
    }

    /**
     * 获取所有内核函数
     * @returns 内核函数数组
     */
    getKernels(): string[] {
        return Array.from(this._kernels);
    }

    /**
     * 编译计算着色器
     * @param info 着色器编译信息
     */
    compile(info: ComputeShaderProcessInfo): void {
        try {
            // 获取着色器代码和其他信息
            const code = info.code;
            const defineData = info.defineData;
            const other = info.other;

            // 处理uniform映射信息
            if (other && Array.isArray(other)) {
                this.uniformCommandMap = other as GLESCommandUniformMap[];
                
                // 创建uniform绑定映射
                for (let i = 0, n = this.uniformCommandMap.length; i < n; i++) {
                    const commandMap = this.uniformCommandMap[i];
                    this.uniformBindingMap.set(i, {
                        stateName: commandMap.constructor.name,
                        hasUniformBuffer: true,
                        bindingPoint: i
                    });
                }
            }

            // 调用原生方法编译着色器
            const success = this._nativeObj.compile(code, defineData);
            
            if (success) {
                // 编译成功，从着色器中提取内核函数信息
                this._extractKernelsFromShader(code);
                this.compilete = true;
            } else {
                throw new Error(`Failed to compile compute shader: ${this.name}`);
            }

        } catch (error) {
            console.error(`GLESComputeShader compile error:`, error);
            this.compilete = false;
            throw error;
        }
    }

    /**
     * 从着色器代码中提取内核函数
     * @param code 着色器代码
     */
    private _extractKernelsFromShader(code: string): void {
        // 这里需要解析GLSL计算着色器代码，提取入口点
        // 简化实现：假设使用标准的main函数作为入口点
        // 在实际实现中，可能需要更复杂的解析逻辑
        
        // 查找compute shader的入口点
        const kernelRegex = /^\s*void\s+(\w+)\s*\(/gm;
        let match;
        
        while ((match = kernelRegex.exec(code)) !== null) {
            const kernelName = match[1];
            // 通常main函数是默认的入口点
            if (kernelName === 'main' || kernelName.startsWith('cs_') || kernelName.startsWith('compute_')) {
                this.addKernel(kernelName);
            }
        }
        
        // 如果没有找到任何内核，添加默认的main
        if (this._kernels.size === 0) {
            this.addKernel('main');
        }
    }

    /**
     * 获取计算着色器程序对象
     * @param kernel 内核函数名称
     * @returns 着色器程序对象
     */
    getProgram(kernel: string): any {
        if (!this.HasKernel(kernel)) {
            throw new Error(`Kernel '${kernel}' not found in compute shader '${this.name}'`);
        }
        
        return this._nativeObj.getProgram(kernel);
    }

    /**
     * 绑定计算着色器到OpenGL上下文
     * @param kernel 使用的内核函数名称
     */
    bind(kernel: string = 'main'): void {
        if (!this.compilete) {
            throw new Error(`Compute shader '${this.name}' is not compiled`);
        }
        
        if (!this.HasKernel(kernel)) {
            throw new Error(`Kernel '${kernel}' not found in compute shader '${this.name}'`);
        }
        
        this._nativeObj.bind(kernel);
    }

    /**
     * 解绑计算着色器
     */
    unbind(): void {
        this._nativeObj.unbind();
    }

    /**
     * 设置uniform值
     * @param location uniform位置
     * @param value 值
     */
    setUniform(location: number, value: any): void {
        this._nativeObj.setUniform(location, value);
    }

    /**
     * 获取uniform位置
     * @param name uniform名称
     * @returns uniform位置
     */
    getUniformLocation(name: string): number {
        return this._nativeObj.getUniformLocation(name);
    }

    /**
     * 获取着色器ID
     */
    get id(): number {
        return this._id;
    }

    /**
     * 获取原生着色器对象
     */
    get nativeObj(): any {
        return this._nativeObj;
    }

    /**
     * 销毁计算着色器
     */
    destroy(): void {
        if (this._nativeObj) {
            this._nativeObj.release();
            this._nativeObj = null;
        }
        
        this._kernels.clear();
        this.uniformCommandMap = [];
        this.uniformBindingMap.clear();
        this.compilete = false;
    }
} 